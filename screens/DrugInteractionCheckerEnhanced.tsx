/**
 * Enhanced Drug Interaction Checker Screen
 * Shows ALL available medicines from drug_interactions.json
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import the new data extractor
import {
  getAllAvailableMedicines,
  getInteractionsForMainMedicine,
  type MedicineDisplayInfo
} from '../utils/drugInteractionDataExtractor';

// Import existing utilities
import {
  performDrugChecking,
  type CheckingResult
} from '../utils/drugInteractionMapping';

import DrugInteractionChecking from '../components/DrugInteractionChecking';

type RootStackParamList = {
  Home: undefined;
  DrugInteractionChecker: undefined;
};

type DrugInteractionCheckerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DrugInteractionChecker'
>;

interface Props {
  navigation: DrugInteractionCheckerScreenNavigationProp;
}

interface SelectedMedicine {
  key: string;
  displayName: string;
  category: 'main' | 'optional';
}

const DrugInteractionCheckerEnhanced: React.FC<Props> = ({ navigation }) => {
  // Medicine data state
  const [mainMedicines, setMainMedicines] = useState<MedicineDisplayInfo[]>([]);
  const [optionalMedicines, setOptionalMedicines] = useState<MedicineDisplayInfo[]>([]);
  const [availableOptionals, setAvailableOptionals] = useState<MedicineDisplayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedMainMedicine, setSelectedMainMedicine] = useState<SelectedMedicine | null>(null);
  const [selectedOptionalMedicines, setSelectedOptionalMedicines] = useState<SelectedMedicine[]>([]);

  // Checking results
  const [checkingResults, setCheckingResults] = useState<CheckingResult[]>([]);
  const [checkingLoading, setCheckingLoading] = useState(false);

  // Load all available medicines on component mount
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { mainMedicines, optionalMedicines } = await getAllAvailableMedicines();
        
        console.log(`📊 Loaded ${mainMedicines.length} main medicines and ${optionalMedicines.length} optional medicines`);
        
        setMainMedicines(mainMedicines);
        setOptionalMedicines(optionalMedicines);
        setAvailableOptionals(optionalMedicines);
        
      } catch (err) {
        console.error('❌ Failed to load medicines:', err);
        setError('Failed to load medicine data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, []);

  // Filter available optional medicines based on selected main medicine
  useEffect(() => {
    const filterOptionalMedicines = async () => {
      if (!selectedMainMedicine) {
        setAvailableOptionals(optionalMedicines);
        return;
      }

      try {
        const interactions = await getInteractionsForMainMedicine(selectedMainMedicine.key);
        const interactionKeys = new Set(interactions.map(i => i.drug));
        
        // Filter optional medicines to show only those that have interactions with the selected main medicine
        const filtered = optionalMedicines.filter(med => interactionKeys.has(med.key));
        setAvailableOptionals(filtered);
        
        console.log(`🔍 Filtered to ${filtered.length} optional medicines for ${selectedMainMedicine.displayName}`);
        
      } catch (err) {
        console.error('❌ Failed to filter optional medicines:', err);
        setAvailableOptionals(optionalMedicines);
      }
    };

    filterOptionalMedicines();
  }, [selectedMainMedicine, optionalMedicines]);

  // Perform real-time checking when selections change
  const performRealTimeChecking = useCallback(async () => {
    if (!selectedMainMedicine || selectedOptionalMedicines.length === 0) {
      setCheckingResults([]);
      return;
    }

    try {
      setCheckingLoading(true);
      
      const optionalMeds = selectedOptionalMedicines.map(med => ({
        key: med.key,
        displayName: med.displayName
      }));
      
      console.log(`🔍 Checking: main=${selectedMainMedicine.displayName}, optionals=[${optionalMeds.map(m => m.displayName).join(', ')}]`);
      
      const results = await performDrugChecking(selectedMainMedicine.key, optionalMeds);
      setCheckingResults(results);
      
      console.log(`✅ Checking complete: ${results.length} results`);
      
    } catch (error) {
      console.error('❌ Real-time checking failed:', error);
      setCheckingResults([]);
    } finally {
      setCheckingLoading(false);
    }
  }, [selectedMainMedicine, selectedOptionalMedicines]);

  useEffect(() => {
    performRealTimeChecking();
  }, [performRealTimeChecking]);

  // Handle main medicine selection
  const handleMainMedicineSelection = (medicine: MedicineDisplayInfo) => {
    const selected: SelectedMedicine = {
      key: medicine.key,
      displayName: medicine.displayName,
      category: 'main'
    };
    
    setSelectedMainMedicine(selected);
    // Clear optional selections when main medicine changes
    setSelectedOptionalMedicines([]);
    
    console.log(`🎯 Selected main medicine: ${medicine.displayName}`);
  };

  // Handle optional medicine selection
  const handleOptionalMedicineSelection = (medicine: MedicineDisplayInfo) => {
    const isSelected = selectedOptionalMedicines.some(med => med.key === medicine.key);
    
    if (isSelected) {
      // Remove if already selected
      setSelectedOptionalMedicines(prev => prev.filter(med => med.key !== medicine.key));
      console.log(`➖ Removed optional medicine: ${medicine.displayName}`);
    } else {
      // Add if not selected
      const selected: SelectedMedicine = {
        key: medicine.key,
        displayName: medicine.displayName,
        category: 'optional'
      };
      setSelectedOptionalMedicines(prev => [...prev, selected]);
      console.log(`➕ Added optional medicine: ${medicine.displayName}`);
    }
  };

  // Remove selected optional medicine
  const removeOptionalMedicine = (medicineKey: string) => {
    setSelectedOptionalMedicines(prev => prev.filter(med => med.key !== medicineKey));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D81B60" />
          <Text style={styles.loadingText}>Loading medicines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            testID="back-button"
          >
            <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Drug Interaction Checker</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title and Description */}
          <View style={styles.titleContainer}>
            <MaterialIcons name="warning" size={32} color="#FF9800" />
            <Text style={styles.title}>Drug Interaction Checker</Text>
            <Text style={styles.subtitle}>Real-time interaction checking</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to use:</Text>
            <Text style={styles.instruction}>1. Select a main medicine type</Text>
            <Text style={styles.instruction}>2. Add current medications</Text>
            <Text style={styles.instruction}>3. View real-time severity checking below</Text>
            <Text style={styles.instruction}>4. Remove medicines to see updates</Text>
          </View>

          {/* Main Medicine Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Medicine Type (Main)</Text>
            <View style={styles.medicineGrid}>
              {mainMedicines.map((medicine) => (
                <TouchableOpacity
                  key={medicine.key}
                  style={[
                    styles.medicineButton,
                    selectedMainMedicine?.key === medicine.key && styles.medicineButtonSelected
                  ]}
                  onPress={() => handleMainMedicineSelection(medicine)}
                >
                  <Text style={[
                    styles.medicineButtonText,
                    selectedMainMedicine?.key === medicine.key && styles.medicineButtonTextSelected
                  ]}>
                    {medicine.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Selected Optional Medicines Display */}
          {selectedOptionalMedicines.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Current Medications (Optional)</Text>
              <View style={styles.selectedMedicinesContainer}>
                {selectedOptionalMedicines.map((medicine) => (
                  <View key={medicine.key} style={styles.selectedMedicineItem}>
                    <Text style={styles.selectedMedicineName}>{medicine.displayName}</Text>
                    <TouchableOpacity
                      onPress={() => removeOptionalMedicine(medicine.key)}
                      style={styles.removeMedicineButton}
                    >
                      <MaterialIcons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Optional Medicine Selection */}
          {selectedMainMedicine && (
            <View style={styles.sectionContainer}>
              <View style={styles.medicineGrid}>
                {availableOptionals.map((medicine) => {
                  const isSelected = selectedOptionalMedicines.some(med => med.key === medicine.key);
                  return (
                    <TouchableOpacity
                      key={medicine.key}
                      style={[
                        styles.medicineButton,
                        styles.optionalMedicineButton,
                        isSelected && styles.medicineButtonSelected
                      ]}
                      onPress={() => handleOptionalMedicineSelection(medicine)}
                    >
                      <Text style={[
                        styles.medicineButtonText,
                        isSelected && styles.medicineButtonTextSelected
                      ]}>
                        {medicine.displayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Real-time Checking Section */}
          {selectedMainMedicine && selectedOptionalMedicines.length > 0 && (
            <View style={styles.checkingContainer}>
              <DrugInteractionChecking
                results={checkingResults}
                loading={checkingLoading}
                onLocalMappingPress={() => {
                  Alert.alert(
                    'Local Mapping',
                    `Using ${mainMedicines.length + optionalMedicines.length} medicine mappings from drug_interactions.json`,
                    [{ text: 'OK' }]
                  );
                }}
              />
            </View>
          )}

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Total medicines available: {mainMedicines.length} main, {optionalMedicines.length} optional
            </Text>
            <Text style={styles.summaryText}>
              Data source: drug_interactions.json (120+ interactions)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE7EF',
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#D81B60',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sectionContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  medicineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicineButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  optionalMedicineButton: {
    backgroundColor: '#F9F9F9',
  },
  medicineButtonSelected: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
  },
  medicineButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  medicineButtonTextSelected: {
    color: 'white',
  },
  selectedMedicinesContainer: {
    gap: 8,
  },
  selectedMedicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  selectedMedicineName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeMedicineButton: {
    padding: 4,
  },
  checkingContainer: {
    margin: 16,
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default DrugInteractionCheckerEnhanced;