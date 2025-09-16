/**
 * Enhanced Drug Interaction Checker - 150 Combinations
 * Uses the updated drug_interactions.json with proper error handling
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Safe interface for interaction results
interface InteractionResult {
  primary: string;
  interaction_with: string;
  examples: string[];
  severity: 'LOW' | 'MODERATE' | 'HIGH';
  rationale: string;
  recommended_action: string;
}

// Safe JSON data loading function
const loadDrugInteractionData = (): InteractionResult[] => {
  try {
    // Safely import JSON data with fallback
    const data = require('../assets/rules/drug_interactions.json');
    
    if (data && data.rules && Array.isArray(data.rules)) {
      console.log(`✅ Loaded ${data.rules.length} drug interactions`);
      return data.rules;
    }
    
    console.warn('⚠️ Drug interaction data not in expected format');
    return [];
  } catch (error) {
    console.error('❌ Failed to load drug interaction data:', error);
    return [];
  }
};

export default function EnhancedDrugInteractionChecker150() {
  const [selectedPrimary, setSelectedPrimary] = useState<string>('');
  const [selectedInteraction, setSelectedInteraction] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [interactionResult, setInteractionResult] = useState<InteractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load data safely with memoization
  const drugData = useMemo(() => loadDrugInteractionData(), []);

  // Extract unique primary medicines
  const primaryMedicines = useMemo(() => {
    if (!Array.isArray(drugData)) return [];
    const primaries = [...new Set(drugData.map(item => item.primary))].filter(Boolean);
    console.log(`📋 Found ${primaries.length} primary medicine categories`);
    return primaries;
  }, [drugData]);

  // Extract interaction medicines for selected primary
  const interactionMedicines = useMemo(() => {
    if (!selectedPrimary || !Array.isArray(drugData)) return [];
    
    const interactions = drugData
      .filter(item => item.primary === selectedPrimary)
      .map(item => item.interaction_with)
      .filter(Boolean);
    
    console.log(`💊 Found ${interactions.length} interactions for ${selectedPrimary}`);
    return interactions;
  }, [selectedPrimary, drugData]);

  // Filter function for search
  const filteredPrimaries = useMemo(() => {
    if (!searchQuery) return primaryMedicines;
    return primaryMedicines.filter(medicine => 
      medicine.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [primaryMedicines, searchQuery]);

  const filteredInteractions = useMemo(() => {
    if (!searchQuery) return interactionMedicines;
    return interactionMedicines.filter(medicine => 
      medicine.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [interactionMedicines, searchQuery]);

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'HIGH': return '#F44336';
      case 'MODERATE': return '#FF9800';
      case 'LOW': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'HIGH': return 'dangerous';
      case 'MODERATE': return 'warning';
      case 'LOW': return 'info';
      default: return 'help';
    }
  };

  // Check interaction function
  const checkInteraction = () => {
    if (!selectedPrimary || !selectedInteraction) {
      Alert.alert('Selection Required', 'Please select both primary medicine and interaction medicine');
      return;
    }

    setIsLoading(true);

    // Simulate API delay for UX
    setTimeout(() => {
      try {
        // Safe search through the data
        const result = drugData.find(item => 
          item.primary === selectedPrimary && 
          item.interaction_with === selectedInteraction
        );

        if (result) {
          setInteractionResult(result);
          console.log(`✅ Found interaction: ${result.severity} severity`);
        } else {
          // Create unknown interaction result
          setInteractionResult({
            primary: selectedPrimary,
            interaction_with: selectedInteraction,
            examples: [],
            severity: 'LOW',
            rationale: 'No specific interaction data available for this combination in our database.',
            recommended_action: 'Consult healthcare provider for clinical guidance and monitor patient response.'
          });
          console.log('⚠️ No specific interaction found - showing default');
        }
      } catch (error) {
        console.error('❌ Error during interaction check:', error);
        Alert.alert('Error', 'Failed to check interaction. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const resetSelection = () => {
    setSelectedPrimary('');
    setSelectedInteraction('');
    setInteractionResult(null);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drug Interaction Checker</Text>
        <Text style={styles.subtitle}>150+ Evidence-Based Interactions</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{drugData.length}</Text>
            <Text style={styles.statLabel}>Interactions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{primaryMedicines.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Primary Medicine Selection */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>
            Primary Medicine: {selectedPrimary || 'Select Category'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {filteredPrimaries.map((medicine) => (
              <TouchableOpacity
                key={medicine}
                style={[
                  styles.optionCard,
                  selectedPrimary === medicine && styles.selectedOption
                ]}
                onPress={() => {
                  setSelectedPrimary(medicine);
                  setSelectedInteraction('');
                  setInteractionResult(null);
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedPrimary === medicine && styles.selectedOptionText
                ]}>
                  {medicine}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Interaction Medicine Selection */}
        {selectedPrimary && (
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>
              Interaction With: {selectedInteraction || 'Select Medicine'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {filteredInteractions.map((medicine) => (
                <TouchableOpacity
                  key={medicine}
                  style={[
                    styles.optionCard,
                    selectedInteraction === medicine && styles.selectedOption
                  ]}
                  onPress={() => setSelectedInteraction(medicine)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedInteraction === medicine && styles.selectedOptionText
                  ]}>
                    {medicine}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              (!selectedPrimary || !selectedInteraction || isLoading) && styles.disabledButton
            ]}
            onPress={checkInteraction}
            disabled={!selectedPrimary || !selectedInteraction || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="search" size={20} color="white" />
            )}
            <Text style={styles.checkButtonText}>
              {isLoading ? 'Checking...' : 'Check Interaction'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
            <MaterialIcons name="refresh" size={20} color="#666" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Results Display */}
        {interactionResult && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <View style={[
                styles.severityBadge, 
                { backgroundColor: getSeverityColor(interactionResult.severity) }
              ]}>
                <MaterialIcons 
                  name={getSeverityIcon(interactionResult.severity)} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.severityText}>{interactionResult.severity}</Text>
              </View>
            </View>

            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>
                {interactionResult.primary} + {interactionResult.interaction_with}
              </Text>
              
              {interactionResult.examples && interactionResult.examples.length > 0 && (
                <View style={styles.examplesContainer}>
                  <Text style={styles.resultLabel}>Examples:</Text>
                  <Text style={styles.examplesText}>
                    {interactionResult.examples.join(', ')}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailSection}>
                <Text style={styles.resultLabel}>Clinical Rationale:</Text>
                <Text style={styles.resultText}>{interactionResult.rationale}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.resultLabel}>Recommended Action:</Text>
                <Text style={styles.resultText}>{interactionResult.recommended_action}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Professional Disclaimer */}
        <View style={styles.disclaimer}>
          <MaterialIcons name="info" size={16} color="#FF9800" />
          <Text style={styles.disclaimerText}>
            This tool contains {drugData.length} evidence-based drug interactions for clinical decision support. 
            Always consult healthcare professionals for patient care decisions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionCard: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 120,
  },
  selectedOption: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  checkButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  checkButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
    marginBottom: 16,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  severityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultContent: {
    gap: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  examplesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  examplesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  detailSection: {
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    gap: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#FF9800',
    lineHeight: 16,
  },
});