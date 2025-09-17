import { Search, Crown, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "@/components/profile/profile-dropdown";
import { useAuth } from "@/contexts/auth-context";
import { type Membership, type SongWithDetails, type Playlist, type Artist } from "@shared/schema";
import logoImage from "@/assets/logo.jpeg";

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  userId?: string; // Add userId prop to check membership status
}

export default function Header({ onSearch, showSearch = true }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.uid;

  // Check premium membership status
  const { data: membership } = useQuery<Membership>({
    queryKey: ['/api/membership', userId],
    enabled: isAuthenticated,
  });

  // Search suggestions query
  const { data: searchResults } = useQuery<{
    songs: SongWithDetails[];
    playlists: Playlist[];
    artists: Artist[];
  }>({
    queryKey: ["/api/search", { q: searchQuery }],
    enabled: searchQuery.length >= 2,
  });

  // Combine all suggestions
  const suggestions = [
    ...(searchResults?.songs || []).map(song => ({ ...song, type: 'song' as const })),
    ...(searchResults?.playlists || []).map(playlist => ({ ...playlist, type: 'playlist' as const })),
    ...(searchResults?.artists || []).map(artist => ({ ...artist, type: 'artist' as const }))
  ];

  const isPremium = membership?.isPremium && membership.expiresAt && new Date(membership.expiresAt) > new Date();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const name = suggestion.type === 'song' ? suggestion.title : suggestion.name;
    setSearchQuery(name);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(name);
    }
    
    // Navigate to specific page based on type
    if (suggestion.type === 'playlist') {
      setLocation(`/playlist/${suggestion.id}`);
    } else if (suggestion.type === 'artist') {
      setLocation(`/artist/${suggestion.id}`);
    } else {
      // For songs, just search
      if (onSearch) {
        onSearch(name);
      }
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="px-4 pt-12 pb-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border-2 border-yellow-400 overflow-hidden p-0">
            <img 
              src={logoImage} 
              alt="PurpleBeats Logo" 
              className="w-full h-full object-cover rounded-full"
              data-testid="img-logo"
              style={{ margin: 0, padding: 0 }}
            />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PurpleBeats
          </h1>
        </div>
        <ProfileDropdown isPremium={isPremium} />
      </div>
      
      {showSearch && (
        <div ref={searchRef} className="relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder="Search songs, artists, albums..."
              className="w-full bg-card border border-border rounded-full px-4 py-3 pl-12 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="input-search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.slice(0, 8).map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  data-testid={`suggestion-${suggestion.type}-${suggestion.id}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    {suggestion.type === 'song' ? (
                      <Search className="h-4 w-4 text-primary" />
                    ) : suggestion.type === 'playlist' ? (
                      <div className="h-4 w-4 text-primary">♪</div>
                    ) : (
                      <div className="h-4 w-4 text-primary">♫</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {suggestion.type === 'song' ? suggestion.title : suggestion.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {suggestion.type === 'song' ? suggestion.artist?.name : 
                       suggestion.type === 'playlist' ? `Playlist • ${suggestion.songCount || 0} songs` :
                       'Artist'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
