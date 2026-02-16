import type { Track } from "./types";

export function resolveTrackSrc(track: Track): string {
  if (track.audioUrl) return track.audioUrl;
  return "";
}
