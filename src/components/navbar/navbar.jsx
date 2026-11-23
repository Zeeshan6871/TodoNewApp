"use client";

import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { CheckSquare, LogOut, Sparkles, User as UserIcon } from "lucide-react";

export function Navbar({ onNewTask }) {
  const { user, loading, openLogin, logout, demoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                TaskFlow
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Senior
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">Cloud Direct • In-App Chime Reminders</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {loading ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* User profile capsule */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-card">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full ring-1 ring-border object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <span className="text-xs font-medium text-foreground max-w-[120px] truncate hidden md:inline">
                  {user.name}
                </span>
              </div>

              {/* Logout button */}
              <Button
                variant="ghost"
                size="iconSm"
                onClick={logout}
                title="Log out"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={demoLogin}
                className="hidden sm:inline-flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Demo
              </Button>
              <Button size="sm" onClick={openLogin}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

