"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Bell, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = "default", duration = 5000, action = null, onAction = null }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast = { id, title, description, variant, duration, action, onAction };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, removeToast }}>
      {children}
      {/* Toast rendering portal */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-4",
              t.variant === "destructive" && "bg-destructive/10 border-destructive/30 text-destructive dark:bg-destructive/20",
              t.variant === "success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/40",
              t.variant === "reminder" && "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 dark:bg-amber-950/50",
              t.variant === "default" && "bg-card border-border text-foreground"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {t.variant === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {t.variant === "destructive" && <AlertCircle className="h-5 w-5 text-destructive" />}
              {t.variant === "reminder" && <Bell className="h-5 w-5 text-amber-500 animate-bounce" />}
              {t.variant === "default" && <Info className="h-5 w-5 text-primary" />}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold text-foreground leading-tight">{t.title}</p>}
              {t.description && <p className="text-xs text-muted-foreground mt-1 leading-normal">{t.description}</p>}
              {t.action && (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (t.onAction) t.onAction();
                      removeToast(t.id);
                    }}
                    className="text-xs font-medium px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {t.action}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground p-1 -mr-1 -mt-1 rounded-md transition-colors"
              aria-label="Close toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

