import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/db";
import { Task, Priority } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, Mic, Calendar, Flag } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { VoiceRecorder } from "@/components/ui/voice-recorder";

export default function TaskEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    dueDate: null,
    priority: "medium",
    status: "open",
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask(id);
    }
  }, [id]);

  const fetchTask = async (taskId: string) => {
    try {
      const existingTask = await db.tasks.get(taskId);
      if (existingTask) {
        setTask({
          title: existingTask.title,
          description: existingTask.description || "",
          dueDate: existingTask.dueDate,
          priority: existingTask.priority,
          status: existingTask.status,
          tags: existingTask.tags,
          createdAt: existingTask.createdAt,
          updatedAt: existingTask.updatedAt,
        });
      }
    } catch (error) {
      console.error("Failed to fetch task:", error);
      toast({
        title: "Error",
        description: "Failed to load task",
        variant: "destructive",
      });
      navigate("/tasks");
    }
  };

  const handleChange = (field: keyof Task, value: any) => {
    setTask({ ...task, [field]: value, updatedAt: new Date() });
  };

  const handleSave = async () => {
    if (!task.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (id) {
        // Update existing task
        await db.tasks.update(id, task);
      } else {
        // Create new task
        await db.tasks.add({ ...task, id: crypto.randomUUID() });
      }
      
      toast({
        title: "Task saved",
        description: "Your task has been saved successfully",
      });
      
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to save task:", error);
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/tasks");
  };

  const handleTranscriptionComplete = (transcribedText: string) => {
    const updatedDescription = task.description 
      ? `${task.description}\n\n${transcribedText}`
      : transcribedText;
    
    handleChange("description", updatedDescription);
    setIsVoiceRecorderOpen(false);
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
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full px-4"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container py-4 space-y-6">
        <Input
          placeholder="Task title"
          value={task.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="text-3xl font-bold border-none px-0 focus-visible:ring-0 placeholder:text-2xl placeholder:font-normal"
        />
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flag className="h-4 w-4" />
          <span>
            Created {task.createdAt.toLocaleDateString()}
          </span>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            placeholder="Add details about your task..."
            value={task.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="min-h-[150px] text-base border-none px-0 focus-visible:ring-0 resize-none"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <DatePicker
              date={task.dueDate || undefined}
              onDateChange={(date) => handleChange("dueDate", date)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select
              value={task.priority}
              onValueChange={(value) => handleChange("priority", value as Priority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags</Label>
          <TagInput
            tags={task.tags}
            onChange={(tags) => handleChange("tags", tags)}
          />
        </div>
      </div>
      
      <Dialog open={isVoiceRecorderOpen} onOpenChange={setIsVoiceRecorderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Recorder</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}