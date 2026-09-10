"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "primadev_theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");

  const applyTheme = useCallback((t) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", t);
      if (t === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }

      // Signal color-scheme to browser so the SVG favicon's
      // @media (prefers-color-scheme) renders the correct variant
      document.documentElement.style.colorScheme = t;

      // Also update the <link rel="icon"> href with a cache-busting param
      // so the browser reloads the favicon after theme toggle
      try {
        const faviconEl = document.querySelector("link[rel='icon'][type='image/svg+xml']");
        if (faviconEl) {
          faviconEl.href = `/favicon.svg?theme=${t}`;
        }
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        applyTheme(saved);
      } else {
        const systemPrefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
        const initialTheme = systemPrefersLight ? "light" : "dark";
        setTheme(initialTheme);
        applyTheme(initialTheme);
      }
    } catch {
      applyTheme("dark");
    }

    const mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
    const handleSystemThemeChange = (e) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          const newTheme = e.matches ? "light" : "dark";
          setTheme(newTheme);
          applyTheme(newTheme);
        }
      } catch {}
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
