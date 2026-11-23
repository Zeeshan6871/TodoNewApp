"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MongoFileDropzone } from "@/components/attachments/mongo-file-dropzone";
import { AttachmentList } from "@/components/attachments/attachment-list";
import { formatDateTimeLocal } from "@/lib/date-utils";
import { Calendar, Bell, Tag, Folder, AlertCircle } from "lucide-react";

const REMINDER_OPTIONS = [
  { value: "none", label: "No Reminder" },
  { value: "0", label: "At due time" },
  { value: "5", label: "5 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "1440", label: "1 day before" },
];

export function TaskFormModal({ open, onClose, task, onSave, onPreviewAttachment }) {
  const isEditing = Boolean(task && task.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("PENDING");
  const [category, setCategory] = useState("Work");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderOffset, setReminderOffset] = useState("15");
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "MEDIUM");
      setStatus(task.status || "PENDING");
      setCategory(task.category || "Work");
      setTags(Array.isArray(task.tags) ? task.tags.join(", ") : "");
      setDueDate(task.dueDate ? formatDateTimeLocal(task.dueDate) : "");
      setReminderOffset(
        task.reminderOffsetMinutes !== null && task.reminderOffsetMinutes !== undefined
          ? String(task.reminderOffsetMinutes)
          : task.dueDate
            ? "0"
            : "none"
      );
      setAttachments(task.attachments || []);
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus("PENDING");
      setCategory("Work");
      setTags("");
      setDueDate("");
      setReminderOffset("15");
      setAttachments([]);
    }
    setError("");
  }, [task, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const offsetMinutes = reminderOffset === "none" || !dueDate ? null : parseInt(reminderOffset, 10);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        category: category.trim() || "General",
        tags: parsedTags,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        reminderOffsetMinutes: offsetMinutes,
      };

      await onSave(payload, task?.id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadSuccess = (newAttachment) => {
    setAttachments((prev) => [...prev, newAttachment]);
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      }
    } catch (err) {
      console.error("Delete attachment error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update task details, attachments stored in Cloud, and due reminder."
              : "Set up task metadata, attach images or PDFs, and configure due reminders."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Task Title *</label>
            <Input
              type="text"
              placeholder="e.g. Prepare system design document"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-medium"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <Textarea
              placeholder="Add key context, checklists, or reference notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority & Status & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="URGENT">🔴 Urgent</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🔵 Medium</option>
                <option value="LOW">⚪ Low</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="PENDING">⏳ To Do</option>
                <option value="IN_PROGRESS">🔄 In Progress</option>
                <option value="COMPLETED">✅ Completed</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Folder className="h-3 w-3 text-muted-foreground" />
                Category
              </label>
              <Input
                type="text"
                placeholder="e.g. Work, Design"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              Tags (comma separated)
            </label>
            <Input
              type="text"
              placeholder="e.g. Architecture, Review, Urgent"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Due Date & Reminder Row */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Due Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* Due Reminder Offset */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Bell className="h-3.5 w-3.5 text-amber-500" />
                  Due Reminder
                </label>
                <select
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(e.target.value)}
                  disabled={!dueDate}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {REMINDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {dueDate && reminderOffset !== "none" && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Bell className="h-3 w-3 shrink-0" />
                <span>
                  Reminder will chime and display in-app toast {REMINDER_OPTIONS.find((o) => o.value === reminderOffset)?.label.toLowerCase()}.
                </span>
              </p>
            )}
          </div>

          {/* Attachments Section (Images/PDFs directly into Cloud) */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-foreground">Attachments (Cloud Direct Upload)</label>

            {isEditing ? (
              <>
                <MongoFileDropzone taskId={task.id} onUploadSuccess={handleUploadSuccess} />
                <AttachmentList
                  attachments={attachments}
                  onPreview={onPreviewAttachment}
                  onDelete={handleDeleteAttachment}
                />
              </>
            ) : (
              <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 border border-border/60">
                💡 Tip: Save this task first to upload and manage attachments directly into Cloud.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

