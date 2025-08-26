'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useUser } from '@/hooks/use-user';
import { usePayment } from '@/hooks/use-payment';

const AuthContext = createContext<any>({});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser, logOut,setUser:setUserMain } = useUser();
  const {setReload} = usePayment() 
  const BASE_URL =
    process.env.NEXT_PUBLIC_BE_API_BASE_URL || 'https://backend.capitalkv.com/';

  const syncGuestCart = async (token: string) => {
    try {
      const guestCartData = localStorage.getItem('guest_cart');
      if (guestCartData) {
        const parsedCart = JSON.parse(guestCartData);
        
        if (parsedCart.items && parsedCart.items.length > 0) {
          // Use the new sync endpoint
          await axios.post(
            `${BASE_URL}/ecommerce/cart/sync-guest-cart`,
            parsedCart.items,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          // Clear guest cart after successful sync
          localStorage.removeItem('guest_cart');
          console.log('Guest cart synced successfully');
        }
      }
    } catch (error) {
      console.error('Failed to sync guest cart:', error);
    }
  };

  const handleSuccessfulAuth = async (response: any, token: string) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    Cookies.set('token', token, { secure: true, sameSite: 'strict' });
    await fetchUser(token);
    setUser(response.data);
    setUserMain(response.data);
    setReload((prev:any)=>!prev);
    
    // Sync guest cart with server cart
    await syncGuestCart(token);
    
    // Handle return URL or checkout redirect
    const returnUrl = searchParams.get('returnUrl') || localStorage.getItem('returnUrl');
    const isCheckoutRedirect = searchParams.get('redirect') === 'checkout';
    
    // Small delay to ensure cart sync is complete
    setTimeout(() => {
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        router.push(returnUrl);
      } else if (isCheckoutRedirect) {
        router.push('/cart');
      } else {
        router.push('/dashboard/home');
      }
    }, 100);
  };

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        formData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      
      await handleSuccessfulAuth(response, response.data.access_token);
      return { success: true };
    } catch (error: any) {
      console.log('Login Failed');
      return {
        success: false,
        error: error.response?.data?.detail || 'An error occurred',
      };
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/register`,
        { username, email, password }
      );

      const { access_token } = response.data;
      await handleSuccessfulAuth(response, access_token);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'An error occurred',
      };
    }
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    Cookies.remove('token');
    logOut();
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
