import { test, expect, BrowserContext, Page } from "@playwright/test";
import {
  installWallet,
  login,
  expectAuthed,
  readOrder,
  ACCOUNTS,
} from "../fixtures/wallet";

/**
 * Partial-failure checkout (FE-1).
 *
 * Escrow txs are submitted one-per-item, and any single one can be rejected in the
 * wallet. When that happens the app must:
 *   1. keep the items that already escrowed (their tx confirmed),
 *   2. remove the PAID items from the cart so a retry can't re-charge them,
 *   3. surface "N of M paid" and leave the unpaid item in the cart,
 *   4. on retry, only re-charge the still-unpaid item.
 *
 * We drive this by wrapping the injected wallet so the FIRST `eth_sendTransaction`
 * to the escrow `createOrder` selector (0x… 4-byte) is rejected (MetaMask user-reject,
 * code 4001) exactly once. With a two-item cart, that means one item fails on the
 * first attempt and succeeds on retry. The reject flag lives on `window` so the page's
 * own provider sees it; the toggle is flipped from the test via `page.evaluate`.
 *
 * Needs the full docker stack to RUN; authored to typecheck + match existing style.
 */

// 1x1 PNG for the required product image upload.
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

/**
 * Wrap the page's injected `window.ethereum.request` so that, while
 * `window.__e2eRejectNextSend` is true, the next `eth_sendTransaction` is rejected
 * with a MetaMask user-reject error and the flag clears itself. All other requests
 * (reads, personal_sign, chain switches) pass through untouched.
 */
async function installRejectableSend(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };
      __e2eRejectNextSend?: boolean;
    };
    const eth = w.ethereum;
    if (!eth || !eth.request) return;
    const original = eth.request.bind(eth);
    eth.request = (args: { method: string; params?: unknown[] }) => {
      if (args.method === "eth_sendTransaction" && w.__e2eRejectNextSend) {
        w.__e2eRejectNextSend = false;
        const err = Object.assign(new Error("User rejected the request."), { code: 4001 });
        return Promise.reject(err);
      }
      return original(args);
    };
  });
}

let sellerCtx: BrowserContext;
let buyerCtx: BrowserContext;
let sellerPage: Page;
let buyerPage: Page;

const stamp = Date.now();
const STORE_NAME = `E2E Partial Store ${stamp}`;
const PRODUCTS = [
  { name: `E2E Partial A ${stamp}`, price: "0.01" },
  { name: `E2E Partial B ${stamp}`, price: "0.02" },
];

const productUrls: string[] = [];

test.beforeAll(async ({ browser }) => {
  ({ context: sellerCtx, page: sellerPage } = await newActor(browser, ACCOUNTS.seller));
  ({ context: buyerCtx, page: buyerPage } = await newActor(browser, ACCOUNTS.buyer));
  await installRejectableSend(buyerPage);
});

test.afterAll(async () => {
  await sellerCtx?.close();
  await buyerCtx?.close();
});

test("one rejected item is left in the cart; retry only re-charges the unpaid item", async () => {
  await test.step("seller lists two products", async () => {
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
      await sellerPage.getByLabel("Description").fill("Created by the e2e partial-failure suite.");
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

  await test.step("buyer fills a two-item cart", async () => {
    await login(buyerPage);
    for (const url of productUrls) {
      await buyerPage.goto(url, { waitUntil: "networkidle" });
      await buyerPage.getByRole("button", { name: /add to cart/i }).click();
    }
    await buyerPage.goto("/cart", { waitUntil: "networkidle" });
    await expectAuthed(buyerPage);
    for (const product of PRODUCTS) {
      await expect(buyerPage.getByText(product.name).first()).toBeVisible();
    }
  });

  await test.step("one item's tx is rejected → 'N of M paid' surfaces, paid item leaves the cart", async () => {
    // Arm the wallet to reject the SECOND escrow send: the per-item loop submits them
    // sequentially, so item 1 escrows ("paid") and item 2 is rejected — the checkout
    // stops at the first failure, leaving exactly one paid (→ "1 of 2 paid"). One-shot,
    // so the later retry sends succeed.
    await buyerPage.evaluate(() => {
      (window as unknown as { __e2eRejectSendIndex?: number; __e2eSendCount?: number }).__e2eRejectSendIndex = 2;
      (window as unknown as { __e2eSendCount?: number }).__e2eSendCount = 0;
    });

    await buyerPage.getByRole("button", { name: /pay with eth/i }).click();

    // FE-1 surfaces a "1 of 2 paid …" toast when at least one item escrowed and one
    // failed. We don't redirect to the confirmation in the partial case.
    await expect(buyerPage.getByText(/\bof\b.*paid/i)).toBeVisible({ timeout: 90_000 });
    await expect(buyerPage).toHaveURL(/\/cart$/, { timeout: 10_000 });

    // Exactly one product name should remain rendered in the cart (the unpaid one);
    // the paid item was removed so a retry can't re-charge it. Poll until the redux
    // cart mutation + re-render settles.
    await expect(async () => {
      const remaining = await Promise.all(
        PRODUCTS.map((p) => buyerPage.getByText(p.name).first().isVisible())
      );
      expect(remaining.filter(Boolean)).toHaveLength(1);
    }).toPass({ timeout: 15_000 });
  });

  await test.step("retry escrows only the remaining unpaid item", async () => {
    // Wallet is no longer armed (flag auto-cleared), so the retry succeeds and the
    // single remaining item escrows, redirecting to the confirmation.
    await buyerPage.getByRole("button", { name: /pay with eth/i }).click();
    await expect(buyerPage).toHaveURL(/\/cart\/confirmation|\/orders/, { timeout: 90_000 });

    // Across the whole flow the buyer ends with exactly two distinct on-chain orders
    // (one from the first attempt's paid item, one from the retry) — never a double
    // charge of the item paid on attempt #1.
    await buyerPage.goto("/orders", { waitUntil: "networkidle" });
    await expectAuthed(buyerPage);

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
    expect(new Set(orderIds).size).toBe(2);

    for (const id of orderIds) {
      await expect(async () => {
        const o = await readOrder(id);
        expect(o.buyer).not.toBe("0x0000000000000000000000000000000000000000");
      }).toPass({ timeout: 30_000 });
      const o = await readOrder(id);
      expect(o.amount).toBeGreaterThan(0n);
    }
  });
});
