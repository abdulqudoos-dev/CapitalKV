import React, { createContext, useState, useEffect, useContext } from "react";
import { useSearchParams } from "next/navigation";

interface AffiliateContextType {
  affiliate?: string | null;
  setAffilateLink?:any;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(
  undefined
);

export const AffiliateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [affiliate, setAffiliate] = useState<string | undefined | null>(
    undefined
  );

  const checkAffiliate = () => {
    const affiliate = localStorage.getItem("affiliate");
    if (affiliate) {
      setAffiliate(affiliate);
    }
  };

  useEffect(() => {
    checkAffiliate();
  }, []);


  const setAffilateLink = (link:any) => {
    console.log(link)
    localStorage.setItem("affiliate",link)
    setAffiliate(link)
  }

  return (
    <AffiliateContext.Provider value={{ affiliate,setAffilateLink }}>
      {children}
    </AffiliateContext.Provider>
  );
};

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (context === undefined) {
    throw new Error("useAffiliate must be used within a AffiliateProvider");
  }
  return context;
};
