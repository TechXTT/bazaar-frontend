import { test, expect } from "@playwright/test";
import { installWallet, login, ACCOUNTS } from "../fixtures/wallet";

/**
 * Spike / smoke test: prove the injected wallet completes SIWE login end to end.
 *
 * This de-risks the whole suite — if the wallet can't sign in, nothing downstream
 * (checkout, claim, disputes) can run. The backend SIWE verifier must accept the
 * signature produced by the injected wallet.
 */
test("buyer can sign in with SIWE via the injected wallet", async ({ browser }) => {
  const context = await browser.newContext();
  await installWallet(context, ACCOUNTS.buyer);
  const page = await context.newPage();

  await login(page);

  // Once authenticated the navbar exposes the seller link (hidden when logged out).
  await expect(page.getByRole("link", { name: /^Seller$/ })).toBeVisible({ timeout: 30_000 });

  await context.close();
});
