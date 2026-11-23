"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Bell } from "lucide-react";
import { getRelativeCountdown } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export function DueCountdownBadge({ dueDate, reminderAt, isCompleted = false, className = "" }) {
  const [countdown, setCountdown] = useState(() => getRelativeCountdown(dueDate));

  useEffect(() => {
    if (!dueDate || isCompleted) return;

    setCountdown(getRelativeCountdown(dueDate));
    const interval = setInterval(() => {
      setCountdown(getRelativeCountdown(dueDate));
    }, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, [dueDate, isCompleted]);

  if (!dueDate || isCompleted || !countdown) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium select-none transition-colors",
        countdown.isOverdue
          ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
          : countdown.urgency === "imminent"
          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse"
          : countdown.urgency === "soon"
          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
          : "bg-muted text-muted-foreground border border-border/50",
        className
      )}
      title={`Due: ${new Date(dueDate).toLocaleString()}${
        reminderAt ? ` • Reminder set: ${new Date(reminderAt).toLocaleTimeString()}` : ""
      }`}
    >
      {countdown.isOverdue ? (
        <AlertTriangle className="h-3 w-3 shrink-0" />
      ) : (
        <Clock className="h-3 w-3 shrink-0" />
      )}
      <span>{countdown.text}</span>
      {reminderAt && (
        <Bell className="h-2.5 w-2.5 text-amber-500 shrink-0 ml-0.5" title="Reminder configured" />
      )}
    </span>
  );
}

