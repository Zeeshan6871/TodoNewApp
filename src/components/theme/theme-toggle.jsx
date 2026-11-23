"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      className={`relative inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-400 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </button>
  );
}

