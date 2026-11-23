"use client";

import { CheckCircle2, Clock, ListTodo, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TaskStats({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const pending = tasks.filter((t) => t.status === "PENDING").length;

  const now = new Date();
  const overdue = tasks.filter((t) => {
    if (t.status === "COMPLETED" || !t.dueDate) return false;
    return new Date(t.dueDate) < now;
  }).length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 flex items-center justify-between border-border bg-card">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Tasks</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{total}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ListTodo className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between border-border bg-card">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">In Progress</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{inProgress}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between border-border bg-card">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{completed}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between border-border bg-card">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Overdue</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">{overdue}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="p-3 rounded-xl border border-border bg-card/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Overall Completion</span>
            <span className="font-semibold text-foreground">{completionPercentage}% ({completed}/{total})</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

