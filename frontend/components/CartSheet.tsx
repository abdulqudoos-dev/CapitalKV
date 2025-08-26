// frontend/components/CartSheet.tsx

'use client';

import { useUnifiedCart } from '@/hooks/use-unified-cart';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ShoppingBagIcon, Trash2, Loader2, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CartSheet() {
  const { items, subtotal, total, removeFromCart, updateQuantity, checkout, isLoading, refreshCart, isAuthenticated } = useUnifiedCart();
  const { user } = useAuthContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Refresh cart data when sheet opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      refreshCart();
    }
  };

  // Cart data loaded

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      // For guest users, checkout will redirect to login
      await checkout();
      return;
    }

    setIsCheckingOut(true);
    const checkoutUrl = await checkout();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      // Error is already handled by a toast in the context
      setIsCheckingOut(false);
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBagIcon className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="relative h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image_url || '/placeholder.svg'}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      ${item.price.toFixed(2)} each
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFromCart(item.id)}
                      className="h-6 w-6 mt-1"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="mt-auto pt-4 border-t">
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {!isAuthenticated && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    Sign in to complete your purchase
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.href = '/auth/login'}
                      className="flex-1"
                    >
                      <LogIn className="mr-2 h-3 w-3" />
                      Sign In
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => window.location.href = '/auth/register'}
                      className="flex-1"
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              )}
              
              <Button className="w-full mt-4" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAuthenticated ? "Proceed to Checkout" : "Sign In to Checkout"}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
