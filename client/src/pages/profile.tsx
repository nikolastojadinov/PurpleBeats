import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Users, 
  Music, 
  Heart, 
  Clock, 
  PlayCircle,
  Settings,
  Share,
  MoreHorizontal
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TrackItem from "@/components/music/track-item";
import PlaylistItem from "@/components/music/playlist-item";
import { useAuth } from "@/contexts/auth-context";
import { type SongWithDetails, type Playlist, type Membership } from "@shared/schema";

interface UserProfile {
  id: string;
  name: string;
  imageUrl?: string;
  nickname?: string;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, userId, isAuthenticated } = useAuth();

  // Fetch user data
  const { data: membership } = useQuery<Membership>({
    queryKey: ['/api/membership', userId],
    enabled: isAuthenticated,
  });

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ['/api/profile', userId],
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  const { data: likedSongs } = useQuery<SongWithDetails[]>({
    queryKey: ["/api/liked-songs"],
  });

  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  // Fetch user's created playlists
  const { data: userPlaylists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists/user", userId],
    enabled: isAuthenticated,
  });

  const { data: recentlyPlayed } = useQuery<SongWithDetails[]>({
    queryKey: ["/api/songs/recently-played"],
  });

  const isPremium = membership?.isPremium && membership.expiresAt && new Date(membership.expiresAt) > new Date();
  const userName = userProfile?.name || "Premium User";
  const userInitials = userName.split(' ').map(name => name.charAt(0).toUpperCase()).join('').slice(0, 2);

  // Mock data for profile stats (in real app this would come from backend)
  const profileStats = {
    followers: 42,
    following: 128,
    publicPlaylists: userPlaylists?.length || 0,
    totalListeningTime: "1,284 hours"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/")}
            className="p-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" data-testid="button-share-profile">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-profile-more">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-44">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/20">
            <AvatarImage src={userProfile?.imageUrl || ""} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-3xl font-bold mb-2" data-testid="text-profile-name">
            {userName}
          </h1>
          
          {isPremium ? (
            <Badge className="bg-gradient-to-r from-primary to-accent text-white mb-4">
              Premium Member
            </Badge>
          ) : (
            <Badge variant="outline" className="border-muted-foreground text-muted-foreground mb-4">
              Free Account
            </Badge>
          )}

          {/* Profile Stats */}
          <div className="flex justify-center space-x-6 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-followers-count">
                {profileStats.followers}
              </div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-following-count">
                {profileStats.following}
              </div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-playlists-count">
                {profileStats.publicPlaylists}
              </div>
              <div className="text-sm text-muted-foreground">Playlists</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-2 mb-8">
          <Button 
            className="bg-primary hover:bg-primary/90" 
            data-testid="button-edit-profile"
            onClick={() => setLocation("/edit-profile")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button 
            variant="outline" 
            data-testid="button-my-playlists"
            onClick={() => {
              // Scroll to playlists tab or switch to it
              const playlistsTab = document.querySelector('[data-testid="tab-playlists"]') as HTMLElement;
              if (playlistsTab) {
                playlistsTab.click();
              }
            }}
          >
            <Music className="mr-2 h-4 w-4" />
            My Playlists
          </Button>
          <Button variant="outline" data-testid="button-follow">
            <Users className="mr-2 h-4 w-4" />
            Follow
          </Button>
        </div>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="playlists" data-testid="tab-playlists">Playlists</TabsTrigger>
            <TabsTrigger value="following" data-testid="tab-following">Following</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Listening Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Listening Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profileStats.totalListeningTime}</div>
                    <div className="text-sm text-muted-foreground">Total listening time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{likedSongs?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Liked songs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Tracks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Top Tracks This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentlyPlayed?.slice(0, 5).map((song, index) => (
                    <div key={song.id} className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                      <div className="flex-1">
                        <TrackItem song={song} showEqualizer={false} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recently Played */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Recently Played
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentlyPlayed?.slice(0, 8).map((song) => (
                    <TrackItem key={song.id} song={song} showEqualizer={false} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Public Playlists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* Liked Songs */}
                  <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-accent/10 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <Heart className="h-8 w-8 text-white" fill="white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" data-testid="text-liked-songs-title">Liked Songs</h3>
                      <p className="text-sm text-muted-foreground">
                        {likedSongs?.length || 0} songs
                      </p>
                    </div>
                  </div>

                  {/* User Created Playlists */}
                  {userPlaylists && userPlaylists.length > 0 ? (
                    userPlaylists.map((playlist) => (
                      <PlaylistItem 
                        key={playlist.id} 
                        playlist={playlist} 
                        onPlay={() => setLocation(`/playlist/${playlist.id}`)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No playlists created yet</p>
                      <p className="text-sm mt-1">Create your first playlist to see it here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Following ({profileStats.following})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock following list */}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/20">U{index + 1}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Music Lover {index + 1}</div>
                          <div className="text-sm text-muted-foreground">{Math.floor(Math.random() * 50)} followers</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Following</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock activity feed */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={userProfile?.imageUrl || ""} alt={userName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{userName}</span> liked{" "}
                          <span className="font-medium">Mountain Song</span>
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={userProfile?.imageUrl || ""} alt={userName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{userName}</span> created a new playlist{" "}
                          <span className="font-medium">Chill Vibes</span>
                        </p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={userProfile?.imageUrl || ""} alt={userName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{userName}</span> started following{" "}
                          <span className="font-medium">Electronic Beats</span>
                        </p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}