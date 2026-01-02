import { Badge } from "@/components/ui/badge";
import { Status } from "@/types";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={status === "done" ? "default" : "secondary"} className="capitalize">
      {status}
    </Badge>
  );
}