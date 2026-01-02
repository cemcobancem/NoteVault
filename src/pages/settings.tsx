import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@/components/ui/app-bar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/db";
import { Settings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, Upload, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const allSettings = await db.settings.toArray();
      const currentSettings = allSettings[0] || {
        id: "settings",
        theme: "system",
      };
      
      setSettings(currentSettings);
      setTheme(currentSettings.theme);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    
    try {
      if (settings) {
        await db.settings.update(settings.id!, { theme: newTheme });
      } else {
        await db.settings.add({ id: "settings", theme: newTheme });
      }
      
      // Apply theme to document
      if (newTheme === "system") {
        document.documentElement.classList.remove("light", "dark");
      } else {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(newTheme);
      }
      
      toast({
        title: "Theme updated",
        description: "Your theme preference has been saved",
      });
    } catch (error) {
      console.error("Failed to update theme:", error);
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      const notes = await db.notes.toArray();
      const tasks = await db.tasks.toArray();
      const settings = await db.settings.toArray();
      
      const exportData = {
        notes,
        tasks,
        settings,
        exportDate: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `notes-app-export-${format(new Date(), "yyyy-MM-dd")}.json`;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Your data has been exported",
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const fileText = await file.text();
      const importData = JSON.parse(fileText);
      
      // Import notes
      if (importData.notes?.length) {
        for (const note of importData.notes) {
          const existing = await db.notes.get(note.id);
          if (existing) {
            // Update if newer
            if (new Date(note.updatedAt) > new Date(existing.updatedAt)) {
              await db.notes.update(note.id, note);
            }
          } else {
            await db.notes.add(note);
          }
        }
      }
      
      // Import tasks
      if (importData.tasks?.length) {
        for (const task of importData.tasks) {
          const existing = await db.tasks.get(task.id);
          if (existing) {
            // Update if newer
            if (new Date(task.updatedAt) > new Date(existing.updatedAt)) {
              await db.tasks.update(task.id, task);
            }
          } else {
            await db.tasks.add(task);
          }
        }
      }
      
      // Import settings
      if (importData.settings?.length) {
        const importedSettings = importData.settings[0];
        const existing = await db.settings.get(importedSettings.id);
        if (existing) {
          await db.settings.update(importedSettings.id, importedSettings);
        } else {
          await db.settings.add(importedSettings);
        }
        fetchSettings(); // Refresh settings
      }
      
      toast({
        title: "Import successful",
        description: "Your data has been imported successfully",
      });
      
      // Reset file input
      event.target.value = "";
    } catch (error) {
      console.error("Failed to import data:", error);
      toast({
        title: "Error",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
      return;
    }
    
    try {
      await db.notes.clear();
      await db.tasks.clear();
      
      toast({
        title: "Data cleared",
        description: "All data has been deleted",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Failed to clear data:", error);
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <AppBar title="Settings" />
      
      <div className="container py-6 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme" className="text-base">Theme</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleExport} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <div className="flex-1">
                <Button className="w-full" asChild>
                  <label>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImport}
                    />
                  </label>
                </Button>
              </div>
            </div>
            
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Danger Zone</AlertTitle>
              <AlertDescription>
                This will permanently delete all your notes and tasks.
              </AlertDescription>
              <Button
                variant="destructive"
                className="mt-2"
                onClick={handleClearData}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </Alert>
          </div>
        </section>
      </div>
    </div>
  );
}