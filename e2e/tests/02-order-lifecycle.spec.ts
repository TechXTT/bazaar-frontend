import { test, expect, BrowserContext, Page } from "@playwright/test";
import {
  installWallet,
  login,
  increaseTime,
  readOrder,
  escrowAs,
  orderIdToBytes32,
  provider,
  ACCOUNTS,
} from "../fixtures/wallet";

/**
 * Happy-path order lifecycle:
 *   seller lists a store + product
 *   → buyer buys it (funds escrowed on-chain)
 *   → time skips past the release window
 *   → seller claims the payout (net of the 2% protocol fee).
 *
 * Buyer and seller are distinct Hardhat accounts (the contract forbids
 * buyer == receiver). Runs serially against the live docker stack.
 */

const RELEASE_WINDOW_SECONDS = 14 * 24 * 60 * 60; // ESCROW_RELEASE_DAYS

// A tiny 1x1 PNG used for the required product image upload.
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/1eHAAAAAElFTkSuQmCC",
  "base64"
);

async function newActor(browser: import("@playwright/test").Browser, account = ACCOUNTS.buyer) {
  const context = await browser.newContext();
  await installWallet(context, account);
  const page = await context.newPage();
  return { context, page };
}

let sellerCtx: BrowserContext;
let buyerCtx: BrowserContext;
let sellerPage: Page;
let buyerPage: Page;

// Unique names so reruns don't collide.
const stamp = Date.now();
const STORE_NAME = `E2E Store ${stamp}`;
const PRODUCT_NAME = `E2E Widget ${stamp}`;
const PRICE = "0.01"; // ETH

// Captured during the seller flow so the buyer can navigate straight to the listing
// without depending on store-discovery rendering.
let productUrl = "";
// Captured after checkout so the claim step can verify on-chain fund movement.
let orderId = "";

test.beforeAll(async ({ browser }) => {
  ({ context: sellerCtx, page: sellerPage } = await newActor(browser, ACCOUNTS.seller));
  ({ context: buyerCtx, page: buyerPage } = await newActor(browser, ACCOUNTS.buyer));
});

test.afterAll(async () => {
  await sellerCtx?.close();
  await buyerCtx?.close();
});

