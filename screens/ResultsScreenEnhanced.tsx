import React, { useEffect, useState, useMemo } from 'react';
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
import useAssessmentStore from '../store/assessmentStore';

// Import new AI risk calculators
import { calculateAllRisks, type ComprehensiveRiskResults, type PatientRiskData } from '../utils/medicalCalculators';
import { checkHRTContraindications, getMedicationRecommendations, type ContraindicationAlert } from '../utils/drugInteractionChecker';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  PatientList: undefined;
  Demographics: undefined;
  Symptoms: undefined;
  RiskFactors: undefined;
  Results: undefined;
  Cme: undefined;
  Guidelines: undefined;
  Export: undefined;
  PatientDetails: undefined;
};

type ResultsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results'>;

interface Props {
  navigation: ResultsNavigationProp;
}

export default function ResultsScreenEnhanced({ navigation }: Props) {
  // Get store data and functions - PRESERVE ALL EXISTING FUNCTIONALITY
  const { currentPatient, savePatient, calculateRisks, generateRecommendation } = useAssessmentStore();
  
  // Local state for saving only - NO LOADING STATES
  const [isSaving, setIsSaving] = useState(false);

  // PRESERVE EXISTING DETERMINISTIC RISK CALCULATION FUNCTIONS (SYNCHRONOUS)
  const calculateRisksFromCurrentPatient = (patient: any) => {
    // Ensure we have patient data
    if (!patient) {
      return {
        breastCancerRisk: 'low',
        cvdRisk: 'low', 
        vteRisk: 'low',
        overallRisk: 'low'
      };
    }

    // Calculate BMI if missing
    const bmi = patient.bmi || (patient.height && patient.weight ? 
      patient.weight / Math.pow(patient.height / 100, 2) : 25);

    // 1. BREAST CANCER RISK (deterministic rules) - PRESERVE EXISTING LOGIC
    const hasPersonalHistoryBC = Boolean(patient.personalHistoryBreastCancer);
    const hasFamilyHistoryBC = Boolean(patient.familyHistoryBreastCancer || patient.familyHistoryOvarian);
    const isObese = bmi >= 30;

    let breastCancerRisk: string;
    if (hasPersonalHistoryBC || (hasFamilyHistoryBC && isObese)) {
      breastCancerRisk = 'high';
    } else if (hasFamilyHistoryBC || isObese) {
      breastCancerRisk = 'moderate';
    } else {
      breastCancerRisk = 'low';
    }

    // 2. CVD RISK (deterministic rules) - PRESERVE EXISTING LOGIC
    const cvdFactors = [
      Boolean(patient.hypertension),
      Boolean(patient.diabetes), 
      Boolean(patient.cholesterolHigh)
    ];
    const cvdFactorCount = cvdFactors.filter(Boolean).length;
    const isSmoker = Boolean(patient.smoking);

    let cvdRisk: string;
    if (cvdFactorCount >= 2 || (cvdFactorCount >= 1 && isSmoker)) {
      cvdRisk = 'high';
    } else if (cvdFactorCount === 1 && !isSmoker) {
      cvdRisk = 'moderate';
    } else {
      cvdRisk = 'low';
    }

    // 3. VTE RISK (deterministic rules) - PRESERVE EXISTING LOGIC
    const hasClottingHistory = Boolean(patient.personalHistoryDVT);
    const hasThrombophilia = Boolean(patient.thrombophilia);

    let vteRisk: string;
    if (hasClottingHistory || hasThrombophilia) {
      vteRisk = 'high';
    } else if (isObese || isSmoker) {
      vteRisk = 'moderate';
    } else {
      vteRisk = 'low';
    }

    // Overall Risk Assessment - PRESERVE EXISTING LOGIC
    const overallRisk = [breastCancerRisk, cvdRisk, vteRisk].includes('high') ? 'high' :
                       [breastCancerRisk, cvdRisk, vteRisk].includes('moderate') ? 'moderate' : 'low';

    return {
      patientId: patient.id || 'current',
      breastCancerRisk,
      cvdRisk,
      vteRisk,
      overallRisk,
      calculatedAt: new Date(),
    };
  };

  // PRESERVE EXISTING MHT RECOMMENDATION ENGINE - EXACT SAME LOGIC
  const generateRecommendationFromCurrentPatient = (patient: any, risks: any) => {
    let type: 'ET' | 'EPT' | 'vaginal-only' | 'not-recommended' = 'not-recommended';
    let route: 'oral' | 'transdermal' | 'none' = 'none';
    let progestogenType: 'micronized' | 'ius' | undefined;
    const rationale: string[] = [];

    const hasHysterectomy = Boolean(patient?.hysterectomy);
    const hasGUSymptoms = (patient?.vaginalDryness || 0) >= 5;
    const needsContraception = Boolean(patient?.needsContraception);

    // PRESERVE EXACT EXISTING OUTCOME MAP
    if (risks.breastCancerRisk === 'high') {
      type = 'not-recommended';
      route = 'none';
      if (hasGUSymptoms) {
        rationale.push('No systemic MHT due to high breast cancer risk');
        rationale.push('Vaginal/local therapy only if GU symptoms present');
      } else {
        rationale.push('No systemic MHT due to high breast cancer risk');
        rationale.push('Consider non-hormonal alternatives');
      }
    }
    else if (risks.cvdRisk === 'high') {
      if (hasGUSymptoms || (risks.vteRisk === 'moderate' || risks.vteRisk === 'high')) {
        type = 'vaginal-only';
        route = 'vaginal';
        rationale.push('High CVD risk - vaginal/local therapy preferred');
        rationale.push('If systemic needed, transdermal only with caution');
      } else if (risks.vteRisk === 'low') {
        type = hasHysterectomy ? 'ET' : 'EPT';
        route = 'transdermal';
        progestogenType = hasHysterectomy ? undefined : 'micronized';
        rationale.push('High CVD risk - transdermal route only if systemic MHT needed');
      } else {
        type = 'vaginal-only';
        route = 'vaginal';
        rationale.push('High CVD risk - vaginal therapy preferred');
      }
    }
    else if (risks.vteRisk === 'high') {
      if (hasGUSymptoms || risks.cvdRisk === 'moderate') {
        type = 'vaginal-only';
        route = 'vaginal';
        rationale.push('High VTE risk - vaginal/local therapy preferred');
        rationale.push('If systemic needed, transdermal only with caution');
      } else if (risks.cvdRisk === 'low') {
        type = hasHysterectomy ? 'ET' : 'EPT';
        route = 'transdermal';
        progestogenType = hasHysterectomy ? undefined : 'micronized';
        rationale.push('High VTE risk - transdermal route only if systemic MHT needed');
      } else {
        type = 'vaginal-only';
        route = 'vaginal';
        rationale.push('High VTE risk - vaginal therapy preferred');
      }
    }
    else if (risks.cvdRisk === 'moderate' || risks.vteRisk === 'moderate') {
      if (hasGUSymptoms && (risks.cvdRisk === 'moderate' && risks.vteRisk === 'moderate')) {
        type = 'vaginal-only';
        route = 'vaginal';
        rationale.push('Moderate CVD/VTE risks with GU symptoms - vaginal therapy preferred');
      } else {
        type = hasHysterectomy ? 'ET' : 'EPT';
        route = 'transdermal';
        if (!hasHysterectomy) {
          progestogenType = needsContraception ? 'ius' : 'micronized';
        }
        rationale.push('Moderate CVD/VTE risk - transdermal route preferred for systemic MHT');
      }
    }
    else {
      if (hasHysterectomy) {
        type = 'ET';
        route = 'oral';
        rationale.push('Estrogen-only therapy - hysterectomy, low risks');
      } else {
        type = 'EPT';
        route = 'oral';
        progestogenType = needsContraception ? 'ius' : 'micronized';
        rationale.push('Combined therapy - uterus intact, low risks, oral route allowed');
      }
    }

    return {
      patientId: patient?.id || 'current',
      type,
      route,
      progestogenType,
      rationale,
      followUpSchedule: {
        oneMonth: true,
        sixMonths: true,
        twelveMonths: true,
      },
      generatedAt: new Date(),
    };
  };

  // Prepare patient data with defaults - PRESERVE EXISTING LOGIC
  const patientWithDefaults = {
    id: currentPatient?.id || Date.now().toString(),
    name: currentPatient?.name || 'Patient',
    age: currentPatient?.age || 50,
    height: currentPatient?.height || 165,
    weight: currentPatient?.weight || 70,
    bmi: currentPatient?.bmi || (currentPatient?.height && currentPatient?.weight ? 
      currentPatient.weight / Math.pow(currentPatient.height / 100, 2) : 
      (70 / Math.pow(165 / 100, 2))),
    hysterectomy: Boolean(currentPatient?.hysterectomy),
    personalHistoryBreastCancer: Boolean(currentPatient?.personalHistoryBreastCancer),
    familyHistoryBreastCancer: Boolean(currentPatient?.familyHistoryBreastCancer),
    familyHistoryOvarian: Boolean(currentPatient?.familyHistoryOvarian),
    hypertension: Boolean(currentPatient?.hypertension),
    diabetes: Boolean(currentPatient?.diabetes),
    cholesterolHigh: Boolean(currentPatient?.cholesterolHigh),
    smoking: Boolean(currentPatient?.smoking),
    personalHistoryDVT: Boolean(currentPatient?.personalHistoryDVT),
    thrombophilia: Boolean(currentPatient?.thrombophilia),
    vaginalDryness: currentPatient?.vaginalDryness || 0,
    hotFlushes: currentPatient?.hotFlushes || 0,
    menopausalStatus: currentPatient?.menopausalStatus || 'postmenopausal',
    ...currentPatient,
  };
  
  // CALCULATE EXISTING RESULTS IMMEDIATELY - PRESERVE EXISTING LOGIC
  const riskAssessment = calculateRisksFromCurrentPatient(patientWithDefaults);
  const recommendation = generateRecommendationFromCurrentPatient(patientWithDefaults, riskAssessment);
  
  // NEW: Calculate AI-powered risk assessments
  const aiRiskResults: ComprehensiveRiskResults = useMemo(() => {
    const patientRiskData: PatientRiskData = {
      age: patientWithDefaults.age,
      gender: 'female',
      weight: patientWithDefaults.weight,
      height: patientWithDefaults.height,
      bmi: patientWithDefaults.bmi,
      smoking: patientWithDefaults.smoking,
      diabetes: patientWithDefaults.diabetes,
      hypertension: patientWithDefaults.hypertension,
      cholesterolHigh: patientWithDefaults.cholesterolHigh,
      familyHistoryBreastCancer: patientWithDefaults.familyHistoryBreastCancer,
      personalHistoryBreastCancer: patientWithDefaults.personalHistoryBreastCancer,
      personalHistoryDVT: patientWithDefaults.personalHistoryDVT,
      thrombophilia: patientWithDefaults.thrombophilia,
      menopausalStatus: patientWithDefaults.menopausalStatus,
      hysterectomy: patientWithDefaults.hysterectomy
    };
    
    return calculateAllRisks(patientRiskData);
  }, [patientWithDefaults]);

  // NEW: Check for contraindications
  const contraindications: ContraindicationAlert[] = useMemo(() => {
    return checkHRTContraindications(patientWithDefaults);
  }, [patientWithDefaults]);

  // NEW: Get medication recommendations
  const medicationRecommendations: string[] = useMemo(() => {
    return getMedicationRecommendations(patientWithDefaults, contraindications);
  }, [patientWithDefaults, contraindications]);

  // PRESERVE EXISTING SAVE LOGIC
  const handleSaveAssessment = async () => {
    if (!currentPatient) {
      Alert.alert('Error', 'No patient data to save');
      return;
    }

    setIsSaving(true);
    try {
      if (!currentPatient.id) {
        currentPatient.id = Date.now().toString();
      }
      
      savePatient();
      
      Alert.alert(
        'Success', 
        'Patient assessment saved successfully!',
        [
          { text: 'View Records', onPress: () => navigation.navigate('PatientList') },
          { text: 'OK' }
        ]
      );
      
      console.log('Assessment saved successfully for patient:', currentPatient.name);
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      Alert.alert('Error', 'Failed to save assessment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Fallback if no patient data - PRESERVE EXISTING LOGIC
  if (!currentPatient) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <MaterialIcons name="error-outline" size={48} color="#D81B60" />
          <Text style={{ marginTop: 20, fontSize: 16, color: '#666', textAlign: 'center' }}>
            No assessment data found.{'\n'}Please start a new assessment.
          </Text>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.continueButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // PRESERVE EXISTING HELPER FUNCTIONS
  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#666';
    }
  };

  const getBMICategory = (bmi?: number) => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const formatBMI = (bmi?: number) => {
    if (!bmi) return 'Not calculated';
    const category = getBMICategory(bmi);
    return `${bmi.toFixed(1)} kg/m² — ${category}`;
  };

  // NEW: Helper function for AI risk categories
  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'low':
        return styles.categoryLow;
      case 'moderate':
      case 'intermediate':
      case 'borderline':
        return styles.categoryModerate;
      case 'high':
        return styles.categoryHigh;
      default:
        return styles.categoryModerate;
    }
  };

  // PRESERVE EXISTING RECOMMENDATIONS
  const recommendations = [
    {
      title: 'Hormone Therapy Options',
      items: [
        'Estradiol 1mg daily + Micronized progesterone 100mg (days 1-25)',
        'Consider transdermal estradiol patches as first-line option',
        'Regular monitoring every 3-6 months initially',
      ]
    },
    {
      title: 'Non-Hormonal Alternatives',
      items: [
        'Cognitive Behavioral Therapy (CBT) for mood symptoms',
        'Regular exercise program (150min/week moderate intensity)',
        'Calcium 1200mg + Vitamin D 800IU daily for bone health',
      ]
    },
    {
      title: 'Lifestyle Modifications',
      items: [
        'Maintain healthy BMI (18.5-24.9)',
        'Limit alcohol intake (<14 units/week)',
        'Smoking cessation if applicable',
        'Stress management techniques',
      ]
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      
      {/* FIXED: Back button positioning - moved to standard top-left */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Assessment Results</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>4/4</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* NEW: SECTION - Patient Details */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="person" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>Patient Details</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Patient Name</Text>
                <Text style={styles.summaryValue}>{currentPatient?.name || 'Unknown'}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Age</Text>
                <Text style={styles.summaryValue}>{currentPatient?.age || 'N/A'} years</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Patient ID</Text>
                <Text style={styles.summaryValue}>{currentPatient?.id || 'Generated'}</Text>
              </View>
            </View>
          </View>

          {/* NEW: SECTION - Vital/Anthropometry */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="monitor-weight" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>Vital/Anthropometry</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Weight</Text>
                <Text style={styles.summaryValue}>{currentPatient?.weight || 'N/A'} kg</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Height</Text>
                <Text style={styles.summaryValue}>{currentPatient?.height || 'N/A'} cm</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>BMI Value</Text>
                <Text style={styles.summaryValue}>
                  {patientWithDefaults.bmi ? patientWithDefaults.bmi.toFixed(1) : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>BMI Category</Text>
                <Text style={styles.summaryValue}>
                  {getBMICategory(patientWithDefaults.bmi)}
                </Text>
              </View>
            </View>
          </View>

          {/* PRESERVED: SECTION - MHT Assessment (Original Results) */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="assessment" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>MHT Assessment (Original)</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Overall Risk Level</Text>
                <Text style={[styles.summaryValue, { color: getRiskColor(riskAssessment?.overallRisk) }]}>
                  {riskAssessment?.overallRisk?.toUpperCase() || 'Not Available'}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Breast Cancer Risk</Text>
                <Text style={[styles.summaryValue, { color: getRiskColor(riskAssessment?.breastCancerRisk) }]}>
                  {riskAssessment?.breastCancerRisk?.toUpperCase() || 'LOW'}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>CVD Risk</Text>
                <Text style={[styles.summaryValue, { color: getRiskColor(riskAssessment?.cvdRisk) }]}>
                  {riskAssessment?.cvdRisk?.toUpperCase() || 'LOW'}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>VTE Risk</Text>
                <Text style={[styles.summaryValue, { color: getRiskColor(riskAssessment?.vteRisk) }]}>
                  {riskAssessment?.vteRisk?.toUpperCase() || 'LOW'}
                </Text>
              </View>
            </View>
          </View>

          {/* NEW: SECTION - Risk Calculators (AI-Powered) */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="analytics" size={24} color="#4CAF50" />
              <Text style={styles.summaryTitle}>Risk Calculators (AI-Powered)</Text>
            </View>
            
            {/* Cardiovascular Risk */}
            <View style={styles.calculatorSection}>
              <Text style={styles.calculatorTitle}>Cardiovascular Risk Assessment</Text>
              <View style={styles.calculatorGrid}>
                <View style={styles.calculatorItem}>
                  <Text style={styles.calculatorLabel}>ASCVD Score</Text>
                  <Text style={styles.calculatorValue}>{aiRiskResults.ascvd.risk.toFixed(1)}%</Text>
                  <Text style={[styles.calculatorCategory, getCategoryStyle(aiRiskResults.ascvd.category)]}>
                    {aiRiskResults.ascvd.category}
                  </Text>
                </View>
                <View style={styles.calculatorItem}>
                  <Text style={styles.calculatorLabel}>Framingham Score</Text>
                  <Text style={styles.calculatorValue}>{aiRiskResults.framingham.risk.toFixed(1)}%</Text>
                  <Text style={[styles.calculatorCategory, getCategoryStyle(aiRiskResults.framingham.category)]}>
                    {aiRiskResults.framingham.category}
                  </Text>
                </View>
              </View>
            </View>

            {/* Breast Cancer Risk */}
            <View style={styles.calculatorSection}>
              <Text style={styles.calculatorTitle}>Breast Cancer Risk Assessment</Text>
              <View style={styles.calculatorGrid}>
                <View style={styles.calculatorItem}>
                  <Text style={styles.calculatorLabel}>Gail Risk</Text>
                  <Text style={styles.calculatorValue}>{aiRiskResults.gail.risk.toFixed(1)}%</Text>
                  <Text style={[styles.calculatorCategory, getCategoryStyle(aiRiskResults.gail.category)]}>
                    {aiRiskResults.gail.category}
                  </Text>
                </View>
                <View style={styles.calculatorItem}>
                  <Text style={styles.calculatorLabel}>Tyrer-Cuzick Risk</Text>
                  <Text style={styles.calculatorValue}>{aiRiskResults.tyrerCuzick.risk.toFixed(1)}%</Text>
                  <Text style={[styles.calculatorCategory, getCategoryStyle(aiRiskResults.tyrerCuzick.category)]}>
                    {aiRiskResults.tyrerCuzick.category}
                  </Text>
                </View>
              </View>
            </View>

            {/* VTE and Fracture Risk */}
            <View style={styles.calculatorSection}>
              <Text style={styles.calculatorTitle}>VTE & Fracture Risk Assessment</Text>
              <View style={styles.calculatorGrid}>
                <View style={styles.calculatorItem}>
                  <Text style={styles.calculatorLabel}>Wells Score</Text>
                  <Text style={styles.calculatorValue}>{aiRiskResults.wells.score}</Text>
                  <Text style={[styles.calculatorCategory, getCategoryStyle(aiRiskResults.wells.category)]}>
                    {aiRiskResults.wells.category}
                  </Text>
                </View>
                <View style={styles.calculatorItem}>
                  <Text style={styles.calculatorLabel}>FRAX 10-year Risk</Text>
                  <Text style={styles.calculatorValue}>{aiRiskResults.frax.majorFractureRisk.toFixed(1)}%</Text>
                  <Text style={[styles.calculatorCategory, getCategoryStyle(aiRiskResults.frax.category)]}>
                    {aiRiskResults.frax.category}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* PRESERVED: MHT Recommendation (Original Logic) */}
          <View style={styles.recommendationCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="medical-services" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>MHT Recommendation</Text>
            </View>
            
            <View>
              <View style={styles.recommendationGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Therapy Type</Text>
                  <Text style={styles.summaryValue}>
                    {recommendation?.type === 'ET' ? 'Estrogen Therapy (ET)' :
                     recommendation?.type === 'EPT' ? 'Estrogen + Progestogen Therapy (EPT)' :
                     recommendation?.type === 'vaginal-only' ? 'Vaginal Estrogen Only' :
                     'Not Recommended'}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Route</Text>
                  <Text style={styles.summaryValue}>
                    {recommendation?.route === 'oral' ? 'Oral' :
                     recommendation?.route === 'transdermal' ? 'Transdermal' :
                     recommendation?.route === 'vaginal' ? 'Vaginal' :
                     recommendation?.route === 'none' ? 'None' : 'Oral'}
                  </Text>
                </View>
                
                {recommendation?.progestogenType && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Progestogen</Text>
                    <Text style={styles.summaryValue}>
                      {recommendation.progestogenType === 'micronized' ? 'Micronized Progesterone' :
                       recommendation.progestogenType === 'ius' ? 'Levonorgestrel IUS' : 'None'}
                    </Text>
                  </View>
                )}
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Suitability</Text>
                  <Text style={[styles.summaryValue, { 
                    color: recommendation?.type === 'not-recommended' ? '#F44336' : '#4CAF50' 
                  }]}>
                    {recommendation?.type === 'not-recommended' ? 'NOT SUITABLE' : 'SUITABLE'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.rationaleSection}>
                <Text style={styles.rationaleTitle}>Clinical Rationale:</Text>
                {(recommendation?.rationale || ['Assessment completed with available data']).map((reason, index) => (
                  <View key={index} style={styles.rationaleItem}>
                    <MaterialIcons name="fiber-manual-record" size={8} color="#D81B60" />
                    <Text style={styles.rationaleText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* NEW: SECTION - Drug Interaction & Contraindications */}
          {contraindications.length > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <MaterialIcons name="warning" size={24} color="#F44336" />
                <Text style={styles.summaryTitle}>Drug Interaction & Contraindications</Text>
              </View>
              {contraindications.map((alert, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.alertItem, 
                    alert.type === 'absolute' ? styles.alertAbsolute : styles.alertRelative
                  ]}
                >
                  <MaterialIcons 
                    name={alert.type === 'absolute' ? 'block' : 'warning'} 
                    size={20} 
                    color={alert.type === 'absolute' ? '#F44336' : '#FF9800'} 
                  />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>
                      {alert.type === 'absolute' ? 'CONTRAINDICATION' : 'CAUTION'}: {alert.condition}
                    </Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text style={styles.alertRecommendation}>Recommended Action: {alert.recommendation}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* NEW: SECTION - Recommendations & Next Steps */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="lightbulb" size={24} color="#2196F3" />
              <Text style={styles.summaryTitle}>Recommendations & Next Steps</Text>
            </View>
            
            {/* Evidence-based medication recommendations */}
            {medicationRecommendations.length > 0 && (
              <View style={styles.rationaleSection}>
                <Text style={styles.rationaleTitle}>Evidence-Based Treatment Recommendations:</Text>
                {medicationRecommendations.map((recommendation, index) => (
                  <View key={index} style={styles.rationaleItem}>
                    <MaterialIcons name="medication" size={12} color="#2196F3" />
                    <Text style={styles.rationaleText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Preserve original recommendations */}
            {recommendations.map((section, index) => (
              <View key={index} style={styles.rationaleSection}>
                <Text style={styles.rationaleTitle}>{section.title}:</Text>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.rationaleItem}>
                    <MaterialIcons name="check-circle" size={12} color="#4CAF50" />
                    <Text style={styles.rationaleText}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* PRESERVED: Evidence Base */}
          <View style={styles.evidenceCard}>
            <View style={styles.evidenceHeader}>
              <MaterialIcons name="science" size={20} color="#D81B60" />
              <Text style={styles.evidenceTitle}>Evidence Base</Text>
            </View>
            <Text style={styles.evidenceText}>
              These recommendations combine the latest guidelines from the International Menopause Society (IMS), 
              the North American Menopause Society (NAMS), with AI-powered risk assessment using validated 
              clinical algorithms including Framingham, ASCVD, Gail, Tyrer-Cuzick, Wells, and FRAX calculators.
            </Text>
          </View>

          {/* PRESERVED: Action Items */}
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Next Steps</Text>
            <View style={styles.actionItem}>
              <MaterialIcons name="schedule" size={18} color="#D81B60" />
              <Text style={styles.actionText}>Schedule follow-up appointment in 3 months</Text>
            </View>
            <View style={styles.actionItem}>
              <MaterialIcons name="local-pharmacy" size={18} color="#D81B60" />
              <Text style={styles.actionText}>Discuss prescription options with patient</Text>
            </View>
            <View style={styles.actionItem}>
              <MaterialIcons name="description" size={18} color="#D81B60" />
              <Text style={styles.actionText}>Provide patient information leaflet</Text>
            </View>
            <View style={styles.actionItem}>
              <MaterialIcons name="analytics" size={18} color="#D81B60" />
              <Text style={styles.actionText}>Review AI risk assessment results with patient</Text>
            </View>
          </View>
        </ScrollView>

        {/* PRESERVED: Button Container */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.exportButton]} 
              onPress={() => navigation.navigate('Export')}
            >
              <MaterialIcons name="share" size={20} color="#D81B60" />
              <Text style={styles.exportButtonText}>Export</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.saveButton,
                isSaving && { backgroundColor: '#999' }
              ]} 
              onPress={handleSaveAssessment}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Save & Finish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialIcons name="home" size={20} color="white" />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// PRESERVED: All existing styles + new calculator styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#D81B60',
  },
  stepIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D81B60',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF0F5',
    padding: 15,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  evidenceCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  evidenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D81B60',
  },
  evidenceText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 15,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  exportButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#D81B60',
  },
  exportButtonText: {
    color: '#D81B60',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  rationaleSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rationaleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 10,
  },
  rationaleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
    paddingLeft: 5,
  },
  rationaleText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    lineHeight: 18,
  },
  // New styles for AI risk calculators
  calculatorSection: {
    marginBottom: 20,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  calculatorGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  calculatorItem: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calculatorLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  calculatorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calculatorCategory: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryLow: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  categoryModerate: {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
  },
  categoryHigh: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  },
  // Alert styles
  alertItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertAbsolute: {
    backgroundColor: '#ffebee',
    borderColor: '#F44336',
  },
  alertRelative: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF9800',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  alertRecommendation: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    lineHeight: 18,
  },
});