import Dexie, { type EntityTable } from "dexie";
import { Note, Task, Settings, Notebook } from "@/types";

export interface NoteEntity extends Note {
  id: string;
}

export interface TaskEntity extends Task {
  id: string;
}

export interface SettingsEntity extends Settings {
  id: string;
}

export interface NotebookEntity extends Notebook {
  id: string;
}

class NotesAppDB extends Dexie {
  notebooks!: EntityTable<NotebookEntity, "id">;
  notes!: EntityTable<NoteEntity, "id">;
  tasks!: EntityTable<TaskEntity, "id">;
  settings!: EntityTable<SettingsEntity, "id">;

  constructor() {
    super("NotesAppDB");
    this.version(2).stores({
      notebooks: "++id, name, createdAt, updatedAt",
      notes: "++id, title, content, tags, createdAt, updatedAt, pinned, archived, notebookId",
      tasks: "++id, title, description, dueDate, priority, status, tags, createdAt, updatedAt",
      settings: "++id, theme, lastExport"
    });
  }
}

export const db = new NotesAppDB();