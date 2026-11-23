"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { Lock, Mail, User, Sparkles, AlertCircle } from "lucide-react";

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, register, demoLogin } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError("");
    setLoading(true);
    try {
      await demoLogin();
    } catch (err) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent onClose={() => setAuthModalOpen(false)} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle>{authMode === "login" ? "Sign in to TaskFlow" : "Create your account"}</DialogTitle>
          </div>
          <DialogDescription>
            {authMode === "login"
              ? "Access your tasks, Cloud attachments, and due reminders."
              : "Start organizing with enterprise task management."}
          </DialogDescription>
        </DialogHeader>

        {/* Mode switcher tabs */}
        <div className="mb-4">
          <Tabs value={authMode}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger
                value="login"
                activeValue={authMode}
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                activeValue={authMode}
                onClick={() => {
                  setAuthMode("register");
                  setError("");
                }}
              >
                Create Account
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Demo Account quick button */}
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-primary/30 hover:bg-primary/5 text-primary font-medium"
            onClick={handleDemo}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Instant Demo Account (One-Click)
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or with email</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {authMode === "register" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" loading={loading}>
            {authMode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

