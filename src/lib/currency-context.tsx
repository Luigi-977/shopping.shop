"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CurrencyCode, formatPrice } from "./currency";

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (usd: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);
const STORAGE_KEY = "reboot-market-currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved) setCurrencyState(saved);
    } catch {
      // ignore
    }
  }, []);

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  }

  function format(usd: number) {
    return formatPrice(usd, currency);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
