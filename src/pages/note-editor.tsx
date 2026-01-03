import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { db } from "@/lib/db";
import { Note, AudioRecording } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, Mic, FileText, Volume2 } from "lucide-react";
import { NotebookSelector } from "@/components/ui/notebook-selector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    audioRecordings: [],
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
          audioRecordings: existingNote.audioRecordings || [],
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
    const updatedNote = {
      ...note,
      [field]: value,
      updatedAt: new Date()
    };
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
        await db.notes.add({
          ...noteData,
          id: crypto.randomUUID()
        });
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
    
    // Add voice/recording tag if not already present
    let updatedTags = [...note.tags];
    if (!updatedTags.includes("voice") && !updatedTags.includes("recording")) {
      updatedTags = [...updatedTags, "voice"];
    }
    
    handleChange("content", updatedContent);
    handleChange("tags", updatedTags);
    setIsVoiceRecorderOpen(false);
  };

  const handleRecordingComplete = (recording: AudioRecording) => {
    const updatedRecordings = [...(note.audioRecordings || []), recording];
    handleChange("audioRecordings", updatedRecordings);
    
    toast({
      title: "Recording Attached",
      description: "Your audio recording has been attached to this note.",
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsVoiceRecorderOpen(true)}
              className="rounded-full"
            >
              <Mic className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleSave()}
              disabled={isSaving}
              className="rounded-full px-4"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container py-4 space-y-6">
        <Input
          placeholder="Note title"
          value={note.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="text-3xl font-bold border-none px-0 focus-visible:ring-0 placeholder:text-2xl placeholder:font-normal"
        />
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>
            {lastSaved 
              ? `Saved at ${lastSaved}` 
              : note.createdAt.toLocaleDateString()}
          </span>
        </div>
        
        <NotebookSelector 
          value={note.notebookId || ""} 
          onValueChange={(value) => handleChange("notebookId", value || undefined)}
          onCreateNew={handleCreateNotebook}
        />
        
        <Textarea
          placeholder="Start writing your note..."
          value={note.content}
          onChange={(e) => handleChange("content", e.target.value)}
          className="min-h-[60vh] text-base border-none px-0 focus-visible:ring-0 resize-none"
        />
        
        {note.audioRecordings && note.audioRecordings.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Audio Recordings</Label>
            <div className="grid gap-2">
              {note.audioRecordings.map((recording) => (
                <div key={recording.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Recording</p>
                      <p className="text-xs text-muted-foreground">
                        {recording.duration ? `${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')}` : 'Unknown duration'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      // Create object URL for playback
                      const url = URL.createObjectURL(recording.blob);
                      const audio = new Audio(url);
                      audio.play();
                    }}
                  >
                    Play
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags</Label>
          <TagInput 
            tags={note.tags} 
            onChange={(tags) => handleChange("tags", tags)} 
          />
        </div>
      </div>
      
      <Dialog open={isNotebookDialogOpen} onOpenChange={setIsNotebookDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              To create a new notebook, please go to the Notebooks section.
            </p>
            <Button 
              className="w-full" 
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Recorder</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <VoiceRecorder 
              onTranscriptionComplete={handleTranscriptionComplete}
              onRecordingComplete={handleRecordingComplete}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}