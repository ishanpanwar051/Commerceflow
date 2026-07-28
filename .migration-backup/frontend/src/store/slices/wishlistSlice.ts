import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '@/services/wishlist.service';
import type { WishlistItem } from '@/types/api';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async () => {
  return await wishlistService.getWishlist();
});

export const addToWishlist = createAsyncThunk('wishlist/addToWishlist', async (productId: string) => {
  return await wishlistService.addItem(productId);
});

export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', async (productId: string) => {
  await wishlistService.removeItem(productId);
  return productId;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchWishlist.rejected, (state) => { state.isLoading = false; })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const exists = state.items.find(i => i.productId === action.payload.productId);
        if (!exists) state.items.unshift(action.payload);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.productId !== action.payload);
      });
  },
});

export default wishlistSlice.reducer;
