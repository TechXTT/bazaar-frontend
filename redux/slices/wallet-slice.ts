import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type WalletStatus = "idle" | "connecting" | "connected" | "error";

export interface WalletState {
  account: string;
  chainId: string | null;
  status: WalletStatus;
  error: string | null;
}

const initialState: WalletState = {
  account: "",
  chainId: null,
  status: "idle",
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<string>) => {
      state.account = action.payload;
    },
    setChainId: (state, action: PayloadAction<string | null>) => {
      state.chainId = action.payload;
    },
    setStatus: (state, action: PayloadAction<WalletStatus>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.status = "error";
      }
    },
    clearError: (state) => {
      state.error = null;
      if (state.account) {
        state.status = "connected";
      } else if (state.status === "error") {
        state.status = "idle";
      }
    },
    disconnect: () => initialState,
  },
});

export const walletActions = walletSlice.actions;

export default walletSlice.reducer;
