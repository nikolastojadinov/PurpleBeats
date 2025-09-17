import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SongWithDetails } from "@shared/schema";
import { useMusicPlayer } from "@/contexts/music-player-context";
import LikeButton from "@/components/music/like-button";
import SongOptionsMenu from "@/components/music/song-options-menu";

interface TrackItemProps {
  song: SongWithDetails;
  showEqualizer?: boolean;
  onLike?: () => void;
}

export default function TrackItem({ 
  song, 
  showEqualizer = false, 
  onLike 
}: TrackItemProps) {
  const { state, playSong, pauseSong, resumeSong } = useMusicPlayer();
  
  const isCurrentSong = state.currentSong?.id === song.id;
  const isPlaying = isCurrentSong && state.isPlaying;

  const handlePlayPause = () => {
    if (isCurrentSong) {
      if (isPlaying) {
        pauseSong();
      } else {
        resumeSong();
      }
    } else {
      playSong(song);
    }
  };

  return (
    <div className="flex items-center space-x-3 bg-card rounded-lg p-3 hover:bg-secondary transition-colors">
      <img 
        src={song.imageUrl || song.album?.imageUrl || ""} 
        alt={song.title}
        className="w-12 h-12 rounded-lg object-cover" 
      />
      <div className="flex-1">
        <p className="font-medium" data-testid={`text-song-title-${song.id}`}>
          {song.title}
        </p>
        <p className="text-sm text-muted-foreground" data-testid={`text-song-artist-${song.id}`}>
          {song.artist?.name || "Unknown Artist"}
        </p>
      </div>
      <div className="flex items-center space-x-1">
        {showEqualizer && isPlaying && (
          <div className="flex space-x-1">
            <div className="equalizer-bar"></div>
            <div className="equalizer-bar"></div>
            <div className="equalizer-bar"></div>
            <div className="equalizer-bar"></div>
          </div>
        )}
        <LikeButton 
          songId={song.id}
          songTitle={song.title}
        />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handlePlayPause}
          className="text-primary"
          data-testid={`button-play-song-${song.id}`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <SongOptionsMenu song={song} />
      </div>
    </div>
  );
}
