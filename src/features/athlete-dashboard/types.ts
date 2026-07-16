export type AssignmentStatus =
  "assigned" | "in_progress" | "completed" | "cancelled";

export interface AthleteSelfProfile {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  primary_position: string | null;
  secondary_positions: string[];
  bats: string | null;
  throws: string | null;
  graduation_year: number | null;
  school_name: string | null;
  team_name: string | null;
  status: string;
  created_at: string;
}

export interface AthleteAssignment {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string;
  priority: number;
  status: AssignmentStatus;
  assigned_at: string;
  start_date: string | null;
  due_date: string | null;
  target_sets: number | null;
  target_repetitions: number | null;
  target_duration_minutes: number | null;
  frequency: string | null;
  completion_percentage: number;
  completed_at: string | null;
  overdue: boolean;
  actual_sets?: number | null;
  actual_repetitions?: number | null;
  actual_duration_minutes?: number | null;
}

export interface AthleteGoal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  target_date: string | null;
  status: string;
  priority: number;
  completed_at: string | null;
}

export interface AthleteTimelineEvent {
  id: string;
  event_type: string;
  event_category: string;
  title: string;
  description: string | null;
  occurred_at: string;
  metadata: Record<string, string | number | boolean | null>;
}

export interface AthleteDashboard {
  athlete: {
    first_name: string;
    preferred_name: string | null;
    primary_position: string | null;
  };
  progress_status: { code: string; label: string; reason: string };
  drill_summary: {
    active: number;
    in_progress: number;
    completed: number;
    overdue: number;
    completion_rate: number;
  };
  goal_summary: { active: number; completed: number };
  feedback_summary: {
    athlete_visible_approved_count: number | null;
    latest_approved_at: string | null;
    available: boolean;
  };
  recent_assignments: AthleteAssignment[];
  upcoming_due_assignments: AthleteAssignment[];
  active_goals: AthleteGoal[];
  recent_timeline: AthleteTimelineEvent[];
  partial_data: boolean;
}

export interface Page<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
