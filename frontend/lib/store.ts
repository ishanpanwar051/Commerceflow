import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/slices/authSlice";
import cartReducer from "@/lib/slices/cartSlice";
import uiReducer from "@/lib/slices/uiSlice";
import userReducer from "@/lib/slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
