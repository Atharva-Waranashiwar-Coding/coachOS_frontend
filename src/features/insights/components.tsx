import { AlertCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import type {
  AttentionFlag,
  DataCompleteness,
  InsightFilters,
  RecurringInsightItem,
} from "../../api/insights.api";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";
import { formatDate, formatEnum } from "../../lib/formatters";

export function InsightRangeControls({
  filters,
  onChange,
}: {
  filters: InsightFilters;
  onChange: (changes: Partial<InsightFilters>) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3" aria-label="Insight period">
      <label className="text-sm font-medium text-gray-700">
        Date range
        <select
          className="mt-1 block min-h-10 rounded-md border border-line bg-white px-3"
          value={filters.range}
          onChange={(event) =>
            onChange({
              range: event.target.value as InsightFilters["range"],
            })
          }
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="60d">Last 60 days</option>
          <option value="90d">Last 90 days</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      {filters.range === "custom" && (
        <>
          <label className="text-sm font-medium text-gray-700">
            Start date
            <input
              className="mt-1 block min-h-10 rounded-md border border-line px-3"
              type="date"
              value={filters.start_date ?? ""}
              onChange={(event) => onChange({ start_date: event.target.value })}
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            End date
            <input
              className="mt-1 block min-h-10 rounded-md border border-line px-3"
              type="date"
              value={filters.end_date ?? ""}
              onChange={(event) => onChange({ end_date: event.target.value })}
            />
          </label>
        </>
      )}
      <label className="flex min-h-10 items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={filters.compare}
          onChange={(event) => onChange({ compare: event.target.checked })}
        />
        Compare previous period
      </label>
    </div>
  );
}

export function CompletenessNotice({ data }: { data: DataCompleteness }) {
  if (!data.partial) return null;
  return (
    <div
      className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      role="status"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">
          Some insight data is temporarily unavailable
        </p>
        <p className="mt-1">
          Local drill and goal metrics are still shown. Review or practice
          activity sections may be incomplete.
        </p>
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  comparison,
  help,
}: {
  label: string;
  value: string | number | null;
  comparison?: number | null;
  help: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <span title={help} aria-label={help}>
          <Info className="h-4 w-4 text-gray-400" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold">
        {value === null ? "Not enough data" : value}
      </p>
      {comparison !== undefined && comparison !== null && (
        <p className="mt-1 text-xs text-gray-500">
          {comparison > 0 ? "+" : ""}
          {comparison} from previous period
        </p>
      )}
    </Card>
  );
}

export function AccessibleBars({
  title,
  values,
}: {
  title: string;
  values: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...values.map((item) => item.value), 1);
  if (!values.length)
    return <p className="text-sm text-gray-500">No records in this period.</p>;
  return (
    <div aria-label={title}>
      <div className="space-y-3">
        {values.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="h-2 overflow-hidden rounded bg-gray-100">
              <div
                className="h-full bg-brand-600"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AttentionFlags({ flags }: { flags: AttentionFlag[] }) {
  if (!flags.length)
    return (
      <p className="text-sm text-gray-500">No attention flags detected.</p>
    );
  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <div
          key={`${flag.code}-${flag.related_entity_ids.join("-")}`}
          className="border-l-4 border-amber-400 pl-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{flag.title}</p>
            <Badge
              tone={
                flag.severity === "high"
                  ? "red"
                  : flag.severity === "warning"
                    ? "amber"
                    : "gray"
              }
            >
              {formatEnum(flag.severity)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">{flag.description}</p>
          {flag.recommended_action && (
            <p className="mt-1 text-xs text-gray-500">
              {flag.recommended_action}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function RecurringItems({
  items,
  athleteId,
  empty,
}: {
  items: RecurringInsightItem[];
  athleteId: string;
  empty: string;
}) {
  if (!items.length) return <p className="text-sm text-gray-500">{empty}</p>;
  return (
    <div className="divide-y divide-line">
      {items.map((item) => (
        <div key={item.key} className="py-4 first:pt-0 last:pb-0">
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-semibold">{item.display_label}</p>
            <span className="text-xs text-gray-500">
              {formatDate(item.last_seen_at)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Mentioned in {item.distinct_review_count} approved reviews
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {item.occurrence_count} structured mention
            {item.occurrence_count === 1 ? "" : "s"}
            {item.high_priority_count
              ? ` · ${item.high_priority_count} high-priority`
              : ""}
            {item.related_assignment_count
              ? ` · ${item.related_assignment_count} related assignment${item.related_assignment_count === 1 ? "" : "s"}`
              : ""}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {item.trend === "increasing"
              ? "Appeared more often than in the previous period"
              : item.trend === "decreasing"
                ? "Mentioned less often than in the previous period"
                : item.trend === "stable"
                  ? "Mention frequency was stable"
                  : "Not enough data for a period comparison"}
          </p>
          <Link
            className="mt-2 inline-block text-sm font-semibold text-brand-700"
            to={`/athletes/${athleteId}/reviews`}
          >
            View related feedback
          </Link>
        </div>
      ))}
    </div>
  );
}
