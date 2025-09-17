import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { advancedPiStorage } from "@/lib/advanced-storage";
import { initPiSDK, authenticate } from "@/lib/piAuth";
import type { AuthResult, PaymentDTO } from "@/types/pi";

interface AuthUser {
  uid: string;
  username: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearGuestProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [guestUser, setGuestUser] = useState<AuthUser | null>(null);

  // Backend session
  const { data: sessionUser, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/me"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Pi login mutation - official flow
  const loginMutation = useMutation({
    mutationFn: async (authResult: AuthResult) => {
      // Security: Never log authResult as it contains sensitive credentials
      console.log('🔐 Sending Pi auth data to backend...');
      const response = await apiRequest("POST", "/api/auth/pi-login", { authResult });
      return response.json();
    },
    onSuccess: () => {
      console.log('✅ Pi login successful, invalidating session cache');
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    },
    onError: (error: any) => {
      console.error('❌ Pi login failed:', error);
    }
  });

  // Pi logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      setGuestUser(null);
      await advancedPiStorage.clearAllPiData();
    },
  });

  // Init Pi SDK and storage on mount
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize storage first
        const storageInitialized = await advancedPiStorage.initialize();
        if (storageInitialized) {
          console.log("✅ Advanced storage inicijalizovan");
        } else {
          console.warn("⚠️ Advanced storage init failed, continuing with fallback");
        }
        
        // Then initialize Pi SDK
        await initPiSDK(true);
        console.log("✅ Pi SDK ready");
      } catch (error) {
        console.error("❌ Service initialization error:", error);
      }
    };
    
    initializeServices();
  }, []);

  // Guest user fallback
  useEffect(() => {
    if (!sessionLoading && !sessionUser) {
      const setupGuest = async () => {
        try {
          // Try to restore guest from storage
          const recovered = await advancedPiStorage.findAnyPiUser();
          if (recovered) {
            setGuestUser({ ...recovered, isGuest: true });
            return;
          }

          // If no guest found, create new
          const guestId = `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`;
          const newGuest: AuthUser = { uid: guestId, username: "Guest User", isGuest: true };

          setGuestUser(newGuest);
          await advancedPiStorage.savePiUser(newGuest);
        } catch (err) {
          console.warn("⚠️ Guest fallback failed:", err);
          setGuestUser({ uid: `guest-${Date.now()}`, username: "Guest User", isGuest: true });
        }
      };

      setupGuest();
    }
  }, [sessionUser, sessionLoading]);

  // Pi login flow
  const login = async () => {
    try {
      console.log("🚀 Starting Pi login flow...");
      console.log("🔍 Pi SDK available:", !!window.Pi);
      console.log("🔍 Pi.authenticate available:", !!(window.Pi?.authenticate));
      
      const authResult = await authenticate(["username", "payments"]);
      console.log("✅ Pi auth completed, calling backend...");
      
      await loginMutation.mutateAsync(authResult);
      console.log("✅ Backend auth completed");

      // Save to local storage
      await advancedPiStorage.savePiUser(authResult.user);
      setGuestUser(null); // clear guest if exists
      
      console.log("✅ Pi login flow completed successfully");
    } catch (err) {
      console.error("❌ Login error:", err);
      // Show user-friendly error instead of just logging
      alert(`Pi login failed: ${err.message || 'Unknown error'}`);
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const clearGuestProfile = async () => {
    setGuestUser(null);
    await advancedPiStorage.clearAllPiData();
  };

  // Who is the current user?
  const currentUser = (sessionUser as AuthUser) || guestUser;
  const isAuthenticated = !!sessionUser;
  const isLoading = sessionLoading || loginMutation.isPending || logoutMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        userId: currentUser?.uid || null,
        isAuthenticated,
        isLoading,
        login,
        logout,
        clearGuestProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}