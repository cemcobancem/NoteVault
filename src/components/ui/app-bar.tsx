import { Menu, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppBarProps {
  title: string;
  showMenu?: boolean; // For showing a general menu/sidebar toggle (if implemented)
  showSearch?: boolean; // For showing a search button
  showBack?: boolean; // Explicitly show back button
}

export function AppBar({ title, showMenu = true, showSearch = true, showBack = false }: AppBarProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Determine if we are on a main navigation route where we typically don't show a back button
  const isMainRoute = ["/", "/tasks", "/search", "/settings", "/notebooks"].includes(location.pathname);
  
  // Determine if we should show the back button. 
  // It's shown if explicitly requested, or if we are on a nested route (like /notebooks/:id)
  const effectiveShowBack = showBack || (location.pathname.startsWith("/notebooks/") && location.pathname.length > "/notebooks/".length);

  const handleSearchClick = () => {
    navigate("/search");
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-10 bg-background border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          {effectiveShowBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold truncate">{title}</h1>
        </div>
        
        <div className="flex items-center gap-1">
          {showSearch && isMainRoute && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchClick}
              className="rounded-full"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          {/* Menu button placeholder for desktop/sidebar toggle */}
          {showMenu && !isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}