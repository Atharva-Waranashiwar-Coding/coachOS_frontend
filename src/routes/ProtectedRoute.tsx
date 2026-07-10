import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoading } from "../components/feedback/States";
import { useAuth } from "../features/auth/hooks/useAuth";
export function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading) return <PageLoading label="Checking your session" />;
  if (!auth.isAuthenticated)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  return <Outlet />;
}
