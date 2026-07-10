export interface AuthUser {
  id: string;
  email: string;
  role: "coach" | "athlete" | "admin";
  is_active: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: AuthUser;
}
