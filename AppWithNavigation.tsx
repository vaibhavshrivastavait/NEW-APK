import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AppErrorBoundary from './components/AppErrorBoundary';

// Import all screens - using original HomeScreen with fixed imports
import HomeScreen from './screens/HomeScreen';
import PatientListScreen from './screens/PatientListScreen';
import DemographicsScreen from './screens/DemographicsScreen';
import RiskFactorsScreen from './screens/RiskFactorsScreen';
import ResultsScreen from './screens/ResultsScreen';
import CmeScreen from './screens/CmeScreen';
import CmeQuizScreen from './screens/CmeQuizScreen';
import DecisionSupportScreen from './screens/DecisionSupportScreen';
import GuidelinesScreen from './screens/GuidelinesScreen';

const Stack = createNativeStackNavigator();

export default function AppWithNavigation() {
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
          <Stack.Screen name="Demographics" component={DemographicsScreen} />
          <Stack.Screen name="RiskFactors" component={RiskFactorsScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Cme" component={CmeScreen} />
          <Stack.Screen name="CmeQuiz" component={CmeQuizScreen} />
          <Stack.Screen name="DecisionSupport" component={DecisionSupportScreen} />
          <Stack.Screen name="Guidelines" component={GuidelinesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppErrorBoundary>
  );
}