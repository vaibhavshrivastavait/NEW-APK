import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDeviceInfo, getResponsiveSpacing, getTouchTargetSize } from '../utils/deviceUtils';
import ResponsiveText from './ResponsiveText';

interface HeaderAction {
  icon: string;
  onPress: () => void;
  color?: string;
  testID?: string;
}

interface TabletOptimizedHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: HeaderAction[];
  style?: ViewStyle;
  backgroundColor?: string;
  showBackButton?: boolean;
  subtitle?: string;
}

export default function TabletOptimizedHeader({
  title,
  onBack,
  actions = [],
  style,
  backgroundColor = '#FFC1CC',
  showBackButton = true,
  subtitle,
}: TabletOptimizedHeaderProps) {
  const { isTablet } = getDeviceInfo();
  const spacing = getResponsiveSpacing(16);
  const touchTarget = getTouchTargetSize();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.container, { backgroundColor, paddingHorizontal: spacing }, style]}>
        {/* Left section - Back button */}
        <View style={styles.leftSection}>
          {showBackButton && onBack && (
            <TouchableOpacity
              style={[styles.headerButton, { minWidth: touchTarget, minHeight: touchTarget }]}
              onPress={onBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              testID="header-back-button"
            >
              <MaterialIcons name="arrow-back" size={isTablet ? 28 : 24} color="#D81B60" />
            </TouchableOpacity>
          )}
        </View>

        {/* Center section - Title */}
        <View style={styles.centerSection}>
          <ResponsiveText
            variant={isTablet ? 'h2' : 'h3'}
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </ResponsiveText>
          {subtitle && (
            <ResponsiveText
              variant="caption"
              style={styles.subtitle}
              numberOfLines={1}
            >
              {subtitle}
            </ResponsiveText>
          )}
        </View>

        {/* Right section - Actions */}
        <View style={styles.rightSection}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.headerButton, { minWidth: touchTarget, minHeight: touchTarget }]}
              onPress={action.onPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              testID={action.testID}
            >
              <MaterialIcons
                name={action.icon as any}
                size={isTablet ? 28 : 24}
                color={action.color || '#D81B60'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 60,
  },
  headerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    marginHorizontal: 4,
  },
  title: {
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
});