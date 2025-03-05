// src/services/authService.ts
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  RegisterResponse,
} from "../types/auth";
import { api } from "./api";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/login/",
        credentials
      );
      return response.data;
    } catch (error: any) {
      console.error("Login Error:", error.response?.data);

      const errorMessage =
        error.response?.data?.error?.non_field_errors?.[0] ||
        error.response?.data?.error ||
        "Invalid credentials or bad request. Please try again.";

      throw new Error(errorMessage);
    }
  },

  register: async (
    userData: RegisterCredentials
  ): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>(
        "/auth/signup/",
        userData
      );
      return response.data;
    } catch (error: any) {
      console.error("Register Error:", error.response?.data); // Debugging

      const errorMessage =
        error.response?.data?.non_field_errors?.[0] ||
        "An error occurred. Please try again.";

      throw new Error(errorMessage);
    }
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};
