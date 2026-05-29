import { AxiosResponse } from "axios";
import { ILoginUser, IRegisterUser, IUser, UserReq } from "../interfaces/users";
import backendAxiosInstance from "..";

export const _getMe = async (): Promise<AxiosResponse<IUser>> =>
    backendAxiosInstance.get("/api/users/me");

export const _updateUser = async (user: UserReq): Promise<AxiosResponse<IUser>> =>
    backendAxiosInstance.put("/api/users", user);

export const _getNonce = async (walletAddress: string): Promise<AxiosResponse<{ nonce: string }>> =>
    backendAxiosInstance.post("/api/auth/nonce", { walletAddress });

export const _verifySIWE = async (
    message: string,
    signature: string
): Promise<AxiosResponse<{ token: string; user: IUser }>> =>
    backendAxiosInstance.post("/api/auth/verify", { message, signature });

export const _refreshToken = async (): Promise<AxiosResponse<{ token: string }>> =>
    backendAxiosInstance.post("/api/users/refresh");

export const _registerUser = async (user: IRegisterUser): Promise<AxiosResponse<IUser>> =>
    backendAxiosInstance.post("/api/users", user);

export const _loginUser = async (user: ILoginUser): Promise<AxiosResponse<any>> =>
    backendAxiosInstance.post("/api/users/login", user);
