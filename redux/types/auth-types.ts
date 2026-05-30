import { PayloadAction } from "@reduxjs/toolkit";
import { ICart, IUser } from "@/api/interfaces/users";

export interface AuthState {
  isLoggedIn: boolean;
  user: IUser | null;
  cart: ICart;
  jwt: string | null;
}

export type IUserPayload = PayloadAction<IUser | null>;

export type ICartPayload = PayloadAction<ICart>;
