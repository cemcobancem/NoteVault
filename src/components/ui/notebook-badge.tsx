import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotebookBadgeProps {
  name: string;
  color: string;
  className?: string;
}

export function NotebookBadge({ name, color, className }: NotebookBadgeProps) {
  return (
    <Badge 
      className={cn("capitalize", className)} 
      style={{ backgroundColor: color, color: 'white' }}
    >
      {name}
    </Badge>
  );
}