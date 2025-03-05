export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "member";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "member";
}

export interface AuthResponse {
  access: string;
  refresh: string;
  role: "admin" | "member";
  username: string;
  email: string;
  id: number;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: "admin" | "member";
}
