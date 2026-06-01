import { BrowserContext, Page, expect } from "@playwright/test";
import { ethers } from "ethers";

/**
 * In-browser wallet for e2e tests.
 *
 * The app talks to `window.ethereum` (MetaMask) for SIWE `personal_sign` and for
 * escrow `eth_sendTransaction`. We can't drive the real extension headlessly, so we
 * inject a thin `window.ethereum` shim that delegates every request to a Node-side
 * ethers Wallet (backed by a well-known Hardhat key) via `exposeFunction`.
 *
 * Why delegate to Node instead of signing in-page: `wallet.signMessage` produces a
 * real EIP-191 signature that the backend's SIWE verifier accepts, and routing RPC
 * through Node avoids browser→node CORS. The shim sets `isMetaMask: true` so the
 * MetaMask SDK adopts it as the injected provider rather than opening its modal.
 */

export const RPC_URL = process.env.E2E_RPC_URL ?? "http://localhost:8545";
export const CHAIN_ID_HEX = process.env.E2E_CHAIN_ID ?? "0x7a69"; // 31337
export const ESCROW_ADDRESS =
  process.env.E2E_CONTRACT_ADDRESS ?? "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// Minimal Escrow surface needed by the tests (read order state, release, claim).
export const ESCROW_ABI = [
  "function orders(bytes32) view returns (address buyer, address receiver, address token, uint256 amount, uint256 releaseTime, bool release, bool completed, bytes32 productId)",
  "function createOrder(bytes32 orderId, bytes32 productId, address receiver, uint256 releaseTime) payable",
  "function releaseOrder(bytes32 orderId)",
  "function claimOrder(bytes32 orderId)",
  "function refundOrder(bytes32 orderId)",
  "function raiseDisputeBuyer(bytes32 orderId) payable",
  "function raiseDisputeReceiver(bytes32 orderId) payable",
  "function feeBps() view returns (uint96)",
  "function treasury() view returns (address)",
  "function arbitrator() view returns (address)",
  "function arbitratorExtraData() view returns (bytes)",
  "function orderDisputes(bytes32) view returns (uint256 arbitratorDisputeID, uint256 buyerFeeDeposit, uint256 receiverFeeDeposit, uint64 raisedAt, uint8 status)",
];

/** Read the on-chain dispute state for an order. status: 0=none,1=fee_pending,2=arbitrating,3=resolved. */
export async function readDispute(orderId: string): Promise<{ status: number; buyerFeeDeposit: bigint }> {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
  const d = await escrow.orderDisputes(orderIdToBytes32(orderId));
  return { status: Number(d[4]), buyerFeeDeposit: d[1] as bigint };
}

const ARBITRATOR_ABI = [
  "function arbitrationCost(bytes _extraData) view returns (uint256)",
];

/** Quote the arbitrator's current fee (both parties must escrow this to dispute). */
export async function arbitrationCost(): Promise<bigint> {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
  const [arb, extra] = await Promise.all([escrow.arbitrator(), escrow.arbitratorExtraData()]);
  const arbitrator = new ethers.Contract(arb, ARBITRATOR_ABI, provider);
  return arbitrator.arbitrationCost(extra);
}

/**
 * Create a fresh ETH-escrowed order directly via the contract, so dispute/refund
 * specs don't depend on the full UI checkout. Returns the random order id (UUID).
 */
export async function createEscrowOrder(opts: {
  buyer: TestAccount;
  receiver: TestAccount;
  amountWei: bigint;
  releaseSeconds?: number;
}): Promise<string> {
  const orderId = crypto.randomUUID();
  const productId = crypto.randomUUID();
  const escrow = escrowAs(opts.buyer);
  const tx = await escrow.createOrder(
    orderIdToBytes32(orderId),
    orderIdToBytes32(productId),
    opts.receiver.address,
    BigInt(opts.releaseSeconds ?? 14 * 24 * 60 * 60),
    { value: opts.amountWei }
  );
  await tx.wait();
  return orderId;
}

/**
 * Convert a UUID order id to the bytes32 form the contract uses.
 *
 * NB: the app does NOT interpret the UUID as a hex value. It strips the dashes
 * (yielding a 32-char string) and UTF-8-encodes that *string* into 32 bytes — i.e.
 * each hex character becomes its ASCII byte ('6' -> 0x36). We must match exactly or
 * the on-chain order won't be found.
 */
export function orderIdToBytes32(orderId: string): string {
  const cleaned = orderId.replace(/-/g, "");
  if (cleaned.length !== 32) throw new Error(`unexpected order id length: ${orderId}`);
  return ethers.hexlify(ethers.toUtf8Bytes(cleaned));
}

/** Read an order's on-chain state by UUID. */
export async function readOrder(orderId: string) {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
  const o = await escrow.orders(orderIdToBytes32(orderId));
  return {
    buyer: o[0] as string,
    receiver: o[1] as string,
    amount: o[3] as bigint,
    releaseTime: o[4] as bigint,
    release: o[5] as boolean,
    completed: o[6] as boolean,
  };
}

// A NonceManager wraps the signer and assigns nonces locally, surviving the case
// where the same Hardhat account was also used by the in-browser wallet earlier in
// the run. Cache one per key so a test's back-to-back sends from one account don't
// race. We refresh from chain via reset() at the start of contract-level use.
const signerCache = new Map<string, ethers.NonceManager>();
function signerFor(account: TestAccount): ethers.NonceManager {
  let s = signerCache.get(account.key);
  if (!s) {
    // NonceManager assigns nonces locally and monotonically across all sends from
    // this instance, so back-to-back txs in one test never collide. We deliberately
    // do NOT reset() — resetting re-reads the chain's "latest" count and can roll the
    // nonce backwards while an earlier tx is still being mined.
    s = new ethers.NonceManager(new ethers.Wallet(account.key, provider));
    signerCache.set(account.key, s);
  }
  return s;
}

