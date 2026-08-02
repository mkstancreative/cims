import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";
import type { AuthUser } from "../api/types/auth";
import { getAccessToken } from "../api/services/api";
import { getMe } from "../api/services/auth";

const USER_KEY = "siwes_user";

function getStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const [isLoading, setIsLoading] = useState<boolean>(
    () => !!getAccessToken() && !getStoredUser(),
  );

  useEffect(() => {
    const token = getAccessToken();
    const cachedUser = getStoredUser();

    if (!token || cachedUser) return;
    getMe()
      .then((data) => {
        const authUser: AuthUser = {
          ...data.data.user,
          mustChangePassword: false,
        };
        setUser(authUser);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setAuth = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  const clearAuth = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  // ── Listen for session-expiry events fired by the Axios interceptor ─────────
  const navigate = useNavigate();
  useEffect(() => {
    const handleExpired = () => {
      clearAuth();
      toast.info("Your session has expired. Please log in again.", {
        toastId: "session-expired", // prevent duplicates
      });
      navigate("/", { replace: true });
    };
    window.addEventListener("siwes:session-expired", handleExpired);
    return () =>
      window.removeEventListener("siwes:session-expired", handleExpired);
  }, [clearAuth, navigate]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, setAuth, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}
