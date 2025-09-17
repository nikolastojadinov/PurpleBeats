import { DatabaseStorage } from '../server/storage.js';

const storage = new DatabaseStorage();

async function addCreativeCommonsMusic() {
  console.log("🎵 Adding Creative Commons music to PurpleBeats...");
  
  const ccMusicData = {
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
        id: "artist-ccmixter",
        name: "ccMixter Artists",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=150&h=150&fit=crop"
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
      // Kevin MacLeod - Electronic (8 songs)
      {
        id: "cc-song-stringed-disco",
        title: "Stringed Disco",
        artistId: "artist-kevin-macleod",
        albumId: "album-electronic-beats",
        duration: 142,
        genre: "Electronic",
        audioUrl: "/attached_assets/audio/placeholder-beat-1.mp3",
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
        audioUrl: "/attached_assets/audio/placeholder-beat-2.mp3",
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
        audioUrl: "/attached_assets/audio/placeholder-ambient-1.mp3",
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
        audioUrl: "/attached_assets/audio/placeholder-beat-3.mp3", 
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
        audioUrl: "/attached_assets/audio/placeholder-beat-4.mp3",
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
        audioUrl: "/attached_assets/audio/placeholder-ambient-2.mp3",
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
        audioUrl: "/attached_assets/audio/placeholder-beat-5.mp3",
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
        audioUrl: "/attached_assets/audio/placeholder-ambient-3.mp3",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
        attribution: "Music: Pixel Peeker Polka by Kevin MacLeod (incompetech.com) | Licensed under Creative Commons: By Attribution 4.0"
      }
    ]
  };

  try {
    // Add artists
    console.log("👨‍🎤 Adding artists...");
    for (const artist of ccMusicData.artists) {
      try {
        await storage.createArtist(artist);
        console.log(`✓ Added artist: ${artist.name}`);
      } catch (error) {
        console.log(`⚠️ Artist ${artist.name} might already exist, skipping...`);
      }
    }

    // Add albums  
    console.log("💿 Adding albums...");
    for (const album of ccMusicData.albums) {
      try {
        await storage.createAlbum(album);
        console.log(`✓ Added album: ${album.title}`);
      } catch (error) {
        console.log(`⚠️ Album ${album.title} might already exist, skipping...`);
      }
    }

    // Add songs
    console.log("🎵 Adding songs...");
    for (const song of ccMusicData.songs) {
      try {
        await storage.createSong(song);
        console.log(`✓ Added song: ${song.title}`);
      } catch (error) {
        console.log(`⚠️ Song ${song.title} might already exist, skipping...`);
      }
    }

    console.log("✅ Creative Commons music setup complete!");
    console.log(`📊 Total: ${ccMusicData.artists.length} artists, ${ccMusicData.albums.length} albums, ${ccMusicData.songs.length} songs`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding CC music:", error);
    process.exit(1);
  }
}

addCreativeCommonsMusic();