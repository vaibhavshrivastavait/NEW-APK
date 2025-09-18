import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AppState, Dimensions } from 'react-native';
import { getDeviceInfo } from './utils/deviceUtils';

// 🔍 DEBUG: AsyncStorage availability check (ChatGPT suggestion)
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log("🔍 AsyncStorage module check:", AsyncStorage);
console.log("🔍 AsyncStorage.getItem type:", typeof AsyncStorage?.getItem);
console.log("🔍 AsyncStorage.setItem type:", typeof AsyncStorage?.setItem);

// Import screens - Use tablet-optimized versions when appropriate
import HomeScreen from './screens/HomeScreen';
import TabletOptimizedHomeScreen from './screens/TabletOptimizedHomeScreen';
import PatientIntakeScreen from './screens/PatientIntakeScreen';
import PatientListScreen from './screens/PatientListScreen';
import TabletOptimizedPatientListScreen from './screens/TabletOptimizedPatientListScreen';
import SavedPatientRecordsScreen from './screens/SavedPatientRecordsScreen';
import SavedPatientDetailsScreen from './screens/SavedPatientDetailsScreen';
import DemographicsScreen from './screens/DemographicsScreen';
import SymptomsScreen from './screens/SymptomsScreen';
import RiskFactorsScreen from './screens/RiskFactorsScreen';
import ResultsScreen from './screens/ResultsScreen';
import CmeScreen from './screens/CmeScreen';
import GuidelinesScreen from './screens/GuidelinesScreen';
import TabletOptimizedGuidelinesScreen from './screens/TabletOptimizedGuidelinesScreen';
import ExportScreen from './screens/ExportScreen';
import PatientDetailsScreen from './screens/PatientDetailsScreen';
import SettingsScreen from './screens/SettingsScreen';
import DisclaimerScreen from './screens/DisclaimerScreen';
import RiskModelsExplainedScreen from './screens/RiskModelsExplainedScreen';
import DecisionSupportScreen from './screens/DecisionSupportScreen';
import DecisionSupportDetailScreen from './screens/DecisionSupportDetailScreen';
import ClinicalDecisionSummaryScreen from './screens/ClinicalDecisionSummaryScreen';
import PersonalizedRiskCalculatorsScreen from './screens/PersonalizedRiskCalculatorsScreen';
import TreatmentPlanScreen from './screens/TreatmentPlanScreen';
import RulesBasedTreatmentPlanScreen from './screens/RulesBasedTreatmentPlanScreen';
import RobustTreatmentPlanScreen from './screens/RobustTreatmentPlanScreen';
import MedicineSettingsScreen from './screens/MedicineSettingsScreen';

