import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoading } from "../components/feedback/States";
import { useAuth } from "../features/auth/hooks/useAuth";
import { clearRequestedRoute, getRequestedRoute } from "./requestedRoute";
export function PublicOnlyRoute() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading) return <PageLoading label="Checking your session" />;
  if (
    auth.isAuthenticated &&
    window.sessionStorage.getItem("coachos.login-in-flight")
  )
    return <Outlet />;
  const requested =
    new URLSearchParams(location.search).get("redirect") ??
    (location.state as { from?: string } | null)?.from ??
    getRequestedRoute() ??
    window.sessionStorage.getItem("coachos.requested-route") ??
    undefined;
  const requestedAllowed =
    requested &&
    ((auth.isAthlete && requested.startsWith("/athlete")) ||
      (auth.isCoach && !requested.startsWith("/athlete")));
  const destination = requestedAllowed
    ? requested
    : auth.isAthlete
      ? "/athlete/dashboard"
      : "/dashboard";
  if (auth.isAuthenticated) {
    clearRequestedRoute();
    window.sessionStorage.removeItem("coachos.requested-route");
  }
  return auth.isAuthenticated ? (
    <Navigate to={destination} replace />
  ) : (
    <Outlet />
  );
}
