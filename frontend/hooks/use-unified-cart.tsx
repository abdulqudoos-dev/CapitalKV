'use client';

import { useContext } from 'react';
import { useCart } from '@/context/CartContext';
import { useGuestCart } from '@/context/GuestCartContext';
import AuthContext from '@/contexts/AuthContext';

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

interface UnifiedCartReturn {
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  isLoading: boolean;
  isAddingToCart: string | null;
  isAuthenticated: boolean;
  addToCart: (productOrId: Product | string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<string | null>;
  refreshCart: () => Promise<void>;
  syncGuestCart?: () => Promise<void>;
}

export const useUnifiedCart = (): UnifiedCartReturn => {
  const { user } = useContext(AuthContext);
  const authenticatedCart = useCart();
  const guestCart = useGuestCart();

  // If user is logged in, use authenticated cart, otherwise use guest cart
  const isAuthenticated = !!user;
  
  if (isAuthenticated) {
    return {
      ...authenticatedCart,
      isAuthenticated: true,
      // Override addToCart to handle the different interface
      addToCart: async (productOrId: Product | string, quantity: number = 1) => {
        if (typeof productOrId === 'string') {
          await authenticatedCart.addToCart(productOrId, quantity);
        } else {
          await authenticatedCart.addToCart(productOrId.id, quantity);
        }
      },
      // Add a method to sync guest cart when user logs in
      syncGuestCart: async () => {
        try {
          const guestCartData = localStorage.getItem('guest_cart');
          if (guestCartData) {
            const parsedCart = JSON.parse(guestCartData);
            // Add each guest cart item to the authenticated cart
            for (const item of parsedCart.items) {
              await authenticatedCart.addToCart(item.id, item.quantity);
            }
            // Clear guest cart after successful sync
            localStorage.removeItem('guest_cart');
            // Refresh the cart to show synced items
            await authenticatedCart.refreshCart();
          }
        } catch (error) {
          console.error('Failed to sync guest cart:', error);
        }
      }
    };
  } else {
    return {
      ...guestCart,
      isAuthenticated: false,
      // Override addToCart to handle the different interface
      addToCart: async (productOrId: Product | string, quantity: number = 1) => {
        if (typeof productOrId === 'string') {
          // For guest cart, we need the full product object
          console.warn('Guest cart requires full product object, not just ID');
          return;
        } else {
          await guestCart.addToCart(productOrId, quantity);
        }
      },
      // For guest cart, checkout should redirect to login
      checkout: async () => {
        // Store current URL to redirect back after login
        const currentUrl = window.location.href;
        localStorage.setItem('returnUrl', currentUrl);
        window.location.href = '/auth/login?redirect=checkout';
        return null;
      }
    };
  }
}; 