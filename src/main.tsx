import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initTheme } from "./lib/theme.ts";
import { seedDemoData } from "./lib/seed.ts";

// Initialize theme
initTheme();

// Seed data before rendering the app
seedDemoData().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});