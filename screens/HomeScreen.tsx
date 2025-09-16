import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// TEMPORARILY: Use safe version while we debug the enhanced version
import SafeDrugInteractionChecker from '../components/SafeDrugInteractionChecker';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  PatientList: undefined;
  Demographics: undefined;
  Symptoms: undefined;
  Cme: undefined;
  Guidelines: undefined;
  RobustTreatmentPlan: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [showDrugInteractionChecker, setShowDrugInteractionChecker] = useState(false);

  if (showDrugInteractionChecker) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white' }}>
          <TouchableOpacity 
            onPress={() => setShowDrugInteractionChecker(false)}
            style={{ marginRight: 16 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#D81B60' }}>
            Back to Home
          </Text>
        </View>
        <SafeDrugInteractionChecker />
      </SafeAreaView>
    );
  }
  
  const handleStartNewAssessment = () => {
    console.log('Starting new assessment...');
    navigation.navigate('PatientIntake');
  };

  const handleLoadExistingPatient = () => {
    console.log('Loading existing patients...');
    navigation.navigate('PatientList');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="medical-services" size={40} color="#D81B60" />
          </View>
          <Text style={styles.title}>MHT Assessment</Text>
          <Text style={styles.subtitle}>Menopausal Hormone Therapy Assessment Tool</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Professional Clinical Assessment</Text>
          <Text style={styles.featuresDescription}>
            Comprehensive risk stratification and evidence-based MHT recommendations following IMS/NAMS guidelines
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleStartNewAssessment}
            testID="start-new-assessment"
          >
            <MaterialIcons name="assignment" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Start New Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleLoadExistingPatient}
            testID="load-existing-patient"
          >
            <MaterialIcons name="people" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Patient Records</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('Guidelines')}
            testID="mht-guidelines"
          >
            <MaterialIcons name="book" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>MHT Guidelines</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('Cme')}
            testID="cme-mode"
          >
            <MaterialIcons name="school" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>CME Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('RiskModelsExplained')}
            testID="risk-models-explained"
          >
            <MaterialIcons name="info" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Risk Models Explained</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('PersonalizedRiskCalculators')}
            testID="personalized-risk-calculators"
          >
            <MaterialIcons name="calculate" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Personalized Risk Calculators</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => {
              console.log('🔍 Drug Interaction Checker button pressed');
              setShowDrugInteractionChecker(true);
              console.log('🔍 Showing EnhancedDrugInteractionChecker150 with 150 combinations');
            }}
            testID="decision-support"
          >
            <MaterialIcons name="support" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Drug Interaction Checker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('RobustTreatmentPlan')}
            testID="treatment-plan-generator"
          >
            <MaterialIcons name="healing" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Treatment Plan Generator</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('About')}
            testID="about"
          >
            <MaterialIcons name="info" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>About</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Evidence-based drug interaction checking for menopausal care
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  headerIcon: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 10,
  },
  featuresDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionContainer: {
    gap: 15,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFC1CC',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#D81B60',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});