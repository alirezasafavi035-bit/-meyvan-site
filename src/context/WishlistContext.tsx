import React, { createContext, useContext, useEffect, useState } from 'react';

interface WishlistContextValue {
  wishlistIds: string[];
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const WISHLIST_KEY = 'meyvan_wishlist_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }, [wishlistIds]);

  const isInWishlist = (id: string) => wishlistIds.includes(id);

  const toggleWishlist = (id: string) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        count: wishlistIds.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
};
