import { 
  type Artist, type Album, type Song, type Playlist, type PlaylistSong, type LikedSong, type Membership, type PiPayment, type Profile,
  type InsertArtist, type InsertAlbum, type InsertSong, type InsertPlaylist, type InsertPlaylistSong, type InsertLikedSong, type InsertMembership, type InsertPiPayment, type InsertProfile,
  type SongWithDetails, type AlbumWithDetails, type PlaylistWithDetails, type PlaylistWithAmbient,
  type AmbientMusicSetting, type InsertAmbientMusicSetting,
  artists, albums, songs, playlists, playlistSongs, likedSongs, memberships, piPayments, ambientMusicSettings, profiles
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, ilike, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Artists
  getArtists(): Promise<Artist[]>;
  getArtist(id: string): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;

  // Albums
  getAlbums(): Promise<Album[]>;
  getAlbum(id: string): Promise<Album | undefined>;
  getAlbumsByArtist(artistId: string): Promise<Album[]>;
  createAlbum(album: InsertAlbum): Promise<Album>;

  // Songs
  getSongs(): Promise<Song[]>;
  getSong(id: string): Promise<Song | undefined>;
  getSongsByAlbum(albumId: string): Promise<Song[]>;
  getSongsByArtist(artistId: string): Promise<Song[]>;
  searchSongs(query: string): Promise<SongWithDetails[]>;
  getRecentlyPlayed(): Promise<SongWithDetails[]>;
  getTrendingSongs(): Promise<SongWithDetails[]>;
  createSong(song: InsertSong): Promise<Song>;
  incrementPlayCount(songId: string): Promise<void>;

  // Playlists
  getPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getUserPlaylists(userId: string): Promise<Playlist[]>;
  getPlaylistWithSongs(id: string): Promise<PlaylistWithDetails | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  addSongToPlaylist(data: InsertPlaylistSong): Promise<PlaylistSong>;
  removeSongFromPlaylist(playlistId: string, songId: string): Promise<void>;

  // Liked Songs
  getLikedSongs(): Promise<SongWithDetails[]>;
  likeSong(data: InsertLikedSong): Promise<LikedSong>;
  unlikeSong(songId: string): Promise<void>;
  isSongLiked(songId: string): Promise<boolean>;

  // User Profile
  getUserProfile(userId: string): Promise<Profile | undefined>;
  updateUserProfile(userId: string, data: { name?: string; nickname?: string; imageUrl?: string }): Promise<Profile | undefined>;
  createUserProfile(profile: InsertProfile): Promise<Profile>;

  // Memberships
  getMembership(userId: string): Promise<Membership | undefined>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  updateMembership(userId: string, updates: Partial<Membership>): Promise<Membership | undefined>;
  
  // Pi Payments
  createPiPayment(payment: InsertPiPayment): Promise<PiPayment>;
  getPiPayment(paymentId: string): Promise<PiPayment | undefined>;
  updatePiPayment(paymentId: string, updates: Partial<PiPayment>): Promise<PiPayment | undefined>;
  getPiPaymentsByUser(userId: string): Promise<PiPayment[]>;
  
  // Ambient Music
  generateAmbientForPlaylist(playlistId: string): Promise<AmbientMusicSetting>;
  getAmbientSetting(playlistId: string): Promise<AmbientMusicSetting | undefined>;
  updateAmbientSetting(settingId: string, updates: Partial<AmbientMusicSetting>): Promise<AmbientMusicSetting | undefined>;
}

export class MemStorage implements IStorage {
  private artists: Map<string, Artist> = new Map();
  private albums: Map<string, Album> = new Map();
  private songs: Map<string, Song> = new Map();
  private playlists: Map<string, Playlist> = new Map();
  private playlistSongs: Map<string, PlaylistSong> = new Map();
  private likedSongs: Map<string, LikedSong> = new Map();
  private memberships: Map<string, Membership> = new Map();
  private piPayments: Map<string, PiPayment> = new Map();
  private ambientSettings: Map<string, AmbientMusicSetting> = new Map();

  constructor() {
    this.seedData();
  }


