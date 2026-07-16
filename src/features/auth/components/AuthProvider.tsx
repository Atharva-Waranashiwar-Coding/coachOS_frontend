import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, login as loginRequest } from "../../../api/auth.api";
import { registerUnauthorizedHandler } from "../../../api/api-client";
import { tokenStorage } from "../../../lib/storage";
import { AuthContext } from "../hooks/useAuth";
import type { AuthUser, LoginCredentials } from "../types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  const logout = useCallback(() => {
    tokenStorage.clear();
    queryClient.clear();
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, [queryClient]);

  useEffect(() => {
    registerUnauthorizedHandler(logout);
    return () => registerUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!token || user) return;
    let active = true;
    setIsLoading(true);
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [logout, token, user]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await loginRequest(credentials);
      tokenStorage.set(response.access_token);
      setToken(response.access_token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      tokenStorage.clear();
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      role: user?.role ?? null,
      isCoach: user?.role === "coach",
      isAthlete: user?.role === "athlete",
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
