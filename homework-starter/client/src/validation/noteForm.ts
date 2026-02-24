import { z } from "zod";

export const NoteFormSchema = z.object({
  title: z.string().trim().min(5, "Минимум 5 символов"),
  text: z
    .string()
    .trim()
    .min(10, "Минимум 10 символов")
    .max(300, "Максимум 300 символов"),
});

export type NoteFormValues = z.infer<typeof NoteFormSchema>;
