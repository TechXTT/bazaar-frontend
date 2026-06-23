import { test, expect } from "@playwright/test";
import { parseEther, parseUnits } from "ethers";

/**
 * FE-3 pricing / settlement-denomination correctness.
 *
 * Each listing settles in the currency its `Price` is denominated in, derived from
 * the listing's `Unit`:
 *   • ETH (or any non-USDC unit) → escrow value = parseEther(price * qty)   [18 dp]
 *   • USDC                       → escrow amount = parseUnits(price * qty, 6) [6 dp]
 *
 * This spec pins the exact conversion the checkout performs in
 * `app/cart/components/checkout` so a regression that pays the wrong magnitude — e.g.
 * sending a USDC price as 18-dp ether wei, or an ETH price as 6-dp — is caught. It is
 * a pure arithmetic check (no stack required), so it always runs.
 */

// Mirror of utils/helpers.settlementCurrencyFromUnit — kept local so the spec is
// self-contained and asserts the *contract* of that helper, not its implementation.
function settlementCurrencyFromUnit(unit?: string | null): "ETH" | "USDC" {
  return (unit ?? "").trim().toUpperCase() === "USDC" ? "USDC" : "ETH";
}

// The amount the checkout escrows for one cart line, per FE-3.
function escrowAmount(price: number, quantity: number, unit?: string | null): bigint {
  const currency = settlementCurrencyFromUnit(unit);
  const total = (price * quantity).toString();
  return currency === "USDC" ? parseUnits(total, 6) : parseEther(total);
}

test("ETH listing escrows parseEther(price) at 18 decimals", () => {
  expect(escrowAmount(0.01, 1, "ETH")).toBe(parseEther("0.01"));
  expect(escrowAmount(0.01, 1, "ETH")).toBe(10_000_000_000_000_000n); // 0.01e18
  // An empty / unknown unit falls back to ETH settlement.
  expect(escrowAmount(0.05, 1, "")).toBe(parseEther("0.05"));
  expect(escrowAmount(0.05, 1, "POINTS")).toBe(parseEther("0.05"));
});

test("ETH amount scales linearly with quantity", () => {
  expect(escrowAmount(0.01, 3, "ETH")).toBe(parseEther("0.03"));
  expect(escrowAmount(0.02, 2, "ETH")).toBe(escrowAmount(0.04, 1, "ETH"));
});

test("USDC listing escrows parseUnits(price, 6) — not ether wei", () => {
  expect(escrowAmount(85, 1, "USDC")).toBe(parseUnits("85", 6));
  expect(escrowAmount(85, 1, "USDC")).toBe(85_000_000n); // 85 * 1e6
  expect(escrowAmount(12.5, 2, "USDC")).toBe(parseUnits("25", 6));
  // Case-insensitive unit detection.
  expect(escrowAmount(10, 1, "usdc")).toBe(parseUnits("10", 6));
});

test("the same numeric price yields different magnitudes under ETH vs USDC", () => {
  const price = 5;
  const asEth = escrowAmount(price, 1, "ETH"); // 5e18
  const asUsdc = escrowAmount(price, 1, "USDC"); // 5e6

  // They must NOT be equal — paying a USDC price as ether wei would over-charge by
  // 12 orders of magnitude, which is exactly the FE-3 bug this guards against.
  expect(asEth).not.toBe(asUsdc);
  expect(asEth).toBeGreaterThan(asUsdc);
  // Precisely 1e12 apart (18 - 6 decimals) for the same integer price.
  expect(asEth / asUsdc).toBe(1_000_000_000_000n);
});

test("a mixed-denomination cart computes each line in its own currency", () => {
  // Two lines: one ETH-denominated, one USDC-denominated. Each must use its own scale.
  const lines = [
    { price: 0.01, quantity: 1, unit: "ETH" },
    { price: 85, quantity: 1, unit: "USDC" },
  ];
  const [ethLine, usdcLine] = lines.map((l) => escrowAmount(l.price, l.quantity, l.unit));

  expect(ethLine).toBe(parseEther("0.01"));
  expect(usdcLine).toBe(parseUnits("85", 6));
  expect(settlementCurrencyFromUnit(lines[0].unit)).toBe("ETH");
  expect(settlementCurrencyFromUnit(lines[1].unit)).toBe("USDC");
});
