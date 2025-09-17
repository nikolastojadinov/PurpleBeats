import { Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AlbumWithDetails } from "@shared/schema";

interface AlbumCardProps {
  album: AlbumWithDetails;
  onPlay?: () => void;
  onLike?: () => void;
  showPlayCount?: boolean;
  playCount?: number;
}

export default function AlbumCard({ 
  album, 
  onPlay, 
  onLike, 
  showPlayCount = false, 
  playCount = 0 
}: AlbumCardProps) {
  const formatPlayCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  return (
    <div className="bg-card rounded-lg p-4 hover:bg-secondary transition-colors">
      <img 
        src={album.imageUrl} 
        alt={`${album.title} Album`}
        className="w-full aspect-square rounded-lg object-cover mb-3" 
      />
      <h3 className="font-medium truncate" data-testid={`text-album-title-${album.id}`}>
        {album.title}
      </h3>
      <p className="text-sm text-muted-foreground truncate" data-testid={`text-album-artist-${album.id}`}>
        {album.artist.name}
      </p>
      <div className="flex items-center justify-between mt-2">
        {showPlayCount && (
          <div className="flex items-center space-x-1">
            <Play className="text-accent h-3 w-3" />
            <span className="text-xs text-muted-foreground" data-testid={`text-play-count-${album.id}`}>
              {formatPlayCount(playCount)} plays
            </span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          {onLike && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onLike}
              className="text-muted-foreground hover:text-primary"
              data-testid={`button-like-album-${album.id}`}
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}
          {onPlay && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onPlay}
              className="text-primary"
              data-testid={`button-play-album-${album.id}`}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
