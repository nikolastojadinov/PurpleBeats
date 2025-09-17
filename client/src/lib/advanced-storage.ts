// Advanced Pi Network Storage dengan IndexedDB + navigator.storage.persist()
// Mengatasi Pi Browser localStorage clearing issue

interface PiUserData {
  uid: string;
  username: string;
  timestamp: number;
  sessionId: string;
}

interface SavePiUserInput {
  uid: string;
  username: string;
}

interface StorageQuota {
  quota: number;
  usage: number;
  percentage: number;
}

class AdvancedPiStorage {
  private dbName = 'PiNetworkStorage';
  private dbVersion = 1;
  private storeName = 'piUserData';
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  // Initialize IndexedDB dengan persistent storage
  async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Inicijalizovanje naprednog Pi storage sistema...');
      
      // 1. Zatraži persistent storage (prioritet #1!)
      const persistGranted = await this.requestPersistentStorage();
      console.log('💾 Persistent storage granted:', persistGranted);

      // 2. Inicijalizuj IndexedDB
      await this.initIndexedDB();
      
      this.isInitialized = true;
      console.log('✅ Napredni Pi storage sistem spreman!');
      return true;
    } catch (error) {
      console.error('❌ Greška pri inicijalizaciji naprednog storage:', error);
      return false;
    }
  }

  // Zatraži persistent storage (kritično za Pi Browser!)
  private async requestPersistentStorage(): Promise<boolean> {
    if (!navigator.storage || !navigator.storage.persist) {
      console.warn('⚠️ Persistent storage API nije dostupan');
      return false;
    }

    try {
      // Proveri da li je već persistent
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) {
        console.log('✅ Storage je već persistent');
        return true;
      }

      // Zatraži persistent storage
      const granted = await navigator.storage.persist();
      console.log(granted ? '✅ Persistent storage odobren!' : '❌ Persistent storage odbijen');
      
      return granted;
    } catch (error) {
      console.error('❌ Greška pri zahtevanju persistent storage:', error);
      return false;
    }
  }

  // Inicijalizuj IndexedDB
  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ IndexedDB open failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB connected successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'uid' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('🔧 IndexedDB object store created');
        }
      };
    });
  }

  // Čuvanje Pi user podataka (SAMO uid, username - BEZ token!)
  async savePiUser(userData: SavePiUserInput): Promise<boolean> {
    if (!this.isInitialized || !this.db) {
      console.error('❌ Advanced storage nije inicijalizovan');
      return false;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Dodaj timestamp za tracking
      const dataWithTimestamp = {
        ...userData,
        timestamp: Date.now(),
        sessionId: this.generateSessionId()
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(dataWithTimestamp);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('✅ Pi user data saved to IndexedDB:', userData.uid);
      
      // Parallelly save to fallback locations
      await this.saveFallbackData(userData);
      
      return true;
    } catch (error) {
      console.error('❌ Greška pri čuvanju u IndexedDB:', error);
      return false;
    }
  }

  // Učitavanje Pi user podataka iz IndexedDB
  async loadPiUser(uid: string): Promise<PiUserData | null> {
    if (!this.isInitialized || !this.db) {
      console.warn('⚠️ Advanced storage nije inicijalizovan, pokušavam fallback...');
      return await this.loadFallbackData(uid);
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const data = await new Promise<PiUserData | null>((resolve, reject) => {
        const request = store.get(uid);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (data) {
        console.log('📂 Pi user data loaded from IndexedDB:', uid);
        return data;
      } else {
        console.log('🔍 Nema podataka u IndexedDB, pokušavam fallback...');
        return await this.loadFallbackData(uid);
      }
    } catch (error) {
      console.error('❌ Greška pri učitavanju iz IndexedDB:', error);
      return await this.loadFallbackData(uid);
    }
  }

  // Auto-recovery funkcija - pokušava da pronađe BILO KOJI Pi user
  async findAnyPiUser(): Promise<PiUserData | null> {
    try {
      // 1. Pokušaj IndexedDB prvo
      if (this.isInitialized && this.db) {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        const allUsers = await new Promise<PiUserData[]>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });

        if (allUsers.length > 0) {
          // Vrati najnoviji profile
          const latestUser = allUsers.sort((a, b) => b.timestamp - a.timestamp)[0];
          console.log('🔄 Auto-recovery: Pronašao Pi user u IndexedDB:', latestUser.uid);
          return latestUser;
        }
      }

      // 2. Fallback recovery
      console.log('🔍 Auto-recovery: Pokušavam fallback metode...');
      return await this.loadFallbackData('any');
    } catch (error) {
      console.error('❌ Auto-recovery failed:', error);
      return null;
    }
  }

  // Fallback storage (localStorage + cookies)
  private async saveFallbackData(userData: PiUserData): Promise<void> {
    try {
      const safeData = {
        uid: userData.uid,
        username: userData.username,
        timestamp: userData.timestamp
      };
      
      const dataString = JSON.stringify(safeData);
      
      // localStorage (koristi iste ključeve kao AuthContext!)
      localStorage.setItem('pi-user', dataString);
      
      // Cookie (30 dana, koristi iste ključeve kao AuthContext!)
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `pi_backup=${encodeURIComponent(dataString)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      
      console.log('💾 Fallback data saved');
    } catch (error) {
      console.error('❌ Fallback save failed:', error);
    }
  }

  // Fallback loading
  private async loadFallbackData(uid: string): Promise<PiUserData | null> {
    try {
      // 1. localStorage (koristi iste ključeve kao AuthContext!)
      const localData = localStorage.getItem('pi-user');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (uid === 'any' || parsed.uid === uid) {
          console.log('📂 Fallback recovery from localStorage');
          return parsed;
        }
      }

      // 2. Cookie (koristi iste ključeve kao AuthContext!)
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'pi_backup' && value) {
          try {
            const decoded = decodeURIComponent(value);
            const parsed = JSON.parse(decoded);
            if (uid === 'any' || parsed.uid === uid) {
              console.log('🍪 Fallback recovery from cookie');
              // Restore to localStorage (koristi iste ključeve!)
              localStorage.setItem('pi-user', decoded);
              return parsed;
            }
          } catch (e) {
            console.error('Cookie parse error:', e);
          }
        }
      }

      console.log('❌ Nema fallback podataka za:', uid);
      return null;
    } catch (error) {
      console.error('❌ Fallback load failed:', error);
      return null;
    }
  }

  // Monitor storage usage
  async checkStorageQuota(): Promise<StorageQuota | null> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      const result = { quota, usage, percentage };
      
      if (percentage > 80) {
        console.warn('⚠️ Storage quota skoro pun:', `${percentage.toFixed(1)}%`);
      }

      return result;
    } catch (error) {
      console.error('❌ Storage quota check failed:', error);
      return null;
    }
  }

  // Clear all Pi data (logout)
  async clearAllPiData(): Promise<void> {
    try {
      // Clear IndexedDB
      if (this.isInitialized && this.db) {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      // Clear fallbacks (koristi iste ključeve kao AuthContext!)
      localStorage.removeItem('pi-user');
      document.cookie = 'pi_backup=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      console.log('🧹 Svi Pi podaci obrisani');
    } catch (error) {
      console.error('❌ Greška pri brisanju Pi podataka:', error);
    }
  }

  private generateSessionId(): string {
    return `pi-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const advancedPiStorage = new AdvancedPiStorage();

// Export types
export type { SavePiUserInput, PiUserData, StorageQuota };