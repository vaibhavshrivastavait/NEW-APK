import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { getGridColumns, getResponsiveSpacing } from '../utils/deviceUtils';

interface ResponsiveGridProps {
  children: ReactNode[];
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  spacing?: number;
  minItemWidth?: number;
}

export default function ResponsiveGrid({
  children,
  style,
  itemStyle,
  spacing,
  minItemWidth = 200,
}: ResponsiveGridProps) {
  const columns = getGridColumns();
  const defaultSpacing = getResponsiveSpacing(16);
  const actualSpacing = spacing ?? defaultSpacing;

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < children.length; i += columns) {
      const rowItems = children.slice(i, i + columns);
      rows.push(
        <View key={i} style={[styles.row, { marginBottom: actualSpacing }]}>
          {rowItems.map((child, index) => (
            <View
              key={index}
              style={[
                styles.item,
                itemStyle,
                {
                  flex: 1,
                  marginRight: index < rowItems.length - 1 ? actualSpacing : 0,
                  minWidth: minItemWidth,
                },
              ]}
            >
              {child}
            </View>
          ))}
          {/* Fill empty spaces */}
          {rowItems.length < columns &&
            Array.from({ length: columns - rowItems.length }).map((_, index) => (
              <View
                key={`empty-${index}`}
                style={[
                  styles.item,
                  {
                    flex: 1,
                    marginRight: index < columns - rowItems.length - 1 ? actualSpacing : 0,
                  },
                ]}
              />
            ))}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={[styles.container, style]}>
      {renderRows()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: {
    // Item styles handled by props
  },
});