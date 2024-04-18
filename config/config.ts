const BACKEND_URL: string = process.env.NEXT_PUBLIC_BACKEND_URL ? process.env.NEXT_PUBLIC_BACKEND_URL : 'http://localhost:8000';
const CURRENT_URL: string = process.env.NEXT_PUBLIC_CURRENT_URL ? process.env.NEXT_PUBLIC_CURRENT_URL : 'http://localhost:3000';
const PUBLIC_KEY: string = process.env.NEXT_PUBLIC_PUBLIC_KEY ? process.env.NEXT_PUBLIC_PUBLIC_KEY : '-----BEGIN PUBLIC KEY-----\n';
const CONTRACT_ADDRESS: string = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS : '0x0';
const ALGOLIA_APP_ID: string = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? process.env.NEXT_PUBLIC_ALGOLIA_APP_ID : '0';
const ALGOLIA_API_KEY: string = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ? process.env.NEXT_PUBLIC_ALGOLIA_API_KEY : '0';

export const CONFIG = {
    BACKEND_URL,
    CURRENT_URL,
    PUBLIC_KEY,
    CONTRACT_ADDRESS,
    ALGOLIA_APP_ID,
    ALGOLIA_API_KEY
};