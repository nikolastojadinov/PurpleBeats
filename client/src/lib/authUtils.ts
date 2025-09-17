export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Get current user ID with persistent guest support
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  // 1. Session ID za ovaj tab (najviši prioritet)
  const sessionId = sessionStorage.getItem('user-session-id');
  if (sessionId) {
    return sessionId;
  }
  
  // 2. Pi user data ako postoji
  const piUserData = localStorage.getItem('pi-user');
  if (piUserData) {
    try {
      const piUser = JSON.parse(piUserData);
      return piUser.uid;
    } catch {
      // Ignore parse errors
    }
  }
  
  // 3. Dugotrajni guest profil
  const persistentGuestId = localStorage.getItem('guest-profile-id');
  if (persistentGuestId) {
    return persistentGuestId;
  }
  
  // 4. Last fallback to demo user
  return 'demo-user-123';
}