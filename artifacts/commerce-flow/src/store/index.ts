import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
