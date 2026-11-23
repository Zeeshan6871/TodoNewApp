"use client";

import { TaskCard } from "./task-card";
import { AlertTriangle, Calendar, Clock, CheckCircle2, HelpCircle } from "lucide-react";

export function TaskTimelineView({ tasks = [], onToggleStatus, onEdit, onDelete, onPreviewAttachment, onNewTask }) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const buckets = {
    overdue: [],
    today: [],
    week: [],
    upcoming: [],
    noDate: [],
  };

  tasks.forEach((task) => {
    if (!task.dueDate) {
      buckets.noDate.push(task);
      return;
    }
    const d = new Date(task.dueDate);
    if (task.status !== "COMPLETED" && d < now) {
      buckets.overdue.push(task);
    } else if (d >= startOfToday && d < endOfToday) {
      buckets.today.push(task);
    } else if (d >= endOfToday && d < endOfWeek) {
      buckets.week.push(task);
    } else {
      buckets.upcoming.push(task);
    }
  });

  const sections = [
    {
      id: "overdue",
      title: "🚨 Overdue",
      tasks: buckets.overdue,
      badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    },
    {
      id: "today",
      title: "⏰ Due Today",
      tasks: buckets.today,
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      id: "week",
      title: "📅 Due This Week",
      tasks: buckets.week,
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      id: "upcoming",
      title: "🗓️ Upcoming / Later",
      tasks: buckets.upcoming,
      badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      id: "noDate",
      title: "📌 No Due Date",
      tasks: buckets.noDate,
      badgeColor: "bg-muted text-muted-foreground border-border",
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((sec) => {
        if (sec.tasks.length === 0) return null;

        return (
          <div key={sec.id} className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">{sec.title}</h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sec.badgeColor}`}>
                {sec.tasks.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {sec.tasks.map((task) => (
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
          </div>
        );
      })}
    </div>
  );
}