/** Escrow contract connected to a given account's nonce-managed signer. */
export function escrowAs(account: TestAccount) {
  return new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signerFor(account));
}

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export type TestAccount = { address: string; key: string };

// Default Hardhat accounts — public, well-known test keys (never use on a real network).
export const ACCOUNTS: Record<"deployer" | "buyer" | "seller", TestAccount> = {
  // acct #0 — also the contract deployer / treasury / owner in deploy-local.ts
  deployer: {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    key: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  // acct #1 — buyer
  buyer: {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  // acct #2 — seller (must differ from buyer; the contract forbids buyer == receiver)
  seller: {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    key: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  },
};

/** Install the injected wallet into a browser context (all pages/navigations). */
export async function installWallet(context: BrowserContext, account: TestAccount) {
  const wallet = new ethers.Wallet(account.key, provider);

  await context.exposeFunction(
    "__walletRequest",
    async (method: string, params: unknown[] = []): Promise<unknown> => {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [account.address];
        case "eth_chainId":
          return CHAIN_ID_HEX;
        case "net_version":
          return String(parseInt(CHAIN_ID_HEX, 16));
        case "wallet_requestPermissions":
        case "wallet_getPermissions":
          return [{ parentCapability: "eth_accounts" }];
        case "wallet_switchEthereumChain":
        case "wallet_addEthereumChain":
          return null;
        case "personal_sign": {
          const raw = (params as string[])[0];
          // The app passes the SIWE message as a UTF-8 string; hex is also accepted.
          const data = typeof raw === "string" && raw.startsWith("0x") ? ethers.getBytes(raw) : raw;
          return wallet.signMessage(data);
        }
        case "eth_signTypedData_v4": {
          const json = (params as [string, string])[1];
          const typed = typeof json === "string" ? JSON.parse(json) : json;
          const { domain, types, message } = typed as {
            domain: ethers.TypedDataDomain;
            types: Record<string, ethers.TypedDataField[]>;
            message: Record<string, unknown>;
          };
          delete (types as Record<string, unknown>).EIP712Domain;
          return wallet.signTypedData(domain, types, message);
        }
        case "eth_sendTransaction": {
          const p = (params as Array<Record<string, string>>)[0];
          const sent = await wallet.sendTransaction({
            to: p.to,
            data: p.data,
            value: p.value ?? undefined,
          });
          return sent.hash;
        }
        default:
          return provider.send(method, params as unknown[]);
      }
    }
  );

  await context.addInitScript(
    ([addr, chainId]: readonly [string, string]) => {
      const listeners: Record<string, Array<(...a: unknown[]) => void>> = {};
      const ethereum = {
        isMetaMask: true,
        __isE2EShim: true,
        _metamask: { isUnlocked: () => Promise.resolve(true) },
        chainId,
        networkVersion: String(parseInt(chainId, 16)),
        selectedAddress: addr,
        isConnected: () => true,
        request: (args: { method: string; params?: unknown[] }) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__walletRequest(args.method, args.params ?? []),
        enable: () =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__walletRequest("eth_requestAccounts", []),
        on: (event: string, cb: (...a: unknown[]) => void) => {
          (listeners[event] ||= []).push(cb);
          return ethereum;
        },
        removeListener: (event: string, cb: (...a: unknown[]) => void) => {
          listeners[event] = (listeners[event] || []).filter((f) => f !== cb);
          return ethereum;
        },
        removeAllListeners: () => {
          for (const k of Object.keys(listeners)) delete listeners[k];
          return ethereum;
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).ethereum = ethereum;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).ethereum.providers = [ethereum];

      // EIP-6963 provider discovery. MetaMask SDK >=0.14 finds the wallet by
      // listening for an `eip6963:announceProvider` event rather than reading
      // window.ethereum directly; without this, sdk.connect() hangs forever.
      const info = {
        uuid: "00000000-0000-4000-8000-000000000000",
        name: "MetaMask",
        icon: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
        rdns: "io.metamask",
      };
      const announce = () => {
        window.dispatchEvent(
          new CustomEvent("eip6963:announceProvider", {
            detail: Object.freeze({ info, provider: ethereum }),
          })
        );
      };
      window.addEventListener("eip6963:requestProvider", announce);
      announce();
    },
    [account.address, CHAIN_ID_HEX] as const
  );
}

/**
 * Sign in via the SIWE flow with the injected wallet. Waits for hydration before
 * clicking (Next 13 attaches the onClick handler after first paint), then waits for
 * the redirect away from /auth/login.
 */
export async function login(page: Page) {
  await page.goto("/auth/login", { waitUntil: "networkidle" });
  // Ensure React has hydrated and bound the click handler.
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /sign in with metamask/i }).click();
  await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 30_000 });
  await expectAuthed(page);
}

/**
 * Wait until the app considers the session authenticated. The axios interceptor
 * reads `auth.jwt` from the redux-persist store, which rehydrates asynchronously on
 * every fresh page load — on slow runners a form can submit before the token is
 * attached (a 401, no redirect). The navbar only renders the "Seller" link when
 * `auth.isLoggedIn` is true, so it's a reliable "token is live" signal. Call this
 * after any full navigation before performing an authenticated action.
 */
export async function expectAuthed(page: Page) {
  await expect(page.getByRole("link", { name: /^Seller$/ })).toBeVisible({ timeout: 30_000 });
}

/** Mine `seconds` of chain time so escrow release windows can elapse in-test. */
export async function increaseTime(seconds: number) {
  await provider.send("evm_increaseTime", [seconds]);
  await provider.send("evm_mine", []);
}
