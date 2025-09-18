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
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

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

  const getBMICategoryColor = (bmi?: number) => {
    if (!bmi) return PINK_COLORS.text.light;
    if (bmi < 18.5) return PINK_COLORS.status.warning;
    if (bmi < 25) return PINK_COLORS.status.success;
    if (bmi < 30) return PINK_COLORS.status.warning;
    return PINK_COLORS.status.error;
  };

  const getSymptomSeverity = (score: number) => {
    if (score === 0) return 'None';
    if (score <= 2) return 'Mild';
    if (score <= 4) return 'Moderate';
    return 'Severe';
  };

  const getSymptomColor = (score: number) => {
    if (score === 0) return PINK_COLORS.status.success;
    if (score <= 2) return PINK_COLORS.status.info;
    if (score <= 4) return PINK_COLORS.status.warning;
    return PINK_COLORS.status.error;
  };

  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'low':
        return { backgroundColor: '#e8f5e8', color: '#2e7d32' };
      case 'moderate':
      case 'intermediate':
      case 'borderline':
        return { backgroundColor: '#fff3e0', color: '#f57c00' };
      case 'high':
        return { backgroundColor: '#ffebee', color: '#d32f2f' };
      default:
        return { backgroundColor: '#fff3e0', color: '#f57c00' };
    }
  };

  const renderPatientHeader = () => (
    <View style={styles.patientHeader}>
      <View style={styles.avatarContainer}>
        <MaterialIcons name="person" size={isTablet ? 64 : 48} color={PINK_COLORS.primary} />
      </View>
      <View style={styles.patientHeaderInfo}>
        <Text style={[styles.patientName, { fontSize: isTablet ? 28 : 24 }]}>{patient.name}</Text>
        <Text style={[styles.patientSubInfo, { fontSize: isTablet ? 18 : 16 }]}>
          {patient.age} years • {patient.menopausalStatus.charAt(0).toUpperCase() + patient.menopausalStatus.slice(1)}
        </Text>
        <Text style={[styles.patientDate, { fontSize: isTablet ? 14 : 12 }]}>
          Last updated: {formatDate(patient.updatedAt)}
        </Text>
      </View>
    </View>
  );

  const renderSymptomChart = () => (
    <View style={styles.chartContainer}>
      <Text style={[styles.chartTitle, { fontSize: isTablet ? 18 : 16 }]}>Symptom Severity Overview</Text>
      <View style={styles.chartGrid}>
        {[
          { name: 'Hot Flushes', score: patient.hotFlushes, icon: 'local-fire-department' },
          { name: 'Night Sweats', score: patient.nightSweats, icon: 'nights-stay' },
          { name: 'Sleep Issues', score: patient.sleepDisturbance, icon: 'bedtime' },
          { name: 'Vaginal Dryness', score: patient.vaginalDryness, icon: 'water-drop' },
          { name: 'Mood Changes', score: patient.moodChanges, icon: 'mood' },
          { name: 'Joint Aches', score: patient.jointAches, icon: 'accessibility' },
        ].map((symptom) => (
          <View key={symptom.name} style={styles.chartBar}>
            <View style={styles.chartBarHeader}>
              <MaterialIcons name={symptom.icon as any} size={16} color={PINK_COLORS.text.muted} />
              <Text style={styles.chartBarLabel}>{symptom.name}</Text>
            </View>
            <View style={styles.chartBarContainer}>
              <View 
                style={[
                  styles.chartBarFill, 
                  { 
                    width: `${(symptom.score / 6) * 100}%`,
                    backgroundColor: getSymptomColor(symptom.score)
                  }
                ]} 
              />
            </View>
            <Text style={[styles.chartBarValue, { color: getSymptomColor(symptom.score) }]}>
              {symptom.score}/6
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={PINK_COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <MaterialIcons name="share" size={20} color={PINK_COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Header Card */}
        <View style={styles.section}>
          {renderPatientHeader()}
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{patient.bmi ? patient.bmi.toFixed(1) : 'N/A'}</Text>
            <Text style={styles.quickStatLabel}>BMI</Text>
            <Text style={[styles.quickStatCategory, { color: getBMICategoryColor(patient.bmi) }]}>
              {getBMICategory(patient.bmi)}
            </Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{patient.height}</Text>
            <Text style={styles.quickStatLabel}>Height (cm)</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{patient.weight}</Text>
            <Text style={styles.quickStatLabel}>Weight (kg)</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {contraindications.filter(c => c.type === 'absolute').length}
            </Text>
            <Text style={styles.quickStatLabel}>Alerts</Text>
            <Text style={[styles.quickStatCategory, { color: contraindications.length > 0 ? PINK_COLORS.status.error : PINK_COLORS.status.success }]}>
              {contraindications.length > 0 ? 'Review' : 'Clear'}
            </Text>
          </View>
        </View>

        {/* Symptom Chart */}
        <View style={styles.section}>
          {renderSymptomChart()}
        </View>

        {/* Medical History & Risk Factors Combined */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="medical-services" size={24} color={PINK_COLORS.primary} />
            <Text style={styles.sectionTitle}>Medical History & Risk Factors</Text>
          </View>
          
          {/* Surgical History */}
          <View style={styles.subsectionContainer}>
            <Text style={styles.subsectionTitle}>Surgical History</Text>
            <View style={styles.historyRow}>
              <View style={[styles.historyChip, patient.hysterectomy && styles.historyPositive]}>
                <MaterialIcons 
                  name={patient.hysterectomy ? "check-circle" : "cancel"} 
                  size={16} 
                  color={patient.hysterectomy ? PINK_COLORS.status.success : PINK_COLORS.text.light} 
                />
                <Text style={[styles.historyText, patient.hysterectomy && styles.historyPositiveText]}>
                  Hysterectomy
                </Text>
              </View>
              <View style={[styles.historyChip, patient.oophorectomy && styles.historyPositive]}>
                <MaterialIcons 
                  name={patient.oophorectomy ? "check-circle" : "cancel"} 
                  size={16} 
                  color={patient.oophorectomy ? PINK_COLORS.status.success : PINK_COLORS.text.light} 
                />
                <Text style={[styles.historyText, patient.oophorectomy && styles.historyPositiveText]}>
                  Oophorectomy
                </Text>
              </View>
            </View>
          </View>

          {/* Risk Factors Grid */}
          <View style={styles.subsectionContainer}>
            <Text style={styles.subsectionTitle}>Risk Assessment</Text>
            <View style={styles.riskFactorGrid}>
              {[
                { name: 'Family Breast Ca', value: patient.familyHistoryBreastCancer, category: 'family' },
                { name: 'Family Ovarian Ca', value: patient.familyHistoryOvarian, category: 'family' },
                { name: 'Personal Breast Ca', value: patient.personalHistoryBreastCancer, category: 'personal' },
                { name: 'DVT/PE History', value: patient.personalHistoryDVT, category: 'personal' },
                { name: 'Thrombophilia', value: patient.thrombophilia, category: 'genetic' },
                { name: 'Smoking', value: patient.smoking, category: 'lifestyle' },
                { name: 'Diabetes', value: patient.diabetes, category: 'medical' },
                { name: 'Hypertension', value: patient.hypertension, category: 'medical' },
                { name: 'High Cholesterol', value: patient.cholesterolHigh, category: 'medical' },
              ].map((risk) => (
                <View key={risk.name} style={[styles.riskChip, risk.value && styles.riskActive]}>
                  <MaterialIcons 
                    name={risk.value ? "warning" : "check-circle"} 
                    size={14} 
                    color={risk.value ? PINK_COLORS.status.error : PINK_COLORS.status.success} 
                  />
                  <Text style={[styles.riskText, risk.value && styles.riskActiveText]}>
                    {risk.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Enhanced Risk Calculator Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="analytics" size={24} color={PINK_COLORS.primary} />
            <Text style={styles.sectionTitle}>Clinical Risk Assessment</Text>
          </View>
          
          {/* Risk Summary Cards */}
          <View style={styles.riskSummaryGrid}>
            <View style={styles.riskSummaryCard}>
              <View style={[styles.riskIcon, { backgroundColor: '#E8F5E8' }]}>
                <MaterialIcons name="favorite" size={20} color={PINK_COLORS.status.error} />
              </View>
              <Text style={styles.riskCardTitle}>Cardiovascular</Text>
              <Text style={styles.riskCardValue}>{riskResults.ascvd.risk.toFixed(1)}%</Text>
              <Text style={[styles.riskCardCategory, getCategoryStyle(riskResults.ascvd.category)]}>
                {riskResults.ascvd.category}
              </Text>
            </View>

            <View style={styles.riskSummaryCard}>
              <View style={[styles.riskIcon, { backgroundColor: '#FCE4EC' }]}>
                <MaterialIcons name="healing" size={20} color={PINK_COLORS.primary} />
              </View>
              <Text style={styles.riskCardTitle}>Breast Cancer</Text>
              <Text style={styles.riskCardValue}>{riskResults.gail.risk.toFixed(1)}%</Text>
              <Text style={[styles.riskCardCategory, getCategoryStyle(riskResults.gail.category)]}>
                {riskResults.gail.category}
              </Text>
            </View>

            <View style={styles.riskSummaryCard}>
              <View style={[styles.riskIcon, { backgroundColor: '#E3F2FD' }]}>
                <MaterialIcons name="air" size={20} color={PINK_COLORS.status.info} />
              </View>
              <Text style={styles.riskCardTitle}>VTE Risk</Text>
              <Text style={styles.riskCardValue}>{riskResults.wells.score}</Text>
              <Text style={[styles.riskCardCategory, getCategoryStyle(riskResults.wells.category)]}>
                {riskResults.wells.category}
              </Text>
            </View>

            <View style={styles.riskSummaryCard}>
              <View style={[styles.riskIcon, { backgroundColor: '#FFF3E0' }]}>
                <MaterialIcons name="accessibility" size={20} color={PINK_COLORS.status.warning} />
              </View>
              <Text style={styles.riskCardTitle}>Fracture</Text>
              <Text style={styles.riskCardValue}>{riskResults.frax.majorFractureRisk.toFixed(1)}%</Text>
              <Text style={[styles.riskCardCategory, getCategoryStyle(riskResults.frax.category)]}>
                {riskResults.frax.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Clinical Alerts - Enhanced */}
        {contraindications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="warning" size={24} color={PINK_COLORS.status.error} />
              <Text style={styles.sectionTitle}>Clinical Alerts</Text>
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{contraindications.length}</Text>
              </View>
            </View>
            {contraindications.map((alert, index) => (
              <View 
                key={index} 
                style={[
                  styles.alertCard, 
                  alert.type === 'absolute' ? styles.alertAbsolute : styles.alertRelative
                ]}
              >
                <View style={styles.alertIconContainer}>
                  <MaterialIcons 
                    name={alert.type === 'absolute' ? 'block' : 'warning'} 
                    size={24} 
                    color={alert.type === 'absolute' ? PINK_COLORS.status.error : PINK_COLORS.status.warning} 
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>
                    {alert.type === 'absolute' ? 'CONTRAINDICATION' : 'CAUTION'}
                  </Text>
                  <Text style={styles.alertCondition}>{alert.condition}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertRecommendation}>{alert.recommendation}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Treatment Recommendations - Enhanced */}
        {medicationRecommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="medication" size={24} color={PINK_COLORS.status.info} />
              <Text style={styles.sectionTitle}>Treatment Recommendations</Text>
            </View>
            {medicationRecommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationIcon}>
                  <MaterialIcons name="check-circle" size={16} color={PINK_COLORS.status.success} />
                </View>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Timeline - Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="schedule" size={24} color={PINK_COLORS.primary} />
            <Text style={styles.sectionTitle}>Patient Timeline</Text>
          </View>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, { backgroundColor: PINK_COLORS.status.success }]}>
                <MaterialIcons name="add-circle" size={16} color="white" />
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Patient Created</Text>
                <Text style={styles.timelineDate}>{formatDate(patient.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, { backgroundColor: PINK_COLORS.status.warning }]}>
                <MaterialIcons name="edit" size={16} color="white" />
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Last Updated</Text>
                <Text style={styles.timelineDate}>{formatDate(patient.updatedAt)}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, { backgroundColor: PINK_COLORS.primary }]}>
                <MaterialIcons name="analytics" size={16} color="white" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Risk Assessment</Text>
                <Text style={styles.timelineDate}>{formatDate(riskResults.calculatedAt)}</Text>
              </View>
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
    backgroundColor: PINK_COLORS.background.main 
  },
  
  // Enhanced Header Styles
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 16,
    backgroundColor: PINK_COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: PINK_COLORS.primaryLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: PINK_COLORS.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Content Styles
  content: { 
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: PINK_COLORS.background.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PINK_COLORS.text.dark,
    marginLeft: 12,
    flex: 1,
  },

  // Patient Header Styles
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PINK_COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: PINK_COLORS.primaryLight,
  },
  patientHeaderInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    color: PINK_COLORS.text.dark,
    marginBottom: 4,
  },
  patientSubInfo: {
    color: PINK_COLORS.text.muted,
    marginBottom: 2,
  },
  patientDate: {
    color: PINK_COLORS.text.light,
    fontStyle: 'italic',
  },

  // Quick Stats Styles
  quickStatsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 8,
  },
  quickStatItem: {
    flex: 1,
    backgroundColor: PINK_COLORS.background.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PINK_COLORS.primaryLight,
    elevation: 1,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PINK_COLORS.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    textAlign: 'center',
    marginBottom: 2,
  },
  quickStatCategory: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Chart Styles
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
    marginBottom: 16,
  },
  chartGrid: {
    gap: 12,
  },
  chartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chartBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
  },
  chartBarLabel: {
    fontSize: 14,
    color: PINK_COLORS.text.dark,
    marginLeft: 8,
    flex: 1,
  },
  chartBarContainer: {
    flex: 2,
    height: 8,
    backgroundColor: PINK_COLORS.background.accent,
    borderRadius: 4,
    marginHorizontal: 12,
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartBarValue: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },

  // Medical History Styles
  subsectionContainer: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PINK_COLORS.primary,
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK_COLORS.background.section,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PINK_COLORS.primaryLight,
  },
  historyPositive: {
    backgroundColor: '#E8F5E8',
    borderColor: PINK_COLORS.status.success,
  },
  historyText: {
    fontSize: 14,
    color: PINK_COLORS.text.light,
    marginLeft: 6,
  },
  historyPositiveText: {
    color: PINK_COLORS.status.success,
    fontWeight: '500',
  },

  // Risk Factor Styles
  riskFactorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  riskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK_COLORS.background.section,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  riskActive: {
    backgroundColor: '#FFEBEE',
    borderColor: PINK_COLORS.status.error,
  },
  riskText: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    marginLeft: 4,
  },
  riskActiveText: {
    color: PINK_COLORS.status.error,
    fontWeight: '500',
  },

  // Risk Summary Styles
  riskSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  riskSummaryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: PINK_COLORS.background.section,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PINK_COLORS.primaryLight,
  },
  riskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskCardTitle: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    textAlign: 'center',
    marginBottom: 4,
  },
  riskCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PINK_COLORS.text.dark,
    marginBottom: 4,
  },
  riskCardCategory: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  // Alert Styles
  alertBadge: {
    backgroundColor: PINK_COLORS.status.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  alertBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertAbsolute: {
    backgroundColor: '#FFEBEE',
    borderColor: PINK_COLORS.status.error,
  },
  alertRelative: {
    backgroundColor: '#FFF8E1',
    borderColor: PINK_COLORS.status.warning,
  },
  alertIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PINK_COLORS.status.error,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  alertCondition: {
    fontSize: 14,
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: PINK_COLORS.text.light,
    marginBottom: 6,
    lineHeight: 18,
  },
  alertRecommendation: {
    fontSize: 13,
    fontWeight: '500',
    color: PINK_COLORS.text.dark,
    lineHeight: 18,
  },

  // Recommendation Styles
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PINK_COLORS.background.section,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: PINK_COLORS.status.info,
  },
  recommendationIcon: {
    marginRight: 8,
    paddingTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: PINK_COLORS.text.dark,
    lineHeight: 20,
    flex: 1,
  },

  // Timeline Styles
  timeline: {
    paddingTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    bottom: -16,
    width: 2,
    backgroundColor: PINK_COLORS.primaryLight,
  },
  timelineContent: {
    marginLeft: 16,
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
  },
});