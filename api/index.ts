import { CONFIG } from "@/config/config";
import axios from "axios";

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

// Users Endpoints
import { _getMe, _loginUser, _registerUser } from "./services/users";
import { _getOrders, _getProducts, _createProduct, _updateProduct, _deleteProduct } from "./services/products";
import { _getUserStores, _createStore, _deleteStore } from "./services/stores";
import { _closeDispute, _createDispute, _getDisputeByOrderID } from "./services/disputes";

const usersService = {
    getMe: _getMe,
    registerUser: _registerUser,
    loginUser: _loginUser
};

const productsService = {
    getProducts: _getProducts, 
    getOrders: _getOrders,
    createProduct: _createProduct,
    updateProduct: _updateProduct,
    deleteProduct: _deleteProduct
};

const storesService = {
    getUserStores: _getUserStores,
    createStore: _createStore,
    deleteStore: _deleteStore
};

const disputesService = {
    createDispute: _createDispute,
    getDisputeByOrderID: _getDisputeByOrderID,
    closeDispute: _closeDispute
};

export { usersService, productsService, storesService, disputesService };

export default backendAxiosInstance;