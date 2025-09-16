import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarChart } from 'react-native-chart-kit';
import useAssessmentStore from '../store/assessmentStore';

// Import validated calculators
import { 
  calculateValidatedASCVD,
  calculateValidatedFRAX,
  calculateValidatedGail
} from '../utils/validatedCalculators';
import { type PatientRiskData } from '../utils/medicalCalculators';

// Import population baselines
import { getPopulationBaselines } from '../utils/populationBaselines';

type RootStackParamList = {
  Home: undefined;
  PersonalizedRiskCalculators: undefined;
};

type PersonalizedRiskCalculatorsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PersonalizedRiskCalculators'>;
};

export default function PersonalizedRiskCalculatorsScreen({ 
  navigation 
}: PersonalizedRiskCalculatorsScreenProps) {
  const { currentPatient } = useAssessmentStore();
  
  // Initialize patient data from store or defaults
  const [patientData, setPatientData] = useState<PatientRiskData>({
    age: currentPatient?.age || 55,
    gender: currentPatient?.gender || 'female',
    weight: currentPatient?.weight || 70,
    height: currentPatient?.height || 165,
    systolicBP: currentPatient?.systolicBP || 130,
    totalCholesterol: currentPatient?.totalCholesterol || 200,
    hdlCholesterol: currentPatient?.hdlCholesterol || 50,
    smoking: currentPatient?.smoking || false,
    diabetes: currentPatient?.diabetes || false,
    hypertension: currentPatient?.hypertension || false,
    familyHistoryCAD: currentPatient?.familyHistoryCAD || false,
    
    // FRAX specific
    personalHistoryFracture: false,
    parentHistoryHipFracture: false,
    rheumatoidArthritis: false,
    secondaryOsteoporosis: false,
    alcoholIntake: false,
    glucocorticoids: false,
    
    // Gail specific
    race: 'white',
    ageAtMenarche: 13,
    ageAtFirstBirth: 25,
    firstDegreeRelativesBC: 0,
    previousBiopsies: 0,
    atypicalHyperplasia: false,
    personalHistoryLCIS: false,
    
    // Enhanced fields
    personalHistoryBreastCancer: false,
    familyHistoryBreastCancer: false,
    personalHistoryDVT: false,
    migraine: false,
    activeCancer: false,
    liverDisease: false,
    gallbladderDisease: false,
    unexplainedVaginalBleeding: false,
    thrombophilia: currentPatient?.thrombophilia || false,
  });

  // Calculator results state
  const [ascvdResult, setASCVDResult] = useState<any>(null);
  const [fraxResult, setFRAXResult] = useState<any>(null);
  const [gailResult, setGailResult] = useState<any>(null);

  // Population comparison toggle
  const [showComparison, setShowComparison] = useState(false);

  const updatePatientData = (field: keyof PatientRiskData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAllRisks = () => {
    try {
      // Calculate ASCVD
      const ascvd = calculateValidatedASCVD(patientData);
      setASCVDResult(ascvd);

      // Calculate FRAX
      const frax = calculateValidatedFRAX(patientData);
      setFRAXResult(frax);

      // Calculate Gail
      const gail = calculateValidatedGail(patientData);
      setGailResult(gail);

      Alert.alert('Success', 'All risk calculations completed!');
    } catch (error) {
      console.error('Error calculating risks:', error);
      Alert.alert('Error', 'Failed to calculate risks. Please check input values.');
    }
  };

  useEffect(() => {
    // Auto-calculate when component loads with patient data
    if (currentPatient) {
      calculateAllRisks();
    }
  }, []);

  const getRiskColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'low': return '#4CAF50';
      case 'borderline': case 'moderate': return '#FF9800';
      case 'intermediate': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#666';
    }
  };

  // Chart configuration
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(216, 27, 96, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#D81B60'
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risk Calculators</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Personalized Risk Assessment</Text>
            <Text style={styles.introText}>
              Calculate personalized risk scores based on individual patient factors.
              All calculations use validated clinical algorithms and peer-reviewed formulas.
            </Text>
          </View>

          {/* Patient Data Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Patient Demographics:</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={patientData.age.toString()}
                  onChangeText={(text) => updatePatientData('age', parseInt(text) || 0)}
                  placeholder="55"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={patientData.weight.toString()}
                  onChangeText={(text) => updatePatientData('weight', parseFloat(text) || 0)}
                  placeholder="70"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={patientData.height.toString()}
                  onChangeText={(text) => updatePatientData('height', parseFloat(text) || 0)}
                  placeholder="165"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Systolic BP</Text>
                <TextInput
                  style={styles.textInput}
                  value={patientData.systolicBP.toString()}
                  onChangeText={(text) => updatePatientData('systolicBP', parseInt(text) || 0)}
                  placeholder="130"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Calculate Button */}
            <TouchableOpacity style={styles.calculateButton} onPress={calculateAllRisks}>
              <MaterialIcons name="calculate" size={20} color="#FFF" />
              <Text style={styles.calculateButtonText}>Calculate Risk</Text>
            </TouchableOpacity>
          </View>

          {/* Results Section */}
          {(ascvdResult || fraxResult || gailResult) && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>Risk Assessment Results</Text>
              
              {/* Population Comparison Toggle */}
              <View style={styles.comparisonToggle}>
                <Text style={styles.toggleLabel}>Show population percentiles</Text>
                <Switch
                  value={showComparison}
                  onValueChange={setShowComparison}
                  trackColor={{ false: '#E0E0E0', true: '#D81B60' }}
                  thumbColor={showComparison ? '#FFF' : '#FFF'}
                />
              </View>

              {/* ASCVD Results */}
              {ascvdResult && (
                <View style={styles.calculatorCard}>
                  <View style={styles.calculatorHeader}>
                    <MaterialIcons name="favorite" size={28} color="#F44336" />
                    <View style={styles.calculatorTitleSection}>
                      <Text style={styles.calculatorTitle}>ASCVD Risk Score</Text>
                      <Text style={styles.calculatorSubtitle}>10-year cardiovascular disease risk</Text>
                    </View>
                  </View>
                  
                  <View style={styles.resultCard}>
                    <Text style={styles.riskPercentage}>{ascvdResult.tenYearRisk}%</Text>
                    <Text style={styles.riskCategory}>{ascvdResult.riskCategory}</Text>
                  </View>
                  
                  <Text style={styles.riskInterpretation}>{ascvdResult.interpretation}</Text>
                </View>
              )}

              {/* Add charts if comparison is enabled */}
              {showComparison && ascvdResult && (
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Population Comparison</Text>
                  <Text style={styles.chartSubtitle}>Your risk vs. population baseline</Text>
                  
                  {/* Sample chart - would show real comparison data */}
                  <View style={styles.chartPlaceholder}>
                    <Text style={styles.chartPlaceholderText}>
                      Population comparison chart will be displayed here
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* New Calculators Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>📋 Coming Soon: Enhanced Calculators</Text>
            <Text style={styles.previewText}>
              • BMI Calculator with health risk assessment{'\n'}
              • BSA Calculator for drug dosing{'\n'}
              • eGFR Calculator for kidney function{'\n'}
              • HRT Risk Assessment tool
            </Text>
            <Text style={styles.previewNote}>
              These calculators are implemented and ready for testing once file system limitations are resolved.
            </Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  introSection: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inputSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D81B60',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    gap: 10,
  },
  calculateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    paddingHorizontal: 20,
  },
  comparisonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  calculatorCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  calculatorTitleSection: {
    flex: 1,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  calculatorSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  resultCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  riskPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 5,
  },
  riskCategory: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  riskInterpretation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  chartPlaceholder: {
    height: 180,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  previewSection: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  previewText: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 22,
    marginBottom: 10,
  },
  previewNote: {
    fontSize: 12,
    color: '#FF5722',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  bottomPadding: {
    height: 30,
  },
});