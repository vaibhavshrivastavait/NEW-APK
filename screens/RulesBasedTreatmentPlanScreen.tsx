import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { evaluate, createAssessmentInput, getSuitabilityColor, type TreatmentResult, type AssessmentInput } from '../utils/rulesEngine';

interface RouteParams {
  assessmentData?: any;
  patientData?: any;
}

const RulesBasedTreatmentPlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessmentData, patientData } = (route.params as RouteParams) || {};
  
  const [treatmentResult, setTreatmentResult] = useState<TreatmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentInput, setAssessmentInput] = useState<AssessmentInput | null>(null);
  const [showRationale, setShowRationale] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);

  useEffect(() => {
    if (assessmentData) {
      generateTreatmentPlan();
    }
  }, [assessmentData]);

  const generateTreatmentPlan = async () => {
    if (!assessmentData) {
      Alert.alert('Error', 'No assessment data available');
      return;
    }

    setIsLoading(true);
    try {
      // Create input object for rules engine
      const input = createAssessmentInput(assessmentData);
      setAssessmentInput(input);
      
      // Evaluate using rules engine
      const result = evaluate(input);
      setTreatmentResult(result);
      
      // Show warnings if present
      if (result.warnings && result.warnings.length > 0) {
        setShowWarnings(true);
      }
    } catch (error) {
      console.error('Error generating treatment plan:', error);
      Alert.alert('Error', 'Failed to generate treatment plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSuitabilityIcon = (suitability: TreatmentResult['suitability']) => {
    switch (suitability) {
      case 'Contraindicated':
        return 'close-circle';
      case 'Use with caution':
        return 'warning';
      case 'Suitable':
      case 'Suitable (for osteoporosis therapy)':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const renderDisclaimer = () => (
    <View style={styles.disclaimerContainer}>
      <View style={styles.disclaimerHeader}>
        <Ionicons name="warning" size={20} color="#dc3545" />
        <Text style={styles.disclaimerTitle}>Important Medical Disclaimer</Text>
      </View>
      <Text style={styles.disclaimerText}>
        This tool provides clinical decision support only. All recommendations must be reviewed and validated by a qualified healthcare provider. This is not a substitute for professional medical judgment.
      </Text>
    </View>
  );

  const renderAssessmentSummary = () => {
    if (!assessmentInput) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assessment Summary</Text>
        <View style={styles.summaryGrid}>
          {assessmentInput.age && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Age</Text>
              <Text style={styles.summaryValue}>{assessmentInput.age} years</Text>
            </View>
          )}
          {assessmentInput.ASCVD !== undefined && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>ASCVD Risk</Text>
              <Text style={styles.summaryValue}>{assessmentInput.ASCVD}%</Text>
            </View>
          )}
          {assessmentInput.Gail !== undefined && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gail Score</Text>
              <Text style={styles.summaryValue}>{assessmentInput.Gail}</Text>
            </View>
          )}
          {assessmentInput.Wells !== undefined && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Wells Score</Text>
              <Text style={styles.summaryValue}>{assessmentInput.Wells}</Text>
            </View>
          )}
          {assessmentInput.FRAX !== undefined && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>FRAX Score</Text>
              <Text style={styles.summaryValue}>{assessmentInput.FRAX}%</Text>
            </View>
          )}
          {assessmentInput.therapy_selected && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Selected Therapy</Text>
              <Text style={styles.summaryValue}>{assessmentInput.therapy_selected.replace('_', ' ')}</Text>
            </View>
          )}
          {assessmentInput.symptom_severity && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Symptom Severity</Text>
              <Text style={styles.summaryValue}>{assessmentInput.symptom_severity}/10</Text>
            </View>
          )}
        </View>
        
        {assessmentInput.meds && assessmentInput.meds.length > 0 && (
          <View style={styles.medicationsContainer}>
            <Text style={styles.medicationsTitle}>Current Medications:</Text>
            <View style={styles.medicationsList}>
              {assessmentInput.meds.map((med, index) => (
                <View key={index} style={styles.medicationChip}>
                  <Text style={styles.medicationText}>{med.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTreatmentResult = () => {
    if (!treatmentResult) return null;

    const suitabilityColor = getSuitabilityColor(treatmentResult.suitability);
    const suitabilityIcon = getSuitabilityIcon(treatmentResult.suitability);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Treatment Recommendation</Text>
        
        <View style={[styles.resultContainer, { borderLeftColor: suitabilityColor }]}>
          <View style={styles.resultHeader}>
            <Ionicons name={suitabilityIcon} size={24} color={suitabilityColor} />
            <Text style={[styles.suitabilityText, { color: suitabilityColor }]}>
              {treatmentResult.suitability}
            </Text>
          </View>
          
          <Text style={styles.recommendationText}>
            {treatmentResult.primary}
          </Text>
          
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowRationale(!showRationale)}
          >
            <Text style={styles.expandButtonText}>
              {showRationale ? 'Hide' : 'Show'} Clinical Rationale
            </Text>
            <Ionicons 
              name={showRationale ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#007AFF" 
            />
          </TouchableOpacity>
          
          {showRationale && (
            <View style={styles.rationaleContainer}>
              <Text style={styles.rationaleText}>
                {treatmentResult.rationale}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderWarnings = () => {
    if (!treatmentResult?.warnings || treatmentResult.warnings.length === 0) return null;

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.warningHeader}
          onPress={() => setShowWarnings(!showWarnings)}
        >
          <View style={styles.warningTitleContainer}>
            <Ionicons name="warning" size={20} color="#dc3545" />
            <Text style={styles.warningTitle}>
              Clinical Alerts ({treatmentResult.warnings.length})
            </Text>
          </View>
          <Ionicons 
            name={showWarnings ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#dc3545" 
          />
        </TouchableOpacity>
        
        {showWarnings && (
          <View style={styles.warningsContainer}>
            {treatmentResult.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <Ionicons name="alert-circle" size={16} color="#dc3545" />
                <Text style={styles.warningText}>
                  {warning.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={styles.discussButton}
        onPress={() => Alert.alert(
          'Discuss with Clinician',
          'Please review these recommendations with your healthcare provider to create a personalized treatment plan.',
          [{ text: 'OK' }]
        )}
      >
        <Ionicons name="medical" size={20} color="#fff" />
        <Text style={styles.discussButtonText}>Discuss with Clinician</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.exportButton}
        onPress={() => Alert.alert(
          'Export PDF',
          'PDF export functionality will be implemented in the next version.',
          [{ text: 'OK' }]
        )}
      >
        <Ionicons name="document" size={20} color="#007AFF" />
        <Text style={styles.exportButtonText}>Export PDF</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Treatment Plan</Text>
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={generateTreatmentPlan}
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={24} color={isLoading ? "#ccc" : "#007AFF"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderDisclaimer()}
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Generating treatment plan...</Text>
          </View>
        ) : (
          <>
            {renderAssessmentSummary()}
            {renderTreatmentResult()}
            {renderWarnings()}
          </>
        )}
      </ScrollView>
      
      {!isLoading && treatmentResult && renderActionButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  regenerateButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  disclaimerContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  summaryItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
  },
  medicationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  medicationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  medicationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  medicationChip: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  medicationText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  resultContainer: {
    borderLeftWidth: 4,
    paddingLeft: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suitabilityText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
    marginBottom: 16,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  rationaleContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  rationaleText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  warningTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginLeft: 8,
  },
  warningsContainer: {
    marginTop: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#721c24',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  discussButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
  },
  discussButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
});

export default RulesBasedTreatmentPlanScreen;