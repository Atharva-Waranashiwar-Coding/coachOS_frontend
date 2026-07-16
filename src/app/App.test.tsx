import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  assignment,
  athlete,
  athleteAssignment,
  athleteInsights,
  athleteUser,
  attentionItem,
  coachInsights,
  drill,
  server,
} from "../test/server";
import { authenticate, renderApp } from "../test/renderApp";

describe("authentication", () => {
  it("logs in and opens the coach workspace", async () => {
    const user = userEvent.setup();
    renderApp("/athletes");
    expect(
      await screen.findByRole("heading", { name: "Sign in to CoachOS" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), "coach@example.com");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Welcome back")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Athletes" }));
    expect(
      await screen.findByRole("heading", { name: "Athletes", level: 1 }),
    ).toBeInTheDocument();
  });

  it("shows invalid credential feedback", async () => {
    server.use(
      http.post("http://localhost:8000/auth/login", () =>
        HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    renderApp("/login");
    await user.type(screen.getByLabelText("Email"), "coach@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email or password is incorrect",
    );
  });

  it("restores a session, redirects public-only routes, and logs out", async () => {
    authenticate();
    const user = userEvent.setup();
    renderApp("/login");
    expect(await screen.findByText("Welcome back")).toBeInTheDocument();
    const logoutButtons = screen.getAllByTitle("Log out");
    await user.click(logoutButtons[0]!);
    expect(
      await screen.findByRole("heading", { name: "Sign in to CoachOS" }),
    ).toBeInTheDocument();
    expect(window.sessionStorage.getItem("coachos.access-token")).toBeNull();
  });

  it("clears the session after a protected API returns 401", async () => {
    authenticate();
    server.use(
      http.get("http://localhost:8001/api/v1/athletes", () =>
        HttpResponse.json({ detail: "Expired" }, { status: 401 }),
      ),
    );
    renderApp("/dashboard");
    expect(
      await screen.findByRole("heading", { name: "Sign in to CoachOS" }),
    ).toBeInTheDocument();
    expect(window.sessionStorage.getItem("coachos.access-token")).toBeNull();
  });
});

