import React, { Component, ReactNode } from 'react';
import { FlatList, FlatListProps, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SafeFlatListState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

interface SafeFlatListProps<T> extends FlatListProps<T> {
  fallbackMessage?: string;
  onRetry?: () => void;
}

/**
 * Enhanced crash-safe FlatList wrapper that prevents AsyncStorage crashes
 * from propagating and crashing the entire app, with retry functionality
 */
export default class SafeFlatList<T> extends Component<SafeFlatListProps<T>, SafeFlatListState> {
  constructor(props: SafeFlatListProps<T>) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): SafeFlatListState {
    console.error('🚨 SafeFlatList: Caught critical error in render:', error);
    
    // Only catch specific storage-related errors and data rendering issues
    const isStorageError = error.message.includes('AsyncStorage') || 
                          error.message.includes('getItem') || 
                          error.message.includes('setItem') ||
                          error.message.includes('Cannot read property') ||
                          error.message.includes('Cannot read properties of undefined') ||
                          error.message.includes('Cannot read properties of null') ||
                          error.name === 'TypeError';
    
    if (isStorageError) {
      return { hasError: true, error, retryCount: 0 };
    }
    
    // Let other errors bubble up
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 SafeFlatList: Component did catch:', error, errorInfo);
  }

  handleRetry = () => {
    console.log('🔄 SafeFlatList: Retrying after error...');
    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined,
      retryCount: prevState.retryCount + 1 
    }));
    
    // Call parent's retry function if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      console.log('🛡️  SafeFlatList: Rendering fallback UI due to critical error, retry count:', this.state.retryCount);
      
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#D81B60" />
          <Text style={styles.errorTitle}>Unable to load list</Text>
          <Text style={styles.errorMessage}>
            {this.props.fallbackMessage || 'An error occurred while loading the data. This may be due to a storage issue.'}
          </Text>
          
          {this.state.retryCount < 3 && (
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <MaterialIcons name="refresh" size={20} color="#FFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          
          {this.state.retryCount >= 3 && (
            <View style={styles.persistentErrorContainer}>
              <Text style={styles.persistentErrorText}>
                Persistent storage issue detected. Try restarting the app or clearing app data.
              </Text>
            </View>
          )}
        </View>
      );
    }

    // Ensure data is always an array to prevent crashes
    const safeProps = {
      ...this.props,
      data: Array.isArray(this.props.data) ? this.props.data : []
    };

    // Safely render FlatList - let React handle other errors naturally
    return <FlatList {...safeProps} />;
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D81B60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  persistentErrorContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  persistentErrorText: {
    fontSize: 12,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 16,
  },
});