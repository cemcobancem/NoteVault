import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface FabProps {
  onClick: () => void;
  className?: string;
}

export function Fab({ onClick, className }: FabProps) {
  const isMobile = useIsMobile();
  
  // On mobile, lift the FAB up by the height of the BottomNav (h-16 = 4rem) + padding (p-4 = 1rem) = 5rem
  const mobileOffset = isMobile ? "bottom-[5rem]" : "bottom-4"; 

  return (
    <div 
      className={cn(
        "fixed right-4 z-40 transition-all duration-300",
        mobileOffset,
        className
      )}
    >
      <Button 
        onClick={onClick} 
        size="lg" 
        className="rounded-full h-14 w-14 shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}