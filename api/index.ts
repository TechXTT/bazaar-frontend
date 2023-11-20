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
import { _getMe } from "./services/users";

const usersService = {
    getMe: _getMe
};

export { usersService };

export default backendAxiosInstance;