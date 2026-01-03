import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Pin, BookOpen, FileText } from "lucide-react";
import { AppBar } from "@/components/ui/app-bar";
import { Fab } from "@/components/ui/fab";
import { NoteCard } from "@/components/note-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Note, Notebook } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function NotesPage() {
  const { notebookId } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<Note[]>([]);
  const [otherNotes, setOtherNotes] = useState<Note[]>([]);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let allNotes: Note[] = [];
      
      if (notebookId) {
        // Fetch notebook details
        const notebookData = await db.notebooks.get(notebookId);
        if (notebookData) {
          setNotebook(notebookData);
        } else {
          // If notebook doesn't exist, redirect to main notes page
          navigate("/");
          return;
        }
        
        // Fetch notes for this notebook
        allNotes = await db.notes
          .where("notebookId")
          .equals(notebookId)
          .and(note => !note.archived)
          .toArray();
      } else {
        // Fetch all notes (not archived)
        allNotes = await db.notes
          .where("archived")
          .equals(false)
          .toArray();
      }
      
      const pinned = allNotes.filter(note => note.pinned);
      const others = allNotes.filter(note => !note.pinned);
      
      setNotes(allNotes);
      setPinnedNotes(pinned);
      setOtherNotes(others);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [notebookId]);

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

  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <AppBar title={notebook ? notebook.name : "All Notes"} showMenu={!notebookId} />
        <div className="container py-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
              <p className="text-muted-foreground">Loading notes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <AppBar title={notebook ? notebook.name : "All Notes"} showMenu={!notebookId} />
      
      <div className="container py-4 space-y-6">
        {notebook && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: notebook.color }}
              />
              <div>
                <h1 className="text-xl font-bold">{notebook.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
            >
              Back to All Notes
            </Button>
          </div>
        )}
        
        {pinnedNotes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Pin className="h-4 w-4 text-primary" fill="currentColor" />
              <h2 className="text-lg font-semibold">Pinned Notes</h2>
              <span className="text-sm text-muted-foreground">
                ({pinnedNotes.length})
              </span>
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
            <h2 className="text-lg font-semibold">
              {notebook ? "Notes" : "All Notes"}
            </h2>
            {otherNotes.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {otherNotes.length} {otherNotes.length === 1 ? 'note' : 'notes'}
              </span>
            )}
          </div>
          
          {otherNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed">
              <div className="bg-muted p-5 rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {notebook ? "No notes in this notebook" : "No notes yet"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {notebook 
                  ? "Create your first note in this notebook to get started." 
                  : "Create your first note to start capturing your thoughts."}
              </p>
              <Button 
                onClick={() => navigate("/notes/new")}
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Note
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