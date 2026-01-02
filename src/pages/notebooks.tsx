import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, FileText } from "lucide-react";
import { AppBar } from "@/components/ui/app-bar";
import { Fab } from "@/components/ui/fab";
import { NotebookCard } from "@/components/notebook-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Notebook } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export default function NotebooksPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchNotebooks = async () => {
    try {
      const allNotebooks = await db.notebooks
        .orderBy("updatedAt")
        .reverse()
        .toArray();
      setNotebooks(allNotebooks);
    } catch (error) {
      console.error("Failed to fetch notebooks:", error);
      toast({
        title: "Error",
        description: "Failed to load notebooks",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) {
      toast({
        title: "Validation Error",
        description: "Notebook name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const newNotebook: Omit<Notebook, "id"> = {
        name: newNotebookName.trim(),
        color: selectedColor,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.notebooks.add({ ...newNotebook, id: crypto.randomUUID() });
      
      toast({
        title: "Notebook created",
        description: "Your notebook has been created successfully",
      });
      
      setNewNotebookName("");
      setSelectedColor(DEFAULT_COLORS[0]);
      setIsDialogOpen(false);
      fetchNotebooks();
    } catch (error) {
      console.error("Failed to create notebook:", error);
      toast({
        title: "Error",
        description: "Failed to create notebook",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (notebook: Notebook) => {
    // For now, we'll just show a toast since we don't have an edit form
    toast({
      title: "Edit Notebook",
      description: "Editing notebooks is not yet implemented",
    });
  };

  const handleDelete = async (notebook: Notebook) => {
    try {
      await db.notebooks.delete(notebook.id);
      toast({
        title: "Notebook deleted",
        description: "Notebook has been deleted successfully",
      });
      fetchNotebooks();
    } catch (error) {
      console.error("Failed to delete notebook:", error);
      toast({
        title: "Error",
        description: "Failed to delete notebook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <AppBar title="Notebooks" />
      
      <div className="container py-4 space-y-6">
        {notebooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted p-6 rounded-full mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Notebooks Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first notebook to organize your notes and keep everything in one place.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Notebook
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Notebook</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newNotebookName}
                      onChange={(e) => setNewNotebookName(e.target.value)}
                      placeholder="Notebook name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === color 
                              ? 'border-primary ring-2 ring-primary/30' 
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateNotebook}
                    className="w-full"
                  >
                    Create Notebook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Notebooks</h2>
              <span className="text-sm text-muted-foreground">
                {notebooks.length} {notebooks.length === 1 ? 'notebook' : 'notebooks'}
              </span>
            </div>
            
            <div className="grid gap-4">
              {notebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <Fab onClick={() => setIsDialogOpen(true)} />
    </div>
  );
}