// Import splash screen with FIXES
import AnimatedSplash from './components/SplashScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  console.log('🚀 App.tsx starting to render...');
  
  // Get device info to determine which screens to use
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  
  // TEMPORARILY BYPASS SPLASH SCREEN FOR TESTING
  const [showSplash, setShowSplash] = useState(false); // Changed to false
  const [appInitialized, setAppInitialized] = useState(true); // Changed to true
  const [splashCompleted, setSplashCompleted] = useState(true); // Changed to true

  // Update device info on orientation change
  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo());
    };

    const subscription = Dimensions.addEventListener('change', updateDeviceInfo);
    return () => subscription?.remove();
  }, []);

  // Choose appropriate screen components based on device type
  const HomeScreenComponent = deviceInfo.isTablet ? TabletOptimizedHomeScreen : HomeScreen;
  const PatientListScreenComponent = deviceInfo.isTablet ? TabletOptimizedPatientListScreen : PatientListScreen;
  const GuidelinesScreenComponent = deviceInfo.isTablet ? TabletOptimizedGuidelinesScreen : GuidelinesScreen;

  useEffect(() => {
    // Handle app state changes to prevent window leaks
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Force completion of splash if app is backgrounded
        if (showSplash && !appInitialized && !splashCompleted) {
          console.log('App backgrounded - forcing splash completion to prevent window leaks');
          setSplashCompleted(true);
          setShowSplash(false);
          setAppInitialized(true);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [showSplash, appInitialized, splashCompleted]);

  const handleSplashComplete = () => {
    // SINGLE COMPLETION GUARANTEE
    if (splashCompleted) {
      console.log('✅ MHT Assessment: Splash already completed, ignoring duplicate call');
      return;
    }
    
    console.log('✅ MHT Assessment: SINGLE splash screen completed - transitioning to Home');
    setSplashCompleted(true);
    setShowSplash(false);
    setAppInitialized(true);
  };

  // Show splash screen ONLY ONCE - Enhanced protection against multiple splash screens
  if (showSplash && !splashCompleted && !appInitialized) {
    return <AnimatedSplash onAnimationComplete={handleSplashComplete} />;
  }

  console.log('✅ MHT Assessment: Rendering main navigation with all screens');

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFC1CC',
          },
          headerTintColor: '#D81B60',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false, // We handle headers in individual screens
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreenComponent}
          options={{ title: 'MHT Assessment' }}
        />
        <Stack.Screen 
          name="PatientIntake" 
          component={PatientIntakeScreen}
          options={{ title: 'New Assessment' }}
        />
        <Stack.Screen 
          name="PatientList" 
          component={PatientListScreenComponent}
          options={{ title: 'Patient Records' }}
        />
        <Stack.Screen 
          name="SavedPatientRecords" 
          component={SavedPatientRecordsScreen}
          options={{ title: 'Saved Patients' }}
        />
        <Stack.Screen 
          name="SavedPatientDetails" 
          component={SavedPatientDetailsScreen}
          options={{ title: 'Patient Details' }}
        />
        <Stack.Screen 
          name="PatientListTest" 
          component={require('./screens/PatientListScreenTest').default}
          options={{ title: 'Patient Records (Test)' }}
        />
        <Stack.Screen 
          name="Demographics" 
          component={DemographicsScreen}
          options={{ title: 'Patient Demographics' }}
        />
        <Stack.Screen 
          name="Symptoms" 
          component={SymptomsScreen}
          options={{ title: 'Symptom Assessment' }}
        />
        <Stack.Screen 
          name="RiskFactors" 
          component={RiskFactorsScreen}
          options={{ title: 'Risk Factors' }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{ title: 'Assessment Results' }}
        />
        <Stack.Screen 
          name="Cme" 
          component={CmeScreen}
          options={{ title: 'CME Mode' }}
        />
        <Stack.Screen 
          name="Guidelines" 
          component={GuidelinesScreenComponent}
          options={{ title: 'MHT Guidelines' }}
        />
        <Stack.Screen 
          name="Export" 
          component={ExportScreen}
          options={{ title: 'Export Results' }}
        />
        <Stack.Screen 
          name="PatientDetails" 
          component={PatientDetailsScreen}
          options={{ title: 'Patient Details' }}
        />
        <Stack.Screen 
          name="About" 
          component={SettingsScreen}
          options={{ title: 'About' }}
        />
        <Stack.Screen 
          name="Disclaimer" 
          component={DisclaimerScreen}
          options={{ title: 'Disclaimer' }}
        />
        <Stack.Screen 
          name="RiskModelsExplained" 
          component={RiskModelsExplainedScreen}
          options={{ title: 'Risk Models Explained' }}
        />
        <Stack.Screen 
          name="DecisionSupport" 
          component={DecisionSupportScreen}
          options={{ title: 'Evidence-Based Decision Support' }}
        />
        <Stack.Screen 
          name="DecisionSupportDetail" 
          component={DecisionSupportDetailScreen}
          options={{ title: 'Treatment Analysis' }}
        />
        <Stack.Screen 
          name="ClinicalDecisionSummary" 
          component={ClinicalDecisionSummaryScreen}
          options={{ title: 'Clinical Decision Summary' }}
        />
        <Stack.Screen 
          name="PersonalizedRiskCalculators" 
          component={PersonalizedRiskCalculatorsScreen}
          options={{ title: 'Personalized Risk Calculators' }}
        />
        <Stack.Screen 
          name="CmeModule" 
          component={require('./screens/CmeModuleScreen').default}
          options={{ title: 'CME Module' }}
        />
        <Stack.Screen 
          name="CmeQuiz" 
          component={require('./screens/CmeQuizScreen').default}
          options={{ title: 'CME Quiz' }}
        />
        <Stack.Screen 
          name="CmeCertificate" 
          component={require('./screens/CmeCertificateScreen').default}
          options={{ title: 'CME Certificate' }}
        />
        <Stack.Screen 
          name="TreatmentPlan" 
          component={require('./screens/TreatmentPlanScreenSimple').default}
          options={{ title: 'Treatment Plan' }}
        />
        <Stack.Screen 
          name="RulesBasedTreatmentPlan" 
          component={RulesBasedTreatmentPlanScreen}
          options={{ title: 'Rules-Based Treatment Plan' }}
        />
        <Stack.Screen 
          name="RobustTreatmentPlan" 
          component={RobustTreatmentPlanScreen}
          options={{ title: 'Treatment Plan Generator' }}
        />
        <Stack.Screen 
          name="MedicineSettings" 
          component={MedicineSettingsScreen}
          options={{ title: 'Medicine Analysis Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}