  private seedData() {
    // Create 80s artists
    const artist1: Artist = {
      id: "artist-1",
      name: "Synth Masters",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Legendary 80s synthpop artists behind classics like Take On Me",
      createdAt: new Date(),
    };

    const artist2: Artist = {
      id: "artist-2",
      name: "New Wave Kings",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "New wave pioneers who defined the sound of the 80s",
      createdAt: new Date(),
    };

    const artist3: Artist = {
      id: "artist-3",
      name: "Rock Anthems",
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Classic rock legends behind 80s power anthems",
      createdAt: new Date(),
    };

    const artist4: Artist = {
      id: "artist-4",
      name: "Pop Icons",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "80s pop superstars who dominated the charts",
      createdAt: new Date(),
    };

    const artist5: Artist = {
      id: "artist-5",
      name: "Dance Floor",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "80s dance and disco legends who filled the dance floors",
      createdAt: new Date(),
    };

    const artist6: Artist = {
      id: "artist-6",
      name: "Electronic Dreams",
      imageUrl: "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Electronic pioneers who shaped the 80s sound",
      createdAt: new Date(),
    };

    const artist7: Artist = {
      id: "artist-7",
      name: "Jazz Fusion Squad",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Contemporary jazz fusion with urban influences",
      createdAt: new Date(),
    };

    const artist8: Artist = {
      id: "artist-8",
      name: "Acoustic Dreams",
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Folk acoustic duo with heartfelt storytelling",
      createdAt: new Date(),
    };

    // New artists for new music collection
    const artist9: Artist = {
      id: "artist-9", 
      name: "Dylan Sitts",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Contemporary hip-hop artist with energetic beats",
      createdAt: new Date(),
    };

    const artist10: Artist = {
      id: "artist-10",
      name: "Nbhd Nick", 
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Hip-hop producer creating smooth instrumental beats",
      createdAt: new Date(),
    };

    const artist11: Artist = {
      id: "artist-11",
      name: "Speedy The Spider",
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300", 
      bio: "Alternative rock band with distinctive sound",
      createdAt: new Date(),
    };

    const artist12: Artist = {
      id: "artist-12",
      name: "Mia Lailani",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Pop artist with ethereal vocals and dreamy melodies",
      createdAt: new Date(),
    };

    const artist13: Artist = {
      id: "artist-13", 
      name: "John Runefelt",
      imageUrl: "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Electronic dance music producer with high-energy tracks",
      createdAt: new Date(),
    };

    const artist14: Artist = {
      id: "artist-14",
      name: "Maybe",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Chill ambient artist creating relaxing soundscapes",
      createdAt: new Date(),
    };

    const artist15: Artist = {
      id: "artist-15",
      name: "Scientific",
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Electronic music innovator with scientific precision",
      createdAt: new Date(),
    };

    const artist16: Artist = {
      id: "artist-16", 
      name: "Loving Caliber",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Pop dance duo creating infectious rhythms", 
      createdAt: new Date(),
    };

    const artist17: Artist = {
      id: "artist-17",
      name: "Bankston",
      imageUrl: "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Pop electronic artist with catchy hooks",
      createdAt: new Date(),
    };

    const artist18: Artist = {
      id: "artist-18",
      name: "Daniel Fridell", 
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Funk soul artist with groovy retro vibes",
      createdAt: new Date(),
    };

    const artist19: Artist = {
      id: "artist-19",
      name: "PW",
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Feel-good pop producer creating uplifting tracks",
      createdAt: new Date(),
    };

    this.artists.set(artist1.id, artist1);
    this.artists.set(artist2.id, artist2);
    this.artists.set(artist3.id, artist3);
    this.artists.set(artist4.id, artist4);
    this.artists.set(artist5.id, artist5);
    this.artists.set(artist6.id, artist6);
    this.artists.set(artist7.id, artist7);
    this.artists.set(artist8.id, artist8);
    this.artists.set(artist9.id, artist9);
    this.artists.set(artist10.id, artist10);
    this.artists.set(artist11.id, artist11);
    this.artists.set(artist12.id, artist12);
    this.artists.set(artist13.id, artist13);
    this.artists.set(artist14.id, artist14);
    this.artists.set(artist15.id, artist15);
    this.artists.set(artist16.id, artist16);
    this.artists.set(artist17.id, artist17);
    this.artists.set(artist18.id, artist18);
    this.artists.set(artist19.id, artist19);

    // Create 80s albums
    const album1: Album = {
      id: "album-1",
      title: "80s Synth Classics",
      artistId: artist1.id,
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      releaseDate: new Date("1983-01-15"),
      genre: "Synthpop",
      createdAt: new Date(),
    };

    const album2: Album = {
      id: "album-2",
      title: "New Wave Hits",
      artistId: artist2.id,
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      releaseDate: new Date("1984-02-20"),
      genre: "New Wave",
      createdAt: new Date(),
    };

    const album3: Album = {
      id: "album-3",
      title: "Indie Dreams",
      artistId: artist3.id,
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      releaseDate: new Date("2024-03-10"),
      genre: "Indie Rock",
      createdAt: new Date(),
    };

    const album4: Album = {
      id: "album-4",
      title: "Cosmic Journeys",
      artistId: artist4.id,
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      releaseDate: new Date("2024-04-05"),
      genre: "Ambient",
      createdAt: new Date(),
    };

    const album5: Album = {
      id: "album-5",
      title: "Sunshine Melodies",
      artistId: artist5.id,
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      releaseDate: new Date("2024-05-20"),
      genre: "Pop",
      createdAt: new Date(),
    };

    const album6: Album = {
      id: "album-6",
      title: "Purple Horizons",
      artistId: artist6.id,
      imageUrl: "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      releaseDate: new Date("2024-06-15"),
      genre: "Progressive Rock",
      createdAt: new Date(),
    };

    const album7: Album = {
      id: "album-7",
      title: "Urban Jazz",
      artistId: artist7.id,
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      releaseDate: new Date("2024-07-12"),
      genre: "Jazz Fusion",
      createdAt: new Date(),
    };

    const album8: Album = {
      id: "album-8",
      title: "Folk Stories",
      artistId: artist8.id,
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      releaseDate: new Date("2024-08-08"),
      genre: "Folk",
      createdAt: new Date(),
    };

    // New albums for new music collection  
    const album9: Album = {
      id: "album-9",
      title: "Fourth Quarter",
      artistId: artist9.id,
      imageUrl: "/public-objects/generated_images/Fourth_Quarter_hip-hop_cover_5dea36a1.png",
      releaseDate: new Date("2024-09-01"),
      genre: "Hip-hop",
      createdAt: new Date(),
    };

    const album10: Album = {
      id: "album-10", 
      title: "Lock In Instrumentals",
      artistId: artist10.id,
      imageUrl: "/public-objects/generated_images/Lock_In_instrumental_cover_8f7c0b20.png",
      releaseDate: new Date("2024-09-02"),
      genre: "Hip-hop Instrumental",
      createdAt: new Date(),
    };

    const album11: Album = {
      id: "album-11",
      title: "Sand Reflections", 
      artistId: artist11.id,
      imageUrl: "/public-objects/generated_images/Head_in_Sand_rock_cover_a276f79a.png",
      releaseDate: new Date("2024-09-03"),
      genre: "Alternative Rock",
      createdAt: new Date(),
    };

    const album12: Album = {
      id: "album-12",
      title: "Never Know",
      artistId: artist12.id,
      imageUrl: "/public-objects/generated_images/You'll_Never_Know_pop_cover_ab9b25f6.png",
      releaseDate: new Date("2024-09-04"),
      genre: "Pop Instrumental",
      createdAt: new Date(),
    };

    const album13: Album = {
      id: "album-13",
      title: "Electronic Minutes",
      artistId: artist13.id,
      imageUrl: "/public-objects/generated_images/In_a_Minute_electronic_cover_31864d9a.png",
      releaseDate: new Date("2024-09-05"),
      genre: "Electronic Dance",
      createdAt: new Date(),
    };

    const album14: Album = {
      id: "album-14",
      title: "Poolside Sessions",
      artistId: artist14.id,
      imageUrl: "/public-objects/generated_images/Poolside_chill_cover_e3ed8e8b.png",
      releaseDate: new Date("2024-09-06"),
      genre: "Chill Ambient",
      createdAt: new Date(),
    };

    const album15: Album = {
      id: "album-15",
      title: "Flow Science",
      artistId: artist15.id,
      imageUrl: "/public-objects/generated_images/Let_It_Flow_scientific_cover_b61fe5da.png",
      releaseDate: new Date("2024-09-07"),
      genre: "Electronic",
      createdAt: new Date(),
    };

    const album16: Album = {
      id: "album-16",
      title: "Move Collection",
      artistId: artist16.id,
      imageUrl: "/public-objects/generated_images/Move_dance_pop_cover_95fe4ff8.png",
      releaseDate: new Date("2024-09-08"),
      genre: "Pop Dance",
      createdAt: new Date(),
    };

    const album17: Album = {
      id: "album-17",
      title: "Head Songs",
      artistId: artist17.id,
      imageUrl: "/public-objects/generated_images/Stuck_in_Head_electronic_cover_2f45e7c5.png",
      releaseDate: new Date("2024-09-09"),
      genre: "Pop Electronic",
      createdAt: new Date(),
    };

    const album18: Album = {
      id: "album-18",
      title: "Special Sauce",
      artistId: artist18.id,
      imageUrl: "/public-objects/generated_images/Special_Sauce_funk_cover_5e6a45c9.png",
      releaseDate: new Date("2024-09-10"),
      genre: "Funk Soul",
      createdAt: new Date(),
    };

    const album19: Album = {
      id: "album-19",
      title: "Feel Good Vibes",
      artistId: artist19.id,
      imageUrl: "/public-objects/generated_images/Feel_Good_pop_cover_7a778486.png",
      releaseDate: new Date("2024-09-11"),
      genre: "Feel-good Pop",
      createdAt: new Date(),
    };

    this.albums.set(album1.id, album1);
    this.albums.set(album2.id, album2);
    this.albums.set(album3.id, album3);
    this.albums.set(album4.id, album4);
    this.albums.set(album5.id, album5);
    this.albums.set(album6.id, album6);
    this.albums.set(album7.id, album7);
    this.albums.set(album8.id, album8);
    this.albums.set(album9.id, album9);
    this.albums.set(album10.id, album10);
    this.albums.set(album11.id, album11);
    this.albums.set(album12.id, album12);
    this.albums.set(album13.id, album13);
    this.albums.set(album14.id, album14);
    this.albums.set(album15.id, album15);
    this.albums.set(album16.id, album16);
    this.albums.set(album17.id, album17);
    this.albums.set(album18.id, album18);
    this.albums.set(album19.id, album19);

    // Create 30 iconic 80s hits
    const songs: Song[] = [
      // Synth Masters - 80s Synth Classics
      {
        id: "song-1",
        title: "The Only Way Out",
        artistId: artist6.id, // Electronic Dreams
        albumId: album6.id,
        duration: 180, // Estimate 3:00
        audioUrl: "/audio/electronic/the-only-way-out.mp3",
        imageUrl: album6.imageUrl,
        genre: "Electronic",
        playCount: 1500000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-2",
        title: "Deepstar",
        artistId: artist6.id, // Electronic Dreams
        albumId: album6.id,
        duration: 200, // 3:20
        audioUrl: "/audio/electronic/deepstar.mp3",
        imageUrl: album6.imageUrl,
        genre: "Electronic",
        playCount: 1200000,
        createdAt: new Date(),
        trackNumber: 2,
      },
      {
        id: "song-3",
        title: "One Step Away",
        artistId: artist6.id, // Electronic Dreams
        albumId: album6.id,
        duration: 180, // 3:00
        audioUrl: "/audio/electronic/one-step-away.mp3",
        imageUrl: album6.imageUrl,
        genre: "Electronic",
        playCount: 980000,
        createdAt: new Date(),
        trackNumber: 3,
      },
      {
        id: "song-4",
        title: "Symmetry",
        artistId: artist6.id, // Electronic Dreams
        albumId: album6.id,
        duration: 185, // 3:05
        audioUrl: "/audio/electronic/symmetry.mp3",
        imageUrl: album6.imageUrl,
        genre: "Electronic",
        playCount: 920000,
        createdAt: new Date(),
        trackNumber: 4,
      },
      {
        id: "song-5",
        title: "Champions of Freedom",
        artistId: artist1.id, // Synth Masters
        albumId: album1.id,
        duration: 195, // 3:15
        audioUrl: "/audio/synthpop/champions-of-freedom.mp3",
        imageUrl: album1.imageUrl,
        genre: "Synthpop",
        playCount: 1500000,
        createdAt: new Date(),
        trackNumber: 1,
      },

      // New Wave Kings - New Wave Hits
      {
        id: "song-6",
        title: "Deeplight",
        artistId: artist4.id, // Cosmic Dreams (ambient)
        albumId: album4.id,
        duration: 240, // 4:00
        audioUrl: "/audio/ambient/deeplight.mp3",
        imageUrl: album4.imageUrl,
        genre: "Ambient",
        playCount: 850000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-7",
        title: "Darkest of Demons",
        artistId: artist6.id, // Electronic Dreams
        albumId: album6.id,
        duration: 210, // 3:30
        audioUrl: "/audio/electronic/darkest-of-demons.mp3",
        imageUrl: album6.imageUrl,
        genre: "Electronic",
        playCount: 1100000,
        createdAt: new Date(),
        trackNumber: 5,
      },
      {
        id: "song-8",
        title: "Symmetry",
        artistId: artist6.id, // Electronic Dreams
        albumId: album6.id,
        duration: 185, // 3:05
        audioUrl: "/audio/electronic/symmetry.mp3",
        imageUrl: album6.imageUrl,
        genre: "Electronic",
        playCount: 920000,
        createdAt: new Date(),
        trackNumber: 6,
      },
      {
        id: "song-9",
        title: "Shadow of Mortus",
        artistId: artist4.id, // Cosmic Dreams (ambient)
        albumId: album4.id,
        duration: 220, // 3:40
        audioUrl: "/audio/ambient/shadow-of-mortus.mp3",
        imageUrl: album4.imageUrl,
        genre: "Ambient",
        playCount: 750000,
        createdAt: new Date(),
        trackNumber: 2,
      },
      {
        id: "song-10",
        title: "Under Open Skies and Endless Stars",
        artistId: artist4.id, // Cosmic Dreams (ambient)
        albumId: album4.id,
        duration: 280, // 4:40
        audioUrl: "/audio/ambient/under-open-skies.mp3",
        imageUrl: album4.imageUrl,
        genre: "Ambient",
        playCount: 680000,
        createdAt: new Date(),
        trackNumber: 3,
      },
      {
        id: "song-11",
        title: "The Firstborn",
        artistId: artist1.id, // Synth Masters
        albumId: album1.id,
        duration: 205, // 3:25
        audioUrl: "/audio/synthpop/the-firstborn.mp3",
        imageUrl: album1.imageUrl,
        genre: "Synthpop",
        playCount: 1320000,
        createdAt: new Date(),
        trackNumber: 2,
      },
      {
        id: "song-8",
        title: "Urban Legends",
        artistId: artist2.id,
        albumId: album2.id,
        duration: 198, // 3:18
        audioUrl: "/audio/electronic/darkest-of-demons.mp3",
        imageUrl: album2.imageUrl,
        genre: "Hip Hop",
        playCount: 1420000,
        createdAt: new Date(),
        trackNumber: 1,
      },

      // The Violet Sounds - Indie Dreams Album
      {
        id: "song-9",
        title: "Golden Hour",
        artistId: artist3.id,
        albumId: album3.id,
        duration: 205, // 3:25
        audioUrl: "/audio/ambient/deeplight.mp3",
        imageUrl: album3.imageUrl,
        genre: "Indie Rock",
        playCount: 1750000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-10",
        title: "Purple Haze Dreams",
        artistId: artist3.id,
        albumId: album3.id,
        duration: 312, // 5:12
        audioUrl: "/audio/ambient/shadow-of-mortus.mp3",
        imageUrl: album3.imageUrl,
        genre: "Indie Rock",
        playCount: 890000,
        createdAt: new Date(),
        trackNumber: 2,
      },
      {
        id: "song-11",
        title: "Dreamy Skies",
        artistId: artist3.id,
        albumId: album3.id,
        duration: 275, // 4:35
        audioUrl: "/audio/ambient/under-open-skies.mp3",
        imageUrl: album3.imageUrl,
        genre: "Indie Rock",
        playCount: 945000,
        createdAt: new Date(),
        trackNumber: 3,
      },
      {
        id: "song-12",
        title: "Violet Waves",
        artistId: artist3.id,
        albumId: album3.id,
        duration: 188, // 3:08
        audioUrl: "/audio/synthpop/champions-of-freedom.mp3",
        imageUrl: album3.imageUrl,
        genre: "Indie Rock",
        playCount: 780000,
        createdAt: new Date(),
        trackNumber: 4,
      },

      // Lunar Echo - Cosmic Journeys Album
      {
        id: "song-13",
        title: "Stellar Drift",
        artistId: artist4.id,
        albumId: album4.id,
        duration: 425, // 7:05
        audioUrl: "/audio/synthpop/the-firstborn.mp3",
        imageUrl: album4.imageUrl,
        genre: "Ambient",
        playCount: 680000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-14",
        title: "Moon Phases",
        artistId: artist4.id,
        albumId: album4.id,
        duration: 358, // 5:58
        audioUrl: "/audio/electronic/deepstar.mp3",
        imageUrl: album4.imageUrl,
        genre: "Ambient",
        playCount: 520000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-15",
        title: "Cosmic Meditation",
        artistId: artist4.id,
        albumId: album4.id,
        duration: 492, // 8:12
        audioUrl: "/audio/electronic/one-step-away.mp3",
        imageUrl: album4.imageUrl,
        genre: "Ambient",
        playCount: 380000,
        createdAt: new Date(),
        trackNumber: 1,
      },

      // Golden Rays - Sunshine Melodies Album
      {
        id: "song-16",
        title: "Sunny Days",
        artistId: artist5.id,
        albumId: album5.id,
        duration: 212, // 3:32
        audioUrl: "/audio/electronic/symmetry.mp3",
        imageUrl: album5.imageUrl,
        genre: "Pop",
        playCount: 2350000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-17",
        title: "Golden Light",
        artistId: artist5.id,
        albumId: album5.id,
        duration: 195, // 3:15
        audioUrl: "/audio/electronic/the-only-way-out.mp3",
        imageUrl: album5.imageUrl,
        genre: "Pop",
        playCount: 2150000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-18",
        title: "Bright Tomorrow",
        artistId: artist5.id,
        albumId: album5.id,
        duration: 228, // 3:48
        audioUrl: "/audio/ambient/deeplight.mp3",
        imageUrl: album5.imageUrl,
        genre: "Pop",
        playCount: 1980000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-19",
        title: "Sunshine Serenade",
        artistId: artist5.id,
        albumId: album5.id,
        duration: 245, // 4:05
        audioUrl: "/audio/ambient/shadow-of-mortus.mp3",
        imageUrl: album5.imageUrl,
        genre: "Pop",
        playCount: 1820000,
        createdAt: new Date(),
        trackNumber: 1,
      },

      // Deep Purple Collective - Purple Horizons Album
      {
        id: "song-20",
        title: "Deep Waters",
        artistId: artist6.id,
        albumId: album6.id,
        duration: 385, // 6:25
        audioUrl: "/audio/ambient/under-open-skies.mp3",
        imageUrl: album6.imageUrl,
        genre: "Progressive Rock",
        playCount: 1125000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-21",
        title: "Purple Storm",
        artistId: artist6.id,
        albumId: album6.id,
        duration: 412, // 6:52
        audioUrl: "/audio/synthpop/champions-of-freedom.mp3",
        imageUrl: album6.imageUrl,
        genre: "Progressive Rock",
        playCount: 995000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-22",
        title: "Horizon's Edge",
        artistId: artist6.id,
        albumId: album6.id,
        duration: 298, // 4:58
        audioUrl: "/audio/synthpop/the-firstborn.mp3",
        imageUrl: album6.imageUrl,
        genre: "Progressive Rock",
        playCount: 875000,
        createdAt: new Date(),
        trackNumber: 1,
      },

      // Jazz Fusion Squad - Urban Jazz Album
      {
        id: "song-23",
        title: "Smooth Operator",
        artistId: artist7.id,
        albumId: album7.id,
        duration: 325, // 5:25
        audioUrl: "/audio/electronic/darkest-of-demons.mp3",
        imageUrl: album7.imageUrl,
        genre: "Jazz Fusion",
        playCount: 680000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-24",
        title: "City Groove",
        artistId: artist7.id,
        albumId: album7.id,
        duration: 298, // 4:58
        audioUrl: "/audio/electronic/deepstar.mp3",
        imageUrl: album7.imageUrl,
        genre: "Jazz Fusion",
        playCount: 590000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-25",
        title: "Urban Saxophone",
        artistId: artist7.id,
        albumId: album7.id,
        duration: 342, // 5:42
        audioUrl: "/audio/electronic/one-step-away.mp3",
        imageUrl: album7.imageUrl,
        genre: "Jazz Fusion",
        playCount: 445000,
        createdAt: new Date(),
        trackNumber: 1,
      },

      // Acoustic Dreams - Folk Stories Album
      {
        id: "song-26",
        title: "Mountain Song",
        artistId: artist8.id,
        albumId: album8.id,
        duration: 275, // 4:35
        audioUrl: "/audio/electronic/symmetry.mp3",
        imageUrl: album8.imageUrl,
        genre: "Folk",
        playCount: 720000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-27",
        title: "Campfire Dreams",
        artistId: artist8.id,
        albumId: album8.id,
        duration: 212, // 3:32
        audioUrl: "/audio/electronic/the-only-way-out.mp3",
        imageUrl: album8.imageUrl,
        genre: "Folk",
        playCount: 650000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-28",
        title: "Acoustic Journey",
        artistId: artist8.id,
        albumId: album8.id,
        duration: 298, // 4:58
        audioUrl: "/audio/ambient/deeplight.mp3",
        imageUrl: album8.imageUrl,
        genre: "Folk",
        playCount: 580000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-29",
        title: "Folk Tales",
        artistId: artist8.id,
        albumId: album8.id,
        duration: 255, // 4:15
        audioUrl: "/audio/ambient/shadow-of-mortus.mp3",
        imageUrl: album8.imageUrl,
        genre: "Folk",
        playCount: 495000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-30",
        title: "Storyteller's Song",
        artistId: artist8.id,
        albumId: album8.id,
        duration: 335, // 5:35
        audioUrl: "/audio/ambient/under-open-skies.mp3",
        imageUrl: album8.imageUrl,
        genre: "Folk",
        playCount: 425000,
        createdAt: new Date(),
        trackNumber: 1,
      },

      // New music collection - Real MP3 files
      {
        id: "song-fourth-quarter",
        title: "Fourth Quarter",
        artistId: artist9.id,
        albumId: album9.id,
        duration: 180,
        audioUrl: "/attached_assets/ES_Fourth Quarter - Dylan Sitts_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Fourth_Quarter_hip-hop_cover_5dea36a1.png",
        genre: "Hip-hop",
        playCount: 15000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-lock-in",
        title: "Lock In (Instrumental Version)",
        artistId: artist10.id,
        albumId: album10.id,
        duration: 195,
        audioUrl: "/attached_assets/ES_Lock In (Instrumental Version) - Nbhd Nick_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Lock_In_instrumental_cover_8f7c0b20.png",
        genre: "Hip-hop Instrumental",
        playCount: 12000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-keeping-head-sand",
        title: "Keeping My Head in the Sand",
        artistId: artist11.id,
        albumId: album11.id,
        duration: 205,
        audioUrl: "/attached_assets/ES_Keeping My Head in the Sand - Speedy The Spider_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Head_in_Sand_rock_cover_a276f79a.png",
        genre: "Alternative Rock",
        playCount: 8500,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-never-know",
        title: "You'll Never Know (Instrumental Version)",
        artistId: artist12.id,
        albumId: album12.id,
        duration: 220,
        audioUrl: "/attached_assets/ES_You'll Never Know (Instrumental Version) - Mia Lailani_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/You'll_Never_Know_pop_cover_ab9b25f6.png",
        genre: "Pop Instrumental",
        playCount: 9500,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-in-minute",
        title: "In a Minute",
        artistId: artist13.id,
        albumId: album13.id,
        duration: 185,
        audioUrl: "/attached_assets/ES_In a Minute - John Runefelt_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/In_a_Minute_electronic_cover_31864d9a.png",
        genre: "Electronic Dance",
        playCount: 11000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-poolside",
        title: "Poolside (Instrumental Version)",
        artistId: artist14.id,
        albumId: album14.id,
        duration: 200,
        audioUrl: "/attached_assets/ES_Poolside (Instrumental Version) - Maybe_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Poolside_chill_cover_e3ed8e8b.png",
        genre: "Chill Ambient",
        playCount: 7500,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-let-flow",
        title: "Let It Flow",
        artistId: artist15.id,
        albumId: album15.id,
        duration: 210,
        audioUrl: "/attached_assets/ES_Let It Flow - Scientific_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Let_It_Flow_scientific_cover_b61fe5da.png",
        genre: "Electronic",
        playCount: 13500,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-move",
        title: "Move (Instrumental Version)",
        artistId: artist16.id,
        albumId: album16.id,
        duration: 175,
        audioUrl: "/attached_assets/ES_Move (Instrumental Version) - Loving Caliber_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Move_dance_pop_cover_95fe4ff8.png",
        genre: "Pop Dance",
        playCount: 16000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-stuck-head",
        title: "Stuck in My Head (Instrumental Version)",
        artistId: artist17.id,
        albumId: album17.id,
        duration: 190,
        audioUrl: "/attached_assets/ES_Stuck in My Head (Instrumental Version) - Bankston_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Stuck_in_Head_electronic_cover_2f45e7c5.png",
        genre: "Pop Electronic",
        playCount: 14000,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-special-sauce",
        title: "Special Sauce",
        artistId: artist18.id,
        albumId: album18.id,
        duration: 225,
        audioUrl: "/attached_assets/ES_Special Sauce - Daniel Fridell_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Special_Sauce_funk_cover_5e6a45c9.png",
        genre: "Funk Soul",
        playCount: 6500,
        createdAt: new Date(),
        trackNumber: 1,
      },
      {
        id: "song-feel-good",
        title: "Feel Good (Instrumental Version)",
        artistId: artist19.id,
        albumId: album19.id,
        duration: 195,
        audioUrl: "/attached_assets/ES_Feel Good (Instrumental Version) - PW_1756913296915.mp3",
        imageUrl: "/public-objects/generated_images/Feel_Good_pop_cover_7a778486.png",
        genre: "Feel-good Pop",
        playCount: 18000,
        createdAt: new Date(),
        trackNumber: 1,
      },
    ];

    songs.forEach(song => this.songs.set(song.id, song));

    // Create sample playlists
    const playlist1: Playlist = {
      id: "playlist-1",
      name: "Daily Mix 1",
      description: "Your daily dose of favorites",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      isPublic: true,
      songCount: 8,
      createdAt: new Date(),
    };

    const playlist2: Playlist = {
      id: "playlist-2",
      name: "Discover Weekly",
      description: "Fresh finds for you",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      isPublic: true,
      songCount: 6,
      createdAt: new Date(),
    };

    const playlist3: Playlist = {
      id: "playlist-3",
      name: "Purple Vibes",
      description: "All things purple and gold",
      imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      isPublic: true,
      songCount: 10,
      createdAt: new Date(),
    };

    const playlist4: Playlist = {
      id: "playlist-4",
      name: "Chill Ambient",
      description: "Relaxing cosmic soundscapes",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      isPublic: true,
      songCount: 5,
      createdAt: new Date(),
    };

    const playlist5: Playlist = {
      id: "playlist-5",
      name: "Top Hits",
      description: "Most popular songs right now",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      isPublic: true,
      songCount: 7,
      createdAt: new Date(),
    };

    this.playlists.set(playlist1.id, playlist1);
    this.playlists.set(playlist2.id, playlist2);
    this.playlists.set(playlist3.id, playlist3);
    this.playlists.set(playlist4.id, playlist4);
    this.playlists.set(playlist5.id, playlist5);

    // Add songs to playlists
    const playlistSongs: PlaylistSong[] = [
      // Daily Mix 1 - Popular diverse tracks
      { id: "ps-1", playlistId: playlist1.id, songId: "song-1", position: 1, addedAt: new Date() },
      { id: "ps-2", playlistId: playlist1.id, songId: "song-5", position: 2, addedAt: new Date() },
      { id: "ps-3", playlistId: playlist1.id, songId: "song-9", position: 3, addedAt: new Date() },
      { id: "ps-4", playlistId: playlist1.id, songId: "song-16", position: 4, addedAt: new Date() },
      { id: "ps-5", playlistId: playlist1.id, songId: "song-17", position: 5, addedAt: new Date() },
      { id: "ps-6", playlistId: playlist1.id, songId: "song-20", position: 6, addedAt: new Date() },
      { id: "ps-7", playlistId: playlist1.id, songId: "song-6", position: 7, addedAt: new Date() },
      { id: "ps-8", playlistId: playlist1.id, songId: "song-18", position: 8, addedAt: new Date() },

      // Discover Weekly - Fresh new tracks
      { id: "ps-9", playlistId: playlist2.id, songId: "song-13", position: 1, addedAt: new Date() },
      { id: "ps-10", playlistId: playlist2.id, songId: "song-23", position: 2, addedAt: new Date() },
      { id: "ps-11", playlistId: playlist2.id, songId: "song-26", position: 3, addedAt: new Date() },
      { id: "ps-12", playlistId: playlist2.id, songId: "song-14", position: 4, addedAt: new Date() },
      { id: "ps-13", playlistId: playlist2.id, songId: "song-28", position: 5, addedAt: new Date() },
      { id: "ps-14", playlistId: playlist2.id, songId: "song-25", position: 6, addedAt: new Date() },

      // Purple Vibes - Purple/violet themed songs
      { id: "ps-15", playlistId: playlist3.id, songId: "song-7", position: 1, addedAt: new Date() },
      { id: "ps-16", playlistId: playlist3.id, songId: "song-10", position: 2, addedAt: new Date() },
      { id: "ps-17", playlistId: playlist3.id, songId: "song-12", position: 3, addedAt: new Date() },
      { id: "ps-18", playlistId: playlist3.id, songId: "song-21", position: 4, addedAt: new Date() },
      { id: "ps-19", playlistId: playlist3.id, songId: "song-22", position: 5, addedAt: new Date() },
      { id: "ps-20", playlistId: playlist3.id, songId: "song-11", position: 6, addedAt: new Date() },
      { id: "ps-21", playlistId: playlist3.id, songId: "song-9", position: 7, addedAt: new Date() },
      { id: "ps-22", playlistId: playlist3.id, songId: "song-8", position: 8, addedAt: new Date() },
      { id: "ps-23", playlistId: playlist3.id, songId: "song-6", position: 9, addedAt: new Date() },
      { id: "ps-24", playlistId: playlist3.id, songId: "song-19", position: 10, addedAt: new Date() },

      // Chill Ambient - Relaxing tracks
      { id: "ps-25", playlistId: playlist4.id, songId: "song-13", position: 1, addedAt: new Date() },
      { id: "ps-26", playlistId: playlist4.id, songId: "song-14", position: 2, addedAt: new Date() },
      { id: "ps-27", playlistId: playlist4.id, songId: "song-15", position: 3, addedAt: new Date() },
      { id: "ps-28", playlistId: playlist4.id, songId: "song-27", position: 4, addedAt: new Date() },
      { id: "ps-29", playlistId: playlist4.id, songId: "song-30", position: 5, addedAt: new Date() },

      // Top Hits - Most popular songs
      { id: "ps-30", playlistId: playlist5.id, songId: "song-16", position: 1, addedAt: new Date() }, // 2.35M plays
      { id: "ps-31", playlistId: playlist5.id, songId: "song-17", position: 2, addedAt: new Date() }, // 2.15M plays
      { id: "ps-32", playlistId: playlist5.id, songId: "song-5", position: 3, addedAt: new Date() }, // 2.1M plays
      { id: "ps-33", playlistId: playlist5.id, songId: "song-18", position: 4, addedAt: new Date() }, // 1.98M plays
      { id: "ps-34", playlistId: playlist5.id, songId: "song-6", position: 5, addedAt: new Date() }, // 1.85M plays
      { id: "ps-35", playlistId: playlist5.id, songId: "song-19", position: 6, addedAt: new Date() }, // 1.82M plays
      { id: "ps-36", playlistId: playlist5.id, songId: "song-9", position: 7, addedAt: new Date() }, // 1.75M plays
    ];

    playlistSongs.forEach(ps => this.playlistSongs.set(ps.id, ps));

    // Create sample liked songs for library
    const likedSongs: LikedSong[] = [
      { id: "liked-1", songId: "song-1", likedAt: new Date() }, // The Only Way Out
      { id: "liked-2", songId: "song-5", likedAt: new Date() }, // Champions of Freedom
      { id: "liked-3", songId: "song-9", likedAt: new Date() }, // Golden Hour
      { id: "liked-4", songId: "song-16", likedAt: new Date() }, // Sunny Days
      { id: "liked-5", songId: "song-21", likedAt: new Date() }, // Purple Storm
      { id: "liked-6", songId: "song-3", likedAt: new Date() }, // One Step Away
      { id: "liked-7", songId: "song-7", likedAt: new Date() }, // Shadow of Mortus
    ];

    likedSongs.forEach(ls => this.likedSongs.set(ls.id, ls));
  }

