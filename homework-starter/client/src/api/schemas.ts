import { z } from "zod";

export const MeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
});

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  userId: z.string(),
  createdAt: z.number(),
});

export const NotesResponseSchema = z.object({
  list: z.array(NoteSchema),
  pageCount: z.number(),
});

export type Me = z.infer<typeof MeSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type NotesResponse = z.infer<typeof NotesResponseSchema>;
