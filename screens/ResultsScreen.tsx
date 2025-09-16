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
import pdfExportGenerator, { PatientData } from '../utils/pdfExportGenerator';
import SimpleDrugInteractionChecker from '../components/SimpleDrugInteractionChecker';

// Import ALL AI risk calculators and drug interaction features
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
  DecisionSupport: undefined;
  Cme: undefined;
  Guidelines: undefined;
  Export: undefined;
  PatientDetails: undefined;
};

type ResultsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results'>;

interface Props {
  navigation: ResultsNavigationProp;
}

export default function ResultsScreen({ navigation }: Props) {
  // Get store data and functions - PRESERVE ALL EXISTING FUNCTIONALITY
  const { currentPatient, savePatient, calculateRisks, generateRecommendation } = useAssessmentStore();
  
  // Local state for saving only - NO LOADING STATES
  const [isSaving, setIsSaving] = useState(false);
  
  // Drug Interaction Checker modal state
  const [showDrugInteractionChecker, setShowDrugInteractionChecker] = useState(false);

  // If Drug Interaction Checker modal is open, show it
  if (showDrugInteractionChecker) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDrugInteractionChecker(false)}
          >
            <MaterialIcons name="close" size={24} color="#D81B60" />
          </TouchableOpacity>
        </View>
        <SimpleDrugInteractionChecker />
      </SafeAreaView>
    );
  }

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

  // HARDCODED OUTCOME MAP - DETERMINISTIC MHT RECOMMENDATION ENGINE
  const generateRecommendationFromCurrentPatient = (patient: any, risks: any) => {
    let type: 'ET' | 'EPT' | 'vaginal-only' | 'not-recommended' = 'not-recommended';
    let route: 'oral' | 'transdermal' | 'none' = 'none';
    let progestogenType: 'micronized' | 'ius' | undefined;
    const rationale: string[] = [];

    const hasHysterectomy = Boolean(patient?.hysterectomy);
    const hasGUSymptoms = (patient?.vaginalDryness || 0) >= 5;
    const needsContraception = Boolean(patient?.needsContraception); // Future field

    // HARDCODED OUTCOME MAP BASED ON EXACT REQUIREMENTS
    
    // 1) Breast Cancer Risk = High → No systemic MHT
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
    
    // 2) CVD Risk = High → Prefer Vaginal/local therapy
    else if (risks.cvdRisk === 'high') {
      if (hasGUSymptoms || (risks.vteRisk === 'moderate' || risks.vteRisk === 'high')) {
        type = 'vaginal-only';
        route = 'vaginal';
        rationale.push('High CVD risk - vaginal/local therapy preferred');
        rationale.push('If systemic needed, transdermal only with caution');
      } else if (risks.vteRisk === 'low') {
        // Allow systemic with transdermal only
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
    
    // 3) VTE Risk = High → Prefer Vaginal/local therapy  
    else if (risks.vteRisk === 'high') {
      if (hasGUSymptoms || risks.cvdRisk === 'moderate') {
        type = 'vaginal-only';
        route = 'vaginal';
        rationale.push('High VTE risk - vaginal/local therapy preferred');
        rationale.push('If systemic needed, transdermal only with caution');
      } else if (risks.cvdRisk === 'low') {
        // Allow systemic with transdermal only
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
    
    // 4) Moderate CVD/VTE → If systemic, Transdermal
    else if (risks.cvdRisk === 'moderate' || risks.vteRisk === 'moderate') {
      if (hasGUSymptoms && (risks.cvdRisk === 'moderate' && risks.vteRisk === 'moderate')) {
        // Both moderate + GU symptoms = prefer vaginal
        type = 'vaginal-only';
        route = 'vaginal';
        rationale.push('Moderate CVD/VTE risks with GU symptoms - vaginal therapy preferred');
      } else {
        // Allow systemic with transdermal
        type = hasHysterectomy ? 'ET' : 'EPT';
        route = 'transdermal';
        if (!hasHysterectomy) {
          progestogenType = needsContraception ? 'ius' : 'micronized';
        }
        rationale.push('Moderate CVD/VTE risk - transdermal route preferred for systemic MHT');
      }
    }
    
    // 5) All Low Risks → Full systemic options
    else {
      // Uterus Status determines ET vs EPT
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

  // IMMEDIATE SYNCHRONOUS CALCULATION - NO USEEFFECT DELAYS
  // Prepare patient data with defaults - PRESERVE ALL EXISTING FIELDS + ADD NEW OPTIONAL FIELDS
  const patientWithDefaults = {
    id: currentPatient?.id || Date.now().toString(),
    name: currentPatient?.name || 'Patient',
    age: currentPatient?.age || 50,
    height: currentPatient?.height || 165,
    weight: currentPatient?.weight || 70,
    bmi: currentPatient?.bmi || (currentPatient?.height && currentPatient?.weight ? 
      currentPatient.weight / Math.pow(currentPatient.height / 100, 2) : 
      (70 / Math.pow(165 / 100, 2))), // Default BMI calculation
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
    // Add new fields as optional for backward compatibility
    menopausalStatus: currentPatient?.menopausalStatus || 'postmenopausal',
    nightSweats: currentPatient?.nightSweats || 0,
    sleepDisturbance: currentPatient?.sleepDisturbance || 0,
    moodChanges: currentPatient?.moodChanges || 0,
    jointAches: currentPatient?.jointAches || 0,
    ...currentPatient,
  };
  
  // CALCULATE EXISTING RESULTS IMMEDIATELY - PRESERVE ALL EXISTING FUNCTIONALITY
  const riskAssessment = calculateRisksFromCurrentPatient(patientWithDefaults);
  const recommendation = generateRecommendationFromCurrentPatient(patientWithDefaults, riskAssessment);
  
  // NEW: CALCULATE ALL AI RISK CALCULATORS - ADD NEW FEATURES
  const patientRiskData = {
    ...patientWithDefaults,
    gender: 'female' as const  // Add required gender field for AI calculators
  };
  const comprehensiveRiskResults: ComprehensiveRiskResults = calculateAllRisks(patientRiskData);
  
  // NEW: CHECK FOR DRUG INTERACTIONS AND CONTRAINDICATIONS
  const contraindications: ContraindicationAlert[] = checkHRTContraindications(patientWithDefaults);
  const medicationRecommendations: string[] = getMedicationRecommendations(patientWithDefaults, contraindications);
  
  // Results calculated immediately and synchronously - NO LOADING LOGIC

  const handleSaveAssessment = async () => {
    if (!currentPatient) {
      Alert.alert('Error', 'No patient data to save');
      return;
    }

    setIsSaving(true);
    try {
      // Make sure patient has an ID
      if (!currentPatient.id) {
        currentPatient.id = Date.now().toString();
      }
      
      // Save the patient data (which includes demographics, symptoms, and risk factors)
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

  // NEW: PDF Export functionality - directly export without navigating
  const handleExportPDF = async () => {
    console.log('🔧 Export PDF button clicked');
    
    if (!currentPatient) {
      Alert.alert('Error', 'No patient data available for export');
      return;
    }

    console.log('✅ Patient data available:', currentPatient.name);

    // Show export dialog first
    Alert.alert(
      'Export Assessment',
      'Generate a comprehensive PDF report with all assessment data, risk scores, and treatment recommendations?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export PDF', 
          onPress: async () => {
            console.log('🚀 Starting PDF export process...');
            
            try {
              // Prepare comprehensive patient data for PDF export
              const bmi = patientWithDefaults.bmi;
              console.log('📊 BMI calculated:', bmi);
              
              const questionnaireData: Record<string, any> = {
                'Hot Flushes Severity': currentPatient.hotFlushes || 0,
                'Vaginal Dryness': currentPatient.vaginalDryness || 0,
                'Night Sweats': currentPatient.nightSweats || 0,
                'Sleep Disturbance': currentPatient.sleepDisturbance || 0,
                'Mood Changes': currentPatient.moodChanges || 0,
                'Joint Aches': currentPatient.jointAches || 0,
                'Hysterectomy History': currentPatient.hysterectomy ? 'Yes' : 'No',
                'Personal History Breast Cancer': currentPatient.personalHistoryBreastCancer ? 'Yes' : 'No',
                'Family History Breast Cancer': currentPatient.familyHistoryBreastCancer ? 'Yes' : 'No',
                'Family History Ovarian Cancer': currentPatient.familyHistoryOvarian ? 'Yes' : 'No',
                'Hypertension': currentPatient.hypertension ? 'Yes' : 'No',
                'Diabetes': currentPatient.diabetes ? 'Yes' : 'No',
                'High Cholesterol': currentPatient.cholesterolHigh ? 'Yes' : 'No',
                'Smoking': currentPatient.smoking ? 'Yes' : 'No',
                'Personal History DVT': currentPatient.personalHistoryDVT ? 'Yes' : 'No',
                'Thrombophilia': currentPatient.thrombophilia ? 'Yes' : 'No',
                'Menopausal Status': currentPatient.menopausalStatus || 'Postmenopausal'
              };

              console.log('📝 Questionnaire data prepared');

              const patientData: PatientData = {
                name: currentPatient.name,
                age: currentPatient.age,
                id: currentPatient.id,
                height: currentPatient.height,
                weight: currentPatient.weight,
                bmi: bmi,
                gender: 'Female',
                dateOfBirth: currentPatient.age ? `${new Date().getFullYear() - currentPatient.age}` : undefined,
                assessmentId: currentPatient.id,
                assessmentDate: new Date().toISOString(),
                questionnaire: questionnaireData,
                riskScores: comprehensiveRiskResults ? {
                  ascvd: {
                    risk: comprehensiveRiskResults.ascvd.risk,
                    category: comprehensiveRiskResults.ascvd.category,
                    interpretation: `10-year ASCVD risk based on pooled cohort equations`
                  },
                  framingham: {
                    risk: comprehensiveRiskResults.framingham.risk,
                    category: comprehensiveRiskResults.framingham.category,
                    interpretation: `10-year CHD risk based on Framingham Risk Score`
                  },
                  gail: {
                    risk: comprehensiveRiskResults.gail.risk,
                    category: comprehensiveRiskResults.gail.category,
                    interpretation: `5-year breast cancer risk based on Gail model`
                  },
                  tyrerCuzick: {
                    risk: comprehensiveRiskResults.tyrerCuzick.risk,
                    category: comprehensiveRiskResults.tyrerCuzick.category,
                    interpretation: `10-year breast cancer risk based on Tyrer-Cuzick model`
                  },
                  wells: {
                    score: comprehensiveRiskResults.wells.score,
                    category: comprehensiveRiskResults.wells.category,
                    interpretation: `DVT probability based on Wells Score`
                  },
                  frax: {
                    majorFractureRisk: comprehensiveRiskResults.frax.majorFractureRisk,
                    category: comprehensiveRiskResults.frax.category,
                    interpretation: `10-year major osteoporotic fracture risk`
                  }
                } : undefined,
                riskAssessment: {
                  overallRiskLevel: riskAssessment?.overallRisk || 'low',
                  breastCancerRisk: riskAssessment?.breastCancerRisk || 'low',
                  cvdRisk: riskAssessment?.cvdRisk || 'low',
                  vteRisk: riskAssessment?.vteRisk || 'low',
                  interpretation: `Overall risk assessment based on individual risk factors and validated risk calculators. Risk levels guide MHT recommendations according to IMS/NAMS guidelines.`
                },
                treatmentPlan: {
                  type: recommendation?.type || 'not-recommended',
                  route: recommendation?.route || 'none',
                  progestogenType: recommendation?.progestogenType,
                  rationale: recommendation?.rationale || ['Assessment completed with available data'],
                  alternatives: [
                    'Non-hormonal alternatives: SSRIs/SNRIs for vasomotor symptoms',
                    'Lifestyle modifications: Regular exercise, dietary changes',
                    'Complementary therapies: CBT, mindfulness, acupuncture'
                  ],
                  monitoringPlan: [
                    'Baseline assessment: mammography, cardiovascular risk evaluation',
                    '3-month follow-up: symptom assessment, side effects review',
                    '6-month follow-up: efficacy evaluation, dosage adjustment if needed',
                    'Annual review: comprehensive health assessment, risk-benefit evaluation'
                  ]
                },
                decisionSupport: {
                  contraindications: contraindications.length > 0 ? 
                    contraindications.map(c => `${c.condition}: ${c.severity} - ${c.reason}`) : [],
                  recommendations: medicationRecommendations.length > 0 ? medicationRecommendations : [
                    'Discuss shared decision-making with patient',
                    'Provide patient information leaflets',
                    'Schedule appropriate follow-up based on treatment plan'
                  ]
                }
              };

              console.log('📋 Patient data structure prepared for PDF');

              // Show a loading alert
              Alert.alert('Generating PDF...', 'Please wait while we prepare your comprehensive assessment report.');

              // Export PDF
              console.log('📄 Calling PDF generator...');
              await pdfExportGenerator.exportAndShare(patientData);
              
              console.log('✅ PDF export completed successfully');
              
            } catch (error) {
              console.error('❌ PDF export failed:', error);
              Alert.alert(
                'Export Failed', 
                `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}.\n\nPlease try again or contact support if the issue persists.`,
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  // NO LOADING SCREEN - ALWAYS SHOW RESULTS IMMEDIATELY

  // Fallback if no patient data
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

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#666';
    }
  };

  // Helper function to get BMI category
  const getBMICategory = (bmi?: number) => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  // Helper function to format BMI display
  const formatBMI = (bmi?: number) => {
    if (!bmi) return 'Not calculated';
    const category = getBMICategory(bmi);
    return `${bmi.toFixed(1)} kg/m² — ${category}`;
  };

  // Helper function to get BMI color
  const getBMIColor = (bmi?: number) => {
    if (!bmi) return '#666';
    if (bmi < 18.5) return '#FF9800'; // Underweight - Orange
    if (bmi < 25) return '#4CAF50'; // Normal - Green
    if (bmi < 30) return '#FF9800'; // Overweight - Orange
    return '#F44336'; // Obese - Red
  };

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
          
          {/* SECTION 1: PATIENT DETAILS */}
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
                <Text style={styles.summaryValue}>{currentPatient?.id || 'N/A'}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Date of Birth</Text>
                <Text style={styles.summaryValue}>
                  {currentPatient?.age ? new Date().getFullYear() - currentPatient.age : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* SECTION 2: VITAL/ANTHROPOMETRY */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="monitor-weight" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>Vital/Anthropometry</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Height</Text>
                <Text style={styles.summaryValue}>{currentPatient?.height || 'N/A'} cm</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Weight</Text>
                <Text style={styles.summaryValue}>{currentPatient?.weight || 'N/A'} kg</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>BMI Value</Text>
                <Text style={styles.summaryValue}>
                  {patientWithDefaults.bmi ? patientWithDefaults.bmi.toFixed(1) : 'N/A'} kg/m²
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>BMI Category</Text>
                <Text style={[styles.summaryValue, { 
                  color: getBMIColor(patientWithDefaults.bmi) 
                }]}>
                  {getBMICategory(patientWithDefaults.bmi)}
                </Text>
              </View>
            </View>
          </View>

          {/* SECTION 3: MHT ASSESSMENT (EXISTING RESULTS) */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="assessment" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>MHT Assessment</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Overall Risk Level</Text>
                <Text style={[styles.summaryValue, { color: getRiskColor(riskAssessment?.overallRisk) }]}>
                  {riskAssessment?.overallRisk?.toUpperCase() || 'LOW'}
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

          {/* CARDIOVASCULAR RISK */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="favorite" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>Cardiovascular Risk</Text>
            </View>
            
            <View style={styles.riskSection}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>ASCVD Risk Score</Text>
                {comprehensiveRiskResults ? (
                  <Text style={[styles.riskValue, { color: getRiskColor(comprehensiveRiskResults.ascvd.category.toLowerCase()) }]}>
                    {comprehensiveRiskResults.ascvd.risk.toFixed(1)}% — {comprehensiveRiskResults.ascvd.category}
                  </Text>
                ) : (
                  <Text style={styles.riskError}>Not calculated — missing inputs</Text>
                )}
              </View>
              
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Framingham Risk Score</Text>
                {comprehensiveRiskResults ? (
                  <Text style={[styles.riskValue, { color: getRiskColor(comprehensiveRiskResults.framingham.category.toLowerCase()) }]}>
                    {comprehensiveRiskResults.framingham.risk.toFixed(1)}% — {comprehensiveRiskResults.framingham.category}
                  </Text>
                ) : (
                  <Text style={styles.riskError}>Not calculated — missing inputs</Text>
                )}
              </View>
            </View>
          </View>

          {/* BREAST CANCER RISK */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="health-and-safety" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>Breast Cancer Risk</Text>
            </View>
            
            <View style={styles.riskSection}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Gail Model</Text>
                {comprehensiveRiskResults ? (
                  <Text style={[styles.riskValue, { color: getRiskColor(comprehensiveRiskResults.gail.category.toLowerCase()) }]}>
                    {comprehensiveRiskResults.gail.risk.toFixed(1)}% — {comprehensiveRiskResults.gail.category}
                  </Text>
                ) : (
                  <Text style={styles.riskError}>Not calculated — missing inputs</Text>
                )}
              </View>
              
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Tyrer-Cuzick Model</Text>
                {comprehensiveRiskResults ? (
                  <Text style={[styles.riskValue, { color: getRiskColor(comprehensiveRiskResults.tyrerCuzick.category.toLowerCase()) }]}>
                    {comprehensiveRiskResults.tyrerCuzick.risk.toFixed(1)}% — {comprehensiveRiskResults.tyrerCuzick.category}
                  </Text>
                ) : (
                  <Text style={styles.riskError}>Not calculated — missing inputs</Text>
                )}
              </View>
            </View>
          </View>

          {/* VTE (THROMBOSIS) RISK */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="bloodtype" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>VTE (Thrombosis) Risk</Text>
            </View>
            
            <View style={styles.riskSection}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Wells Score</Text>
                {comprehensiveRiskResults ? (
                  <Text style={[styles.riskValue, { color: getRiskColor(comprehensiveRiskResults.wells.category.toLowerCase()) }]}>
                    {comprehensiveRiskResults.wells.score.toFixed(1)} — {comprehensiveRiskResults.wells.category}
                  </Text>
                ) : (
                  <Text style={styles.riskError}>Not calculated — missing inputs</Text>
                )}
              </View>
            </View>
          </View>

          {/* OSTEOPOROSIS RISK */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="accessibility" size={24} color="#D81B60" />
              <Text style={styles.summaryTitle}>Osteoporosis Risk</Text>
            </View>
            
            <View style={styles.riskSection}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>FRAX 10-year Fracture Risk</Text>
                {comprehensiveRiskResults ? (
                  <Text style={[styles.riskValue, { color: getRiskColor(comprehensiveRiskResults.frax.category.toLowerCase()) }]}>
                    {comprehensiveRiskResults.frax.majorFractureRisk.toFixed(1)}% — {comprehensiveRiskResults.frax.category}
                  </Text>
                ) : (
                  <Text style={styles.riskError}>Not calculated — missing inputs</Text>
                )}
              </View>
            </View>
          </View>

          {/* MHT RECOMMENDATION (PRESERVE EXISTING) */}
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
                  <Text style={styles.summaryLabel}>Complete Assessment</Text>
                  <Text style={styles.summaryValue}>
                    {`BC: ${riskAssessment?.breastCancerRisk?.toUpperCase() || 'LOW'}, CVD: ${riskAssessment?.cvdRisk?.toUpperCase() || 'LOW'}, VTE: ${riskAssessment?.vteRisk?.toUpperCase() || 'LOW'} → ${
                      recommendation?.type === 'ET' ? `ET (${recommendation.route?.charAt(0).toUpperCase() + recommendation.route?.slice(1) || 'Oral'})` :
                      recommendation?.type === 'EPT' ? `EPT (${recommendation.route?.charAt(0).toUpperCase() + recommendation.route?.slice(1) || 'Oral'}, ${recommendation.progestogenType === 'micronized' ? 'Micronized' : recommendation.progestogenType === 'ius' ? 'IUS' : 'Micronized'})` :
                      recommendation?.type === 'vaginal-only' ? 'Vaginal Therapy Only' : 
                      'No Systemic MHT'
                    }`}
                  </Text>
                </View>
                
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

          {/* Recommendations */}
          {recommendations.map((section, index) => (
            <View key={index} style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.recommendationItem}>
                  <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.recommendationText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Evidence Base */}
          <View style={styles.evidenceCard}>
            <View style={styles.evidenceHeader}>
              <MaterialIcons name="science" size={20} color="#D81B60" />
              <Text style={styles.evidenceTitle}>Evidence Base</Text>
            </View>
            <Text style={styles.evidenceText}>
              These recommendations are based on the latest guidelines from the International Menopause Society (IMS) and the North American Menopause Society (NAMS).
            </Text>
          </View>

          {/* Action Items */}
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
          </View>

          {/* Decision Support Button */}
          <View style={styles.decisionSupportSection}>
            <TouchableOpacity 
              style={styles.decisionSupportButton} 
              onPress={() => {
                console.log('🔍 Drug Interaction Checker button pressed from Results');
                setShowDrugInteractionChecker(true);
                console.log('🔍 Showing SimpleDrugInteractionChecker modal from Results');
              }}
            >
              <MaterialIcons name="support" size={24} color="#D81B60" />
              <Text style={styles.decisionSupportButtonText}>Drug Interaction Checker</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#D81B60" />
            </TouchableOpacity>
            <Text style={styles.decisionSupportDescription}>
              Access treatment recommendations, drug interactions, and generate comprehensive treatment plans
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.exportButton]} 
                onPress={handleExportPDF}
              >
                <MaterialIcons name="picture-as-pdf" size={20} color="#D81B60" />
                <Text style={styles.exportButtonText}>Export PDF</Text>
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
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    gap: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertCondition: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  alertRecommendation: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    lineHeight: 18,
  },
  medicationRecommendations: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  riskSection: {
    gap: 15,
  },
  riskItem: {
    backgroundColor: '#FFF0F5',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D81B60',
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 8,
  },
  riskValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  riskError: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  decisionSupportSection: {
    padding: 20,
    paddingBottom: 10,
  },
  decisionSupportButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#D81B60',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  decisionSupportButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#D81B60',
    marginLeft: 12,
  },
  decisionSupportDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  
  // Modal styles for Drug Interaction Checker
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    backgroundColor: 'white',
  },
  closeButton: {
    padding: 8,
  },
});