import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AppErrorBoundary from './components/AppErrorBoundary';

// Import only essential screens to isolate the error
import HomeScreen from './screens/HomeScreen';
import PatientListScreen from './screens/PatientListScreen';

const Stack = createNativeStackNavigator();

export default function AppWithNavigationSimple() {
  return (
    <AppErrorBoundary>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PatientIntake" component={PatientListScreen} />
          <Stack.Screen name="PatientList" component={PatientListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppErrorBoundary>
  );
}