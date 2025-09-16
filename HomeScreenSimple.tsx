import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  PatientList: undefined;
  Demographics: undefined;
  Symptoms: undefined;
  Cme: undefined;
  Guidelines: undefined;
  DecisionSupport: undefined;
  RiskFactors: undefined;
  Results: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreenSimple({ navigation }: Props) {
  const handleStartNewAssessment = () => {
    console.log('Starting new assessment...');
    navigation.navigate('PatientIntake');
  };

  const handleLoadExistingPatient = () => {
    console.log('Loading existing patients...');
    navigation.navigate('PatientList');
  };

  const handleCmeMode = () => {
    console.log('Loading CME mode...');
    navigation.navigate('Cme');
  };

  const handleGuidelines = () => {
    console.log('Loading guidelines...');
    navigation.navigate('Guidelines');
  };

  const handleDecisionSupport = () => {
    console.log('Loading decision support...');
    navigation.navigate('DecisionSupport');
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
          <Text style={styles.subtitle}>Comprehensive Clinical Decision Support System</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Professional Medical Assessment</Text>
          <Text style={styles.featuresDescription}>
            Evidence-based menopause hormone therapy assessment following IMS/NAMS guidelines
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
            testID="load-patient"
          >
            <MaterialIcons name="people" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Patient Records</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresGrid}>
          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={handleCmeMode}
          >
            <MaterialIcons name="school" size={28} color="#3F51B5" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>CME Mode</Text>
              <Text style={styles.featureSubtitle}>Educational modules and quizzes</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={handleGuidelines}
          >
            <MaterialIcons name="book" size={28} color="#4CAF50" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Clinical Guidelines</Text>
              <Text style={styles.featureSubtitle}>IMS/NAMS evidence-based guidelines</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={handleDecisionSupport}
          >
            <MaterialIcons name="psychology" size={28} color="#FF9800" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Decision Support</Text>
              <Text style={styles.featureSubtitle}>Risk calculators and recommendations</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Clinical Assessment Features</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>6+</Text>
              <Text style={styles.statLabel}>Risk Calculators</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Drug Interactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>CME</Text>
              <Text style={styles.statLabel}>Education Modules</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Professional clinical decision support for menopause hormone therapy
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
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
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
    paddingHorizontal: 20,
  },
  featuresContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  featuresDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 10,
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
    padding: 16,
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
  featuresGrid: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});