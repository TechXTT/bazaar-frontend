import { AxiosResponse } from "axios";
import { ILoginUser, IRegisterUser, IUser } from "../interfaces/users";
import backendAxiosInstance from "..";
import jwt from "jsonwebtoken";

export const _getMe = async (token: string): Promise<AxiosResponse<IUser>> => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) {
      throw new Error("Invalid token");
    }

    // jwt.verify(token, CONFIG.PUBLIC_KEY, { algorithms: ["RS256"] }, (err) => {
    //   if (err) {
    //     throw new Error("Invalid token");
    //   }
    // });

    const res =  await backendAxiosInstance.get("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res;
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