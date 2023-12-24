import { ICart, IUser } from "@/api/interfaces/users";

export interface AuthState {
  isLoggedIn: boolean;
  user: IUser | null;
  cart: ICart;
  loading: boolean;
  error: string | null;
  jwt: string | null;
}
