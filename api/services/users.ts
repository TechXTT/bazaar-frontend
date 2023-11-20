import { AxiosResponse } from "axios";
import { IUser } from "../interfaces/users";
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
