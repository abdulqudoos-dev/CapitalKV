// frontend/context/CartContext.tsx

"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { useUser } from "@/hooks/use-user";

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

interface CartContextType extends CartState {
  isLoading: boolean;
  isAddingToCart: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>; // Not implemented in backend yet, but good to have
  checkout: () => Promise<string | null>;
  refreshCart: () => Promise<void>;
}

// --- Context Initialization ---

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Cart Provider Component ---

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { toast } = useToast();
  const { user, loading } = useUser();
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  // Fetch initial cart state only when user is authenticated
  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, tax: 0, total: 0 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get("/ecommerce/cart");
      if (response.status === 200) {
        setCart(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      // Don't show a toast on initial load failure, as it might be for logged-out users
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart when user authentication state changes
  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleCartUpdate = (updatedCart: CartState, successMessage: string) => {
    setCart(updatedCart);
    toast({ title: "Success", description: successMessage });
  };

  const handleError = (error: any, defaultMessage: string) => {
    const description = error.response?.data?.detail || defaultMessage;
    toast({ title: "Error", description, variant: "destructive" });
  };

  // --- Cart Actions ---

  const addToCart = async (productId: string, quantity: number = 1) => {
    console.log("Adding to cart:", productId, quantity, user);
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(productId);
    try {
      const response = await api.post("/ecommerce/cart/items", {
        product_id: productId,
        quantity,
        userId: user.id,
      });
      if (response.status === 200) {
        handleCartUpdate(response.data, "Item added to cart!");
      }
    } catch (error) {
      handleError(error, "Failed to add item to cart.");
    } finally {
      setIsAddingToCart(null);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity < 0) return;
    try {
      const response = await api.put(`/ecommerce/cart/items/${productId}`, {
        quantity,
      });
      if (response.status === 200) {
        handleCartUpdate(response.data, "Cart updated.");
      }
    } catch (error) {
      handleError(error, "Failed to update cart.");
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      const response = await api.delete(`/ecommerce/cart/items/${productId}`);
      if (response.status === 200) {
        handleCartUpdate(response.data, "Item removed from cart.");
      }
    } catch (error) {
      handleError(error, "Failed to remove item.");
    }
  };

  const clearCart = async () => {
    // Backend endpoint for this doesn't exist yet, but here's the frontend logic
    console.log("Clearing cart - backend endpoint needed");
    toast({
      title: "Info",
      description: "Clear cart functionality not yet implemented.",
    });
  };

  const checkout = async (): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to checkout.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await api.post("/ecommerce/cart/checkout");
      if (response.status === 200 && response.data.checkout_url) {
        return response.data.checkout_url;
      }
      return null;
    } catch (error) {
      handleError(error, "Failed to create checkout session.");
      return null;
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
    checkout,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// --- Custom Hook ---

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
