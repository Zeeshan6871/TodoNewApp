import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive/15 text-destructive border border-destructive/20",
        outline: "text-foreground border border-border",
        urgent: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
        high: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
        medium: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
        low: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30",
        completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
        in_progress: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
        pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

