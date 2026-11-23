"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn("Auth check error:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }
      setUser(data.user);
      setAuthModalOpen(false);
      toast({
        title: "Welcome back!",
        description: `Signed in as ${data.user.name}`,
        variant: "success",
      });
      return data.user;
    } catch (err) {
      toast({
        title: "Sign in error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }
      setUser(data.user);
      setAuthModalOpen(false);
      toast({
        title: "Account created!",
        description: `Welcome to TaskFlow, ${data.user.name}`,
        variant: "success",
      });
      return data.user;
    } catch (err) {
      toast({
        title: "Sign up error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const demoLogin = async () => {
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Demo login failed");
      }
      setUser(data.user);
      setAuthModalOpen(false);
      toast({
        title: "Demo Mode Active",
        description: "Logged in as Alex Morgan with sample tasks & attachments",
        variant: "success",
      });
      return data.user;
    } catch (err) {
      toast({
        title: "Demo sign in error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been logged out securely",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const openLogin = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authModalOpen,
        authMode,
        setAuthModalOpen,
        setAuthMode,
        openLogin,
        openRegister,
        login,
        register,
        demoLogin,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

