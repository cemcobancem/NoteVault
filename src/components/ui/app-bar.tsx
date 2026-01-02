import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppBarProps {
  title: string;
  showMenu?: boolean;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

export function AppBar({ title, showMenu = true, showSearch = true, onMenuClick }: AppBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {showMenu && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        {showSearch && (
          <Button variant="ghost" size="icon" onClick={() => navigate("/search")}>
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}