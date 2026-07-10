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
  },
  dashboard: ["dashboard"] as const,
};
