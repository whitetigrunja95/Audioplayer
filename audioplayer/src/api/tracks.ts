import { apiRequest } from "./client";
import type { Track } from "../model/types";

export function getTracks(): Promise<Track[]> {
  return apiRequest<Track[]>({
    method: "GET",
    path: "/tracks",
    auth: true,
  });
}
