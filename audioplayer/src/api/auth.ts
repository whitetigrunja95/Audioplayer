import { apiRequest } from "./client";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
} from "../model/types";

export function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse, RegisterRequest>({
    method: "POST",
    path: "/register",
    body: payload,
    auth: false,
  });
}

export function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse, LoginRequest>({
    method: "POST",
    path: "/login",
    body: payload,
    auth: false,
  });
}
