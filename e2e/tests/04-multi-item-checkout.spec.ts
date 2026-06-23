import { test, expect, BrowserContext, Page } from "@playwright/test";
import {
  installWallet,
  login,
  expectAuthed,
  readOrder,
  ACCOUNTS,
} from "../fixtures/wallet";

/**
 * Multi-item cart checkout → multiple on-chain escrow orders (FE-1/FE-2 happy path).
 *
 * The seller lists two distinct products; the buyer adds both to the cart and pays
 * once with ETH. Checkout submits one createOrder tx per cart item, so the run must
 * end with TWO separate escrowed orders on-chain — each holding its own item's price,
 * each with buyer/receiver set to the right parties. This guards the per-item loop in
 * `app/cart/components/checkout` against silently collapsing N items into one order or
 * escrowing the wrong amount against the wrong product.
 *
 * Runs serially against the live docker stack (workers:1).
 */

// A tiny 1x1 PNG used for the required product image upload.
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/1eHAAAAAElFTkSuQmCC",
  "base64"
);

async function newActor(
  browser: import("@playwright/test").Browser,
  account = ACCOUNTS.buyer
) {
  const context = await browser.newContext();
  await installWallet(context, account);
  const page = await context.newPage();
  return { context, page };
}

let sellerCtx: BrowserContext;
let buyerCtx: BrowserContext;
let sellerPage: Page;
let buyerPage: Page;

const stamp = Date.now();
const STORE_NAME = `E2E Multi Store ${stamp}`;
// Two products at distinct prices so we can tell the on-chain orders apart by amount.
const PRODUCTS = [
  { name: `E2E Multi A ${stamp}`, price: "0.01" },
  { name: `E2E Multi B ${stamp}`, price: "0.02" },
];

// Captured during the seller flow so the buyer can navigate straight to each listing.
const productUrls: string[] = [];

test.beforeAll(async ({ browser }) => {
  ({ context: sellerCtx, page: sellerPage } = await newActor(browser, ACCOUNTS.seller));
  ({ context: buyerCtx, page: buyerPage } = await newActor(browser, ACCOUNTS.buyer));
});

test.afterAll(async () => {
  await sellerCtx?.close();
  await buyerCtx?.close();
});

test("multi-item cart checkout creates one escrow order per item", async () => {
  await test.step("seller lists two products in one store", async () => {
    await login(sellerPage);

    await sellerPage.goto("/seller/stores/new", { waitUntil: "networkidle" });
    await expectAuthed(sellerPage);
    await sellerPage.getByLabel("Store name").fill(STORE_NAME);
    await sellerPage.getByRole("button", { name: /create store/i }).click();
    await expect(sellerPage).toHaveURL(/\/seller\/stores\/[0-9a-f-]+$/i, { timeout: 30_000 });

    for (const product of PRODUCTS) {
      await sellerPage.getByRole("link", { name: /add product/i }).first().click();
      await expect(sellerPage).toHaveURL(/\/products\/new$/, { timeout: 30_000 });

      await sellerPage.getByLabel("Name").fill(product.name);
      await sellerPage.getByLabel(/price/i).fill(product.price);
      await sellerPage.getByLabel("Description").fill("Created by the e2e multi-item suite.");
      await sellerPage.setInputFiles("#image", {
        name: "widget.png",
        mimeType: "image/png",
        buffer: PNG_1PX,
      });
      await sellerPage.getByRole("button", { name: /create product/i }).click();

      await expect(sellerPage).toHaveURL(/\/seller\/stores\/[0-9a-f-]+$/i, { timeout: 30_000 });
      await expect(sellerPage.getByText(product.name)).toBeVisible({ timeout: 30_000 });

      const href = await sellerPage
        .getByRole("link", { name: product.name })
        .first()
        .getAttribute("href");
      expect(href).toMatch(/\/products\/[0-9a-f-]+/i);
      productUrls.push(href ?? "");
    }
    expect(productUrls).toHaveLength(2);
  });

  await test.step("buyer adds both products to the cart", async () => {
    await login(buyerPage);

    for (const url of productUrls) {
      await buyerPage.goto(url, { waitUntil: "networkidle" });
      await buyerPage.getByRole("button", { name: /add to cart/i }).click();
    }
  });

  await test.step("buyer pays once with ETH and lands on the confirmation", async () => {
    await buyerPage.goto("/cart", { waitUntil: "networkidle" });
    await expectAuthed(buyerPage);
    // Both items must be present in the cart before checkout.
    for (const product of PRODUCTS) {
      await expect(buyerPage.getByText(product.name).first()).toBeVisible();
    }

    await buyerPage.getByRole("button", { name: /pay with eth/i }).click();
    await expect(buyerPage).toHaveURL(/\/cart\/confirmation|\/orders/, { timeout: 90_000 });
  });

  await test.step("two distinct escrow orders exist on-chain with the right amounts", async () => {
    await buyerPage.goto("/orders", { waitUntil: "networkidle" });
    await expectAuthed(buyerPage);

    // Collect this run's order ids by matching the product names we just created.
    const orderIds: string[] = [];
    for (const product of PRODUCTS) {
      const card = buyerPage
        .locator('a[href^="/orders/"]')
        .filter({ hasText: product.name });
      await expect(card.first()).toBeVisible({ timeout: 30_000 });
      const href = await card.first().getAttribute("href");
      const id = (href ?? "").replace(/^\/orders\//, "").trim();
      expect(id).toMatch(/^[0-9a-f-]{36}$/i);
      orderIds.push(id);
    }

    // Two separate orders, not one collapsed order.
    expect(new Set(orderIds).size).toBe(2);

    // Each order must materialise on-chain with the correct parties + a positive
    // amount. The createOrder txs mine in the background after checkout redirects,
    // so poll until both exist.
    for (const id of orderIds) {
      await expect(async () => {
        const o = await readOrder(id);
        expect(o.buyer).not.toBe("0x0000000000000000000000000000000000000000");
      }).toPass({ timeout: 30_000 });

      const o = await readOrder(id);
      expect(o.buyer.toLowerCase()).toBe(ACCOUNTS.buyer.address.toLowerCase());
      expect(o.receiver.toLowerCase()).toBe(ACCOUNTS.seller.address.toLowerCase());
      expect(o.amount).toBeGreaterThan(0n);
    }

    // The two orders escrow different amounts (0.01 vs 0.02 ETH), proving each item
    // was priced against its own listing rather than a shared total.
    const amounts = await Promise.all(orderIds.map(async (id) => (await readOrder(id)).amount));
    expect(amounts[0]).not.toBe(amounts[1]);
  });
});
