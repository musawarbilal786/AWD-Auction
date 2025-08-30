"use client";
import React, { createContext, useContext, useState } from "react";

type PageTitleContextType = {
  pageTitle: string;
  setPageTitle: (title: string) => void;
};

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error("usePageTitle must be used within a PageTitleProvider");
  return ctx;
} 