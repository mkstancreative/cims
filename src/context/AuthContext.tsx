import { createContext } from "react";
import type { AuthUser } from "../api/types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
