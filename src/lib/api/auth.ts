import type { AuthResponse, SignupRequest, LoginRequest, User } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001";

async function handleAuthResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Auth error: ${response.status}`);
  }

  return data;
}

export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleAuthResponse(response);
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleAuthResponse(response);
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  const data = await handleAuthResponse(response);
  return data.user;
}

export async function refreshToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  const data = await handleAuthResponse(response);
  return data.accessToken;
}
