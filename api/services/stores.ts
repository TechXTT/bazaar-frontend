import { AxiosResponse } from "axios";
import backendAxiosInstance from "..";
import { IStore } from "../interfaces/stores";

export const _getStores = async (): Promise<AxiosResponse<IStore[]>> => {
    try {
        return await backendAxiosInstance.get("/api/stores");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const _getStore = async (id: string): Promise<AxiosResponse<IStore>> => {
    try {
        return await backendAxiosInstance.get(`/api/stores/${id}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Accepts optional token for backward compatibility (ignored — interceptor handles auth)
export const _getUserStores = async (_token?: string | null): Promise<AxiosResponse<IStore[]>> => {
    try {
        return await backendAxiosInstance.get("/api/stores/user");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Accepts name as lowercase or uppercase, plus optional token for backward compatibility
export const _createStore = async (
    data: { name?: string; Name?: string },
    _token?: string | null
): Promise<AxiosResponse<IStore>> => {
    try {
        const body = { Name: data.Name || data.name };
        return await backendAxiosInstance.post("/api/stores", body);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const _deleteStore = async (
    id: string,
    _token?: string | null
): Promise<AxiosResponse> => {
    try {
        return await backendAxiosInstance.delete(`/api/stores/${id}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};
