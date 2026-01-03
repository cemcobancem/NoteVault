import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initTheme } from "./lib/theme.ts";
import { seedDemoData } from "./lib/seed.ts";
import { initDB } from "./lib/db.ts";
import { showSuccess, showError } from "./utils/toast.ts";

// Initialize theme
initTheme();

// Initialize database and seed data
const initializeApp = async () => {
  try {
    const dbInitialized = await initDB();
    if (!dbInitialized) {
      showError("Failed to initialize database");
      return;
    }
    
    await seedDemoData();
    showSuccess("App initialized successfully");
    
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(<App />);
    } else {
      console.error("Failed to find root element");
    }
  } catch (error) {
    console.error("App initialization failed:", error);
    showError("Failed to initialize app");
  }
};

initializeApp();