describe("athlete workflows", () => {
  it("renders the list and keeps search, filters, and pagination in requests", async () => {
    authenticate();
    const requests: URL[] = [];
    server.use(
      http.get("http://localhost:8001/api/v1/athletes", ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json({
          items: [athlete],
          page: Number(new URL(request.url).searchParams.get("page") ?? 1),
          page_size: 10,
          total: 15,
          total_pages: 2,
        });
      }),
    );
    const user = userEvent.setup();
    renderApp("/athletes?status=active");
    expect((await screen.findAllByText(/Maya Torres/)).length).toBeGreaterThan(
      0,
    );
    await user.selectOptions(
      screen.getByLabelText("Primary position"),
      "shortstop",
    );
    await user.type(screen.getByLabelText("Search athletes"), "Maya");
    await waitFor(
      () =>
        expect(
          requests.some(
            (url) =>
              url.searchParams.get("search") === "Maya" &&
              url.searchParams.get("primary_position") === "shortstop",
          ),
        ).toBe(true),
      { timeout: 2000 },
    );
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await waitFor(() =>
      expect(requests.some((url) => url.searchParams.get("page") === "2")).toBe(
        true,
      ),
    );
  });

  it("renders profile overview, goals, and timeline from separate requests", async () => {
    authenticate();
    const user = userEvent.setup();
    renderApp(`/athletes/${athlete.id}`);
    expect(
      await screen.findByText("Return-to-play plan active."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "goals" }));
    expect(
      await screen.findByText("Improve first-step speed"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "timeline" }));
    expect(
      await screen.findByText("Athlete profile updated"),
    ).toBeInTheDocument();
  });

  it("validates and creates an athlete", async () => {
    authenticate();
    let payload: Record<string, unknown> | undefined;
    server.use(
      http.post(
        "http://localhost:8001/api/v1/athletes",
        async ({ request }) => {
          payload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...athlete, ...payload }, { status: 201 });
        },
      ),
    );
    const user = userEvent.setup();
    renderApp("/athletes/new");
    await user.click(
      await screen.findByRole("button", { name: "Create athlete" }),
    );
    expect(await screen.findAllByRole("alert")).toHaveLength(2);
    await user.type(screen.getByLabelText("First name"), "Maya");
    await user.type(screen.getByLabelText("Last name"), "Torres");
    await user.selectOptions(
      screen.getByLabelText("Primary position"),
      "shortstop",
    );
    await user.click(screen.getByRole("button", { name: "Create athlete" }));
    await waitFor(() =>
      expect(payload).toMatchObject({
        first_name: "Maya",
        last_name: "Torres",
        primary_position: "shortstop",
      }),
    );
    expect(await screen.findByText("Athlete created")).toBeInTheDocument();
  });

  it("edits an athlete and maps backend field validation", async () => {
    authenticate();
    server.use(
      http.patch(`http://localhost:8001/api/v1/athletes/${athlete.id}`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ["body", "email"],
                msg: "Email is already used",
                type: "value_error",
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderApp(`/athletes/${athlete.id}/edit`);
    const email = await screen.findByLabelText("Email");
    await user.clear(email);
    await user.type(email, "other@example.com");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(
      await screen.findByText("Email is already used"),
    ).toBeInTheDocument();
  });

  it("requires confirmation before archiving and supports restore", async () => {
    authenticate();
    let archived = false;
    server.use(
      http.delete(`http://localhost:8001/api/v1/athletes/${athlete.id}`, () => {
        archived = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.get(`http://localhost:8001/api/v1/athletes/${athlete.id}`, () =>
        HttpResponse.json({
          ...athlete,
          status: archived ? "archived" : "active",
          archived_at: archived ? "2026-07-10T12:00:00Z" : null,
        }),
      ),
      http.post(
        `http://localhost:8001/api/v1/athletes/${athlete.id}/restore`,
        () => {
          archived = false;
          return HttpResponse.json(athlete);
        },
      ),
    );
    const user = userEvent.setup();
    renderApp(`/athletes/${athlete.id}`);
    await user.click(
      (await screen.findAllByRole("button", { name: "Archive" }))[0]!,
    );
    expect(
      screen.getByRole("dialog", { name: "Archive athlete?" }),
    ).toBeInTheDocument();
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Archive athlete",
      }),
    );
    expect(
      await screen.findByRole("button", { name: "Restore" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(
      (await screen.findAllByRole("button", { name: "Archive" })).length,
    ).toBeGreaterThan(0);
  });

  it("creates, completes, and cancels goals", async () => {
    authenticate();
    const calls = { created: 0, completed: 0, cancelled: 0 };
    server.use(
      http.post(
        `http://localhost:8001/api/v1/athletes/${athlete.id}/goals`,
        () => {
          calls.created += 1;
          return HttpResponse.json({}, { status: 201 });
        },
      ),
      http.patch(
        `http://localhost:8001/api/v1/athletes/${athlete.id}/goals/:goalId`,
        async ({ request }) => {
          if (
            ((await request.json()) as { status?: string }).status ===
            "completed"
          )
            calls.completed += 1;
          return HttpResponse.json({});
        },
      ),
      http.delete(
        `http://localhost:8001/api/v1/athletes/${athlete.id}/goals/:goalId`,
        () => {
          calls.cancelled += 1;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );
    const user = userEvent.setup();
    renderApp(`/athletes/${athlete.id}?tab=goals`);
    await user.click(await screen.findByRole("button", { name: "Add goal" }));
    await user.type(
      screen.getByLabelText("Title"),
      "Improve throwing accuracy",
    );
    await user.click(screen.getByRole("button", { name: "Create goal" }));
    await waitFor(() => expect(calls.created).toBe(1));
    await user.click(screen.getByRole("button", { name: "Complete" }));
    await waitFor(() => expect(calls.completed).toBe(1));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Cancel goal",
      }),
    );
    await waitFor(() => expect(calls.cancelled).toBe(1));
  });

  it("shows loading, empty, API error, and not-found states", async () => {
    authenticate();
    server.use(
      http.get("http://localhost:8001/api/v1/athletes", () =>
        HttpResponse.json({
          items: [],
          page: 1,
          page_size: 10,
          total: 0,
          total_pages: 0,
        }),
      ),
    );
    const { unmount } = renderApp("/athletes");
    expect(await screen.findByText("No athletes yet")).toBeInTheDocument();
    unmount();
    renderApp("/does-not-exist");
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
  });
});

describe("drill workflows", () => {
  it("renders, filters, archives, and restores the drill library", async () => {
    authenticate();
    const requests: URL[] = [];
    let archived = false;
    server.use(
      http.get("http://localhost:8001/api/v1/drills", ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json({
          items: [{ ...drill, status: archived ? "archived" : "active" }],
          page: 1,
          page_size: 12,
          total: 1,
          total_pages: 1,
        });
      }),
      http.delete(`http://localhost:8001/api/v1/drills/${drill.id}`, () => {
        archived = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(
        `http://localhost:8001/api/v1/drills/${drill.id}/restore`,
        () => {
          archived = false;
          return HttpResponse.json(drill);
        },
      ),
    );
    const user = userEvent.setup();
    renderApp("/drills");
    expect(await screen.findByText(drill.title)).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText("Drill category"),
      "footwork",
    );
    await waitFor(() =>
      expect(
        requests.some((url) => url.searchParams.get("category") === "footwork"),
      ).toBe(true),
    );
    await user.type(screen.getByLabelText("Search drills"), "reaction");
    await waitFor(() =>
      expect(
        requests.some(
          (url) =>
            url.searchParams.get("category") === "footwork" &&
            url.searchParams.get("search") === "reaction",
        ),
      ).toBe(true),
    );
    await user.click(screen.getByRole("button", { name: "Archive" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Archive drill",
      }),
    );
    await waitFor(() => expect(archived).toBe(true));
  });

  it("validates and creates a reusable drill", async () => {
    authenticate();
    let payload: Record<string, unknown> | undefined;
    server.use(
      http.post("http://localhost:8001/api/v1/drills", async ({ request }) => {
        payload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...drill, ...payload }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderApp("/drills/new");
    await user.click(
      await screen.findByRole("button", { name: "Create drill" }),
    );
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Title"), "Reaction ladder");
    await user.type(
      screen.getByLabelText("Instructions"),
      "Complete three controlled rounds.",
    );
    await user.type(screen.getByLabelText("Equipment"), "cones, Cones, ladder");
    await user.type(screen.getByLabelText("Tags"), "speed, reaction");
    await user.click(screen.getByRole("button", { name: "Create drill" }));
    await waitFor(() =>
      expect(payload).toMatchObject({
        title: "Reaction ladder",
        equipment: ["cones", "Cones", "ladder"],
        tags: ["speed", "reaction"],
      }),
    );
  });

  it("assigns from the library and an approved recommendation explicitly", async () => {
    authenticate();
    const payloads: Array<Record<string, unknown>> = [];
    server.use(
      http.post(
        `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments`,
        async ({ request }) => {
          payloads.push((await request.json()) as Record<string, unknown>);
          return HttpResponse.json(assignment, { status: 201 });
        },
      ),
    );
    const user = userEvent.setup();
    const first = renderApp(`/athletes/${athlete.id}?tab=drills`);
    await user.click(
      await screen.findByRole("button", { name: "Assign drill" }),
    );
    await user.selectOptions(screen.getByLabelText("Library drill"), drill.id);
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Assign drill",
      }),
    );
    await waitFor(() =>
      expect(payloads[0]).toMatchObject({
        mode: "library",
        drill_id: drill.id,
      }),
    );
    first.unmount();

    renderApp(
      `/athletes/${athlete.id}?tab=drills&assign=review&review_id=55555555-5555-4555-8555-555555555555&recommendation=0`,
    );
    expect(
      await screen.findByText("Approved crossover step"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByLabelText(
        "Save this recommendation as a new private library drill",
      ),
    );
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Assign drill",
      }),
    );
    await waitFor(() =>
      expect(payloads[1]).toMatchObject({
        mode: "review",
        source_review_id: "55555555-5555-4555-8555-555555555555",
        source_recommendation_index: 0,
        save_to_library: true,
      }),
    );
  });

  it("starts and completes an assignment with confirmation details", async () => {
    authenticate();
    const calls = { started: 0, completed: 0 };
    server.use(
      http.post(
        `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments/${assignment.id}/start`,
        () => {
          calls.started += 1;
          return HttpResponse.json({ ...assignment, status: "in_progress" });
        },
      ),
      http.post(
        `http://localhost:8001/api/v1/athletes/${athlete.id}/drill-assignments/${assignment.id}/complete`,
        async ({ request }) => {
          const body = (await request.json()) as {
            actual_duration_minutes?: number;
          };
          if (body.actual_duration_minutes === 18) calls.completed += 1;
          return HttpResponse.json({
            ...assignment,
            status: "completed",
            completion_percentage: 100,
          });
        },
      ),
    );
    const user = userEvent.setup();
    renderApp(`/athletes/${athlete.id}/drills/${assignment.id}`);
    await user.click(await screen.findByRole("button", { name: "Start" }));
    await waitFor(() => expect(calls.started).toBe(1));
    await user.click(screen.getByRole("button", { name: "Complete" }));
    expect(
      screen.getByRole("dialog", { name: "Complete assignment?" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Actual duration"), "18");
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Confirm completion",
      }),
    );
    await waitFor(() => expect(calls.completed).toBe(1));
  });
});

