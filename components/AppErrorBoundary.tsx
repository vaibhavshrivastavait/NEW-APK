import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

interface AppErrorBoundaryProps {
  children: ReactNode;
  onRestart?: () => void;
}

/**
 * Global error boundary to catch AsyncStorage crashes and other critical errors
 * Provides user-friendly error UI instead of blank screen
 */
export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    console.error('🚨 AppErrorBoundary: Caught critical app error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 AppErrorBoundary: Component did catch error:', error, errorInfo);
    this.setState({ errorInfo });

    // Check if this is the AsyncStorage crash we're trying to fix
    const isAsyncStorageCrash = error.message?.includes('getItem') || 
                               error.stack?.includes('AsyncStorage') ||
                               error.stack?.includes('FlatList');
    
    if (isAsyncStorageCrash) {
      console.error('🚨 DETECTED ASYNCSTORAGE CRASH:', {
        message: error.message,
        stack: error.stack?.substring(0, 500),
        component: errorInfo?.componentStack?.substring(0, 200)
      });
    }
  }

  handleRestart = () => {
    console.log('🔄 AppErrorBoundary: User requested app restart');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onRestart) {
      this.props.onRestart();
    }
  };

  handleReportError = () => {
    const { error } = this.state;
    const errorDetails = `
MHT Assessment App Error Report

Error: ${error?.message || 'Unknown error'}
Time: ${new Date().toISOString()}
Platform: React Native/Expo

Please contact support with this information.
    `.trim();

    Alert.alert(
      'Error Report',
      errorDetails,
      [
        { text: 'Copy to Clipboard', onPress: () => {
          // In a real app, you'd use Clipboard.setString() here
          console.log('Error report:', errorDetails);
        }},
        { text: 'OK', style: 'default' }
      ]
    );
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error } = this.state;
      const isAsyncStorageCrash = error?.message?.includes('getItem') || 
                                 error?.stack?.includes('AsyncStorage') ||
                                 error?.stack?.includes('FlatList');

      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={80} color="#F44336" />
          
          <Text style={styles.errorTitle}>
            {isAsyncStorageCrash ? 'Storage Access Error' : 'App Error'}
          </Text>
          
          <Text style={styles.errorMessage}>
            {isAsyncStorageCrash 
              ? 'The app encountered an issue accessing device storage. This may happen on some Android devices or emulators.'
              : 'The app encountered an unexpected error and needs to restart.'
            }
          </Text>

          {isAsyncStorageCrash && (
            <View style={styles.troubleshootingContainer}>
              <Text style={styles.troubleshootingTitle}>Troubleshooting:</Text>
              <Text style={styles.troubleshootingText}>
                • Try restarting the app{'\n'}
                • Ensure the app has storage permissions{'\n'}
                • Clear app data if the issue persists{'\n'}
                • This error is common in development environments
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={this.handleRestart}
            >
              <MaterialIcons name="refresh" size={24} color="white" />
              <Text style={styles.buttonText}>Restart App</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={this.handleReportError}
            >
              <MaterialIcons name="bug-report" size={24} color="#D81B60" />
              <Text style={[styles.buttonText, { color: '#D81B60' }]}>Report Error</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>
                {error?.message || 'No error message'}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF5F7',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  troubleshootingContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  troubleshootingText: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#D81B60',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#D81B60',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  debugContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});