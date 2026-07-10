import { Outlet } from "react-router-dom";
import { env } from "../lib/env";
export function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(360px,0.85fr)_1.15fr]">
      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-600 font-bold text-white">
              C
            </span>
            <span className="text-xl font-bold tracking-normal">
              {env.appName}
            </span>
          </div>
          <Outlet />
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative flex h-full max-w-xl flex-col justify-end p-16 text-white">
          <div className="mb-10 h-1 w-20 bg-signal" />
          <p className="text-4xl font-bold leading-tight">
            Build better athletes with a clearer coaching workflow.
          </p>
          <p className="mt-5 text-lg leading-8 text-gray-300">
            Profiles, goals, and development history organized around the work
            coaches do every day.
          </p>
        </div>
      </aside>
    </main>
  );
}
