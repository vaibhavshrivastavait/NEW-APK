import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AppErrorBoundary from './components/AppErrorBoundary';

// Import all screens - using the fixed HomeScreen to prevent reduce error
import HomeScreenFixed from './screens/HomeScreenFixed';
import PatientListScreen from './screens/PatientListScreen';
import DemographicsScreen from './screens/DemographicsScreen';
import DemographicsScreenSimple from './screens/DemographicsScreenSimple';
import SymptomsScreen from './screens/SymptomsScreen';
import RiskFactorsScreen from './screens/RiskFactorsScreen';
import ResultsScreen from './screens/ResultsScreen';
import CmeScreen from './screens/CmeScreen';
import CmeQuizScreen from './screens/CmeQuizScreen';
import DecisionSupportScreen from './screens/DecisionSupportScreen';
import GuidelinesScreen from './screens/GuidelinesScreen';

const Stack = createNativeStackNavigator();

export default function AppWithNavigationComplete() {
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
          <Stack.Screen name="PatientIntake" component={PatientListScreen} />
          <Stack.Screen name="PatientList" component={PatientListScreen} />
          <Stack.Screen name="Demographics" component={DemographicsScreen} />
          <Stack.Screen name="DemographicsSimple" component={DemographicsScreenSimple} />
          <Stack.Screen name="Symptoms" component={SymptomsScreen} />
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