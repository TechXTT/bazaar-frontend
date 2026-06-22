import {
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import type { PersistConfig } from "redux-persist";
import type { WebStorage } from "redux-persist/es/types";
import authReducer from "./slices/auth-slice";
import type { AuthState } from "./types/auth-types";
import walletReducer from "./slices/wallet-slice";
import { configureStore } from "@reduxjs/toolkit";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import { useDispatch } from "react-redux";

// SSR-safe fallback storage: redux-persist's WebStorage touches `localStorage`,
// which is undefined on the server, so we hand it a no-op implementation there.
const createNoopStorage = (): WebStorage => ({
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
});

const storage: WebStorage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

// FE-4: never persist the bearer JWT to localStorage (XSS token theft). The token
// is kept in memory only; on a fresh load the refresh flow re-mints it from the
// backend's httpOnly refresh cookie. This transform strips `jwt` on the way OUT to
// storage (it stays in the live store) and forces it back to null on the way IN.
const stripJwtTransform = createTransform<AuthState, AuthState>(
  (inboundState) => ({ ...inboundState, jwt: null }),
  (outboundState) => ({ ...outboundState, jwt: null })
);

const persistConfig: PersistConfig<AuthState> = {
  key: "auth",
  storage,
  transforms: [stripJwtTransform],
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer,
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches actions carrying non-serializable internals.
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
