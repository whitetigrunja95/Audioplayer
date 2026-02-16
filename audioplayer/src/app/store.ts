import type { Route, Track } from "../model/types";

export interface AppState {
  route: Route;
  username: string | null;
  tracks: Track[];
  favorites: Set<string>;
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
}

type Listener = (state: AppState) => void;

const listeners = new Set<Listener>();

export const store: AppState = {
  route: "auth",
  username: null,
  tracks: [],
  favorites: new Set<string>(),
  currentTrackId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  error: null,
};

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  fn(store);
  return () => listeners.delete(fn);
}

export function setState(patch: Partial<AppState>): void {
  Object.assign(store, patch);
  listeners.forEach((fn) => fn(store));
}

export function setError(message: string | null): void {
  setState({ error: message });
}

export function setFavorites(ids: string[]): void {
  setState({ favorites: new Set(ids) });
}

export function toggleFavoriteLocal(trackId: string, makeFav: boolean): void {
  const next = new Set(store.favorites);
  if (makeFav) next.add(trackId);
  else next.delete(trackId);
  setState({ favorites: next });
}
