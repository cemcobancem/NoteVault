import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, CheckSquare } from "lucide-react";
import { AppBar } from "@/components/ui/app-bar";
import { Input } from "@/components/ui/input";
import { NoteCard } from "@/components/note-card";
import { TaskCard } from "@/components/task-card";
import { db } from "@/lib/db";
import { Note, Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAllData = async () => {
    try {
      const allNotes = await db.notes
        .orderBy("updatedAt")
        .reverse()
        .toArray();
      
      const allTasks = await db.tasks
        .orderBy("updatedAt")
        .reverse()
        .toArray();
      
      setNotes(allNotes);
      setTasks(allTasks);
      setFilteredNotes(allNotes);
      setFilteredTasks(allTasks);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredNotes(notes);
      setFilteredTasks(tasks);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const filteredNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
    
    const filteredTasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        (task.description && task.description.toLowerCase().includes(lowerQuery)) ||
        task.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
    
    setFilteredNotes(filteredNotes);
    setFilteredTasks(filteredTasks);
  }, [query, notes, tasks]);

  const handleNoteEdit = (note: Note) => {
    navigate(`/notes/${note.id}`);
  };

  const handleNoteDelete = async (note: Note) => {
    if (!note.id) return;
    
    try {
      await db.notes.delete(note.id);
      toast({
        title: "Note deleted",
        description: "Note has been deleted successfully",
      });
      fetchAllData();
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const handleNotePin = async (note: Note) => {
    if (!note.id) return;
    
    try {
      await db.notes.update(note.id, {
        pinned: !note.pinned,
        updatedAt: new Date(),
      });
      fetchAllData();
    } catch (error) {
      console.error("Failed to pin note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleNoteArchive = async (note: Note) => {
    if (!note.id) return;
    
    try {
      await db.notes.update(note.id, {
        archived: !note.archived,
        updatedAt: new Date(),
      });
      fetchAllData();
    } catch (error) {
      console.error("Failed to archive note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleTaskEdit = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleTaskDelete = async (task: Task) => {
    if (!task.id) return;
    
    try {
      await db.tasks.delete(task.id);
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully",
      });
      fetchAllData();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleTaskComplete = async (task: Task) => {
    if (!task.id) return;
    
    try {
      await db.tasks.update(task.id, {
        status: task.status === "done" ? "open" : "done",
        updatedAt: new Date(),
      });
      fetchAllData();
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <AppBar title="Search" showSearch={false} />
      
      <div className="container py-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes and tasks..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
              {filteredNotes.length > 0 && (
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                  {filteredNotes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
              {filteredTasks.length > 0 && (
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                  {filteredTasks.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="mt-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {query ? "No notes match your search" : "No notes found"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleNoteEdit}
                    onDelete={handleNoteDelete}
                    onPin={handleNotePin}
                    onArchive={handleNoteArchive}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {query ? "No tasks match your search" : "No tasks found"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleTaskEdit}
                    onDelete={handleTaskDelete}
                    onComplete={handleTaskComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}