import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash2 } from "lucide-react";
import { Task } from "@/types";
import { format } from "date-fns";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Card 
      className={`shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200 cursor-pointer ${task.status === "done" ? "opacity-75" : ""}`}
      onClick={() => onEdit(task)} // Make the entire card clickable
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="mt-0.5 h-5 w-5" 
              onClick={() => onComplete(task)}
            >
              {task.status === "done" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-muted-foreground" />
              )}
            </Button>
            <CardTitle className={`text-lg line-clamp-2 ${task.status === "done" ? "line-through" : ""}`}>
              {task.title}
            </CardTitle>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {isOverdue && (
            <Badge variant="destructive">Overdue</Badge>
          )}
        </div>
        
        {task.dueDate && (
          <p className="text-xs text-muted-foreground mt-1">
            Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground">
          {format(new Date(task.updatedAt), "MMM d, yyyy h:mm a")}
        </p>
      </CardHeader>
      
      {task.description && (
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        </CardContent>
      )}
      
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-3">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex justify-end px-4 pb-3 gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(task)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}