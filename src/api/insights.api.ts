import { athleteClient } from "./api-client";

export type InsightRange = "7d" | "30d" | "60d" | "90d" | "custom";
export type TrendDirection =
  "improving" | "stable" | "declining" | "insufficient_data";

export interface InsightFilters {
  range: InsightRange;
  compare: boolean;
  timezone?: string;
  start_date?: string;
  end_date?: string;
}

export interface DataCompleteness {
  review_data_available: boolean;
  media_data_available: boolean;
  partial: boolean;
  warnings: string[];
}

export interface CountComparison {
  current: number;
  previous: number | null;
  absolute_change: number | null;
}

export interface RateTrend {
  current_value: number | null;
  previous_value: number | null;
  absolute_change: number | null;
  percentage_point_change: number | null;
  direction: TrendDirection;
  current_sample_size: number;
  previous_sample_size: number;
}

export interface AttentionFlag {
  code: string;
  severity: "info" | "warning" | "high";
  title: string;
  description: string;
  source: string;
  detected_at: string;
  related_entity_ids: string[];
  recommended_action: string | null;
}

export interface AthleteInsightSummary {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  primary_position: string | null;
  status: string;
}

export interface DrillPeriodMetrics {
  assigned_count: number;
  started_count: number;
  completed_count: number;
  completed_during_period: number;
  cancelled_count: number;
  active_count: number;
  in_progress_count: number;
  overdue_count: number;
  completion_rate: number | null;
  completion_rate_sample_size: number;
  on_time_completion_rate: number | null;
  on_time_sample_size: number;
  average_completion_days: number | null;
  median_completion_days: number | null;
  average_progress_percentage: number | null;
  assignments_due_next_7_days: number;
}

export interface GoalPeriodMetrics {
  active_count: number;
  completed_count: number;
  paused_count: number;
  cancelled_count: number;
  created_during_period: number;
  completed_during_period: number;
  completion_rate: number | null;
  completion_rate_sample_size: number;
  due_next_14_days: number;
  overdue_count: number;
  next_due_date: string | null;
  category_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
}

export interface RecurringInsightItem {
  key: string;
  display_label: string;
  taxonomy_code: string | null;
  occurrence_count: number;
  distinct_review_count: number;
  first_seen_at: string;
  last_seen_at: string;
  high_priority_count: number;
  related_review_ids: string[];
  related_assignment_count: number;
  current_mentions: number;
  previous_mentions: number;
  trend: "increasing" | "stable" | "decreasing" | "insufficient_data";
}

export interface AthleteProgressInsights {
  athlete: AthleteInsightSummary;
  period: {
    range: string;
    timezone: string;
    start: string;
    end: string;
    previous_start: string | null;
    previous_end: string | null;
  };
  activity: {
    practice_sessions_created: CountComparison;
    practice_sessions_completed: CountComparison;
    videos_uploaded: CountComparison;
    approved_reviews: CountComparison;
    drills_assigned: CountComparison;
    drills_started: CountComparison;
    drills_completed: CountComparison;
    goals_created: CountComparison;
    goals_completed: CountComparison;
    athlete_visible_timeline_events: CountComparison;
    last_qualifying_activity: string | null;
  } | null;
  drills: {
    current: DrillPeriodMetrics;
    previous: DrillPeriodMetrics | null;
    completion_trend: RateTrend;
    weekly_completions: Array<{ period_start: string; value: number }>;
  } | null;
  goals: {
    current: GoalPeriodMetrics;
    previous: GoalPeriodMetrics | null;
    completion_trend: RateTrend;
    weekly_completions: Array<{ period_start: string; value: number }>;
  } | null;
  reviews: {
    approved_review_count: CountComparison;
    latest_approved_at: string | null;
    review_type_distribution: Record<string, number>;
    recurring_improvement_areas: RecurringInsightItem[];
    recurring_strengths: RecurringInsightItem[];
    weekly_approved_reviews: Array<{ period_start: string; value: number }>;
  } | null;
  attention_flags: AttentionFlag[] | null;
  trend_summaries: RateTrend[];
  recent_milestones: Array<{
    athlete_id: string;
    athlete_name: string;
    event_type: string;
    title: string;
    occurred_at: string;
  }>;
  data_completeness: DataCompleteness;
  generated_at: string;
}

export interface CoachAttentionItem {
  athlete: AthleteInsightSummary;
  attention_flags: AttentionFlag[];
  overdue_assignment_count: number;
  active_assignment_count: number;
  last_qualifying_activity: string | null;
  latest_approved_feedback_date: string | null;
  next_goal_due_date: string | null;
}

export interface CoachInsights {
  period: AthleteProgressInsights["period"];
  active_athlete_count: number;
  athletes_with_attention_flags: number;
  total_overdue_assignments: number;
  total_active_assignments: number;
  completed_drills_during_period: number;
  approved_reviews_during_period: number | null;
  completed_practice_sessions_during_period: number | null;
  top_recurring_improvement_areas: RecurringInsightItem[];
  recent_progress_items: Array<{
    athlete_id: string;
    athlete_name: string;
    event_type: string;
    title: string;
    occurred_at: string;
  }>;
  attention_items: CoachAttentionItem[];
  attention_page: number;
  attention_page_size: number;
  attention_total: number;
  attention_total_pages: number;
  data_completeness: DataCompleteness;
  generated_at: string;
}

export interface CoachAttentionPage {
  items: CoachAttentionItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  data_completeness: DataCompleteness;
}

function query(filters: InsightFilters) {
  return {
    range: filters.range,
    compare: filters.compare,
    timezone: filters.timezone,
    start_date: filters.range === "custom" ? filters.start_date : undefined,
    end_date: filters.range === "custom" ? filters.end_date : undefined,
  };
}

export async function getAthleteInsights(
  athleteId: string,
  filters: InsightFilters,
  signal?: AbortSignal,
): Promise<AthleteProgressInsights> {
  const response = await athleteClient.get(
    `/api/v1/athletes/${athleteId}/insights`,
    { params: query(filters), signal },
  );
  return response.data;
}

export async function getCoachInsights(
  filters: InsightFilters,
  signal?: AbortSignal,
): Promise<CoachInsights> {
  const response = await athleteClient.get("/api/v1/coach/insights", {
    params: query(filters),
    signal,
  });
  return response.data;
}

export async function getCoachAttention(
  filters: InsightFilters & {
    severity?: string;
    flag_code?: string;
    primary_position?: string;
    search?: string;
    sort_by?: string;
    page: number;
    page_size: number;
  },
  signal?: AbortSignal,
): Promise<CoachAttentionPage> {
  const {
    severity,
    flag_code,
    primary_position,
    search,
    sort_by,
    page,
    page_size,
  } = filters;
  const response = await athleteClient.get(
    "/api/v1/coach/insights/athletes-needing-attention",
    {
      params: {
        ...query(filters),
        severity,
        flag_code,
        primary_position,
        search,
        sort_by,
        page,
        page_size,
      },
      signal,
    },
  );
  return response.data;
}
