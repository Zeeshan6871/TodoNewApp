"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Navbar } from "@/components/navbar/navbar";
import { TaskStats } from "@/components/tasks/task-stats";
import { TaskFilterBar } from "@/components/tasks/task-filter-bar";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskBoardView } from "@/components/tasks/task-board-view";
import { TaskTimelineView } from "@/components/tasks/task-timeline-view";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { ImageLightbox } from "@/components/attachments/image-lightbox";
import { PdfViewerModal } from "@/components/attachments/pdf-viewer-modal";
import { useReminderMonitor } from "@/hooks/use-reminder-monitor";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { CheckSquare, Sparkles, Database, Bell, Shield, ArrowRight, Loader2 } from "lucide-react";

export default function TodoDashboard() {
  const { user, loading: authLoading, openLogin, demoLogin } = useAuth();
  const { toast } = useToast();

  // Task state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Filter & view state
  const [viewMode, setViewMode] = useState("list"); // "list" | "board" | "timeline"
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("created_desc");

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoadingTasks(true);
    try {
      const params = new URLSearchParams({
        search,
        status: selectedStatus,
        priority: selectedPriority,
        category: selectedCategory,
        sort: selectedSort,
      });

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, [user, search, selectedStatus, selectedPriority, selectedCategory, selectedSort]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Hook for monitoring due reminders
  useReminderMonitor(useCallback(() => {
    fetchTasks();
  }, [fetchTasks]));

  // Actions
  const handleToggleStatus = async (taskId, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        fetchTasks();
      } else {
        if (newStatus === "COMPLETED") {
          toast({
            title: "Task completed! 🎉",
            description: "Great job completing your task.",
            variant: "success",
          });
        }
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      fetchTasks();
    }
  };

  const handleSaveTask = async (taskData, existingTaskId) => {
    try {
      if (existingTaskId) {
        const res = await fetch(`/api/tasks/${existingTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast({ title: "Task updated", variant: "success" });
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast({ title: "Task created", variant: "success" });
      }
      fetchTasks();
    } catch (err) {
      toast({ title: "Save error", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast({ title: "Task deleted", description: "Task and MongoDB attachments removed" });
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormModalOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setFormModalOpen(true);
  };

  const handlePreviewAttachment = (attachment) => {
    setPreviewAttachment(attachment);
  };

  const isImageAttachment = previewAttachment?.mimeType?.startsWith("image/");
  const isPdfAttachment = previewAttachment?.mimeType === "application/pdf";

  // Derive unique categories from existing tasks
  const dynamicCategories = Array.from(
    new Set(["ALL", "Work", "Personal", "Design", "DevOps", ...tasks.map((t) => t.category).filter(Boolean)])
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar onNewTask={handleNewTask} />

      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading TaskFlow...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated Landing / Demo Hero */
          <div className="py-12 sm:py-20 flex flex-col items-center text-center max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Senior Developer Architecture • MongoDB Direct Storage</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Manage Tasks with <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">Power & Precision</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Full-featured task lifecycle with image/PDF uploads directly stored in MongoDB, in-app Web Audio reminder chimes, and customizable views.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={demoLogin} className="gap-2 shadow-lg shadow-primary/25">
                <Sparkles className="h-4 w-4" />
                <span>Launch Demo Account (Instant)</span>
              </Button>
              <Button size="lg" variant="outline" onClick={openLogin}>
                Sign In / Register
              </Button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left w-full">
              <div className="p-5 rounded-2xl border border-border bg-card/60 shadow-sm space-y-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">MongoDB Direct Uploads</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Store images and PDFs directly into MongoDB with instant in-browser lightbox and PDF reader previews.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card/60 shadow-sm space-y-2">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Bell className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">In-App Chime Reminders</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Never miss a deadline with Web Audio synthesizer chimes, countdown badges, and interactive toast alerts.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card/60 shadow-sm space-y-2">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Multi-View Dashboard</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Switch seamlessly between List View, Kanban Board View, and Due Timeline View with dark & light themes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Stats Overview */}
            <TaskStats tasks={tasks} />

            {/* Filter & View Switcher Bar */}
            <TaskFilterBar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              search={search}
              onSearchChange={setSearch}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              onNewTask={handleNewTask}
              categories={dynamicCategories}
            />

            {/* Task Content Views */}
            {loadingTasks ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              </div>
            ) : viewMode === "list" ? (
              <TaskListView
                tasks={tasks}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onPreviewAttachment={handlePreviewAttachment}
                onNewTask={handleNewTask}
              />
            ) : viewMode === "board" ? (
              <TaskBoardView
                tasks={tasks}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onPreviewAttachment={handlePreviewAttachment}
                onNewTask={handleNewTask}
              />
            ) : (
              <TaskTimelineView
                tasks={tasks}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onPreviewAttachment={handlePreviewAttachment}
                onNewTask={handleNewTask}
              />
            )}
          </div>
        )}
      </main>

      {/* Task Create/Edit Modal */}
      <TaskFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        onPreviewAttachment={handlePreviewAttachment}
      />

      {/* Lightbox Preview for Images */}
      {isImageAttachment && (
        <ImageLightbox attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />
      )}

      {/* Embedded PDF Viewer Modal for PDFs */}
      {isPdfAttachment && (
        <PdfViewerModal attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />
      )}
    </div>
  );
}

