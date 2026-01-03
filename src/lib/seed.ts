import { db } from "@/lib/db";
import { Note, Task, Notebook } from "@/types";

export const seedDemoData = async () => {
  try {
    // Check if we already have data
    const noteCount = await db.notes.count();
    const taskCount = await db.tasks.count();
    const notebookCount = await db.notebooks.count();
    
    if (noteCount > 0 || taskCount > 0 || notebookCount > 0) {
      console.log("Demo data already exists, skipping seeding");
      return;
    }
    
    console.log("Seeding demo data...");
    
    // Seed notebooks
    const demoNotebooks: Omit<Notebook, "id">[] = [
      {
        name: "Personal",
        color: "#3b82f6",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Work",
        color: "#10b981",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Ideas",
        color: "#f59e0b",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    const notebookIds: string[] = [];
    for (const notebook of demoNotebooks) {
      const id = crypto.randomUUID();
      await db.notebooks.add({ ...notebook, id });
      notebookIds.push(id);
    }
    
    // Seed notes
    const demoNotes: Omit<Note, "id">[] = [
      {
        title: "Welcome to Notes App",
        content: "This is a demo note to help you get started. You can edit or delete this note anytime.",
        tags: ["welcome", "demo"],
        createdAt: new Date(),
        updatedAt: new Date(),
        pinned: true,
        archived: false,
        notebookId: notebookIds[0], // Personal
      },
      {
        title: "Meeting Notes",
        content: "Discussed project timeline and deliverables. Key points:\n- MVP due in 2 weeks\n- Design review next Friday\n- Backend API ready by Wednesday",
        tags: ["meeting", "work"],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        pinned: false,
        archived: false,
        notebookId: notebookIds[1], // Work
      },
      {
        title: "Shopping List",
        content: "- Milk\n- Eggs\n- Bread\n- Fruits\n- Vegetables",
        tags: ["shopping", "personal"],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
        pinned: false,
        archived: false,
        notebookId: notebookIds[0], // Personal
      },
      {
        title: "App Idea",
        content: "A new app idea for productivity tracking with gamification elements.",
        tags: ["idea", "productivity"],
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 259200000),
        pinned: false,
        archived: false,
        notebookId: notebookIds[2], // Ideas
      },
      {
        title: "Voice Recorded Note",
        content: "This note was created using voice recording. You can record your thoughts and they will be transcribed into text automatically.",
        tags: ["voice", "recording"],
        createdAt: new Date(Date.now() - 345600000),
        updatedAt: new Date(Date.now() - 345600000),
        pinned: false,
        archived: false,
        notebookId: notebookIds[0], // Personal
      },
    ];
    
    // Seed tasks
    const demoTasks: Omit<Task, "id">[] = [
      {
        title: "Complete project proposal",
        description: "Finish the project proposal document and send to client",
        dueDate: new Date(Date.now() + 259200000),
        priority: "high",
        status: "open",
        tags: ["work", "important"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Buy groceries",
        description: "Get milk, eggs, bread, and fruits from the supermarket",
        dueDate: new Date(Date.now() + 86400000),
        priority: "medium",
        status: "open",
        tags: ["personal", "shopping"],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        title: "Call dentist",
        description: "Schedule annual checkup appointment",
        dueDate: null,
        priority: "low",
        status: "done",
        tags: ["health", "personal"],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 86400000),
      },
    ];
    
    // Add demo data to database
    for (const note of demoNotes) {
      await db.notes.add({ ...note, id: crypto.randomUUID() });
    }
    
    for (const task of demoTasks) {
      await db.tasks.add({ ...task, id: crypto.randomUUID() });
    }
    
    console.log("Demo data seeded successfully");
  } catch (error) {
    console.error("Failed to seed demo data:", error);
    throw new Error("Failed to seed demo data");
  }
};