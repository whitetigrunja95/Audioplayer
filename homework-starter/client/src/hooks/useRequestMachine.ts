import { useCallback, useEffect, useReducer } from "react";
import type { ZodSchema } from "zod";

export type RequestState<T> =
  | { tag: "idle" }
  | { tag: "loading" }
  | { tag: "success"; data: T }
  | { tag: "error"; message: string };

type Event<T> =
  | { type: "START" }
  | { type: "RESOLVE"; data: T }
  | { type: "REJECT"; message: string }
  | { type: "RESET" };

function transition<T>(state: RequestState<T>, event: Event<T>): RequestState<T> {
  switch (state.tag) {
    case "idle":
      return event.type === "START" ? { tag: "loading" } : state;

    case "loading":
      if (event.type === "RESOLVE") return { tag: "success", data: event.data };
      if (event.type === "REJECT") return { tag: "error", message: event.message };
      return state;

    case "success":
    case "error":
      if (event.type === "START") return { tag: "loading" };
      if (event.type === "RESET") return { tag: "idle" };
      return state;
  }
}

type Args<T> = {
  url: string;
  options?: RequestInit;
  schema: ZodSchema<T>;
  enabled?: boolean;
  deps?: unknown[];
};

export function useRequestMachine<T>({
  url,
  options,
  schema,
  enabled = true,
  deps = [],
}: Args<T>) {
  const [state, dispatch] = useReducer(transition<T>, { tag: "idle" });

  const run = useCallback(async () => {
    dispatch({ type: "START" });

    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
        ...options,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (json && typeof json === "object" && "message" in json && (json as any).message) ||
          `HTTP error ${res.status}`;
        dispatch({ type: "REJECT", message: String(msg) });
        return;
      }

      const parsed = schema.parse(json);
      dispatch({ type: "RESOLVE", data: parsed });
    } catch (e) {
      dispatch({
        type: "REJECT",
        message: e instanceof Error ? e.message : "Network error",
      });
    }
  }, [url, options, schema]);

  useEffect(() => {
    if (!enabled) return;
    void run();
  }, [enabled, run, ...deps]);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { state, run, reset };
}
