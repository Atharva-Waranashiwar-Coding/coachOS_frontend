import { useSearchParams } from "react-router-dom";
import type { InsightFilters, InsightRange } from "../../api/insights.api";

const ranges: InsightRange[] = ["7d", "30d", "60d", "90d", "custom"];

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function useInsightFilters() {
  const [params, setParams] = useSearchParams();
  const candidate = params.get("range") as InsightRange | null;
  const filters: InsightFilters = {
    range: candidate && ranges.includes(candidate) ? candidate : "30d",
    compare: params.get("compare") !== "false",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    start_date: params.get("start_date") ?? undefined,
    end_date: params.get("end_date") ?? undefined,
  };
  const update = (changes: Partial<InsightFilters>) => {
    const next = { ...filters, ...changes };
    if (next.range === "custom" && !next.start_date && !next.end_date) {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      next.start_date = toDateInput(start);
      next.end_date = toDateInput(end);
    }
    setParams((current) => {
      const values = new URLSearchParams(current);
      values.set("range", next.range);
      values.set("compare", String(next.compare));
      values.delete("page");
      if (next.range === "custom" && next.start_date && next.end_date) {
        values.set("start_date", next.start_date);
        values.set("end_date", next.end_date);
      } else {
        values.delete("start_date");
        values.delete("end_date");
      }
      return values;
    });
  };
  return { filters, update, params, setParams };
}
