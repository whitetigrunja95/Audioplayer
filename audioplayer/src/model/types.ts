export type Token = string;

export interface UserDTO {
  username: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user?: UserDTO;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token?: Token;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;        
}

export interface FavoriteToggleRequest {
  trackId: string;
}

export type Route = "auth" | "tracks" | "favorites" | "profile";
