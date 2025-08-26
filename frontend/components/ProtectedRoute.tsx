"use client";

import { ReactNode, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
