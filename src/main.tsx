import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initTheme } from "./lib/theme.ts";

// Initialize theme
initTheme();

createRoot(document.getElementById("root")!).render(<App />);