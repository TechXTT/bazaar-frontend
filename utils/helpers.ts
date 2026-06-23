const bytes32 = require("bytes32");

/** Loosely-typed view of the error shapes thrown by axios and ethers. */
interface ErrorLike {
  reason?: unknown;
  message?: unknown;
  response?: { data?: unknown };
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

/**
 * Extracts a human-readable message from an unknown thrown value, handling the
 * axios (`response.data` / `response.data.error`) and ethers (`reason`) shapes
 * the app deals with, falling back to `message` and finally `fallback`.
 */
export const getErrorMessage = (err: unknown, fallback = "Something went wrong"): string => {
  const e = (err ?? {}) as ErrorLike;
  const data = e.response?.data;
  const fromResponse =
    asString(data) ??
    (data && typeof data === "object"
      ? asString((data as { error?: unknown }).error)
      : undefined);
  return asString(e.reason) ?? fromResponse ?? asString(e.message) ?? fallback;
};

/** Canonical UUID v1–v5 form (8-4-4-4-12 hex), used for order/product ids. */
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Encode an order/product UUID as the bytes32 the escrow contract expects.
 *
 * NB: the contract does NOT treat the UUID as a hex number. We strip the dashes
 * (yielding a 32-char string) and the `bytes32` lib UTF-8-encodes that *string* into
 * 32 bytes — each hex character becomes its ASCII byte ('6' -> 0x36). The e2e wallet
 * fixture (orderIdToBytes32) mirrors this exactly; keep them in sync.
 *
 * FE-13: validate the id is a real UUID up front with a specific, actionable message
 * so a bad id fails before the tx instead of surfacing as a generic toast.
 */
export const messageToBytes32 = (message: string): string => {
    if (!UUID_RE.test(message)) {
      throw new Error(
        `Invalid order id "${message}": expected a UUID (8-4-4-4-12 hex)`
      );
    }
    const cleanedUuid = message.replace(/-/g, "");
    return bytes32({ input: cleanedUuid });
  };

/** Format basis points as a percentage string, e.g. 200 -> "2%", 250 -> "2.5%". */
export const formatFeeBps = (bps: number): string => {
  const pct = bps / 100;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(2).replace(/\.?0+$/, "")}%`;
};

/** Net fraction a seller receives after the fee, e.g. 200 bps -> 0.98. */
export const sellerNetFraction = (bps: number): number => (10_000 - bps) / 10_000;

/**
 * Settlement currency a listing's numeric `Price` is denominated in.
 *
 * FE-3: a listing's single `Price` has exactly one denomination — the buyer must
 * NOT be able to pay a token the price isn't denominated in (e.g. charging an ETH
 * price as USDC, or vice-versa, with no conversion). Listings are created via the
 * "Price (ETH)" editor, so the canonical/default denomination is ETH; a backend
 * `Unit` of "USDC" marks a USDC-denominated listing. Anything else falls back to ETH.
 */
export type SettlementCurrency = "ETH" | "USDC";

export const DEFAULT_SETTLEMENT_CURRENCY: SettlementCurrency = "ETH";

/** Resolve the settlement currency a product's `Price` is denominated in. */
export const settlementCurrencyFromUnit = (unit?: string | null): SettlementCurrency => {
  const u = (unit ?? "").trim().toUpperCase();
  if (u === "USDC") return "USDC";
  return DEFAULT_SETTLEMENT_CURRENCY; // "ETH", "" or any other label settles in ETH
};

/** Decimals used to convert a `Price` into the on-chain base unit for a currency. */
export const settlementDecimals = (currency: SettlementCurrency): number =>
  currency === "USDC" ? 6 : 18;