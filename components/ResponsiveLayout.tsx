import React, { ReactNode, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { getDeviceInfo, shouldUseMultiPane, getResponsiveSpacing } from '../utils/deviceUtils';

interface ResponsiveLayoutProps {
  children: ReactNode;
  leftPane?: ReactNode;
  rightPane?: ReactNode;
  style?: ViewStyle;
  leftPaneWidth?: number;
  rightPaneWidth?: number;
  enableMultiPane?: boolean;
}

export default function ResponsiveLayout({
  children,
  leftPane,
  rightPane,
  style,
  leftPaneWidth = 300,
  rightPaneWidth = 300,
  enableMultiPane = true,
}: ResponsiveLayoutProps) {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [showMultiPane, setShowMultiPane] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      const newDeviceInfo = getDeviceInfo();
      setDeviceInfo(newDeviceInfo);
      setShowMultiPane(enableMultiPane && shouldUseMultiPane());
    };

    updateLayout();

    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription?.remove();
  }, [enableMultiPane]);

  const spacing = getResponsiveSpacing(16);

  if (showMultiPane && (leftPane || rightPane)) {
    return (
      <View style={[styles.container, style]}>
        {/* Left Pane */}
        {leftPane && (
          <View style={[styles.leftPane, { width: leftPaneWidth }]}>
            {leftPane}
          </View>
        )}

        {/* Main Content */}
        <View style={[styles.mainContent, { paddingHorizontal: spacing }]}>
          {children}
        </View>

        {/* Right Pane */}
        {rightPane && (
          <View style={[styles.rightPane, { width: rightPaneWidth }]}>
            {rightPane}
          </View>
        )}
      </View>
    );
  }

  // Single pane layout for phones or when multi-pane is disabled
  return (
    <View style={[styles.singlePane, style, { paddingHorizontal: spacing }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  singlePane: {
    flex: 1,
  },
  leftPane: {
    backgroundColor: '#F8F9FA',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  rightPane: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
});