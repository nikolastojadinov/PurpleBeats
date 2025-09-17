import { useState } from "react";
import { MoreVertical, Heart, Library, Plus, ChevronDown, Crown, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Playlist, Membership } from "@shared/schema";

interface PlaylistOptionsMenuProps {
  playlist: Playlist;
  userId?: string;
  onAddToPlaylist?: (songId: string, targetPlaylistId: string) => void;
}

export function PlaylistOptionsMenu({ 
  playlist, 
  userId,
  onAddToPlaylist 
}: PlaylistOptionsMenuProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const authUserId = user?.uid;
  const finalUserId = userId || authUserId;
  const [open, setOpen] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);

  // Get user's membership status
  const { data: membership } = useQuery<Membership>({
    queryKey: ['/api/membership', finalUserId],
    enabled: !!finalUserId,
  });
  
  const isPremium = membership?.isPremium && membership.expiresAt && new Date(membership.expiresAt) > new Date();

  // Check if playlist is liked
  const { data: likedData } = useQuery({
    queryKey: [`/api/liked-playlists/${playlist.id}/check?userId=${finalUserId}`],
    enabled: !!playlist.id && !!finalUserId,
  });

  // Check if playlist is in library
  const { data: libraryData } = useQuery({
    queryKey: [`/api/library-playlists/${playlist.id}/check?userId=${finalUserId}`],
    enabled: !!playlist.id && !!finalUserId,
  });

  // Get user playlists (for "add to other playlist" option)
  const { data: userPlaylists } = useQuery({
    queryKey: [`/api/playlists/user/${finalUserId}`],
    enabled: !!finalUserId,
  });

  const isLiked = (likedData as any)?.isLiked || false;
  const isInLibrary = (libraryData as any)?.isInLibrary || false;

  // Like/Unlike playlist mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!isPremium) {
        throw new Error("Premium feature required. Upgrade to Premium to like playlists!");
      }
      if (isLiked) {
        await apiRequest("DELETE", `/api/liked-playlists/${playlist.id}?userId=${finalUserId}`);
      } else {
        await apiRequest("POST", "/api/liked-playlists", { playlistId: playlist.id, userId: finalUserId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/liked-playlists/${playlist.id}/check`] });
      queryClient.invalidateQueries({ queryKey: [`/api/liked-playlists/${userId}`] });
      toast({
        title: isLiked ? "Playlist removed from liked" : "Playlist liked",
        description: isLiked 
          ? "Playlist removed from your liked playlists" 
          : "Playlist added to your liked playlists",
      });
    },
    onError: (error: any) => {
      console.error("Like playlist error:", error);
      const message = error?.message || "Failed to update playlist";
      if (message.includes("Premium feature required")) {
        toast({
          title: "Premium Feature",
          description: "Liking playlists is a premium feature. Upgrade to Premium for only 3.14π!",
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

  // Add/Remove from library mutation
  const libraryMutation = useMutation({
    mutationFn: async () => {
      if (!isPremium) {
        throw new Error("Premium feature required. Upgrade to Premium to manage your library!");
      }
      if (isInLibrary) {
        await apiRequest("DELETE", `/api/library-playlists/${playlist.id}?userId=${finalUserId}`);
      } else {
        await apiRequest("POST", "/api/library-playlists", { playlistId: playlist.id, userId: finalUserId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/library-playlists/${playlist.id}/check`] });
      queryClient.invalidateQueries({ queryKey: [`/api/library-playlists/${finalUserId}`] });
      toast({
        title: isInLibrary ? "Playlist removed from library" : "Playlist added to library",
        description: isInLibrary 
          ? "Playlist removed from your library" 
          : "Playlist added to your library",
      });
    },
    onError: (error: any) => {
      console.error("Library action error:", error);
      const message = error?.message || "Failed to update library";
      if (message.includes("Premium feature required")) {
        toast({
          title: "Premium Feature",
          description: "Managing your library is a premium feature. Upgrade to Premium for only 3.14π!",
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

  const handleLikePlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate();
    setOpen(false);
  };

  const handleLibraryAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    libraryMutation.mutate();
    setOpen(false);
  };

  const handleAddToPlaylist = (targetPlaylistId: string) => {
    // This would be used when we have a specific song to add
    // For now, this is a placeholder for future functionality
    if (onAddToPlaylist) {
      // onAddToPlaylist(songId, targetPlaylistId);
    }
    setOpen(false);
  };

  // Filter user-created playlists (not system playlists)
  const userCreatedPlaylists = (userPlaylists as Playlist[])?.filter((p: Playlist) => 
    p.createdBy === finalUserId && 
    !['discover-weekly', 'daily-mix-1', 'chill-ambient', 'electronic-energy', 'purple-vibes'].includes(p.id)
  ) || [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          data-testid={`playlist-options-${playlist.id}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-gray-900 border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={() => {
            if (!isPremium) {
              toast({
                title: "Premium Feature",
                description: "Liking playlists is a premium feature. Upgrade to Premium for only 3.14π!",
                variant: "default",
                action: (
                  <div className="flex items-center gap-1 text-primary">
                    <Crown className="h-3 w-3" />
                    <span className="text-xs">Upgrade</span>
                  </div>
                ),
              });
              setOpen(false);
              return;
            }
            likeMutation.mutate();
          }}
          disabled={likeMutation.isPending}
          className={`text-white cursor-pointer ${!isPremium ? 'opacity-50' : 'hover:bg-gray-800'}`}
          data-testid={`${isLiked ? 'unlike' : 'like'}-playlist-${playlist.id}`}
        >
          {!isPremium ? (
            <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-purple-500 text-purple-500' : 'text-white'}`} />
          )}
          {!isPremium ? "Like playlist" : (isLiked ? "Remove from liked playlists" : "Like playlist")}
          {!isPremium && <Crown className="ml-auto h-3 w-3 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            if (!isPremium) {
              toast({
                title: "Premium Feature",
                description: "Adding playlists to library is a premium feature. Upgrade to Premium for only 3.14π!",
                variant: "default",
                action: (
                  <div className="flex items-center gap-1 text-primary">
                    <Crown className="h-3 w-3" />
                    <span className="text-xs">Upgrade</span>
                  </div>
                ),
              });
              setOpen(false);
              return;
            }
            libraryMutation.mutate();
          }}
          disabled={libraryMutation.isPending}
          className={`text-white cursor-pointer ${!isPremium ? 'opacity-50' : 'hover:bg-gray-800'}`}
          data-testid={`${isInLibrary ? 'remove-from' : 'add-to'}-library-${playlist.id}`}
        >
          {!isPremium ? (
            <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <Library className={`mr-2 h-4 w-4 ${isInLibrary ? 'fill-purple-500 text-purple-500' : 'text-white'}`} />
          )}
          {!isPremium ? "Add to your library" : (isInLibrary ? "Remove from your library" : "Add to your library")}
          {!isPremium && <Crown className="ml-auto h-3 w-3 text-primary" />}
        </DropdownMenuItem>

        {userCreatedPlaylists.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gray-700" />
            {!showPlaylistSelector ? (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isPremium) {
                    toast({
                      title: "Premium Feature",
                      description: "Adding to playlists is a premium feature. Upgrade to Premium for only 3.14π!",
                      variant: "default",
                      action: (
                        <div className="flex items-center gap-1 text-primary">
                          <Crown className="h-3 w-3" />
                          <span className="text-xs">Upgrade</span>
                        </div>
                      ),
                    });
                    setOpen(false);
                    return;
                  }
                  setShowPlaylistSelector(true);
                }}
                className={`text-white cursor-pointer px-2 py-1.5 text-sm flex items-center ${!isPremium ? 'opacity-50' : 'hover:bg-gray-800'}`}
                data-testid={`show-add-to-playlist-${playlist.id}`}
              >
                {!isPremium ? (
                  <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add to other playlist
                {!isPremium ? (
                  <Crown className="ml-auto h-3 w-3 text-primary" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </div>
            ) : (
              <>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPlaylistSelector(false);
                  }}
                  className="text-white hover:bg-gray-800 cursor-pointer px-2 py-1.5 text-sm flex items-center"
                  data-testid={`hide-add-to-playlist-${playlist.id}`}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to other playlist
                  <ChevronDown className="ml-auto h-4 w-4 rotate-180" />
                </div>
                {userCreatedPlaylists.map((userPlaylist: Playlist) => (
                  <DropdownMenuItem
                    key={userPlaylist.id}
                    onClick={() => {
                      if (!isPremium) {
                        toast({
                          title: "Premium Feature",
                          description: "Adding to playlists is a premium feature. Upgrade to Premium for only 3.14π!",
                          variant: "default",
                          action: (
                            <div className="flex items-center gap-1 text-primary">
                              <Crown className="h-3 w-3" />
                              <span className="text-xs">Upgrade</span>
                            </div>
                          ),
                        });
                        setOpen(false);
                        return;
                      }
                      handleAddToPlaylist(userPlaylist.id);
                      setShowPlaylistSelector(false);
                      setOpen(false);
                    }}
                    className={`text-white cursor-pointer pl-8 ${!isPremium ? 'opacity-50' : 'hover:bg-gray-800'}`}
                    data-testid={`add-to-playlist-${userPlaylist.id}`}
                  >
                    {userPlaylist.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}