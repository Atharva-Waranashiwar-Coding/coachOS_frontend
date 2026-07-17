import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const athlete = {
  id: "11111111-1111-4111-8111-111111111111",
  first_name: "Maya",
  last_name: "Torres",
  preferred_name: "MJ",
  email: "maya@example.com",
  phone: "555-0100",
  date_of_birth: "2007-04-12",
  primary_position: "shortstop",
  secondary_positions: ["second_base"],
  bats: "right",
  throws: "right",
  graduation_year: 2026,
  school_name: "Lincoln High",
  team_name: "Falcons",
  height_inches: 66,
  weight_pounds: 140,
  injury_notes: "Return-to-play plan active.",
  general_notes: "Working on first-step quickness.",
  status: "active",
  archived_at: null,
  created_at: "2026-01-10T12:00:00Z",
  updated_at: "2026-07-09T12:00:00Z",
};

export const user = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "coach@example.com",
  role: "coach",
  is_active: true,
};
export const athleteUser = {
  id: "66666666-6666-4666-8666-666666666666",
  email: "maya@example.com",
  role: "athlete",
  status: "active",
};
export const drill = {
  id: "33333333-3333-4333-8333-333333333333",
  created_by_user_id: user.id,
  title: "First-step reaction",
  description: "Improve initial movement and body control.",
  instructions: "Complete three controlled rounds through the cone pattern.",
  category: "footwork",
  sport: "baseball",
  difficulty: "intermediate",
  equipment: ["cones"],
  estimated_duration_minutes: 15,
  default_sets: 3,
  default_repetitions: 6,
  default_frequency: "Twice weekly",
  tags: ["footwork", "reaction"],
  video_url: null,
  visibility: "private",
  status: "active",
  created_at: "2026-07-10T12:00:00Z",
  updated_at: "2026-07-10T12:00:00Z",
  archived_at: null,
};
export const assignment = {
  id: "44444444-4444-4444-8444-444444444444",
  athlete_id: athlete.id,
  drill_id: drill.id,
  assigned_by_user_id: user.id,
  source_review_id: null,
  source_recommendation_index: null,
  title_snapshot: drill.title,
  description_snapshot: drill.description,
  instructions_snapshot: drill.instructions,
  coach_notes: "Private cue",
  priority: 2,
  status: "assigned",
  assigned_at: "2026-07-12T12:00:00Z",
  start_date: "2026-07-13",
  due_date: "2026-07-20",
  target_sets: 3,
  target_repetitions: 6,
  target_duration_minutes: 15,
  frequency: "Twice weekly",
  completion_percentage: 0,
  actual_sets: null,
  actual_repetitions: null,
  actual_duration_minutes: null,
  completed_at: null,
  cancelled_at: null,
  activities: [
    {
      id: "activity-1",
      event_type: "assigned",
      notes: null,
      progress_value: null,
      occurred_at: "2026-07-12T12:00:00Z",
    },
  ],
  created_at: "2026-07-12T12:00:00Z",
  updated_at: "2026-07-12T12:00:00Z",
};
export const athleteProfile = {
  id: athlete.id,
  first_name: athlete.first_name,
  last_name: athlete.last_name,
  preferred_name: athlete.preferred_name,
  primary_position: athlete.primary_position,
  secondary_positions: athlete.secondary_positions,
  bats: athlete.bats,
  throws: athlete.throws,
  graduation_year: athlete.graduation_year,
  school_name: athlete.school_name,
  team_name: athlete.team_name,
  status: athlete.status,
  created_at: athlete.created_at,
};
export const athleteAssignment = {
  id: assignment.id,
  title: assignment.title_snapshot,
  description: assignment.description_snapshot,
  instructions: assignment.instructions_snapshot,
  priority: assignment.priority,
  status: assignment.status,
  assigned_at: assignment.assigned_at,
  start_date: assignment.start_date,
  due_date: assignment.due_date,
  target_sets: assignment.target_sets,
  target_repetitions: assignment.target_repetitions,
  target_duration_minutes: assignment.target_duration_minutes,
  frequency: assignment.frequency,
  completion_percentage: assignment.completion_percentage,
  completed_at: assignment.completed_at,
  overdue: false,
  actual_sets: assignment.actual_sets,
  actual_repetitions: assignment.actual_repetitions,
  actual_duration_minutes: assignment.actual_duration_minutes,
};
const page = <T>(items: T[]) => ({
  items,
  page: 1,
  page_size: 10,
  total: items.length,
  total_pages: 1,
});

