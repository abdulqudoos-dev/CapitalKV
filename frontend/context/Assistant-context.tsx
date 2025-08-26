"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AssistantContextType {
  isOpen: boolean;
  toggle: () => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

interface AssistantProviderProps {
  children: ReactNode;
}

export function AssistantProvider({ children }: AssistantProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <AssistantContext.Provider value={{ isOpen, toggle }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant(): AssistantContextType {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return context;
}
