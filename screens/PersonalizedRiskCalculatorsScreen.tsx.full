import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import useAssessmentStore from '../store/assessmentStore';

// Import validated calculators
import { 
  calculateValidatedASCVD,
  calculateValidatedFRAX,
  calculateValidatedGail
} from '../utils/validatedCalculators';
import { type PatientRiskData } from '../utils/medicalCalculators';

// Import clinical calculators
import {
  calculateBMI,
  calculateBSA,
  calculateeGFR,
  calculateHRTRisk,
  type BMIResult,
  type BSAResult,
  type eGFRResult,
  type HRTRiskResult
} from '../utils/clinicalCalculators';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function PersonalizedRiskCalculatorsScreen({ navigation }: Props) {
  const { currentPatient } = useAssessmentStore();
  const [showPopulationBaselines, setShowPopulationBaselines] = useState(true);
  const [patientData, setPatientData] = useState<PatientRiskData>({
    age: currentPatient?.age || 50,
    gender: 'female',
    weight: currentPatient?.weight || 70,
    height: currentPatient?.height || 165,
    smoking: currentPatient?.smoking || false,
    diabetes: currentPatient?.diabetes || false,
    hypertension: currentPatient?.hypertension || false,
    cholesterolHigh: currentPatient?.cholesterolHigh || false,
    familyHistoryBreastCancer: currentPatient?.familyHistoryBreastCancer || false,
    personalHistoryBreastCancer: currentPatient?.personalHistoryBreastCancer || false,
    personalHistoryDVT: currentPatient?.personalHistoryDVT || false,
    thrombophilia: currentPatient?.thrombophilia || false,
    menopausalStatus: currentPatient?.menopausalStatus || 'postmenopausal',
    hysterectomy: currentPatient?.hysterectomy || false,
    
    // Additional fields for validated calculators
    totalCholesterol: 200,
    hdlCholesterol: 50,
    systolicBP: 120,
    hypertensionTreated: false,
    statinUse: false,
    race: 'white',
    ageAtMenarche: 13,
    ageAtFirstBirth: 25,
    firstDegreeRelativesBC: 0,
    breastBiopsies: 0,
    atypicalHyperplasia: false,
    ethnicity: 'white',
    priorFracture: false,
    parentalHipFracture: false,
    glucocorticoids: false,
    rheumatoidArthritis: false,
    secondaryOsteoporosis: false,
    alcoholUnits: 0,
  });

  // Calculator results state
  const [ascvdResult, setASCVDResult] = useState<any>(null);
  const [fraxResult, setFRAXResult] = useState<any>(null);
  const [gailResult, setGailResult] = useState<any>(null);
  
  // New calculator results
  const [bmiResult, setBMIResult] = useState<BMIResult | null>(null);
  const [bsaResult, setBSAResult] = useState<BSAResult | null>(null);
  const [egfrResult, setEGFRResult] = useState<eGFRResult | null>(null);
  const [hrtResult, setHRTResult] = useState<HRTRiskResult | null>(null);

  // Unit toggle states
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [creatinineUnit, setCreatinineUnit] = useState('mg/dL');

  // Additional inputs for new calculators
  const [additionalInputs, setAdditionalInputs] = useState({
    // eGFR inputs
    serumCreatinine: 1.0,
    
    // HRT inputs
    menopausalDuration: 2,
    vasomotorSymptoms: 'moderate' as 'mild' | 'moderate' | 'severe',
    
    // Height/weight for unit conversion (display values)
    weightDisplay: patientData.weight.toString(),
    heightDisplay: patientData.height.toString(),
    heightFeet: Math.floor(patientData.height / 30.48).toString(),
    heightInches: Math.floor((patientData.height % 30.48) / 2.54).toString(),
  });

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Screen dimensions for responsive charts
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  // Debounced calculation function
  const debouncedCalculateAll = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      calculateAllRisks();
      calculateNewCalculators();
    }, 350); // 350ms debounce
  }, [patientData, additionalInputs, weightUnit, heightUnit, creatinineUnit]);

  // Calculate new calculators
  const calculateNewCalculators = useCallback(() => {
    const weightInKg = weightUnit === 'kg' 
      ? patientData.weight 
      : patientData.weight * 0.453592; // lb to kg
    
    const heightInCm = heightUnit === 'cm' 
      ? patientData.height 
      : (parseInt(additionalInputs.heightFeet) * 30.48) + (parseInt(additionalInputs.heightInches) * 2.54); // ft-in to cm

    const creatinineInMgDl = creatinineUnit === 'mg/dL' 
      ? additionalInputs.serumCreatinine 
      : additionalInputs.serumCreatinine / 88.4; // μmol/L to mg/dL

    // Calculate BMI
    const bmi = calculateBMI(weightInKg, heightInCm);
    setBMIResult(bmi);

    // Calculate BSA
    const bsa = calculateBSA(weightInKg, heightInCm);
    setBSAResult(bsa);

    // Calculate eGFR
    const egfr = calculateeGFR(patientData.age, patientData.gender, creatinineInMgDl);
    setEGFRResult(egfr);

    // Calculate HRT Risk
    const hrt = calculateHRTRisk(
      patientData.age,
      additionalInputs.menopausalDuration,
      patientData.personalHistoryBreastCancer,
      patientData.familyHistoryBreastCancer,
      patientData.personalHistoryDVT,
      patientData.smoking,
      patientData.hypertension,
      patientData.diabetes,
      bmi.bmi
    );
    setHRTResult(hrt);
  }, [patientData, additionalInputs, weightUnit, heightUnit, creatinineUnit]);

  // Reset all calculator results
  const resetAllCalculators = useCallback(() => {
    setASCVDResult(null);
    setFRAXResult(null);
    setGailResult(null);
    setBMIResult(null);
    setBSAResult(null);
    setEGFRResult(null);
    setHRTResult(null);
    
    // Reset additional inputs to defaults
    setAdditionalInputs({
      serumCreatinine: 1.0,
      menopausalDuration: 2,
      vasomotorSymptoms: 'moderate',
      weightDisplay: patientData.weight.toString(),
      heightDisplay: patientData.height.toString(),
      heightFeet: Math.floor(patientData.height / 30.48).toString(),
      heightInches: Math.floor((patientData.height % 30.48) / 2.54).toString(),
    });
  }, [patientData]);

  // Auto-calculate when data changes (debounced)
  useEffect(() => {
    debouncedCalculateAll();
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedCalculateAll]);

  // Reset on Home navigation
  useFocusEffect(
    useCallback(() => {
      // This runs when the screen comes into focus
      return () => {
        // This runs when the screen goes out of focus
        // Check if we're navigating to Home by checking navigation state
        const routes = navigation.getState()?.routes;
        const currentRoute = routes?.[routes.length - 1];
        
        if (currentRoute?.name === 'Home') {
          resetAllCalculators();
        }
      };
    }, [navigation, resetAllCalculators])
  );

  const calculateAllRisks = () => {
    const ascvd = calculateValidatedASCVD(patientData);
    const frax = calculateValidatedFRAX(patientData);
    const gail = calculateValidatedGail(patientData);
    
    setASCVDResult(ascvd);
    setFRAXResult(frax);
    setGailResult(gail);
  };

  const updatePatientData = (field: keyof PatientRiskData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const updateAdditionalInputs = (field: string, value: any) => {
    setAdditionalInputs(prev => ({ ...prev, [field]: value }));
  };

  // Unit conversion handlers
  const handleWeightUnitToggle = (unit) => {
    const currentWeight = parseFloat(additionalInputs.weightDisplay);
    if (!isNaN(currentWeight)) {
      let convertedWeight: number;
      if (unit === 'lb' && weightUnit === 'kg') {
        convertedWeight = currentWeight * 2.20462; // kg to lb
      } else if (unit === 'kg' && weightUnit === 'lb') {
        convertedWeight = currentWeight * 0.453592; // lb to kg
      } else {
        convertedWeight = currentWeight;
      }
      
      setWeightUnit(unit);
      updateAdditionalInputs('weightDisplay', convertedWeight.toFixed(1));
      updatePatientData('weight', unit === 'kg' ? convertedWeight : convertedWeight * 0.453592);
    } else {
      setWeightUnit(unit);
    }
  };

  const handleHeightUnitToggle = (unit) => {
    const currentHeight = parseFloat(additionalInputs.heightDisplay);
    if (!isNaN(currentHeight) && heightUnit === 'cm' && unit === 'ft-in') {
      const feet = Math.floor(currentHeight / 30.48);
      const inches = Math.round((currentHeight % 30.48) / 2.54);
      setHeightUnit(unit);
      updateAdditionalInputs('heightFeet', feet.toString());
      updateAdditionalInputs('heightInches', inches.toString());
    } else if (heightUnit === 'ft-in' && unit === 'cm') {
      const feet = parseFloat(additionalInputs.heightFeet);
      const inches = parseFloat(additionalInputs.heightInches);
      if (!isNaN(feet) && !isNaN(inches)) {
        const totalCm = (feet * 30.48) + (inches * 2.54);
        setHeightUnit(unit);
        updateAdditionalInputs('heightDisplay', totalCm.toFixed(0));
        updatePatientData('height', totalCm);
      } else {
        setHeightUnit(unit);
      }
    } else {
      setHeightUnit(unit);
    }
  };

  const handleCreatinineUnitToggle = (unit) => {
    const currentCreatinine = additionalInputs.serumCreatinine;
    let convertedCreatinine: number;
    
    if (unit === 'μmol/L' && creatinineUnit === 'mg/dL') {
      convertedCreatinine = currentCreatinine * 88.4; // mg/dL to μmol/L
    } else if (unit === 'mg/dL' && creatinineUnit === 'μmol/L') {
      convertedCreatinine = currentCreatinine / 88.4; // μmol/L to mg/dL
    } else {
      convertedCreatinine = currentCreatinine;
    }
    
    setCreatinineUnit(unit);
    updateAdditionalInputs('serumCreatinine', Math.round(convertedCreatinine * 100) / 100);
  };

  const getRiskColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'low': return '#4CAF50';
      case 'borderline': case 'moderate': return '#FF9800';
      case 'intermediate': return '#FF9800';
      case 'high': return '#F44336';
      case 'very high': return '#D32F2F';
      default: return '#666';
    }
  };

  const createComparisonChart = (patientRisk: number, populationBaseline: number, title: string, color: string) => {
    const data = {
      labels: ['Population Average', 'Your Risk'],
      datasets: [{
        data: [populationBaseline, patientRisk],
        colors: [
          (opacity = 1) => '#E0E0E0', // Population baseline in gray
          (opacity = 1) => color,      // Patient risk in risk-appropriate color
        ]
      }]
    };

    const chartConfig = {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: { borderRadius: 16 },
      propsForLabels: { fontSize: 12 },
      barPercentage: 0.7,
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <BarChart
          data={data}
          width={chartWidth}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix="%"
          showValuesOnTopOfBars={true}
        />
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.legendText}>Population Mean</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text style={styles.legendText}>Your Risk</Text>
          </View>
        </View>
        <Text style={styles.percentileText}>
          You are in the {patientRisk > populationBaseline ? 'upper' : 'lower'} {
            Math.abs(((patientRisk / populationBaseline - 1) * 100)).toFixed(0)
          }% compared to people your age and gender
        </Text>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Personalized Risk Calculators</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Population Baseline Toggle */}
          <View style={styles.toggleSection}>
            <Text style={styles.toggleLabel}>Show Population Comparisons</Text>
            <Switch
              value={showPopulationBaselines}
              onValueChange={setShowPopulationBaselines}
              trackColor={{ false: '#E0E0E0', true: '#D81B60' }}
              thumbColor={showPopulationBaselines ? '#FFF' : '#FFF'}
            />
          </View>

          {/* ASCVD Risk Calculator */}
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <MaterialIcons name="favorite" size={28} color="#F44336" />
              <View style={styles.calculatorTitleSection}>
                <Text style={styles.calculatorTitle}>ASCVD Risk Score</Text>
                <Text style={styles.calculatorSubtitle}>10-year cardiovascular disease risk</Text>
              </View>
            </View>

            {/* ASCVD Input Fields */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Required Inputs:</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Total Cholesterol (mg/dL)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientData.totalCholesterol?.toString() || ''}
                    onChangeText={(text) => updatePatientData('totalCholesterol', parseInt(text) || 0)}
                    placeholder="200"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>HDL Cholesterol (mg/dL)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientData.hdlCholesterol?.toString() || ''}
                    onChangeText={(text) => updatePatientData('hdlCholesterol', parseInt(text) || 0)}
                    placeholder="50"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Systolic BP (mmHg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientData.systolicBP?.toString() || ''}
                    onChangeText={(text) => updatePatientData('systolicBP', parseInt(text) || 0)}
                    placeholder="120"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Race</Text>
                  <View style={styles.switchContainer}>
                    <TouchableOpacity
                      style={[styles.raceButton, patientData.race === 'white' && styles.raceButtonSelected]}
                      onPress={() => updatePatientData('race', 'white')}
                    >
                      <Text style={[styles.raceButtonText, patientData.race === 'white' && styles.raceButtonTextSelected]}>White</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.raceButton, patientData.race === 'black' && styles.raceButtonSelected]}
                      onPress={() => updatePatientData('race', 'black')}
                    >
                      <Text style={[styles.raceButtonText, patientData.race === 'black' && styles.raceButtonTextSelected]}>Black</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.raceButton, patientData.race === 'other' && styles.raceButtonSelected]}
                      onPress={() => updatePatientData('race', 'other')}
                    >
                      <Text style={[styles.raceButtonText, patientData.race === 'other' && styles.raceButtonTextSelected]}>Other</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.checkboxSection}>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => updatePatientData('hypertensionTreated', !patientData.hypertensionTreated)}
                >
                  <MaterialIcons 
                    name={patientData.hypertensionTreated ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color="#D81B60" 
                  />
                  <Text style={styles.checkboxLabel}>Treated for Hypertension</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dynamicCalculationNote}>
              <MaterialIcons name="autorenew" size={16} color="#4CAF50" />
              <Text style={styles.dynamicCalculationText}>Results update automatically as you type</Text>
            </View>

            {/* ASCVD Results */}
            {ascvdResult && (
              <View style={styles.resultsSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Your ASCVD Risk</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getRiskColor(ascvdResult.category) }]}>
                    <Text style={styles.categoryBadgeText}>{ascvdResult.category.toUpperCase()}</Text>
                  </View>
                </View>
                
                <Text style={styles.riskPercentage}>{ascvdResult.risk}%</Text>
                <Text style={styles.riskInterpretation}>{ascvdResult.interpretation}</Text>
                
                {showPopulationBaselines && ascvdResult.populationBaseline && (
                  createComparisonChart(
                    ascvdResult.risk,
                    ascvdResult.populationBaseline,
                    'ASCVD Risk Comparison',
                    getRiskColor(ascvdResult.category)
                  )
                )}

                {ascvdResult.missingInputs && ascvdResult.missingInputs.length > 0 && (
                  <View style={styles.missingInputsSection}>
                    <MaterialIcons name="info" size={20} color="#FF9800" />
                    <Text style={styles.missingInputsText}>
                      Missing inputs: {ascvdResult.missingInputs.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* FRAX Risk Calculator */}
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <MaterialIcons name="accessibility" size={28} color="#9C27B0" />
              <View style={styles.calculatorTitleSection}>
                <Text style={styles.calculatorTitle}>FRAX Fracture Risk</Text>
                <Text style={styles.calculatorSubtitle}>10-year osteoporotic fracture risk</Text>
              </View>
            </View>

            {/* FRAX Input Fields */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Risk Factors:</Text>
              
              <View style={styles.checkboxSection}>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => updatePatientData('priorFracture', !patientData.priorFracture)}
                >
                  <MaterialIcons 
                    name={patientData.priorFracture ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color="#D81B60" 
                  />
                  <Text style={styles.checkboxLabel}>Prior Fracture</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => updatePatientData('parentalHipFracture', !patientData.parentalHipFracture)}
                >
                  <MaterialIcons 
                    name={patientData.parentalHipFracture ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color="#D81B60" 
                  />
                  <Text style={styles.checkboxLabel}>Parental Hip Fracture</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => updatePatientData('glucocorticoids', !patientData.glucocorticoids)}
                >
                  <MaterialIcons 
                    name={patientData.glucocorticoids ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color="#D81B60" 
                  />
                  <Text style={styles.checkboxLabel}>Glucocorticoid Use</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => updatePatientData('rheumatoidArthritis', !patientData.rheumatoidArthritis)}
                >
                  <MaterialIcons 
                    name={patientData.rheumatoidArthritis ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color="#D81B60" 
                  />
                  <Text style={styles.checkboxLabel}>Rheumatoid Arthritis</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alcohol Units per Day</Text>
                <TextInput
                  style={styles.textInput}
                  value={patientData.alcoholUnits?.toString() || '0'}
                  onChangeText={(text) => updatePatientData('alcoholUnits', parseInt(text) || 0)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* FRAX Results */}
            {fraxResult && (
              <View style={styles.resultsSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Your FRAX Risk</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getRiskColor(fraxResult.category) }]}>
                    <Text style={styles.categoryBadgeText}>{fraxResult.category.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.fraxResults}>
                  <View style={styles.fraxResultItem}>
                    <Text style={styles.fraxLabel}>Major Fracture</Text>
                    <Text style={styles.riskPercentage}>{fraxResult.majorFractureRisk}%</Text>
                  </View>
                  <View style={styles.fraxResultItem}>
                    <Text style={styles.fraxLabel}>Hip Fracture</Text>
                    <Text style={styles.riskPercentage}>{fraxResult.hipFractureRisk}%</Text>
                  </View>
                </View>
                
                <Text style={styles.riskInterpretation}>{fraxResult.interpretation}</Text>
                
                {showPopulationBaselines && fraxResult.populationMajorFracture && (
                  createComparisonChart(
                    fraxResult.majorFractureRisk,
                    fraxResult.populationMajorFracture,
                    'Major Fracture Risk Comparison',
                    getRiskColor(fraxResult.category)
                  )
                )}

                {fraxResult.missingInputs && fraxResult.missingInputs.length > 0 && (
                  <View style={styles.missingInputsSection}>
                    <MaterialIcons name="info" size={20} color="#FF9800" />
                    <Text style={styles.missingInputsText}>
                      Missing inputs: {fraxResult.missingInputs.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Gail Breast Cancer Risk Calculator */}
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <MaterialIcons name="health-and-safety" size={28} color="#E91E63" />
              <View style={styles.calculatorTitleSection}>
                <Text style={styles.calculatorTitle}>Gail Breast Cancer Risk</Text>
                <Text style={styles.calculatorSubtitle}>5-year and lifetime breast cancer risk</Text>
              </View>
            </View>

            {/* Gail Input Fields */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Reproductive History:</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Age at Menarche</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientData.ageAtMenarche?.toString() || ''}
                    onChangeText={(text) => updatePatientData('ageAtMenarche', parseInt(text) || 0)}
                    placeholder="13"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Age at First Birth</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientData.ageAtFirstBirth?.toString() || ''}
                    onChangeText={(text) => updatePatientData('ageAtFirstBirth', parseInt(text) || 0)}
                    placeholder="25 (0 if none)"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Relatives with Breast Cancer</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientData.firstDegreeRelativesBC?.toString() || '0'}
                    onChangeText={(text) => updatePatientData('firstDegreeRelativesBC', parseInt(text) || 0)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Breast Biopsies</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientData.breastBiopsies?.toString() || '0'}
                    onChangeText={(text) => updatePatientData('breastBiopsies', parseInt(text) || 0)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.checkboxSection}>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => updatePatientData('atypicalHyperplasia', !patientData.atypicalHyperplasia)}
                >
                  <MaterialIcons 
                    name={patientData.atypicalHyperplasia ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color="#D81B60" 
                  />
                  <Text style={styles.checkboxLabel}>Atypical Hyperplasia</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ethnicity</Text>
                <View style={styles.ethnicityContainer}>
                  {['white', 'black', 'hispanic', 'asian'].map((ethnicity) => (
                    <TouchableOpacity
                      key={ethnicity}
                      style={[styles.ethnicityButton, patientData.ethnicity === ethnicity && styles.ethnicityButtonSelected]}
                      onPress={() => updatePatientData('ethnicity', ethnicity)}
                    >
                      <Text style={[styles.ethnicityButtonText, patientData.ethnicity === ethnicity && styles.ethnicityButtonTextSelected]}>
                        {ethnicity.charAt(0).toUpperCase() + ethnicity.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Gail Results */}
            {gailResult && (
              <View style={styles.resultsSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Your Breast Cancer Risk</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getRiskColor(gailResult.category) }]}>
                    <Text style={styles.categoryBadgeText}>{gailResult.category.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.gailResults}>
                  <View style={styles.gailResultItem}>
                    <Text style={styles.gailLabel}>5-Year Risk</Text>
                    <Text style={styles.riskPercentage}>{gailResult.fiveYearRisk}%</Text>
                  </View>
                  <View style={styles.gailResultItem}>
                    <Text style={styles.gailLabel}>Lifetime Risk</Text>
                    <Text style={styles.riskPercentage}>{gailResult.lifetimeRisk}%</Text>
                  </View>
                </View>
                
                <Text style={styles.riskInterpretation}>{gailResult.interpretation}</Text>
                
                {showPopulationBaselines && gailResult.populationBaseline && (
                  createComparisonChart(
                    gailResult.fiveYearRisk,
                    gailResult.populationBaseline,
                    '5-Year Breast Cancer Risk Comparison',
                    getRiskColor(gailResult.category)
                  )
                )}

                {gailResult.missingInputs && gailResult.missingInputs.length > 0 && (
                  <View style={styles.missingInputsSection}>
                    <MaterialIcons name="info" size={20} color="#FF9800" />
                    <Text style={styles.missingInputsText}>
                      Missing inputs: {gailResult.missingInputs.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* BMI Calculator */}
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <MaterialIcons name="monitor-weight" size={28} color="#4CAF50" />
              <View style={styles.calculatorTitleSection}>
                <Text style={styles.calculatorTitle}>BMI Calculator</Text>
                <Text style={styles.calculatorSubtitle}>Body Mass Index with health risk assessment</Text>
              </View>
            </View>

            {/* BMI Input Fields */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Anthropometric Data:</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Weight</Text>
                  <View style={styles.unitInputContainer}>
                    <TextInput
                      style={styles.unitTextInput}
                      value={additionalInputs.weightDisplay}
                      onChangeText={(text) => {
                        updateAdditionalInputs('weightDisplay', text);
                        const weight = parseFloat(text);
                        if (!isNaN(weight)) {
                          updatePatientData('weight', weightUnit === 'kg' ? weight : weight * 0.453592);
                        }
                      }}
                      placeholder={weightUnit === 'kg' ? '70' : '154'}
                      keyboardType="numeric"
                    />
                    <View style={styles.unitToggle}>
                      <TouchableOpacity
                        style={[styles.unitButton, weightUnit === 'kg' && styles.unitButtonSelected]}
                        onPress={() => handleWeightUnitToggle('kg')}
                      >
                        <Text style={[styles.unitButtonText, weightUnit === 'kg' && styles.unitButtonTextSelected]}>kg</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.unitButton, weightUnit === 'lb' && styles.unitButtonSelected]}
                        onPress={() => handleWeightUnitToggle('lb')}
                      >
                        <Text style={[styles.unitButtonText, weightUnit === 'lb' && styles.unitButtonTextSelected]}>lb</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Height</Text>
                  {heightUnit === 'cm' ? (
                    <View style={styles.unitInputContainer}>
                      <TextInput
                        style={styles.unitTextInput}
                        value={additionalInputs.heightDisplay}
                        onChangeText={(text) => {
                          updateAdditionalInputs('heightDisplay', text);
                          const height = parseFloat(text);
                          if (!isNaN(height)) {
                            updatePatientData('height', height);
                          }
                        }}
                        placeholder="175"
                        keyboardType="numeric"
                      />
                      <View style={styles.unitToggle}>
                        <TouchableOpacity
                          style={[styles.unitButton, heightUnit === 'cm' && styles.unitButtonSelected]}
                          onPress={() => handleHeightUnitToggle('cm')}
                        >
                          <Text style={[styles.unitButtonText, heightUnit === 'cm' && styles.unitButtonTextSelected]}>cm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.unitButton, heightUnit === 'ft-in' && styles.unitButtonSelected]}
                          onPress={() => handleHeightUnitToggle('ft-in')}
                        >
                          <Text style={[styles.unitButtonText, heightUnit === 'ft-in' && styles.unitButtonTextSelected]}>ft/in</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.heightFtInContainer}>
                      <View style={styles.heightFtInRow}>
                        <TextInput
                          style={styles.heightFtInput}
                          value={additionalInputs.heightFeet}
                          onChangeText={(text) => {
                            updateAdditionalInputs('heightFeet', text);
                            const feet = parseFloat(text);
                            const inches = parseFloat(additionalInputs.heightInches);
                            if (!isNaN(feet) && !isNaN(inches)) {
                              const totalCm = (feet * 30.48) + (inches * 2.54);
                              updatePatientData('height', totalCm);
                            }
                          }}
                          placeholder="5"
                          keyboardType="numeric"
                        />
                        <Text style={styles.heightUnitLabel}>ft</Text>
                        <TextInput
                          style={styles.heightInInput}
                          value={additionalInputs.heightInches}
                          onChangeText={(text) => {
                            updateAdditionalInputs('heightInches', text);
                            const feet = parseFloat(additionalInputs.heightFeet);
                            const inches = parseFloat(text);
                            if (!isNaN(feet) && !isNaN(inches)) {
                              const totalCm = (feet * 30.48) + (inches * 2.54);
                              updatePatientData('height', totalCm);
                            }
                          }}
                          placeholder="9"
                          keyboardType="numeric"
                        />
                        <Text style={styles.heightUnitLabel}>in</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.heightUnitToggleButton}
                        onPress={() => handleHeightUnitToggle('cm')}
                      >
                        <Text style={styles.heightUnitToggleText}>Switch to cm</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* BMI Results */}
            {bmiResult && (
              <View style={styles.resultsSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>BMI Assessment</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getRiskColor(bmiResult.healthRisk) }]}>
                    <Text style={styles.categoryBadgeText}>{bmiResult.category.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.bmiResults}>
                  <Text style={styles.riskPercentage}>{bmiResult.bmi}</Text>
                  <Text style={styles.bmiUnit}>kg/m²</Text>
                </View>
                
                <Text style={styles.riskInterpretation}>{bmiResult.interpretation}</Text>
                
                <View style={styles.healthRiskSection}>
                  <MaterialIcons 
                    name={bmiResult.healthRisk === 'Low' ? 'check-circle' : bmiResult.healthRisk === 'Moderate' ? 'warning' : 'error'} 
                    size={20} 
                    color={getRiskColor(bmiResult.healthRisk)} 
                  />
                  <Text style={[styles.healthRiskText, { color: getRiskColor(bmiResult.healthRisk) }]}>
                    {bmiResult.healthRisk} Health Risk
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* BSA Calculator */}
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <MaterialIcons name="straighten" size={28} color="#2196F3" />
              <View style={styles.calculatorTitleSection}>
                <Text style={styles.calculatorTitle}>BSA Calculator</Text>
                <Text style={styles.calculatorSubtitle}>Body Surface Area for drug dosing</Text>
              </View>
            </View>

            {/* BSA uses same weight/height inputs as BMI */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Formula Selection:</Text>
              
              <View style={styles.formulaSelection}>
                <TouchableOpacity
                  style={[styles.formulaButton, styles.formulaButtonSelected]}
                  disabled
                >
                  <Text style={[styles.formulaButtonText, styles.formulaButtonTextSelected]}>Du Bois Formula</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoButton}>
                  <MaterialIcons name="info" size={16} color="#666" />
                  <Text style={styles.infoButtonText}>Most widely used</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* BSA Results */}
            {bsaResult && (
              <View style={styles.resultsSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Body Surface Area</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>BSA</Text>
                  </View>
                </View>
                
                <View style={styles.bsaResults}>
                  <Text style={styles.riskPercentage}>{bsaResult.bsa}</Text>
                  <Text style={styles.bmiUnit}>m²</Text>
                </View>
                
                <Text style={styles.riskInterpretation}>{bsaResult.interpretation}</Text>
                
                <View style={styles.methodSection}>
                  <MaterialIcons name="functions" size={16} color="#666" />
                  <Text style={styles.methodText}>{bsaResult.method}</Text>
                </View>
              </View>
            )}
          </View>

          {/* eGFR Calculator */}
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <MaterialIcons name="water-drop" size={28} color="#FF5722" />
              <View style={styles.calculatorTitleSection}>
                <Text style={styles.calculatorTitle}>eGFR Calculator</Text>
                <Text style={styles.calculatorSubtitle}>Estimated Glomerular Filtration Rate</Text>
              </View>
            </View>

            {/* eGFR Input Fields */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Kidney Function Inputs:</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Serum Creatinine</Text>
                  <View style={styles.unitInputContainer}>
                    <TextInput
                      style={styles.unitTextInput}
                      value={additionalInputs.serumCreatinine.toString()}
                      onChangeText={(text) => {
                        const value = parseFloat(text) || 0;
                        updateAdditionalInputs('serumCreatinine', value);
                      }}
                      placeholder={creatinineUnit === 'mg/dL' ? '1.0' : '88'}
                      keyboardType="numeric"
                    />
                    <View style={styles.unitToggle}>
                      <TouchableOpacity
                        style={[styles.unitButton, creatinineUnit === 'mg/dL' && styles.unitButtonSelected]}
                        onPress={() => handleCreatinineUnitToggle('mg/dL')}
                      >
                        <Text style={[styles.unitButtonText, creatinineUnit === 'mg/dL' && styles.unitButtonTextSelected]}>mg/dL</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.unitButton, creatinineUnit === 'μmol/L' && styles.unitButtonSelected]}
                        onPress={() => handleCreatinineUnitToggle('μmol/L')}
                      >
                        <Text style={[styles.unitButtonText, creatinineUnit === 'μmol/L' && styles.unitButtonTextSelected]}>μmol/L</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Method</Text>
                  <View style={styles.methodSelection}>
                    <TouchableOpacity
                      style={[styles.methodButton, styles.methodButtonSelected]}
                      disabled
                    >
                      <Text style={[styles.methodButtonText, styles.methodButtonTextSelected]}>CKD-EPI 2021</Text>
                    </TouchableOpacity>
                    <Text style={styles.methodNote}>Race-free equation</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* eGFR Results */}
            {egfrResult && (
              <View style={styles.resultsSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Kidney Function</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getRiskColor(egfrResult.category) }]}>
                    <Text style={styles.categoryBadgeText}>{egfrResult.category.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.egfrResults}>
                  <Text style={styles.riskPercentage}>{egfrResult.egfr}</Text>
                  <Text style={styles.bmiUnit}>mL/min/1.73m²</Text>
                </View>
                
                <Text style={styles.riskInterpretation}>{egfrResult.interpretation}</Text>
                
                <View style={styles.stageSection}>
                  <MaterialIcons 
                    name={egfrResult.category === 'Normal' ? 'check-circle' : egfrResult.category === 'Mild' ? 'warning' : 'error'} 
                    size={20} 
                    color={getRiskColor(egfrResult.category)} 
                  />
                  <Text style={[styles.stageText, { color: getRiskColor(egfrResult.category) }]}>
                    Stage: {egfrResult.stage}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* HRT Risk Calculator */}
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <MaterialIcons name="medical-services" size={28} color="#9C27B0" />
              <View style={styles.calculatorTitleSection}>
                <Text style={styles.calculatorTitle}>HRT Risk Assessment</Text>
                <Text style={styles.calculatorSubtitle}>Hormone replacement therapy risk evaluation</Text>
              </View>
            </View>

            {/* HRT Input Fields */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>HRT-Specific Factors:</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Years Since Menopause</Text>
                  <TextInput
                    style={styles.textInput}
                    value={additionalInputs.menopausalDuration.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      updateAdditionalInputs('menopausalDuration', value);
                    }}
                    placeholder="2"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vasomotor Symptoms</Text>
                  <View style={styles.symptomSelection}>
                    {['mild', 'moderate', 'severe'].map((severity) => (
                      <TouchableOpacity
                        key={severity}
                        style={[
                          styles.symptomButton, 
                          additionalInputs.vasomotorSymptoms === severity && styles.symptomButtonSelected
                        ]}
                        onPress={() => updateAdditionalInputs('vasomotorSymptoms', severity)}
                      >
                        <Text style={[
                          styles.symptomButtonText, 
                          additionalInputs.vasomotorSymptoms === severity && styles.symptomButtonTextSelected
                        ]}>
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* HRT Results */}
            {hrtResult && (
              <View style={styles.resultsSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>HRT Risk Assessment</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: getRiskColor(hrtResult.overallRisk) }]}>
                    <Text style={styles.categoryBadgeText}>{hrtResult.overallRisk.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.hrtRiskGrid}>
                  <View style={styles.hrtRiskItem}>
                    <Text style={styles.hrtRiskLabel}>Breast Cancer</Text>
                    <Text style={styles.hrtRiskValue}>{hrtResult.breastCancerRisk}x</Text>
                  </View>
                  <View style={styles.hrtRiskItem}>
                    <Text style={styles.hrtRiskLabel}>VTE Risk</Text>
                    <Text style={styles.hrtRiskValue}>{hrtResult.vteRisk}x</Text>
                  </View>
                  <View style={styles.hrtRiskItem}>
                    <Text style={styles.hrtRiskLabel}>Stroke Risk</Text>
                    <Text style={styles.hrtRiskValue}>{hrtResult.strokeRisk}x</Text>
                  </View>
                </View>
                
                <Text style={styles.riskInterpretation}>{hrtResult.interpretation}</Text>
                
                {hrtResult.contraindications.length > 0 && (
                  <View style={styles.contraindicationsSection}>
                    <MaterialIcons name="warning" size={20} color="#F44336" />
                    <View style={styles.contraindicationsContent}>
                      <Text style={styles.contraindicationsTitle}>Contraindications:</Text>
                      {hrtResult.contraindications.map((contraindication, index) => (
                        <Text key={index} style={styles.contraindicationItem}>• {contraindication}</Text>
                      ))}
                    </View>
                  </View>
                )}
                
                {hrtResult.recommendations.length > 0 && (
                  <View style={styles.recommendationsSection}>
                    <MaterialIcons name="lightbulb" size={20} color="#FF9800" />
                    <View style={styles.recommendationsContent}>
                      <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                      {hrtResult.recommendations.slice(0, 3).map((recommendation, index) => (
                        <Text key={index} style={styles.recommendationItem}>• {recommendation}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Manual Reset Section */}
          <View style={styles.resetSection}>
            <TouchableOpacity style={styles.resetButton} onPress={resetAllCalculators}>
              <MaterialIcons name="refresh" size={20} color="#D81B60" />
              <Text style={styles.resetButtonText}>Reset All Calculators</Text>
            </TouchableOpacity>
          </View>

          {/* Export/Share Section */}
          <View style={styles.exportSection}>
            <TouchableOpacity style={styles.exportButton}>
              <MaterialIcons name="share" size={20} color="#D81B60" />
              <Text style={styles.exportButtonText}>Share Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <MaterialIcons name="download" size={20} color="#D81B60" />
              <Text style={styles.exportButtonText}>Export PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Padding */}
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
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calculatorCard: {
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
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  calculatorTitleSection: {
    marginLeft: 15,
    flex: 1,
  },
  calculatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  calculatorSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputGroup: {
    flex: 0.48,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  raceButton: {
    flex: 0.3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  raceButtonSelected: {
    borderColor: '#D81B60',
    backgroundColor: '#FFF0F5',
  },
  raceButtonText: {
    fontSize: 12,
    color: '#666',
  },
  raceButtonTextSelected: {
    color: '#D81B60',
    fontWeight: '600',
  },
  checkboxSection: {
    marginTop: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D81B60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  calculateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
    marginBottom: 10,
  },
  riskInterpretation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  percentileText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  missingInputsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  missingInputsText: {
    fontSize: 14,
    color: '#FF9800',
    marginLeft: 10,
    flex: 1,
  },
  fraxResults: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  fraxResultItem: {
    alignItems: 'center',
    flex: 1,
  },
  fraxLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  gailResults: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  gailResultItem: {
    alignItems: 'center',
    flex: 1,
  },
  gailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ethnicityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ethnicityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    minWidth: 60,
    alignItems: 'center',
  },
  ethnicityButtonSelected: {
    borderColor: '#D81B60',
    backgroundColor: '#FFF0F5',
  },
  ethnicityButtonText: {
    fontSize: 12,
    color: '#666',
  },
  ethnicityButtonTextSelected: {
    color: '#D81B60',
    fontWeight: '600',
  },
  exportSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D81B60',
    borderRadius: 8,
    gap: 8,
  },
  exportButtonText: {
    color: '#D81B60',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
  
  // Unit input styles
  unitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  unitToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    minWidth: 35,
    alignItems: 'center',
  },
  unitButtonSelected: {
    backgroundColor: '#D81B60',
  },
  unitButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  unitButtonTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  
  // Height ft/in specific styles
  heightFtInContainer: {
    gap: 8,
  },
  heightFtInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heightFtInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  heightInInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  heightUnitLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  heightUnitToggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D81B60',
    borderRadius: 6,
    alignItems: 'center',
  },
  heightUnitToggleText: {
    fontSize: 12,
    color: '#D81B60',
    fontWeight: '500',
  },
  
  // BMI results specific styles
  bmiResults: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 4,
  },
  bmiUnit: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  healthRiskSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  healthRiskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Reset button styles
  resetSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D81B60',
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    color: '#D81B60',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // BSA specific styles
  formulaSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formulaButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
  },
  formulaButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  formulaButtonText: {
    fontSize: 14,
    color: '#666',
  },
  formulaButtonTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoButtonText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  bsaResults: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 4,
  },
  methodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  methodText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  // eGFR specific styles
  methodSelection: {
    gap: 4,
  },
  methodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  methodButtonSelected: {
    borderColor: '#FF5722',
    backgroundColor: '#FFF3E0',
  },
  methodButtonText: {
    fontSize: 12,
    color: '#666',
  },
  methodButtonTextSelected: {
    color: '#FF5722',
    fontWeight: '600',
  },
  methodNote: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  egfrResults: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 4,
  },
  stageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // HRT specific styles
  symptomSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    minWidth: 60,
    alignItems: 'center',
  },
  symptomButtonSelected: {
    borderColor: '#9C27B0',
    backgroundColor: '#F3E5F5',
  },
  symptomButtonText: {
    fontSize: 12,
    color: '#666',
  },
  symptomButtonTextSelected: {
    color: '#9C27B0',
    fontWeight: '600',
  },
  hrtRiskGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  hrtRiskItem: {
    alignItems: 'center',
    flex: 1,
  },
  hrtRiskLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  hrtRiskValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  contraindicationsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 10,
  },
  contraindicationsContent: {
    flex: 1,
  },
  contraindicationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 6,
  },
  contraindicationItem: {
    fontSize: 12,
    color: '#D32F2F',
    lineHeight: 16,
  },
  recommendationsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 10,
  },
  recommendationsContent: {
    flex: 1,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 6,
  },
  recommendationItem: {
    fontSize: 12,
    color: '#F57C00',
    lineHeight: 16,
  },
  
  // Dynamic calculation note
  dynamicCalculationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  dynamicCalculationText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});