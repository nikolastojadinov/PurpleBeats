import { Heart, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { type Membership } from "@shared/schema";

interface LikeButtonProps {
  songId: string;
  songTitle?: string;
  size?: "sm" | "default";
  className?: string;
}

export default function LikeButton({ 
  songId, 
  songTitle = "Song", 
  size = "sm",
  className = ""
}: LikeButtonProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.uid;

  // Check user's membership status
  const { data: membership } = useQuery<Membership>({
    queryKey: ['/api/membership', userId],
    enabled: !!userId,
  });

  const isPremium = membership?.isPremium && membership.expiresAt && new Date(membership.expiresAt) > new Date();

  // Check if song is liked
  const { data: likeStatus } = useQuery<{ isLiked: boolean }>({
    queryKey: ['/api/liked-songs', songId, 'check'],
  });

  const isLiked = likeStatus?.isLiked || false;

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/liked-songs/${songId}`);
      } else {
        await apiRequest("POST", "/api/liked-songs", { songId });
      }
    },
    onSuccess: () => {
      // Invalidate like status for this song
      queryClient.invalidateQueries({ 
        queryKey: ['/api/liked-songs', songId, 'check'] 
      });
      // Invalidate liked songs list
      queryClient.invalidateQueries({ 
        queryKey: ['/api/liked-songs'] 
      });
      
      toast({
        title: isLiked ? "Removed from Liked Songs" : "Added to Liked Songs",
        description: isLiked ? `${songTitle} removed from your liked songs` : `${songTitle} added to your liked songs`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update liked songs",
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    if (!isPremium) {
      // Show premium required toast
      toast({
        title: "Premium Feature",
        description: "Liking songs is a premium feature. Upgrade to Premium for only 3.14π to unlock this and more features!",
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
    
    // Proceed with like/unlike for premium users
    likeMutation.mutate();
  };

  return (
    <Button 
      variant="ghost" 
      size={size}
      onClick={handleClick}
      disabled={likeMutation.isPending}
      className={`transition-colors ${
        isLiked 
          ? 'text-red-500 hover:text-red-400' 
          : 'text-muted-foreground hover:text-primary'
      } ${className}`}
      data-testid={`button-like-song-${songId}`}
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
    </Button>
  );
}