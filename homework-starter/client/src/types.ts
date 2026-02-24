export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Note {
  id: string;
  title: string;
  text: string;
  userId: string;
  createdAt: number;
}

export interface NotesResponse {
  list: Note[];
  pageCount: number;
}
