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
import { Save, ArrowLeft } from "lucide-react";

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

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </header>
      
      <div className="container py-4 space-y-6">
        <Input
          placeholder="Task title"
          value={task.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
        />
        
        <Textarea
          placeholder="Description (optional)"
          value={task.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          className="min-h-[100px] border-none px-0 focus-visible:ring-0 text-base"
        />
        
        <div>
          <Label className="text-sm font-medium mb-2 block">Due Date</Label>
          <DatePicker
            date={task.dueDate || undefined}
            onDateChange={(date) => handleChange("dueDate", date)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Priority</Label>
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
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Status</Label>
            <Select
              value={task.status}
              onValueChange={(value) => handleChange("status", value as "open" | "done")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block">Tags</Label>
          <TagInput
            tags={task.tags}
            onChange={(tags) => handleChange("tags", tags)}
          />
        </div>
      </div>
    </div>
  );
}