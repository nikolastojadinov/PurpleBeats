import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicPlayer } from "@/contexts/music-player-context";
import { Progress } from "@/components/ui/progress";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Membership } from "@shared/schema";
import LikeButton from "@/components/music/like-button";

export default function NowPlayingBar() {
  const { state, pauseSong, resumeSong, nextSong, previousSong, setCurrentTime, toggleMute, closePlayer } = useMusicPlayer();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(24); // Default bottom position
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  
  // Auto-enable audio when song starts playing
  if (state.isPlaying && !audioEnabled) {
    setAudioEnabled(true);
  }

  // Check if user is premium
  const userId = "demo-user-123"; // Demo user ID
  const { data: membership } = useQuery<Membership>({
    queryKey: ['/api/membership', userId],
    enabled: !!userId,
  });

  const isPremium = membership?.isPremium && membership.expiresAt && new Date(membership.expiresAt) > new Date();

  if (!state.currentSong) return null;

  const handleEnableAudio = async () => {
    setAudioEnabled(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  // Handle seeking (only for premium users)
  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPremium || !state.duration) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * state.duration;
    
    setCurrentTime(Math.max(0, Math.min(newTime, state.duration)));
  };

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent page scrolling
    e.stopPropagation(); // Stop event bubbling
    
    const currentY = e.touches[0].clientY;
    const diffY = startY - currentY;
    
    // Update player position vertically (but keep it within screen bounds)
    const newPosition = Math.max(24, Math.min(window.innerHeight - 150, playerPosition + diffY));
    setPlayerPosition(newPosition);
    setStartY(currentY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    // Horizontal swipes for song control
    if (Math.abs(diffX) > 80) { // Minimum swipe distance
      if (diffX > 0) {
        // Swiped left = next song (unapred)
        nextSong();
      } else {
        // Swiped right = previous song (unazad)
        previousSong();
      }
    }
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setStartY(e.clientY);
    setIsMouseDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDragging) return;
    e.preventDefault(); // Prevent default mouse behavior
    e.stopPropagation(); // Stop event bubbling
    
    const currentY = e.clientY;
    const diffY = startY - currentY;
    
    // Update player position vertically
    const newPosition = Math.max(24, Math.min(window.innerHeight - 150, playerPosition + diffY));
    setPlayerPosition(newPosition);
    setStartY(currentY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDragging) return;
    setIsMouseDragging(false);
    
    const endX = e.clientX;
    const diffX = startX - endX;
    
    // Horizontal swipes for song control
    if (Math.abs(diffX) > 80) {
      if (diffX > 0) {
        // Dragged left = next song (unapred)
        nextSong();
      } else {
        // Dragged right = previous song (unazad)
        previousSong();
      }
    }
  };

  return (
    <div 
      className={`fixed left-0 right-0 px-4 z-30 ${isDragging || isMouseDragging ? '' : 'transition-all duration-200'}`}
      style={{ bottom: `${playerPosition}px` }}
    >
      <div 
        ref={playerRef}
        className={`max-w-md mx-auto bg-card/95 backdrop-blur-lg rounded-xl p-3 border border-border/50 shadow-2xl relative select-none ${
          isDragging || isMouseDragging 
            ? 'cursor-grabbing scale-105 shadow-3xl' 
            : 'cursor-grab hover:shadow-3xl transition-all duration-200'
        }`}
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Close button in top right corner */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={closePlayer}
          className="absolute top-2 right-2 p-1 w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-close-player"
        >
          <X className="h-3 w-3" />
        </Button>
        
        <div className="flex items-center space-x-3">
          <img 
            src={state.currentSong.imageUrl || state.currentSong.album?.imageUrl || ''} 
            alt={`Now Playing - ${state.currentSong.title}`}
            className="w-12 h-12 rounded-lg object-cover animate-spin-slow" 
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" data-testid="text-current-song-title">
              {state.currentSong.title}
            </p>
            <p className="text-sm text-muted-foreground truncate" data-testid="text-current-artist">
              {state.currentSong.artist?.name || 'Unknown Artist'}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            {!audioEnabled ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleEnableAudio}
                className="p-2 text-accent hover:text-accent/80 transition-colors"
                data-testid="button-enable-audio"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleMute}
                className={`p-2 transition-colors bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent ${state.isMuted ? 'text-muted-foreground/50 hover:text-muted-foreground' : 'text-foreground hover:text-accent'}`}
                data-testid="button-mute-toggle"
              >
                {state.isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <LikeButton 
              songId={state.currentSong.id}
              songTitle={state.currentSong.title}
              className="p-2"
            />
            
            {/* Premium skip controls */}
            {isPremium && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={previousSong}
                className="p-2 text-foreground hover:text-accent transition-colors bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                data-testid="button-skip-previous"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={state.isPlaying ? pauseSong : resumeSong}
              className="p-2 text-foreground hover:text-accent transition-colors bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
              data-testid="button-play-pause"
            >
              {state.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {/* Premium skip controls */}
            {isPremium && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={nextSong}
                className="p-2 text-foreground hover:text-accent transition-colors bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                data-testid="button-skip-next"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <div 
            className={`w-full ${isPremium ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={isPremium ? handleSeek : undefined}
            data-testid="progress-container"
          >
            <Progress value={progress} className="w-full h-1" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span data-testid="text-current-time">{formatTime(state.currentTime)}</span>
            <span data-testid="text-duration">{formatTime(state.duration)}</span>
          </div>
          {!isPremium && (
            <div className="text-xs text-muted-foreground/60 text-center mt-1">
              Premium members can skip songs and seek timeline
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
