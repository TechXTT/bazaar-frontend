const BACKEND_URL: string = process.env.NEXT_PUBLIC_BACKEND_URL ? process.env.NEXT_PUBLIC_BACKEND_URL : 'http://localhost:8000';
const CURRENT_URL: string = process.env.NEXT_PUBLIC_CURRENT_URL ? process.env.NEXT_PUBLIC_CURRENT_URL : 'http://localhost:3000';
const PUBLIC_KEY: string = process.env.NEXT_PUBLIC_PUBLIC_KEY ? process.env.NEXT_PUBLIC_PUBLIC_KEY : '-----BEGIN PUBLIC KEY-----\n';
const CONTRACT_ADDRESS: string = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS : '0x0';
const ESCROW_RELEASE_DAYS: number = process.env.NEXT_PUBLIC_ESCROW_RELEASE_DAYS ? Number(process.env.NEXT_PUBLIC_ESCROW_RELEASE_DAYS) : 14;
const CHAIN_ID: string = process.env.NEXT_PUBLIC_CHAIN_ID ? process.env.NEXT_PUBLIC_CHAIN_ID : '0xaa36a7';
const CHAIN_NAME: string = process.env.NEXT_PUBLIC_CHAIN_NAME ? process.env.NEXT_PUBLIC_CHAIN_NAME : 'Sepolia';
const RPC_URL: string = process.env.NEXT_PUBLIC_RPC_URL ? process.env.NEXT_PUBLIC_RPC_URL : 'http://localhost:8545';
const CDN_BASE_URL: string = process.env.NEXT_PUBLIC_CDN_BASE_URL ? process.env.NEXT_PUBLIC_CDN_BASE_URL : 'https://bucket-for-bazaar.fra1.cdn.digitaloceanspaces.com';
const ETHERSCAN_TX_BASE_URL: string = process.env.NEXT_PUBLIC_ETHERSCAN_TX_BASE_URL ? process.env.NEXT_PUBLIC_ETHERSCAN_TX_BASE_URL : 'https://sepolia.etherscan.io/tx';
// Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e  Base mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
const USDC_ADDRESS: string = process.env.NEXT_PUBLIC_USDC_ADDRESS ?? '';
const KLEROS_COURT_URL: string = process.env.NEXT_PUBLIC_KLEROS_COURT_URL ?? 'https://resolve.kleros.io';
const IPFS_GATEWAY: string = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? 'https://ipfs.io';
const ALGOLIA_APP_ID: string = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '';
const ALGOLIA_SEARCH_KEY: string = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ?? '';
const ALGOLIA_INDEX: string = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX ?? 'products';

export const CONFIG = {
    BACKEND_URL,
    CURRENT_URL,
    PUBLIC_KEY,
    CONTRACT_ADDRESS,
    ESCROW_RELEASE_DAYS,
    CHAIN_ID,
    CHAIN_NAME,
    RPC_URL,
    CDN_BASE_URL,
    ETHERSCAN_TX_BASE_URL,
    USDC_ADDRESS,
    KLEROS_COURT_URL,
    IPFS_GATEWAY,
    ALGOLIA_APP_ID,
    ALGOLIA_SEARCH_KEY,
    ALGOLIA_INDEX,
};
