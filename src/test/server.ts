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
          title: "Athlete profile updated",
          description: null,
          source_service: "athlete-service",
          source_entity_type: "athlete",
          source_entity_id: athlete.id,
          metadata: {},
          occurred_at: "2026-07-09T12:00:00Z",
          created_by_user_id: user.id,
          created_at: "2026-07-09T12:00:00Z",
        },
      ]),
    ),
  ),
];

export const server = setupServer(...handlers);
