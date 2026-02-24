import { useCallback, useReducer } from "react";
import { NoteSchema } from "../api/schemas";
import type { NoteFormValues } from "../validation/noteForm";

type State =
  | { tag: "idle" }
  | { tag: "loading" }
  | { tag: "success"; submitted: NoteFormValues }
  | { tag: "error"; message: string };

type Event =
  | { type: "START" }
  | { type: "SUCCESS"; submitted: NoteFormValues }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

function reducer(state: State, ev: Event): State {
  switch (state.tag) {
    case "idle":
      if (ev.type === "START") return { tag: "loading" };
      return state;
    case "loading":
      if (ev.type === "SUCCESS") return { tag: "success", submitted: ev.submitted };
      if (ev.type === "ERROR") return { tag: "error", message: ev.message };
      return state;
    case "success":
      if (ev.type === "RESET") return { tag: "idle" };
      if (ev.type === "START") return { tag: "loading" };
      return state;
    case "error":
      if (ev.type === "RESET") return { tag: "idle" };
      if (ev.type === "START") return { tag: "loading" };
      return state;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL?.toString() || "http://127.0.0.1:4000";

export function useCreateNote() {
  const [state, dispatch] = useReducer(reducer, { tag: "idle" } as State);

  const create = useCallback(async (values: NoteFormValues) => {
    dispatch({ type: "START" });

    try {
      const res = await fetch(`${BASE_URL}/notes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          (json && typeof json === "object" && "message" in json && (json as any).message) ||
          `HTTP error ${res.status}`;
        dispatch({ type: "ERROR", message: String(message) });
        return { ok: false as const };
      }

      NoteSchema.parse(json);

      dispatch({ type: "SUCCESS", submitted: values });
      return { ok: true as const };
    } catch (e) {
      dispatch({
        type: "ERROR",
        message: e instanceof Error ? e.message : "Network error",
      });
      return { ok: false as const };
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { state, create, reset };
}
