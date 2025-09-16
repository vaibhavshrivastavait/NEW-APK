// Direct import with proper error handling for AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Check if AsyncStorage is available
      if (!AsyncStorage || typeof AsyncStorage.getItem !== 'function') {
        console.warn('AsyncStorage.getItem not available - returning null for key:', key);
        return null;
      }
      
      const result = await AsyncStorage.getItem(key);
      return result;
    } catch (error) {
      console.error('crashProofStorage getItem error for key:', key, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Check if AsyncStorage is available
      if (!AsyncStorage || typeof AsyncStorage.setItem !== 'function') {
        console.warn('AsyncStorage.setItem not available - cannot set key:', key);
        return;
      }
      
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('crashProofStorage setItem error for key:', key, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      // Check if AsyncStorage is available
      if (!AsyncStorage || typeof AsyncStorage.removeItem !== 'function') {
        console.warn('AsyncStorage.removeItem not available - cannot remove key:', key);
        return;
      }
      
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('crashProofStorage removeItem error for key:', key, error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (!AsyncStorage || typeof AsyncStorage.clear !== 'function') {
        console.warn('AsyncStorage.clear not available');
        return;
      }
      
      await AsyncStorage.clear();
    } catch (error) {
      console.error('crashProofStorage clear error:', error);
    }
  },

  async isAvailable(): Promise<boolean> {
    try {
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

export default crashProofStorage;