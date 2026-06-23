import { CONFIG } from "@/config/config";
import axios from "axios";
import store from "@/redux/store";
import { login, logout as logoutAction, setBootstrapped } from "@/redux/slices/auth-slice";

const backendAxiosInstance = axios.create({
    baseURL: CONFIG.BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // Send the httpOnly refresh cookie on auth requests (FE-4 / BE-16). The
    // backend pins explicit CORS origins with credentials (BE-1), so this is safe.
    withCredentials: true,
});

backendAxiosInstance.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state.auth?.jwt;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Users Endpoints
import { _getMe, _updateUser, _getNonce, _verifySIWE, _refreshToken, _logout } from "./services/users";

// Single-flight token refresh: concurrent 401s share ONE /api/auth/refresh call
// (no refresh stampede / burst-logout), and the failed request is retried once with
// the fresh access token. A transient 401 — e.g. the in-memory JWT gap right after a
// navigation, or an expired access token (BE-16, 1h TTL) — is recovered via the
// httpOnly refresh cookie instead of dropping the session. We only log out if the
// refresh itself fails.
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = _refreshToken()
            .then((res) => res.data?.token ?? null)
            .catch(() => null)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

// Pre-auth endpoints and the refresh/logout calls themselves must NOT trigger a
// refresh-and-retry (retrying the refresh would recurse).
const NO_REFRESH_RETRY = /\/api\/auth\/(nonce|verify|refresh|logout)/;

backendAxiosInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err?.config;
        const status = err?.response?.status;
        if (
            status === 401 &&
            original &&
            !original._retry &&
            !NO_REFRESH_RETRY.test(original.url ?? "")
        ) {
            original._retry = true;
            const token = await refreshAccessToken();
            if (token) {
                store.dispatch(login(token));
                original.headers = original.headers ?? {};
                original.headers.Authorization = `Bearer ${token}`;
                return backendAxiosInstance(original);
            }
            store.dispatch(logoutAction());
        }
        return Promise.reject(err);
    }
);

// FE-4: the JWT is held in memory only and is not persisted. After a reload a
// previously-authenticated session rehydrates with `isLoggedIn: true` but no token,
// so we re-mint it from the backend's httpOnly refresh cookie. Called once after
// redux-persist finishes rehydrating (see ReduxProvider). FE-11: always flips the
// `bootstrapped` flag so protected routes can stop waiting and evaluate auth.
export async function bootstrapAuth(): Promise<void> {
    const state = store.getState();
    try {
        if (state.auth?.isLoggedIn && !state.auth?.jwt) {
            // Share the interceptor's single-flight refresh: the refresh token is
            // single-use/rotating (BE-16), so two concurrent refreshes would
            // invalidate each other.
            const token = await refreshAccessToken();
            if (token) store.dispatch(login(token));
            else store.dispatch(logoutAction());
        }
    } finally {
        store.dispatch(setBootstrapped());
    }
}
import { ORDER_FILTERS, _getOrder, _getProduct, _getAllProducts, _getOrders, _getProducts, _createProduct, _updateProduct, _deleteProduct, _createOrders } from "./services/products";
import { _getStores, _getStore, _getUserStores, _createStore, _deleteStore } from "./services/stores";
import { _getDisputes, _getDisputeByOrderID, _getEvidence } from "./services/disputes";

const usersService = {
    getMe: _getMe,
    updateUser: _updateUser,
    getNonce: _getNonce,
    verifySIWE: _verifySIWE,
    refreshToken: _refreshToken,
    logout: _logout,
};

const productsService = {
    getOrder: _getOrder,
    getProduct: _getProduct,
    getAllProducts: _getAllProducts,
    getProducts: _getProducts,
    getOrders: (filter: string) => _getOrders(filter),
    createProduct: _createProduct,
    updateProduct: _updateProduct,
    deleteProduct: _deleteProduct,
    createOrders: _createOrders,
};

const storesService = {
    getStores: _getStores,
    getStore: _getStore,
    getUserStores: _getUserStores,
    createStore: _createStore,
    deleteStore: _deleteStore,
};

const disputesService = {
    getDisputes: _getDisputes,
    getDisputeByOrderID: _getDisputeByOrderID,
    getEvidence: _getEvidence,
};

export { usersService, productsService, storesService, disputesService, ORDER_FILTERS };

export default backendAxiosInstance;
