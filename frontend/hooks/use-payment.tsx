import React, { createContext, useState, useEffect, useContext } from "react";
import api from "@/utils/api";
import { isAxiosError } from "axios";
import FullScreenLogoLoader from "@/components/FullScreenLoader";

// Define the shape of the context state
interface PaymentContextType {
  plans: any[] | null;
  loading: boolean;
  error: any;
  depositAmount: any;
  setReload: any;
  subscriptions: any;
  unSubscribe: any;
}

// Create the context with a default value
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Create the provider component
export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [reload,setReload] = useState(false);
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get(`/payments/plans`);
        setPlans(response.data.plans);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchSunscribedPlans = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/payments/fetch-subscribed-plans`);
        console.log(response.data)
        setSubscriptions(response.data.subscribed_plans);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSunscribedPlans();
    fetchPlans();
  }, [reload]);

  const depositAmount = async (data: any) => {
    try {
      const response = await api.post(`/payments/create-payment-intent`, data);
      return { success: true, data: response.data };
    } catch (err: any) {
      if (isAxiosError(err)) {
        return { success: false, data: err?.response?.data?.detail?.message };
      } else {
        return { success: false, data: err?.message };
      }
    } finally {
      setLoading(false);
    }
  };
  const unSubscribe = async (data: any) => {
    try {
      const response = await api.post(`/payments/unsubscribe`, data);
      return { success: true, data: response.data };
    } catch (err: any) {
      if (isAxiosError(err)) {
        return { success: false, data: err?.response?.data?.detail?.message };
      } else {
        return { success: false, data: err?.message };
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FullScreenLogoLoader/>
  }

  return (
    <PaymentContext.Provider
      value={{ plans,setReload,unSubscribe, subscriptions, loading, depositAmount, error }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook to use the PaymentContext
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
