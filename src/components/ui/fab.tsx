import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabProps {
  onClick: () => void;
  className?: string;
}

export function Fab({ onClick, className }: FabProps) {
  return (
    <Button
      className={cn(
        "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:bottom-6 md:right-6",
        className
      )}
      size="icon"
      onClick={onClick}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}