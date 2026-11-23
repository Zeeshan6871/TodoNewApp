"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onOpenChange, children }) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open && onOpenChange) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange && onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Dialog container */}
      <div className="relative z-50 w-full max-h-[90vh] flex flex-col justify-center pointer-events-none">
        <div className="pointer-events-auto">{children}</div>
      </div>
    </div>
  );
}

export function DialogContent({ className, children, onClose }) {
  return (
    <div
      className={cn(
        "relative w-full max-w-lg mx-auto bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 flex flex-col max-h-[85vh]",
        className
      )}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 text-left mb-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-lg font-semibold tracking-tight text-foreground", className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 pt-3 border-t border-border", className)}
      {...props}
    />
  );
}

