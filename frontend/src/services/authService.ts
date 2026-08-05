import axios, { isAxiosError } from "axios";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

type LoginResponse = {
  accessToken: string;
  user: User;
};

type RegisterResponse = {
  message: string;
  user: User;
};

type ErrorResponse = {
  message?: string;
};

export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL });

export const setAuthToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common.Authorization;
};

export const getApiErrorMessage = (error: unknown, fallback = "Operation failed") => {
  if (isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await api.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },

  register: async (payload: RegisterPayload) => {
    const response = await api.post<RegisterResponse>("/auth/register", payload);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getProfile: async (token: string) => {
    const response = await api.get<User>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
