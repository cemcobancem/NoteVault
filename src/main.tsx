import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initTheme } from "./lib/theme.ts";
import { seedDemoData } from "./lib/seed.ts";
import { initDB } from "./lib/db.ts";
import { showSuccess, showError } from "./utils/toast.ts";
import { SplashScreen } from "./components/splash-screen.tsx";
import React from "react";

// Initialize theme
initTheme();

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Failed to find root element");
  throw new Error("Failed to find root element");
}

// Create root
const root = createRoot(rootElement);

// Show splash screen immediately
root.render(<SplashScreen />);

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
    
    // Render the main app
    root.render(<App />);
  } catch (error) {
    console.error("App initialization failed:", error);
    showError("Failed to initialize app");
    
    // Even if initialization fails, still show the app
    root.render(<App />);
  }
};

// Initialize app after a short delay to show splash screen
setTimeout(() => {
  initializeApp();
}, 1500);