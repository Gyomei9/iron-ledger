"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ThemeName } from "@/lib/types";

interface ThemeCtx {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "anthracite", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("anthracite");

  useEffect(() => {
    const saved = localStorage.getItem("il-theme") as ThemeName | null;
    if (saved) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "anthracite");
    }
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("il-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
