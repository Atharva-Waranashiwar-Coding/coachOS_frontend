import { ShieldX } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { useAuth } from "../features/auth/hooks/useAuth";

export function UnauthorizedPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  const home = auth.isAthlete ? "/athlete/dashboard" : "/dashboard";
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
      <div className="max-w-md">
        <ShieldX className="mx-auto h-10 w-10 text-red-600" />
        <h1 className="mt-4 text-2xl font-bold">This page is not available</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account role does not have access to this workspace.
        </p>
        <Button
          className="mt-6"
          onClick={() => navigate(home, { replace: true })}
        >
          Return to dashboard
        </Button>
      </div>
    </main>
  );
}
