import { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from "react";
import { type SongWithDetails } from "@shared/schema";

interface MusicPlayerState {
  currentSong: SongWithDetails | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: SongWithDetails[];
  currentIndex: number;
  isPlaylist: boolean; // Track if we're playing from a playlist
  allSongs: SongWithDetails[]; // Store all available songs for random selection
}

interface MusicPlayerContextType {
  state: MusicPlayerState;
  playSong: (song: SongWithDetails, queue?: SongWithDetails[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  addToQueue: (song: SongWithDetails) => void;
  removeFromQueue: (index: number) => void;
  setAllSongs: (songs: SongWithDetails[]) => void; // Add method to set all songs for random selection
  closePlayer: () => void; // Add method to close the player
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MusicPlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isMuted: false,
    queue: [],
    currentIndex: 0,
    isPlaylist: false,
    allSongs: [],
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume / 100;
    
    const audio = audioRef.current;
    
    // Audio event listeners
    audio.addEventListener('loadeddata', () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    });
    
    audio.addEventListener('timeupdate', () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    });
    
    audio.addEventListener('ended', () => {
      // Auto play next song
      nextSong();
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Audio error type:', e.type);
      console.error('Audio src:', audio.src);
      console.error('Audio readyState:', audio.readyState);
      console.error('Audio networkState:', audio.networkState);
      
      // Don't stop playback if it's just a mute/unlock context error
      if (audio.src.includes('data:audio/wav;base64')) {
        console.log('Ignoring error from audio context unlock attempt');
        return;
      }
      
      // Stop playback instead of auto-skipping - let user decide what to do
      console.log('Audio failed to load - stopping playback');
      setState(prev => ({ ...prev, isPlaying: false }));
    });
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update audio when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (state.currentSong && state.currentSong.audioUrl) {
      console.log('🎵 Setting audio src to:', state.currentSong.audioUrl, 'for song:', state.currentSong.title);
      audio.src = state.currentSong.audioUrl;
      audio.load();
    } else {
      // Clear audio src when no song is set to prevent playing page URL
      audio.src = '';
      audio.pause();
      if (state.currentSong) {
        console.warn('⚠️ No audioUrl found for current song:', state.currentSong.title);
      }
    }
  }, [state.currentSong?.audioUrl]);

  // Update audio play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (state.isPlaying && state.currentSong && state.currentSong.audioUrl) {
      console.log('Attempting to play:', state.currentSong.title, 'from URL:', state.currentSong.audioUrl);
      
      // Only try to play if we have a valid audio source
      if (audio.src && audio.src !== '' && !audio.src.includes(window.location.href)) {
        if (audio.paused) {
          audio.play().then(() => {
            console.log('Audio playing successfully');
          }).catch(e => {
            console.error('Failed to play audio:', e);
            console.error('Audio error details:', e.name, e.message);
            
            // Show user-friendly message
            if (e.name === 'NotAllowedError') {
              console.warn('Audio blocked by browser - user interaction required');
              // Keep the isPlaying state true so user can try clicking again
            } else {
              setState(prev => ({ ...prev, isPlaying: false }));
            }
          });
        }
      } else {
        console.warn('Cannot play - invalid audio source:', audio.src);
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    } else {
      audio.pause();
    }
  }, [state.isPlaying, state.currentSong]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Set volume normally
      audio.volume = state.volume / 100;
      // Set muted state
      audio.muted = state.isMuted;
    }
  }, [state.volume, state.isMuted]);


  const playSong = async (song: SongWithDetails, queue: SongWithDetails[] = []) => {
    console.log('🎵 playSong called with:', song.title, 'audioUrl:', song.audioUrl);
    const newQueue = queue.length > 0 ? queue : [song];
    const index = newQueue.findIndex(s => s.id === song.id);
    const isFromPlaylist = queue.length > 1; // If queue has multiple songs, it's from a playlist
    
    setState(prev => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      queue: newQueue,
      currentIndex: index >= 0 ? index : 0,
      currentTime: 0,
      duration: song.duration,
      isPlaylist: isFromPlaylist,
    }));
  };

  const pauseSong = () => {
    setState(prev => ({ ...prev, isPlaying: false }));
  };

  const resumeSong = () => {
    setState(prev => ({ ...prev, isPlaying: true }));
  };

  const nextSong = async () => {
    setState(prev => {
      // Always try to go to next song in current queue first
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex < prev.queue.length) {
        const nextSong = prev.queue[nextIndex];
        return {
          ...prev,
          currentSong: nextSong,
          currentIndex: nextIndex,
          currentTime: 0,
          duration: nextSong.duration,
          isPlaying: true,
        };
      }
      
      // If no more songs in queue, play random song (prefer working ones)
      if (prev.allSongs.length > 0) {
        // Filter out current song and prefer songs with working audio URLs
        const availableSongs = prev.allSongs.filter(s => {
          if (s.id === prev.currentSong?.id) return false;
          // Prefer songs with local CC music or any http URLs
          return s.audioUrl?.includes('/attached_assets/cc_music/') || s.audioUrl?.includes('http');
        });
        
        if (availableSongs.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableSongs.length);
          const randomSong = availableSongs[randomIndex];
          
          // Add to queue and update index
          const newQueue = [...prev.queue, randomSong];
          return {
            ...prev,
            currentSong: randomSong,
            queue: newQueue,
            currentIndex: newQueue.length - 1,
            currentTime: 0,
            duration: randomSong.duration,
            isPlaying: true,
            isPlaylist: false,
          };
        }
      }
      
      return prev;
    });
  };

  const previousSong = () => {
    setState(prev => {
      const prevIndex = prev.currentIndex - 1;
      if (prevIndex >= 0 && prev.queue[prevIndex]) {
        const prevSong = prev.queue[prevIndex];
        return {
          ...prev,
          currentSong: prevSong,
          currentIndex: prevIndex,
          currentTime: 0,
          duration: prevSong.duration,
          isPlaying: true,
        };
      }
      return prev;
    });
  };

  const setVolume = (volume: number) => {
    setState(prev => ({ ...prev, volume }));
  };

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    
    // Prevent double clicks
    if (audio.dataset.mutingInProgress === 'true') {
      return;
    }
    
    audio.dataset.mutingInProgress = 'true';
    
    setState(prev => {
      const newMutedState = !prev.isMuted;
      
      // Set audio.muted immediately
      audio.muted = newMutedState;
      
      // Clear the flag after a short delay
      setTimeout(() => {
        audio.dataset.mutingInProgress = 'false';
      }, 100);
      
      return { ...prev, isMuted: newMutedState };
    });
  }, []);

  const setCurrentTime = (currentTime: number) => {
    setState(prev => ({ ...prev, currentTime }));
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = currentTime;
    }
  };

  const addToQueue = (song: SongWithDetails) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, song],
    }));
  };

  const removeFromQueue = (index: number) => {
    setState(prev => {
      const newQueue = prev.queue.filter((_, i) => i !== index);
      let newCurrentIndex = prev.currentIndex;
      
      if (index < prev.currentIndex) {
        newCurrentIndex = prev.currentIndex - 1;
      } else if (index === prev.currentIndex) {
        // If we're removing the current song, play the next one
        if (newQueue.length > 0) {
          const nextIndex = Math.min(newCurrentIndex, newQueue.length - 1);
          const nextSong = newQueue[nextIndex];
          return {
            ...prev,
            queue: newQueue,
            currentSong: nextSong,
            currentIndex: nextIndex,
            currentTime: 0,
            duration: nextSong.duration,
          };
        } else {
          return {
            ...prev,
            queue: newQueue,
            currentSong: null,
            currentIndex: 0,
            isPlaying: false,
          };
        }
      }
      
      return {
        ...prev,
        queue: newQueue,
        currentIndex: newCurrentIndex,
      };
    });
  };

  const setAllSongs = useCallback((songs: SongWithDetails[]) => {
    setState(prev => ({
      ...prev,
      allSongs: songs,
    }));
  }, []);

  const closePlayer = useCallback(() => {
    // Stop audio and reset player state
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    setState({
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 80,
      isMuted: false,
      queue: [],
      currentIndex: 0,
      isPlaylist: false,
      allSongs: [],
    });
  }, []);

  const value: MusicPlayerContextType = {
    state,
    playSong,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setVolume,
    toggleMute,
    setCurrentTime,
    addToQueue,
    removeFromQueue,
    setAllSongs,
    closePlayer,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
}
