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
import { _getOrders, _getProducts, _createProduct } from "./services/products";
import { _getUserStores, _createStore } from "./services/stores";

const usersService = {
    getMe: _getMe,
    registerUser: _registerUser,
    loginUser: _loginUser
};

const productsService = {
    getProducts: _getProducts, 
    getOrders: _getOrders,
    createProduct: _createProduct
};

const storesService = {
    getUserStores: _getUserStores,
    createStore: _createStore
};

export { usersService, productsService, storesService };

export default backendAxiosInstance;