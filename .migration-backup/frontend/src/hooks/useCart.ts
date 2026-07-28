'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/store/slices/cartSlice';

export function useCart() {
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state) => state.cart);

  const loadCart = useCallback(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    return dispatch(addToCart({ productId, quantity })).unwrap();
  }, [dispatch]);

  const updateItem = useCallback((productId: string, quantity: number) => {
    return dispatch(updateCartItem({ productId, quantity })).unwrap();
  }, [dispatch]);

  const removeItem = useCallback((productId: string) => {
    return dispatch(removeCartItem(productId)).unwrap();
  }, [dispatch]);

  const clear = useCallback(() => {
    return dispatch(clearCart()).unwrap();
  }, [dispatch]);

  return {
    cart,
    items: cart?.items || [],
    itemCount: cart?.itemCount || 0,
    subtotal: cart?.subtotal || 0,
    coupon: cart?.coupon,
    discount: cart?.discount,
    isLoading,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  };
}