// One serial test with steps: the flow is inherently stateful (a store → its
// product → an order → its claim), so a single test keeps the shared values in
// scope and the steps in guaranteed order.
test("full ETH order lifecycle: list → buy → escrow → claim", async () => {
  await test.step("seller logs in and lists a product", async () => {
    await login(sellerPage);

    await sellerPage.goto("/seller/stores/new", { waitUntil: "networkidle" });
    await sellerPage.getByLabel("Store name").fill(STORE_NAME);
    await sellerPage.getByRole("button", { name: /create store/i }).click();
    await expect(sellerPage).toHaveURL(/\/seller\/stores\/[0-9a-f-]+$/i, { timeout: 30_000 });

    await sellerPage.getByRole("link", { name: /add product/i }).first().click();
    await expect(sellerPage).toHaveURL(/\/products\/new$/, { timeout: 30_000 });

    await sellerPage.getByLabel("Name").fill(PRODUCT_NAME);
    await sellerPage.getByLabel(/price/i).fill(PRICE);
    await sellerPage.getByLabel("Description").fill("Created by the e2e suite.");
    await sellerPage.setInputFiles("#image", {
      name: "widget.png",
      mimeType: "image/png",
      buffer: PNG_1PX,
    });
    await sellerPage.getByRole("button", { name: /create product/i }).click();

    await expect(sellerPage).toHaveURL(/\/seller\/stores\/[0-9a-f-]+$/i, { timeout: 30_000 });
    await expect(sellerPage.getByText(PRODUCT_NAME)).toBeVisible({ timeout: 30_000 });

    const href = await sellerPage
      .getByRole("link", { name: PRODUCT_NAME })
      .first()
      .getAttribute("href");
    productUrl = href ?? "";
    expect(productUrl).toMatch(/\/products\/[0-9a-f-]+/i);
  });

  await test.step("buyer purchases the product into escrow", async () => {
    await login(buyerPage);

    await buyerPage.goto(productUrl, { waitUntil: "networkidle" });
    await expect(buyerPage.getByRole("heading", { name: PRODUCT_NAME })).toBeVisible({
      timeout: 30_000,
    });

    await buyerPage.getByRole("button", { name: /add to cart/i }).click();
    await buyerPage.goto("/cart", { waitUntil: "networkidle" });
    await expect(buyerPage.getByText(PRODUCT_NAME).first()).toBeVisible();

    await buyerPage.getByRole("button", { name: /pay with eth/i }).click();
    await expect(buyerPage).toHaveURL(/\/cart\/confirmation|\/orders/, { timeout: 90_000 });

    await buyerPage.goto("/orders", { waitUntil: "networkidle" });
    const orderCard = buyerPage
      .locator('a[href^="/orders/"]')
      .filter({ hasText: PRODUCT_NAME });
    await expect(orderCard.first()).toBeVisible({ timeout: 30_000 });
    const href = await orderCard.first().getAttribute("href");
    orderId = (href ?? "").replace(/^\/orders\//, "").trim();
    expect(orderId).toMatch(/^[0-9a-f-]{36}$/i);
  });

  await test.step("escrow records the order with the correct parties", async () => {
    // The escrow createOrder tx is mined in the background after checkout redirects,
    // so poll until the order materialises on-chain.
    let o = await readOrder(orderId);
    await expect(async () => {
      o = await readOrder(orderId);
      expect(o.buyer).not.toBe("0x0000000000000000000000000000000000000000");
    }).toPass({ timeout: 30_000 });

    expect(o.buyer.toLowerCase()).toBe(ACCOUNTS.buyer.address.toLowerCase());
    expect(o.receiver.toLowerCase()).toBe(ACCOUNTS.seller.address.toLowerCase());
    expect(o.amount).toBeGreaterThan(0n);
  });

  await test.step("seller claims the payout net of the 2% fee", async () => {
    // The seller-orders UI gates the Claim button on Date.now() (wall clock) rather
    // than chain time, so evm_increaseTime won't surface it in the browser. Verify
    // fund movement at the contract level: advance chain time past the release
    // window, claim as the seller, and assert the payout = amount − 2% fee lands in
    // the treasury + seller and the order ends completed.
    const escrow = escrowAs(ACCOUNTS.seller);
    const feeBps: bigint = await escrow.feeBps();
    expect(feeBps).toBe(200n); // 2%

    const pre = await readOrder(orderId);
    if (!pre.completed) {
      await increaseTime(RELEASE_WINDOW_SECONDS + 60);

      const treasury: string = await escrow.treasury();
      const sellerBefore = await provider.getBalance(ACCOUNTS.seller.address);
      const treasuryBefore = await provider.getBalance(treasury);

      const tx = await escrow.claimOrder(orderIdToBytes32(orderId));
      const receipt = await tx.wait();
      const gas = BigInt(receipt!.gasUsed) * BigInt(receipt!.gasPrice);

      const expectedFee = (pre.amount * feeBps) / 10_000n;
      const expectedPayout = pre.amount - expectedFee;

      const sellerCredited = (await provider.getBalance(ACCOUNTS.seller.address)) - sellerBefore + gas;
      const treasuryCredited = (await provider.getBalance(treasury)) - treasuryBefore;

      expect(sellerCredited).toBe(expectedPayout);
      // Treasury == seller account on the local deploy would fold both together; only
      // assert the fee separately when they differ.
      if (treasury.toLowerCase() !== ACCOUNTS.seller.address.toLowerCase()) {
        expect(treasuryCredited).toBe(expectedFee);
      }
    }

    const o = await readOrder(orderId);
    expect(o.completed).toBe(true);
  });
});
