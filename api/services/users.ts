import { AxiosResponse } from "axios";
import { ILoginUser, IRegisterUser, IUser, UserReq } from "../interfaces/users";
import backendAxiosInstance from "..";

export const _getMe = async (_token?: string | null): Promise<AxiosResponse<IUser>> => {
  try {
    const res = await backendAxiosInstance.get("/api/users/me");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _updateUser = async (
  user: UserReq,
  _token?: string | null
): Promise<AxiosResponse<IUser>> => {
  try {
    const res = await backendAxiosInstance.put("/api/users", user);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _getNonce = async (walletAddress: string): Promise<AxiosResponse<{ nonce: string }>> => {
  try {
    return await backendAxiosInstance.post("/api/auth/nonce", { walletAddress });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _verifySIWE = async (
  message: string,
  signature: string
): Promise<AxiosResponse<{ token: string; user: IUser }>> => {
  try {
    return await backendAxiosInstance.post("/api/auth/verify", { message, signature });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _refreshToken = async (): Promise<AxiosResponse<{ token: string }>> => {
  try {
    return await backendAxiosInstance.post("/api/users/refresh");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _registerUser = async (
  user: IRegisterUser
): Promise<AxiosResponse<IUser>> => {
  try {
    return await backendAxiosInstance.post("/api/users", user);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const _loginUser = async (
  user: ILoginUser
): Promise<AxiosResponse<any>> => {
  try {
    return await backendAxiosInstance.post("/api/users/login", user);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
