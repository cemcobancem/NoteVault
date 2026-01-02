import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, CheckSquare, Search, Settings } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Notes" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background md:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center rounded-none py-2 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              asChild
            >
              <Link to={item.path}>
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}