const insightPeriod = {
  range: "30d",
  timezone: "America/New_York",
  start: "2026-06-17T04:00:00Z",
  end: "2026-07-17T04:00:00Z",
  previous_start: "2026-05-18T04:00:00Z",
  previous_end: "2026-06-17T04:00:00Z",
  boundary_policy: "start_inclusive_end_exclusive",
};
const comparison = (current: number, previous: number) => ({
  current,
  previous,
  absolute_change: current - previous,
});
const drillPeriod = {
  assigned_count: 4,
  started_count: 3,
  completed_count: 6,
  completed_during_period: 3,
  cancelled_count: 1,
  active_count: 2,
  in_progress_count: 1,
  overdue_count: 1,
  completion_rate: 75,
  completion_rate_sample_size: 8,
  on_time_completion_rate: 66.7,
  on_time_sample_size: 3,
  average_completion_days: 4.5,
  median_completion_days: 4,
  average_progress_percentage: 45,
  assignments_due_next_7_days: 1,
};
const goalPeriod = {
  active_count: 2,
  completed_count: 3,
  paused_count: 0,
  cancelled_count: 1,
  created_during_period: 1,
  completed_during_period: 1,
  completion_rate: 60,
  completion_rate_sample_size: 5,
  due_next_14_days: 1,
  overdue_count: 0,
  next_due_date: "2026-07-24",
  category_distribution: { speed: 2, fielding: 1 },
  priority_distribution: { "1": 2, "2": 1 },
};
const recurringArea = {
  key: "hitting.timing",
  display_label: "Swing timing",
  taxonomy_code: "hitting.timing",
  occurrence_count: 3,
  distinct_review_count: 2,
  first_seen_at: "2026-06-25T12:00:00Z",
  last_seen_at: "2026-07-15T12:00:00Z",
  high_priority_count: 2,
  related_review_ids: ["review-1", "review-2"],
  related_assignment_count: 1,
  current_mentions: 2,
  previous_mentions: 1,
  trend: "increasing",
};
const attentionFlag = {
  code: "overdue_drills",
  severity: "warning",
  title: "Overdue drill assignments",
  description: "1 drill assignment is past due.",
  source: "drills",
  detected_at: "2026-07-16T12:00:00Z",
  related_entity_ids: [assignment.id],
  recommended_action: "Review priorities and adjust the due date.",
};

