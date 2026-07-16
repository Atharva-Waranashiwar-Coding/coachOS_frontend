export const queryKeys = {
  auth: { all: ["auth"] as const, me: ["auth", "me"] as const },
  athletes: {
    all: ["athletes"] as const,
    lists: () => ["athletes", "list"] as const,
    list: (filters: object) => ["athletes", "list", filters] as const,
    detail: (id: string) => ["athletes", "detail", id] as const,
    goals: (id: string, filters?: object) =>
      ["athletes", id, "goals", filters ?? {}] as const,
    timeline: (id: string, filters?: object) =>
      ["athletes", id, "timeline", filters ?? {}] as const,
    drills: (id: string, filters?: object) =>
      ["athletes", id, "drill-assignments", filters ?? {}] as const,
    drill: (id: string, assignmentId: string) =>
      ["athletes", id, "drill-assignments", assignmentId] as const,
  },
  drills: {
    all: ["drills"] as const,
    list: (filters: object) => ["drills", "list", filters] as const,
    detail: (id: string) => ["drills", "detail", id] as const,
  },
  dashboard: ["dashboard"] as const,
  insights: {
    all: ["insights"] as const,
    coach: (filters: object) => ["insights", "coach", filters] as const,
    athlete: (athleteId: string, filters: object) =>
      ["insights", "athlete", athleteId, filters] as const,
    attention: (filters: object) => ["insights", "attention", filters] as const,
  },
  athlete: {
    me: ["athlete", "me"] as const,
    dashboard: ["athlete", "dashboard"] as const,
    feedbackList: (filters: object) =>
      ["athlete", "feedback", "list", filters] as const,
    feedbackDetail: (id: string) =>
      ["athlete", "feedback", "detail", id] as const,
    assignments: (filters: object) =>
      ["athlete", "assignments", filters] as const,
    assignment: (id: string) => ["athlete", "assignment", id] as const,
    timeline: (filters: object) => ["athlete", "timeline", filters] as const,
    goals: (filters: object) => ["athlete", "goals", filters] as const,
  },
};
