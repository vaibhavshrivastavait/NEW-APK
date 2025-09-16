// Jest setup file for React Native testing
import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://localhost:8001'
    }
  }
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => 'StatusBar'
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => 'MaterialIcons',
  Ionicons: () => 'Ionicons'
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn()
  }),
  useRoute: () => ({
    params: {}
  }),
  useFocusEffect: jest.fn()
}));

// Mock react-native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  // Mock AsyncStorage in react-native mock as well
  RN.AsyncStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
    getAllKeys: jest.fn()
  };
  
  return RN;
});

// Mock alert
global.alert = jest.fn();

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock Date.now for consistent timestamps in tests
const mockDateNow = 1641038400000; // 2022-01-01 12:00:00 UTC
Date.now = jest.fn(() => mockDateNow);

// Increase timeout for async operations
jest.setTimeout(30000);