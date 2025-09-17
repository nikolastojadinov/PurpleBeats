import { useLocation } from "wouter";
import { Home, Search, Library, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/library", icon: Library, label: "Library" },
  { path: "/liked-songs", icon: Heart, label: "Liked Songs" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Button
            key={path}
            variant="ghost"
            onClick={() => setLocation(path)}
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              location === path 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`nav-${label.toLowerCase()}`}
          >
            <Icon className="text-xl mb-1 h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
