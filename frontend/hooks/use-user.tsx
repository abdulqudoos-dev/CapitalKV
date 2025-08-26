"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios, { isAxiosError } from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/utils/config";
import { Toast } from "@/components/ui/toast";
import { usePayment } from "./use-payment";
import { redirect, useRouter } from "next/navigation";
import { useToast } from "./use-toast";
// Removed circular dependency - useAuthContext import

interface PasswordUpdate {
  current_password: string;
  new_password: string;
}

interface ProfileData {
  [key: string]: any;
}

interface UserContextType {
  user: any;
  setUser: any;
  loading: boolean;
  error: any;
  updateProfile: (
    profileData: ProfileData
  ) => Promise<{ success: boolean; error?: any }>;
  saveAccount: (
    profileData: ProfileData
  ) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (
    passwordData: PasswordUpdate
  ) => Promise<{ success: boolean; message?: string; error?: any }>;
  getUserDetails: () => Promise<{ success: boolean; data?: any; error?: any }>;
  handleDeposit: (
    body: any
  ) => Promise<{ success: boolean; data?: any; message?: any }>;
  handleWithdrawMoney: (
    body: any
  ) => Promise<{ success: boolean; data?: any; error?: any }>;
  logActivity: (
    activityType: string,
    details?: any
  ) => Promise<{ success: boolean; error?: any }>;
  fetchUser: (t?: string) => Promise<void>;
  logOut: () => void;
  getAvatar: () => Promise<string | null>;
  updateAvatar: (
    avatarFile: File
  ) => Promise<{ success: boolean; error?: any }>;
  deleteAvatar: () => Promise<{ success: boolean; error?: any }>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create the provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { setReload } = usePayment();
  const router = useRouter();
  const toast = useToast();
  const fetchUser = useCallback(async (t?: string) => {
    const token = Cookies.get("token") || t;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (err) {
      setError(err);
      Cookies.remove("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateProfile = useCallback(async (profileData: ProfileData) => {
    const token = Cookies.get("token");
    if (!token) return { success: false };

    try {
      const response = await axios.put(`${API_URL}/users/me`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(profileData instanceof FormData && {
            "Content-Type": "multipart/form-data",
          }),
        },
      });
      setUser(response.data.updated_user);
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  const saveAccount = useCallback(async (data: ProfileData) => {
    const token = Cookies.get("token");
    if (!token) return { success: false };

    try {
      const response = await axios.post(
        `${API_URL}/users/me/save-account-details`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response save account", response.data);
      return { success: true, message: "Account added succesfully." };
    } catch (err: any) {
      if (isAxiosError(err)) {
        return { success: false, message: err?.response?.data?.detail };
      }
      return { success: false, message: err?.message };
    }
  }, []);

  const updatePassword = useCallback(async (passwordData: PasswordUpdate) => {
    const token = Cookies.get("token");
    if (!token) return { success: false };

    try {
      const response = await axios.put(
        `${API_URL}/users/me/password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { success: true, message: response.data.message };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  const getUserDetails = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return { success: false };

    try {
      const response = await axios.get(`${API_URL}/users/me/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { success: true, data: response.data };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  const handleDeposit = useCallback(async (body: any) => {
    const token = Cookies.get("token");
    if (!token) return { success: false };

    try {
      const response = await axios.post(`${API_URL}/users/me/topup`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { success: true, data: response.data };
    } catch (err: any) {
      if (isAxiosError(err)) {
        return { success: false, message: err?.response?.data?.detail };
      }
      return { success: false, message: err?.message };
    }
  }, []);
  const handleWithdrawMoney = useCallback(async (body: any) => {
    const token = Cookies.get("token");
    if (!token) return { success: false };

    try {
      const response = await axios.post(`${API_URL}/users/me/withdraw`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.url) {
        toast.toast({
          variant: "destructive",
          title: "please complete your onboarding process to withdraw",
        });
        router.push(response.data.url);
        return { success: false };
      }
      return { success: true, data: response.data };
    } catch (err: any) {
      if (isAxiosError(err)) {
        return { success: false, message: err?.response?.data?.detail };
      }
      return { success: false, message: err?.message };
    }
  }, []);

  const logActivity = useCallback(
    async (activityType: string, details: any = null) => {
      const token = Cookies.get("token");
      if (!token) return { success: false };

      try {
        await axios.post(
          `${API_URL}/users/me/activity`,
          { activity_type: activityType, details },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return { success: true };
      } catch (err) {
        setError(err);
        return { success: false, error: err };
      }
    },
    []
  );

  const getAvatar = useCallback(async () => {
    if (!user || !user.id) return null;
    try {
      const response = await axios.get(
        `${API_URL}/users/me/user_image/${user.id}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );

      const blob = new Blob([response.data], { type: "image/jpeg" });

      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("Error fetching avatar:", err);
      return null;
    }
  }, [user]);

  const logOut = useCallback(() => {
    setReload((prev: any) => !prev);
    setUser(null);
  }, [user]);

  const updateAvatar = useCallback(async (avatarFile: File) => {
    const token = Cookies.get("token");
    if (!token) return { success: false };

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      await axios.put(`${API_URL}/users/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  const deleteAvatar = useCallback(async () => {
    const token = Cookies.get("token");

    if (!token) return { success: false };

    try {
      await axios.delete(`${API_URL}/users/me/avatar/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchUser();
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        setUser,
        error,
        updateProfile,
        updatePassword,
        handleWithdrawMoney,
        handleDeposit,
        getUserDetails,
        logActivity,
        fetchUser,
        logOut,
        saveAccount,
        getAvatar,
        updateAvatar,
        deleteAvatar,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
