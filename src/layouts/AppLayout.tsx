import {
  BrainCircuit,
  ChartNoAxesCombined,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { env } from "../lib/env";

const nav = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Athletes", path: "/athletes", icon: Users },
  { label: "Insights", path: "/insights", icon: ChartNoAxesCombined },
  { label: "Drill Library", path: "/drills", icon: Dumbbell },
  { label: "AI Reviews", path: "/reviews", icon: BrainCircuit },
];
const future = [
  { label: "Videos", icon: Video },
  { label: "Settings", icon: Settings },
];
const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/athletes": "Athletes",
  "/athletes/new": "Add athlete",
  "/insights": "Progress insights",
  "/insights/attention": "Athletes needing attention",
  "/drills": "Drill library",
  "/drills/new": "Create drill",
};

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="Main navigation">
      {nav.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100 hover:text-ink"}`
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
      <div className="pt-5">
        <p className="px-3 pb-2 text-xs font-semibold uppercase text-gray-400">
          Coming soon
        </p>
        {future.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="flex min-h-11 cursor-not-allowed items-center gap-3 px-3 text-sm text-gray-400"
          >
            <Icon className="h-5 w-5" />
            {label}
          </span>
        ))}
      </div>
    </nav>
  );
}

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const title =
    titles[location.pathname] ??
    (location.pathname.startsWith("/drills/")
      ? location.pathname.endsWith("/edit")
        ? "Edit drill"
        : "Drill library"
      : location.pathname.endsWith("/edit")
        ? "Edit athlete"
        : location.pathname.startsWith("/athletes/")
          ? "Athlete profile"
          : env.appName);
  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white px-4 py-5 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 font-bold text-white">
            C
          </span>
          <span className="text-lg font-bold">{env.appName}</span>
        </div>
        <Navigation />
        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate px-3 text-sm font-medium">{user?.email}</p>
          <p className="mb-3 px-3 text-xs capitalize text-gray-500">
            {user?.role}
          </p>
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-72 bg-white px-4 py-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 font-bold text-white">
                  C
                </span>
                <span className="font-bold">{env.appName}</span>
              </div>
              <button
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Navigation onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded p-2 hover:bg-gray-100 lg:hidden"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-semibold">{title}</h2>
          </div>
          <button
            className="max-w-[180px] truncate text-sm text-gray-600"
            onClick={logout}
            title="Log out"
          >
            {user?.email}
          </button>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
