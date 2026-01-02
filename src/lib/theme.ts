import { db } from "@/lib/db";

export const applyTheme = async () => {
  try {
    const settings = await db.settings.toArray();
    const theme = settings[0]?.theme || "system";
    
    if (theme === "system") {
      document.documentElement.classList.remove("light", "dark");
    } else {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
  } catch (error) {
    console.error("Failed to apply theme:", error);
  }
};

export const initTheme = () => {
  // Apply system theme preference
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const updateTheme = () => {
    const isDark = mediaQuery.matches;
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
  };
  
  mediaQuery.addEventListener("change", updateTheme);
  updateTheme();
  
  // Apply saved theme preference
  applyTheme();
};