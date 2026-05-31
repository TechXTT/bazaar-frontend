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

export const messageToBytes32 = (message: string): string => {
    const cleanedUuid = message.replace(/-/g, "");
    if (cleanedUuid.length !== 32) {
      throw new Error("Invalid UUID length");
    }
    const bytes32Uuid = bytes32({ input: cleanedUuid });
    return bytes32Uuid;
  };

/** Format basis points as a percentage string, e.g. 200 -> "2%", 250 -> "2.5%". */
export const formatFeeBps = (bps: number): string => {
  const pct = bps / 100;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(2).replace(/\.?0+$/, "")}%`;
};

/** Net fraction a seller receives after the fee, e.g. 200 bps -> 0.98. */
export const sellerNetFraction = (bps: number): number => (10_000 - bps) / 10_000;