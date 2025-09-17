// Quick test to add CC music directly
import { storage } from "./server/storage.js";

async function testAddMusic() {
  try {
    console.log("🎵 Testing Creative Commons music addition...");
    
    // Test adding one artist
    const testArtist = {
      id: "test-artist-kevin",
      name: "Kevin MacLeod (Test)",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop"
    };
    
    const artist = await storage.createArtist(testArtist);
    console.log("✅ Added artist:", artist);
    
    console.log("✅ Test successful! Database is working.");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testAddMusic();