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

const usersService = {
    getMe: _getMe,
    registerUser: _registerUser,
    loginUser: _loginUser,
};

export { usersService };

export default backendAxiosInstance;