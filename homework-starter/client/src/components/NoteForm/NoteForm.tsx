import { useMemo, useState } from "react";
import { FormField } from "../FormField";
import { Button } from "../Button";
import "./NoteForm.css";
import { NoteFormSchema, type NoteFormValues } from "../../validation/noteForm";

type Props = {
  onSubmit: (values: NoteFormValues) => Promise<{ ok: boolean }>;
  isLoading: boolean;
  errorText: string;
  successValues: NoteFormValues | null;
};

export const NoteForm = ({
  onSubmit,
  isLoading,
  errorText,
  successValues,
}: Props) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const [titleError, setTitleError] = useState("");
  const [textError, setTextError] = useState("");

  const validate = useMemo(() => {
    return () => {
      setTitleError("");
      setTextError("");

      const result = NoteFormSchema.safeParse({ title, text });
      if (!result.success) {
        const formatted = result.error.format();
        setTitleError(formatted.title?._errors?.[0] ?? "");
        setTextError(formatted.text?._errors?.[0] ?? "");
        return null;
      }
      return result.data;
    };
  }, [title, text]);

  const clear = () => {
    setTitle("");
    setText("");
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const values = validate();
    if (!values) return;

    const res = await onSubmit(values);
    
    if (!res.ok || res.ok) {
      clear();
    }
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <FormField label="Заголовок" errorMessage={titleError}>
        <input
          type="text"
          value={title}
          disabled={isLoading}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormField>

      <FormField label="Текст" errorMessage={textError}>
        <textarea
          value={text}
          disabled={isLoading}
          onChange={(e) => setText(e.target.value)}
        />
      </FormField>

      {errorText && (
        <div style={{ color: "crimson", marginTop: 8 }}>{errorText}</div>
      )}

      {successValues && (
        <div style={{ color: "green", marginTop: 8 }}>
          Успешно отправлено: <b>{successValues.title}</b>
        </div>
      )}

      <Button type="submit" isLoading={isLoading}>
        Сохранить
      </Button>
    </form>
  );
};
