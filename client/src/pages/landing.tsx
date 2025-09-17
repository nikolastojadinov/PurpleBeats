import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Landing() {
  const [, setLocation] = useLocation();
  
  // Since Pi Browser handles user profiles automatically, redirect to home
  useEffect(() => {
    setLocation("/");
  }, [setLocation]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">PurpleBeats</h1>
        <p className="text-muted-foreground">Redirecting to your music...</p>
      </div>
    </div>
  );
}