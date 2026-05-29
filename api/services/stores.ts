import { AxiosResponse } from "axios";
import backendAxiosInstance from "..";
import { IStore } from "../interfaces/stores";

export const _getStores = async (): Promise<AxiosResponse<IStore[]>> =>
    backendAxiosInstance.get("/api/stores");

export const _getStore = async (id: string): Promise<AxiosResponse<IStore>> =>
    backendAxiosInstance.get(`/api/stores/${id}`);

export const _getUserStores = async (): Promise<AxiosResponse<IStore[]>> =>
    backendAxiosInstance.get("/api/stores/user");

export const _createStore = async (name: string): Promise<AxiosResponse<IStore>> =>
    backendAxiosInstance.post("/api/stores", { Name: name });

export const _deleteStore = async (id: string): Promise<AxiosResponse> =>
    backendAxiosInstance.delete(`/api/stores/${id}`);
