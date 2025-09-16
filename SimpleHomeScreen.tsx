import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

export default function SimpleHomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="medical-services" size={32} color="#D81B60" />
          </View>
          <Text style={styles.title}>MHT Assessment</Text>
          <Text style={styles.subtitle}>
            Comprehensive Menopause Hormone Therapy Assessment Tool
          </Text>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => console.log('Start New Assessment pressed')}
            testID="start-assessment"
          >
            <MaterialIcons name="assignment" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Start New Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => console.log('Patient Records pressed')}
            testID="patient-records"
          >
            <MaterialIcons name="folder" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Patient Records</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Action Buttons */}
        <View style={styles.secondaryButtonContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('MHT Guidelines pressed')}
            testID="guidelines"
          >
            <MaterialIcons name="book" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>MHT Guidelines</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('CME Mode pressed')}
            testID="cme-mode"
          >
            <MaterialIcons name="school" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>CME Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('Risk Models Explained pressed')}
            testID="risk-models-explained"
          >
            <MaterialIcons name="info" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Risk Models Explained</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('Personalized Risk Calculators pressed')}
            testID="personalized-risk-calculators"
          >
            <MaterialIcons name="calculate" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Personalized Risk Calculators</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('Drug Interaction Checker pressed')}
            testID="drug-interaction-checker"
          >
            <MaterialIcons name="support" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Drug Interaction Checker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('About pressed')}
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
    </View>
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
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#D81B60',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonContainer: {
    gap: 12,
    marginBottom: 30,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});