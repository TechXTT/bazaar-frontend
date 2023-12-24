const BACKEND_URL: string = process.env.BACKEND_URL ? process.env.BACKEND_URL : 'http://localhost:8000';
const PUBLIC_KEY: string = process.env.PUBLIC_KEY ? process.env.PUBLIC_KEY : '-----BEGIN PUBLIC KEY-----\n';

export const CONFIG = {
    BACKEND_URL,
    PUBLIC_KEY,
};