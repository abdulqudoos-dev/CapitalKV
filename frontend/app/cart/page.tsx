"use client";

import { useUnifiedCart } from '@/hooks/use-unified-cart';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Loader2, ArrowLeft, ShoppingCart, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { items, subtotal, total, removeFromCart, updateQuantity, checkout, isLoading, refreshCart, isAuthenticated } = useUnifiedCart();
  const { user } = useAuthContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  // Refresh cart data on component mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
      });
      return;
    }

    if (!isAuthenticated) {
      // For guest users, checkout will redirect to login
      await checkout();
      return;
    }

    setIsCheckingOut(true);
    try {
      const checkoutUrl = await checkout();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "An error occurred during checkout. Please try again.",
      });
    } finally {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {items.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
                             <div className="flex items-center gap-4 mb-8">
     <Link href={isAuthenticated ? "/dashboard" : "/"}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
                      <ShoppingCart className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
          </div>


                      <div className="flex items-center gap-4 mb-8">
        </div>

              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground text-center mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link href="/shop">
                <Button>
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="relative h-20 w-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image_url || '/placeholder.svg'}
                          alt={item.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          ${item.price.toFixed(2)} each
                        </p>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFromCart(item.id)}
                          className="mt-2"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(total - subtotal).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!isAuthenticated && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Sign in to complete your purchase and save your cart for later.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.location.href = '/auth/login'}
                          className="flex-1"
                        >
                          <LogIn className="mr-2 h-4 w-4" />
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
                  
                  <Button 
                    className="w-full" 
                    onClick={handleCheckout} 
                    disabled={isCheckingOut || items.length === 0}
                  >
                    {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAuthenticated ? "Proceed to Checkout" : "Sign In to Checkout"}
                  </Button>
                  
                  <Link href="/shop">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 