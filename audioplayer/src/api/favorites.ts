import { apiRequest } from "./client";
import type { Track, FavoriteToggleRequest } from "../model/types";

export function getFavorites(): Promise<Track[]> {
  return apiRequest<Track[]>({
    method: "GET",
    path: "/favorites",
    auth: true,
  });
}

export function addFavorite(trackId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }, FavoriteToggleRequest>({
    method: "POST",
    path: "/favorites",
    auth: true,
    body: { trackId },
  });
}

export function removeFavorite(trackId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }, FavoriteToggleRequest>({
    method: "DELETE",
    path: "/favorites",
    auth: true,
    body: { trackId },
  });
}
