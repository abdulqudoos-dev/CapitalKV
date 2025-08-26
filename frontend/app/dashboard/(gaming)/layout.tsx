import GamingGuard from "@/guards/GamingGuard";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <GamingGuard>{children}</GamingGuard>;
};

export default layout;
