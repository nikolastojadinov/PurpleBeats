import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/layout/header";
import TrackItem from "@/components/music/track-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { type SongWithDetails, type Playlist } from "@shared/schema";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const [targetPlaylistId, setTargetPlaylistId] = useState<string | null>(null);

  // Get query and playlist parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    const playlistParam = urlParams.get('playlist');
    
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    if (playlistParam) {
      setTargetPlaylistId(playlistParam);
    }
  }, [location]);

  // Get playlist details if we're adding to a specific playlist
  const { data: targetPlaylist } = useQuery<Playlist>({
    queryKey: ["/api/playlists", targetPlaylistId],
    enabled: !!targetPlaylistId,
  });

  const { data: searchResults, isLoading } = useQuery<SongWithDetails[]>({
    queryKey: ["/api/songs/search", { q: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  // Fetch available genres from the database
  const { data: genres = [] } = useQuery<string[]>({
    queryKey: ["/api/songs/genres"],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Update URL with search query
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen">
      <Header onSearch={handleSearch} />
      
      <main className="px-4 pb-44">
        {/* Back Button when adding to playlist */}
        {targetPlaylistId && targetPlaylist && (
          <div className="mb-4 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation(`/playlist/${targetPlaylistId}`)}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-back-to-playlist"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {targetPlaylist.name}
            </Button>
            <div className="text-sm text-muted-foreground">
              Adding songs to: <span className="font-medium text-foreground">{targetPlaylist.name}</span>
            </div>
          </div>
        )}
        {searchQuery ? (
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Search results for "{searchQuery}"
            </h2>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
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
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((song) => (
                  <TrackItem
                    key={song.id}
                    song={song}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground" data-testid="text-no-results">
                  No results found for "{searchQuery}"
                </p>
              </div>
            )}
          </section>
        ) : (
          <section>
            <h2 className="text-lg font-semibold mb-4">Browse by Genre</h2>
            <div className="grid grid-cols-2 gap-3">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setLocation(`/category/${encodeURIComponent(genre)}`)}
                  className="bg-card rounded-lg p-4 text-left hover:bg-secondary transition-colors"
                  data-testid={`button-genre-${genre.toLowerCase().replace(' ', '-')}`}
                >
                  <span className="font-medium">{genre}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
