"use client";
import store from "@/redux/store";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { bootstrapAuth } from "@/api";

// Persist the store, then once rehydration completes, restore the in-memory JWT.
// FE-4: the token is no longer persisted to localStorage, so on a fresh load a
// previously-logged-in session has `isLoggedIn: true` but `jwt: null`. We ask the
// backend to re-mint it from the httpOnly refresh cookie. On failure the 401
// interceptor logs the user out.
persistStore(store, undefined, () => {
  void bootstrapAuth();
});

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
