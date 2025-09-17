import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Premium memberships - simplified for Pi Browser auto-profiles
export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  isPremium: boolean("is_premium").default(false),
  expiresAt: timestamp("expires_at"),
  paymentId: text("payment_id"),
  txid: text("txid"),
  piWalletId: text("pi_wallet_id"), // Track which Pi wallet made the payment
  amount: text("amount").default("3.14"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pi Network payments
export const piPayments = pgTable("pi_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: text("payment_id").notNull().unique(),
  userId: text("user_id").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull().default("created"), // created, approved, completed, cancelled, failed
  txid: text("txid"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const albums = pgTable("albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artistId: varchar("artist_id").references(() => artists.id).notNull(),
  imageUrl: text("image_url"),
  releaseDate: timestamp("release_date"),
  genre: text("genre"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artistId: varchar("artist_id").references(() => artists.id).notNull(),
  albumId: varchar("album_id").references(() => albums.id),
  duration: integer("duration").notNull(), // in seconds
  audioUrl: text("audio_url"),
  imageUrl: text("image_url"),
  genre: text("genre"),
  trackNumber: integer("track_number"),
  playCount: integer("play_count").default(0),
  lastPlayed: timestamp("last_played"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isPublic: boolean("is_public").default(true),
  songCount: integer("song_count").default(0),
  createdBy: text("created_by").notNull().default("demo-user-123"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlistSongs = pgTable("playlist_songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id).notNull(),
  songId: varchar("song_id").references(() => songs.id).notNull(),
  position: integer("position").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const likedSongs = pgTable("liked_songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  songId: varchar("song_id").references(() => songs.id).notNull(),
  likedAt: timestamp("liked_at").defaultNow(),
});

export const likedPlaylists = pgTable("liked_playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id).notNull(),
  userId: text("user_id").notNull().default("demo-user-123"),
  likedAt: timestamp("liked_at").defaultNow(),
});

export const libraryPlaylists = pgTable("library_playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id).notNull(),
  userId: text("user_id").notNull().default("demo-user-123"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(),
  name: text("name").notNull(),
  nickname: text("nickname"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// Insert schemas
export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
  createdAt: true,
});

export const insertAlbumSchema = createInsertSchema(albums).omit({
  id: true,
  createdAt: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
  playCount: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
  songCount: true,
});

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs).omit({
  id: true,
  addedAt: true,
});

export const insertLikedSongSchema = createInsertSchema(likedSongs).omit({
  id: true,
  likedAt: true,
});

export const insertLikedPlaylistSchema = createInsertSchema(likedPlaylists).omit({
  id: true,
  likedAt: true,
});

export const insertLibraryPlaylistSchema = createInsertSchema(libraryPlaylists).omit({
  id: true,
  addedAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPiPaymentSchema = createInsertSchema(piPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});


// Types
export type Artist = typeof artists.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Song = typeof songs.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type LikedSong = typeof likedSongs.$inferSelect;
export type LikedPlaylist = typeof likedPlaylists.$inferSelect;
export type LibraryPlaylist = typeof libraryPlaylists.$inferSelect;
export type Profile = typeof profiles.$inferSelect;

export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type InsertPlaylistSong = z.infer<typeof insertPlaylistSongSchema>;
export type InsertLikedSong = z.infer<typeof insertLikedSongSchema>;
export type InsertLikedPlaylist = z.infer<typeof insertLikedPlaylistSchema>;
export type InsertLibraryPlaylist = z.infer<typeof insertLibraryPlaylistSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Membership = typeof memberships.$inferSelect;
export type PiPayment = typeof piPayments.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type InsertPiPayment = z.infer<typeof insertPiPaymentSchema>;

// Extended types for API responses
export type SongWithDetails = Song & {
  artist: Artist;
  album?: Album;
  isLiked?: boolean;
};

export type AlbumWithDetails = Album & {
  artist: Artist;
  songs?: Song[];
};

export type PlaylistWithDetails = Playlist & {
  songs?: SongWithDetails[];
};

// Ambient Music Generation
export const ambientMusicSettings = pgTable("ambient_music_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").notNull().references(() => playlists.id),
  theme: varchar("theme").notNull(), // cosmic, nature, urban, chill, energy
  mood: varchar("mood").notNull(), // peaceful, energetic, mysterious, melancholic
  tempo: integer("tempo").default(60), // BPM for ambient generation
  intensity: integer("intensity").default(5), // 1-10 scale
  enabled: boolean("enabled").default(true),
  lastGenerated: timestamp("last_generated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAmbientMusicSettingSchema = createInsertSchema(ambientMusicSettings).omit({
  id: true,
  createdAt: true,
  lastGenerated: true,
});

export type AmbientMusicSetting = typeof ambientMusicSettings.$inferSelect;
export type InsertAmbientMusicSetting = z.infer<typeof insertAmbientMusicSettingSchema>;

export type PlaylistWithAmbient = PlaylistWithDetails & {
  ambientSetting?: AmbientMusicSetting;
};
