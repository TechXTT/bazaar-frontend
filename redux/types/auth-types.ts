import { PayloadAction } from "@reduxjs/toolkit";
import { ICart, IUser } from "@/api/interfaces/users";

export interface AuthState {
  isLoggedIn: boolean;
  user: IUser | null;
  cart: ICart;
  jwt: string | null;
  /**
   * FE-11: false until redux-persist has rehydrated and auth bootstrap has run.
   * Protected routes must wait for this before deciding to redirect, so a refresh
   * doesn't flash content / redirect a genuinely logged-in user. Not persisted.
   */
  bootstrapped: boolean;
}

export type IUserPayload = PayloadAction<IUser | null>;

export type ICartPayload = PayloadAction<ICart>;
