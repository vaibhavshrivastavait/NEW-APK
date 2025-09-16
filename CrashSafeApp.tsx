import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>🚨 App Error</Text>
            <Text style={styles.errorMessage}>
              The app encountered an unexpected error. Please restart the app.
            </Text>
            <Text style={styles.errorDetails}>
              Error: {this.state.error?.message || 'Unknown error'}
            </Text>
            <TouchableOpacity 
              style={styles.restartButton}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={styles.restartButtonText}>Restart App</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// Simple Home Screen Component
const SimpleHomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🏥 MHT Assessment</Text>
          <Text style={styles.loadingSubtext}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏥 MHT Assessment</Text>
          <Text style={styles.subtitle}>Medical Decision Support Tool</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('PatientIntake')}
          >
            <Text style={styles.menuButtonText}>📝 New Patient Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('PatientList')}
          >
            <Text style={styles.menuButtonText}>👥 Patient List</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('DrugInteractionChecker')}
          >
            <Text style={styles.menuButtonText}>💊 Drug Interaction Checker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Guidelines')}
          >
            <Text style={styles.menuButtonText}>📋 Clinical Guidelines</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>Offline Medical Assessment Tool</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Simple Patient Intake Screen
const SimplePatientIntakeScreen = ({ navigation }) => {
  const [patientName, setPatientName] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>New Patient</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>Patient Assessment</Text>
        <Text style={styles.description}>
          This is a simplified version for testing. The full patient intake form will be available once stability is confirmed.
        </Text>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Demographics')}
        >
          <Text style={styles.primaryButtonText}>Start Assessment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Simple placeholder screens
const createSimpleScreen = (title, content) => ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.screenHeader}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.screenTitle}>{title}</Text>
    </View>
    
    <View style={styles.content}>
      <Text style={styles.description}>{content}</Text>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const Stack = createNativeStackNavigator();

export default function CrashSafeApp() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={SimpleHomeScreen} />
          <Stack.Screen name="PatientIntake" component={SimplePatientIntakeScreen} />
          <Stack.Screen 
            name="PatientList" 
            component={createSimpleScreen('Patient List', 'Patient list functionality is being prepared.')} 
          />
          <Stack.Screen 
            name="DrugInteractionChecker" 
            component={createSimpleScreen('Drug Interaction Checker', 'Drug interaction checking functionality is being prepared.')} 
          />
          <Stack.Screen 
            name="Demographics" 
            component={createSimpleScreen('Demographics', 'Patient demographics form is being prepared.')} 
          />
          <Stack.Screen 
            name="Guidelines" 
            component={createSimpleScreen('Clinical Guidelines', 'Clinical guidelines are being prepared.')} 
          />
          <Stack.Screen 
            name="Settings" 
            component={createSimpleScreen('Settings', 'Settings screen is being prepared.')} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  menuContainer: {
    flex: 1,
  },
  menuButton: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#2563eb',
    marginRight: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fef2f2',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#7f1d1d',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#991b1b',
    textAlign: 'center',
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});