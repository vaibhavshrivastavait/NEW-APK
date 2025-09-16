import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';

import TreatmentPlanRuleEngine, { PatientData, TreatmentPlan, TreatmentRecommendation } from '../utils/treatmentPlanRuleEngine';
import { exportTreatmentPlanToPDF } from '../utils/treatmentPlanPDFExport';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  GeneralSpecificTreatmentPlan: {
    patientData: PatientData;
  };
};

type GeneralSpecificTreatmentPlanScreenRouteProp = RouteProp<RootStackParamList, 'GeneralSpecificTreatmentPlan'>;
type GeneralSpecificTreatmentPlanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: GeneralSpecificTreatmentPlanScreenNavigationProp;
}

const DISCLAIMER_TEXT = `**Disclaimer:** This treatment plan is an educational aid generated from the provided information. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Recommendations are advisory only — always consult a qualified healthcare provider before acting on these suggestions. The app does not prescribe medications or dosages. If you are experiencing an emergency, seek immediate medical attention.`;

export default function GeneralSpecificTreatmentPlanScreen({ navigation }: Props) {
  const route = useRoute<GeneralSpecificTreatmentPlanScreenRouteProp>();
  const { patientData } = route.params;

  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());
  const [showingRationale, setShowingRationale] = useState<Set<string>>(new Set());

  const ruleEngine = new TreatmentPlanRuleEngine();

  useEffect(() => {
    generateTreatmentPlan();
  }, []);

  const generateTreatmentPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Generating treatment plan with patient data:', patientData);
      
      const plan = ruleEngine.generateTreatmentPlan(patientData);
      setTreatmentPlan(plan);

    } catch (err: any) {
      console.error('❌ Error generating treatment plan:', err);
      setError(err.message || 'Failed to generate treatment plan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!treatmentPlan) return;

    try {
      await exportTreatmentPlanToPDF(treatmentPlan);
      Alert.alert('Success', 'Treatment plan exported to PDF successfully');
    } catch (error) {
      console.error('❌ PDF export error:', error);
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    }
  };

  const handleDiscussWithClinician = () => {
    Alert.alert(
      'Discuss with Clinician',
      'Please schedule an appointment with your healthcare provider to discuss these recommendations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Clinic', onPress: () => console.log('Call clinic feature') },
        { text: 'Schedule Online', onPress: () => console.log('Online scheduling feature') },
      ]
    );
  };

  const toggleRecommendationExpansion = (recommendationId: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(recommendationId)) {
      newExpanded.delete(recommendationId);
    } else {
      newExpanded.add(recommendationId);
    }
    setExpandedRecommendations(newExpanded);
  };

  const toggleRationale = (recommendationId: string) => {
    const newShowing = new Set(showingRationale);
    if (newShowing.has(recommendationId)) {
      newShowing.delete(recommendationId);
    } else {
      newShowing.add(recommendationId);
    }
    setShowingRationale(newShowing);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#FF4444';
      case 'medium': return '#FF8800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF8800';
    return '#FF4444';
  };

  const renderDisclaimer = () => (
    <View style={styles.disclaimerContainer}>
      <MaterialIcons name="warning" size={24} color="#FF8800" />
      <View style={styles.disclaimerTextContainer}>
        <Text style={styles.disclaimerTitle}>Important Notice</Text>
        <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
      </View>
    </View>
  );

  const renderRecommendation = (recommendation: TreatmentRecommendation, index: number) => {
    const isExpanded = expandedRecommendations.has(recommendation.id);
    const showRationale = showingRationale.has(recommendation.id);

    return (
      <View key={recommendation.id} style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <View style={styles.recommendationNumber}>
            <Text style={styles.recommendationNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationText}>{recommendation.recommendation}</Text>
            <View style={styles.recommendationMeta}>
              <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(recommendation.urgency) }]}>
                <Text style={styles.urgencyText}>{recommendation.urgency.toUpperCase()}</Text>
              </View>
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(recommendation.confidence) }]}>
                <Text style={styles.confidenceText}>{recommendation.confidence}%</Text>
              </View>
              <Text style={styles.categoryText}>{recommendation.category}</Text>
            </View>
          </View>
        </View>

        <View style={styles.recommendationActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleRationale(recommendation.id)}
          >
            <MaterialIcons name="help-outline" size={16} color="#007AFF" />
            <Text style={styles.actionButtonText}>Why this recommendation?</Text>
          </TouchableOpacity>
          
          {recommendation.alternatives && recommendation.alternatives.length > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleRecommendationExpansion(recommendation.id)}
            >
              <MaterialIcons name="expand-more" size={16} color="#007AFF" />
              <Text style={styles.actionButtonText}>Alternatives</Text>
            </TouchableOpacity>
          )}
        </View>

        {showRationale && (
          <View style={styles.rationaleContainer}>
            <Text style={styles.rationaleTitle}>Rationale:</Text>
            <Text style={styles.rationaleText}>{recommendation.rationale}</Text>
            {recommendation.references && recommendation.references.length > 0 && (
              <View style={styles.referencesContainer}>
                <Text style={styles.referencesTitle}>References:</Text>
                {recommendation.references.map((ref, idx) => (
                  <Text key={idx} style={styles.referenceText}>• {ref}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {isExpanded && recommendation.alternatives && (
          <View style={styles.alternativesContainer}>
            <Text style={styles.alternativesTitle}>Alternative Options:</Text>
            {recommendation.alternatives.map((alt, idx) => (
              <Text key={idx} style={styles.alternativeText}>• {alt}</Text>
            ))}
          </View>
        )}

        {recommendation.confidence < 50 && (
          <View style={styles.hypothesisWarning}>
            <MaterialIcons name="science" size={16} color="#FF8800" />
            <Text style={styles.hypothesisText}>Hypothesis — confirm with clinician</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Generating treatment plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF4444" />
          <Text style={styles.errorTitle}>Unable to Generate Plan</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateTreatmentPlan}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!treatmentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No Treatment Plan Generated</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Disclaimer Banner */}
        {renderDisclaimer()}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Treatment Plan</Text>
          <Text style={styles.planInfo}>Plan ID: {treatmentPlan.planId.substring(0, 8)}...</Text>
          <Text style={styles.planInfo}>Generated: {new Date(treatmentPlan.generatedAt).toLocaleDateString()}</Text>
        </View>

        {/* Urgent Flags */}
        {treatmentPlan.urgentFlags.length > 0 && (
          <View style={styles.urgentSection}>
            <View style={styles.urgentHeader}>
              <MaterialIcons name="warning" size={24} color="#FF4444" />
              <Text style={styles.urgentTitle}>Urgent Attention Required</Text>
            </View>
            {treatmentPlan.urgentFlags.map((flag, index) => (
              <Text key={index} style={styles.urgentFlag}>🔴 {flag}</Text>
            ))}
          </View>
        )}

        {/* Primary Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Recommendations</Text>
          {treatmentPlan.primaryRecommendations.map((rec, index) => 
            renderRecommendation(rec, index)
          )}
        </View>

        {/* Alternative Therapies */}
        {treatmentPlan.alternativeTherapies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alternative Therapies</Text>
            {treatmentPlan.alternativeTherapies.map((therapy, index) => (
              <Text key={index} style={styles.alternativeTherapy}>• {therapy}</Text>
            ))}
          </View>
        )}

        {/* Clinical Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Summary</Text>
          <Text style={styles.clinicalSummary}>{treatmentPlan.clinicalSummary}</Text>
        </View>

        {/* Action Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          {treatmentPlan.actionItems.map((item, index) => (
            <Text key={index} style={styles.actionItem}>{item}</Text>
          ))}
        </View>

        {/* Audit Trail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment Details</Text>
          <Text style={styles.auditText}>
            Overall Confidence: {treatmentPlan.auditTrail.overallConfidence}%
          </Text>
          <Text style={styles.auditText}>
            Rules Applied: {treatmentPlan.auditTrail.firedRules.length}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.clinicianButton}
            onPress={handleDiscussWithClinician}
          >
            <MaterialIcons name="local-hospital" size={24} color="#FFF" />
            <Text style={styles.clinicianButtonText}>Discuss with Clinician</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportPDF}
          >
            <MaterialIcons name="picture-as-pdf" size={24} color="#007AFF" />
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8800',
    flexDirection: 'row',
  },
  disclaimerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  planInfo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  urgentSection: {
    backgroundColor: '#FFEBEE',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4444',
    marginLeft: 8,
  },
  urgentFlag: {
    fontSize: 16,
    color: '#C62828',
    marginBottom: 8,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationNumber: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationNumberText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 12,
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  urgencyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  confidenceText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  recommendationActions: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  rationaleContainer: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  rationaleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  rationaleText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  referencesContainer: {
    marginTop: 8,
  },
  referencesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 2,
  },
  alternativesContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF8800',
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 4,
  },
  hypothesisWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  hypothesisText: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  alternativeTherapy: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 24,
  },
  clinicalSummary: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
  },
  actionItem: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 24,
  },
  auditText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  clinicianButton: {
    flex: 1,
    backgroundColor: '#FF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  clinicianButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginLeft: 8,
  },
  exportButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});