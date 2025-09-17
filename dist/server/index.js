var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";
import path3, { dirname } from "path";
import { fileURLToPath } from "url";
import fs2 from "fs";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  albums: () => albums,
  ambientMusicSettings: () => ambientMusicSettings,
  artists: () => artists,
  insertAlbumSchema: () => insertAlbumSchema,
  insertAmbientMusicSettingSchema: () => insertAmbientMusicSettingSchema,
  insertArtistSchema: () => insertArtistSchema,
  insertLibraryPlaylistSchema: () => insertLibraryPlaylistSchema,
  insertLikedPlaylistSchema: () => insertLikedPlaylistSchema,
  insertLikedSongSchema: () => insertLikedSongSchema,
  insertMembershipSchema: () => insertMembershipSchema,
  insertPiPaymentSchema: () => insertPiPaymentSchema,
  insertPlaylistSchema: () => insertPlaylistSchema,
  insertPlaylistSongSchema: () => insertPlaylistSongSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertSongSchema: () => insertSongSchema,
  libraryPlaylists: () => libraryPlaylists,
  likedPlaylists: () => likedPlaylists,
  likedSongs: () => likedSongs,
  memberships: () => memberships,
  piPayments: () => piPayments,
  playlistSongs: () => playlistSongs,
  playlists: () => playlists,
  profiles: () => profiles,
  songs: () => songs
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  isPremium: boolean("is_premium").default(false),
  expiresAt: timestamp("expires_at"),
  paymentId: text("payment_id"),
  txid: text("txid"),
  piWalletId: text("pi_wallet_id"),
  // Track which Pi wallet made the payment
  amount: text("amount").default("3.14"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var piPayments = pgTable("pi_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: text("payment_id").notNull().unique(),
  userId: text("user_id").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull().default("created"),
  // created, approved, completed, cancelled, failed
  txid: text("txid"),
  metadata: text("metadata"),
  // JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow()
});
var albums = pgTable("albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artistId: varchar("artist_id").references(() => artists.id).notNull(),
  imageUrl: text("image_url"),
  releaseDate: timestamp("release_date"),
  genre: text("genre"),
  createdAt: timestamp("created_at").defaultNow()
});
var songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artistId: varchar("artist_id").references(() => artists.id).notNull(),
  albumId: varchar("album_id").references(() => albums.id),
  duration: integer("duration").notNull(),
  // in seconds
  audioUrl: text("audio_url"),
  imageUrl: text("image_url"),
  genre: text("genre"),
  trackNumber: integer("track_number"),
  playCount: integer("play_count").default(0),
  lastPlayed: timestamp("last_played"),
  createdAt: timestamp("created_at").defaultNow()
});
var playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isPublic: boolean("is_public").default(true),
  songCount: integer("song_count").default(0),
  createdBy: text("created_by").notNull().default("demo-user-123"),
  createdAt: timestamp("created_at").defaultNow()
});
var playlistSongs = pgTable("playlist_songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id).notNull(),
  songId: varchar("song_id").references(() => songs.id).notNull(),
  position: integer("position").notNull(),
  addedAt: timestamp("added_at").defaultNow()
});
var likedSongs = pgTable("liked_songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  songId: varchar("song_id").references(() => songs.id).notNull(),
  likedAt: timestamp("liked_at").defaultNow()
});
var likedPlaylists = pgTable("liked_playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id).notNull(),
  userId: text("user_id").notNull().default("demo-user-123"),
  likedAt: timestamp("liked_at").defaultNow()
});
var libraryPlaylists = pgTable("library_playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id).notNull(),
  userId: text("user_id").notNull().default("demo-user-123"),
  addedAt: timestamp("added_at").defaultNow()
});
var profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(),
  name: text("name").notNull(),
  nickname: text("nickname"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
  createdAt: true
});
var insertAlbumSchema = createInsertSchema(albums).omit({
  id: true,
  createdAt: true
});
var insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
  playCount: true
});
var insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
  songCount: true
});
var insertPlaylistSongSchema = createInsertSchema(playlistSongs).omit({
  id: true,
  addedAt: true
});
var insertLikedSongSchema = createInsertSchema(likedSongs).omit({
  id: true,
  likedAt: true
});
var insertLikedPlaylistSchema = createInsertSchema(likedPlaylists).omit({
  id: true,
  likedAt: true
});
var insertLibraryPlaylistSchema = createInsertSchema(libraryPlaylists).omit({
  id: true,
  addedAt: true
});
var insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPiPaymentSchema = createInsertSchema(piPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var ambientMusicSettings = pgTable("ambient_music_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").notNull().references(() => playlists.id),
  theme: varchar("theme").notNull(),
  // cosmic, nature, urban, chill, energy
  mood: varchar("mood").notNull(),
  // peaceful, energetic, mysterious, melancholic
  tempo: integer("tempo").default(60),
  // BPM for ambient generation
  intensity: integer("intensity").default(5),
  // 1-10 scale
  enabled: boolean("enabled").default(true),
  lastGenerated: timestamp("last_generated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertAmbientMusicSettingSchema = createInsertSchema(ambientMusicSettings).omit({
  id: true,
  createdAt: true,
  lastGenerated: true
});

