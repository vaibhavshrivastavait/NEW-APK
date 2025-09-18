import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { calculateAllRisks, type ComprehensiveRiskResults, type PatientRiskData } from '../utils/medicalCalculators';
import { checkHRTContraindications, getMedicationRecommendations, type ContraindicationAlert } from '../utils/drugInteractionChecker';

// Pink color scheme matching the app theme
const PINK_COLORS = {
  primary: '#D81B60',
  primaryLight: '#FFC1CC',
  primaryLighter: '#FFF0F5',
  secondary: '#FFB3BA',
  accent: '#FF69B4',
  text: {
    primary: '#D81B60',
    secondary: '#B71C1C',
    muted: '#E91E63',
    dark: '#333333',
    light: '#666666'
  },
  background: {
    main: '#FFF0F5',
    card: '#FFFFFF',
    section: '#FAFAFA',
    accent: '#FCE4EC'
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  }
};

interface PatientData {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  bmi?: number;
  menopausalStatus: 'premenopausal' | 'perimenopausal' | 'postmenopausal';
  hysterectomy: boolean;
  oophorectomy: boolean;
  hotFlushes: number;
  nightSweats: number;
  sleepDisturbance: number;
  vaginalDryness: number;
  moodChanges: number;
  jointAches: number;
  familyHistoryBreastCancer: boolean;
  familyHistoryOvarian: boolean;
  personalHistoryBreastCancer: boolean;
  personalHistoryDVT: boolean;
  thrombophilia: boolean;
  smoking: boolean;
  diabetes: boolean;
  hypertension: boolean;
  cholesterolHigh: boolean;
  createdAt: string | Date; // Can be serialized string or Date object
  updatedAt: Date;
}

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
  PatientDetails: { 
    patient: Omit<PatientData, 'createdAt'> & { 
      createdAt: string | Date; // Allow both serialized string and Date
    }; 
  };
  About: undefined;
};

type PatientDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientDetails'>;
type PatientDetailsRouteProp = RouteProp<RootStackParamList, 'PatientDetails'>;

interface Props {
  navigation: PatientDetailsNavigationProp;
  route: PatientDetailsRouteProp;
}

