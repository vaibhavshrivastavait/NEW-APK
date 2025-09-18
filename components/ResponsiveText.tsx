import React from 'react';
import { Text, TextStyle } from 'react-native';
import { getResponsiveFontSize } from '../utils/deviceUtils';

interface ResponsiveTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  fontSize?: number;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  [key: string]: any;
}

const FONT_SIZES = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 14,
};

export default function ResponsiveText({
  children,
  style,
  fontSize,
  variant = 'body',
  ...props
}: ResponsiveTextProps) {
  const baseFontSize = fontSize || FONT_SIZES[variant];
  const responsiveFontSize = getResponsiveFontSize(baseFontSize);

  const textStyle: TextStyle = Array.isArray(style)
    ? [{ fontSize: responsiveFontSize }, ...style]
    : [{ fontSize: responsiveFontSize }, style];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
}

export { FONT_SIZES };