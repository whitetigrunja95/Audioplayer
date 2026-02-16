import type { Token } from "./types";

const KEY = "audio_player_token";

export const session = {
  getToken(): Token | null {
    return localStorage.getItem(KEY);
  },
  setToken(token: Token): void {
    localStorage.setItem(KEY, token);
  },
  clear(): void {
    localStorage.removeItem(KEY);
  },
};
