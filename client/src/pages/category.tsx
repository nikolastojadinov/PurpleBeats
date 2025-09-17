import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useMusicPlayer } from "@/contexts/music-player-context";
import Header from "@/components/layout/header";
import TrackItem from "@/components/music/track-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { type SongWithDetails } from "@shared/schema";

export default function Category() {
  const [location] = useLocation();
  const { setAllSongs, playSong } = useMusicPlayer();
  
  // Extract genre from URL parameter
  const genre = decodeURIComponent(location.split("/category/")[1] || "");

  const { data: songs, isLoading } = useQuery<SongWithDetails[]>({
    queryKey: [`/api/songs/genre/${genre}`],
    enabled: !!genre,
  });

  const handlePlayAll = () => {
    if (songs && songs.length > 0) {
      setAllSongs(songs);
      playSong(songs[0], songs);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="px-4 pb-44">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold capitalize" data-testid={`text-category-${genre}`}>
              {genre}
            </h1>
            <p className="text-muted-foreground mt-1">
              {songs ? `${songs.length} songs` : "Loading..."}
            </p>
          </div>
          {songs && songs.length > 0 && (
            <Button
              onClick={handlePlayAll}
              className="bg-primary hover:bg-primary/90"
              data-testid={`button-play-all-${genre}`}
            >
              <Play className="h-4 w-4 mr-2" />
              Play All
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 bg-card rounded-lg p-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        ) : songs && songs.length > 0 ? (
          <div className="space-y-3">
            {songs.map((song) => (
              <TrackItem
                key={song.id}
                song={song}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid={`text-no-songs-${genre}`}>
              No songs found in {genre} category
            </p>
          </div>
        )}
      </main>
    </div>
  );
}