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
    console.error('🚨 SafeFlatList: Caught error in render:', error);
    
    // Only catch SPECIFIC storage-related errors, not general rendering errors
    const isStorageError = error.message.includes('AsyncStorage') || 
                          error.message.includes('getItem') || 
                          error.message.includes('setItem') ||
                          error.message.includes('removeItem') ||
                          error.message.includes('Storage is not available') ||
                          error.message.includes('Failed to initialize AsyncStorage');
    
    // Only catch SPECIFIC fatal crashes that would crash the entire app
    const isFatalCrash = error.name === 'ReferenceError' && 
                        (error.message.includes('AsyncStorage is not defined') ||
                         error.message.includes('Storage is not defined'));
    
    if (isStorageError || isFatalCrash) {
      console.log('🛡️ SafeFlatList: Handling storage-specific error');
      return { hasError: true, error, retryCount: 0 };
    }
    
    // Let other errors (including rendering errors) bubble up naturally
    console.log('🔄 SafeFlatList: Allowing non-storage error to bubble up');
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
            {this.props.fallbackMessage || 'An error occurred while loading the data. This may be due to a data loading issue or storage problem. Please try restarting the app.'}
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

    try {
      // 🔧 CRITICAL FIX: Handle completely undefined data prop
      console.log("🔍 SafeFlatList render - data type:", typeof this.props.data, "data:", this.props.data);
      
      // Ensure data is always an array to prevent crashes
      let safeData;
      if (this.props.data === undefined || this.props.data === null) {
        console.warn("🚨 SafeFlatList: data prop is null/undefined, using empty array");
        safeData = [];
      } else if (Array.isArray(this.props.data)) {
        safeData = this.props.data;
      } else {
        console.warn("🚨 SafeFlatList: data prop is not an array, converting:", typeof this.props.data);
        safeData = [];
      }

      // Clean props - remove any non-FlatList props that might cause issues
      const { fallbackMessage, onRetry, ...flatListProps } = this.props;

      // Provide safe defaults for required FlatList props
      const safeProps = {
        ...flatListProps,
        data: safeData,
        // Provide default keyExtractor if missing
        keyExtractor: this.props.keyExtractor || ((item: any, index: number) => {
          if (item && typeof item === 'object' && item.id) {
            return String(item.id);
          }
          if (item && typeof item === 'object' && item.key) {
            return String(item.key);
          }
          return String(index);
        }),
        // Provide default renderItem if missing
        renderItem: this.props.renderItem || (({ item }) => (
          <View style={{ padding: 10 }}>
            <Text>{JSON.stringify(item)}</Text>
          </View>
        ))
      };

      // Safely render FlatList
      return <FlatList {...safeProps} />;
      
    } catch (error) {
      console.error('🚨 SafeFlatList: Render error caught:', error);
      // Force error state and re-render with fallback UI
      this.setState({ hasError: true, error: error as Error });
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#D81B60" />
          <Text style={styles.errorTitle}>Render Error</Text>
          <Text style={styles.errorMessage}>
            A rendering error occurred. Please try refreshing.
          </Text>
        </View>
      );
    }
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