/**
 * Enhanced Evidence-Based Decision Support Screen
 * Comprehensive medicine analysis with remove controls and interaction checking
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
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useAssessmentStore from '../store/assessmentStore';

// Import enhanced components and utilities
import MedicineSelector from '../components/MedicineSelector';
import DrugInteractionDisplay from '../components/DrugInteractionDisplay';
import DrugInteractionChecking from '../components/DrugInteractionChecking';
import AnalysisResultsDisplay from '../components/AnalysisResultsDisplay';
import { medicinePersistence } from '../utils/medicinePersistence';
import { 
  findDrugInteractions,
  groupInteractionsBySeverity,
  GroupedInteractionResults,
  DrugInteractionResult
} from '../utils/drugInteractionHandler';
import {
  performDrugChecking,
  getInteractionLoadStatus,
  clearInteractionCache,
  type CheckingResult
} from '../utils/drugInteractionMapping';

// Local type definitions for medicine analysis
export interface MedicineItem {
  id: string;
  name: string;
  displayName?: string;
  category: string;
  type?: string;
  severity?: 'low' | 'medium' | 'high';
  key?: string;
  selected?: boolean;
  timestamp?: string;
  selectedFromType?: string;
}

export interface AnalysisResult {
  interactions?: any[];
  summary?: {
    totalInteractions: number;
    highSeverityCount: number;
    mediumSeverityCount: number;
    lowSeverityCount: number;
  };
  medicineAnalysis?: any[];
  timestamp?: string;
  medications?: string[];
  contraindications?: any[];
  duplicateTherapies?: any[];
  riskFactors?: any[];
}

// Import the new drug interaction mapper
import {
  initializeDrugInteractionMapper,
  findBestRule,
  analyzeMedicationsForPrimary,
  formatInteractionDisplay,
  getSeverityColor,
  getSeverityIcon,
  isUnknownMedication,
  type InteractionResult
} from '../utils/drugInteractionMapper';

// Import comprehensive drug rules system
import {
  loadLocalRules,
  findInteractionsForSelection,
  analyzeInteractionsWithLogging,
  type MergedResult
} from '../utils/drugRules';

// Import settings and API integration
import { loadDrugCheckSettings, type DrugCheckSettings } from '../utils/drugSettings';

// Import existing decision support utilities for Evidence-Based Decision Support
import { 
  MEDICATION_CATEGORIES,
  MEDICINE_TYPES,
  getMedicineTypeContraindications,
  getMedicineTypeRecommendations,
  getMedicineTypeAlternatives,
  type MedicationCategory,
  type MedicineType,
  type ContraindicationAlert,
  type TreatmentRecommendation,
  type AlternativeTherapy
} from '../utils/drugInteractionChecker';

// Re-export types from drugInteractionChecker for backward compatibility

// Import existing treatment generator for backward compatibility
import medicineBasedTreatmentGenerator, { 
  type SelectedMedicine, 
  type TreatmentPlanOutput 
} from '../utils/medicineBasedTreatmentGenerator';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function DecisionSupportScreen({ navigation }: Props) {
  const { currentPatient } = useAssessmentStore();
  
  // Enhanced medicine state management
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  
  // State for Evidence-Based Decision Support
  const [selectedMedicineType, setSelectedMedicineType] = useState<string | null>(null);
  const [selectedMedicationCategories, setSelectedMedicationCategories] = useState<string[]>([]);
  const [drugInteractions, setDrugInteractions] = useState<any[]>([]);
  const [contraindications, setContraindications] = useState<ContraindicationAlert[]>([]);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState<TreatmentRecommendation[]>([]);
  const [alternativeTherapies, setAlternativeTherapies] = useState<AlternativeTherapy[]>([]);
  
  // New state for comprehensive analysis
  const [comprehensiveResults, setComprehensiveResults] = useState<MergedResult[]>([]);
  const [groupedInteractionResults, setGroupedInteractionResults] = useState<GroupedInteractionResults | null>(null);
  const [settings, setSettings] = useState<DrugCheckSettings | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showApiRetry, setShowApiRetry] = useState(false);
  
  // New Drug Interaction Checking states
  const [checkingResults, setCheckingResults] = useState<CheckingResult[]>([]);
  const [checkingLoadError, setCheckingLoadError] = useState<string | null>(null);
  const [isLocalMapping, setIsLocalMapping] = useState(true);
  
  // Treatment plan generation states
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  
  // Function to perform real-time interaction checking
  const performRealTimeChecking = useCallback(async () => {
    if (medicines.length < 2) {
      setCheckingResults([]);
      return;
    }
    
    try {
      console.log('🔍 Performing real-time drug checking...');
      
      // Check interaction load status
      const loadStatus = await getInteractionLoadStatus();
      if (loadStatus.status === 'error') {
        setCheckingLoadError(loadStatus.error || 'Failed to load interaction data');
      } else {
        setCheckingLoadError(null);
      }
      
      // Separate main medicines from optional medicines
      const mainMedicines = medicines.filter(med => 
        med.type === 'primary' || 
        med.selectedFromType === selectedMedicineType ||
        (selectedMedicineType && med.category?.toLowerCase().includes(selectedMedicineType.toLowerCase()))
      );
      
      const optionalMedicines = medicines.filter(med => 
        med.type !== 'primary' && 
        med.selectedFromType !== selectedMedicineType &&
        !(selectedMedicineType && med.category?.toLowerCase().includes(selectedMedicineType.toLowerCase()))
      );
      
      if (mainMedicines.length === 0 || optionalMedicines.length === 0) {
        setCheckingResults([]);
        console.log('⚠️ No main or optional medicines to check');
        return;
      }
      
      // Use the first main medicine for checking
      const mainMedicine = mainMedicines[0].displayName || mainMedicines[0].name;
      
      // Prepare optional medicines for checking
      const optionalMeds = optionalMedicines.map(med => ({
        name: med.name,
        displayName: med.displayName || med.name
      }));
      
      console.log(`🔍 Checking: main=${mainMedicine}, optionals=[${optionalMeds.map(m => m.displayName).join(', ')}]`);
      
      // Perform drug checking using the new mapping utility
      const results = await performDrugChecking(mainMedicine, optionalMeds);
      setCheckingResults(results);
      
      console.log(`✅ Checking complete: ${results.length} results`);
      
    } catch (error) {
      console.error('❌ Real-time checking failed:', error);
      setCheckingLoadError(error instanceof Error ? error.message : 'Unknown error during checking');
      setCheckingResults([]);
    }
  }, [medicines, selectedMedicineType]);
  
  // Trigger real-time checking whenever medicines change
  useEffect(() => {
    if (medicines.length > 0) {
      performRealTimeChecking();
    } else {
      setCheckingResults([]);
    }
  }, [medicines, performRealTimeChecking]);
  useEffect(() => {
    if (currentPatient) {
      loadPatientMedicines();
    }
  }, [currentPatient]);

  // Effect for Evidence-Based Decision Support - medicine type selection
  useEffect(() => {
    if (selectedMedicineType && currentPatient) {
      updateSectionsForMedicineType();
    } else {
      setContraindications([]);
      setTreatmentRecommendations([]);
      setAlternativeTherapies([]);
    }
  }, [selectedMedicineType, currentPatient]);

  // Initialize drug interaction mapper and load settings on component mount
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('🚀 Initializing comprehensive drug interaction system...');
        
        // Load settings
        const loadedSettings = await loadDrugCheckSettings();
        setSettings(loadedSettings);
        
        // Initialize drug interaction mapper
        await initializeDrugInteractionMapper();
        
        // Load local rules
        await loadLocalRules();
        
        console.log('✅ Drug interaction system initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize drug interaction system:', error);
        setApiError('Failed to initialize drug interaction system');
      }
    };

    initializeSystem();
  }, []);

  const loadPatientMedicines = async () => {
    if (!currentPatient) return;
    
    try {
      const savedMedicines = await medicinePersistence.loadMedicinesForPatient(currentPatient.id);
      setMedicines(savedMedicines);
      
      // Clear any cached analysis to force use of new system
      await medicinePersistence.invalidateAnalysisCache(currentPatient.id);
      console.log('🧹 Cleared cached analysis to ensure new drug rules system is used');
      
    } catch (error) {
      console.error('Failed to load patient medicines:', error);
    }
  };

  const saveMedicines = async (updatedMedicines: MedicineItem[]) => {
    if (!currentPatient) return;
    
    try {
      await medicinePersistence.saveMedicinesForPatient(currentPatient.id, updatedMedicines);
    } catch (error) {
      console.error('Failed to save medicines:', error);
    }
  };

  // Enhanced medicine analysis using drug_interactions.json
  const analyzeMedicines = useCallback(async () => {
    if (medicines.length === 0) {
      Alert.alert('No Medicines', 'Please select medicines to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);
    setShowApiRetry(false);
    
    try {
      console.log('🔍 Starting drug interaction analysis...');
      
      // Separate main medicines from optional medicines
      const mainMedicines = medicines.filter(med => med.type === 'primary' || med.category.includes('HRT') || med.category.includes('Hormone'));
      const optionalMedicines = medicines.filter(med => med.type !== 'primary' && !med.category.includes('HRT') && !med.category.includes('Hormone'));
      
      // If no clear main medicine, treat the first one as main
      let mainMedicine: string;
      let optionalMeds: string[];
      
      if (mainMedicines.length > 0) {
        mainMedicine = mainMedicines[0].displayName || mainMedicines[0].name;
        optionalMeds = [...mainMedicines.slice(1), ...optionalMedicines].map(med => med.displayName || med.name);
      } else {
        mainMedicine = medicines[0].displayName || medicines[0].name;
        optionalMeds = medicines.slice(1).map(med => med.displayName || med.name);
      }
      
      console.log(`Main medicine: ${mainMedicine}`);
      console.log(`Optional medicines: ${optionalMeds.join(', ')}`);
      
      // Find interactions using our new handler
      const interactions = await findDrugInteractions(mainMedicine, optionalMeds);
      
      // Group by severity
      const groupedResults = groupInteractionsBySeverity(interactions);
      
      // Store grouped results for the new display component
      setGroupedInteractionResults(groupedResults);
      
      // Also maintain backward compatibility with existing analysis display
      const compatibleResult = {
        interactions: interactions.map(interaction => ({
          medication: `${interaction.mainMedicine} + ${interaction.optionalMedicine}`,
          severity: interaction.severity,
          description: interaction.rationale,
          recommendedAction: interaction.recommendedAction,
          source: 'Local Rules'
        })),
        summary: {
          totalInteractions: interactions.length,
          highSeverityCount: interactions.filter(i => i.severity === 'HIGH').length,
          mediumSeverityCount: interactions.filter(i => i.severity === 'MODERATE').length,
          lowSeverityCount: interactions.filter(i => i.severity === 'LOW').length
        },
        analysisStatus: 'complete' as const
      };
      
      setAnalysisResult(compatibleResult);
      
      // Save results to persistence
      if (currentPatient) {
        await medicinePersistence.cacheAnalysisResult(currentPatient.id, compatibleResult);
      }
      
      console.log(`✅ Analysis complete: ${interactions.length} interactions found`);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setApiError('Failed to analyze medicine interactions: ' + (error as Error).message);
      setShowApiRetry(true);
    } finally {
      setIsAnalyzing(false);
    }
  }, [medicines, currentPatient]);



  const removeMedicine = useCallback(async (medicineId: string) => {
    if (!currentPatient) return;
    
    try {
      const updatedMedicines = medicines.filter(m => m.id !== medicineId);
      setMedicines(updatedMedicines);
      await saveMedicines(updatedMedicines);
      
      // Clear analysis results since medicines changed
      setAnalysisResult(null);
      setGroupedInteractionResults(null);
      await medicinePersistence.invalidateAnalysisCache(currentPatient.id);
      
      // Immediately re-analyze if there are still medicines
      if (updatedMedicines.length > 0) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          analyzeMedicines();
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove medicine: ' + (error as Error).message);
    }
  }, [medicines, currentPatient, analyzeMedicines]);

  const removeMultipleMedicines = useCallback(async (medicineIds: string[]) => {
    if (!currentPatient) return;
    
    try {
      const updatedMedicines = medicines.filter(m => !medicineIds.includes(m.id));
      setMedicines(updatedMedicines);
      await saveMedicines(updatedMedicines);
      
      // Clear analysis results since medicines changed
      setAnalysisResult(null);
      setGroupedInteractionResults(null);
      await medicinePersistence.invalidateAnalysisCache(currentPatient.id);
      
      setShowMultiSelect(false);
      
      // Immediately re-analyze if there are still medicines
      if (updatedMedicines.length > 0) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          analyzeMedicines();
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove medicines: ' + (error as Error).message);
    }
  }, [medicines, currentPatient, analyzeMedicines]);








  // Evidence-Based Decision Support functions
  const updateSectionsForMedicineType = () => {
    if (!currentPatient || !selectedMedicineType) return;

    const medicineContraindications = getMedicineTypeContraindications(currentPatient, selectedMedicineType);
    setContraindications(medicineContraindications);

    const recommendations = getMedicineTypeRecommendations(currentPatient, selectedMedicineType, medicineContraindications);
    setTreatmentRecommendations(recommendations);

    const hasContraindications = medicineContraindications.length > 0;
    const alternatives = getMedicineTypeAlternatives(selectedMedicineType, hasContraindications);
    setAlternativeTherapies(alternatives);
  };

  // Evidence-Based Decision Support handlers
  const handleMedicineTypeSelection = (medicineTypeId: string) => {
    setSelectedMedicineType(medicineTypeId);
  };

  const handleMedicationCategoryToggle = (categoryId: string) => {
    setSelectedMedicationCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };





  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open link. Please check your internet connection.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open external link.');
    }
  };

  // Legacy treatment plan generation
  const generateTreatmentPlan = async () => {
    console.log('🚀 Starting treatment plan generation...');
    
    setIsGeneratingPlan(true);
    setGenerationProgress('Initializing treatment plan generation...');

    try {
      if (medicines.length === 0) {
        setGenerationProgress('No medicines selected - generating general recommendations...');
        navigation.navigate('TreatmentPlan', { 
          generatedPlan: {
            id: 'general-plan-' + Date.now(),
            generatedAt: new Date().toISOString(),
            patientId: currentPatient?.id || 'anonymous',
            selectedMedicines: [],
            primaryRecommendations: [
              {
                id: 'rec-1',
                recommendation: 'Consider comprehensive assessment of menopausal symptoms',
                rationale: 'Individual treatment plans should be based on symptom severity and patient preferences'
              }
            ],
            interactionWarnings: [],
            alternativeTherapies: [],
            rationale: [],
            monitoring: [],
            specialNotes: [],
            isOfflineGenerated: true
          },
          selectedMedicines: []
        });
        return;
      }

      setGenerationProgress(`Analyzing ${medicines.length} selected medicine(s)...`);
      
      // Convert to legacy format for compatibility
      const legacyMedicines: SelectedMedicine[] = medicines.map(med => ({
        id: med.id,
        name: med.name,
        type: med.type,
        category: med.category
      }));

      const plan = await medicineBasedTreatmentGenerator.generateTreatmentPlan(
        legacyMedicines,
        {
          age: currentPatient?.age,
          gender: currentPatient?.gender || 'female',
          personalHistoryBreastCancer: currentPatient?.personalHistoryBreastCancer,
          personalHistoryDVT: currentPatient?.personalHistoryDVT,
          hypertension: currentPatient?.hypertension,
          diabetes: currentPatient?.diabetes,
          smoking: currentPatient?.smoking,
          liverDisease: currentPatient?.liverDisease,
          unexplainedVaginalBleeding: currentPatient?.unexplainedVaginalBleeding,
          currentMedications: currentPatient?.currentMedications,
          allergies: currentPatient?.allergies,
        },
        currentPatient?.id
      );
      
      setGenerationProgress('Treatment plan generated successfully!');
      
      navigation.navigate('TreatmentPlan', { 
        generatedPlan: plan,
        selectedMedicines: legacyMedicines
      });

    } catch (error) {
      console.error('❌ Treatment plan generation error:', error);
      Alert.alert(
        'Treatment Plan Generation Failed',
        'Failed to generate treatment plan. Would you like to retry?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: generateTreatmentPlan }
        ]
      );
    } finally {
      setIsGeneratingPlan(false);
      setGenerationProgress('');
    }
  };

  // Helper functions for Evidence-Based Decision Support styling
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'moderate': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recommended': return '#4CAF50';
      case 'caution': return '#FF9800';
      case 'not_recommended': return '#F44336';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return 'medication';
      case 'lifestyle': return 'fitness-center';
      case 'psychological': return 'psychology';
      case 'complementary': return 'spa';
      default: return 'info';
    }
  };

  // Main component render
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
          <Text style={styles.headerTitle}></Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Drug Interaction Checker - Default First Panel */}
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <MaterialIcons name="warning" size={28} color="#FF9800" />
              <Text style={styles.featureTitle}>Drug Interaction Checker</Text>
            </View>
            
            <Text style={styles.featureDescription}>
              First, select the type of medicine you are considering, then choose any current medications to check for interactions.
            </Text>
            
            {/* Medicine Type Selector */}
            <View style={styles.medicineTypeSection}>
              <Text style={styles.sectionSubtitle}>Select Medicine Type:</Text>
              <View style={styles.medicineTypeGrid}>
                {MEDICINE_TYPES.map((medicineType) => (
                  <TouchableOpacity
                    key={medicineType.id}
                    style={[
                      styles.medicineTypeCard,
                      selectedMedicineType === medicineType.id && styles.medicineTypeCardSelected
                    ]}
                    onPress={() => handleMedicineTypeSelection(medicineType.id)}
                  >
                    <View style={styles.medicineTypeHeader}>
                      <MaterialIcons 
                        name={
                          medicineType.category === 'hormonal' ? 'local-pharmacy' :
                          medicineType.category === 'herbal' ? 'eco' : 'medical-services'
                        } 
                        size={20} 
                        color={selectedMedicineType === medicineType.id ? "#D81B60" : "#666"} 
                      />
                      <Text style={[
                        styles.medicineTypeName,
                        selectedMedicineType === medicineType.id && styles.medicineTypeNameSelected
                      ]}>
                        {medicineType.name}
                      </Text>
                    </View>
                    <Text style={styles.medicineTypeDescription}>{medicineType.description}</Text>
                    <View style={[
                      styles.riskLevelBadge,
                      { backgroundColor: 
                        medicineType.riskLevel === 'high' ? '#FFEBEE' :
                        medicineType.riskLevel === 'moderate' ? '#FFF3E0' : '#E8F5E8'
                      }
                    ]}>
                      <Text style={[
                        styles.riskLevelText,
                        { color: 
                          medicineType.riskLevel === 'high' ? '#F44336' :
                          medicineType.riskLevel === 'moderate' ? '#FF9800' : '#4CAF50'
                        }
                      ]}>
                        {medicineType.riskLevel.toUpperCase()} RISK
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Current Medications Selector - Only show if medicine type selected */}
            {selectedMedicineType && (
              <View style={styles.medicationCategoriesSection}>
                <View>
                  <Text style={styles.sectionSubtitle}>Current Medications (Optional):</Text>
                  <Text style={styles.categoriesDescription}>
                    Medicines from your assessment will appear here for interaction checking:
                  </Text>
                </View>

                {/* Display selected medicines */}
                {medicines.length > 0 && (
                  <View style={styles.selectedMedicinesSection}>
                    <MedicineSelector
                      medicines={medicines}
                      onRemoveMedicine={removeMedicine}
                      onRemoveMultipleMedicines={removeMultipleMedicines}
                      multiSelectMode={showMultiSelect}
                      showRemoveControls={true}
                      accessibilityLabel="Selected medicines for analysis"
                    />
                  </View>
                )}

                {/* Real-time Drug Interaction Checking Section */}
                <DrugInteractionChecking
                  checkingResults={checkingResults}
                  isLocalMapping={isLocalMapping}
                  hasLoadError={checkingLoadError !== null}
                  loadErrorMessage={checkingLoadError || undefined}
                />
                {MEDICATION_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedMedicationCategories.includes(category.id) && styles.categoryCardSelected
                    ]}
                    onPress={() => handleMedicationCategoryToggle(category.id)}
                  >
                    <View style={styles.categoryHeader}>
                      <MaterialIcons 
                        name={selectedMedicationCategories.includes(category.id) ? "check-box" : "check-box-outline-blank"} 
                        size={20} 
                        color={selectedMedicationCategories.includes(category.id) ? "#D81B60" : "#999"} 
                      />
                      <Text style={[
                        styles.categoryName,
                        selectedMedicationCategories.includes(category.id) && styles.categoryNameSelected
                      ]}>
                        {category.name}
                      </Text>
                    </View>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                    <Text style={styles.categoryExamples}>
                      Examples: {category.examples ? category.examples.slice(0, 3).join(', ') : 'None available'}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Analyze Selected Medicines Button */}
                {medicines.length > 0 && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.analyzeMedicinesButton,
                        isAnalyzing && styles.analyzeMedicinesButtonDisabled
                      ]}
                      onPress={analyzeMedicines}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <ActivityIndicator size="small" color="white" />
                          <Text style={styles.analyzeMedicinesButtonText}>Analyzing...</Text>
                        </>
                      ) : (
                        <>
                          <MaterialIcons name="science" size={20} color="white" />
                          <Text style={styles.analyzeMedicinesButtonText}>
                            Analyze {medicines.length} Medicine{medicines.length > 1 ? 's' : ''}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Drug Interaction Analysis Results */}
                    {groupedInteractionResults ? (
                      <DrugInteractionDisplay
                        groupedResults={groupedInteractionResults}
                        isLoading={isAnalyzing}
                      />
                    ) : analysisResult ? (
                      <AnalysisResultsDisplay
                        analysisResult={analysisResult}
                        onRetryAnalysis={analyzeMedicines}
                        isLoading={isAnalyzing}
                      />
                    ) : null}
                  </>
                )}
              </View>
            )}

            {/* Drug Interactions Display */}
            {drugInteractions.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>Interaction Results ({drugInteractions.length}):</Text>
                {drugInteractions.map((interaction, index) => (
                  <View key={index} style={[styles.interactionCard, { borderLeftColor: getSeverityColor(interaction.severity) }]}>
                    <View style={styles.interactionHeader}>
                      <Text style={styles.medicationName}>
                        {interaction.medications ? interaction.medications.join(', ') : 
                         interaction.medication ? interaction.medication : 'Unknown medications'}
                      </Text>
                      <Text style={[styles.severityBadge, { backgroundColor: getSeverityColor(interaction.severity) }]}>
                        {interaction.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.interactionMessage}>{interaction.message}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Learn More About Drug Interactions */}
            <TouchableOpacity 
              style={styles.learnMoreButton}
              onPress={() => openExternalLink('https://www.fda.gov/drugs/drug-interactions-labeling/drug-development-and-drug-interactions-table-substrates-inhibitors-and-inducers')}
            >
              <Text style={styles.learnMoreText}>Learn More About Drug Interactions</Text>
              <MaterialIcons name="open-in-new" size={16} color="#D81B60" />
            </TouchableOpacity>




          </View>







          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featureCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  featureDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  medicineManagementSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  multiSelectToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F8FF',
    borderRadius: 6,
    gap: 4,
  },
  multiSelectText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  quickMedicineButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickMedicineButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  quickMedicineText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
  },
  customMedicineInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicineInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
  },

  medicineSelectorContainer: {
    minHeight: 120,
    marginBottom: 16,
  },
  treatmentPlanSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  treatmentButtonsContainer: {
    gap: 12,
  },
  treatmentPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D81B60',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  treatmentPlanButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  rulesBasedTreatmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  rulesBasedTreatmentButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  viewDecisionSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28A745',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomPadding: {
    height: 100,
  },
  // Medicine Type Selection Styles
  medicineTypeSection: {
    marginBottom: 20,
  },
  medicineTypeGrid: {
    gap: 12,
    marginTop: 12,
  },
  medicineTypeCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  medicineTypeCardSelected: {
    backgroundColor: '#FFF0F5',
    borderColor: '#D81B60',
  },
  medicineTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  medicineTypeNameSelected: {
    color: '#D81B60',
  },
  medicineTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  riskLevelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Medication Categories Styles
  medicationCategoriesSection: {
    marginBottom: 20,
  },
  categoriesDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  categoryCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryCardSelected: {
    backgroundColor: '#FFF0F5',
    borderColor: '#D81B60',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  categoryNameSelected: {
    color: '#D81B60',
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  categoryExamples: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  // Drug Interactions Results Styles
  resultsSection: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  interactionCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  interactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interactionMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  learnMoreText: {
    fontSize: 14,
    color: '#D81B60',
    fontWeight: '500',
  },
  

  
  selectedMedicinesSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  
  analyzeMedicinesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  
  analyzeMedicinesButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  
  analyzeMedicinesButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },

  // Treatment Plan Additional Styles
  treatmentPlanButtonNoMeds: {
    backgroundColor: '#28A745',
  },
  treatmentPlanDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  herbalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  herbalWarningText: {
    fontSize: 14,
    color: '#FF9800',
    flex: 1,
  },
  
  // Checking Section Styles
  checkingSection: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  checkingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  
  checkingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
  },
  
  checkingItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  checkingMedicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  checkingMedicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  
  checkingSeverityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  
  checkingSeverityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  checkingRationale: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});