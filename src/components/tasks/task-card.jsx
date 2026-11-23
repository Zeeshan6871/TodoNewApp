"use client";

import { Check, Paperclip, MoreVertical, Edit2, Trash2, ArrowRightCircle, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DueCountdownBadge } from "./due-countdown-badge";
import { formatDateShort } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function TaskCard({ task, onToggleStatus, onEdit, onDelete, onPreviewAttachment }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCompleted = task.status === "COMPLETED";

  const priorityVariant = {
    URGENT: "urgent",
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  }[task.priority] || "medium";

  const statusVariant = {
    COMPLETED: "completed",
    IN_PROGRESS: "in_progress",
    PENDING: "pending",
  }[task.status] || "pending";

  const nextStatusMap = {
    PENDING: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
    COMPLETED: "PENDING",
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/40 flex flex-col justify-between gap-3",
        isCompleted && "opacity-75 bg-muted/20 border-border/60"
      )}
    >
      {/* Top Meta Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Badge */}
          <Badge variant={priorityVariant} className="text-[10px] uppercase tracking-wider font-bold">
            {task.priority}
          </Badge>

          {/* Category Pill */}
          {task.category && (
            <span className="text-[11px] font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
              {task.category}
            </span>
          )}
        </div>

        {/* Action Menu Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-80 group-hover:opacity-100"
            aria-label="Task options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 z-30 w-36 rounded-xl border border-border bg-card shadow-xl p-1 text-xs animate-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Edit Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleStatus(task.id, nextStatusMap[task.status]);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowRightCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  Move Status
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Title & Checkbox */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggleStatus(task.id, isCompleted ? "PENDING" : "COMPLETED")}
          className={cn(
            "mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
              : "border-border hover:border-primary/70 bg-background"
          )}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEdit(task)}>
          <h4
            className={cn(
              "text-sm font-semibold text-foreground leading-snug transition-colors",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Tags Chips */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Row: Due Date Countdown & Attachments */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground mt-1">
        <div>
          {task.dueDate ? (
            <DueCountdownBadge
              dueDate={task.dueDate}
              reminderAt={task.reminderAt}
              isCompleted={isCompleted}
            />
          ) : (
            <span className="text-[11px] text-muted-foreground/60 italic">No due date</span>
          )}
        </div>

        {/* Attachments preview pill */}
        {task.attachments && task.attachments.length > 0 && (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/80 hover:bg-muted text-foreground text-[11px] font-medium cursor-pointer transition-colors"
            onClick={() => onPreviewAttachment && onPreviewAttachment(task.attachments[0])}
            title={`${task.attachments.length} attachment(s) in Cloud`}
          >
            <Paperclip className="h-3 w-3 text-primary" />
            <span>{task.attachments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}

