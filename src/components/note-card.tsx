import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Archive, Edit, Trash2, BookOpen, Mic } from "lucide-react";
import { Note } from "@/types";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";
import { NotebookBadge } from "@/components/ui/notebook-badge";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onPin: (note: Note) => void;
  onArchive: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete, onPin, onArchive }: NoteCardProps) {
  const [notebook, setNotebook] = useState<{name: string, color: string} | null>(null);
  const [loadingNotebook, setLoadingNotebook] = useState(false);

  const fetchNotebook = async () => {
    if (note.notebookId) {
      setLoadingNotebook(true);
      try {
        const notebookData = await db.notebooks.get(note.notebookId);
        if (notebookData) {
          setNotebook({name: notebookData.name, color: notebookData.color});
        }
      } catch (error) {
        console.error("Failed to fetch notebook:", error);
      } finally {
        setLoadingNotebook(false);
      }
    }
  };

  useEffect(() => {
    fetchNotebook();
  }, [note.notebookId]);

  // Check if this note was created from voice recording
  const isVoiceNote = note.tags.includes("voice") || note.tags.includes("recording");

  return (
    <Card className="relative">
      {note.pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-4 w-4 text-primary" fill="currentColor" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
            {note.title || "Untitled Note"}
            {isVoiceNote && <Mic className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
        </div>
        {loadingNotebook ? (
          <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
        ) : notebook && (
          <div className="mt-1">
            <NotebookBadge name={notebook.name} color={notebook.color} className="text-xs" />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {note.updatedAt ? format(new Date(note.updatedAt), "MMM d, yyyy h:mm a") : "Unknown date"}
        </p>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {note.content || "No content"}
        </p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <div className="flex justify-end px-4 pb-3 gap-1">
        <Button variant="ghost" size="icon" onClick={() => onPin(note)}>
          <Pin className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onArchive(note)}>
          <Archive className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(note)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(note)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}