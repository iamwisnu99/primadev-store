"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const LanguageContext = createContext(null);
const STORAGE_KEY = "primadev_lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "id") {
        setLang(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      }
    } catch {}
  }, []);

  const switchLang = useCallback((code) => {
    setLang(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = code === "en" ? "en" : "id";
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, switchLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
