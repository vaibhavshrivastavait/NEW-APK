import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAssessmentStore } from '../store/assessmentStore';

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
  },
  risk: {
    low: '#4CAF50',
    moderate: '#FF9800',
    high: '#F44336'
  }
};

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'female' | 'male';
  patientId?: string;
  height: number;
  weight: number;
  bmi?: number;
  menopausalStatus: string;
  lastAssessment: string | Date;
  riskLevel: 'low' | 'moderate' | 'high';
  riskScore?: number;
  assessmentHistory: AssessmentHistoryItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AssessmentHistoryItem {
  id: string;
  date: string | Date;
  riskLevel: 'low' | 'moderate' | 'high';
  riskScore: number;
  // Enhanced assessment data
  symptoms: {
    hotFlushes: number;
    nightSweats: number;
    sleepDisturbance: number;
    vaginalDryness: number;
    moodChanges: number;
    jointAches: number;
  };
  riskAssessment?: {
    breastCancerRisk: 'low' | 'moderate' | 'high';
    cvdRisk: 'low' | 'moderate' | 'high';
    vteRisk: 'low' | 'moderate' | 'high' | 'very-high';
    osteoporosisRisk?: 'low' | 'moderate' | 'high';
    overallRisk: 'low' | 'moderate' | 'high';
  };
  mhtRecommendation?: {
    type: 'ET' | 'EPT' | 'vaginal-only' | 'not-recommended';
    route: 'oral' | 'transdermal' | 'vaginal' | 'none';
    progestogenType?: 'micronized' | 'ius' | 'synthetic';
    rationale: string[];
  };
  vitals?: {
    bloodPressure?: string;
    cholesterol?: string;
    bloodGlucose?: string;
  };
  notes?: string;
}

type RootStackParamList = {
  SavedPatientRecords: undefined;
  SavedPatientDetails: { patient: PatientRecord };
  PatientIntake: { editPatient?: PatientRecord };
};

type SavedPatientDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'SavedPatientDetails'>;

