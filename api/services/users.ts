import { AxiosResponse } from "axios";
import { IUser, UserReq } from "../interfaces/users";
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

// The refresh token travels in the httpOnly cookie (withCredentials), so no body
// is sent; the backend rotates the cookie and returns a fresh access token.
export const _refreshToken = async (): Promise<AxiosResponse<{ token: string }>> =>
    backendAxiosInstance.post("/api/auth/refresh");

// Denylists the refresh token server-side and clears the httpOnly cookie.
export const _logout = async (): Promise<AxiosResponse<void>> =>
    backendAxiosInstance.post("/api/auth/logout");
