import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { useGoldPrice } from './GoldPriceContext';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalWeightGrams: number;
  totalPriceTomans: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number, selectedWeight?: number) => void;
  removeFromCart: (productId: string, selectedWeight?: number) => void;
  updateQuantity: (productId: string, quantity: number, selectedWeight?: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = 'meyvan_cart_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { calculatePrice } = useGoldPrice();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, selectedWeight?: number) => {
    const isCustom = selectedWeight !== undefined && selectedWeight > 0 && selectedWeight !== product.weightGrams;
    const targetWeight = selectedWeight && selectedWeight > 0 ? selectedWeight : product.weightGrams;

    setItems((prev) => {
      // Find if an item with the same product ID and exact same weight exists
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && (item.selectedWeight || item.product.weightGrams) === targetWeight
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        const current = next[existingIdx];
        next[existingIdx] = {
          ...current,
          quantity: Math.min(current.quantity + quantity, product.stock || 10)
        };
        return next;
      }

      return [
        ...prev,
        {
          product,
          quantity: Math.min(quantity, product.stock || 10),
          selectedWeight: targetWeight,
          isCustomWeight: isCustom,
          addedAt: Date.now()
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedWeight?: number) => {
    setItems((prev) =>
      prev.filter((item) => {
        if (item.product.id !== productId) return true;
        if (selectedWeight !== undefined) {
          return (item.selectedWeight || item.product.weightGrams) !== selectedWeight;
        }
        return false;
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedWeight?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedWeight);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        const matchesProduct = item.product.id === productId;
        const matchesWeight = selectedWeight === undefined || (item.selectedWeight || item.product.weightGrams) === selectedWeight;
        if (matchesProduct && matchesWeight) {
          return { ...item, quantity: Math.min(quantity, item.product.stock || 10) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalWeightGrams = Number(
    items
      .reduce((sum, item) => sum + (item.selectedWeight || item.product.weightGrams) * item.quantity, 0)
      .toFixed(2)
  );

  const totalPriceTomans = items.reduce((sum, item) => {
    const breakdown = calculatePrice(item.product, undefined, item.selectedWeight);
    return sum + breakdown.totalPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalWeightGrams,
        totalPriceTomans,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};
