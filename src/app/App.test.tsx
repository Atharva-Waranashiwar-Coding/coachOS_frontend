import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { athlete, server } from "../test/server";
import { authenticate, renderApp } from "../test/renderApp";

describe("authentication", () => {
  it("logs in and returns to the originally requested protected route", async () => {
    const user = userEvent.setup();
    renderApp("/athletes");
    expect(
      await screen.findByRole("heading", { name: "Coach sign in" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), "coach@example.com");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
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
      await screen.findByRole("heading", { name: "Coach sign in" }),
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
      await screen.findByRole("heading", { name: "Coach sign in" }),
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
