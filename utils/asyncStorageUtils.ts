// More robust dynamic import to handle environments where AsyncStorage might not be available
let AsyncStorage: any = null;
let initializationError: Error | null = null;

async function initializeAsyncStorage() {
  if (AsyncStorage !== null) return AsyncStorage;
  
  try {
    // Try dynamic import first
    const asyncStorageModule = await import('@react-native-async-storage/async-storage');
    AsyncStorage = asyncStorageModule.default;
    
    // Verify it's actually working
    await AsyncStorage.getItem('__test_key__');
    return AsyncStorage;
  } catch (error) {
    initializationError = error as Error;
    console.warn('AsyncStorage initialization failed:', error);
    
    // Try fallback require
    try {
      AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.getItem('__test_key__');
      return AsyncStorage;
    } catch (requireError) {
      console.warn('AsyncStorage require fallback failed:', requireError);
      return null;
    }
  }
}

interface CrashProofStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  isAvailable: () => Promise<boolean>;
  clear: () => Promise<void>;
}

const crashProofStorage: CrashProofStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (!AsyncStorage) {
        await initializeAsyncStorage();
      }
      
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available - returning null for key:', key);
        return null;
      }
      
      // Additional safety check for getItem method
      if (typeof AsyncStorage.getItem !== 'function') {
        console.warn('AsyncStorage.getItem is not a function - returning null for key:', key);
        return null;
      }
      
      const result = await AsyncStorage.getItem(key);
      return result;
    } catch (error) {
      console.error('AsyncStorage getItem error for key:', key, error);
      // Try to reinitialize AsyncStorage on error
      try {
        await initializeAsyncStorage();
        if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
          return await AsyncStorage.getItem(key);
        }
      } catch (retryError) {
        console.error('AsyncStorage retry failed:', retryError);
      }
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!AsyncStorage) {
        await initializeAsyncStorage();
      }
      
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available - cannot set key:', key);
        return;
      }
      
      // Additional safety check for setItem method
      if (typeof AsyncStorage.setItem !== 'function') {
        console.warn('AsyncStorage.setItem is not a function - cannot set key:', key);
        return;
      }
      
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error for key:', key, error);
      // Try to reinitialize AsyncStorage on error
      try {
        await initializeAsyncStorage();
        if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
          await AsyncStorage.setItem(key, value);
        }
      } catch (retryError) {
        console.error('AsyncStorage setItem retry failed:', retryError);
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (!AsyncStorage) {
        await initializeAsyncStorage();
      }
      
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available - cannot remove key:', key);
        return;
      }
      
      // Additional safety check for removeItem method
      if (typeof AsyncStorage.removeItem !== 'function') {
        console.warn('AsyncStorage.removeItem is not a function - cannot remove key:', key);
        return;
      }
      
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error for key:', key, error);
      // Try to reinitialize AsyncStorage on error
      try {
        await initializeAsyncStorage();
        if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
          await AsyncStorage.removeItem(key);
        }
      } catch (retryError) {
        console.error('AsyncStorage removeItem retry failed:', retryError);
      }
    }
  },

  async clear(): Promise<void> {
    try {
      if (!AsyncStorage) {
        await initializeAsyncStorage();
      }
      
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available - cannot clear');
        return;
      }
      
      if (typeof AsyncStorage.clear === 'function') {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
    }
  },

  async isAvailable(): Promise<boolean> {
    try {
      if (!AsyncStorage) {
        await initializeAsyncStorage();
      }
      
      return !!(AsyncStorage && 
                typeof AsyncStorage.getItem === 'function' && 
                typeof AsyncStorage.setItem === 'function' && 
                typeof AsyncStorage.removeItem === 'function');
    } catch (error) {
      console.error('AsyncStorage availability check failed:', error);
      return false;
    }
  }
};

// Initialize AsyncStorage immediately
initializeAsyncStorage().catch(error => {
  console.warn('Initial AsyncStorage initialization failed:', error);
});

export default crashProofStorage;