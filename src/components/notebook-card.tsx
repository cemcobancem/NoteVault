import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText } from "lucide-react";
import { Notebook } from "@/types";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface NotebookCardProps {
  notebook: Notebook;
  onEdit: (notebook: Notebook) => void;
  onDelete: (notebook: Notebook) => void;
}

export function NotebookCard({ notebook, onEdit, onDelete }: NotebookCardProps) {
  const [noteCount, setNoteCount] = useState(0);
  const { toast } = useToast();

  const fetchNoteCount = async () => {
    try {
      const count = await db.notes.where("notebookId").equals(notebook.id).count();
      setNoteCount(count);
    } catch (error) {
      console.error("Failed to fetch note count:", error);
    }
  };

  useEffect(() => {
    fetchNoteCount();
  }, [notebook.id]);

  const handleDelete = async () => {
    if (noteCount > 0) {
      toast({
        title: "Cannot delete notebook",
        description: `This notebook contains ${noteCount} notes. Please move or delete them first.`,
        variant: "destructive",
      });
      return;
    }
    
    onDelete(notebook);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2 mt-1" 
              style={{ backgroundColor: notebook.color }}
            />
            <CardTitle className="text-lg">{notebook.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(notebook)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="h-4 w-4 mr-1" />
          <span>{noteCount} notes</span>
        </div>
      </CardContent>
    </Card>
  );
}