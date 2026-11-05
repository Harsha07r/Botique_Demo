"use client";

import { createContext, useContext } from "react";

export interface SiteContextValue {
  shopName: string;
  whatsappNumber: string;
  origin: string;
}

const Ctx = createContext<SiteContextValue>({ shopName: "Vastrika", whatsappNumber: "", origin: "" });

export function SiteProvider({ value, children }: { value: SiteContextValue; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