// server/storage.ts
import { randomUUID } from "crypto";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, ilike, desc, sql as sql2, isNotNull, asc } from "drizzle-orm";
var DatabaseStorage = class {
  // Artists
  async getArtists() {
    return await db.select().from(artists);
  }
  async getArtist(id) {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist || void 0;
  }
  async createArtist(artist) {
    const [newArtist] = await db.insert(artists).values({
      ...artist,
      id: artist.id || randomUUID()
    }).returning();
    return newArtist;
  }
  // Albums
  async getAlbums() {
    return await db.select().from(albums);
  }
  async getAlbum(id) {
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album || void 0;
  }
  async getAlbumsByArtist(artistId) {
    return await db.select().from(albums).where(eq(albums.artistId, artistId));
  }
  async createAlbum(album) {
    const [newAlbum] = await db.insert(albums).values({
      ...album,
      id: album.id || randomUUID()
    }).returning();
    return newAlbum;
  }
  // Songs
  async getSongs() {
    return await db.select().from(songs);
  }
  async getSong(id) {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || void 0;
  }
  async getSongsByAlbum(albumId) {
    return await db.select().from(songs).where(eq(songs.albumId, albumId));
  }
  async getSongsByArtist(artistId) {
    return await db.select().from(songs).where(eq(songs.artistId, artistId));
  }
  async searchSongs(query) {
    const results = await db.select({
      song: songs,
      artist: artists,
      album: albums
    }).from(songs).innerJoin(artists, eq(songs.artistId, artists.id)).leftJoin(albums, eq(songs.albumId, albums.id)).where(ilike(songs.title, `%${query}%`));
    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || void 0
    }));
  }
  async searchPlaylists(query) {
    return await db.select().from(playlists).where(ilike(playlists.name, `%${query}%`));
  }
  async searchSongsByGenre(genre) {
    const results = await db.select({
      song: songs,
      artist: artists,
      album: albums
    }).from(songs).innerJoin(artists, eq(songs.artistId, artists.id)).leftJoin(albums, eq(songs.albumId, albums.id)).where(ilike(songs.genre, `%${genre}%`));
    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || void 0
    }));
  }
  async searchArtists(query) {
    return await db.select().from(artists).where(ilike(artists.name, `%${query}%`));
  }
  async getRecentlyPlayed() {
    const results = await db.select({
      song: songs,
      artist: artists,
      album: albums
    }).from(songs).innerJoin(artists, eq(songs.artistId, artists.id)).leftJoin(albums, eq(songs.albumId, albums.id)).where(isNotNull(songs.lastPlayed)).orderBy(desc(songs.lastPlayed)).limit(8);
    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || void 0
    }));
  }
  async getTrendingSongs() {
    const results = await db.select({
      song: songs,
      artist: artists,
      album: albums
    }).from(songs).innerJoin(artists, eq(songs.artistId, artists.id)).leftJoin(albums, eq(songs.albumId, albums.id)).orderBy(desc(songs.playCount)).limit(15);
    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || void 0
    }));
  }
  async getAvailableGenres() {
    const results = await db.selectDistinct({ genre: songs.genre }).from(songs).where(isNotNull(songs.genre)).orderBy(asc(songs.genre));
    return results.map((row) => row.genre);
  }
  async createSong(song) {
    const [newSong] = await db.insert(songs).values({
      ...song,
      id: song.id || randomUUID()
    }).returning();
    return newSong;
  }
  async incrementPlayCount(songId) {
    await db.update(songs).set({
      playCount: sql2`${songs.playCount} + 1`,
      lastPlayed: /* @__PURE__ */ new Date()
    }).where(eq(songs.id, songId));
  }
  // Playlists
  async getPlaylists() {
    return await db.select().from(playlists);
  }
  async getPlaylist(id) {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist || void 0;
  }
  async getUserPlaylists(userId) {
    return await db.select().from(playlists).where(eq(playlists.createdBy, userId));
  }
  async getPlaylistWithSongs(id) {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    if (!playlist) return void 0;
    const playlistSongsResult = await db.select({
      playlistSong: playlistSongs,
      song: songs,
      artist: artists,
      album: albums
    }).from(playlistSongs).innerJoin(songs, eq(playlistSongs.songId, songs.id)).innerJoin(artists, eq(songs.artistId, artists.id)).leftJoin(albums, eq(songs.albumId, albums.id)).where(eq(playlistSongs.playlistId, id)).orderBy(playlistSongs.position);
    const songsWithDetails = playlistSongsResult.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || void 0
    }));
    return {
      ...playlist,
      songs: songsWithDetails
    };
  }
  async createPlaylist(playlist) {
    const [newPlaylist] = await db.insert(playlists).values({
      ...playlist,
      id: randomUUID()
    }).returning();
    return newPlaylist;
  }
  async addSongToPlaylist(data) {
    const [playlistSong] = await db.insert(playlistSongs).values({
      ...data,
      id: randomUUID()
    }).returning();
    await db.update(playlists).set({
      songCount: sql2`${playlists.songCount} + 1`
    }).where(eq(playlists.id, data.playlistId));
    return playlistSong;
  }
  async removeSongFromPlaylist(playlistId, songId) {
    await db.delete(playlistSongs).where(
      sql2`${playlistSongs.playlistId} = ${playlistId} AND ${playlistSongs.songId} = ${songId}`
    );
    await db.update(playlists).set({
      songCount: sql2`GREATEST(0, ${playlists.songCount} - 1)`
    }).where(eq(playlists.id, playlistId));
  }
  // Liked Songs
  async getLikedSongs() {
    const results = await db.select({
      song: songs,
      artist: artists,
      album: albums
    }).from(likedSongs).innerJoin(songs, eq(likedSongs.songId, songs.id)).innerJoin(artists, eq(songs.artistId, artists.id)).leftJoin(albums, eq(songs.albumId, albums.id)).orderBy(desc(likedSongs.likedAt));
    return results.map(({ song, artist, album }) => ({
      ...song,
      artist,
      album: album || void 0
    }));
  }
  async likeSong(data) {
    const [likedSong] = await db.insert(likedSongs).values({
      ...data,
      id: randomUUID()
    }).returning();
    return likedSong;
  }
  async unlikeSong(songId) {
    await db.delete(likedSongs).where(eq(likedSongs.songId, songId));
  }
  async isSongLiked(songId) {
    const [liked] = await db.select().from(likedSongs).where(eq(likedSongs.songId, songId));
    return !!liked;
  }
  // User Profile
  async getUserProfile(userId) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || void 0;
  }
  async updateUserProfile(userId, data) {
    const existingProfile = await this.getUserProfile(userId);
    if (!existingProfile) {
      const newProfile = await this.createUserProfile({
        userId,
        name: data.name || "PurpleBeats User",
        nickname: data.nickname,
        imageUrl: data.imageUrl
      });
      return newProfile;
    }
    const [updatedProfile] = await db.update(profiles).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(profiles.userId, userId)).returning();
    return updatedProfile || void 0;
  }
  async createUserProfile(profile) {
    const [newProfile] = await db.insert(profiles).values({
      ...profile,
      id: randomUUID()
    }).returning();
    return newProfile;
  }
  // Memberships
  async getMembership(userId) {
    const [membership] = await db.select().from(memberships).where(eq(memberships.userId, userId));
    return membership || void 0;
  }
  async createMembership(membership) {
    const [newMembership] = await db.insert(memberships).values({
      ...membership,
      id: randomUUID()
    }).returning();
    return newMembership;
  }
  async updateMembership(userId, updates) {
    const [updatedMembership] = await db.update(memberships).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(memberships.userId, userId)).returning();
    return updatedMembership || void 0;
  }
  // Pi Payments
  async createPiPayment(payment) {
    const [newPayment] = await db.insert(piPayments).values({
      ...payment,
      id: randomUUID()
    }).returning();
    return newPayment;
  }
  async getPiPayment(paymentId) {
    const [payment] = await db.select().from(piPayments).where(eq(piPayments.paymentId, paymentId));
    return payment || void 0;
  }
  async updatePiPayment(paymentId, updates) {
    const [updatedPayment] = await db.update(piPayments).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(piPayments.paymentId, paymentId)).returning();
    return updatedPayment || void 0;
  }
  async getPiPaymentsByUser(userId) {
    return await db.select().from(piPayments).where(eq(piPayments.userId, userId));
  }
  // Ambient Music
  async generateAmbientForPlaylist(playlistId) {
    const [ambientSetting] = await db.insert(ambientMusicSettings).values({
      id: randomUUID(),
      playlistId,
      theme: "cosmic",
      mood: "peaceful",
      tempo: 60,
      intensity: 5,
      enabled: true
    }).returning();
    return ambientSetting;
  }
  async getAmbientSetting(playlistId) {
    const [setting] = await db.select().from(ambientMusicSettings).where(eq(ambientMusicSettings.playlistId, playlistId));
    return setting || void 0;
  }
  async updateAmbientSetting(settingId, updates) {
    const [updatedSetting] = await db.update(ambientMusicSettings).set({
      ...updates,
      lastGenerated: /* @__PURE__ */ new Date()
    }).where(eq(ambientMusicSettings.id, settingId)).returning();
    return updatedSetting || void 0;
  }
  // Daily Mix Generation
  async generateDailyMix(forceRefresh = false) {
    const DAILY_MIX_ID = "daily-mix-1";
    const existingPlaylist = await this.getPlaylist(DAILY_MIX_ID);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    if (existingPlaylist && !forceRefresh) {
      const playlistDate = existingPlaylist.createdAt ? new Date(existingPlaylist.createdAt) : /* @__PURE__ */ new Date();
      playlistDate.setHours(0, 0, 0, 0);
      if (playlistDate.getTime() === today.getTime()) {
        return existingPlaylist;
      }
    }
    const allSongs = await this.getSongs();
    if (allSongs.length === 0) {
      throw new Error("No songs available for Daily Mix");
    }
    const shuffled = allSongs.sort(() => Math.random() - 0.5);
    const selectedSongs = shuffled.slice(0, Math.min(15, allSongs.length));
    if (existingPlaylist) {
      await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, DAILY_MIX_ID));
      const [updatedPlaylist] = await db.update(playlists).set({
        songCount: selectedSongs.length,
        createdAt: /* @__PURE__ */ new Date()
      }).where(eq(playlists.id, DAILY_MIX_ID)).returning();
      for (let i = 0; i < selectedSongs.length; i++) {
        await db.insert(playlistSongs).values({
          id: randomUUID(),
          playlistId: DAILY_MIX_ID,
          songId: selectedSongs[i].id,
          position: i + 1
        });
      }
      return updatedPlaylist;
    } else {
      const [newPlaylist] = await db.insert(playlists).values({
        id: DAILY_MIX_ID,
        name: "Daily Mix 1",
        description: "Electronic and Synthpop favorites",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        isPublic: true,
        songCount: selectedSongs.length
      }).returning();
      for (let i = 0; i < selectedSongs.length; i++) {
        await db.insert(playlistSongs).values({
          id: randomUUID(),
          playlistId: DAILY_MIX_ID,
          songId: selectedSongs[i].id,
          position: i + 1
        });
      }
      return newPlaylist;
    }
  }
  // Initialize default playlists if they don't exist
  async initializeDefaultPlaylists() {
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
        await db.insert(playlists).values({
          id: playlistData.id,
          name: playlistData.name,
          description: playlistData.description,
          imageUrl: playlistData.imageUrl,
          isPublic: true,
          songCount: playlistData.songs.length,
          createdBy: "demo-user-123"
        });
        for (let i = 0; i < playlistData.songs.length; i++) {
          await db.insert(playlistSongs).values({
            id: randomUUID(),
            playlistId: playlistData.id,
            songId: playlistData.songs[i].id,
            position: i + 1
          });
        }
      }
    }
  }
  async deletePlaylist(playlistId) {
    await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, playlistId));
    await db.delete(playlists).where(eq(playlists.id, playlistId));
  }
  async updatePlaylist(playlistId, updates) {
    const [updatedPlaylist] = await db.update(playlists).set(updates).where(eq(playlists.id, playlistId)).returning();
    return updatedPlaylist || void 0;
  }
  // Sync playlist song counts with actual song count in database
  async syncPlaylistSongCounts() {
    const allPlaylists = await this.getPlaylists();
    for (const playlist of allPlaylists) {
      const actualSongCount = await db.select({ count: sql2`COUNT(*)` }).from(playlistSongs).where(eq(playlistSongs.playlistId, playlist.id));
      const actualCount = actualSongCount[0]?.count || 0;
      if (playlist.songCount !== actualCount) {
        await db.update(playlists).set({ songCount: actualCount }).where(eq(playlists.id, playlist.id));
      }
    }
  }
  // Remove empty playlists
  async removeEmptyPlaylists() {
    const allPlaylists = await this.getPlaylists();
    const defaultPlaylistIds = ["discover-weekly", "daily-mix-1", "chill-ambient", "electronic-energy", "purple-vibes", "top-hits"];
    for (const playlist of allPlaylists) {
      const isDefaultPlaylist = defaultPlaylistIds.includes(playlist.id);
      const isDailyMix = playlist.id.startsWith("daily-mix");
      const isUserCreated = playlist.id.includes("-");
      if (playlist.songCount === 0 && !isDefaultPlaylist && !isDailyMix && !isUserCreated) {
        const [libraryRef] = await db.select().from(libraryPlaylists).where(eq(libraryPlaylists.playlistId, playlist.id)).limit(1);
        if (!libraryRef) {
          await this.deletePlaylist(playlist.id);
        }
      }
    }
  }
  // Liked Playlists
  async getLikedPlaylists(userId) {
    const likedPlaylistsData = await db.select({
      playlist: playlists
    }).from(likedPlaylists).innerJoin(playlists, eq(likedPlaylists.playlistId, playlists.id)).where(eq(likedPlaylists.userId, userId));
    const result = [];
    for (const item of likedPlaylistsData) {
      const playlistWithSongs = await this.getPlaylistWithSongs(item.playlist.id);
      if (playlistWithSongs) {
        result.push(playlistWithSongs);
      }
    }
    return result;
  }
  async likePlaylist(playlistId, userId) {
    await db.insert(likedPlaylists).values({
      id: randomUUID(),
      playlistId,
      userId
    });
  }
  async unlikePlaylist(playlistId, userId) {
    await db.delete(likedPlaylists).where(sql2`${likedPlaylists.playlistId} = ${playlistId} AND ${likedPlaylists.userId} = ${userId}`);
  }
  async isPlaylistLiked(playlistId, userId) {
    const [result] = await db.select().from(likedPlaylists).where(sql2`${likedPlaylists.playlistId} = ${playlistId} AND ${likedPlaylists.userId} = ${userId}`);
    return !!result;
  }
  // Library Playlists
  async getLibraryPlaylists(userId) {
    const libraryPlaylistsData = await db.select({
      playlist: playlists
    }).from(libraryPlaylists).innerJoin(playlists, eq(libraryPlaylists.playlistId, playlists.id)).where(eq(libraryPlaylists.userId, userId));
    const result = [];
    for (const item of libraryPlaylistsData) {
      const playlistWithSongs = await this.getPlaylistWithSongs(item.playlist.id);
      if (playlistWithSongs) {
        result.push(playlistWithSongs);
      }
    }
    return result;
  }
  async addPlaylistToLibrary(playlistId, userId) {
    await db.insert(libraryPlaylists).values({
      id: randomUUID(),
      playlistId,
      userId
    });
  }
  async removePlaylistFromLibrary(playlistId, userId) {
    await db.delete(libraryPlaylists).where(sql2`${libraryPlaylists.playlistId} = ${playlistId} AND ${libraryPlaylists.userId} = ${userId}`);
  }
  async isPlaylistInLibrary(playlistId, userId) {
    const [result] = await db.select().from(libraryPlaylists).where(sql2`${libraryPlaylists.playlistId} = ${playlistId} AND ${libraryPlaylists.userId} = ${userId}`);
    return !!result;
  }
  // Admin Functions
  async getAllProfiles() {
    return await db.select().from(profiles).orderBy(desc(profiles.createdAt));
  }
  async upsertUser(user) {
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    if (existingProfile) {
      const [updatedProfile] = await db.update(profiles).set({
        name: user.username,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(profiles.userId, user.id)).returning();
      return updatedProfile;
    } else {
      const [newProfile] = await db.insert(profiles).values({
        userId: user.id,
        // Set userId for Pi Network authentication
        name: user.username,
        nickname: user.username
      }).returning();
      await this.createMembership({
        id: randomUUID(),
        userId: user.id,
        isPremium: user.isPremium || false,
        subscriptionType: "free",
        piPaymentId: null
      });
      return newProfile;
    }
  }
  async getAllMemberships() {
    return await db.select().from(memberships).orderBy(desc(memberships.updatedAt));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/pi-config", (req, res) => {
    const appId = process.env.PI_APP_ID || "purplebeats5173";
    console.log("\u2705 Providing Pi config to frontend, APP_ID:", appId);
    res.json({
      appId,
      environment: "production"
    });
  });
  app2.get("/api/artists", async (req, res) => {
    try {
      const artists2 = await storage.getArtists();
      res.json(artists2);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/artists/:id", async (req, res) => {
    try {
      const artist = await storage.getArtist(req.params.id);
      if (!artist) {
        return res.status(404).json({ error: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/artists", async (req, res) => {
    try {
      const result = insertArtistSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid artist data", details: result.error.errors });
      }
      const artist = await storage.createArtist(result.data);
      res.status(201).json(artist);
    } catch (error) {
      console.error("Error creating artist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/albums", async (req, res) => {
    try {
      const albums2 = await storage.getAlbums();
      res.json(albums2);
    } catch (error) {
      console.error("Error fetching albums:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/albums/:id", async (req, res) => {
    try {
      const album = await storage.getAlbum(req.params.id);
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }
      res.json(album);
    } catch (error) {
      console.error("Error fetching album:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/albums/artist/:artistId", async (req, res) => {
    try {
      const albums2 = await storage.getAlbumsByArtist(req.params.artistId);
      res.json(albums2);
    } catch (error) {
      console.error("Error fetching artist albums:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/albums", async (req, res) => {
    try {
      const result = insertAlbumSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid album data", details: result.error.errors });
      }
      const album = await storage.createAlbum(result.data);
      res.status(201).json(album);
    } catch (error) {
      console.error("Error creating album:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/songs", async (req, res) => {
    try {
      const songs2 = await storage.getSongs();
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/songs/trending", async (req, res) => {
    try {
      const songs2 = await storage.getTrendingSongs();
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching trending songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/songs/recently-played", async (req, res) => {
    try {
      const songs2 = await storage.getRecentlyPlayed();
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching recently played songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/songs/:id", async (req, res) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      console.error("Error fetching song:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/songs/album/:albumId", async (req, res) => {
    try {
      const songs2 = await storage.getSongsByAlbum(req.params.albumId);
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching album songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/songs/artist/:artistId", async (req, res) => {
    try {
      const songs2 = await storage.getSongsByArtist(req.params.artistId);
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching artist songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/songs", async (req, res) => {
    try {
      const result = insertSongSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid song data", details: result.error.errors });
      }
      const song = await storage.createSong(result.data);
      res.status(201).json(song);
    } catch (error) {
      console.error("Error creating song:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/songs/:id/play", async (req, res) => {
    try {
      await storage.incrementPlayCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing play count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/search/songs", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const songs2 = await storage.searchSongs(query);
      res.json(songs2);
    } catch (error) {
      console.error("Error searching songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/search/playlists", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const playlists2 = await storage.searchPlaylists(query);
      res.json(playlists2);
    } catch (error) {
      console.error("Error searching playlists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/search/artists", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const artists2 = await storage.searchArtists(query);
      res.json(artists2);
    } catch (error) {
      console.error("Error searching artists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/search/genres/:genre", async (req, res) => {
    try {
      const songs2 = await storage.searchSongsByGenre(req.params.genre);
      res.json(songs2);
    } catch (error) {
      console.error("Error searching songs by genre:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/genres", async (req, res) => {
    try {
      const genres = await storage.getAvailableGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/playlists", async (req, res) => {
    try {
      const playlists2 = await storage.getPlaylists();
      res.json(playlists2);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/playlists/:id", async (req, res) => {
    try {
      const playlist = await storage.getPlaylistWithSongs(req.params.id);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/playlists/user/:userId", async (req, res) => {
    try {
      const playlists2 = await storage.getUserPlaylists(req.params.userId);
      res.json(playlists2);
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/playlists", async (req, res) => {
    try {
      const result = insertPlaylistSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid playlist data", details: result.error.errors });
      }
      const playlist = await storage.createPlaylist(result.data);
      res.status(201).json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/playlists/:playlistId/songs", async (req, res) => {
    try {
      const result = insertPlaylistSongSchema.safeParse({
        ...req.body,
        playlistId: req.params.playlistId
      });
      if (!result.success) {
        return res.status(400).json({ error: "Invalid playlist song data", details: result.error.errors });
      }
      const playlistSong = await storage.addSongToPlaylist(result.data);
      res.status(201).json(playlistSong);
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/playlists/:playlistId/songs/:songId", async (req, res) => {
    try {
      await storage.removeSongFromPlaylist(req.params.playlistId, req.params.songId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/playlists/:playlistId", async (req, res) => {
    try {
      await storage.deletePlaylist(req.params.playlistId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/playlists/:playlistId", async (req, res) => {
    try {
      const updates = {
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        description: req.body.description
      };
      const playlist = await storage.updatePlaylist(req.params.playlistId, updates);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      console.error("Error updating playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/liked-songs", async (req, res) => {
    try {
      const songs2 = await storage.getLikedSongs();
      res.json(songs2);
    } catch (error) {
      console.error("Error fetching liked songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/liked-songs/:songId/check", async (req, res) => {
    try {
      const isLiked = await storage.isSongLiked(req.params.songId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking if song is liked:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/liked-songs", async (req, res) => {
    try {
      const result = insertLikedSongSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid liked song data", details: result.error.errors });
      }
      const likedSong = await storage.likeSong(result.data);
      res.status(201).json(likedSong);
    } catch (error) {
      console.error("Error liking song:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/liked-songs/:songId", async (req, res) => {
    try {
      await storage.unlikeSong(req.params.songId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking song:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/liked-playlists/:playlistId/check", async (req, res) => {
    try {
      const userId = req.query.userId || "demo-user-123";
      const isLiked = await storage.isPlaylistLiked(req.params.playlistId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking if playlist is liked:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/liked-playlists/:playlistId", async (req, res) => {
    try {
      const userId = req.body.userId || "demo-user-123";
      await storage.likePlaylist(req.params.playlistId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/liked-playlists/:playlistId", async (req, res) => {
    try {
      const userId = req.body.userId || "demo-user-123";
      await storage.unlikePlaylist(req.params.playlistId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/library-playlists/:playlistId/check", async (req, res) => {
    try {
      const userId = req.query.userId || "demo-user-123";
      const playlists2 = await storage.getLibraryPlaylists(userId);
      const isInLibrary = playlists2.some((p) => p.id === req.params.playlistId);
      res.json({ isInLibrary });
    } catch (error) {
      console.error("Error checking if playlist is in library:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/library-playlists/:playlistId", async (req, res) => {
    try {
      const userId = req.body.userId || "demo-user-123";
      await storage.addPlaylistToLibrary(req.params.playlistId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding playlist to library:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/library-playlists/:playlistId", async (req, res) => {
    try {
      const userId = req.body.userId || "demo-user-123";
      await storage.removePlaylistFromLibrary(req.params.playlistId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing playlist from library:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.updateProfile(req.params.userId, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/membership/:userId", async (req, res) => {
    try {
      const membership = await storage.getMembership(req.params.userId);
      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }
      res.json(membership);
    } catch (error) {
      console.error("Error fetching membership:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/membership/:userId", async (req, res) => {
    try {
      const membership = await storage.updateMembership(req.params.userId, req.body);
      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }
      res.json(membership);
    } catch (error) {
      console.error("Error updating membership:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAdminUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/registrations", async (req, res) => {
    try {
      const profiles2 = await storage.getAllProfiles();
      const registrationsByDate = {};
      profiles2.forEach((profile) => {
        const date = new Date(profile.createdAt).toISOString().split("T")[0];
        registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
      });
      const chartData = Object.entries(registrationsByDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching registration data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/me", async (req, res) => {
    res.status(401).json({ error: "Not authenticated" });
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.json({ success: true, message: "Successfully logged out" });
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express2();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const pathName = req.path;
  let capturedJsonResponse;
  const originalResJson = res.json.bind(res);
  res.json = (bodyJson, ...args) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };
  res.on("finish", () => {
    if (pathName.startsWith("/api")) {
      const duration = Date.now() - start;
      let line = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (line.length > 80) line = line.slice(0, 79) + "\u2026";
      log(line);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  const ROOT = path3.join(__dirname, "..");
  const PUBLIC_DIR = path3.join(ROOT, "public");
  const ASSETS_DIR = path3.join(ROOT, "attached_assets");
  app.use(express2.static(PUBLIC_DIR));
  app.use("/attached_assets", express2.static(ASSETS_DIR));
  app.get("/privacy", (_req, res) => {
    res.sendFile(path3.join(PUBLIC_DIR, "privacy", "index.html"));
  });
  app.get("/terms", (_req, res) => {
    res.sendFile(path3.join(PUBLIC_DIR, "terms", "index.html"));
  });
  app.get("/legal", (_req, res) => {
    res.sendFile(path3.join(PUBLIC_DIR, "legal", "index.html"));
  });
  app.get("/validation-key.txt", (_req, res) => {
    res.sendFile(path3.join(PUBLIC_DIR, "validation-key.txt"));
  });
  app.use((err, _req, res, _next) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    const clientDistPath = path3.join(__dirname, "..", "public");
    if (!fs2.existsSync(clientDistPath)) {
      throw new Error(
        `Could not find the build directory: ${clientDistPath}, make sure to build the client first`
      );
    }
    app.use(express2.static(clientDistPath));
    app.use("*", (_req, res) => {
      res.sendFile(path3.join(clientDistPath, "index.html"));
    });
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    { port, host: "0.0.0.0" },
    () => log(`serving on port ${port}`)
  );
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  process.env.PI_SKIP_VERIFY = process.env.PI_SKIP_VERIFY || "true";
  console.log("Server started with Pi API key:", process.env.PI_API_KEY ? "CONFIGURED" : "MISSING");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("PI_SKIP_VERIFY:", process.env.PI_SKIP_VERIFY);
})();
