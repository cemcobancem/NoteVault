import Dexie, { type EntityTable } from "dexie";
import { Note, Task, Settings } from "@/types";

export interface NoteEntity extends Note {
  id: string;
}

export interface TaskEntity extends Task {
  id: string;
}

export interface SettingsEntity extends Settings {
  id: string;
}

class NotesAppDB extends Dexie {
  notes!: EntityTable<NoteEntity, "id">;
  tasks!: EntityTable<TaskEntity, "id">;
  settings!: EntityTable<SettingsEntity, "id">;

  constructor() {
    super("NotesAppDB");
    this.version(1).stores({
      notes: "++id, title, content, tags, createdAt, updatedAt, pinned, archived",
      tasks: "++id, title, description, dueDate, priority, status, tags, createdAt, updatedAt",
      settings: "++id, theme, lastExport"
    });
  }
}

export const db = new NotesAppDB();