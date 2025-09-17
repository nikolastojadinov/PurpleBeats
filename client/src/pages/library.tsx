import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useMusicPlayer } from "@/contexts/music-player-context";
import { useAuth } from "@/contexts/auth-context";
import Header from "@/components/layout/header";
import PlaylistItem from "@/components/music/playlist-item";
import TrackItem from "@/components/music/track-item";
import CreatePlaylistDialog from "@/components/playlist/create-playlist-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ChevronRight } from "lucide-react";
import { type Playlist, type PlaylistWithDetails, type SongWithDetails } from "@shared/schema";

export default function Library() {
  const [, setLocation] = useLocation();
  const { setAllSongs, playSong } = useMusicPlayer();
  const { userId } = useAuth();
  
  const { data: playlists, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const { data: likedSongs, isLoading: likedLoading } = useQuery<SongWithDetails[]>({
    queryKey: ["/api/liked-songs"],
  });

  const { data: libraryPlaylists, isLoading: libraryLoading } = useQuery<PlaylistWithDetails[]>({
    queryKey: ["/api/library-playlists", userId],
    enabled: !!userId,
  });

  const handlePlaylistClick = (playlistId: string) => {
    setLocation(`/playlist/${playlistId}`);
  };

  const handlePlaylistPlay = async (playlistId: string) => {
    // Get playlist with songs and start playing first song
    console.log('Starting playlist playback for:', playlistId);
    try {
      const response = await fetch(`/api/playlists/${playlistId}`);
      if (response.ok) {
        const playlist = await response.json();
        console.log('Playlist loaded:', playlist.name, 'Songs:', playlist.songs?.length || 0);
        if (playlist.songs && playlist.songs.length > 0) {
          console.log('Setting songs and starting playback of:', playlist.songs[0].title);
          setAllSongs(playlist.songs);
          // Start playing first song from playlist
          playSong(playlist.songs[0], playlist.songs);
        } else {
          console.log('No songs found in playlist');
        }
      } else {
        console.error('Failed to fetch playlist:', response.status);
      }
    } catch (error) {
      console.error('Error fetching playlist for playback:', error);
    }
  };

  const handleLibraryPlaylistPlay = (playlist: PlaylistWithDetails) => {
    if (playlist.songs && playlist.songs.length > 0) {
      setAllSongs(playlist.songs);
      playSong(playlist.songs[0], playlist.songs);
    }
  };


  return (
    <div className="min-h-screen">
      <Header showSearch={false} />
      
      <main className="px-4 pb-44">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Library</h1>
          <CreatePlaylistDialog />
        </div>

        {/* Recently Added */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Recently Added</h2>
          
          {playlistsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2 rounded-lg">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {playlists?.map((playlist) => (
                <PlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => handlePlaylistClick(playlist.id)}
                  onPlay={() => handlePlaylistPlay(playlist.id)}
                  userId="demo-user-123"
                />
              ))}
            </div>
          )}
        </section>

        {/* Library Playlists */}
        {libraryPlaylists && libraryPlaylists.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4" data-testid="text-library-playlists-title">
              Your Library Playlists
            </h2>
            <div className="space-y-2">
              {libraryPlaylists.map((playlist) => (
                <PlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  onPlay={() => handleLibraryPlaylistPlay(playlist)}
                  onClick={() => handlePlaylistClick(playlist.id)}
                  userId="demo-user-123"
                />
              ))}
            </div>
          </section>
        )}

        {/* Liked Songs */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Liked Songs</h2>
            {(likedSongs?.length || 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/liked-songs')}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-see-all-liked"
              >
                See all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
          
          {likedLoading ? (
            <Skeleton className="h-16 rounded-lg bg-card" />
          ) : likedSongs && likedSongs.length > 0 ? (
            <Button
              variant="ghost"
              onClick={() => setLocation('/liked-songs')}
              className="w-full justify-start p-3 h-auto bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
              data-testid="button-liked-songs"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 fill-current" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Liked Songs</p>
                  <p className="text-sm opacity-90">
                    {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto" />
            </Button>
          ) : (
            <div className="text-center py-8 bg-card/50 rounded-lg border border-dashed">
              <Heart className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground" data-testid="text-no-liked-songs">
                No liked songs yet
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
