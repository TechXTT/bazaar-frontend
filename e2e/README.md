# The Bazaar — end-to-end tests

Playwright tests that drive the **real app** (Next frontend → Go backend → Postgres →
Hardhat chain) through full buyer/seller order interactions: SIWE login, escrowed
checkout, claim, refund, and dispute.

These live in their own workspace (`e2e/`) with their own `package.json`,
`tsconfig.json`, and Playwright install, kept out of the app's TypeScript project so
the two never cross-contaminate.

## How the wallet works (no MetaMask extension needed)

The app is wallet-gated (SIWE `personal_sign`, escrow `eth_sendTransaction`). Driving
the real MetaMask extension headlessly is brittle, so `fixtures/wallet.ts` injects a
thin `window.ethereum` shim that delegates every RPC to a Node-side `ethers.Wallet`
backed by a well-known **Hardhat** key, pointed at the local chain:

- `installWallet(context, account)` — installs the shim (+ EIP-6963 announcement so
  the MetaMask SDK adopts it instead of opening a remote/QR connection).
- Two browser contexts act as distinct actors: **buyer** (Hardhat acct #1) and
  **seller** (acct #2). The escrow contract forbids `buyer == receiver`, so they must
  differ.
- `login(page)` runs the SIWE flow and waits for the post-login redirect (it waits for
  hydration first — Next 13 binds the click handler after first paint).
- Chain helpers: `increaseTime(seconds)` (skip the escrow release window),
  `createEscrowOrder(...)`, `readOrder(...)`, `readDispute(...)`, `escrowAs(account)`.

> The app requires `NEXT_PUBLIC_E2E=true` for the injected wallet to be adopted (it
> forces the MetaMask SDK into `extensionOnly` mode and makes the login page request
> accounts directly). This flag has **no effect** in normal/production use.

## Prerequisites

1. The full stack running locally (frontend :3000, backend :8000, hardhat :8545,
   postgres) — from the repo root:
   ```bash
   NEXT_PUBLIC_E2E=true docker compose up -d
   ```
   The `NEXT_PUBLIC_E2E=true` is required so the frontend container builds with the
   e2e wallet path enabled. (`docker-compose.yml` reads it, defaulting to `false`.)
2. Contracts deployed to the local chain at the address in
   `NEXT_PUBLIC_CONTRACT_ADDRESS` (the compose `contract-deploy` service does this).

## Install & run

```bash
cd bazaar-frontend/e2e
npm install
npx playwright install chromium

npm test                 # headless, all specs
npm run test:headed      # watch it drive the browser
npx playwright test tests/01-login.spec.ts   # a single spec
npm run report           # open the HTML report after a run
```

Config (override via env if your setup differs):

| Var | Default | Meaning |
|-----|---------|---------|
| `E2E_BASE_URL` | `http://localhost:3000` | app under test |
| `E2E_RPC_URL` | `http://localhost:8545` | hardhat node |
| `E2E_CHAIN_ID` | `0x7a69` | 31337 |
| `E2E_CONTRACT_ADDRESS` | local deploy addr | Escrow contract |
| `E2E_BACKEND_URL` | `http://localhost:8000` | Go backend |

## What's covered

| Spec | Flow |
|------|------|
| `01-login` | Buyer signs in via SIWE with the injected wallet (smoke test for the whole approach). |
| `02-order-lifecycle` | Seller lists a store + product (UI) → buyer adds to cart + checks out, escrowing funds on-chain (UI) → order persists in DB → time-skip past the release window → seller claims, asserting payout = amount − 2% fee at the contract level. |
| `03-dispute-refund` | Receiver refunds the buyer in full with no fee; buyer raises a dispute and the order enters `fee_pending` with the fee deposit recorded (the dispute-row regression we fixed). |

## Notes & known limitations

- **Tests run serially** (`workers: 1`, `fullyParallel: false`): they mutate shared
  chain + DB state. Node-side txs use a cached `NonceManager` per account to avoid
  nonce races.
- **Claim/refund/dispute money-movement is asserted at the contract level**, not
  through the seller-orders UI. The seller "Claim" button is gated on `Date.now()`
  (wall clock) rather than chain time, so `evm_increaseTime` alone won't surface it in
  the browser — a pre-existing UI quirk, noted for follow-up.
- There is **no buyer "release early" / "confirm delivery" UI** (the contract supports
  `releaseOrder`); claims therefore rely on the release window elapsing. Worth adding.
- `createEscrowOrder` writes only on-chain (no DB row), so the observer won't index a
  DB dispute row for those orders — the dispute spec asserts on-chain dispute state
  directly. A full DB-row assertion would require routing the order through the UI.
