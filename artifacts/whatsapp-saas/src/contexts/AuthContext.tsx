import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  isDemo?: boolean;
  demoExpiresAt?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem("auth_token");
    return t === "undefined" ? null : t;
  });
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("auth_user");
    if (!stored || stored === "undefined") return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  const refreshUser = (updatedUser: User) => {
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1] || "")) as { exp?: number };
      if (!payload.exp) return;

      const timeoutMs = payload.exp * 1000 - Date.now();
      if (timeoutMs <= 0) {
        logout();
        return;
      }

      const timeout = window.setTimeout(logout, timeoutMs);
      return () => window.clearTimeout(timeout);
    } catch {
      logout();
    }
    return () => {};
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
