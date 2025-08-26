import ChatGuard from "@/guards/ChatGuard";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <ChatGuard>{children}</ChatGuard>;
};

export default layout;
