import { useQuery } from "@tanstack/react-query";
import { type SongWithDetails, type PlaylistWithDetails, type Membership } from "@shared/schema";
import { useMusicPlayer } from "@/contexts/music-player-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Heart, Music, Crown, Lock } from "lucide-react";
import Header from "@/components/layout/header";
import PlaylistItem from "@/components/music/playlist-item";
import { useLocation } from "wouter";

export default function LikedSongs() {
  const { state, playSong, pauseSong, resumeSong } = useMusicPlayer();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const userId = user?.uid;

  // Get user's membership status
  const { data: membership, isLoading: isLoadingMembership } = useQuery<Membership>({
    queryKey: ['/api/membership', userId],
    enabled: !!userId,
  });
  
  const isPremium = membership?.isPremium && membership.expiresAt && new Date(membership.expiresAt) > new Date();

  const { data: likedSongs = [], isLoading } = useQuery<SongWithDetails[]>({
    queryKey: ['/api/liked-songs'],
  });

  const { data: likedPlaylists = [], isLoading: isLoadingPlaylists } = useQuery<PlaylistWithDetails[]>({
    queryKey: ['/api/liked-playlists', userId],
    enabled: !!userId,
  });

  const handlePlaySong = (song: SongWithDetails) => {
    playSong(song, likedSongs);
  };

  const handlePlayPause = (song: SongWithDetails) => {
    if (state.currentSong?.id === song.id) {
      if (state.isPlaying) {
        pauseSong();
      } else {
        resumeSong();
      }
    } else {
      handlePlaySong(song);
    }
  };

  const handlePlayPlaylist = (playlist: PlaylistWithDetails) => {
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleNavigateToPlaylist = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || isLoadingPlaylists || isLoadingMembership) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-4 pb-44">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

  // If user is not premium, show upgrade message
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-4 pb-44">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Heart className="h-8 w-8 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-liked-songs-title">Liked Songs</h1>
              <p className="text-sm text-muted-foreground" data-testid="text-liked-count">
                Premium Feature
              </p>
            </div>
          </div>

          {/* Premium Required Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
              <p className="text-muted-foreground mb-4">
                Liked Songs is available for Premium members only. Upgrade to Premium for just 3.14π to unlock this and more features!
              </p>
              <Button 
                onClick={() => navigate('/premium')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                data-testid="button-upgrade-premium"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-4 pb-44">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Heart className="h-8 w-8 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-liked-songs-title">Liked Songs</h1>
            <p className="text-sm text-muted-foreground" data-testid="text-liked-count">
              {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>

        {/* Play All Button */}
        {likedSongs.length > 0 && (
          <div className="mb-6">
            <Button 
              onClick={() => handlePlaySong(likedSongs[0])}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              data-testid="button-play-all-liked"
            >
              <Play className="h-4 w-4 mr-2" />
              Play All
            </Button>
          </div>
        )}

        {/* Liked Playlists Section */}
        {likedPlaylists.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Music className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold" data-testid="text-liked-playlists-title">
                Liked Playlists
              </h2>
            </div>
            <div className="space-y-2">
              {likedPlaylists.map((playlist) => (
                <PlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  onPlay={() => handlePlayPlaylist(playlist)}
                  onClick={() => handleNavigateToPlaylist(playlist.id)}
                  userId="demo-user-123"
                />
              ))}
            </div>
          </div>
        )}

        {/* Songs List */}
        {likedSongs.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No liked songs yet</h3>
            <p className="text-muted-foreground">
              Songs you like will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {likedSongs.map((song, index) => {
              const isCurrentSong = state.currentSong?.id === song.id;
              const isCurrentlyPlaying = isCurrentSong && state.isPlaying;

              return (
                <div key={song.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Play/Pause Button */}
                  <div className="relative">
                    <img 
                      src={song.imageUrl || song.album?.imageUrl || ''} 
                      alt={`${song.title} cover`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlayPause(song)}
                      className="absolute inset-0 w-full h-full bg-black/40 hover:bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-lg"
                      data-testid={`button-play-pause-${song.id}`}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="h-4 w-4 text-white" />
                      ) : (
                        <Play className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground w-6" data-testid={`text-track-number-${index + 1}`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium truncate ${isCurrentSong ? 'text-primary' : ''}`} data-testid={`text-song-title-${song.id}`}>
                          {song.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate" data-testid={`text-artist-name-${song.id}`}>
                          {song.artist?.name || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <span className="text-sm text-muted-foreground" data-testid={`text-duration-${song.id}`}>
                    {formatDuration(song.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}