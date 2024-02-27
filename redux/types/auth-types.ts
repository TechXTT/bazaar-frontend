import { ICart, IUser } from "@/api/interfaces/users";

export interface AuthState {
  isLoggedIn: boolean;
  user: IUser | null;
  cart: ICart;
  jwt: string | null;
}

export type IUserPayload = {
  payload: IUser | null;
};

export type ICartPayload = {
  payload: {
    products: {
      product: any;
      quantity: number;
    }[];
    total: number;
  };
};
