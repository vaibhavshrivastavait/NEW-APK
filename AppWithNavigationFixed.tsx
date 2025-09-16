import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AppErrorBoundary from './components/AppErrorBoundary';

// Import screens but exclude problematic ones initially
import PatientListScreen from './screens/PatientListScreen';
import DemographicsScreen from './screens/DemographicsScreen';
import RiskFactorsScreen from './screens/RiskFactorsScreen';
import ResultsScreen from './screens/ResultsScreen';
import CmeScreen from './screens/CmeScreen';
import CmeQuizScreen from './screens/CmeQuizScreen';
import DecisionSupportScreen from './screens/DecisionSupportScreen';
import GuidelinesScreen from './screens/GuidelinesScreen';

// Create a simple HomeScreen without drug interaction checker
import HomeScreenSimple from './HomeScreenSimple';

const Stack = createNativeStackNavigator();

export default function AppWithNavigationFixed() {
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
          <Stack.Screen name="Home" component={HomeScreenSimple} />
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