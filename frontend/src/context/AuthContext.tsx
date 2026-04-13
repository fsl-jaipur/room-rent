/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

interface User {
  id: string;
  email: string;
  role: string;
  hasPhoto?: boolean;
  hasAadhaar?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async (force = false) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn && !force) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{ user: User }>("/api/auth/me", {
        method: "GET",
      });
      setUser(data.user);
      localStorage.setItem("isLoggedIn", "true");
    } catch {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
    }
  };

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("isLoggedIn", "true");
    }
  }, [user]);

  const logout = async () => {
    try {
      await apiFetch<{ message: string }>("/api/auth/logout", {
        method: "POST",
      });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