export const athleteInsights = {
  athlete: {
    id: athlete.id,
    first_name: athlete.first_name,
    last_name: athlete.last_name,
    preferred_name: athlete.preferred_name,
    primary_position: athlete.primary_position,
    status: athlete.status,
  },
  period: insightPeriod,
  activity: {
    practice_sessions_created: comparison(2, 1),
    practice_sessions_completed: comparison(1, 1),
    videos_uploaded: comparison(2, 0),
    approved_reviews: comparison(2, 1),
    drills_assigned: comparison(4, 2),
    drills_started: comparison(3, 2),
    drills_completed: comparison(3, 1),
    goals_created: comparison(1, 0),
    goals_completed: comparison(1, 1),
    athlete_visible_timeline_events: comparison(5, 3),
    last_qualifying_activity: "2026-07-15T12:00:00Z",
  },
  drills: {
    current: drillPeriod,
    previous: { ...drillPeriod, completion_rate: 62.5 },
    completion_trend: {
      current_value: 75,
      previous_value: 62.5,
      absolute_change: 12.5,
      percentage_point_change: 12.5,
      direction: "improving",
      current_sample_size: 8,
      previous_sample_size: 8,
    },
    weekly_completions: [
      { period_start: "2026-07-01", value: 1 },
      { period_start: "2026-07-08", value: 2 },
    ],
  },
  goals: {
    current: goalPeriod,
    previous: { ...goalPeriod, completion_rate: 50 },
    completion_trend: {
      current_value: 60,
      previous_value: 50,
      absolute_change: 10,
      percentage_point_change: 10,
      direction: "improving",
      current_sample_size: 5,
      previous_sample_size: 4,
    },
    weekly_completions: [{ period_start: "2026-07-08", value: 1 }],
  },
  reviews: {
    approved_review_count: comparison(2, 1),
    latest_approved_at: "2026-07-15T12:00:00Z",
    review_type_distribution: { hitting: 2 },
    recurring_improvement_areas: [recurringArea],
    recurring_strengths: [
      {
        ...recurringArea,
        key: "hitting.balance",
        display_label: "Balanced setup",
        taxonomy_code: "hitting.balance",
        high_priority_count: 0,
        trend: "stable",
      },
    ],
    weekly_approved_reviews: [
      { period_start: "2026-07-01", value: 1 },
      { period_start: "2026-07-08", value: 1 },
    ],
  },
  attention_flags: [attentionFlag],
  trend_summaries: [],
  recent_milestones: [
    {
      athlete_id: athlete.id,
      athlete_name: "Maya Torres",
      event_type: "drill_completed",
      title: "Completed first-step reaction",
      occurred_at: "2026-07-14T12:00:00Z",
    },
  ],
  data_completeness: {
    review_data_available: true,
    media_data_available: false,
    partial: true,
    warnings: ["media_data_unavailable"],
  },
  generated_at: "2026-07-16T12:00:00Z",
};

export const attentionItem = {
  athlete: athleteInsights.athlete,
  attention_flags: [attentionFlag],
  overdue_assignment_count: 1,
  active_assignment_count: 2,
  last_qualifying_activity: "2026-07-15T12:00:00Z",
  latest_approved_feedback_date: "2026-07-15T12:00:00Z",
  next_goal_due_date: "2026-07-24",
};

export const coachInsights = {
  period: insightPeriod,
  active_athlete_count: 1,
  athletes_with_attention_flags: 1,
  total_overdue_assignments: 1,
  total_active_assignments: 2,
  completed_drills_during_period: 3,
  approved_reviews_during_period: 2,
  completed_practice_sessions_during_period: null,
  top_recurring_improvement_areas: [recurringArea],
  recent_progress_items: athleteInsights.recent_milestones,
  attention_items: [attentionItem],
  attention_page: 1,
  attention_page_size: 5,
  attention_total: 1,
  attention_total_pages: 1,
  data_completeness: athleteInsights.data_completeness,
  generated_at: "2026-07-16T12:00:00Z",
};

