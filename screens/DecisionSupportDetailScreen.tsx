import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Platform,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { 
  TreatmentPlanEngine, 
  TreatmentInputs, 
  TreatmentRecommendation, 
  FiredRule 
} from '../utils/treatmentPlanEngine';
import { 
  EnhancedRiskCalculators, 
  RiskCalculationInputs, 
  RiskScoreWithConflict 
} from '../utils/enhancedRiskCalculators';

const { width } = Dimensions.get('window');

interface DecisionSupportDetailScreenProps {
  route: {
    params: {
      patientData?: any;
      riskResults?: any;
      selectedMedicine?: string;
      currentMedications?: string[];
    };
  };
}

export default function DecisionSupportDetailScreen({ route }: DecisionSupportDetailScreenProps) {
  const navigation = useNavigation();
  const engine = new TreatmentPlanEngine();
  const riskCalculators = new EnhancedRiskCalculators();
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Screen and accessibility state
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isLargeTextEnabled, setIsLargeTextEnabled] = useState(false);

  // Simulation state
  const [isSimulateMode, setIsSimulateMode] = useState(false);
  const [isAdvancedSimulate, setIsAdvancedSimulate] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Original data (from navigation params)
  const [originalInputs, setOriginalInputs] = useState<TreatmentInputs | null>(null);
  const [originalRecommendation, setOriginalRecommendation] = useState<TreatmentRecommendation | null>(null);

  // Current simulation data
  const [simulatedInputs, setSimulatedInputs] = useState<TreatmentInputs | null>(null);
  const [currentRecommendation, setCurrentRecommendation] = useState<TreatmentRecommendation | null>(null);

  // UI state
  const [expandedRules, setExpandedRules] = useState<{ [key: string]: boolean }>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize data from route params
  useEffect(() => {
    const { patientData, riskResults, selectedMedicine, currentMedications } = route.params || {};
    
    if (patientData) {
      const inputs: TreatmentInputs = {
        age: patientData.age || 50,
        sex: patientData.sex || 'female',
        weight: patientData.weight,
        height: patientData.height,
        smoking_status: patientData.smoking || false,
        systolic_bp: patientData.systolicBP,
        total_cholesterol: patientData.totalCholesterol,
        hdl_cholesterol: patientData.hdlCholesterol,
        diabetes: patientData.diabetes || false,
        family_history_mi: patientData.familyHistoryMI || false,
        
        // Risk scores with external flag
        ASCVD: riskResults?.ascvd?.score,
        ASCVD_source: riskResults?.ascvd?.score ? 'external' : undefined,
        Framingham: riskResults?.framingham?.score,
        Framingham_source: riskResults?.framingham?.score ? 'external' : undefined,
        FRAX_major: riskResults?.frax?.major,
        FRAX_major_source: riskResults?.frax?.major ? 'external' : undefined,
        GAIL_5yr: riskResults?.gail?.fiveYear,
        GAIL_5yr_source: riskResults?.gail?.fiveYear ? 'external' : undefined,
        Wells: riskResults?.wells?.score,
        Wells_source: riskResults?.wells?.score ? 'external' : undefined,
        
        selected_medicine: selectedMedicine || 'Not selected',
        current_medications: currentMedications || [],
        conditions: patientData.conditions || []
      };

      setOriginalInputs(inputs);
      setSimulatedInputs({ ...inputs });
      
      // Generate initial recommendation
      const recommendation = engine.evaluateTreatment(inputs);
      setOriginalRecommendation(recommendation);
      setCurrentRecommendation(recommendation);
    }
  }, [route.params]);

  // Check accessibility settings
  useEffect(() => {
    const checkAccessibility = async () => {
      try {
        const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
        setIsReduceMotionEnabled(reduceMotion);
        
        if (Platform.OS === 'ios') {
          const largeText = await AccessibilityInfo.isAccessibilityServiceEnabled();
          setIsLargeTextEnabled(largeText);
        }
      } catch (error) {
        console.log('Accessibility check failed:', error);
      }
    };
    
    checkAccessibility();
  }, []);

  // Debounced recalculation for simulation mode
  const debouncedRecalculate = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    setIsCalculating(true);
    debounceTimer.current = setTimeout(() => {
      if (simulatedInputs) {
        // Recalculate risk scores if needed
        const enhancedInputs = { ...simulatedInputs };
        
        // If we don't have external scores, compute them
        if (!enhancedInputs.ASCVD_source) {
          const ascvdResult = riskCalculators.calculateASCVD(enhancedInputs as RiskCalculationInputs);
          if (ascvdResult.source !== 'unavailable') {
            enhancedInputs.ASCVD = ascvdResult.value;
            enhancedInputs.ASCVD_source = 'computed';
          }
        }
        
        if (!enhancedInputs.Wells_source) {
          const wellsResult = riskCalculators.calculateWells(enhancedInputs as RiskCalculationInputs);
          if (wellsResult.source !== 'unavailable') {
            enhancedInputs.Wells = wellsResult.value;
            enhancedInputs.Wells_source = 'computed';
          }
        }
        
        const recommendation = engine.evaluateTreatment(enhancedInputs);
        setCurrentRecommendation(recommendation);
      }
      setIsCalculating(false);
    }, 300);
  };

  // Handle input changes in simulate mode
  const handleInputChange = (field: keyof TreatmentInputs, value: any) => {
    if (!isSimulateMode || !simulatedInputs) return;
    
    setSimulatedInputs(prev => ({
      ...prev!,
      [field]: value
    }));
    
    debouncedRecalculate();
  };

  // Reset simulation to original values
  const resetSimulation = () => {
    if (originalInputs) {
      setSimulatedInputs({ ...originalInputs });
      setCurrentRecommendation(originalRecommendation);
      setShowComparison(false);
    }
  };

  // Toggle rule expansion
  const toggleRule = (ruleId: string) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  // Get strength color
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong': return '#4CAF50';
      case 'Conditional': return '#FF9800';
      case 'Not recommended': return '#F44336';
      default: return '#757575';
    }
  };

  // Get strength background color
  const getStrengthBackgroundColor = (strength: string) => {
    switch (strength) {
      case 'Strong': return '#E8F5E8';
      case 'Conditional': return '#FFF3E0';
      case 'Not recommended': return '#FFEBEE';
      default: return '#F5F5F5';
    }
  };

  if (!currentRecommendation || !simulatedInputs) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading treatment analysis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isLargeTextEnabled && styles.largeText]}>
          Treatment Analysis
        </Text>
        <TouchableOpacity
          style={styles.simulateButton}
          onPress={() => setIsSimulateMode(!isSimulateMode)}
          accessibilityLabel={isSimulateMode ? 'Exit simulate mode' : 'Enter simulate mode'}
          accessibilityRole="button"
        >
          <Ionicons 
            name={isSimulateMode ? "close" : "flask"} 
            size={24} 
            color={isSimulateMode ? "#F44336" : "#2196F3"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Simulate Mode Controls */}
        {isSimulateMode && (
          <View style={styles.simulateModeContainer}>
            <View style={styles.simulateHeader}>
              <Ionicons name="flask" size={20} color="#2196F3" />
              <Text style={styles.simulateModeTitle}>Simulation Mode</Text>
            </View>
            
            <View style={styles.simulateControls}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Advanced (edit all inputs)</Text>
                <Switch
                  value={isAdvancedSimulate}
                  onValueChange={setIsAdvancedSimulate}
                  trackColor={{ false: '#DDDDDD', true: '#2196F3' }}
                  thumbColor={isAdvancedSimulate ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
              
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetSimulation}
                  accessibilityRole="button"
                  accessibilityLabel="Reset to original values"
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.compareButton}
                  onPress={() => setShowComparison(!showComparison)}
                  accessibilityRole="button"
                  accessibilityLabel="Compare original vs simulated"
                >
                  <Text style={styles.compareButtonText}>
                    {showComparison ? 'Hide' : 'Compare'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Editable Fields */}
            <View style={styles.editableFields}>
              <Text style={styles.sectionTitle}>Editable Parameters</Text>
              
              {/* Selected Medicine */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Selected Medicine</Text>
                <TextInput
                  style={styles.textInput}
                  value={simulatedInputs.selected_medicine}
                  onChangeText={(value) => handleInputChange('selected_medicine', value)}
                  placeholder="Select medicine"
                  accessibilityLabel="Selected medicine input"
                />
              </View>

              {/* Age */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={simulatedInputs.age?.toString() || ''}
                  onChangeText={(value) => handleInputChange('age', parseInt(value) || 0)}
                  placeholder="Age"
                  keyboardType="numeric"
                  accessibilityLabel="Age input"
                />
              </View>

              {/* Weight */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={simulatedInputs.weight?.toString() || ''}
                  onChangeText={(value) => handleInputChange('weight', parseFloat(value) || undefined)}
                  placeholder="Weight in kg"
                  keyboardType="numeric"
                  accessibilityLabel="Weight input"
                />
              </View>

              {/* Smoking Status */}
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Smoking Status</Text>
                <Switch
                  value={simulatedInputs.smoking_status || false}
                  onValueChange={(value) => handleInputChange('smoking_status', value)}
                  trackColor={{ false: '#DDDDDD', true: '#FF9800' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Blood Pressure */}
              {isAdvancedSimulate && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Systolic BP (mmHg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={simulatedInputs.systolic_bp?.toString() || ''}
                    onChangeText={(value) => handleInputChange('systolic_bp', parseInt(value) || undefined)}
                    placeholder="Systolic blood pressure"
                    keyboardType="numeric"
                    accessibilityLabel="Systolic blood pressure input"
                  />
                </View>
              )}

              {/* Diabetes */}
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Diabetes</Text>
                <Switch
                  value={simulatedInputs.diabetes || false}
                  onValueChange={(value) => handleInputChange('diabetes', value)}
                  trackColor={{ false: '#DDDDDD', true: '#F44336' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

        {/* Clinician Review Banner */}
        {currentRecommendation.clinicianReviewRequired && (
          <View style={styles.reviewBanner}>
            <Ionicons name="warning" size={20} color="#FF6B35" />
            <Text style={styles.reviewBannerText}>
              Clinician Review Required
            </Text>
          </View>
        )}

        {/* Summary of Inputs */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, isLargeTextEnabled && styles.largeText]}>
            Patient Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Age</Text>
              <Text style={styles.summaryValue}>{simulatedInputs.age}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Sex</Text>
              <Text style={styles.summaryValue}>{simulatedInputs.sex}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Selected Medicine</Text>
              <Text style={styles.summaryValue}>{simulatedInputs.selected_medicine}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current Medications</Text>
              <Text style={styles.summaryValue}>
                {simulatedInputs.current_medications.length > 0 
                  ? simulatedInputs.current_medications.join(', ')
                  : 'None'
                }
              </Text>
            </View>
          </View>
          
          {/* Risk Scores */}
          <View style={styles.riskScores}>
            <Text style={styles.riskScoresTitle}>Risk Scores</Text>
            {simulatedInputs.ASCVD && (
              <View style={styles.riskScore}>
                <Text style={styles.riskScoreLabel}>ASCVD 10-year</Text>
                <Text style={styles.riskScoreValue}>{simulatedInputs.ASCVD}%</Text>
                <Text style={styles.riskScoreSource}>
                  ({simulatedInputs.ASCVD_source})
                </Text>
              </View>
            )}
            {simulatedInputs.Wells !== undefined && (
              <View style={styles.riskScore}>
                <Text style={styles.riskScoreLabel}>Wells VTE</Text>
                <Text style={styles.riskScoreValue}>{simulatedInputs.Wells}</Text>
                <Text style={styles.riskScoreSource}>
                  ({simulatedInputs.Wells_source})
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Primary Recommendation */}
        <View style={[
          styles.recommendationCard,
          { backgroundColor: getStrengthBackgroundColor(currentRecommendation.primaryRecommendation.strength) }
        ]}>
          <View style={styles.recommendationHeader}>
            <Text style={[styles.strengthBadge, { color: getStrengthColor(currentRecommendation.primaryRecommendation.strength) }]}>
              {currentRecommendation.primaryRecommendation.strength.toUpperCase()}
            </Text>
            {isCalculating && (
              <Text style={styles.calculatingText}>Recalculating...</Text>
            )}
          </View>
          <Text style={[styles.recommendationText, isLargeTextEnabled && styles.largeText]}>
            {currentRecommendation.primaryRecommendation.text}
          </Text>
        </View>

        {/* Fired Rules Panel */}
        {currentRecommendation.firedRules.length > 0 && (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => toggleRule('fired-rules')}
              accessibilityRole="button"
              accessibilityLabel="Toggle fired rules details"
            >
              <Text style={[styles.cardTitle, isLargeTextEnabled && styles.largeText]}>
                Why this recommendation? ({currentRecommendation.firedRules.length} rules fired)
              </Text>
              <Ionicons
                name={expandedRules['fired-rules'] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#333"
              />
            </TouchableOpacity>
            
            {expandedRules['fired-rules'] && (
              <View style={styles.rulesContainer}>
                {currentRecommendation.firedRules.map((rule, index) => (
                  <View key={rule.id} style={styles.ruleItem}>
                    <View style={styles.ruleHeader}>
                      <Text style={styles.ruleId}>{rule.id}</Text>
                      <Text style={styles.ruleSource}>{rule.sourceFile}</Text>
                    </View>
                    <Text style={styles.ruleDescription}>{rule.description}</Text>
                    {rule.severity && (
                      <Text style={[styles.ruleSeverity, { color: rule.severity === 'high' ? '#F44336' : '#FF9800' }]}>
                        Severity: {rule.severity}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Alternatives */}
        {currentRecommendation.alternatives.length > 0 && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isLargeTextEnabled && styles.largeText]}>
              Alternative Approaches
            </Text>
            {currentRecommendation.alternatives.map((alternative, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.listText}>{alternative}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Monitoring */}
        {currentRecommendation.monitoring.length > 0 && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isLargeTextEnabled && styles.largeText]}>
              Monitoring Plan
            </Text>
            {currentRecommendation.monitoring.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Comparison View */}
        {showComparison && originalRecommendation && (
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Original vs Simulated</Text>
            
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonColumn}>
                <Text style={styles.comparisonLabel}>Original</Text>
                <Text style={styles.comparisonRecommendation}>
                  {originalRecommendation.primaryRecommendation.text}
                </Text>
                <Text style={styles.comparisonStrength}>
                  {originalRecommendation.primaryRecommendation.strength}
                </Text>
              </View>
              
              <View style={styles.comparisonColumn}>
                <Text style={styles.comparisonLabel}>Simulated</Text>
                <Text style={styles.comparisonRecommendation}>
                  {currentRecommendation.primaryRecommendation.text}
                </Text>
                <Text style={styles.comparisonStrength}>
                  {currentRecommendation.primaryRecommendation.strength}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  simulateButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  simulateModeContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  simulateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  simulateModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  simulateControls: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  compareButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editableFields: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  reviewBanner: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  riskScores: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  riskScoresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  riskScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskScoreLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  riskScoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  riskScoreSource: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthBadge: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  calculatingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rulesContainer: {
    marginTop: 12,
  },
  ruleItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ruleId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  ruleSource: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  ruleDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  ruleSeverity: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  comparisonCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
    marginBottom: 12,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
  },
  comparisonColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C27B0',
    marginBottom: 4,
  },
  comparisonRecommendation: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    minHeight: 40,
  },
  comparisonStrength: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  largeText: {
    fontSize: 18,
  },
});