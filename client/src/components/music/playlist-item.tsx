import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Playlist } from "@shared/schema";
import { PlaylistOptionsMenu } from "./playlist-options-menu";

interface PlaylistItemProps {
  playlist: Playlist;
  onPlay?: () => void;
  onClick?: () => void;
  userId?: string;
}

export default function PlaylistItem({ playlist, onPlay, onClick, userId = "demo-user-123" }: PlaylistItemProps) {
  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-card transition-colors">
      <div 
        onClick={onClick}
        className="flex items-center space-x-3 flex-1 cursor-pointer"
        data-testid={`playlist-card-${playlist.id}`}
      >
        {playlist.imageUrl ? (
          <img 
            src={playlist.imageUrl} 
            alt={playlist.name}
            className="w-12 h-12 rounded-lg object-cover" 
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <i className="fas fa-music text-white"></i>
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium" data-testid={`text-playlist-name-${playlist.id}`}>
            {playlist.name}
          </p>
          <p className="text-sm text-muted-foreground" data-testid={`text-playlist-count-${playlist.id}`}>
            {playlist.songCount} songs
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {onPlay && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onPlay}
            className="text-primary"
            data-testid={`button-play-playlist-${playlist.id}`}
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
        <PlaylistOptionsMenu playlist={playlist} userId={userId} />
      </div>
    </div>
  );
}
