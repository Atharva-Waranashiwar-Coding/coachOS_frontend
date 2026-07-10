import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoading } from "../components/feedback/States";
import { useAuth } from "../features/auth/hooks/useAuth";
export function PublicOnlyRoute() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading) return <PageLoading label="Checking your session" />;
  const destination =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";
  return auth.isAuthenticated ? (
    <Navigate to={destination} replace />
  ) : (
    <Outlet />
  );
}
