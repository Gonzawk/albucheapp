"use client";
import { useEffect } from "react";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return <>{children}</>;
}
