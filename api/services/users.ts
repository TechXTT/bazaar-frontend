import { AxiosResponse } from "axios";
import { IRegisterUser, IUser } from "../interfaces/users";
import backendAxiosInstance from "..";

export const _getMe = async (token: string): Promise<AxiosResponse<IUser>> => {
    try {
        return await backendAxiosInstance.get("/api/users/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const _registerUser = async (user: IRegisterUser): Promise<AxiosResponse<IUser>> => {
    try {
        return await backendAxiosInstance.post("/api/users", user);
    } catch (error) {
        console.error(error);
        throw error;
    }
}