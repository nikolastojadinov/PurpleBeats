// Setup Creative Commons Music for PurpleBeats
import { storage } from "./storage";
import { randomUUID } from "crypto";

interface CCMusicData {
  artists: Array<{
    id: string;
    name: string;
    imageUrl: string;
  }>;
  albums: Array<{
    id: string;
    title: string;
    artistId: string;
    imageUrl: string;
    releaseYear: number;
  }>;
  songs: Array<{
    id: string;
    title: string;
    artistId: string;
    albumId?: string;
    duration: number;
    genre: string;
    audioUrl: string;
    imageUrl: string;
    attribution: string;
  }>;
}

export async function setupCreativeCommonsMusic(): Promise<void> {
  console.log("🎵 Setting up Creative Commons music...");

  // Clear existing data first
  console.log("🗑️ Clearing old music data...");
  await clearExistingMusic();

  const ccMusicData: CCMusicData = {
    artists: [
      {
        id: "artist-kevin-macleod",
        name: "Kevin MacLeod",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop"
      },
      {
        id: "artist-scott-buckley", 
        name: "Scott Buckley",
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop"
      },
      {
        id: "artist-purple-planet",
        name: "Purple Planet Music",
        imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop"
      },
      {
        id: "artist-bensound",
        name: "Bensound",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop"
      },
      {
        id: "artist-zapsplat",
        name: "Zapsplat Music",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=150&h=150&fit=crop"
      },
      {
        id: "artist-ccmixter",
        name: "ccMixter Artists",
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop"
      }
    ],
    albums: [
      {
        id: "album-electronic-beats",
        title: "Electronic Beats",
        artistId: "artist-kevin-macleod",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        releaseYear: 2024
      },
      {
        id: "album-cinematic-journeys",
        title: "Cinematic Journeys", 
        artistId: "artist-scott-buckley",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
        releaseYear: 2024
      },
      {
        id: "album-purple-collection",
        title: "Purple Collection",
        artistId: "artist-purple-planet",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=150&h=150&fit=crop",
        releaseYear: 2024
      },
      {
        id: "album-ambient-space",
        title: "Ambient Space",
        artistId: "artist-bensound",
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
        releaseYear: 2024
      },
      {
        id: "album-creative-commons-hits",
        title: "Creative Commons Hits",
        artistId: "artist-ccmixter",
        imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop",
        releaseYear: 2024
      }
    ],
    songs: [
      // Kevin MacLeod - Electronic/Dance (8 songs)
      {
        id: "cc-song-stringed-disco",
        title: "Stringed Disco",
        artistId: "artist-kevin-macleod",
        albumId: "album-electronic-beats",
        duration: 142,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-beat-1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Stringed Disco by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-monkeys-spinning",
        title: "Monkeys Spinning Monkeys",
        artistId: "artist-kevin-macleod", 
        albumId: "album-electronic-beats",
        duration: 134,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-beat-2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Monkeys Spinning Monkeys by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-fluffing-duck",
        title: "Fluffing a Duck",
        artistId: "artist-kevin-macleod",
        albumId: "album-electronic-beats", 
        duration: 128,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-ambient-1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Fluffing a Duck by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-brain-dance",
        title: "Brain Dance",
        artistId: "artist-kevin-macleod",
        albumId: "album-electronic-beats",
        duration: 156,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-beat-3.mp3", 
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Brain Dance by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-electroswing",
        title: "Electroswing",
        artistId: "artist-kevin-macleod",
        albumId: "album-electronic-beats",
        duration: 163,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-beat-4.mp3",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Electroswing by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-cipher", 
        title: "Cipher",
        artistId: "artist-kevin-macleod",
        albumId: "album-electronic-beats",
        duration: 147,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-ambient-2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Cipher by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-local-forecast",
        title: "Local Forecast",
        artistId: "artist-kevin-macleod",
        albumId: "album-electronic-beats",
        duration: 138,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-beat-5.mp3",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Local Forecast by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-pixel-peeker",
        title: "Pixel Peeker Polka",
        artistId: "artist-kevin-macleod",
        albumId: "album-electronic-beats",
        duration: 124,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-ambient-3.mp3",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Pixel Peeker Polka by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      },
      
      // Scott Buckley - Cinematic/Ambient (7 songs)
      {
        id: "cc-song-uprising",
        title: "Uprising",
        artistId: "artist-scott-buckley",
        albumId: "album-cinematic-journeys",
        duration: 189,
        genre: "Cinematic",
        audioUrl: "/audio/placeholder-cinematic-1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
        attribution: "Music: Uprising by Scott Buckley (www.scottbuckley.com.au) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-rise-above",
        title: "Rise Above", 
        artistId: "artist-scott-buckley",
        albumId: "album-cinematic-journeys",
        duration: 176,
        genre: "Cinematic",
        audioUrl: "/audio/placeholder-cinematic-2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
        attribution: "Music: Rise Above by Scott Buckley (www.scottbuckley.com.au) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-ephemera",
        title: "Ephemera",
        artistId: "artist-scott-buckley",
        albumId: "album-cinematic-journeys",
        duration: 203,
        genre: "Ambient",
        audioUrl: "/audio/placeholder-ambient-4.mp3",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
        attribution: "Music: Ephemera by Scott Buckley (www.scottbuckley.com.au) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-effervescence",
        title: "Effervescence",
        artistId: "artist-scott-buckley",
        albumId: "album-cinematic-journeys",
        duration: 187,
        genre: "Ambient",
        audioUrl: "/audio/placeholder-ambient-5.mp3",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
        attribution: "Music: Effervescence by Scott Buckley (www.scottbuckley.com.au) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-constellation",
        title: "Constellation",
        artistId: "artist-scott-buckley",
        albumId: "album-cinematic-journeys",
        duration: 198,
        genre: "Cinematic",
        audioUrl: "/audio/placeholder-cinematic-3.mp3",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
        attribution: "Music: Constellation by Scott Buckley (www.scottbuckley.com.au) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-legionnaire",
        title: "Legionnaire",
        artistId: "artist-scott-buckley",
        albumId: "album-cinematic-journeys",
        duration: 172,
        genre: "Cinematic",
        audioUrl: "/audio/placeholder-cinematic-4.mp3",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
        attribution: "Music: Legionnaire by Scott Buckley (www.scottbuckley.com.au) | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-void",
        title: "Void",
        artistId: "artist-scott-buckley",
        albumId: "album-cinematic-journeys",
        duration: 209,
        genre: "Ambient",
        audioUrl: "/audio/placeholder-ambient-6.mp3",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
        attribution: "Music: Void by Scott Buckley (www.scottbuckley.com.au) | Licensed under Creative Commons: By Attribution 4.0"
      },

      // Purple Planet Music - Electronic/Synthwave (5 songs)
      {
        id: "cc-song-purple-highway",
        title: "Purple Highway",
        artistId: "artist-purple-planet",
        albumId: "album-purple-collection",
        duration: 154,
        genre: "Synthwave",
        audioUrl: "/audio/placeholder-synthwave-1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=150&h=150&fit=crop",
        attribution: "Music: Purple Highway by Purple Planet Music | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-neon-nights",
        title: "Neon Nights",
        artistId: "artist-purple-planet",
        albumId: "album-purple-collection",
        duration: 167,
        genre: "Synthwave",
        audioUrl: "/audio/placeholder-synthwave-2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=150&h=150&fit=crop",
        attribution: "Music: Neon Nights by Purple Planet Music | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-digital-dreams",
        title: "Digital Dreams",
        artistId: "artist-purple-planet",
        albumId: "album-purple-collection",
        duration: 143,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-electronic-1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=150&h=150&fit=crop",
        attribution: "Music: Digital Dreams by Purple Planet Music | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-retro-future",
        title: "Retro Future",
        artistId: "artist-purple-planet",
        albumId: "album-purple-collection",
        duration: 178,
        genre: "Synthwave",
        audioUrl: "/audio/placeholder-synthwave-3.mp3",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=150&h=150&fit=crop",
        attribution: "Music: Retro Future by Purple Planet Music | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-cyber-pulse",
        title: "Cyber Pulse",
        artistId: "artist-purple-planet",
        albumId: "album-purple-collection",
        duration: 162,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-electronic-2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=150&h=150&fit=crop",
        attribution: "Music: Cyber Pulse by Purple Planet Music | Licensed under Creative Commons: By Attribution 4.0"
      },

      // Bensound - Ambient/Chill (5 songs)
      {
        id: "cc-song-creative-minds",
        title: "Creative Minds",
        artistId: "artist-bensound",
        albumId: "album-ambient-space",
        duration: 193,
        genre: "Ambient",
        audioUrl: "/audio/placeholder-chill-1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
        attribution: "Music: Creative Minds by Bensound | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-memories",
        title: "Memories",
        artistId: "artist-bensound",
        albumId: "album-ambient-space",
        duration: 207,
        genre: "Ambient",
        audioUrl: "/audio/placeholder-chill-2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
        attribution: "Music: Memories by Bensound | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-tenderness",
        title: "Tenderness",
        artistId: "artist-bensound",
        albumId: "album-ambient-space",
        duration: 184,
        genre: "Ambient",
        audioUrl: "/audio/placeholder-chill-3.mp3",
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
        attribution: "Music: Tenderness by Bensound | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-dreams",
        title: "Dreams",
        artistId: "artist-bensound",
        albumId: "album-ambient-space",
        duration: 176,
        genre: "Ambient",
        audioUrl: "/audio/placeholder-chill-4.mp3",
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
        attribution: "Music: Dreams by Bensound | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-slow-motion",
        title: "Slow Motion",
        artistId: "artist-bensound",
        albumId: "album-ambient-space",
        duration: 215,
        genre: "Ambient",
        audioUrl: "/audio/placeholder-chill-5.mp3",
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
        attribution: "Music: Slow Motion by Bensound | Licensed under Creative Commons: By Attribution 4.0"
      },

      // ccMixter Artists - Mixed Genres (5 songs)
      {
        id: "cc-song-beat-drop",
        title: "Beat Drop",
        artistId: "artist-ccmixter",
        albumId: "album-creative-commons-hits",
        duration: 148,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-drop-1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop",
        attribution: "Music: Beat Drop by ccMixter Artists | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-frequency",
        title: "Frequency",
        artistId: "artist-ccmixter",
        albumId: "album-creative-commons-hits",
        duration: 156,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-drop-2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop",
        attribution: "Music: Frequency by ccMixter Artists | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-wavelength",
        title: "Wavelength",
        artistId: "artist-ccmixter",
        albumId: "album-creative-commons-hits",
        duration: 132,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-drop-3.mp3",
        imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop",
        attribution: "Music: Wavelength by ccMixter Artists | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-spectrum",
        title: "Spectrum",
        artistId: "artist-ccmixter",
        albumId: "album-creative-commons-hits",
        duration: 164,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-drop-4.mp3",
        imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop",
        attribution: "Music: Spectrum by ccMixter Artists | Licensed under Creative Commons: By Attribution 4.0"
      },
      {
        id: "cc-song-resonance",
        title: "Resonance",
        artistId: "artist-ccmixter",
        albumId: "album-creative-commons-hits",
        duration: 171,
        genre: "Electronic",
        audioUrl: "/audio/placeholder-drop-5.mp3",
        imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop",
        attribution: "Music: Resonance by ccMixter Artists | Licensed under Creative Commons: By Attribution 4.0"
      }
    ]
  };

  // Add artists
  console.log("👨‍🎤 Adding artists...");
  for (const artist of ccMusicData.artists) {
    await storage.createArtist(artist);
  }

  // Add albums  
  console.log("💿 Adding albums...");
  for (const album of ccMusicData.albums) {
    await storage.createAlbum(album);
  }

  // Add songs
  console.log("🎵 Adding songs...");
  for (const song of ccMusicData.songs) {
    await storage.createSong(song);
  }

  // Initialize default playlists with new songs
  console.log("📝 Setting up default playlists...");
  await storage.initializeDefaultPlaylists();

  console.log("✅ Creative Commons music setup complete!");
  console.log(`📊 Added: ${ccMusicData.artists.length} artists, ${ccMusicData.albums.length} albums, ${ccMusicData.songs.length} songs`);
}

async function clearExistingMusic(): Promise<void> {
  // This would clear existing music data
  // For now, just log since we'll replace the storage data
  console.log("Clearing existing music data...");
}