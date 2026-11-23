"use client";

import { TaskCard } from "./task-card";
import { ListTodo, Clock, CheckCircle2, Plus } from "lucide-react";

const COLUMNS = [
  {
    id: "PENDING",
    title: "To Do",
    icon: ListTodo,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    icon: Clock,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export function TaskBoardView({ tasks = [], onToggleStatus, onEdit, onDelete, onPreviewAttachment, onNewTask }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl border border-border bg-card/50 p-3.5 min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-md ${col.bg} ${col.color} flex items-center justify-center`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{col.title}</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>

              {col.id === "PENDING" && (
                <button
                  type="button"
                  onClick={onNewTask}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Add task to column"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Column Tasks */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
                  No tasks in {col.title.toLowerCase()}
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleStatus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPreviewAttachment={onPreviewAttachment}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

