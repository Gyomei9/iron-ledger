"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Profile } from "@/lib/types";

interface AuthCtx {
  user: Profile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string, code: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Login failed";
      setUser(data.user);
      return null;
    } catch (err) {
      return String(err);
    }
  };

  const register = async (name: string, email: string, password: string, code: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, email, password, code }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Registration failed";
      setUser(data.user);
      return null;
    } catch (err) {
      return String(err);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
