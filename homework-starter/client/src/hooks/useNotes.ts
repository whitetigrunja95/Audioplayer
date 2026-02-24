import { useMemo } from "react";
import { useRequestMachine } from "./useRequestMachine";
import { NotesResponseSchema, type NotesResponse } from "../validation/notes";

const BASE_URL =
  import.meta.env.VITE_API_URL?.toString() || "http://127.0.0.1:4000";

export function useNotes(page: number, enabled: boolean) {

  const options = useMemo<RequestInit>(
    () => ({
      method: "GET",
      cache: "no-store", 
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }),
    [],
  );

  return useRequestMachine<NotesResponse>({
    url: `${BASE_URL}/notes?page=${page}`,
    options,
    schema: NotesResponseSchema,
    enabled,
    deps: [page, enabled],
  });
}
