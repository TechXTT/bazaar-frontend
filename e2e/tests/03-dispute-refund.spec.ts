import { test, expect } from "@playwright/test";
import {
  createEscrowOrder,
  escrowAs,
  markShipped,
  readOrder,
  readDispute,
  arbitrationCost,
  orderIdToBytes32,
  provider,
  ACCOUNTS,
} from "../fixtures/wallet";

/**
 * Dispute and refund flows, exercised at the contract level.
 *
 * The dispute UI depends on per-party wallet detection and arbitration-cost reads
 * that are awkward to drive headlessly; the money-movement guarantees live in the
 * contract, so we create fresh escrowed orders directly and assert on-chain state.
 * (UI login + checkout are already covered by 01/02.)
 */

const ETH = (n: string) => BigInt(Math.round(Number(n) * 1e18));

// Tests in this file run serially (workers:1). Each test fully awaits its txs so
// the shared Hardhat accounts' nonces never race.

test("receiver can refund the buyer in full with no fee", async () => {
  const amount = ETH("0.02");
  const orderId = await createEscrowOrder({
    buyer: ACCOUNTS.buyer,
    receiver: ACCOUNTS.seller,
    amountWei: amount,
  });

  // Escrow now holds exactly `amount` for this order.
  const o0 = await readOrder(orderId);
  expect(o0.amount).toBe(amount);

  // Measure the buyer's balance right before the receiver-sent refund (buyer pays no
  // gas on this tx, so the delta is exactly the refunded amount). Pin both reads to
  // explicit block numbers so a background tx from another account can't skew them.
  const escrow = escrowAs(ACCOUNTS.seller);
  const buyerBefore = await provider.getBalance(ACCOUNTS.buyer.address);

  const tx = await escrow.refundOrder(orderIdToBytes32(orderId));
  const receipt = await tx.wait();
  const refundBlock = receipt!.blockNumber;

  const buyerAfter = await provider.getBalance(ACCOUNTS.buyer.address, refundBlock);
  const buyerAt = await provider.getBalance(ACCOUNTS.buyer.address, refundBlock - 1);

  // Full amount refunded, no protocol fee (compare across the exact refund block).
  expect(buyerAfter - buyerAt).toBe(amount);

  const o = await readOrder(orderId);
  expect(o.completed).toBe(true);
});

test("buyer raising a dispute flips the order to disputed and records a dispute row", async () => {
  const amount = ETH("0.02");
  const orderId = await createEscrowOrder({
    buyer: ACCOUNTS.buyer,
    receiver: ACCOUNTS.seller,
    amountWei: amount,
  });

  // SC-1: disputes are only allowed after shipment (pre-shipment the buyer's remedy
  // is buyerReclaim). The receiver ships, then the buyer can dispute.
  await markShipped(ACCOUNTS.seller, orderId);

  // Buyer escrows their share of the arbitration fee to open the dispute.
  const cost = await arbitrationCost();
  const escrow = escrowAs(ACCOUNTS.buyer);
  const tx = await escrow.raiseDisputeBuyer(orderIdToBytes32(orderId), { value: cost });
  await tx.wait();

  // The on-chain order is now in dispute (not completed, funds still held) and the
  // dispute state records the buyer's fee deposit at status fee_pending (1).
  const o = await readOrder(orderId);
  expect(o.completed).toBe(false);
  expect(o.amount).toBe(amount);

  const d = await readDispute(orderId);
  expect(d.status).toBe(1); // fee_pending
  expect(d.buyerFeeDeposit).toBe(cost);
});
