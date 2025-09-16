import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function UltraSimpleHomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
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
          >
            <Text style={styles.primaryButtonText}>📝 Start New Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => console.log('Patient Records pressed')}
          >
            <Text style={styles.primaryButtonText}>👥 Patient Records</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('MHT Guidelines pressed')}
          >
            <Text style={styles.secondaryButtonText}>📚 MHT Guidelines</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('CME Mode pressed')}
          >
            <Text style={styles.secondaryButtonText}>🎓 CME Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('Risk Models Explained pressed')}
          >
            <Text style={styles.secondaryButtonText}>ℹ️ Risk Models Explained</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('Personalized Risk Calculators pressed')}
          >
            <Text style={styles.secondaryButtonText}>🧮 Personalized Risk Calculators</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('Drug Interaction Checker pressed')}
          >
            <Text style={styles.secondaryButtonText}>💊 Drug Interaction Checker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => console.log('About pressed')}
          >
            <Text style={styles.secondaryButtonText}>ℹ️ About</Text>
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
    paddingTop: 50, // Manual padding instead of SafeArea
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
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#D81B60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});