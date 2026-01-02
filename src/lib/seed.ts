import { db } from "@/lib/db";
import { Note, Task } from "@/types";

export const seedDemoData = async () => {
  try {
    // Check if we already have data
    const noteCount = await db.notes.count();
    const taskCount = await db.tasks.count();
    
    if (noteCount > 0 || taskCount > 0) {
      return;
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
      },
      {
        title: "Meeting Notes",
        content: "Discussed project timeline and deliverables. Key points:\n- MVP due in 2 weeks\n- Design review next Friday\n- Backend API ready by Wednesday",
        tags: ["meeting", "work"],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        pinned: false,
        archived: false,
      },
      {
        title: "Shopping List",
        content: "- Milk\n- Eggs\n- Bread\n- Fruits\n- Vegetables",
        tags: ["shopping", "personal"],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
        pinned: false,
        archived: false,
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
  }
};