  // Artists
  async getArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values());
  }

  async getArtist(id: string): Promise<Artist | undefined> {
    return this.artists.get(id);
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const id = randomUUID();
    const artist: Artist = { ...insertArtist, id, createdAt: new Date() };
    this.artists.set(id, artist);
    return artist;
  }

  // Albums
  async getAlbums(): Promise<Album[]> {
    return Array.from(this.albums.values());
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    return this.albums.get(id);
  }

  async getAlbumsByArtist(artistId: string): Promise<Album[]> {
    return Array.from(this.albums.values()).filter(album => album.artistId === artistId);
  }

  async createAlbum(insertAlbum: InsertAlbum): Promise<Album> {
    const id = randomUUID();
    const album: Album = { ...insertAlbum, id, createdAt: new Date() };
    this.albums.set(id, album);
    return album;
  }

  // Songs
  async getSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async getSong(id: string): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getSongsByAlbum(albumId: string): Promise<Song[]> {
    return Array.from(this.songs.values()).filter(song => song.albumId === albumId);
  }

  async getSongsByArtist(artistId: string): Promise<Song[]> {
    return Array.from(this.songs.values()).filter(song => song.artistId === artistId);
  }

  async searchSongs(query: string): Promise<SongWithDetails[]> {
    const songs = Array.from(this.songs.values()).filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase())
    );
    
    return Promise.all(songs.map(async song => {
      const artist = await this.getArtist(song.artistId);
      const album = song.albumId ? await this.getAlbum(song.albumId) : undefined;
      const isLiked = await this.isSongLiked(song.id);
      
      return {
        ...song,
        artist: artist!,
        album,
        isLiked,
      };
    }));
  }

  async getRecentlyPlayed(): Promise<SongWithDetails[]> {
    const songs = Array.from(this.songs.values()).slice(0, 5);
    
    return Promise.all(songs.map(async song => {
      const artist = await this.getArtist(song.artistId);
      const album = song.albumId ? await this.getAlbum(song.albumId) : undefined;
      const isLiked = await this.isSongLiked(song.id);
      
      return {
        ...song,
        artist: artist!,
        album,
        isLiked,
      };
    }));
  }

  async getTrendingSongs(): Promise<SongWithDetails[]> {
    const songs = Array.from(this.songs.values())
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 10);
    
    return Promise.all(songs.map(async song => {
      const artist = await this.getArtist(song.artistId);
      const album = song.albumId ? await this.getAlbum(song.albumId) : undefined;
      const isLiked = await this.isSongLiked(song.id);
      
      return {
        ...song,
        artist: artist!,
        album,
        isLiked,
      };
    }));
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const id = randomUUID();
    const song: Song = { ...insertSong, id, playCount: 0, createdAt: new Date() };
    this.songs.set(id, song);
    return song;
  }

  async incrementPlayCount(songId: string): Promise<void> {
    const song = this.songs.get(songId);
    if (song) {
      const updatedSong = { ...song, playCount: (song.playCount || 0) + 1 };
      this.songs.set(songId, updatedSong);
    }
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const userPlaylists = Array.from(this.playlists.values()).filter(playlist => playlist.createdBy === userId);
    
    // Update song counts for accuracy
    const updatedPlaylists = userPlaylists.map(playlist => {
      const playlistSongs = Array.from(this.playlistSongs.values())
        .filter(ps => ps.playlistId === playlist.id);
      const actualCount = playlistSongs.length;
      
      if (playlist.songCount !== actualCount) {
        const updatedPlaylist = { ...playlist, songCount: actualCount };
        this.playlists.set(playlist.id, updatedPlaylist);
        return updatedPlaylist;
      }
      
      return playlist;
    });
    
    return updatedPlaylists;
  }

  async getPlaylistWithSongs(id: string): Promise<PlaylistWithDetails | undefined> {
    const playlist = await this.getPlaylist(id);
    if (!playlist) return undefined;

    const playlistSongs = Array.from(this.playlistSongs.values())
      .filter(ps => ps.playlistId === id)
      .sort((a, b) => a.position - b.position);

    const songs = await Promise.all(playlistSongs.map(async ps => {
      const song = await this.getSong(ps.songId);
      if (!song) return null;
      
      const artist = await this.getArtist(song.artistId);
      const album = song.albumId ? await this.getAlbum(song.albumId) : undefined;
      const isLiked = await this.isSongLiked(song.id);
      
      return {
        ...song,
        artist: artist!,
        album,
        isLiked,
      };
    }));

    const validSongs = songs.filter(Boolean) as SongWithDetails[];
    
    // Update the playlist song count if it's incorrect
    if (playlist.songCount !== validSongs.length) {
      const updatedPlaylist = { ...playlist, songCount: validSongs.length };
      this.playlists.set(id, updatedPlaylist);
    }

    return {
      ...playlist,
      songCount: validSongs.length,
      songs: validSongs,
    };
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = randomUUID();
    const playlist: Playlist = { ...insertPlaylist, id, songCount: 0, createdAt: new Date() };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async addSongToPlaylist(data: InsertPlaylistSong): Promise<PlaylistSong> {
    const id = randomUUID();
    const playlistSong: PlaylistSong = { ...data, id, addedAt: new Date() };
    this.playlistSongs.set(id, playlistSong);

    // Update playlist song count
    const playlist = this.playlists.get(data.playlistId);
    if (playlist) {
      const updatedPlaylist = { ...playlist, songCount: playlist.songCount + 1 };
      this.playlists.set(data.playlistId, updatedPlaylist);
    }

    return playlistSong;
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    const playlistSong = Array.from(this.playlistSongs.values())
      .find(ps => ps.playlistId === playlistId && ps.songId === songId);
    
    if (playlistSong) {
      this.playlistSongs.delete(playlistSong.id);

      // Update playlist song count
      const playlist = this.playlists.get(playlistId);
      if (playlist) {
        const updatedPlaylist = { ...playlist, songCount: Math.max(0, playlist.songCount - 1) };
        this.playlists.set(playlistId, updatedPlaylist);
      }
    }
  }

  // Liked Songs
  async getLikedSongs(): Promise<SongWithDetails[]> {
    const likedSongs = Array.from(this.likedSongs.values());
    
    return Promise.all(likedSongs.map(async liked => {
      const song = await this.getSong(liked.songId);
      if (!song) return null;
      
      const artist = await this.getArtist(song.artistId);
      const album = song.albumId ? await this.getAlbum(song.albumId) : undefined;
      
      return {
        ...song,
        artist: artist!,
        album,
        isLiked: true,
      };
    })).then(songs => songs.filter(Boolean) as SongWithDetails[]);
  }

  async likeSong(data: InsertLikedSong): Promise<LikedSong> {
    const id = randomUUID();
    const likedSong: LikedSong = { ...data, id, likedAt: new Date() };
    this.likedSongs.set(id, likedSong);
    return likedSong;
  }

  async unlikeSong(songId: string): Promise<void> {
    const likedSong = Array.from(this.likedSongs.values()).find(ls => ls.songId === songId);
    if (likedSong) {
      this.likedSongs.delete(likedSong.id);
    }
  }

  async isSongLiked(songId: string): Promise<boolean> {
    return Array.from(this.likedSongs.values()).some(ls => ls.songId === songId);
  }

  // Memberships
  async getMembership(userId: string): Promise<Membership | undefined> {
    return Array.from(this.memberships.values()).find(m => m.userId === userId);
  }

  async createMembership(insertMembership: InsertMembership): Promise<Membership> {
    const id = randomUUID();
    const membership: Membership = { 
      ...insertMembership, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.memberships.set(id, membership);
    return membership;
  }

  async updateMembership(userId: string, updates: Partial<Membership>): Promise<Membership | undefined> {
    const membership = await this.getMembership(userId);
    if (!membership) return undefined;
    
    const updatedMembership: Membership = { 
      ...membership, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.memberships.set(membership.id, updatedMembership);
    return updatedMembership;
  }

  // Pi Payments
  async createPiPayment(insertPayment: InsertPiPayment): Promise<PiPayment> {
    const id = randomUUID();
    const payment: PiPayment = { 
      ...insertPayment, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.piPayments.set(id, payment);
    return payment;
  }

  async getPiPayment(paymentId: string): Promise<PiPayment | undefined> {
    return Array.from(this.piPayments.values()).find(p => p.paymentId === paymentId);
  }

  async updatePiPayment(paymentId: string, updates: Partial<PiPayment>): Promise<PiPayment | undefined> {
    const payment = await this.getPiPayment(paymentId);
    if (!payment) return undefined;
    
    const updatedPayment: PiPayment = { 
      ...payment, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.piPayments.set(payment.id, updatedPayment);
    return updatedPayment;
  }

  async getPiPaymentsByUser(userId: string): Promise<PiPayment[]> {
    return Array.from(this.piPayments.values()).filter(p => p.userId === userId);
  }

  // User Profile
  async getUserProfile(userId: string): Promise<{ id: string; name: string; avatar?: string } | undefined> {
    // Mock implementation - return a default profile
    return {
      id: userId,
      name: "Demo User",
      avatar: undefined
    };
  }

  async updateUserProfile(userId: string, data: { name: string; avatar?: string }): Promise<{ id: string; name: string; avatar?: string } | undefined> {
    // Mock implementation - return updated profile
    return {
      id: userId,
      name: data.name,
      avatar: data.avatar
    };
  }

  // Ambient Music
  async generateAmbientForPlaylist(playlistId: string): Promise<AmbientMusicSetting> {
    // Mock implementation
    const id = randomUUID();
    const setting: AmbientMusicSetting = {
      id,
      playlistId,
      theme: "relaxing",
      intensity: 0.5,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return setting;
  }

  async getAmbientSetting(playlistId: string): Promise<AmbientMusicSetting | undefined> {
    // Mock implementation - return undefined as no ambient settings stored
    return undefined;
  }

  async updateAmbientSetting(settingId: string, updates: Partial<AmbientMusicSetting>): Promise<AmbientMusicSetting | undefined> {
    // Mock implementation - return undefined
    return undefined;
  }
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // Initialize with seed data on first run
  constructor() {
    this.ensureSeedData();
  }

  private async ensureSeedData() {
    try {
      // Force reseed to get all 41 songs
      await this.clearAndSeedDatabase();
    } catch (error) {
      console.error('Error checking/seeding database:', error);
    }
  }

  private async clearAndSeedDatabase() {
    try {
      // Clear existing data in correct order due to foreign key constraints
      await db.delete(likedSongs);
      await db.delete(playlistSongs); 
      await db.delete(songs);
      await db.delete(albums); 
      await db.delete(artists);
      console.log('Cleared existing data, reseeding with all 41 songs...');
      await this.seedDatabase();
    } catch (error) {
      console.error('Error clearing/seeding database:', error);
    }
  }

  private async seedDatabase() {
    console.log('Starting database seeding...');
    
    // Create 80s artists
    const artist1: Artist = {
      id: "artist-1",
      name: "Synth Masters",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Legendary 80s synthpop artists behind classics like Take On Me",
      createdAt: new Date(),
    };

    const artist2: Artist = {
      id: "artist-2",
      name: "Neon Dreams",
      imageUrl: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Electronic pioneers who defined the sound of the 80s",
      createdAt: new Date(),
    };

    const artist3: Artist = {
      id: "artist-3",
      name: "Digital Pulse",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Masters of cyberpunk and future synthwave",
      createdAt: new Date(),
    };

    // NEW ARTISTS FOR NEW SONGS
    const dylanSitts: Artist = {
      id: "artist-dylan-sitts",
      name: "Dylan Sitts",
      imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Hip-hop artist with lyrical prowess and powerful flow",
      createdAt: new Date(),
    };

    const nbhdNick: Artist = {
      id: "artist-nbhd-nick", 
      name: "Nbhd Nick",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Underground hip-hop producer with distinctive beats",
      createdAt: new Date(),
    };

    const speedyTheSpider: Artist = {
      id: "artist-speedy-spider",
      name: "Speedy The Spider", 
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Alternative rock band with gritty guitar sounds",
      createdAt: new Date(),
    };

    const miaLailani: Artist = {
      id: "artist-mia-lailani",
      name: "Mia Lailani",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300", 
      bio: "Pop sensation with melodic instrumentals",
      createdAt: new Date(),
    };

    const lovingCaliber: Artist = {
      id: "artist-loving-caliber",
      name: "Loving Caliber",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Pop duo creating infectious dance tracks", 
      createdAt: new Date(),
    };

    const bankston: Artist = {
      id: "artist-bankston",
      name: "Bankston",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Pop artist with catchy melodies and beats",
      createdAt: new Date(),
    };

    const pw: Artist = {
      id: "artist-pw",
      name: "PW", 
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Feel-good pop producer with uplifting sounds",
      createdAt: new Date(),
    };

    const johnRunefelt: Artist = {
      id: "artist-john-runefelt",
      name: "John Runefelt",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Electronic music producer with atmospheric soundscapes",
      createdAt: new Date(),
    };

    const scientific: Artist = {
      id: "artist-scientific", 
      name: "Scientific",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Electronic artist pushing boundaries of digital sound",
      createdAt: new Date(),
    };

    const maybe: Artist = {
      id: "artist-maybe",
      name: "Maybe", 
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Chill ambient artist creating relaxing soundscapes",
      createdAt: new Date(),
    };

    const danielFridell: Artist = {
      id: "artist-daniel-fridell",
      name: "Daniel Fridell",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: "Funk and soul artist with groovy bass lines",
      createdAt: new Date(),
    };

    try {
      await db.insert(artists).values([
        artist1, artist2, artist3, dylanSitts, nbhdNick, speedyTheSpider, 
        miaLailani, lovingCaliber, bankston, pw, johnRunefelt, scientific, maybe, danielFridell
      ]);

      // Create albums  
      const album1: Album = {
        id: "album-1",
        title: "Neon Nights",
        artistId: "artist-1", 
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        releaseDate: new Date('1984-01-01'),
        genre: "Synthwave",
        createdAt: new Date(),
      };

      const album2: Album = {
        id: "album-2",
        title: "Electric Dreams",
        artistId: "artist-2",
        imageUrl: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300", 
        releaseDate: new Date('1986-01-01'),
        genre: "Electronic",
        createdAt: new Date(),
      };

      const album3: Album = {
        id: "album-3", 
        title: "Cyber Future",
        artistId: "artist-3",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        releaseDate: new Date('1987-01-01'),
        genre: "Cyberpunk",
        createdAt: new Date(),
      };

      // NEW ALBUMS
      const quarterTimeAlbum: Album = {
        id: "album-quarter-time",
        title: "Quarter Time",
        artistId: "artist-dylan-sitts",
        imageUrl: "@assets/generated_images/fourth-quarter_a1b2c3d4.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Hip-hop",
        createdAt: new Date(),
      };

      const lockInAlbum: Album = {
        id: "album-lock-in",
        title: "Lock In",
        artistId: "artist-nbhd-nick", 
        imageUrl: "@assets/generated_images/lock-in_e5f6g7h8.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Hip-hop",
        createdAt: new Date(),
      };

      const sandHeadAlbum: Album = {
        id: "album-sand-head",
        title: "Head in the Sand",
        artistId: "artist-speedy-spider",
        imageUrl: "@assets/generated_images/head-in-sand_i9j0k1l2.png", 
        releaseDate: new Date('2024-01-01'),
        genre: "Alternative Rock",
        createdAt: new Date(),
      };

      const instrumentalsVol1: Album = {
        id: "album-instrumentals-vol1",
        title: "Instrumentals Vol. 1",
        artistId: "artist-mia-lailani",
        imageUrl: "@assets/generated_images/youll-never-know_m3n4o5p6.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Pop",
        createdAt: new Date(),
      };

      const moveAlbum: Album = {
        id: "album-move",
        title: "Move",
        artistId: "artist-loving-caliber", 
        imageUrl: "@assets/generated_images/move_q7r8s9t0.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Pop",
        createdAt: new Date(),
      };

      const stuckAlbum: Album = {
        id: "album-stuck",
        title: "Stuck",
        artistId: "artist-bankston",
        imageUrl: "@assets/generated_images/stuck-in-head_u1v2w3x4.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Pop",
        createdAt: new Date(),
      };

      const feelGoodAlbum: Album = {
        id: "album-feel-good", 
        title: "Feel Good",
        artistId: "artist-pw",
        imageUrl: "@assets/generated_images/feel-good_y5z6a7b8.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Pop",
        createdAt: new Date(),
      };

      const minuteAlbum: Album = {
        id: "album-minute",
        title: "In a Minute",
        artistId: "artist-john-runefelt",
        imageUrl: "@assets/generated_images/in-a-minute_c9d0e1f2.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Electronic",
        createdAt: new Date(),
      };

      const flowAlbum: Album = {
        id: "album-flow",
        title: "Let It Flow", 
        artistId: "artist-scientific",
        imageUrl: "@assets/generated_images/let-it-flow_g3h4i5j6.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Electronic",
        createdAt: new Date(),
      };

      const poolsideAlbum: Album = {
        id: "album-poolside",
        title: "Poolside",
        artistId: "artist-maybe",
        imageUrl: "@assets/generated_images/poolside_k7l8m9n0.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Chill/Ambient",
        createdAt: new Date(),
      };

      const specialSauceAlbum: Album = {
        id: "album-special-sauce",
        title: "Special Sauce",
        artistId: "artist-daniel-fridell",
        imageUrl: "@assets/generated_images/special-sauce_o1p2q3r4.png",
        releaseDate: new Date('2024-01-01'),
        genre: "Funk/Soul",
        createdAt: new Date(),
      };

      await db.insert(albums).values([
        album1, album2, album3, quarterTimeAlbum, lockInAlbum, sandHeadAlbum,
        instrumentalsVol1, moveAlbum, stuckAlbum, feelGoodAlbum, minuteAlbum,
        flowAlbum, poolsideAlbum, specialSauceAlbum
      ]);

      // Create original songs with trackNumber
      const originalSongs: Song[] = [
        {
          id: "song-champions-freedom",
          title: "Champions of Freedom", 
          artistId: "artist-1",
          albumId: "album-1",
          duration: 243,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Synthwave",
          playCount: 1245,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-firstborn",
          title: "The Firstborn",
          artistId: "artist-1",
          albumId: "album-1", 
          duration: 267,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Synthwave",
          playCount: 987,
          trackNumber: 2,
          createdAt: new Date(),
        },
        {
          id: "song-darkest-demons",
          title: "Darkest of Demons",
          artistId: "artist-1",
          albumId: "album-1",
          duration: 298,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", 
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Synthwave",
          playCount: 1567,
          trackNumber: 3,
          createdAt: new Date(),
        },
        {
          id: "song-deepstar",
          title: "Deepstar",
          artistId: "artist-2",
          albumId: "album-2",
          duration: 189,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
          imageUrl: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Electronic",
          playCount: 2134, 
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-one-step-away",
          title: "One Step Away",
          artistId: "artist-2",
          albumId: "album-2",
          duration: 245,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
          imageUrl: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Electronic", 
          playCount: 1876,
          trackNumber: 2,
          createdAt: new Date(),
        },
        {
          id: "song-symmetry",
          title: "Symmetry",
          artistId: "artist-2",
          albumId: "album-2",
          duration: 234,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
          imageUrl: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Electronic",
          playCount: 1432,
          trackNumber: 3,
          createdAt: new Date(),
        },
        {
          id: "song-only-way-out",
          title: "The Only Way Out", 
          artistId: "artist-3",
          albumId: "album-3",
          duration: 276,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Cyberpunk",
          playCount: 1987,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-deeplight",
          title: "Deeplight",
          artistId: "artist-3",
          albumId: "album-3",
          duration: 312,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Cyberpunk",
          playCount: 1654,
          trackNumber: 2,
          createdAt: new Date(),
        },
        {
          id: "song-shadow-mortus",
          title: "Shadow of Mortus",
          artistId: "artist-3",
          albumId: "album-3", 
          duration: 289,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Cyberpunk",
          playCount: 2345,
          trackNumber: 3,
          createdAt: new Date(),
        },
        {
          id: "song-open-skies",
          title: "Under Open Skies",
          artistId: "artist-1",
          albumId: "album-1",
          duration: 198,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
          imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          genre: "Synthwave",
          playCount: 876,
          trackNumber: 4,
          createdAt: new Date(),
        }
      ];

      // Create NEW songs with trackNumber
      const newSongs: Song[] = [
        {
          id: "song-fourth-quarter",
          title: "Fourth Quarter",
          artistId: "artist-dylan-sitts",
          albumId: "album-quarter-time",
          duration: 180,
          audioUrl: "/attached_assets/ES_Fourth Quarter - Dylan Sitts_1756913296915.mp3",
          imageUrl: "@assets/generated_images/fourth-quarter_a1b2c3d4.png",
          genre: "Hip-hop",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-lock-in",
          title: "Lock In (Instrumental)",
          artistId: "artist-nbhd-nick",
          albumId: "album-lock-in",
          duration: 175,
          audioUrl: "/attached_assets/ES_Lock In (Instrumental) - Nbhd Nick_1756913296921.mp3",
          imageUrl: "@assets/generated_images/lock-in_e5f6g7h8.png",
          genre: "Hip-hop",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-keeping-head-sand",
          title: "Keeping My Head in the Sand",
          artistId: "artist-speedy-spider", 
          albumId: "album-sand-head",
          duration: 210,
          audioUrl: "/attached_assets/ES_Keeping My Head in the Sand - Speedy The Spider_1756913296927.mp3",
          imageUrl: "@assets/generated_images/head-in-sand_i9j0k1l2.png",
          genre: "Alternative Rock",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-youll-never-know",
          title: "You'll Never Know (Instrumental)",
          artistId: "artist-mia-lailani",
          albumId: "album-instrumentals-vol1",
          duration: 195,
          audioUrl: "/attached_assets/ES_You'll Never Know (Instrumental) - Mia Lailani_1756913296933.mp3",
          imageUrl: "@assets/generated_images/youll-never-know_m3n4o5p6.png", 
          genre: "Pop",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-move",
          title: "Move (Instrumental)",
          artistId: "artist-loving-caliber",
          albumId: "album-move",
          duration: 185,
          audioUrl: "/attached_assets/ES_Move (Instrumental) - Loving Caliber_1756913296939.mp3",
          imageUrl: "@assets/generated_images/move_q7r8s9t0.png",
          genre: "Pop",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-stuck-in-head",
          title: "Stuck in My Head (Instrumental)",
          artistId: "artist-bankston",
          albumId: "album-stuck",
          duration: 200,
          audioUrl: "/attached_assets/ES_Stuck in My Head (Instrumental) - Bankston_1756913296945.mp3", 
          imageUrl: "@assets/generated_images/stuck-in-head_u1v2w3x4.png",
          genre: "Pop",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-feel-good",
          title: "Feel Good (Instrumental)",
          artistId: "artist-pw",
          albumId: "album-feel-good",
          duration: 190,
          audioUrl: "/attached_assets/ES_Feel Good (Instrumental) - PW_1756913296950.mp3",
          imageUrl: "@assets/generated_images/feel-good_y5z6a7b8.png",
          genre: "Pop",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-in-a-minute",
          title: "In a Minute",
          artistId: "artist-john-runefelt",
          albumId: "album-minute",
          duration: 205,
          audioUrl: "/attached_assets/ES_In a Minute - John Runefelt_1756913296956.mp3",
          imageUrl: "@assets/generated_images/in-a-minute_c9d0e1f2.png",
          genre: "Electronic", 
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-let-it-flow",
          title: "Let It Flow",
          artistId: "artist-scientific",
          albumId: "album-flow",
          duration: 220,
          audioUrl: "/attached_assets/ES_Let It Flow - Scientific_1756913296962.mp3",
          imageUrl: "@assets/generated_images/let-it-flow_g3h4i5j6.png",
          genre: "Electronic",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-poolside",
          title: "Poolside (Instrumental)",
          artistId: "artist-maybe",
          albumId: "album-poolside",
          duration: 215,
          audioUrl: "/attached_assets/ES_Poolside (Instrumental) - Maybe_1756913296967.mp3",
          imageUrl: "@assets/generated_images/poolside_k7l8m9n0.png",
          genre: "Chill/Ambient",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        },
        {
          id: "song-special-sauce",
          title: "Special Sauce",
          artistId: "artist-daniel-fridell", 
          albumId: "album-special-sauce",
          duration: 225,
          audioUrl: "/attached_assets/ES_Special Sauce - Daniel Fridell_1756913296973.mp3",
          imageUrl: "@assets/generated_images/special-sauce_o1p2q3r4.png",
          genre: "Funk/Soul",
          playCount: 0,
          trackNumber: 1,
          createdAt: new Date(),
        }
      ];

      await db.insert(songs).values([...originalSongs, ...newSongs]);

      console.log('Database seeded successfully with 41 songs total!');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  // Artists
  async getArtists(): Promise<Artist[]> {
    return await db.select().from(artists);
  }

  async getArtist(id: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(insertArtist).returning();
    return artist;
  }

  // Albums
  async getAlbums(): Promise<Album[]> {
    return await db.select().from(albums);
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album;
  }

  async getAlbumsByArtist(artistId: string): Promise<Album[]> {
    return await db.select().from(albums).where(eq(albums.artistId, artistId));
  }

  async createAlbum(insertAlbum: InsertAlbum): Promise<Album> {
    const [album] = await db.insert(albums).values(insertAlbum).returning();
    return album;
  }

  // Songs
  async getSongs(): Promise<Song[]> {
    return await db.select().from(songs);
  }

  async getSong(id: string): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song;
  }

  async getSongsByAlbum(albumId: string): Promise<Song[]> {
    return await db.select().from(songs).where(eq(songs.albumId, albumId));
  }

  async getSongsByArtist(artistId: string): Promise<Song[]> {
    return await db.select().from(songs).where(eq(songs.artistId, artistId));
  }

  async searchSongs(query: string): Promise<SongWithDetails[]> {
    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        artistId: songs.artistId,
        albumId: songs.albumId,
        duration: songs.duration,
        audioUrl: songs.audioUrl,
        imageUrl: songs.imageUrl,
        genre: songs.genre,
        trackNumber: songs.trackNumber,
        playCount: songs.playCount,
        createdAt: songs.createdAt,
        artist: artists.name,
        album: albums.title,
        albumImageUrl: albums.imageUrl,
      })
      .from(songs)
      .leftJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .where(ilike(songs.title, `%${query}%`));
    
    return result;
  }

  async getRecentlyPlayed(): Promise<SongWithDetails[]> {
    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        artistId: songs.artistId,
        albumId: songs.albumId,
        duration: songs.duration,
        audioUrl: songs.audioUrl,
        imageUrl: songs.imageUrl,
        genre: songs.genre,
        trackNumber: songs.trackNumber,
        playCount: songs.playCount,
        createdAt: songs.createdAt,
        artist: artists.name,
        album: albums.title,
        albumImageUrl: albums.imageUrl,
      })
      .from(songs)
      .leftJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .orderBy(desc(songs.playCount))
      .limit(20);
    
    return result;
  }

  async getTrendingSongs(): Promise<SongWithDetails[]> {
    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        artistId: songs.artistId,
        albumId: songs.albumId,
        duration: songs.duration,
        audioUrl: songs.audioUrl,
        imageUrl: songs.imageUrl,
        genre: songs.genre,
        trackNumber: songs.trackNumber,
        playCount: songs.playCount,
        createdAt: songs.createdAt,
        artist: artists.name,
        album: albums.title,
        albumImageUrl: albums.imageUrl,
      })
      .from(songs)
      .leftJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .orderBy(desc(songs.playCount))
      .limit(10);
    
    return result;
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const [song] = await db.insert(songs).values(insertSong).returning();
    return song;
  }

  async incrementPlayCount(songId: string): Promise<void> {
    await db
      .update(songs)
      .set({ playCount: sql`${songs.playCount} + 1` })
      .where(eq(songs.id, songId));
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    return await db.select().from(playlists);
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const userPlaylists = await db.select().from(playlists).where(eq(playlists.createdBy, userId));
    return userPlaylists;
  }

  async getPlaylistWithSongs(id: string): Promise<PlaylistWithDetails | undefined> {
    const playlist = await this.getPlaylist(id);
    if (!playlist) return undefined;

    const playlistSongsData = await db
      .select({
        id: songs.id,
        title: songs.title,
        artistId: songs.artistId,
        albumId: songs.albumId,
        duration: songs.duration,
        audioUrl: songs.audioUrl,
        imageUrl: songs.imageUrl,
        genre: songs.genre,
        trackNumber: songs.trackNumber,
        playCount: songs.playCount,
        createdAt: songs.createdAt,
        artist: artists.name,
        album: albums.title,
        albumImageUrl: albums.imageUrl,
        addedAt: playlistSongs.addedAt,
      })
      .from(playlistSongs)
      .leftJoin(songs, eq(playlistSongs.songId, songs.id))
      .leftJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .where(eq(playlistSongs.playlistId, id));

    return {
      ...playlist,
      songs: playlistSongsData,
    };
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const [playlist] = await db.insert(playlists).values(insertPlaylist).returning();
    return playlist;
  }

  async addSongToPlaylist(data: InsertPlaylistSong): Promise<PlaylistSong> {
    const [playlistSong] = await db.insert(playlistSongs).values(data).returning();
    return playlistSong;
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    await db
      .delete(playlistSongs)
      .where(
        sql`${playlistSongs.playlistId} = ${playlistId} AND ${playlistSongs.songId} = ${songId}`
      );
  }

  // Liked Songs
  async getLikedSongs(): Promise<SongWithDetails[]> {
    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        artistId: songs.artistId,
        albumId: songs.albumId,
        duration: songs.duration,
        audioUrl: songs.audioUrl,
        imageUrl: songs.imageUrl,
        genre: songs.genre,
        trackNumber: songs.trackNumber,
        playCount: songs.playCount,
        createdAt: songs.createdAt,
        artist: artists.name,
        album: albums.title,
        albumImageUrl: albums.imageUrl,
      })
      .from(likedSongs)
      .leftJoin(songs, eq(likedSongs.songId, songs.id))
      .leftJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id));
    
    return result;
  }

  async likeSong(data: InsertLikedSong): Promise<LikedSong> {
    const [likedSong] = await db.insert(likedSongs).values(data).returning();
    return likedSong;
  }

  async unlikeSong(songId: string): Promise<void> {
    await db.delete(likedSongs).where(eq(likedSongs.songId, songId));
  }

  async isSongLiked(songId: string): Promise<boolean> {
    const [result] = await db.select().from(likedSongs).where(eq(likedSongs.songId, songId)).limit(1);
    return !!result;
  }

  // Memberships - THE KEY PART FOR PREMIUM PERSISTENCE!
  async getMembership(userId: string): Promise<Membership | undefined> {
    const [membership] = await db.select().from(memberships).where(eq(memberships.userId, userId));
    return membership;
  }

  async createMembership(insertMembership: InsertMembership): Promise<Membership> {
    const [membership] = await db.insert(memberships).values(insertMembership).returning();
    return membership;
  }

  async updateMembership(userId: string, updates: Partial<Membership>): Promise<Membership | undefined> {
    const [membership] = await db
      .update(memberships)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(memberships.userId, userId))
      .returning();
    return membership;
  }

  // Pi Payments
  async createPiPayment(insertPayment: InsertPiPayment): Promise<PiPayment> {
    const [payment] = await db.insert(piPayments).values(insertPayment).returning();
    return payment;
  }

  async getPiPayment(paymentId: string): Promise<PiPayment | undefined> {
    const [payment] = await db.select().from(piPayments).where(eq(piPayments.paymentId, paymentId));
    return payment;
  }

  async updatePiPayment(paymentId: string, updates: Partial<PiPayment>): Promise<PiPayment | undefined> {
    const [payment] = await db
      .update(piPayments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(piPayments.paymentId, paymentId))
      .returning();
    return payment;
  }

  async getPiPaymentsByUser(userId: string): Promise<PiPayment[]> {
    return await db.select().from(piPayments).where(eq(piPayments.userId, userId));
  }

  // Ambient Music Generation
  async generateAmbientForPlaylist(playlistId: string): Promise<AmbientMusicSetting> {
    const playlist = await this.getPlaylistWithSongs(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // Check if ambient setting already exists
    const existing = await this.getAmbientSetting(playlistId);
    if (existing) {
      return existing;
    }

    // Analyze playlist theme based on songs and genres
    const { theme, mood, tempo, intensity } = this.analyzePlaylistForAmbient(playlist);
    
    const [ambientSetting] = await db.insert(ambientMusicSettings).values({
      playlistId,
      theme,
      mood,
      tempo,
      intensity,
      enabled: true,
    }).returning();

    return ambientSetting;
  }

  async getAmbientSetting(playlistId: string): Promise<AmbientMusicSetting | undefined> {
    const [setting] = await db.select().from(ambientMusicSettings)
      .where(eq(ambientMusicSettings.playlistId, playlistId));
    return setting;
  }

  async updateAmbientSetting(settingId: string, updates: Partial<AmbientMusicSetting>): Promise<AmbientMusicSetting | undefined> {
    const [setting] = await db.update(ambientMusicSettings)
      .set({ ...updates, lastGenerated: new Date() })
      .where(eq(ambientMusicSettings.id, settingId))
      .returning();
    return setting;
  }

  // User Profile methods - using simple in-memory object for demo
  private profiles: { [key: string]: { id: string; name: string; avatar?: string } } = {};

  async getUserProfile(userId: string): Promise<{ id: string; name: string; avatar?: string } | undefined> {
    // Get from simple object storage
    if (this.profiles[userId]) {
      return this.profiles[userId];
    }
    
    // Return default for demo user if not found
    if (userId === "demo-user-123") {
      return {
        id: userId,
        name: "Premium User",
        avatar: undefined
      };
    }
    
    return undefined;
  }

  async updateUserProfile(userId: string, data: { name: string; avatar?: string }): Promise<{ id: string; name: string; avatar?: string } | undefined> {
    // Update profile in simple object storage
    if (userId !== "demo-user-123") {
      return undefined;
    }

    const updatedProfile = {
      id: userId,
      name: data.name,
      avatar: data.avatar,
    };

    this.profiles[userId] = updatedProfile;
    return updatedProfile;
  }

  private analyzePlaylistForAmbient(playlist: PlaylistWithDetails): {
    theme: string;
    mood: string;
    tempo: number;
    intensity: number;
  } {
    const songs = playlist.songs || [];
    const genres = songs.map(song => song.genre?.toLowerCase() || 'unknown');
    const name = playlist.name.toLowerCase();
    const description = playlist.description?.toLowerCase() || '';

    // Detect theme based on playlist name, description, and genres
    let theme = 'cosmic';
    let mood = 'peaceful';
    let tempo = 60;
    let intensity = 5;

    // Theme detection logic
    if (name.includes('chill') || name.includes('ambient') || description.includes('relax')) {
      theme = 'chill';
      mood = 'peaceful';
      tempo = 50;
      intensity = 3;
    } else if (genres.includes('electronic') || name.includes('electronic')) {
      theme = 'cosmic';
      mood = 'mysterious';
      tempo = 80;
      intensity = 6;
    } else if (genres.includes('folk') || name.includes('acoustic')) {
      theme = 'nature';
      mood = 'peaceful';
      tempo = 65;
      intensity = 4;
    } else if (name.includes('energy') || name.includes('workout') || genres.includes('dance')) {
      theme = 'energy';
      mood = 'energetic';
      tempo = 120;
      intensity = 8;
    } else if (name.includes('urban') || name.includes('city') || genres.includes('hip-hop')) {
      theme = 'urban';
      mood = 'mysterious';
      tempo = 90;
      intensity = 7;
    }

    return { theme, mood, tempo, intensity };
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Artists
  async getArtists(): Promise<Artist[]> {
    return await db.select().from(artists);
  }

  async getArtist(id: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist || undefined;
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const [newArtist] = await db.insert(artists).values({
      ...artist,
      id: randomUUID(),
    }).returning();
    return newArtist;
  }

  // Albums
  async getAlbums(): Promise<Album[]> {
    return await db.select().from(albums);
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album || undefined;
  }

  async getAlbumsByArtist(artistId: string): Promise<Album[]> {
    return await db.select().from(albums).where(eq(albums.artistId, artistId));
  }

  async createAlbum(album: InsertAlbum): Promise<Album> {
    const [newAlbum] = await db.insert(albums).values({
      ...album,
      id: randomUUID(),
    }).returning();
    return newAlbum;
  }

  // Songs
  async getSongs(): Promise<Song[]> {
    return await db.select().from(songs);
  }

  async getSong(id: string): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || undefined;
  }

  async getSongsByAlbum(albumId: string): Promise<Song[]> {
    return await db.select().from(songs).where(eq(songs.albumId, albumId));
  }

  async getSongsByArtist(artistId: string): Promise<Song[]> {
    return await db.select().from(songs).where(eq(songs.artistId, artistId));
  }

  async searchSongs(query: string): Promise<SongWithDetails[]> {
    const results = await db
      .select({
        song: songs,
        artist: artists,
        album: albums
      })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .where(ilike(songs.title, `%${query}%`));

    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || undefined,
    }));
  }

  async getRecentlyPlayed(): Promise<SongWithDetails[]> {
    const results = await db
      .select({
        song: songs,
        artist: artists,
        album: albums
      })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .orderBy(desc(songs.playCount))
      .limit(10);

    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || undefined,
    }));
  }

  async getTrendingSongs(): Promise<SongWithDetails[]> {
    const results = await db
      .select({
        song: songs,
        artist: artists,
        album: albums
      })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .orderBy(desc(songs.playCount))
      .limit(15);

    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || undefined,
    }));
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db.insert(songs).values({
      ...song,
      id: randomUUID(),
    }).returning();
    return newSong;
  }

  async incrementPlayCount(songId: string): Promise<void> {
    await db
      .update(songs)
      .set({ playCount: sql`${songs.playCount} + 1` })
      .where(eq(songs.id, songId));
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    return await db.select().from(playlists);
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist || undefined;
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return await db.select().from(playlists).where(eq(playlists.createdBy, userId));
  }

  async getPlaylistWithSongs(id: string): Promise<PlaylistWithDetails | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    if (!playlist) return undefined;

    const playlistSongsResult = await db
      .select({
        playlistSong: playlistSongs,
        song: songs,
        artist: artists,
        album: albums
      })
      .from(playlistSongs)
      .innerJoin(songs, eq(playlistSongs.songId, songs.id))
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .where(eq(playlistSongs.playlistId, id))
      .orderBy(playlistSongs.position);

    const songsWithDetails = playlistSongsResult.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || undefined,
    }));

    return {
      ...playlist,
      songs: songsWithDetails,
    };
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values({
      ...playlist,
      id: randomUUID(),
    }).returning();
    return newPlaylist;
  }

  async addSongToPlaylist(data: InsertPlaylistSong): Promise<PlaylistSong> {
    const [playlistSong] = await db.insert(playlistSongs).values({
      ...data,
      id: randomUUID(),
    }).returning();
    return playlistSong;
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    await db
      .delete(playlistSongs)
      .where(
        sql`${playlistSongs.playlistId} = ${playlistId} AND ${playlistSongs.songId} = ${songId}`
      );
  }

  // Liked Songs
  async getLikedSongs(): Promise<SongWithDetails[]> {
    const results = await db
      .select({
        song: songs,
        artist: artists,
        album: albums
      })
      .from(likedSongs)
      .innerJoin(songs, eq(likedSongs.songId, songs.id))
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .orderBy(desc(likedSongs.likedAt));

    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || undefined,
    }));
  }

  async likeSong(data: InsertLikedSong): Promise<LikedSong> {
    const [likedSong] = await db.insert(likedSongs).values({
      ...data,
      id: randomUUID(),
    }).returning();
    return likedSong;
  }

  async unlikeSong(songId: string): Promise<void> {
    await db.delete(likedSongs).where(eq(likedSongs.songId, songId));
  }

  async isSongLiked(songId: string): Promise<boolean> {
    const [liked] = await db.select().from(likedSongs).where(eq(likedSongs.songId, songId));
    return !!liked;
  }

  // User Profile
  async getUserProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || undefined;
  }

  async updateUserProfile(userId: string, data: { name?: string; nickname?: string; imageUrl?: string }): Promise<Profile | undefined> {
    const existingProfile = await this.getUserProfile(userId);
    
    if (!existingProfile) {
      // Create new profile if doesn't exist
      const newProfile = await this.createUserProfile({
        userId,
        name: data.name || 'PurpleBeats User',
        nickname: data.nickname,
        imageUrl: data.imageUrl,
      });
      return newProfile;
    }

    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning();
    
    return updatedProfile || undefined;
  }

  async createUserProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values({
      ...profile,
      id: randomUUID(),
    }).returning();
    return newProfile;
  }

  // Memberships
  async getMembership(userId: string): Promise<Membership | undefined> {
    const [membership] = await db.select().from(memberships).where(eq(memberships.userId, userId));
    return membership || undefined;
  }

  async createMembership(membership: InsertMembership): Promise<Membership> {
    const [newMembership] = await db.insert(memberships).values({
      ...membership,
      id: randomUUID(),
    }).returning();
    return newMembership;
  }

  async updateMembership(userId: string, updates: Partial<Membership>): Promise<Membership | undefined> {
    const [updatedMembership] = await db
      .update(memberships)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(memberships.userId, userId))
      .returning();
    
    return updatedMembership || undefined;
  }
  
  // Pi Payments
  async createPiPayment(payment: InsertPiPayment): Promise<PiPayment> {
    const [newPayment] = await db.insert(piPayments).values({
      ...payment,
      id: randomUUID(),
    }).returning();
    return newPayment;
  }

  async getPiPayment(paymentId: string): Promise<PiPayment | undefined> {
    const [payment] = await db.select().from(piPayments).where(eq(piPayments.paymentId, paymentId));
    return payment || undefined;
  }

  async updatePiPayment(paymentId: string, updates: Partial<PiPayment>): Promise<PiPayment | undefined> {
    const [updatedPayment] = await db
      .update(piPayments)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(piPayments.paymentId, paymentId))
      .returning();
    
    return updatedPayment || undefined;
  }

  async getPiPaymentsByUser(userId: string): Promise<PiPayment[]> {
    return await db.select().from(piPayments).where(eq(piPayments.userId, userId));
  }
  
  // Ambient Music
  async generateAmbientForPlaylist(playlistId: string): Promise<AmbientMusicSetting> {
    const [ambientSetting] = await db.insert(ambientMusicSettings).values({
      id: randomUUID(),
      playlistId,
      theme: "cosmic",
      mood: "peaceful",
      tempo: 60,
      intensity: 5,
      enabled: true,
    }).returning();
    return ambientSetting;
  }

  async getAmbientSetting(playlistId: string): Promise<AmbientMusicSetting | undefined> {
    const [setting] = await db.select().from(ambientMusicSettings).where(eq(ambientMusicSettings.playlistId, playlistId));
    return setting || undefined;
  }

  async updateAmbientSetting(settingId: string, updates: Partial<AmbientMusicSetting>): Promise<AmbientMusicSetting | undefined> {
    const [updatedSetting] = await db
      .update(ambientMusicSettings)
      .set({
        ...updates,
        lastGenerated: new Date(),
      })
      .where(eq(ambientMusicSettings.id, settingId))
      .returning();
    
    return updatedSetting || undefined;
  }
}

export const storage = new DatabaseStorage();
