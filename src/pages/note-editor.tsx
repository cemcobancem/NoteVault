import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { db } from "@/lib/db";
import { Note } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, Mic } from "lucide-react";
import { NotebookSelector } from "@/components/ui/notebook-selector";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { VoiceRecorder } from "@/components/ui/voice-recorder";

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [note, setNote] = useState<Omit<Note, "id">>({
    title: "",
    content: "",
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    pinned: false,
    archived: false,
    notebookId: undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isNotebookDialogOpen, setIsNotebookDialogOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      fetchNote(id);
    }
  }, [id]);

  const fetchNote = async (noteId: string) => {
    try {
      const existingNote = await db.notes.get(noteId);
      if (existingNote) {
        setNote({
          title: existingNote.title,
          content: existingNote.content,
          tags: existingNote.tags,
          createdAt: existingNote.createdAt,
          updatedAt: existingNote.updatedAt,
          pinned: existingNote.pinned,
          archived: existingNote.archived,
          notebookId: existingNote.notebookId,
        });
      }
    } catch (error) {
      console.error("Failed to fetch note:", error);
      toast({
        title: "Error",
        description: "Failed to load note",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const handleChange = (field: keyof Note, value: any) => {
    const updatedNote = { ...note, [field]: value, updatedAt: new Date() };
    setNote(updatedNote);
    
    // Auto-save after 1 second of inactivity
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(updatedNote);
    }, 1000);
  };

  const handleSave = async (noteToSave?: typeof note) => {
    const noteData = noteToSave || note;
    
    if (!noteData.title.trim() && !noteData.content.trim()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (id) {
        // Update existing note
        await db.notes.update(id, noteData);
      } else {
        // Create new note
        await db.notes.add({ ...noteData, id: crypto.randomUUID() });
      }
      
      setLastSaved(new Date().toLocaleTimeString());
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      handleSave();
    }
    
    // Navigate back to the notebook or to all notes
    if (note.notebookId) {
      navigate(`/notebooks/${note.notebookId}`);
    } else {
      navigate("/");
    }
  };

  const handleCreateNotebook = () => {
    setIsNotebookDialogOpen(true);
  };

  const handleTranscriptionComplete = (transcribedText: string) => {
    const updatedContent = note.content 
      ? `${note.content}\n\n${transcribedText}`
      : transcribedText;
    
    handleChange("content", updatedContent);
    setIsVoiceRecorderOpen(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVoiceRecorderOpen(true)}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved at {lastSaved}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container py-4 space-y-6">
        <Input
          placeholder="Note title"
          value={note.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
        />
        
        <NotebookSelector
          value={note.notebookId || ""}
          onValueChange={(value) => handleChange("notebookId", value || undefined)}
          onCreateNew={handleCreateNotebook}
        />
        
        <Textarea
          placeholder="Start writing..."
          value={note.content}
          onChange={(e) => handleChange("content", e.target.value)}
          className="min-h-[50vh] border-none px-0 focus-visible:ring-0 text-base"
        />
        
        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <TagInput
            tags={note.tags}
            onChange={(tags) => handleChange("tags", tags)}
          />
        </div>
      </div>
      
      <Dialog open={isNotebookDialogOpen} onOpenChange={setIsNotebookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              To create a new notebook, please go to the Notebooks section.
            </p>
            <Button 
              className="mt-4 w-full"
              onClick={() => {
                setIsNotebookDialogOpen(false);
                navigate("/notebooks");
              }}
            >
              Go to Notebooks
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isVoiceRecorderOpen} onOpenChange={setIsVoiceRecorderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Recorder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}