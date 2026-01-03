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
    this.version(3).stores({
      notebooks: "++id, name, createdAt, updatedAt",
      notes: "++id, title, content, tags, createdAt, updatedAt, pinned, archived, notebookId, audioRecordings",
      tasks: "++id, title, description, dueDate, priority, status, tags, createdAt, updatedAt",
      settings: "++id, theme, lastExport"
    });
  }
}

// Create a singleton instance
export const db = new NotesAppDB();

// Initialize database with better error handling
export const initDB = async () => {
  try {
    // Test database connection
    await db.notebooks.count();
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
};