export default function PatientDetailsScreen({ navigation, route }: Props) {
  const { patient } = route.params;

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate comprehensive risk assessments
  const riskResults: ComprehensiveRiskResults = useMemo(() => {
    const patientRiskData: PatientRiskData = {
      age: patient.age,
      gender: 'female',
      weight: patient.weight,
      height: patient.height,
      bmi: patient.bmi,
      smoking: patient.smoking,
      diabetes: patient.diabetes,
      hypertension: patient.hypertension,
      cholesterolHigh: patient.cholesterolHigh,
      familyHistoryBreastCancer: patient.familyHistoryBreastCancer,
      personalHistoryBreastCancer: patient.personalHistoryBreastCancer,
      personalHistoryDVT: patient.personalHistoryDVT,
      thrombophilia: patient.thrombophilia,
      menopausalStatus: patient.menopausalStatus,
      hysterectomy: patient.hysterectomy
    };
    
    return calculateAllRisks(patientRiskData);
  }, [patient]);

  // Check for contraindications
  const contraindications: ContraindicationAlert[] = useMemo(() => {
    return checkHRTContraindications(patient);
  }, [patient]);

  // Get medication recommendations
  const medicationRecommendations: string[] = useMemo(() => {
    return getMedicationRecommendations(patient, contraindications);
  }, [patient, contraindications]);

  const getBMICategory = (bmi?: number) => {
    if (!bmi) return 'Not calculated';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getSymptomSeverity = (score: number) => {
    if (score === 0) return 'None';
    if (score <= 2) return 'Mild';
    if (score <= 4) return 'Moderate';
    return 'Severe';
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Patient Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Basic Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={24} color="#D81B60" />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{patient.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{patient.age} years</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{patient.height} cm</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{patient.weight} kg</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>BMI</Text>
              <Text style={styles.infoValue}>
                {patient.bmi ? patient.bmi.toFixed(1) : 'N/A'}
              </Text>
              <Text style={styles.infoBadge}>
                {getBMICategory(patient.bmi)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Menopausal Status</Text>
              <Text style={styles.infoValue}>
                {patient.menopausalStatus.charAt(0).toUpperCase() + patient.menopausalStatus.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Medical History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="medical-services" size={24} color="#D81B60" />
            <Text style={styles.sectionTitle}>Medical History</Text>
          </View>
          <View style={styles.historyGrid}>
            <View style={[styles.historyItem, patient.hysterectomy && styles.historyPositive]}>
              <MaterialIcons 
                name={patient.hysterectomy ? "check-circle" : "cancel"} 
                size={20} 
                color={patient.hysterectomy ? "#4CAF50" : "#999"} 
              />
              <Text style={[styles.historyText, patient.hysterectomy && styles.historyPositiveText]}>
                Hysterectomy
              </Text>
            </View>
            <View style={[styles.historyItem, patient.oophorectomy && styles.historyPositive]}>
              <MaterialIcons 
                name={patient.oophorectomy ? "check-circle" : "cancel"} 
                size={20} 
                color={patient.oophorectomy ? "#4CAF50" : "#999"} 
              />
              <Text style={[styles.historyText, patient.oophorectomy && styles.historyPositiveText]}>
                Oophorectomy
              </Text>
            </View>
          </View>
        </View>

        {/* Symptoms Assessment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="healing" size={24} color="#D81B60" />
            <Text style={styles.sectionTitle}>Symptom Assessment</Text>
          </View>
          <View style={styles.symptomGrid}>
            {[
              { name: 'Hot Flushes', score: patient.hotFlushes, icon: 'local-fire-department' },
              { name: 'Night Sweats', score: patient.nightSweats, icon: 'nights-stay' },
              { name: 'Sleep Disturbance', score: patient.sleepDisturbance, icon: 'bedtime' },
              { name: 'Vaginal Dryness', score: patient.vaginalDryness, icon: 'water-drop' },
              { name: 'Mood Changes', score: patient.moodChanges, icon: 'mood' },
              { name: 'Joint Aches', score: patient.jointAches, icon: 'accessibility' },
            ].map((symptom) => (
              <View key={symptom.name} style={styles.symptomItem}>
                <View style={styles.symptomHeader}>
                  <MaterialIcons name={symptom.icon as any} size={20} color="#666" />
                  <Text style={styles.symptomName}>{symptom.name}</Text>
                </View>
                <View style={styles.symptomScore}>
                  <Text style={styles.scoreNumber}>{symptom.score}/6</Text>
                  <Text style={[
                    styles.scoreSeverity,
                    symptom.score === 0 && styles.scoreNone,
                    symptom.score <= 2 && symptom.score > 0 && styles.scoreMild,
                    symptom.score <= 4 && symptom.score > 2 && styles.scoreModerate,
                    symptom.score > 4 && styles.scoreSevere,
                  ]}>
                    {getSymptomSeverity(symptom.score)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Risk Factors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="warning" size={24} color="#FF9800" />
            <Text style={styles.sectionTitle}>Risk Factors</Text>
          </View>
          <View style={styles.riskGrid}>
            {[
              { name: 'Family History - Breast Cancer', value: patient.familyHistoryBreastCancer },
              { name: 'Family History - Ovarian Cancer', value: patient.familyHistoryOvarian },
              { name: 'Personal History - Breast Cancer', value: patient.personalHistoryBreastCancer },
              { name: 'Personal History - DVT/PE', value: patient.personalHistoryDVT },
              { name: 'Thrombophilia', value: patient.thrombophilia },
              { name: 'Smoking', value: patient.smoking },
              { name: 'Diabetes', value: patient.diabetes },
              { name: 'Hypertension', value: patient.hypertension },
              { name: 'High Cholesterol', value: patient.cholesterolHigh },
            ].map((risk) => (
              <View key={risk.name} style={[styles.riskItem, risk.value && styles.riskPositive]}>
                <MaterialIcons 
                  name={risk.value ? "warning" : "check-circle"} 
                  size={18} 
                  color={risk.value ? "#FF5722" : "#4CAF50"} 
                />
                <Text style={[styles.riskText, risk.value && styles.riskPositiveText]}>
                  {risk.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Risk Calculators */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="analytics" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Risk Calculators</Text>
          </View>
          
          {/* Cardiovascular Risk */}
          <View style={styles.calculatorSection}>
            <Text style={styles.calculatorTitle}>Cardiovascular Risk Assessment</Text>
            <View style={styles.calculatorGrid}>
              <View style={styles.calculatorItem}>
                <Text style={styles.calculatorLabel}>ASCVD Score</Text>
                <Text style={styles.calculatorValue}>{riskResults.ascvd.risk.toFixed(1)}%</Text>
                <Text style={[styles.calculatorCategory, getCategoryStyle(riskResults.ascvd.category)]}>
                  {riskResults.ascvd.category}
                </Text>
              </View>
              <View style={styles.calculatorItem}>
                <Text style={styles.calculatorLabel}>Framingham Score</Text>
                <Text style={styles.calculatorValue}>{riskResults.framingham.risk.toFixed(1)}%</Text>
                <Text style={[styles.calculatorCategory, getCategoryStyle(riskResults.framingham.category)]}>
                  {riskResults.framingham.category}
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
                <Text style={styles.calculatorValue}>{riskResults.gail.risk.toFixed(1)}%</Text>
                <Text style={[styles.calculatorCategory, getCategoryStyle(riskResults.gail.category)]}>
                  {riskResults.gail.category}
                </Text>
              </View>
              <View style={styles.calculatorItem}>
                <Text style={styles.calculatorLabel}>Tyrer-Cuzick Risk</Text>
                <Text style={styles.calculatorValue}>{riskResults.tyrerCuzick.risk.toFixed(1)}%</Text>
                <Text style={[styles.calculatorCategory, getCategoryStyle(riskResults.tyrerCuzick.category)]}>
                  {riskResults.tyrerCuzick.category}
                </Text>
              </View>
            </View>
          </View>

          {/* VTE and Fracture Risk */}
          <View style={styles.calculatorSection}>
            <Text style={styles.calculatorTitle}>VTE & Fracture Risk Assessment</Text>
            <View style={styles.calculatorGrid}>
              <View style={styles.calculatorItem}>
                <Text style={styles.calculatorLabel}>Wells VTE Score</Text>
                <Text style={styles.calculatorValue}>{riskResults.wells.score}</Text>
                <Text style={[styles.calculatorCategory, getCategoryStyle(riskResults.wells.category)]}>
                  {riskResults.wells.category}
                </Text>
              </View>
              <View style={styles.calculatorItem}>
                <Text style={styles.calculatorLabel}>FRAX 10-Year Risk</Text>
                <Text style={styles.calculatorValue}>{riskResults.frax.majorFractureRisk.toFixed(1)}%</Text>
                <Text style={[styles.calculatorCategory, getCategoryStyle(riskResults.frax.category)]}>
                  {riskResults.frax.category}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contraindication Alerts */}
        {contraindications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="warning" size={24} color="#F44336" />
              <Text style={styles.sectionTitle}>Clinical Alerts</Text>
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
                  <Text style={styles.alertRecommendation}>{alert.recommendation}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Treatment Recommendations */}
        {medicationRecommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="medication" size={24} color="#2196F3" />
              <Text style={styles.sectionTitle}>Treatment Recommendations</Text>
            </View>
            {medicationRecommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="schedule" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>Timeline</Text>
          </View>
          <View style={styles.timelineItem}>
            <MaterialIcons name="add-circle" size={20} color="#4CAF50" />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Patient Created</Text>
              <Text style={styles.timelineDate}>{formatDate(patient.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.timelineItem}>
            <MaterialIcons name="edit" size={20} color="#FF9800" />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Last Updated</Text>
              <Text style={styles.timelineDate}>{formatDate(patient.updatedAt)}</Text>
            </View>
          </View>
          <View style={styles.timelineItem}>
            <MaterialIcons name="analytics" size={20} color="#4CAF50" />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Risk Assessment Calculated</Text>
              <Text style={styles.timelineDate}>{formatDate(riskResults.calculatedAt)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 20, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
  },
  backButtonText: {
    fontSize: 24,
    color: '#D81B60',
    fontWeight: 'bold',
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#D81B60',
  },
  placeholder: {
    width: 40,
  },
  content: { 
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoBadge: {
    fontSize: 12,
    color: '#D81B60',
    marginTop: 2,
    fontWeight: '500',
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
  },
  historyPositive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  historyText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  historyPositiveText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  symptomGrid: {
    gap: 12,
  },
  symptomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symptomName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  symptomScore: {
    alignItems: 'flex-end',
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreSeverity: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreNone: {
    color: '#4CAF50',
  },
  scoreMild: {
    color: '#FF9800',
  },
  scoreModerate: {
    color: '#FF5722',
  },
  scoreSevere: {
    color: '#F44336',
  },
  riskGrid: {
    gap: 8,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  riskPositive: {
    backgroundColor: '#ffebee',
    borderColor: '#FF5722',
    borderWidth: 1,
  },
  riskText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  riskPositiveText: {
    color: '#d84315',
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  timelineContent: {
    marginLeft: 12,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // New styles for risk calculators
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
  // Recommendation styles
  recommendationItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});