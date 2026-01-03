import { Link, useLocation } from "react-router-dom";
import { FileText, CheckSquare, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { path: "/", icon: FileText, label: "Notes" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) {
    return null;
  }

  // Determine if the current path matches the nav item path, handling nested routes
  const isActive = (path: string) => {
    if (path === "/") {
      // Active for /, /notes/new, /notes/:id, /notebooks, /notebooks/:id
      return location.pathname === "/" || location.pathname.startsWith("/notes") || location.pathname.startsWith("/notebooks");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg md:hidden">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center text-xs transition-colors w-1/4",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-6 w-6 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}