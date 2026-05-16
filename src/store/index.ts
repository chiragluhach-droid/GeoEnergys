import { configureStore } from "@reduxjs/toolkit";
import { tradeApi } from "./tradeApi";

export const store = configureStore({
  reducer: {
    [tradeApi.reducerPath]: tradeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tradeApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
