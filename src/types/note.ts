import { Timestamp } from 'firebase/firestore';

export type Note = {
  id: string;
  title: string;
  content: string;
  color?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type RootStackParamList = {
  Home: undefined;
  NoteForm:
    | {
        note?: Note;
      }
    | undefined;
};
