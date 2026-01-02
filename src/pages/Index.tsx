import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pin } from "lucide-react";
import { AppBar } from "@/components/ui/app-bar";
import { Fab } from "@/components/ui/fab";
import { NoteCard } from "@/components/note-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Note } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { seedDemoData } from "@/lib/seed";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<Note[]>([]);
  const [otherNotes, setOtherNotes] = useState<Note[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      const allNotes = await db.notes
        .orderBy("updatedAt")
        .reverse()
        .toArray();
      
      const pinned = allNotes.filter(note => note.pinned && !note.archived);
      const others = allNotes.filter(note => !note.pinned && !note.archived);
      
      setNotes(allNotes);
      setPinnedNotes(pinned);
      setOtherNotes(others);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotes();
    seedDemoData();
  }, []);

  const handleEdit = (note: Note) => {
    navigate(`/notes/${note.id}`);
  };

  const handleDelete = async (note: Note) => {
    if (!note.id) return;
    
    try {
      await db.notes.delete(note.id);
      toast({
        title: "Note deleted",
        description: "Note has been deleted successfully",
      });
      fetchNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const handlePin = async (note: Note) => {
    if (!note.id) return;
    
    try {
      await db.notes.update(note.id, {
        pinned: !note.pinned,
        updatedAt: new Date(),
      });
      fetchNotes();
    } catch (error) {
      console.error("Failed to pin note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (note: Note) => {
    if (!note.id) return;
    
    try {
      await db.notes.update(note.id, {
        archived: !note.archived,
        updatedAt: new Date(),
      });
      fetchNotes();
    } catch (error) {
      console.error("Failed to archive note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <AppBar title="Notes" />
      
      <div className="container py-4 space-y-6">
        {pinnedNotes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Pin className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Pinned</h2>
            </div>
            <div className="grid gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          </section>
        )}
        
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">All Notes</h2>
            {otherNotes.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {otherNotes.length} notes
              </span>
            )}
          </div>
          
          {otherNotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No notes yet</p>
              <Button onClick={() => navigate("/notes/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first note
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {otherNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      
      <Fab onClick={() => navigate("/notes/new")} />
    </div>
  );
}