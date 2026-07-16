import { createContext, useContext } from "react";
import type { AuthUser, LoginCredentials } from "../types";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: AuthUser["role"] | null;
  isCoach: boolean;
  isAthlete: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
