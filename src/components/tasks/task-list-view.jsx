"use client";

import { TaskCard } from "./task-card";
import { CheckCircle2 } from "lucide-react";

export function TaskListView({ tasks = [], onToggleStatus, onEdit, onDelete, onPreviewAttachment, onNewTask }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card/40">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No tasks found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No tasks match your current filters. Create a new task or adjust your search.
        </p>
        <button
          type="button"
          onClick={onNewTask}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          Create First Task
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreviewAttachment={onPreviewAttachment}
        />
      ))}
    </div>
  );
}