describe("athlete workspace", () => {
  function useAthleteSession() {
    server.use(
      http.get("http://localhost:8000/auth/me", () =>
        HttpResponse.json(athleteUser),
      ),
    );
    authenticate();
  }

  it("restores the athlete role and redirects to the athlete dashboard", async () => {
    useAthleteSession();
    renderApp("/login");
    expect(
      await screen.findByRole("heading", { name: "Welcome, MJ" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("navigation", { name: "Athlete navigation" }),
    ).toHaveLength(2);
  });

  it("keeps coach and athlete routes separated by role", async () => {
    useAthleteSession();
    const athleteView = renderApp("/dashboard");
    expect(
      await screen.findByRole("heading", {
        name: "This page is not available",
      }),
    ).toBeInTheDocument();
    athleteView.unmount();

    server.use(
      http.get("http://localhost:8000/auth/me", () =>
        HttpResponse.json({
          id: "22222222-2222-4222-8222-222222222222",
          email: "coach@example.com",
          role: "coach",
        }),
      ),
    );
    renderApp("/athlete/dashboard");
    expect(
      await screen.findByRole("heading", {
        name: "This page is not available",
      }),
    ).toBeInTheDocument();
  });

  it("renders athlete dashboard data and approved feedback", async () => {
    useAthleteSession();
    const first = renderApp("/athlete/dashboard");
    expect(await screen.findByText("On track")).toBeInTheDocument();
    expect(screen.getByText("Improve first-step speed")).toBeInTheDocument();
    expect(
      screen.getByText("approved feedback reviews available"),
    ).toBeInTheDocument();
    first.unmount();

    renderApp("/athlete/feedback");
    expect(
      await screen.findByText("Keep building on your quick first step."),
    ).toBeInTheDocument();
  });

  it("shows athlete-safe drill detail and submits progress", async () => {
    useAthleteSession();
    let submitted: Record<string, unknown> | undefined;
    server.use(
      http.post(
        `http://localhost:8001/api/v1/athlete/drill-assignments/${athleteAssignment.id}/progress`,
        async ({ request }) => {
          submitted = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            ...athleteAssignment,
            ...submitted,
            status: "in_progress",
          });
        },
      ),
    );
    const user = userEvent.setup();
    renderApp(`/athlete/drills/${athleteAssignment.id}`);
    expect(
      await screen.findByText(athleteAssignment.instructions),
    ).toBeInTheDocument();
    expect(screen.queryByText("Private cue")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Update progress" }));
    const percentage = screen.getByLabelText("Completion percentage");
    await user.clear(percentage);
    await user.type(percentage, "40");
    await user.type(
      screen.getByLabelText("Note for your coach"),
      "Worked through three rounds.",
    );
    await user.click(screen.getByRole("button", { name: "Save progress" }));
    await waitFor(() =>
      expect(submitted).toMatchObject({
        completion_percentage: 40,
        athlete_note: "Worked through three rounds.",
      }),
    );
  });
});

describe("coach progress insights", () => {
  it("renders athlete metrics, recurring feedback, partial data, and safe source links", async () => {
    authenticate();
    renderApp(`/athletes/${athlete.id}/insights?range=30d&compare=true`);

    expect(
      await screen.findByRole("heading", {
        name: "MJ's progress insights",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Some insight data is temporarily unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByText("Swing timing")).toBeInTheDocument();
    expect(
      screen.getAllByText("Mentioned in 2 approved reviews").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "View related feedback" })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "View related feedback" })[0],
    ).toHaveAttribute("href", `/athletes/${athlete.id}/reviews`);
    expect(
      screen.getByLabelText("Weekly drill completions"),
    ).toBeInTheDocument();
    expect(screen.queryByText(athlete.injury_notes)).not.toBeInTheDocument();
    expect(screen.queryByText("Private cue")).not.toBeInTheDocument();
    expect(screen.queryByText(/raw ai output/i)).not.toBeInTheDocument();
  });

  it("keeps the range and comparison controls in the request URL", async () => {
    authenticate();
    const requests: URL[] = [];
    server.use(
      http.get(
        `http://localhost:8001/api/v1/athletes/${athlete.id}/insights`,
        ({ request }) => {
          requests.push(new URL(request.url));
          return HttpResponse.json(athleteInsights);
        },
      ),
    );
    const user = userEvent.setup();
    renderApp(`/athletes/${athlete.id}/insights`);
    await screen.findByText("Swing timing");

    await user.selectOptions(screen.getByLabelText("Date range"), "7d");
    await user.click(screen.getByLabelText("Compare previous period"));

    await waitFor(() =>
      expect(
        requests.some(
          (url) =>
            url.searchParams.get("range") === "7d" &&
            url.searchParams.get("compare") === "false",
        ),
      ).toBe(true),
    );
  });

  it("renders the coach overview without a leaderboard", async () => {
    authenticate();
    renderApp("/insights?range=30d");

    expect(
      await screen.findByRole("heading", { name: "Progress insights" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Attention preview")).toBeInTheDocument();
    expect(screen.getByText("Recent progress")).toBeInTheDocument();
    expect(screen.getAllByText("Swing timing").length).toBeGreaterThan(0);
    expect(screen.queryByText(/leaderboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
    expect(coachInsights.completed_practice_sessions_during_period).toBeNull();
  });

  it("filters, sorts, paginates, and opens an athlete from the attention queue", async () => {
    authenticate();
    const requests: URL[] = [];
    server.use(
      http.get(
        "http://localhost:8001/api/v1/coach/insights/athletes-needing-attention",
        ({ request }) => {
          const url = new URL(request.url);
          requests.push(url);
          return HttpResponse.json({
            items: [attentionItem],
            page: Number(url.searchParams.get("page") ?? 1),
            page_size: 20,
            total: 21,
            total_pages: 2,
            data_completeness: athleteInsights.data_completeness,
          });
        },
      ),
    );
    const user = userEvent.setup();
    renderApp("/insights/attention");

    expect(await screen.findByText("Maya Torres")).toBeInTheDocument();
    expect(screen.getByText(/Latest feedback:/)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Severity"), "warning");
    await waitFor(() =>
      expect(
        requests.some((url) => url.searchParams.get("severity") === "warning"),
      ).toBe(true),
    );
    await user.selectOptions(
      screen.getByLabelText("Sort attention items"),
      "overdue_count",
    );
    await waitFor(() =>
      expect(
        requests.some(
          (url) =>
            url.searchParams.get("severity") === "warning" &&
            url.searchParams.get("sort_by") === "overdue_count",
        ),
      ).toBe(true),
    );
    await user.type(screen.getByLabelText("Search attention items"), "Maya");
    await waitFor(() =>
      expect(
        requests.some(
          (url) =>
            url.searchParams.get("severity") === "warning" &&
            url.searchParams.get("sort_by") === "overdue_count" &&
            url.searchParams.get("search") === "Maya",
        ),
      ).toBe(true),
    );
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await waitFor(() =>
      expect(requests.some((url) => url.searchParams.get("page") === "2")).toBe(
        true,
      ),
    );
    expect(
      screen.getByRole("link", { name: "Open Maya insights" }),
    ).toHaveAttribute("href", `/athletes/${athlete.id}/insights`);
  });
});
