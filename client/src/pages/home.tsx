import { useQuery } from "@tanstack/react-query";
import { Heart, Play, User } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import TrackItem from "@/components/music/track-item";
import AlbumCard from "@/components/music/album-card";
import PlaylistItem from "@/components/music/playlist-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type SongWithDetails, type Playlist } from "@shared/schema";
import { useMusicPlayer } from "@/contexts/music-player-context";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";

// Recent Song Card komponenta sa play funkcionalošću
function RecentSongCard({ song }: { song: SongWithDetails }) {
  const { playSong } = useMusicPlayer();
  
  const handlePlaySong = () => {
    playSong(song);
  };

  return (
    <div 
      className="flex-shrink-0 cursor-pointer group relative"
      onClick={handlePlaySong}
    >
      <div className="relative">
        <img 
          src={song.imageUrl || song.album?.imageUrl || ''} 
          alt={`${song.title} Album`}
          className="w-32 h-32 rounded-lg object-cover album-glow" 
          data-testid={`img-recent-song-${song.id}`}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <Play className="h-8 w-8 text-white" fill="white" />
        </div>
      </div>
      <p className="text-sm font-medium mt-2 w-32 truncate" data-testid={`text-recent-title-${song.id}`}>
        {song.title}
      </p>
      <p className="text-xs text-muted-foreground truncate" data-testid={`text-recent-artist-${song.id}`}>
        {song.artist.name}
      </p>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { setAllSongs, playSong } = useMusicPlayer();
  const { user } = useAuth();
  const userId = user?.uid;
  
  const { data: recentSongs, isLoading: recentLoading } = useQuery<SongWithDetails[]>({
    queryKey: ["/api/songs/recently-played"],
  });

  const { data: trendingSongs, isLoading: trendingLoading } = useQuery<SongWithDetails[]>({
    queryKey: ["/api/songs/trending"],
  });

  // Load all songs for random selection
  const { data: allSongs } = useQuery<SongWithDetails[]>({
    queryKey: ["/api/songs"],
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  // Set all songs in music player context when data loads
  useEffect(() => {
    if (allSongs && allSongs.length > 0) {
      setAllSongs(allSongs);
    }
  }, [allSongs, setAllSongs]);

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

  const handleSearch = (query: string) => {
    // Navigate to search page with query
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen">
      <Header onSearch={handleSearch} />
      
      <main className="px-4 pb-44">
        

        {/* Recently Played Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recently Played</h2>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto scroll-hide pb-2">
            {recentLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <Skeleton className="w-32 h-32 rounded-lg" />
                  <Skeleton className="h-4 w-24 mt-2" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
              ))
            ) : (
              recentSongs?.slice(0, 8).map((song) => (
                <RecentSongCard key={song.id} song={song} />
              ))
            )}
          </div>
        </section>

        {/* Made For You */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Made For You</h2>
          
          <div className="space-y-3">
            {playlistsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 bg-card rounded-lg p-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : (
              playlists?.map((playlist) => (
                <PlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => handlePlaylistClick(playlist.id)}
                  onPlay={() => handlePlaylistPlay(playlist.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* Trending Now */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Trending Now</h2>
          
          <div className="space-y-3">
            {trendingLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 bg-card rounded-lg p-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))
            ) : (
              trendingSongs?.slice(0, 4).map((song) => (
                <TrackItem
                  key={song.id}
                  song={song}
                />
              ))
            )}
          </div>
        </section>

        {/* New Releases */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">New Releases</h2>
          
          <div className="space-y-3">
            {trendingLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 bg-card rounded-lg p-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))
            ) : (
              allSongs?.slice(0, 3).map((song: SongWithDetails) => (
                <TrackItem
                  key={song.id}
                  song={song}
                />
              ))
            )}
          </div>
        </section>

        {/* Top Charts */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Top Charts</h2>
          
          <div className="space-y-3">
            {trendingLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 bg-card rounded-lg p-3">
                  <div className="text-lg font-bold text-muted-foreground w-6">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))
            ) : (
              trendingSongs?.slice(0, 5).map((song: SongWithDetails, index: number) => (
                <div key={song.id} className="flex items-center space-x-3 bg-card rounded-lg p-3">
                  <div className="text-lg font-bold text-primary w-6">
                    {index + 1}
                  </div>
                  <TrackItem
                    song={song}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
