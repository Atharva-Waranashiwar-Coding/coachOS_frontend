import {
  Activity,
  ClipboardCheck,
  Home,
  LogOut,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAthleteMe } from "../features/athlete-dashboard/hooks";
import { useAuth } from "../features/auth/hooks/useAuth";
import { env } from "../lib/env";

const navigation = [
  { label: "Home", path: "/athlete/dashboard", icon: Home },
  { label: "Feedback", path: "/athlete/feedback", icon: MessageSquareText },
  { label: "Drills", path: "/athlete/drills", icon: ClipboardCheck },
  { label: "Timeline", path: "/athlete/timeline", icon: Activity },
  { label: "Profile", path: "/athlete/profile", icon: UserRound },
];

function AthleteNavigation({ compact = false }: { compact?: boolean }) {
  return (
    <nav
      className={compact ? "grid grid-cols-5" : "flex items-center gap-1"}
      aria-label="Athlete navigation"
    >
      {navigation.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            compact
              ? `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? "text-brand-700" : "text-gray-500"}`
              : `flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"}`
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AthleteAppLayout() {
  const { logout, user } = useAuth();
  const profile = useAthleteMe();
  const athleteName =
    profile.data?.preferred_name ??
    profile.data?.first_name ??
    user?.email.split("@")[0] ??
    "Athlete";
  return (
    <div className="min-h-screen bg-canvas pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 font-bold text-white">
              C
            </span>
            <div>
              <p className="font-bold">{env.appName}</p>
              <p className="text-xs text-gray-500">Athlete workspace</p>
            </div>
          </div>
          <div className="hidden md:block">
            <AthleteNavigation />
          </div>
          <button
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            onClick={logout}
            title="Log out"
          >
            <span className="hidden sm:inline">{athleteName}</span>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white md:hidden">
        <AthleteNavigation compact />
      </div>
    </div>
  );
}