export default function SavedPatientDetailsScreen({ navigation, route }: SavedPatientDetailsScreenProps) {
  const { patient } = route.params;
  const store = useAssessmentStore();
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const getRiskBadgeStyle = (riskLevel: 'low' | 'moderate' | 'high') => {
    return {
      backgroundColor: PINK_COLORS.risk[riskLevel],
      color: 'white',
    };
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={PINK_COLORS.primaryLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={PINK_COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Patient Details</Text>
          <Text style={styles.headerSubtitle}>{patient.name}</Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Header */}
        <View style={styles.patientHeader}>
          <View style={styles.patientAvatar}>
            <MaterialIcons name="person" size={isTablet ? 64 : 48} color={PINK_COLORS.primary} />
          </View>
          <View style={styles.patientHeaderInfo}>
            <Text style={[styles.patientName, { fontSize: isTablet ? 28 : 24 }]}>{patient.name}</Text>
            <Text style={[styles.patientSubInfo, { fontSize: isTablet ? 18 : 16 }]}>
              {patient.age} years • {patient.gender === 'female' ? 'Female' : 'Male'}
            </Text>
            <Text style={[styles.patientId, { fontSize: isTablet ? 14 : 12 }]}>
              Patient ID: {patient.patientId || patient.id.slice(0, 8)}
            </Text>
          </View>
          <View style={[styles.riskBadge, getRiskBadgeStyle(patient.riskLevel)]}>
            <Text style={styles.riskText}>
              {patient.riskLevel.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Demographics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demographics</Text>
          <View style={styles.demographicsGrid}>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Height</Text>
              <Text style={styles.demographicValue}>{patient.height} cm</Text>
            </View>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Weight</Text>
              <Text style={styles.demographicValue}>{patient.weight} kg</Text>
            </View>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>BMI</Text>
              <Text style={styles.demographicValue}>
                {patient.bmi ? patient.bmi.toFixed(1) : 'N/A'}
              </Text>
            </View>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Status</Text>
              <Text style={styles.demographicValue}>{patient.menopausalStatus}</Text>
            </View>
          </View>
        </View>

        {/* Risk Assessment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Risk Assessment</Text>
          <View style={styles.riskSummaryContainer}>
            <View style={styles.riskScoreContainer}>
              <Text style={styles.riskScoreNumber}>
                {patient.riskScore?.toFixed(0) || '0'}%
              </Text>
              <Text style={styles.riskScoreLabel}>Overall Risk</Text>
            </View>
            <View style={styles.riskDetails}>
              <View style={[styles.riskLevelIndicator, getRiskBadgeStyle(patient.riskLevel)]}>
                <Text style={styles.riskLevelText}>{patient.riskLevel.toUpperCase()}</Text>
              </View>
              <Text style={styles.riskDescription}>
                {patient.riskLevel === 'high' 
                  ? 'High risk factors present. Requires careful monitoring and specialist consultation.'
                  : patient.riskLevel === 'moderate'
                  ? 'Moderate risk. Regular monitoring recommended with potential MHT benefits.'
                  : 'Low risk profile. MHT generally safe with appropriate monitoring.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Assessment History Timeline - Enhanced with comprehensive details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment History</Text>
          <View style={styles.timeline}>
            {patient.assessmentHistory.length > 0 ? (
              patient.assessmentHistory.map((assessment, index) => (
                <View key={assessment.id} style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, getRiskBadgeStyle(assessment.riskLevel)]}>
                    <MaterialIcons name="assessment" size={16} color="white" />
                  </View>
                  {index < patient.assessmentHistory.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDate}>{formatDate(assessment.date)}</Text>
                    <Text style={styles.timelineRisk}>
                      Risk Level: {assessment.riskLevel.toUpperCase()} ({assessment.riskScore.toFixed(0)}%)
                    </Text>
                    
                    {/* Vital Signs / Anthropometry */}
                    <View style={styles.assessmentSection}>
                      <Text style={styles.assessmentSectionTitle}>Vital Signs & Anthropometry</Text>
                      <View style={styles.assessmentGrid}>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>BMI</Text>
                          <Text style={styles.assessmentValue}>
                            {patient.bmi ? patient.bmi.toFixed(1) : 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>Height</Text>
                          <Text style={styles.assessmentValue}>{patient.height} cm</Text>
                        </View>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>Weight</Text>
                          <Text style={styles.assessmentValue}>{patient.weight} kg</Text>
                        </View>
                        {assessment.vitals?.bloodPressure && (
                          <View style={styles.assessmentItem}>
                            <Text style={styles.assessmentLabel}>BP</Text>
                            <Text style={styles.assessmentValue}>{assessment.vitals.bloodPressure}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* MHT Symptoms Assessment */}
                    <View style={styles.assessmentSection}>
                      <Text style={styles.assessmentSectionTitle}>MHT Symptoms (VAS 0-10)</Text>
                      <View style={styles.assessmentGrid}>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>Hot Flushes</Text>
                          <Text style={styles.assessmentValue}>{assessment.symptoms.hotFlushes}/10</Text>
                        </View>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>Night Sweats</Text>
                          <Text style={styles.assessmentValue}>{assessment.symptoms.nightSweats}/10</Text>
                        </View>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>Sleep Issues</Text>
                          <Text style={styles.assessmentValue}>{assessment.symptoms.sleepDisturbance}/10</Text>
                        </View>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>Vaginal Dryness</Text>
                          <Text style={styles.assessmentValue}>{assessment.symptoms.vaginalDryness}/10</Text>
                        </View>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>Mood Changes</Text>
                          <Text style={styles.assessmentValue}>{assessment.symptoms.moodChanges}/10</Text>
                        </View>
                        <View style={styles.assessmentItem}>
                          <Text style={styles.assessmentLabel}>Joint Aches</Text>
                          <Text style={styles.assessmentValue}>{assessment.symptoms.jointAches}/10</Text>
                        </View>
                      </View>
                    </View>

                    {/* Risk Assessment Details */}
                    {assessment.riskAssessment && (
                      <View style={styles.assessmentSection}>
                        <Text style={styles.assessmentSectionTitle}>Risk Assessment</Text>
                        <View style={styles.riskGrid}>
                          <View style={styles.riskItem}>
                            <Text style={styles.riskLabel}>Breast Cancer Risk</Text>
                            <View style={[styles.riskBadgeSmall, { backgroundColor: PINK_COLORS.risk[assessment.riskAssessment.breastCancerRisk] }]}>
                              <Text style={styles.riskBadgeText}>{assessment.riskAssessment.breastCancerRisk.toUpperCase()}</Text>
                            </View>
                          </View>
                          <View style={styles.riskItem}>
                            <Text style={styles.riskLabel}>Cardiovascular Risk</Text>
                            <View style={[styles.riskBadgeSmall, { backgroundColor: PINK_COLORS.risk[assessment.riskAssessment.cvdRisk] }]}>
                              <Text style={styles.riskBadgeText}>{assessment.riskAssessment.cvdRisk.toUpperCase()}</Text>
                            </View>
                          </View>
                          <View style={styles.riskItem}>
                            <Text style={styles.riskLabel}>VTE Risk</Text>
                            <View style={[styles.riskBadgeSmall, { backgroundColor: PINK_COLORS.risk[assessment.riskAssessment.vteRisk === 'very-high' ? 'high' : assessment.riskAssessment.vteRisk] }]}>
                              <Text style={styles.riskBadgeText}>{assessment.riskAssessment.vteRisk.toUpperCase()}</Text>
                            </View>
                          </View>
                          {assessment.riskAssessment.osteoporosisRisk && (
                            <View style={styles.riskItem}>
                              <Text style={styles.riskLabel}>Osteoporosis Risk</Text>
                              <View style={[styles.riskBadgeSmall, { backgroundColor: PINK_COLORS.risk[assessment.riskAssessment.osteoporosisRisk] }]}>
                                <Text style={styles.riskBadgeText}>{assessment.riskAssessment.osteoporosisRisk.toUpperCase()}</Text>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* MHT Recommendation */}
                    {assessment.mhtRecommendation && (
                      <View style={styles.assessmentSection}>
                        <Text style={styles.assessmentSectionTitle}>MHT Recommendation</Text>
                        <View style={styles.recommendationContainer}>
                          <View style={styles.recommendationHeader}>
                            <Text style={styles.recommendationType}>{assessment.mhtRecommendation.type}</Text>
                            <Text style={styles.recommendationRoute}>{assessment.mhtRecommendation.route}</Text>
                          </View>
                          {assessment.mhtRecommendation.progestogenType && (
                            <Text style={styles.recommendationDetail}>
                              Progestogen: {assessment.mhtRecommendation.progestogenType}
                            </Text>
                          )}
                          {assessment.mhtRecommendation.rationale.length > 0 && (
                            <View style={styles.rationaleContainer}>
                              <Text style={styles.rationaleTitle}>Rationale:</Text>
                              {assessment.mhtRecommendation.rationale.map((reason, idx) => (
                                <Text key={idx} style={styles.rationaleItem}>• {reason}</Text>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {assessment.notes && (
                      <Text style={styles.timelineNotes}>{assessment.notes}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noHistory}>
                <MaterialIcons name="history" size={48} color={PINK_COLORS.text.light} />
                <Text style={styles.noHistoryText}>No assessment history available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => navigation.navigate('PatientIntake', { editPatient: patient })}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text style={styles.actionButtonText}>Reassess Patient</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryActionButton]}
            onPress={() => handleExportPatient('pdf')}
          >
            <MaterialIcons name="download" size={20} color={PINK_COLORS.primary} />
            <Text style={[styles.actionButtonText, { color: PINK_COLORS.primary }]}>Export Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerActionButton]}
            onPress={handleDeletePatient}
          >
            <MaterialIcons name="delete" size={20} color="white" />
            <Text style={styles.actionButtonText}>Delete Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PINK_COLORS.background.main,
  },
  
  // Header Styles
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PINK_COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: PINK_COLORS.text.muted,
    marginTop: 2,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },

  // Content Styles
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: PINK_COLORS.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PINK_COLORS.primary,
    marginBottom: 16,
  },

  // Patient Header Styles
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK_COLORS.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.1)',
  },
  patientAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PINK_COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 3,
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
  patientId: {
    color: PINK_COLORS.text.light,
    fontFamily: 'monospace',
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Demographics Styles
  demographicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  demographicItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: PINK_COLORS.background.section,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PINK_COLORS.primaryLight,
  },
  demographicLabel: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demographicValue: {
    fontSize: 16,
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
  },

  // Risk Summary Styles
  riskSummaryContainer: {
    flexDirection: 'row',
    backgroundColor: PINK_COLORS.background.section,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PINK_COLORS.primaryLight,
  },
  riskScoreContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  riskScoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: PINK_COLORS.primary,
  },
  riskScoreLabel: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    marginTop: 4,
  },
  riskDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  riskLevelIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  riskDescription: {
    fontSize: 14,
    color: PINK_COLORS.text.dark,
    lineHeight: 20,
  },

  // Timeline Styles
  timeline: {
    paddingTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    flex: 1,
    paddingTop: 4,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
    marginBottom: 4,
  },
  timelineRisk: {
    fontSize: 12,
    color: PINK_COLORS.text.muted,
    marginBottom: 4,
  },
  timelineNotes: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    fontStyle: 'italic',
  },
  noHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noHistoryText: {
    fontSize: 16,
    color: PINK_COLORS.text.light,
    marginTop: 12,
    textAlign: 'center',
  },

  // Action Buttons Styles
  actionsSection: {
    gap: 12,
    paddingTop: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionButton: {
    backgroundColor: PINK_COLORS.primary,
  },
  secondaryActionButton: {
    backgroundColor: PINK_COLORS.background.card,
    borderWidth: 1,
    borderColor: PINK_COLORS.primary,
  },
  dangerActionButton: {
    backgroundColor: PINK_COLORS.status.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});