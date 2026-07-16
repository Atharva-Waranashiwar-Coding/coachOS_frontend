import { Archive, Clock3, Pencil, Plus, RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { normalizeApiError } from "../../../api/api-client";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { PageHeader } from "../../../components/common/PageHeader";
import { ConfirmDialog } from "../../../components/feedback/Dialog";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "../../../components/feedback/States";
import { useToast } from "../../../components/feedback/Toast";
import { Input, Select } from "../../../components/forms/Fields";
import { Pagination } from "../../../components/navigation/Pagination";
import { formatEnum } from "../../../lib/formatters";
import {
  useArchiveDrill,
  useDrills,
  useRestoreDrill,
} from "../hooks/useDrills";
import {
  drillCategories,
  drillDifficulties,
  type Drill,
  type DrillCategory,
  type DrillDifficulty,
  type DrillStatus,
} from "../types";

export function DrillLibraryPage() {
  const [params, setParams] = useSearchParams();
  const [archiving, setArchiving] = useState<Drill | null>(null);
  const search = params.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(search);
  const category = (params.get("category") || undefined) as
    DrillCategory | undefined;
  const difficulty = (params.get("difficulty") || undefined) as
    DrillDifficulty | undefined;
  const status = (params.get("status") || undefined) as DrillStatus | undefined;
  const tag = params.get("tag") || undefined;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const query = useDrills({
    search: search || undefined,
    category,
    difficulty,
    status,
    tag,
    page,
    page_size: 12,
    sort_by: "updated_at",
    sort_order: "desc",
  });
  const archive = useArchiveDrill();
  const restore = useRestoreDrill();
  const { showToast } = useToast();
  const update = (key: string, value: string) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  useEffect(() => {
    if (searchInput === search) return;
    const timer = window.setTimeout(
      () =>
        setParams((current) => {
          const next = new URLSearchParams(current);
          if (searchInput) next.set("search", searchInput);
          else next.delete("search");
          next.delete("page");
          return next;
        }),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [search, searchInput, setParams]);
  const performArchive = async () => {
    if (!archiving) return;
    try {
      await archive.mutateAsync(archiving.id);
      showToast("Drill archived");
      setArchiving(null);
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  const performRestore = async (drill: Drill) => {
    try {
      await restore.mutateAsync(drill.id);
      showToast("Drill restored");
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    }
  };
  if (!query.data)
    return query.isError ? (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => query.refetch()}
      />
    ) : (
      <LoadingSkeleton rows={5} />
    );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Drill library"
        description="Reusable coaching drills stay separate from athlete-specific assignments."
        actions={
          <Link to="/drills/new">
            <Button icon={Plus}>Create drill</Button>
          </Link>
        }
      />
      <section className="panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="relative lg:col-span-2">
          <span className="sr-only">Search drills</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            aria-label="Search drills"
            placeholder="Search by title"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>
        <Select
          aria-label="Drill category"
          value={category ?? ""}
          onChange={(event) => update("category", event.target.value)}
        >
          <option value="">All categories</option>
          {drillCategories.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Drill difficulty"
          value={difficulty ?? ""}
          onChange={(event) => update("difficulty", event.target.value)}
        >
          <option value="">All difficulties</option>
          {drillDifficulties.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Drill status"
          value={status ?? ""}
          onChange={(event) => update("status", event.target.value)}
        >
          <option value="">Active</option>
          <option value="archived">Archived</option>
        </Select>
        <Input
          aria-label="Filter by tag"
          placeholder="Filter by tag"
          value={tag ?? ""}
          onChange={(event) => update("tag", event.target.value)}
        />
      </section>
      {!query.data.items.length ? (
        <EmptyState
          title={
            search || category || difficulty || status || tag
              ? "No drills match these filters"
              : "No drills yet"
          }
          description="Create a reusable drill or adjust the current filters."
          action={
            <Link to="/drills/new">
              <Button icon={Plus}>Create drill</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {query.data.items.map((drill) => (
              <Card key={drill.id} className="flex min-h-72 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/drills/${drill.id}`}
                      className="font-bold text-ink hover:text-brand-700"
                    >
                      {drill.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="blue">{formatEnum(drill.category)}</Badge>
                      <Badge>{formatEnum(drill.difficulty)}</Badge>
                      {drill.status === "archived" && (
                        <Badge tone="red">Archived</Badge>
                      )}
                    </div>
                  </div>
                  {drill.estimated_duration_minutes && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                      <Clock3 className="h-4 w-4" />
                      {drill.estimated_duration_minutes}m
                    </span>
                  )}
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                  {drill.description || drill.instructions}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-gray-500">Default target</dt>
                    <dd className="mt-1 font-medium">
                      {drill.default_sets ?? "-"} sets /{" "}
                      {drill.default_repetitions ?? "-"} reps
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Equipment</dt>
                    <dd className="mt-1 font-medium">
                      {drill.equipment.join(", ") || "None"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-1">
                  {drill.tags.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
                <div className="mt-auto flex justify-end gap-1 pt-5">
                  {drill.status === "active" ? (
                    <>
                      <Link to={`/drills/${drill.id}/edit`}>
                        <Button variant="ghost" icon={Pencil}>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        icon={Archive}
                        className="text-red-600"
                        onClick={() => setArchiving(drill)}
                      >
                        Archive
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      icon={RotateCcw}
                      isLoading={
                        restore.isPending && restore.variables === drill.id
                      }
                      onClick={() => performRestore(drill)}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            page={query.data.page}
            totalPages={query.data.total_pages}
            total={query.data.total}
            onPageChange={(value) => update("page", String(value))}
          />
        </>
      )}
      <ConfirmDialog
        open={Boolean(archiving)}
        onClose={() => setArchiving(null)}
        onConfirm={performArchive}
        title="Archive drill?"
        description="Existing athlete assignments keep their snapshot. This drill cannot be used for new assignments until restored."
        confirmLabel="Archive drill"
        destructive
        isPending={archive.isPending}
      />
    </div>
  );
}