export const handlers = [
  http.post("http://localhost:8000/auth/signup", () =>
    HttpResponse.json(user, { status: 201 }),
  ),
  http.post("http://localhost:8000/auth/login", () =>
    HttpResponse.json({ access_token: "valid-token", token_type: "bearer" }),
  ),
  http.get("http://localhost:8000/auth/me", () => HttpResponse.json(user)),
  http.post("http://localhost:8000/auth/invitations/accept", () =>
    HttpResponse.json({ status: "active" }),
  ),
  http.get("http://localhost:8001/api/v1/athletes", () =>
    HttpResponse.json(page([athlete])),
  ),
  http.get(`http://localhost:8001/api/v1/athletes/${athlete.id}/insights`, () =>
    HttpResponse.json(athleteInsights),
  ),
  http.get("http://localhost:8001/api/v1/coach/insights", () =>
    HttpResponse.json(coachInsights),
  ),
  http.get(
    "http://localhost:8001/api/v1/coach/insights/athletes-needing-attention",
    ({ request }) => {
      const requestedPage = Number(
        new URL(request.url).searchParams.get("page") ?? 1,
      );
      return HttpResponse.json({
        items: [attentionItem],
        page: requestedPage,
        page_size: 20,
        total: 21,
        total_pages: 2,
        data_completeness: athleteInsights.data_completeness,
      });
    },
  ),
  http.post("http://localhost:8001/api/v1/athletes", async ({ request }) =>
    HttpResponse.json(
      { ...athlete, ...((await request.json()) as object) },
      { status: 201 },
    ),
  ),
  http.get(`http://localhost:8001/api/v1/athletes/${athlete.id}`, () =>
    HttpResponse.json(athlete),
  ),
  http.post(`http://localhost:8001/api/v1/athletes/${athlete.id}/invite`, () =>
    HttpResponse.json(
      {
        athlete_id: athlete.id,
        auth_user_id: athleteUser.id,
        email: athleteUser.email,
        status: "invited",
        invited_at: "2026-07-16T12:00:00Z",
        activated_at: null,
        disabled_at: null,
        development_invitation_url:
          "http://localhost:5173/invitations/accept?token=development-token",
      },
      { status: 201 },
    ),
  ),
  http.patch(
    `http://localhost:8001/api/v1/athletes/${athlete.id}`,
    async ({ request }) =>
      HttpResponse.json({ ...athlete, ...((await request.json()) as object) }),
  ),
  http.delete(
    `http://localhost:8001/api/v1/athletes/${athlete.id}`,
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post(`http://localhost:8001/api/v1/athletes/${athlete.id}/restore`, () =>
    HttpResponse.json({ ...athlete, status: "active" }),
  ),
  http.get("http://localhost:8001/api/v1/drills", () =>
    HttpResponse.json(page([drill])),
  ),
  http.get(`http://localhost:8001/api/v1/drills/${drill.id}`, () =>
    HttpResponse.json(drill),
  ),
  http.post("http://localhost:8001/api/v1/drills", async ({ request }) =>
    HttpResponse.json(
      { ...drill, ...((await request.json()) as object) },
      { status: 201 },
    ),
  ),
  http.patch(
    `http://localhost:8001/api/v1/drills/${drill.id}`,
    async ({ request }) =>
      HttpResponse.json({ ...drill, ...((await request.json()) as object) }),
  ),
  http.delete(
    `http://localhost:8001/api/v1/drills/${drill.id}`,
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post(`http://localhost:8001/api/v1/drills/${drill.id}/restore`, () =>
    HttpResponse.json(drill),
  ),
  http.get(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments`,
    () => HttpResponse.json(page([assignment])),
  ),
  http.get("http://localhost:8001/api/v1/athlete/me", () =>
    HttpResponse.json(athleteProfile),
  ),
  http.get("http://localhost:8001/api/v1/athlete/dashboard", () =>
    HttpResponse.json({
      athlete: {
        first_name: athlete.first_name,
        preferred_name: athlete.preferred_name,
        primary_position: athlete.primary_position,
      },
      progress_status: {
        code: "on_track",
        label: "On track",
        reason: "You have active drills and no overdue assignments.",
      },
      drill_summary: {
        active: 1,
        in_progress: 0,
        completed: 3,
        overdue: 0,
        completion_rate: 75,
      },
      goal_summary: { active: 1, completed: 2 },
      feedback_summary: {
        athlete_visible_approved_count: 1,
        latest_approved_at: "2026-07-15T12:00:00Z",
        available: true,
      },
      recent_assignments: [athleteAssignment],
      upcoming_due_assignments: [athleteAssignment],
      active_goals: [
        {
          id: "goal-1",
          title: "Improve first-step speed",
          description: "Two focused sessions weekly",
          category: "speed",
          target_date: "2026-08-30",
          status: "active",
          priority: 2,
          completed_at: null,
        },
      ],
      recent_timeline: [
        {
          id: "timeline-athlete-1",
          event_type: "drill_assigned",
          event_category: "drill",
          title: "Drill assigned",
          description: athleteAssignment.title,
          occurred_at: "2026-07-12T12:00:00Z",
          metadata: {},
        },
      ],
      partial_data: false,
    }),
  ),
  http.get("http://localhost:8001/api/v1/athlete/drill-assignments", () =>
    HttpResponse.json(page([athleteAssignment])),
  ),
  http.get(
    `http://localhost:8001/api/v1/athlete/drill-assignments/${athleteAssignment.id}`,
    () => HttpResponse.json(athleteAssignment),
  ),
  http.post(
    `http://localhost:8001/api/v1/athlete/drill-assignments/${athleteAssignment.id}/start`,
    () => HttpResponse.json({ ...athleteAssignment, status: "in_progress" }),
  ),
  http.post(
    `http://localhost:8001/api/v1/athlete/drill-assignments/${athleteAssignment.id}/progress`,
    async ({ request }) =>
      HttpResponse.json({
        ...athleteAssignment,
        ...((await request.json()) as object),
        status: "in_progress",
      }),
  ),
  http.post(
    `http://localhost:8001/api/v1/athlete/drill-assignments/${athleteAssignment.id}/complete`,
    () =>
      HttpResponse.json({
        ...athleteAssignment,
        status: "completed",
        completion_percentage: 100,
      }),
  ),
  http.get("http://localhost:8001/api/v1/athlete/goals", () =>
    HttpResponse.json(
      page([
        {
          id: "goal-1",
          title: "Improve first-step speed",
          description: "Two focused sessions weekly",
          category: "speed",
          target_date: "2026-08-30",
          status: "active",
          priority: 2,
          completed_at: null,
        },
      ]),
    ),
  ),
  http.get("http://localhost:8001/api/v1/athlete/timeline", () =>
    HttpResponse.json(
      page([
        {
          id: "timeline-athlete-1",
          event_type: "drill_assigned",
          event_category: "drill",
          title: "Drill assigned",
          description: athleteAssignment.title,
          occurred_at: "2026-07-12T12:00:00Z",
          metadata: {},
        },
      ]),
    ),
  ),
  http.get("http://localhost:8004/api/v1/athlete/reviews", () =>
    HttpResponse.json(
      page([
        {
          review_id: "77777777-7777-4777-8777-777777777777",
          review_type: "fielding",
          athlete_message: "Keep building on your quick first step.",
          summary_excerpt: "Your setup is becoming more consistent.",
          approved_at: "2026-07-15T12:00:00Z",
          session_context: null,
        },
      ]),
    ),
  ),
  http.get(
    "http://localhost:8004/api/v1/athlete/reviews/77777777-7777-4777-8777-777777777777",
    () =>
      HttpResponse.json({
        review_id: "77777777-7777-4777-8777-777777777777",
        review_type: "fielding",
        summary: "Your setup is becoming more consistent.",
        observations: [
          {
            title: "Ready position",
            description: "Your base stayed balanced.",
            category: "technique",
            priority: "medium",
            coach_verified: true,
          },
        ],
        strengths: [
          { title: "First step", description: "Quick initial movement." },
        ],
        improvement_areas: [
          {
            title: "Glove path",
            description: "Keep the glove closer to the ground.",
            priority: "medium",
          },
        ],
        recommended_drills: [],
        athlete_message: "Keep building on your quick first step.",
        approved_at: "2026-07-15T12:00:00Z",
        session_context: null,
      }),
  ),
  http.post(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments`,
    async ({ request }) =>
      HttpResponse.json(
        { ...assignment, ...((await request.json()) as object) },
        { status: 201 },
      ),
  ),
  http.get(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments/${assignment.id}`,
    () => HttpResponse.json(assignment),
  ),
  http.patch(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments/${assignment.id}`,
    async ({ request }) =>
      HttpResponse.json({
        ...assignment,
        ...((await request.json()) as object),
      }),
  ),
  http.post(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments/${assignment.id}/start`,
    () => HttpResponse.json({ ...assignment, status: "in_progress" }),
  ),
  http.post(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments/${assignment.id}/complete`,
    () =>
      HttpResponse.json({
        ...assignment,
        status: "completed",
        completion_percentage: 100,
        completed_at: "2026-07-16T12:00:00Z",
      }),
  ),
  http.post(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments/${assignment.id}/cancel`,
    () =>
      HttpResponse.json({
        ...assignment,
        status: "cancelled",
        cancelled_at: "2026-07-16T12:00:00Z",
      }),
  ),
  http.get(
    "http://localhost:8004/api/v1/reviews/55555555-5555-4555-8555-555555555555/approved",
    () =>
      HttpResponse.json({
        id: "snapshot-1",
        review_id: "55555555-5555-4555-8555-555555555555",
        athlete_id: athlete.id,
        status: "approved",
        source_revision_id: null,
        approved_by_user_id: user.id,
        summary: "Approved review.",
        observations: [],
        strengths: [],
        improvement_areas: [],
        recommended_drills: [
          {
            name: "Approved crossover step",
            description: "Practice a controlled crossover first step.",
            reason: "Supports the approved movement objective.",
            frequency: "Twice weekly",
            difficulty: "intermediate",
            safety_note: null,
          },
        ],
        athlete_message: null,
        visibility: "coach_only",
        approved_at: "2026-07-15T12:00:00Z",
      }),
  ),
  http.get(`http://localhost:8001/api/v1/athletes/${athlete.id}/goals`, () =>
    HttpResponse.json(
      page([
        {
          id: "goal-1",
          athlete_id: athlete.id,
          title: "Improve first-step speed",
          description: "Two focused sessions weekly",
          category: "speed",
          target_date: "2026-08-30",
          status: "active",
          priority: 2,
          created_by_user_id: user.id,
          created_at: "2026-07-01T12:00:00Z",
          updated_at: "2026-07-01T12:00:00Z",
          completed_at: null,
        },
      ]),
    ),
  ),
  http.post(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/goals`,
    async ({ request }) =>
      HttpResponse.json(
        {
          id: "goal-2",
          athlete_id: athlete.id,
          ...((await request.json()) as object),
          status: "active",
          created_by_user_id: user.id,
          created_at: "2026-07-10T12:00:00Z",
          updated_at: "2026-07-10T12:00:00Z",
          completed_at: null,
        },
        { status: 201 },
      ),
  ),
  http.patch(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/goals/:goalId`,
    async ({ request }) =>
      HttpResponse.json({
        id: "goal-1",
        athlete_id: athlete.id,
        title: "Improve first-step speed",
        description: null,
        category: "speed",
        target_date: null,
        priority: 2,
        status: "completed",
        ...((await request.json()) as object),
        created_by_user_id: user.id,
        created_at: "2026-07-01T12:00:00Z",
        updated_at: "2026-07-10T12:00:00Z",
        completed_at: "2026-07-10T12:00:00Z",
      }),
  ),
  http.delete(
    `http://localhost:8001/api/v1/athletes/${athlete.id}/goals/:goalId`,
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.get(`http://localhost:8001/api/v1/athletes/${athlete.id}/timeline`, () =>
    HttpResponse.json(
      page([
        {
          id: "event-1",
          athlete_id: athlete.id,
          event_type: "athlete_updated",
          event_category: "profile",
          title: "Athlete profile updated",
          description: null,
          source_service: "athlete-service",
          source_entity_type: "athlete",
          source_entity_id: athlete.id,
          metadata: {},
          occurred_at: "2026-07-09T12:00:00Z",
          actor_user_id: user.id,
          schema_version: 1,
          visibility: "athlete_visible",
          created_at: "2026-07-09T12:00:00Z",
        },
      ]),
    ),
  ),
];

export const server = setupServer(...handlers);
