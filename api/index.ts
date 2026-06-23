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

backendAxiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            store.dispatch(logoutAction());
        }
        return Promise.reject(err);
    }
);

// Users Endpoints
import { _getMe, _updateUser, _getNonce, _verifySIWE, _refreshToken, _logout } from "./services/users";

// FE-4: the JWT is held in memory only and is not persisted. After a reload a
// previously-authenticated session rehydrates with `isLoggedIn: true` but no token,
// so we re-mint it from the backend's httpOnly refresh cookie. Called once after
// redux-persist finishes rehydrating (see ReduxProvider). FE-11: always flips the
// `bootstrapped` flag so protected routes can stop waiting and evaluate auth.
export async function bootstrapAuth(): Promise<void> {
    const state = store.getState();
    try {
        if (state.auth?.isLoggedIn && !state.auth?.jwt) {
            const res = await _refreshToken();
            const token = res.data?.token;
            if (token) store.dispatch(login(token));
            else store.dispatch(logoutAction());
        }
    } catch {
        store.dispatch(logoutAction());
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
