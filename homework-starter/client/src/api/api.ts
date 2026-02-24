const BASE_URL =
  import.meta.env.VITE_API_URL?.toString() || "http://127.0.0.1:4000";


type ApiErrorResponse = {
  message?: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data as ApiErrorResponse | null;
    throw new Error(err?.message || `HTTP error ${res.status}`);
  }

  return data as T;
}

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { username: string; email: string; password: string };

export type MeResponse = { id: string; email: string; username: string };

export function apiLogin(body: LoginRequest) {
  return request<unknown>("/login", { method: "POST", body: JSON.stringify(body) });
}

export function apiRegister(body: RegisterRequest) {
  return request<unknown>("/register", { method: "POST", body: JSON.stringify(body) });
}

export function apiLogout() {
  return request<unknown>("/logout", { method: "POST" });
}

export function apiGetMe() {
  return request<MeResponse>("/users/me", { method: "GET" });
}

export type Note = {
  id: string;
  title: string;
  text: string;
  userId: string;
  createdAt: number;
};

export type NotesResponse = {
  list: Note[];
  pageCount: number;
};

export type CreateNoteRequest = {
  title: string;
  text: string;
};

export function apiGetNotes(page: number) {
  return request<NotesResponse>(`/notes?page=${page}`, { method: "GET" });
}

export function apiCreateNote(body: CreateNoteRequest) {
  return request<Note>("/notes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

