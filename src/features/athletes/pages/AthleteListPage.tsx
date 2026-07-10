import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { PageHeader } from "../../../components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "../../../components/feedback/States";
import { Input, Select } from "../../../components/forms/Fields";
import { Pagination } from "../../../components/navigation/Pagination";
import { athleteName, formatDate, formatEnum } from "../../../lib/formatters";
import { useAthletes } from "../hooks/useAthletes";
import { athleteStatuses, positions, type AthleteListParams } from "../types";

function valid<T extends string>(
  value: string | null,
  values: readonly T[],
): T | undefined {
  return values.includes(value as T) ? (value as T) : undefined;
}
export function AthleteListPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (search.trim()) next.set("search", search.trim());
          else next.delete("search");
          next.set("page", "1");
          return next;
        },
        { replace: true },
      );
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, setParams]);
  const filters: AthleteListParams = {
    page: Math.max(1, Number(params.get("page")) || 1),
    page_size: 10,
    search: params.get("search") || undefined,
    status: valid(params.get("status"), athleteStatuses),
    primary_position: valid(params.get("primary_position"), positions),
    sort_by:
      valid(params.get("sort_by"), [
        "first_name",
        "last_name",
        "created_at",
        "updated_at",
      ] as const) ?? "last_name",
    sort_order:
      valid(params.get("sort_order"), ["asc", "desc"] as const) ?? "asc",
  };
  const query = useAthletes(filters);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setParams(next);
  };
  const clear = () => {
    setSearch("");
    setParams({});
  };
  if (!query.data)
    return query.isError ? (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    ) : (
      <LoadingSkeleton />
    );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Athletes"
        description="Manage profiles, goals, and development history for athletes assigned to you."
        actions={
          <Link to="/athletes/new">
            <Button icon={Plus}>Create athlete</Button>
          </Link>
        }
      />
      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_repeat(3,minmax(150px,1fr))_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              aria-label="Search athletes"
              placeholder="Search name, school, or team"
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            aria-label="Status"
            value={filters.status ?? ""}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="">All statuses</option>
            {athleteStatuses.map((status) => (
              <option key={status} value={status}>
                {formatEnum(status)}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Primary position"
            value={filters.primary_position ?? ""}
            onChange={(event) => update("primary_position", event.target.value)}
          >
            <option value="">All positions</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {formatEnum(position)}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Sort athletes"
            value={`${filters.sort_by}:${filters.sort_order}`}
            onChange={(event) => {
              const [sortBy, sortOrder] = event.target.value.split(":");
              const next = new URLSearchParams(params);
              next.set("sort_by", sortBy ?? "last_name");
              next.set("sort_order", sortOrder ?? "asc");
              next.set("page", "1");
              setParams(next);
            }}
          >
            <option value="last_name:asc">Last name A-Z</option>
            <option value="first_name:asc">First name A-Z</option>
            <option value="updated_at:desc">Recently updated</option>
            <option value="created_at:desc">Recently created</option>
          </Select>
          <Button variant="ghost" icon={SlidersHorizontal} onClick={clear}>
            Clear
          </Button>
        </div>
      </section>
      {query.isLoading ? (
        <LoadingSkeleton />
      ) : query.isError ? (
        <ErrorState
          message={normalizeApiError(query.error).message}
          onRetry={() => query.refetch()}
        />
      ) : !query.data.items.length ? (
        <EmptyState
          title={
            params.toString()
              ? "No athletes match these filters"
              : "No athletes yet"
          }
          description={
            params.toString()
              ? "Try changing or clearing your filters."
              : "Create your first athlete to start tracking their development."
          }
          action={
            params.toString() ? (
              <Button variant="secondary" onClick={clear}>
                Clear filters
              </Button>
            ) : (
              <Link to="/athletes/new">
                <Button icon={Plus}>Create athlete</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="panel hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Athlete</th>
                  <th className="px-5 py-3 font-semibold">Position</th>
                  <th className="px-5 py-3 font-semibold">Grad year</th>
                  <th className="px-5 py-3 font-semibold">Program</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {query.data.items.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold">
                      {athleteName(athlete)}
                    </td>
                    <td className="px-5 py-4">
                      {formatEnum(athlete.primary_position)}
                    </td>
                    <td className="px-5 py-4">
                      {athlete.graduation_year ?? "-"}
                    </td>
                    <td className="px-5 py-4">
                      {athlete.team_name ?? athlete.school_name ?? "-"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          athlete.status === "active"
                            ? "green"
                            : athlete.status === "archived"
                              ? "red"
                              : "amber"
                        }
                      >
                        {formatEnum(athlete.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {formatDate(athlete.updated_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        className="font-semibold text-brand-700 hover:underline"
                        to={`/athletes/${athlete.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {query.data.items.map((athlete) => (
              <Link
                key={athlete.id}
                to={`/athletes/${athlete.id}`}
                className="panel p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{athleteName(athlete)}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatEnum(athlete.primary_position)} ·{" "}
                      {athlete.graduation_year ?? "No grad year"}
                    </p>
                  </div>
                  <Badge
                    tone={
                      athlete.status === "active"
                        ? "green"
                        : athlete.status === "archived"
                          ? "red"
                          : "amber"
                    }
                  >
                    {formatEnum(athlete.status)}
                  </Badge>
                </div>
                <p className="mt-4 text-sm">
                  {athlete.team_name ??
                    athlete.school_name ??
                    "No program listed"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Updated {formatDate(athlete.updated_at)}
                </p>
              </Link>
            ))}
          </div>
          <Pagination
            page={query.data.page}
            totalPages={query.data.total_pages}
            total={query.data.total}
            onPageChange={(page) => {
              const next = new URLSearchParams(params);
              next.set("page", String(page));
              setParams(next);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}
