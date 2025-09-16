// Dynamic import to handle environments where AsyncStorage might not be available
let AsyncStorage: any = null;

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.warn('AsyncStorage not available in this environment:', error);
}

interface CrashProofStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  isAvailable: () => boolean;
}

const crashProofStorage: CrashProofStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available - returning null for key:', key);
        return null;
      }
      
      // Additional safety check for getItem method
      if (typeof AsyncStorage.getItem !== 'function') {
        console.warn('AsyncStorage.getItem is not a function - returning null for key:', key);
        return null;
      }
      
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error for key:', key, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
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
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
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
    }
  },

  isAvailable(): boolean {
    return !!(AsyncStorage && 
              typeof AsyncStorage.getItem === 'function' && 
              typeof AsyncStorage.setItem === 'function' && 
              typeof AsyncStorage.removeItem === 'function');
  }
};

export default crashProofStorage;