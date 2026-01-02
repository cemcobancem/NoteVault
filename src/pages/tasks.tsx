import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CheckSquare, Filter } from "lucide-react";
import { AppBar } from "@/components/ui/app-bar";
import { Fab } from "@/components/ui/fab";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Task, Priority, Status } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const allTasks = await db.tasks
        .orderBy("updatedAt")
        .reverse()
        .toArray();
      setTasks(allTasks);
      applyFilters(allTasks, priorityFilter, statusFilter);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const applyFilters = (
    tasksToFilter: Task[],
    priority: Priority | "all",
    status: Status | "all"
  ) => {
    let result = tasksToFilter;
    if (priority !== "all") {
      result = result.filter(task => task.priority === priority);
    }
    if (status !== "all") {
      result = result.filter(task => task.status === status);
    }
    setFilteredTasks(result);
  };

  useEffect(() => {
    applyFilters(tasks, priorityFilter, statusFilter);
  }, [priorityFilter, statusFilter, tasks]);

  const handleEdit = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleDelete = async (task: Task) => {
    if (!task.id) return;
    try {
      await db.tasks.delete(task.id);
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully",
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (task: Task) => {
    if (!task.id) return;
    try {
      await db.tasks.update(task.id, {
        status: task.status === "done" ? "open" : "done",
        updatedAt: new Date(),
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setPriorityFilter("all");
    setStatusFilter("all");
  };

  const hasFilters = priorityFilter !== "all" || statusFilter !== "all";

  return (
    <div className="min-h-screen pb-20 bg-background">
      <AppBar title="Tasks" />
      
      <div className="container py-4 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={priorityFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={priorityFilter === "low" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter("low")}
          >
            <span className="hidden sm:inline">Low</span>
            <span className="sm:hidden">L</span>
          </Button>
          <Button 
            variant={priorityFilter === "medium" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter("medium")}
          >
            <span className="hidden sm:inline">Medium</span>
            <span className="sm:hidden">M</span>
          </Button>
          <Button 
            variant={priorityFilter === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter("high")}
          >
            <span className="hidden sm:inline">High</span>
            <span className="sm:hidden">H</span>
          </Button>
          
          <div className="border-l border-border mx-1 h-6 self-center"></div>
          
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "open" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("open")}
          >
            Open
          </Button>
          <Button 
            variant={statusFilter === "done" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("done")}
          >
            Done
          </Button>
          
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed">
            <div className="bg-muted p-5 rounded-full mb-4">
              <CheckSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {hasFilters ? "No tasks match your filters" : "No tasks yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {hasFilters 
                ? "Try adjusting your filters to see more tasks." 
                : "Create your first task to start organizing your work."}
            </p>
            <Button 
              onClick={() => navigate("/tasks/new")}
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onComplete={handleComplete} 
              />
            ))}
          </div>
        )}
      </div>
      
      <Fab onClick={() => navigate("/tasks/new")} />
    </div>
  );
}