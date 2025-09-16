import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function AppSimplified() {
  const handlePress = (buttonName: string) => {
    console.log(`${buttonName} pressed`);
    alert(`${buttonName} functionality will be available in the mobile app!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialIcons name="medical-services" size={40} color="#D81B60" />
          <Text style={styles.title}>MHT Assessment</Text>
          <Text style={styles.subtitle}>Clinical Decision Support Tool</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => handlePress('Start Assessment')}
          >
            <MaterialIcons name="assignment" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Start New Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => handlePress('Patient Records')}
          >
            <MaterialIcons name="people" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Patient Records</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => handlePress('Drug Checker')}
          >
            <MaterialIcons name="medication" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Drug Interaction Checker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => handlePress('Guidelines')}
          >
            <MaterialIcons name="book" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>MHT Guidelines</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => handlePress('CME Mode')}
          >
            <MaterialIcons name="school" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>CME Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => handlePress('Risk Calculators')}
          >
            <MaterialIcons name="calculate" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Risk Calculators</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Clinical Features</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Drug Interactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>Risk Calculators</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>CME</Text>
              <Text style={styles.statLabel}>Educational Modules</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Evidence-based clinical decision support for menopause care
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
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
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 18,
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
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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