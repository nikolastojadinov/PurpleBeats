import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Play, Shuffle } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import TrackItem from "@/components/music/track-item";
import UserPlaylistMenu from "@/components/music/user-playlist-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type SongWithDetails, type Playlist } from "@shared/schema";
import { useMusicPlayer } from "@/contexts/music-player-context";

export default function PlaylistPage() {
  const [, params] = useRoute("/playlist/:id");
  const [, setLocation] = useLocation();
  const { playSong } = useMusicPlayer();
  
  const playlistId = params?.id;

  const { data: playlistData, isLoading: playlistLoading } = useQuery<any>({
    queryKey: ["/api/playlists", playlistId],
    enabled: !!playlistId,
  });

  const playlist = playlistData;
  const playlistSongs = playlistData?.songs;

  const handlePlayAll = () => {
    if (playlistSongs && playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  const handleShuffle = () => {
    if (playlistSongs && playlistSongs.length > 0) {
      const shuffled = [...playlistSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  if (!playlistId) {
    return <div>Playlist not found</div>;
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="px-4 pb-44">
        {/* Back Button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Playlist Header */}
        {playlistLoading ? (
          <div className="mb-8">
            <Skeleton className="w-48 h-48 rounded-lg mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ) : playlist ? (
          <div className="text-center mb-8">
            <img 
              src={playlist.imageUrl} 
              alt={playlist.name}
              className="w-48 h-48 rounded-lg object-cover mx-auto mb-4 album-glow" 
            />
            <h1 className="text-2xl font-bold mb-2" data-testid={`text-playlist-title-${playlist.id}`}>
              {playlist.name}
            </h1>
            <p className="text-muted-foreground" data-testid={`text-playlist-description-${playlist.id}`}>
              {playlist.description}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {playlistSongs?.length || 0} songs
            </p>
          </div>
        ) : null}


        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={handlePlayAll}
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={!playlistSongs || playlistSongs.length === 0}
            data-testid="button-play-all"
          >
            <Play className="h-4 w-4 mr-2" fill="white" />
            Play All
          </Button>
          <Button 
            variant="outline"
            onClick={handleShuffle}
            disabled={!playlistSongs || playlistSongs.length === 0}
            data-testid="button-shuffle"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
          {playlist && (
            <UserPlaylistMenu 
              playlist={playlist} 
              isUserCreated={playlist.createdBy === "demo-user-123"}
            />
          )}
        </div>

        {/* Songs List */}
        <div className="space-y-2">
          {playlistLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 bg-card rounded-lg p-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))
          ) : playlistSongs && playlistSongs.length > 0 ? (
            playlistSongs.map((song: SongWithDetails, index: number) => (
              <div key={song.id} className="flex items-center space-x-3">
                <span className="text-muted-foreground text-sm w-6 text-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <TrackItem
                    song={song}
                    showEqualizer
                    onLike={() => {}}
                                      />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              This playlist is empty
            </div>
          )}
        </div>
      </main>
    </div>
  );
}