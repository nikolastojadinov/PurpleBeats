// Pi Authentication - Official Demo App Implementation
import type { AuthResult, PaymentDTO } from '@/types/pi';

export interface PiAuthResult {
  accessToken: string;
  user: { uid: string; username: string };
}

export async function initPiSDK(sandbox = true): Promise<void> {
  if (typeof window === "undefined") throw new Error("Window not available");

  // Wait for Pi SDK to load from our backend
  const initPromise = new Promise<void>((resolve, reject) => {
    const checkReady = () => {
      if (typeof (window as any).Pi !== 'undefined') {
        resolve();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    setTimeout(() => reject(new Error("Pi SDK timeout")), 10000);
    checkReady();
  });

  await initPromise;
  console.log("✅ Pi SDK loaded successfully");
}

// Official Pi authentication flow with payment handling
const onIncompletePaymentFound = (payment: PaymentDTO) => {
  console.log("💰 Incomplete payment found:", payment);
  // Handle incomplete payments if needed
  // This could call your backend to handle the incomplete payment
};

export async function authenticate(scopes: string[] = ["username", "payments"]): Promise<AuthResult> {
  if (!window.Pi || typeof window.Pi.authenticate !== "function") {
    throw new Error("Pi SDK not ready - authenticate missing");
  }

  console.log("🔐 Starting Pi authentication with scopes:", scopes);
  console.log("🔍 Pi SDK ready status:", !!window.Pi);

  try {
    console.log("🔥 Calling Pi.authenticate with official flow...");
    
    // Official Pi authenticate call with incomplete payment handler
    const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound) as AuthResult;

    console.log("📋 Pi auth result received:", authResult);

    if (!authResult?.accessToken || !authResult?.user?.uid) {
      console.error("❌ Missing data in Pi result:", authResult);
      throw new Error("Pi authentication failed - missing user or token");
    }

    console.log("✅ Pi Authentication successful for:", authResult.user.username);

    // Return the official AuthResult format
    return authResult;
  } catch (error: any) {
    console.error("❌ Pi.authenticate failed:", error);
    console.error("❌ Error details:", error.message, error.stack);
    throw error;
  }
}

// Legacy compatibility
export async function authenticateOld(scopes: string[] = ["username"]): Promise<PiAuthResult> {
  const result = await authenticate(scopes);
  return {
    accessToken: result.accessToken,
    user: result.user
  };
}