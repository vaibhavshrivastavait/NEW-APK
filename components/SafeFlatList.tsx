import React, { Component, ReactNode } from 'react';
import { FlatList, FlatListProps, View, Text, StyleSheet } from 'react-native';

interface SafeFlatListState {
  hasError: boolean;
  error?: Error;
}

interface SafeFlatListProps<T> extends FlatListProps<T> {
  fallbackMessage?: string;
}

/**
 * Crash-safe FlatList wrapper that prevents AsyncStorage crashes
 * from propagating and crashing the entire app
 */
export default class SafeFlatList<T> extends Component<SafeFlatListProps<T>, SafeFlatListState> {
  constructor(props: SafeFlatListProps<T>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeFlatListState {
    console.error('🚨 SafeFlatList: Caught critical error in render:', error);
    // Only catch actual critical errors, not data-related issues
    if (error.message.includes('AsyncStorage') || 
        error.message.includes('getItem') || 
        error.message.includes('setItem') ||
        error.message.includes('Cannot read property') ||
        error.name === 'TypeError') {
      return { hasError: true, error };
    }
    // Let other errors bubble up
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 SafeFlatList: Component did catch:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      console.log('🛡️  SafeFlatList: Rendering fallback UI due to critical error');
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load list</Text>
          <Text style={styles.errorMessage}>
            {this.props.fallbackMessage || 'An error occurred while loading the data. Please try again.'}
          </Text>
        </View>
      );
    }

    // Safely render FlatList - let React handle other errors naturally
    return <FlatList {...this.props} />;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});