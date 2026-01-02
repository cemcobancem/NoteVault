import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Archive, Edit, Trash2 } from "lucide-react";
import { Note } from "@/types";
import { format } from "date-fns";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onPin: (note: Note) => void;
  onArchive: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete, onPin, onArchive }: NoteCardProps) {
  return (
    <Card className="relative">
      {note.pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-4 w-4 text-primary" fill="currentColor" />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(note.updatedAt), "MMM d, yyyy h:mm a")}
        </p>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {note.content}
        </p>
        
        {note.tags.length > 0 && (
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