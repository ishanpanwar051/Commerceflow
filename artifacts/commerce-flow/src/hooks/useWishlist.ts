
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';

export function useWishlist() {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.wishlist);

  const loadWishlist = useCallback(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const addItem = useCallback((productId: string) => {
    return dispatch(addToWishlist(productId)).unwrap();
  }, [dispatch]);

  const removeItem = useCallback((productId: string) => {
    return dispatch(removeFromWishlist(productId)).unwrap();
  }, [dispatch]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some((i) => i.productId === productId);
  }, [items]);

  return { items, isLoading, loadWishlist, addItem, removeItem, isInWishlist };
}
