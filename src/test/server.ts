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

export const handlers = [
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
