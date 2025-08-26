'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

// --- Type Definitions ---

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  features: string[] | null;
  category: string | null;
  interval: string | null;
  interval_count: number | null;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

interface GuestCartContextType extends CartState {
  isLoading: boolean;
  isAddingToCart: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  syncWithServerCart: () => Promise<void>;
}

// --- Context Initialization ---

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined);

// --- Local Storage Keys ---

const GUEST_CART_KEY = 'guest_cart';

// --- Cart Provider Component ---

interface GuestCartProviderProps {
  children: ReactNode;
}

export const GuestCartProvider = ({ children }: GuestCartProviderProps) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartState>({ items: [], subtotal: 0, tax: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage();
    calculateTotals();
  }, [cart.items]);

  const loadCartFromStorage = () => {
    try {
      const storedCart = localStorage.getItem(GUEST_CART_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCartToStorage = () => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 0; // No tax for guest cart
    const total = subtotal + tax;
    
    setCart(prev => ({ ...prev, subtotal, tax, total }));
  };

  const handleCartUpdate = (successMessage: string) => {
    toast({ title: 'Success', description: successMessage });
  };

  const handleError = (defaultMessage: string) => {
    toast({ title: 'Error', description: defaultMessage, variant: 'destructive' });
  };

  // --- Cart Actions ---

  const addToCart = async (product: Product, quantity: number = 1) => {
    setIsAddingToCart(product.id);
    try {
      setCart(prevCart => {
        const existingItemIndex = prevCart.items.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...prevCart.items];
          updatedItems[existingItemIndex].quantity += quantity;
          return { ...prevCart, items: updatedItems };
        } else {
          // Add new item
          const newItem: CartItem = { ...product, quantity };
          return { ...prevCart, items: [...prevCart.items, newItem] };
        }
      });
      
      handleCartUpdate('Item added to cart!');
    } catch (error) {
      handleError('Failed to add item to cart.');
    } finally {
      setIsAddingToCart(null);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      }));
      
      handleCartUpdate('Cart updated.');
    } catch (error) {
      handleError('Failed to update cart.');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.id !== productId)
      }));
      
      handleCartUpdate('Item removed from cart.');
    } catch (error) {
      handleError('Failed to remove item.');
    }
  };

  const clearCart = async () => {
    try {
      setCart({ items: [], subtotal: 0, tax: 0, total: 0 });
      localStorage.removeItem(GUEST_CART_KEY);
      handleCartUpdate('Cart cleared.');
    } catch (error) {
      handleError('Failed to clear cart.');
    }
  };

  const refreshCart = async () => {
    loadCartFromStorage();
  };

  const syncWithServerCart = async () => {
    // This function will be called when a user logs in to sync guest cart with server cart
    try {
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      if (guestCart) {
        const parsedCart = JSON.parse(guestCart);
        // Here you would typically send the guest cart items to the server
        // and merge them with the user's existing cart
        console.log('Syncing guest cart with server:', parsedCart);
      }
    } catch (error) {
      console.error('Failed to sync guest cart:', error);
    }
  };

  const value = {
    ...cart,
    isLoading,
    isAddingToCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    syncWithServerCart,
  };

  return <GuestCartContext.Provider value={value}>{children}</GuestCartContext.Provider>;
};

// --- Custom Hook ---

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (context === undefined) {
    throw new Error('useGuestCart must be used within a GuestCartProvider');
  }
  return context;
}; 