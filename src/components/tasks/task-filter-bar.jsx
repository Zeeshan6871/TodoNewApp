"use client";

import { Search, Plus, LayoutList, Columns, Calendar, ArrowUpDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = ["ALL", "Work", "Personal", "Design", "DevOps", "Study", "General"];
const PRIORITIES = ["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"];
const SORTS = [
  { value: "dueDate_asc", label: "Due Date (Earliest)" },
  { value: "dueDate_desc", label: "Due Date (Latest)" },
  { value: "created_desc", label: "Recently Added" },
  { value: "title_asc", label: "Title (A-Z)" },
];

export function TaskFilterBar({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  onNewTask,
  categories = CATEGORIES,
}) {
  const hasActiveFilters =
    search || selectedCategory !== "ALL" || selectedPriority !== "ALL" || selectedStatus !== "ALL";

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("ALL");
    onPriorityChange("ALL");
    onStatusChange("ALL");
  };

  return (
    <div className="space-y-3">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks, descriptions, or tags..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 bg-card border-border"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Switcher Tabs & New Task CTA */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <div className="bg-muted p-1 rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden md:inline">List</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "board"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Kanban Board View"
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Board</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "timeline"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Due Timeline View"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Timeline</span>
            </button>
          </div>

          <Button onClick={onNewTask} className="shadow-md shadow-primary/20 flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Filter Row: Category Chips & Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdown Filters: Priority, Status, Sort */}
        <div className="flex items-center gap-2 text-xs">
          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">🔴 Urgent</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🔵 Medium</option>
            <option value="LOW">⚪ Low</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">⏳ To Do</option>
            <option value="IN_PROGRESS">🔄 In Progress</option>
            <option value="COMPLETED">✅ Completed</option>
          </select>

          {/* Sort */}
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

