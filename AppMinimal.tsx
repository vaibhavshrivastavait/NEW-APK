import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AppErrorBoundary from './components/AppErrorBoundary';

// MINIMAL: Import only absolutely essential screens to isolate reduce error
import HomeScreenFixed from './screens/HomeScreenFixed';

const Stack = createNativeStackNavigator();

export default function AppMinimal() {
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
          <Stack.Screen name="Home" component={HomeScreenFixed} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppErrorBoundary>
  );
}