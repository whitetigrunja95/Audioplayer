import { session } from "../model/session";

const API_BASE = "http://127.0.0.1:8000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type HttpMethod = "GET" | "POST" | "DELETE";

interface RequestOptions<TBody> {
  method: HttpMethod;
  path: string;
  body?: TBody;
  auth?: boolean;
}

export async function apiRequest<TResponse, TBody = unknown>(
  opts: RequestOptions<TBody>,
): Promise<TResponse> {
  const headers: Record<string, string> = {};

  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (opts.auth) {
    const token = session.getToken();
    if (!token) throw new ApiError("Нет токена. Нужна авторизация.", 401);
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${opts.path}`, {
      method: opts.method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("Не удалось подключиться к серверу (backend не запущен?)", 0);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = (isJson ? await res.json() : null) as unknown;

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : `HTTP ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data as TResponse;
}
