import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertSongSchema,
  insertPlaylistSchema,
  insertPlaylistSongSchema,
  insertLikedSongSchema,
  insertArtistSchema,
  insertAlbumSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========================================
  // Pi Network Configuration
  // ========================================
  
  app.get("/api/pi-config", (req, res) => {
    const appId = process.env.PI_APP_ID || "purplebeats5173";
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    
    console.log('✅ Providing Pi config to frontend, APP_ID:', appId, 'ENV:', environment);
    
    res.json({
      appId: appId,
      environment: environment
    });
  });

  // ========================================
  // Artists Routes
  // ========================================
  
  app.get("/api/artists", async (req, res) => {
    try {
      const artists = await storage.getArtists();
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/artists/:id", async (req, res) => {
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

  app.post("/api/artists", async (req, res) => {
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

  // ========================================
  // Albums Routes
  // ========================================
  
  app.get("/api/albums", async (req, res) => {
    try {
      const albums = await storage.getAlbums();
      res.json(albums);
    } catch (error) {
      console.error("Error fetching albums:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/albums/:id", async (req, res) => {
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

  app.get("/api/albums/artist/:artistId", async (req, res) => {
    try {
      const albums = await storage.getAlbumsByArtist(req.params.artistId);
      res.json(albums);
    } catch (error) {
      console.error("Error fetching artist albums:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/albums", async (req, res) => {
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

  // ========================================
  // Songs Routes
  // ========================================
  
  app.get("/api/songs", async (req, res) => {
    try {
      const songs = await storage.getSongs();
      res.json(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/songs/trending", async (req, res) => {
    try {
      const songs = await storage.getTrendingSongs();
      res.json(songs);
    } catch (error) {
      console.error("Error fetching trending songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/songs/recently-played", async (req, res) => {
    try {
      const songs = await storage.getRecentlyPlayed();
      res.json(songs);
    } catch (error) {
      console.error("Error fetching recently played songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/songs/:id", async (req, res) => {
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

  app.get("/api/songs/album/:albumId", async (req, res) => {
    try {
      const songs = await storage.getSongsByAlbum(req.params.albumId);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching album songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/songs/artist/:artistId", async (req, res) => {
    try {
      const songs = await storage.getSongsByArtist(req.params.artistId);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching artist songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/songs", async (req, res) => {
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

  app.post("/api/songs/:id/play", async (req, res) => {
    try {
      await storage.incrementPlayCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing play count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========================================
  // Search Routes
  // ========================================
  
  app.get("/api/search/songs", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const songs = await storage.searchSongs(query);
      res.json(songs);
    } catch (error) {
      console.error("Error searching songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/search/playlists", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const playlists = await storage.searchPlaylists(query);
      res.json(playlists);
    } catch (error) {
      console.error("Error searching playlists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/search/artists", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const artists = await storage.searchArtists(query);
      res.json(artists);
    } catch (error) {
      console.error("Error searching artists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/search/genres/:genre", async (req, res) => {
    try {
      const songs = await storage.searchSongsByGenre(req.params.genre);
      res.json(songs);
    } catch (error) {
      console.error("Error searching songs by genre:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/genres", async (req, res) => {
    try {
      const genres = await storage.getAvailableGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========================================
  // Playlists Routes
  // ========================================
  
  app.get("/api/playlists", async (req, res) => {
    try {
      const playlists = await storage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/playlists/:id", async (req, res) => {
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

  app.get("/api/playlists/user/:userId", async (req, res) => {
    try {
      const playlists = await storage.getUserPlaylists(req.params.userId);
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
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

  app.post("/api/playlists/:playlistId/songs", async (req, res) => {
    try {
      const result = insertPlaylistSongSchema.safeParse({
        ...req.body,
        playlistId: req.params.playlistId,
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

  app.delete("/api/playlists/:playlistId/songs/:songId", async (req, res) => {
    try {
      await storage.removeSongFromPlaylist(req.params.playlistId, req.params.songId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/playlists/:playlistId", async (req, res) => {
    try {
      await storage.deletePlaylist(req.params.playlistId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/playlists/:playlistId", async (req, res) => {
    try {
      const updates = {
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
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

  // ========================================
  // Liked Songs Routes
  // ========================================
  
  app.get("/api/liked-songs", async (req, res) => {
    try {
      const songs = await storage.getLikedSongs();
      res.json(songs);
    } catch (error) {
      console.error("Error fetching liked songs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/liked-songs/:songId/check", async (req, res) => {
    try {
      const isLiked = await storage.isSongLiked(req.params.songId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking if song is liked:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/liked-songs", async (req, res) => {
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

  app.delete("/api/liked-songs/:songId", async (req, res) => {
    try {
      await storage.unlikeSong(req.params.songId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking song:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========================================
  // Liked Playlists Routes
  // ========================================
  
  app.get("/api/liked-playlists/:playlistId/check", async (req, res) => {
    try {
      const userId = req.query.userId as string || "demo-user-123";
      const isLiked = await storage.isPlaylistLiked(req.params.playlistId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking if playlist is liked:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/liked-playlists/:playlistId", async (req, res) => {
    try {
      const userId = req.body.userId || "demo-user-123";
      await storage.likePlaylist(req.params.playlistId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/liked-playlists/:playlistId", async (req, res) => {
    try {
      const userId = req.body.userId || "demo-user-123";
      await storage.unlikePlaylist(req.params.playlistId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========================================
  // Library Playlists Routes
  // ========================================
  
  app.get("/api/library-playlists/:playlistId/check", async (req, res) => {
    try {
      const userId = req.query.userId as string || "demo-user-123";
      const playlists = await storage.getLibraryPlaylists(userId);
      const isInLibrary = playlists.some(p => p.id === req.params.playlistId);
      res.json({ isInLibrary });
    } catch (error) {
      console.error("Error checking if playlist is in library:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/library-playlists/:playlistId", async (req, res) => {
    try {
      const userId = req.body.userId || "demo-user-123";
      await storage.addPlaylistToLibrary(req.params.playlistId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding playlist to library:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/library-playlists/:playlistId", async (req, res) => {
    try {
      const userId = req.body.userId || "demo-user-123";
      await storage.removePlaylistFromLibrary(req.params.playlistId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing playlist from library:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========================================
  // Profile Routes
  // ========================================
  
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.updateUserProfile(req.params.userId, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========================================
  // Membership Routes
  // ========================================
  
  app.get("/api/membership/:userId", async (req, res) => {
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

  app.put("/api/membership/:userId", async (req, res) => {
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

  // ========================================
  // Admin Routes
  // ========================================
  
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAdminUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/registrations", async (req, res) => {
    try {
      const profiles = await storage.getAllProfiles();
      
      // Group by date for chart data
      const registrationsByDate: Record<string, number> = {};
      profiles.forEach((profile: any) => {
        const date = new Date(profile.createdAt).toISOString().split('T')[0];
        registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
      });

      // Convert to array format for charts
      const chartData = Object.entries(registrationsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      res.json(chartData);
    } catch (error) {
      console.error("Error fetching registration data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========================================
  // Authentication Routes (Simple demo)
  // ========================================
  
  app.post("/api/auth/pi-login", async (req, res) => {
    try {
      const { accessToken, user } = req.body;
      
      // Validate the Pi authentication data
      if (!accessToken || !user || !user.uid || !user.username) {
        return res.status(400).json({ 
          error: "Invalid Pi authentication data. Missing access token or user information." 
        });
      }
      
      console.log("✅ Pi login request received for user:", user.username, "UID:", user.uid);
      
      // Verify the user's access token with Pi Platform API
      try {
        const piApiUrl = process.env.PI_ENVIRONMENT === 'production' 
          ? 'https://api.minepi.com' 
          : 'https://api.minepi.com'; // Pi uses same endpoint for production
          
        const verifyResponse = await fetch(`${piApiUrl}/v2/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!verifyResponse.ok) {
          console.error("❌ Pi token verification failed:", verifyResponse.status);
          return res.status(401).json({ error: "Invalid access token" });
        }
        
        const verifiedUser = await verifyResponse.json();
        console.log("✅ Token verified with Pi Platform:", verifiedUser);
        
        // Ensure the user data matches
        if (verifiedUser.uid !== user.uid) {
          console.error("❌ User UID mismatch between token and provided data");
          return res.status(401).json({ error: "Token and user data mismatch" });
        }

      } catch (verifyError) {
        console.error("❌ Pi token verification error:", verifyError);
        return res.status(401).json({ error: "Token verification failed" });
      }
      
      // Create or update user profile in the system
      const userProfile = await storage.upsertUser({
        id: user.uid,
        username: user.username,
        isPremium: false
      });
      
      console.log("✅ User profile created/updated:", userProfile);
      
      // Return success response with user data
      res.json({
        success: true,
        message: "Pi authentication successful",
        user: {
          uid: user.uid,
          username: user.username,
          profile: userProfile
        }
      });
      
    } catch (error) {
      console.error("❌ Pi authentication error:", error);
      res.status(500).json({ error: "Pi authentication failed" });
    }
  });
  
  app.get("/api/me", async (req, res) => {
    // For demo purposes, always return not authenticated
    res.status(401).json({ error: "Not authenticated" });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true, message: "Successfully logged out" });
  });

  // ========================================
  // Health Check
  // ========================================
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  const httpServer = createServer(app);
  return httpServer;
}