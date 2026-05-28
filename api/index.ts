import { CONFIG } from "@/config/config";
import axios from "axios";
import store from "@/redux/store";

const backendAxiosInstance = axios.create({
    baseURL: CONFIG.BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*, next-cursor, Origin, Content-Type, Accept, Authorization, X-Request-With",
        "Access-Control-Expose-Headers": "next-cursor, Origin, Content-Type, Accept, Authorization, X-Request-With",
    },
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
import { _getMe, _updateUser, _getNonce, _verifySIWE, _refreshToken, _loginUser, _registerUser } from "./services/users";
import { ORDER_FILTERS, _getOrders, _getProducts, _createProduct, _updateProduct, _deleteProduct, _createOrders } from "./services/products";
import { _getStores, _getStore, _getUserStores, _createStore, _deleteStore } from "./services/stores";
import { _getDisputes, _getDisputeByOrderID, _getEvidence, _createDispute, _closeDispute } from "./services/disputes";

const usersService = {
    getMe: _getMe,
    updateUser: _updateUser,
    getNonce: _getNonce,
    verifySIWE: _verifySIWE,
    refreshToken: _refreshToken,
    loginUser: _loginUser,
    registerUser: _registerUser,
};

const productsService = {
    getProducts: _getProducts,
    getOrders: _getOrders,
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
    createDispute: _createDispute,
    closeDispute: _closeDispute,
};

export { usersService, productsService, storesService, disputesService, ORDER_FILTERS };

export default backendAxiosInstance;
