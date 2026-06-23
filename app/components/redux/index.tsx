"use client";
import store from "@/redux/store";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { bootstrapAuth } from "@/api";

// FE-11: gate the app behind redux-persist rehydration so protected routes never
// evaluate auth (and redirect) before the persisted session is restored. Once
// rehydration completes we run auth bootstrap (FE-4: re-mint the in-memory JWT from
// the refresh cookie) which also flips the `bootstrapped` flag.
const persistor = persistStore(store, undefined, () => {
  void bootstrapAuth();
});

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
