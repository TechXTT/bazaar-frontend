import { CONFIG } from "@/config/config";
import axios from "axios";

const backendAxiosInstance = axios.create({
    baseURL: CONFIG.BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
});

// Users Endpoints
import { _getMe, _registerUser } from "./services/users";

const usersService = {
    getMe: _getMe,
    registerUser: _registerUser,
};

export { usersService };

export default backendAxiosInstance;