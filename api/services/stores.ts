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
}

export const _getStore = async (id: string): Promise<AxiosResponse<IStore>> => {
    try {
        return await backendAxiosInstance.get(`/api/stores/${id}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const _createStore = async (store: {name: string}) => {
    try {
        return await backendAxiosInstance.post("/api/stores", store);
    } catch (error) {
        console.error(error);
        throw error;
    }
}