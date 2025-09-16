/**
 * Safe Drug Interaction Checker - Web Compatible Version
 * Designed to avoid the "reduce" error while maintaining functionality
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Safe interface without external dependencies
interface SafeInteractionResult {
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';
  medicine1: string;
  medicine2: string;
  rationale: string;
  recommended_action: string;
}

// Import drug interaction data using import instead of require for APK compatibility
import drugInteractionDataImport from '../assets/rules/drug_interactions.json';

// Safe medicine categories - loaded from JSON data safely
const loadDrugInteractionData = () => {
  try {
    // Use imported data instead of require
    const data = drugInteractionDataImport;
    
    if (data && data.rules && Array.isArray(data.rules)) {
      console.log(`✅ Loaded ${data.rules.length} drug interactions from JSON`);
      return data.rules;
    }
    
    console.warn('⚠️ Drug interaction data not in expected format, using fallback');
    return FALLBACK_INTERACTIONS;
  } catch (error) {
    console.error('❌ Failed to load drug interaction data, using fallback:', error);
    return FALLBACK_INTERACTIONS;
  }
};

// Fallback interactions for safety
const FALLBACK_INTERACTIONS = [
  {
    primary: 'Hormone Replacement Therapy (HRT)',
    interaction_with: 'Anticoagulants',
    examples: ['warfarin', 'rivaroxaban', 'apixaban', 'dabigatran'],
    severity: 'HIGH',
    rationale: 'High-risk interaction: combination may lead to serious adverse events (bleeding, therapeutic failure, or significant pharmacodynamic/pharmacokinetic interaction).',
    recommended_action: 'Avoid combination if possible; consult specialist and monitor closely (lab monitoring or clinical review).'
  }
];

// Extract medicine categories from JSON data - using primary and interaction_with directly
const extractMedicineCategories = (drugData: any[]) => {
  if (!Array.isArray(drugData)) {
    return [];
  }

  // Get unique primary categories from JSON
  const primaryCategories = [...new Set(drugData.map(item => item.primary))].filter(Boolean);
  
  return primaryCategories.map((primary, index) => ({
    id: primary.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    title: primary,
    isCategory: true,
    color: ['#E91E63', '#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'][index % 6]
  }));
};

// Extract interaction categories for a specific primary
const extractInteractionCategories = (drugData: any[], selectedPrimary: string) => {
  if (!Array.isArray(drugData) || !selectedPrimary) {
    return [];
  }

  // Get interaction_with values for the selected primary
  const interactions = drugData
    .filter(item => item.primary === selectedPrimary)
    .map(item => item.interaction_with)
    .filter(Boolean);

  return [...new Set(interactions)].map((interaction, index) => ({
    id: interaction.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    title: interaction,
    isCategory: true,
    color: ['#FF5722', '#795548', '#607D8B', '#3F51B5', '#009688', '#CDDC39'][index % 6]
  }));
};

const MEDICINE_CATEGORIES = [
  {
    id: 'hrt',
    title: 'Hormone Replacement Therapy',
    medicines: ['Estradiol', 'Progesterone', 'Testosterone', 'Tibolone'],
    color: '#E91E63'
  },
  {
    id: 'anticoagulants',
    title: 'Anticoagulants',
    medicines: ['Warfarin', 'Rivaroxaban', 'Apixaban', 'Dabigatran'],
    color: '#F44336'
  },
  {
    id: 'antidepressants',
    title: 'Antidepressants',
    medicines: ['Sertraline', 'Fluoxetine', 'Paroxetine', 'Venlafaxine'],
    color: '#2196F3'
  },
  {
    id: 'antihypertensives',
    title: 'Antihypertensives',
    medicines: ['Lisinopril', 'Amlodipine', 'Metoprolol', 'Losartan'],
    color: '#4CAF50'
  },
  {
    id: 'anticonvulsants',
    title: 'Anticonvulsants',
    medicines: ['Phenytoin', 'Carbamazepine', 'Phenobarbital', 'Valproate'],
    color: '#FF9800'
  }
];

// Safe interaction data - hardcoded to avoid JSON parsing issues
const SAFE_INTERACTIONS: SafeInteractionResult[] = [
  {
    severity: 'HIGH',
    medicine1: 'Estradiol',
    medicine2: 'Warfarin',
    rationale: 'Estrogen may increase risk of thromboembolism when combined with anticoagulants',
    recommended_action: 'Monitor INR closely, consider alternative therapy'
  },
  {
    severity: 'MODERATE',
    medicine1: 'Progesterone',
    medicine2: 'Sertraline',
    rationale: 'Hormonal changes may affect antidepressant effectiveness',
    recommended_action: 'Monitor mood and adjust dose if needed'
  },
  {
    severity: 'LOW',
    medicine1: 'Testosterone',
    medicine2: 'Lisinopril',
    rationale: 'Minimal interaction, testosterone may slightly affect blood pressure',
    recommended_action: 'Monitor blood pressure regularly'
  }
];

export default function SafeDrugInteractionChecker() {
  const [selectedRecommended, setSelectedRecommended] = useState<string>(''); // Single selection
  const [selectedOptional, setSelectedOptional] = useState<string[]>([]);
  const [interactionResults, setInteractionResults] = useState<SafeInteractionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load drug interaction data safely
  const drugData = useMemo(() => loadDrugInteractionData(), []);
  
  // Get primary categories from JSON
  const primaryCategories = useMemo(() => {
    if (!Array.isArray(drugData)) return [];
    const primaries = [...new Set(drugData.map(item => item.primary))].filter(Boolean);
    return primaries.map((primary, index) => ({
      name: primary,
      color: ['#E91E63', '#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'][index % 6]
    }));
  }, [drugData]);

  // Get interaction categories for selected primary
  const interactionCategories = useMemo(() => {
    if (!selectedRecommended || !Array.isArray(drugData)) return [];
    
    // Get all interactions for the selected recommended medicine
    const interactions = drugData
      .filter(item => item.primary === selectedRecommended)
      .map(item => item.interaction_with)
      .filter(Boolean);
    
    return [...new Set(interactions)].map((interaction, index) => ({
      name: interaction,
      color: ['#FF5722', '#795548', '#607D8B', '#3F51B5', '#009688', '#CDDC39'][index % 6]
    }));
  }, [selectedRecommended, drugData]);

  // Auto-check interactions when selections change
  useEffect(() => {
    if (selectedRecommended && selectedOptional.length > 0) {
      checkMultipleInteractions();
    } else {
      setInteractionResults([]);
    }
  }, [selectedRecommended, selectedOptional]);

  // Toggle selection for recommended medicine (single selection)
  const toggleRecommendedSelection = (medicine: string) => {
    if (selectedRecommended === medicine) {
      setSelectedRecommended('');
      setSelectedOptional([]);
    } else {
      setSelectedRecommended(medicine);
      setSelectedOptional([]); // Reset optional when recommended changes
    }
    setInteractionResults([]);
  };

  // Toggle selection for optional medicines (multiple selection)
  const toggleOptionalSelection = (medicine: string) => {
    setSelectedOptional(prev => {
      if (prev.includes(medicine)) {
        return prev.filter(item => item !== medicine);
      } else {
        return [...prev, medicine];
      }
    });
  };

  // Deselect all optional medicines
  const deselectAllOptional = () => {
    setSelectedOptional([]);
  };

  // Safe severity color function
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'HIGH': return '#F44336';
      case 'MODERATE': return '#FF9800';
      case 'LOW': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  // Safe severity icon function
  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'HIGH': return 'warning';
      case 'MODERATE': return 'info';
      case 'LOW': return 'check-circle';
      default: return 'help';
    }
  };

  // Check multiple interactions function (now auto-triggered)
  const checkMultipleInteractions = () => {
    if (!selectedRecommended || selectedOptional.length === 0) {
      setInteractionResults([]);
      return;
    }

    setIsLoading(true);

    // Simulate API delay for UX
    setTimeout(() => {
      const results: SafeInteractionResult[] = [];
      
      // Check all combinations with the single recommended medicine
      selectedOptional.forEach(optional => {
        if (Array.isArray(drugData) && drugData.length > 0) {
          // Search through the actual JSON data
          const result = drugData.find(item => 
            item.primary === selectedRecommended && item.interaction_with === optional
          );

          if (result) {
            results.push({
              severity: result.severity as 'LOW' | 'MODERATE' | 'HIGH',
              medicine1: selectedRecommended,
              medicine2: optional,
              rationale: result.rationale,
              recommended_action: result.recommended_action
            });
          } else {
            // Add unknown interaction result
            results.push({
              severity: 'UNKNOWN',
              medicine1: selectedRecommended,
              medicine2: optional,
              rationale: 'No specific interaction data available for this medicine combination in our database.',
              recommended_action: 'Consult healthcare provider for clinical guidance.'
            });
          }
        }
      });

      // Sort results by severity (HIGH first, then MODERATE, then LOW, then UNKNOWN)
      const severityOrder = { 'HIGH': 0, 'MODERATE': 1, 'LOW': 2, 'UNKNOWN': 3 };
      results.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setInteractionResults(results);
      setIsLoading(false);
      
      console.log(`✅ Auto-checked ${results.length} interactions for ${selectedRecommended} with ${selectedOptional.length} optional medicines`);
    }, 500); // Reduced delay for auto-check
  };

  const resetSelection = () => {
    setSelectedRecommended('');
    setSelectedOptional([]);
    setInteractionResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drug Interaction Checker</Text>
      <Text style={styles.subtitle}>
        {drugData.length} Evidence-Based Drug Interactions Loaded
      </Text>

      <ScrollView style={styles.content}>
        {/* Recommended Medicine Selection - Vertical List */}
        <View style={styles.selectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recommended Medicine: {selectedRecommended || 'Not selected'}
            </Text>
          </View>
          
          <View style={styles.verticalList}>
            {primaryCategories.map(category => {
              const isSelected = selectedRecommended === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.verticalCategoryCard,
                    { borderColor: category.color },
                    isSelected && { 
                      backgroundColor: category.color, 
                      borderWidth: 2,
                      shadowColor: category.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }
                  ]}
                  onPress={() => toggleRecommendedSelection(category.name)}
                >
                  <Text style={[
                    styles.verticalCategoryTitle,
                    { color: isSelected ? 'white' : category.color },
                    isSelected && { fontWeight: 'bold' }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Optional Medicine Selection - Vertical List - Only show if recommended is selected */}
        {selectedRecommended && (
          <View style={styles.selectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Optional Medicine ({selectedOptional.length} selected)
              </Text>
              <TouchableOpacity 
                style={styles.bulkButton} 
                onPress={deselectAllOptional}
              >
                <Text style={styles.bulkButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.verticalList}>
              {interactionCategories.map(category => {
                const isSelected = selectedOptional.includes(category.name);
                return (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.verticalCategoryCard,
                      { borderColor: category.color },
                      isSelected && { 
                        backgroundColor: category.color, 
                        borderWidth: 2,
                        shadowColor: category.color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      }
                    ]}
                    onPress={() => toggleOptionalSelection(category.name)}
                  >
                    <Text style={[
                      styles.verticalCategoryTitle,
                      { color: isSelected ? 'white' : category.color },
                      isSelected && { fontWeight: 'bold' }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Reset Button Only */}
        {(selectedRecommended || selectedOptional.length > 0) && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
              <MaterialIcons name="refresh" size={20} color="#666" />
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Auto Results Display with Loading - List Format */}
        {selectedRecommended && selectedOptional.length > 0 && (
          <View style={styles.resultsContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D81B60" />
                <Text style={styles.loadingText}>Checking interactions...</Text>
              </View>
            ) : interactionResults.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    {interactionResults.length} Interaction Results
                  </Text>
                  
                  {/* Summary Stats */}
                  <View style={styles.summaryStats}>
                    {['HIGH', 'MODERATE', 'LOW', 'UNKNOWN'].map(severity => {
                      const count = interactionResults.filter(r => r.severity === severity).length;
                      if (count === 0) return null;
                      return (
                        <View key={severity} style={[styles.statBadge, { backgroundColor: getSeverityColor(severity) }]}>
                          <Text style={styles.statText}>{severity}: {count}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Results List - No ScrollView, just list */}
                <View style={styles.resultsList}>
                  {interactionResults.map((result, index) => (
                    <View key={`${result.medicine1}-${result.medicine2}-${index}`} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <View style={[
                          styles.severityBadge, 
                          { backgroundColor: getSeverityColor(result.severity) }
                        ]}>
                          <MaterialIcons 
                            name={getSeverityIcon(result.severity)} 
                            size={16} 
                            color="white" 
                          />
                          <Text style={styles.severityText}>{result.severity}</Text>
                        </View>
                      </View>

                      <View style={styles.resultContent}>
                        <Text style={styles.resultTitle}>
                          {result.medicine1} + {result.medicine2}
                        </Text>
                        
                        <View style={styles.detailSection}>
                          <Text style={styles.resultLabel}>Clinical Rationale:</Text>
                          <Text style={styles.resultText}>{result.rationale}</Text>
                        </View>
                        
                        <View style={styles.detailSection}>
                          <Text style={styles.resultLabel}>Recommended Action:</Text>
                          <Text style={styles.resultText}>{result.recommended_action}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Severity Legend - Only shown when results are present */}
                <View style={styles.largeSectionSpacer} />
                
                <View style={styles.severityLegendSection}>
                  <View style={styles.legendHeader}>
                    <MaterialIcons name="help" size={20} color="#2196F3" />
                    <Text style={styles.legendTitle}>Severity Legend</Text>
                  </View>
                  
                  <View style={styles.legendItems}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                      <View style={styles.legendContent}>
                        <Text style={styles.legendSeverity}>Low Severity</Text>
                        <Text style={styles.legendDescription}>
                          Minor clinical significance. Usually no change in therapy is needed but monitoring may be considered.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                      <View style={styles.legendContent}>
                        <Text style={styles.legendSeverity}>Moderate Severity</Text>
                        <Text style={styles.legendDescription}>
                          Clinically notable. May require dose adjustment, therapy modification, or closer monitoring.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
                      <View style={styles.legendContent}>
                        <Text style={styles.legendSeverity}>High Severity</Text>
                        <Text style={styles.legendDescription}>
                          Major clinical significance. Combination should generally be avoided; if unavoidable, requires strong justification and intensive monitoring.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Professional Disclaimer - Only shown with results */}
                <View style={styles.disclaimerSection}>
                  <View style={styles.disclaimerHeader}>
                    <MaterialIcons name="info" size={20} color="#FF9800" />
                    <Text style={styles.disclaimerTitle}>Important Medical Disclaimer</Text>
                  </View>
                  <Text style={styles.disclaimerText}>
                    This drug interaction information is provided for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. While every effort has been made to ensure the accuracy and completeness of the interaction data, it may not include all possible interactions. Always consult your doctor, pharmacist, or other qualified healthcare provider before starting, stopping, or changing any medication. Do not ignore professional medical advice because of something you have read in this report.
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        )}

        {/* Data Source Information */}
        <View style={styles.dataSourceSection}>
          <Text style={styles.dataSourceText}>
            Database contains {drugData.length} evidence-based drug interactions for clinical decision support.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  selectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 12,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  verticalList: {
    gap: 8,
  },
  verticalCategoryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsList: {
    gap: 12,
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
    paddingVertical: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  severityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  resultContent: {
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  disclaimerSection: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
    textAlign: 'justify',
  },
  severityLegendSection: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  legendItems: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  legendContent: {
    flex: 1,
  },
  legendSeverity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  legendDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  dataSourceSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  dataSourceText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionSpacer: {
    height: 24,
    marginVertical: 8,
  },
  largeSectionSpacer: {
    height: 40,
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  bulkButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryContent: {
    alignItems: 'center',
    gap: 8,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#D81B60',
    marginTop: 12,
    fontWeight: '500',
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultsScroll: {
    maxHeight: 400,
  },
  resultCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  resultHeader: {
    marginBottom: 8,
  },
  detailSection: {
    marginBottom: 8,
  },
});