/**
 * Clean, lightweight date formatting and countdown utility (Zero external dependencies).
 */

export function formatDate(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function formatDateShort(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTimeLocal(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getRelativeCountdown(dueDateInput) {
  if (!dueDateInput) return null;
  const dueDate = new Date(dueDateInput);
  if (isNaN(dueDate.getTime())) return null;

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const absDiffSec = Math.floor(Math.abs(diffMs) / 1000);

  const days = Math.floor(absDiffSec / 86400);
  const hours = Math.floor((absDiffSec % 86400) / 3600);
  const minutes = Math.floor((absDiffSec % 3600) / 60);

  if (isOverdue) {
    if (days > 0) return { text: `Overdue by ${days}d ${hours}h`, isOverdue: true, urgency: "danger" };
    if (hours > 0) return { text: `Overdue by ${hours}h ${minutes}m`, isOverdue: true, urgency: "danger" };
    return { text: `Overdue by ${minutes}m`, isOverdue: true, urgency: "danger" };
  }

  // Future
  if (days > 2) return { text: `Due in ${days} days`, isOverdue: false, urgency: "normal" };
  if (days === 1) return { text: `Due Tomorrow`, isOverdue: false, urgency: "soon" };
  if (hours > 0) return { text: `Due in ${hours}h ${minutes}m`, isOverdue: false, urgency: "soon" };
  if (minutes > 0) return { text: `Due in ${minutes}m`, isOverdue: false, urgency: "imminent" };
  return { text: `Due Now`, isOverdue: false, urgency: "imminent" };
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

