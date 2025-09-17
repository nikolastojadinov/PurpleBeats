import { 
  type Artist, type Album, type Song, type Playlist, type PlaylistSong, type LikedSong, type LikedPlaylist, type LibraryPlaylist, type Membership, type PiPayment, type Profile,
  type InsertArtist, type InsertAlbum, type InsertSong, type InsertPlaylist, type InsertPlaylistSong, type InsertLikedSong, type InsertLikedPlaylist, type InsertLibraryPlaylist, type InsertMembership, type InsertPiPayment, type InsertProfile,
  type SongWithDetails, type AlbumWithDetails, type PlaylistWithDetails, type PlaylistWithAmbient,
  type AmbientMusicSetting, type InsertAmbientMusicSetting,
  artists, albums, songs, playlists, playlistSongs, likedSongs, likedPlaylists, libraryPlaylists, memberships, piPayments, ambientMusicSettings, profiles
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, ilike, desc, sql, isNotNull, asc } from "drizzle-orm";

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
  searchSongsByGenre(genre: string): Promise<SongWithDetails[]>;
  searchPlaylists(query: string): Promise<Playlist[]>;
  searchArtists(query: string): Promise<Artist[]>;
  getRecentlyPlayed(): Promise<SongWithDetails[]>;
  getTrendingSongs(): Promise<SongWithDetails[]>;
  getAvailableGenres(): Promise<string[]>;
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
  generateDailyMix(forceRefresh?: boolean): Promise<Playlist>;
  initializeDefaultPlaylists(): Promise<void>;
  deletePlaylist(playlistId: string): Promise<void>;
  updatePlaylist(playlistId: string, updates: { name?: string; imageUrl?: string; description?: string }): Promise<Playlist | undefined>;

  // Liked Songs
  getLikedSongs(): Promise<SongWithDetails[]>;
  likeSong(data: InsertLikedSong): Promise<LikedSong>;
  unlikeSong(songId: string): Promise<void>;
  isSongLiked(songId: string): Promise<boolean>;

  // Liked Playlists
  getLikedPlaylists(userId: string): Promise<PlaylistWithDetails[]>;
  likePlaylist(playlistId: string, userId: string): Promise<void>;
  unlikePlaylist(playlistId: string, userId: string): Promise<void>;
  isPlaylistLiked(playlistId: string, userId: string): Promise<boolean>;

  // Library Playlists
  getLibraryPlaylists(userId: string): Promise<PlaylistWithDetails[]>;
  addPlaylistToLibrary(playlistId: string, userId: string): Promise<void>;
  removePlaylistFromLibrary(playlistId: string, userId: string): Promise<void>;
  isPlaylistInLibrary(playlistId: string, userId: string): Promise<boolean>;

  // User Profile
  getUserProfile(userId: string): Promise<Profile | undefined>;
  updateUserProfile(userId: string, data: { name?: string; nickname?: string; imageUrl?: string }): Promise<Profile | undefined>;
  createUserProfile(profile: InsertProfile): Promise<Profile>;
  getAllProfiles(): Promise<Profile[]>;
  upsertUser(user: { id: string; username: string; isPremium?: boolean }): Promise<Profile>;

  // Memberships
  getMembership(userId: string): Promise<Membership | undefined>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  updateMembership(userId: string, updates: Partial<Membership>): Promise<Membership | undefined>;
  getAllMemberships(): Promise<Membership[]>;
  
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
      id: artist.id || randomUUID(),
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
      id: album.id || randomUUID(),
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

  async searchPlaylists(query: string): Promise<Playlist[]> {
    return await db
      .select()
      .from(playlists)
      .where(ilike(playlists.name, `%${query}%`));
  }

  async searchSongsByGenre(genre: string): Promise<SongWithDetails[]> {
    const results = await db
      .select({
        song: songs,
        artist: artists,
        album: albums
      })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .leftJoin(albums, eq(songs.albumId, albums.id))
      .where(ilike(songs.genre, `%${genre}%`));

    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || undefined,
    }));
  }

  async searchArtists(query: string): Promise<Artist[]> {
    return await db
      .select()
      .from(artists)
      .where(ilike(artists.name, `%${query}%`));
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
      .where(isNotNull(songs.lastPlayed))
      .orderBy(desc(songs.lastPlayed))
      .limit(8);

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

  async getAvailableGenres(): Promise<string[]> {
    const results = await db
      .selectDistinct({ genre: songs.genre })
      .from(songs)
      .where(isNotNull(songs.genre))
      .orderBy(asc(songs.genre));

    return results.map(row => row.genre!);
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db.insert(songs).values({
      ...song,
      id: song.id || randomUUID(),
    }).returning();
    return newSong;
  }

  async incrementPlayCount(songId: string): Promise<void> {
    await db
      .update(songs)
      .set({ 
        playCount: sql`${songs.playCount} + 1`,
        lastPlayed: new Date()
      })
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

    // Update playlist song count
    await db
      .update(playlists)
      .set({
        songCount: sql`${playlists.songCount} + 1`,
      })
      .where(eq(playlists.id, data.playlistId));

    return playlistSong;
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    await db
      .delete(playlistSongs)
      .where(
        sql`${playlistSongs.playlistId} = ${playlistId} AND ${playlistSongs.songId} = ${songId}`
      );

    // Update playlist song count (ensure it doesn't go below 0)
    await db
      .update(playlists)
      .set({
        songCount: sql`GREATEST(0, ${playlists.songCount} - 1)`,
      })
      .where(eq(playlists.id, playlistId));
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

  // Daily Mix Generation
  async generateDailyMix(forceRefresh: boolean = false): Promise<Playlist> {
    const DAILY_MIX_ID = "daily-mix-1";
    
    // Check if Daily Mix already exists and was generated today
    const existingPlaylist = await this.getPlaylist(DAILY_MIX_ID);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (existingPlaylist && !forceRefresh) {
      const playlistDate = existingPlaylist.createdAt ? new Date(existingPlaylist.createdAt) : new Date();
      playlistDate.setHours(0, 0, 0, 0);
      
      // If playlist was created today, return it
      if (playlistDate.getTime() === today.getTime()) {
        return existingPlaylist;
      }
    }

    // Get all songs to pick from
    const allSongs = await this.getSongs();
    if (allSongs.length === 0) {
      throw new Error("No songs available for Daily Mix");
    }

    // Shuffle and pick 10-15 random songs
    const shuffled = allSongs.sort(() => Math.random() - 0.5);
    const selectedSongs = shuffled.slice(0, Math.min(15, allSongs.length));

    // Create or update Daily Mix playlist
    if (existingPlaylist) {
      // Clear existing songs
      await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, DAILY_MIX_ID));
      
      // Update playlist with new date
      const [updatedPlaylist] = await db
        .update(playlists)
        .set({
          songCount: selectedSongs.length,
          createdAt: new Date(),
        })
        .where(eq(playlists.id, DAILY_MIX_ID))
        .returning();
        
      // Add new songs
      for (let i = 0; i < selectedSongs.length; i++) {
        await db.insert(playlistSongs).values({
          id: randomUUID(),
          playlistId: DAILY_MIX_ID,
          songId: selectedSongs[i].id,
          position: i + 1,
        });
      }
      
      return updatedPlaylist;
    } else {
      // Create new Daily Mix playlist
      const [newPlaylist] = await db.insert(playlists).values({
        id: DAILY_MIX_ID,
        name: "Daily Mix 1",
        description: "Electronic and Synthpop favorites",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        isPublic: true,
        songCount: selectedSongs.length,
      }).returning();

      // Add songs to playlist
      for (let i = 0; i < selectedSongs.length; i++) {
        await db.insert(playlistSongs).values({
          id: randomUUID(),
          playlistId: DAILY_MIX_ID,
          songId: selectedSongs[i].id,
          position: i + 1,
        });
      }

      return newPlaylist;
    }
  }

  // Initialize default playlists if they don't exist
  async initializeDefaultPlaylists(): Promise<void> {
    const allSongs = await this.getSongs();
    if (allSongs.length === 0) return;

    const defaultPlaylists = [
      {
        id: "discover-weekly",
        name: "Discover Weekly",
        description: "Fresh finds for you",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        songs: allSongs.slice(0, 6)
      },
      {
        id: "purple-vibes",
        name: "Purple Vibes",
        description: "All things purple and gold",
        imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        songs: allSongs.slice(6, 16)
      },
      {
        id: "top-hits",
        name: "Top Hits",
        description: "Most popular songs right now",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        songs: allSongs.slice(16, 23)
      }
    ];

    for (const playlistData of defaultPlaylists) {
      const existing = await this.getPlaylist(playlistData.id);
      if (!existing) {
        // Create playlist
        await db.insert(playlists).values({
          id: playlistData.id,
          name: playlistData.name,
          description: playlistData.description,
          imageUrl: playlistData.imageUrl,
          isPublic: true,
          songCount: playlistData.songs.length,
          createdBy: "demo-user-123",
        });

        // Add songs to playlist
        for (let i = 0; i < playlistData.songs.length; i++) {
          await db.insert(playlistSongs).values({
            id: randomUUID(),
            playlistId: playlistData.id,
            songId: playlistData.songs[i].id,
            position: i + 1,
          });
        }
      }
    }
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    // Delete playlist songs first
    await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, playlistId));
    
    // Delete playlist
    await db.delete(playlists).where(eq(playlists.id, playlistId));
  }

  async updatePlaylist(playlistId: string, updates: { name?: string; imageUrl?: string; description?: string }): Promise<Playlist | undefined> {
    const [updatedPlaylist] = await db
      .update(playlists)
      .set(updates)
      .where(eq(playlists.id, playlistId))
      .returning();
    return updatedPlaylist || undefined;
  }

  // Sync playlist song counts with actual song count in database
  async syncPlaylistSongCounts(): Promise<void> {
    const allPlaylists = await this.getPlaylists();
    
    for (const playlist of allPlaylists) {
      // Count actual songs in playlist
      const actualSongCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(playlistSongs)
        .where(eq(playlistSongs.playlistId, playlist.id));
      
      const actualCount = actualSongCount[0]?.count || 0;
      
      // Update if different
      if (playlist.songCount !== actualCount) {
        await db
          .update(playlists)
          .set({ songCount: actualCount })
          .where(eq(playlists.id, playlist.id));
      }
    }
  }

  // Remove empty playlists
  async removeEmptyPlaylists(): Promise<void> {
    const allPlaylists = await this.getPlaylists();
    const defaultPlaylistIds = ['discover-weekly', 'daily-mix-1', 'chill-ambient', 'electronic-energy', 'purple-vibes', 'top-hits'];
    
    for (const playlist of allPlaylists) {
      // Only remove empty playlists that are NOT default playlists, NOT daily-mix playlists,
      // and NOT user-created playlists (those with UUID format)
      const isDefaultPlaylist = defaultPlaylistIds.includes(playlist.id);
      const isDailyMix = playlist.id.startsWith('daily-mix');
      const isUserCreated = playlist.id.includes('-'); // UUIDs contain dashes
      
      if (playlist.songCount === 0 && !isDefaultPlaylist && !isDailyMix && !isUserCreated) {
        // Check if playlist is referenced in library_playlists before deleting
        const [libraryRef] = await db
          .select()
          .from(libraryPlaylists)
          .where(eq(libraryPlaylists.playlistId, playlist.id))
          .limit(1);
          
        // Only delete if not referenced in library
        if (!libraryRef) {
          await this.deletePlaylist(playlist.id);
        }
      }
    }
  }

  // Liked Playlists
  async getLikedPlaylists(userId: string): Promise<PlaylistWithDetails[]> {
    const likedPlaylistsData = await db
      .select({
        playlist: playlists,
      })
      .from(likedPlaylists)
      .innerJoin(playlists, eq(likedPlaylists.playlistId, playlists.id))
      .where(eq(likedPlaylists.userId, userId));

    const result: PlaylistWithDetails[] = [];
    for (const item of likedPlaylistsData) {
      const playlistWithSongs = await this.getPlaylistWithSongs(item.playlist.id);
      if (playlistWithSongs) {
        result.push(playlistWithSongs);
      }
    }
    return result;
  }

  async likePlaylist(playlistId: string, userId: string): Promise<void> {
    await db.insert(likedPlaylists).values({
      id: randomUUID(),
      playlistId,
      userId,
    });
  }

  async unlikePlaylist(playlistId: string, userId: string): Promise<void> {
    await db.delete(likedPlaylists)
      .where(sql`${likedPlaylists.playlistId} = ${playlistId} AND ${likedPlaylists.userId} = ${userId}`);
  }

  async isPlaylistLiked(playlistId: string, userId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(likedPlaylists)
      .where(sql`${likedPlaylists.playlistId} = ${playlistId} AND ${likedPlaylists.userId} = ${userId}`);
    return !!result;
  }

  // Library Playlists
  async getLibraryPlaylists(userId: string): Promise<PlaylistWithDetails[]> {
    const libraryPlaylistsData = await db
      .select({
        playlist: playlists,
      })
      .from(libraryPlaylists)
      .innerJoin(playlists, eq(libraryPlaylists.playlistId, playlists.id))
      .where(eq(libraryPlaylists.userId, userId));

    const result: PlaylistWithDetails[] = [];
    for (const item of libraryPlaylistsData) {
      const playlistWithSongs = await this.getPlaylistWithSongs(item.playlist.id);
      if (playlistWithSongs) {
        result.push(playlistWithSongs);
      }
    }
    return result;
  }

  async addPlaylistToLibrary(playlistId: string, userId: string): Promise<void> {
    await db.insert(libraryPlaylists).values({
      id: randomUUID(),
      playlistId,
      userId,
    });
  }

  async removePlaylistFromLibrary(playlistId: string, userId: string): Promise<void> {
    await db.delete(libraryPlaylists)
      .where(sql`${libraryPlaylists.playlistId} = ${playlistId} AND ${libraryPlaylists.userId} = ${userId}`);
  }

  async isPlaylistInLibrary(playlistId: string, userId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(libraryPlaylists)
      .where(sql`${libraryPlaylists.playlistId} = ${playlistId} AND ${libraryPlaylists.userId} = ${userId}`);
    return !!result;
  }

  // Admin Functions
  async getAllProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles).orderBy(desc(profiles.createdAt));
  }

  async upsertUser(user: { id: string; username: string; isPremium?: boolean }): Promise<Profile> {
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    
    if (existingProfile) {
      // Update existing profile
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          name: user.username,
          updatedAt: new Date()
        })
        .where(eq(profiles.userId, user.id))
        .returning();
      return updatedProfile;
    } else {
      // Create new profile
      const [newProfile] = await db
        .insert(profiles)
        .values({
          userId: user.id,  // Set userId for Pi Network authentication
          name: user.username,
          nickname: user.username
        })
        .returning();
      
      // Also create membership
      await this.createMembership({
        id: randomUUID(),
        userId: user.id,
        isPremium: user.isPremium || false,
        subscriptionType: 'free',
        piPaymentId: null
      });
      
      return newProfile;
    }
  }

  async getAllMemberships(): Promise<Membership[]> {
    return await db.select().from(memberships).orderBy(desc(memberships.updatedAt));
  }
}

export const storage = new DatabaseStorage();