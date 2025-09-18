import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface DeviceInfo {
  isTablet: boolean;
  isLargeTablet: boolean;
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
  deviceType: 'phone' | 'small-tablet' | 'large-tablet';
  platform: 'ios' | 'android' | 'web';
}

// Tablet breakpoints
export const BREAKPOINTS = {
  PHONE_MAX: 600,
  SMALL_TABLET_MIN: 600,
  SMALL_TABLET_MAX: 900,
  LARGE_TABLET_MIN: 900,
};

export const getDeviceInfo = (): DeviceInfo => {
  const screenWidth = Math.min(width, height);
  const screenHeight = Math.max(width, height);
  const isLandscape = width > height;
  
  // Determine device type based on smaller dimension
  const isTablet = screenWidth >= BREAKPOINTS.SMALL_TABLET_MIN;
  const isLargeTablet = screenWidth >= BREAKPOINTS.LARGE_TABLET_MIN;
  
  let deviceType: 'phone' | 'small-tablet' | 'large-tablet';
  if (screenWidth >= BREAKPOINTS.LARGE_TABLET_MIN) {
    deviceType = 'large-tablet';
  } else if (screenWidth >= BREAKPOINTS.SMALL_TABLET_MIN) {
    deviceType = 'small-tablet';
  } else {
    deviceType = 'phone';
  }

  return {
    isTablet,
    isLargeTablet,
    screenWidth: width,
    screenHeight: height,
    isLandscape,
    deviceType,
    platform: Platform.OS as 'ios' | 'android' | 'web',
  };
};

// Responsive values based on device type
export const getResponsiveValue = <T>(values: {
  phone: T;
  smallTablet: T;
  largeTablet: T;
}): T => {
  const { deviceType } = getDeviceInfo();
  
  switch (deviceType) {
    case 'large-tablet':
      return values.largeTablet;
    case 'small-tablet':
      return values.smallTablet;
    default:
      return values.phone;
  }
};

// Responsive spacing
export const getResponsiveSpacing = (baseSpacing: number) => {
  return getResponsiveValue({
    phone: baseSpacing,
    smallTablet: baseSpacing * 1.2,
    largeTablet: baseSpacing * 1.4,
  });
};

// Responsive font sizes
export const getResponsiveFontSize = (baseFontSize: number) => {
  return getResponsiveValue({
    phone: baseFontSize,
    smallTablet: baseFontSize * 1.1,
    largeTablet: baseFontSize * 1.2,
  });
};

// Grid columns for different device types
export const getGridColumns = () => {
  return getResponsiveValue({
    phone: 1,
    smallTablet: 2,
    largeTablet: 3,
  });
};

// Multi-pane layout detection
export const shouldUseMultiPane = (): boolean => {
  const { isTablet, isLandscape } = getDeviceInfo();
  return isTablet && isLandscape;
};

// Touch target sizes
export const getTouchTargetSize = () => {
  return getResponsiveValue({
    phone: 44,
    smallTablet: 48,
    largeTablet: 52,
  });
};

// Content max width for readability
export const getContentMaxWidth = () => {
  return getResponsiveValue({
    phone: '100%',
    smallTablet: 720,
    largeTablet: 900,
  });
};