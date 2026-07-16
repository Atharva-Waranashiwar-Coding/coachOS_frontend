import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoading } from "../components/feedback/States";
import { useAuth } from "../features/auth/hooks/useAuth";
import { setRequestedRoute } from "./requestedRoute";

export function RequireAthleteRoute() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading) return <PageLoading label="Checking your session" />;
  if (!auth.isAuthenticated) {
    setRequestedRoute(`${location.pathname}${location.search}`);
    window.sessionStorage.setItem(
      "coachos.requested-route",
      `${location.pathname}${location.search}`,
    );
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  if (!auth.isAthlete) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
