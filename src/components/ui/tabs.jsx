"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ value, onValueChange, children, className }) {
  return <div className={cn("w-full flex flex-col", className)}>{children}</div>;
}

export function TabsList({ className, children }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground select-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, activeValue, onClick, className, children }) {
  const isActive = value === activeValue;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        isActive
          ? "bg-background text-foreground shadow-sm font-semibold"
          : "hover:text-foreground hover:bg-background/50 text-muted-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

