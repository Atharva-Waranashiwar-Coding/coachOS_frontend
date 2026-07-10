import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
      <div>
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-gray-600">
          The page may have moved or no longer exists.
        </p>
        <Link to="/dashboard">
          <Button className="mt-6">Return to dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
