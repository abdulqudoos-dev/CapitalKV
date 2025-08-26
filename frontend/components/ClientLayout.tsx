"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNavbar from "@/components/MobileNavbar";
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { GuestCartProvider } from '@/context/GuestCartContext';
import { usePathname } from 'next/navigation';
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/utils/config";
import { PaymentProvider } from "@/hooks/use-payment";
import { UserProvider } from "@/hooks/use-user";
import { AffiliateProvider } from "@/hooks/use-affiliate";
import { AssistantGuide } from "@/components/AssistantGuide"; // Make sure path is correct
import { AssistantProvider  } from "@/context/Assistant-context"; // Make sure path is correct

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/auth");
  const isGuide = pathname.startsWith("/docs");

  return (
    <AffiliateProvider>
      <PaymentProvider>
        <UserProvider>
          <Elements stripe={stripePromise}>
            <AuthProvider>
              <GuestCartProvider>
                <CartProvider>
                 <AssistantProvider > {/* 👈 Add here */}
                  {!isGuide && !isAuth && !isDashboard && <MobileNavbar />}
                  {!isGuide && !isAuth && !isDashboard && <Header />}
                  <main className="flex-grow max-w-full h-full">
                    {children}
                  </main>
                  {!isGuide && !isDashboard && <Footer />}
                  <Toaster />
                  <AssistantGuide />
                  </AssistantProvider > {/* 👈 Add here */}
                </CartProvider>
              </GuestCartProvider>
            </AuthProvider>
          </Elements>
      </UserProvider>       
      </PaymentProvider>        
    </AffiliateProvider>
  );
};

export default ClientLayout; 