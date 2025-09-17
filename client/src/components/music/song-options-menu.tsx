import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Heart, Plus, MoreHorizontal, Music, Crown, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type SongWithDetails, type Playlist, type Membership } from "@shared/schema";

interface SongOptionsMenuProps {
  song: SongWithDetails;
  className?: string;
}

export default function SongOptionsMenu({ song, className = "" }: SongOptionsMenuProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.uid;

  // Get user's membership status
  const { data: membership } = useQuery<Membership>({
    queryKey: ['/api/membership', userId],
    enabled: !!userId,
  });
  
  const isPremium = membership?.isPremium && membership.expiresAt && new Date(membership.expiresAt) > new Date();

  // Check if song is liked
  const { data: likeStatus } = useQuery<{ isLiked: boolean }>({
    queryKey: ['/api/liked-songs', song.id, 'check'],
  });

  // Get all playlists for adding song
  const { data: allPlaylists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  // Get user's created playlists
  const { data: userPlaylists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists/user", userId],
    enabled: !!userId,
  });

  // Combine all playlists and user playlists, removing duplicates
  const playlists = React.useMemo(() => {
    const combined = [...(allPlaylists || []), ...(userPlaylists || [])];
    // Remove duplicates by id
    const uniquePlaylists = combined.filter((playlist, index, self) => 
      index === self.findIndex(p => p.id === playlist.id)
    );
    return uniquePlaylists;
  }, [allPlaylists, userPlaylists]);

  const isLiked = likeStatus?.isLiked || false;

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!isPremium) {
        throw new Error("Premium feature required. Upgrade to Premium to like songs!");
      }
      if (isLiked) {
        await apiRequest("DELETE", `/api/liked-songs/${song.id}`);
      } else {
        await apiRequest("POST", "/api/liked-songs", { songId: song.id });
      }
    },
    onSuccess: () => {
      // Invalidate like status for this song
      queryClient.invalidateQueries({ 
        queryKey: ['/api/liked-songs', song.id, 'check'] 
      });
      // Invalidate liked songs list
      queryClient.invalidateQueries({ 
        queryKey: ['/api/liked-songs'] 
      });
      
      toast({
        title: isLiked ? "Removed from Liked Songs" : "Added to Liked Songs",
        description: isLiked ? `${song.title} removed from your liked songs` : `${song.title} added to your liked songs`,
      });
    },
    onError: (error: any) => {
      console.error("Like song error:", error);
      const message = error?.message || "Failed to update liked songs";
      if (message.includes("Premium feature required")) {
        toast({
          title: "Premium Feature",
          description: "Liking songs is a premium feature. Upgrade to Premium for only 3.14π!",
          variant: "default",
          action: (
            <div className="flex items-center gap-1 text-primary">
              <Crown className="h-3 w-3" />
              <span className="text-xs">Upgrade</span>
            </div>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  // Add to playlist mutation
  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      // Get playlist details to find next position
      const playlistResponse = await apiRequest("GET", `/api/playlists/${playlistId}`);
      const playlist = await playlistResponse.json();
      const nextPosition = (playlist.songs?.length || 0) + 1;
      
      await apiRequest("POST", `/api/playlists/${playlistId}/songs`, {
        songId: song.id,
        position: nextPosition,
      });
    },
    onSuccess: (_, playlistId) => {
      // Invalidate playlist data to show new song
      queryClient.invalidateQueries({ 
        queryKey: ["/api/playlists", playlistId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/playlists"] 
      });
      // Invalidate user playlists to update song count on profile  
      queryClient.removeQueries({ 
        queryKey: ["/api/playlists/user", "demo-user-123"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/playlists/user"] 
      });
      
      toast({
        title: "Added to Playlist",
        description: `${song.title} has been added to the playlist.`,
      });
    },
    onError: (error: any) => {
      console.error("Add to playlist error:", error);
      const message = error?.message || "Failed to add song to playlist";
      if (message.includes("Premium feature required")) {
        toast({
          title: "Premium Feature",
          description: "Adding songs to playlists is a premium feature. Upgrade to Premium for only 3.14π!",
          variant: "default",
          action: (
            <div className="flex items-center gap-1 text-primary">
              <Crown className="h-3 w-3" />
              <span className="text-xs">Upgrade</span>
            </div>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const handleAddToPlaylist = (playlistId: string) => {
    addToPlaylistMutation.mutate(playlistId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`p-2 text-muted-foreground hover:text-foreground ${className}`}
          data-testid={`button-song-options-${song.id}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Song Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Like/Unlike Option */}
        <DropdownMenuItem 
          onClick={() => {
            if (!isPremium) {
              toast({
                title: "Premium Feature",
                description: "Liking songs is a premium feature. Upgrade to Premium for only 3.14π!",
                variant: "default",
                action: (
                  <div className="flex items-center gap-1 text-primary">
                    <Crown className="h-3 w-3" />
                    <span className="text-xs">Upgrade</span>
                  </div>
                ),
              });
              return;
            }
            likeMutation.mutate();
          }}
          disabled={likeMutation.isPending}
          className={`cursor-pointer ${!isPremium ? 'opacity-50' : ''}`}
          data-testid={`option-like-${song.id}`}
        >
          {!isPremium ? (
            <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
          )}
          {!isPremium ? "Add to Liked Songs" : (isLiked ? "Remove from Liked Songs" : "Add to Liked Songs")}
          {!isPremium && <Crown className="ml-auto h-3 w-3 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Add to Playlist Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger 
            className={`${!isPremium ? 'opacity-50' : ''}`}
            data-testid={`option-add-to-playlist-${song.id}`}
          >
            {!isPremium ? (
              <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add to Playlist
            {!isPremium && <Crown className="ml-auto h-3 w-3 text-primary" />}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {!isPremium ? (
              <DropdownMenuItem 
                onClick={() => {
                  toast({
                    title: "Premium Feature",
                    description: "Adding songs to playlists is a premium feature. Upgrade to Premium for only 3.14π!",
                    variant: "default",
                    action: (
                      <div className="flex items-center gap-1 text-primary">
                        <Crown className="h-3 w-3" />
                        <span className="text-xs">Upgrade</span>
                      </div>
                    ),
                  });
                }}
                className="cursor-pointer opacity-50"
              >
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                Premium Required
                <Crown className="ml-auto h-3 w-3 text-primary" />
              </DropdownMenuItem>
            ) : (
              <>
                {playlists && playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <DropdownMenuItem
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      disabled={addToPlaylistMutation.isPending}
                      className="cursor-pointer"
                      data-testid={`option-playlist-${playlist.id}`}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      {playlist.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    <Music className="mr-2 h-4 w-4" />
                    No playlists available
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}