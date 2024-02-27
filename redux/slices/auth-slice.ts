import { createSlice } from "@reduxjs/toolkit";

import { AuthState, ICartPayload, IUserPayload } from "../types/auth-types";
import { IUser } from "@/api/interfaces/users";

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  cart: { products: [], total: 0 },
  jwt: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state: AuthState, action: any) => {
      state.isLoggedIn = true;
      state.jwt = action.payload;
    },  
    logout: (state: AuthState) => {
      state.isLoggedIn = false;
      state.user = null;
      state.jwt = null;
    },
    setUser: (state: AuthState, action: IUserPayload) => {
      state.user = action.payload;
    },
    addItemsToCart: (state: AuthState, action: ICartPayload) => {
      state.cart = action.payload;
    },
    clearCart: (state: AuthState) => {
      state.cart = { products: [], total: 0 };
    },
  },
});

export const { login, logout, setUser, addItemsToCart, clearCart } = authSlice.actions;

export default authSlice.reducer;
