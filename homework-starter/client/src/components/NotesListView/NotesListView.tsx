import "./NotesListView.css";
import { NoteView } from "../NoteView";
import type { Note } from "../../validation/notes";

type Props = {
  notes: Note[];
};

export const NotesListView = ({ notes }: Props) => {
  return (
    <ul className="note-list-view">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteView note={note} />
        </li>
      ))}
    </ul>
  );
};
