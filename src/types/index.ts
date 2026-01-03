export type Priority = "low" | "medium" | "high";
export type Status = "open" | "done";

export interface Notebook {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  archived: boolean;
  notebookId?: string;
  audioRecordings?: AudioRecording[]; // Add audio recordings to notes
}

// New interface for audio recordings
export interface AudioRecording {
  id: string;
  blob: Blob;
  createdAt: Date;
  transcription?: string;
  duration?: number;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  priority: Priority;
  status: Status;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id?: string;
  theme: "light" | "dark" | "system";
  lastExport?: Date;
}

export interface ExportData {
  notebooks: Notebook[];
  notes: Note[];
  tasks: Task[];
  settings: Settings[];
}