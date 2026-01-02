import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { label: "Low", variant: "secondary" },
    medium: { label: "Medium", variant: "default" },
    high: { label: "High", variant: "destructive" },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant as any} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
}