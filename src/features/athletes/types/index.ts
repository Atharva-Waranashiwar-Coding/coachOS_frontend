import type { PaginatedResponse } from "../../../types/api";

export const positions = [
  "pitcher",
  "catcher",
  "first_base",
  "second_base",
  "third_base",
  "shortstop",
  "left_field",
  "center_field",
  "right_field",
  "utility",
] as const;
export const athleteStatuses = ["active", "inactive", "archived"] as const;
export const batSides = ["left", "right", "switch"] as const;
export const throwSides = ["left", "right"] as const;
export type Position = (typeof positions)[number];
export type AthleteStatus = (typeof athleteStatuses)[number];
export type BatSide = (typeof batSides)[number];
export type ThrowSide = (typeof throwSides)[number];

export interface AthleteSummary {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  email: string | null;
  primary_position: Position | null;
  secondary_positions: Position[];
  graduation_year: number | null;
  school_name: string | null;
  team_name: string | null;
  status: AthleteStatus;
  created_at: string;
  updated_at: string;
}
export interface AthleteDetail extends AthleteSummary {
  date_of_birth: string | null;
  phone: string | null;
  bats: BatSide | null;
  throws: ThrowSide | null;
  height_inches: number | null;
  weight_pounds: number | null;
  injury_notes: string | null;
  general_notes: string | null;
  archived_at: string | null;
}
export interface AthletePayload {
  first_name: string;
  last_name: string;
  preferred_name?: string | null;
  date_of_birth?: string | null;
  email?: string | null;
  phone?: string | null;
  primary_position?: Position | null;
  secondary_positions: Position[];
  bats?: BatSide | null;
  throws?: ThrowSide | null;
  graduation_year?: number | null;
  school_name?: string | null;
  team_name?: string | null;
  height_inches?: number | null;
  weight_pounds?: number | null;
  injury_notes?: string | null;
  general_notes?: string | null;
}
export interface AthleteListParams {
  page: number;
  page_size: number;
  search?: string;
  status?: AthleteStatus;
  primary_position?: Position;
  sort_by: "first_name" | "last_name" | "created_at" | "updated_at";
  sort_order: "asc" | "desc";
}
export type AthleteListResponse = PaginatedResponse<AthleteSummary>;
