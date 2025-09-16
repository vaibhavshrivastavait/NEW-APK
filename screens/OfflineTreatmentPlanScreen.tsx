import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';

import OfflineRuleEngine, { PatientAssessment, TreatmentPlan, TreatmentRecommendation } from '../utils/offlineRuleEngine';

type RootStackParamList = {
  OfflineTreatmentPlan: {
    assessment: PatientAssessment;
  };
};

type OfflineTreatmentPlanScreenRouteProp = RouteProp<RootStackParamList, 'OfflineTreatmentPlan'>;
type OfflineTreatmentPlanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: OfflineTreatmentPlanScreenNavigationProp;
}

const DISCLAIMER_TEXT = `This tool provides guidance and is not a substitute for clinician judgement. All recommendations are advisory only and require healthcare provider discussion before implementation. Never use this tool for emergency situations - seek immediate medical attention if needed.`;

export default function OfflineTreatmentPlanScreen({ navigation }: Props) {
  const route = useRoute<OfflineTreatmentPlanScreenRouteProp>();
  const { assessment } = route.params;

  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInputSnapshot, setShowInputSnapshot] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(new Set());
  const [simulateMode, setSimulateMode] = useState(false);
  const [validationModal, setValidationModal] = useState<{visible: boolean; validation: any} | null>(null);

  const ruleEngine = new OfflineRuleEngine();

  useEffect(() => {
    generateTreatmentPlan();
  }, []);

  const generateTreatmentPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Initializing offline rule engine...');
      await ruleEngine.initialize();

      console.log('📋 Validating assessment data...');
      const validation = ruleEngine.validateAssessment(assessment);
      
      if (!validation.isValid && !validation.canProceedWithCaveats) {
        setValidationModal({
          visible: true,
          validation
        });
        setLoading(false);
        return;
      }

      if (validation.warnings.length > 0) {
        console.log('⚠️ Validation warnings:', validation.warnings);
      }

      console.log('⚡ Generating treatment plan...');
      const plan = await ruleEngine.generateTreatmentPlan(assessment);
      
      // Save plan locally
      await ruleEngine.saveTreatmentPlan(plan);
      
      setTreatmentPlan(plan);
      console.log(`✅ Treatment plan generated: ${plan.planId}`);

    } catch (err: any) {
      console.error('❌ Error generating treatment plan:', err);
      setError(err.message || 'Failed to generate treatment plan');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedWithCaveats = async () => {
    setValidationModal(null);
    setLoading(true);
    
    try {
      const plan = await ruleEngine.generateTreatmentPlan(assessment);
      await ruleEngine.saveTreatmentPlan(plan);
      setTreatmentPlan(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to generate treatment plan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!treatmentPlan) return;

    try {
      // For now, show success message - PDF export would be implemented separately
      Alert.alert(
        'Export Successful',
        `Treatment plan ${treatmentPlan.planId.substring(0, 8)} has been prepared for export. PDF functionality will be available in the next version.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export treatment plan. Please try again.');
    }
  };

  const toggleRecommendationExpansion = (index: number) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRecommendations(newExpanded);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Urgent': return '#FF4444';
      case 'Refer': return '#FF8800';
      case 'Pharm': return '#2196F3';
      case 'NonPharm': return '#4CAF50';
      case 'Lifestyle': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF8800';
    return '#FF4444';
  };

  const renderValidationModal = () => {
    if (!validationModal) return null;
    
    const { validation } = validationModal;
    
    return (
      <Modal
        visible={validationModal.visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Incomplete Assessment Data</Text>
            <TouchableOpacity onPress={() => setValidationModal(null)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalMessage}>
              The following required fields are missing for complete treatment plan generation:
            </Text>
            
            {validation.missingRequired.map((field: string, index: number) => (
              <Text key={index} style={styles.missingField}>• {field}</Text>
            ))}
            
            {validation.warnings.length > 0 && (
              <>
                <Text style={styles.warningsTitle}>Additional Recommendations:</Text>
                {validation.warnings.map((warning: string, index: number) => (
                  <Text key={index} style={styles.warningText}>• {warning}</Text>
                ))}
              </>
            )}
            
            <Text style={styles.caveatText}>
              You can proceed with limited data, but recommendations will be marked as "Requires more data" 
              and confidence scores will be reduced.
            </Text>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.proceedButton} 
              onPress={handleProceedWithCaveats}
            >
              <Text style={styles.proceedButtonText}>Proceed with Available Data</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setValidationModal(null)}
            >
              <Text style={styles.cancelButtonText}>Complete Assessment First</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderRecommendation = (recommendation: TreatmentRecommendation, index: number) => {
    const isExpanded = expandedRecommendations.has(index);
    
    return (
      <View key={index} style={[styles.recommendationCard, { borderLeftColor: getTypeColor(recommendation.type) }]}>
        <View style={styles.recommendationHeader}>
          <View style={styles.recommendationMeta}>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(recommendation.type) }]}>
              <Text style={styles.typeBadgeText}>{recommendation.type}</Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(recommendation.confidenceScore) }]}>
              <Text style={styles.confidenceBadgeText}>{Math.round(recommendation.confidenceScore * 100)}%</Text>
            </View>
            <Text style={styles.priorityText}>Priority: {recommendation.priority}</Text>
          </View>
        </View>
        
        <Text style={styles.recommendationText}>{recommendation.text}</Text>
        
        {recommendation.requiresMoreData && (
          <View style={styles.dataWarning}>
            <MaterialIcons name="warning" size={16} color="#FF8800" />
            <Text style={styles.dataWarningText}>Requires complete assessment data</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => toggleRecommendationExpansion(index)}
        >
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={20} 
            color="#007AFF" 
          />
          <Text style={styles.expandButtonText}>
            {isExpanded ? 'Hide Details' : 'Show Rationale & Evidence'}
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.rationaleSection}>
              <Text style={styles.sectionTitle}>Rationale:</Text>
              <Text style={styles.rationaleText}>{recommendation.rationale}</Text>
            </View>
            
            {recommendation.evidence.length > 0 && (
              <View style={styles.evidenceSection}>
                <Text style={styles.sectionTitle}>Evidence:</Text>
                {recommendation.evidence.map((evidence, idx) => (
                  <Text key={idx} style={styles.evidenceText}>
                    • {evidence.title} ({evidence.version})
                  </Text>
                ))}
              </View>
            )}
            
            {recommendation.contraindications && recommendation.contraindications.length > 0 && (
              <View style={styles.contraindicationsSection}>
                <Text style={styles.sectionTitle}>Contraindications:</Text>
                {recommendation.contraindications.map((contra, idx) => (
                  <Text key={idx} style={styles.contraindicationText}>⚠️ {contra}</Text>
                ))}
              </View>
            )}
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
          <Text style={styles.loadingSubtext}>Analyzing clinical data with evidence-based rules</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF4444" />
          <Text style={styles.errorTitle}>Generation Failed</Text>
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
        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <MaterialIcons name="info" size={20} color="#FF8800" />
          <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
        </View>

        {/* Header with Controls */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Text style={styles.title}>Treatment Plan</Text>
            <Text style={styles.planId}>ID: {treatmentPlan.planId.substring(0, 8)}</Text>
            <Text style={styles.timestamp}>
              Generated: {new Date(treatmentPlan.timestamp).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.headerControls}>
            <View style={styles.simulateToggle}>
              <Text style={styles.simulateLabel}>Simulate Mode</Text>
              <Switch
                value={simulateMode}
                onValueChange={setSimulateMode}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={simulateMode ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Urgent Flags */}
        {treatmentPlan.flags.urgent && (
          <View style={styles.urgentSection}>
            <View style={styles.urgentHeader}>
              <MaterialIcons name="warning" size={24} color="#FF4444" />
              <Text style={styles.urgentTitle}>Urgent Attention Required</Text>
            </View>
            {treatmentPlan.recommendations
              .filter(r => r.type === 'Urgent')
              .map((rec, idx) => (
                <Text key={idx} style={styles.urgentText}>🔴 {rec.text}</Text>
              ))}
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{treatmentPlan.summary}</Text>
        </View>

        {/* General Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Plan</Text>
          {treatmentPlan.generalPlan.map((item, index) => (
            <Text key={index} style={styles.generalPlanItem}>
              {index + 1}. {item}
            </Text>
          ))}
        </View>

        {/* Specific Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specific Recommendations</Text>
          {treatmentPlan.recommendations.map((rec, index) => 
            renderRecommendation(rec, index)
          )}
        </View>

        {/* Input Snapshot */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => setShowInputSnapshot(!showInputSnapshot)}
          >
            <Text style={styles.sectionTitle}>Input Snapshot</Text>
            <MaterialIcons 
              name={showInputSnapshot ? "expand-less" : "expand-more"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showInputSnapshot && (
            <View style={styles.snapshotContainer}>
              <Text style={styles.snapshotText}>
                {JSON.stringify(treatmentPlan.inputSnapshot, null, 2)}
              </Text>
            </View>
          )}
        </View>

        {/* Audit Trail */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => setShowAuditTrail(!showAuditTrail)}
          >
            <Text style={styles.sectionTitle}>Explain How This Was Derived</Text>
            <MaterialIcons 
              name={showAuditTrail ? "expand-less" : "expand-more"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showAuditTrail && (
            <View style={styles.auditContainer}>
              <Text style={styles.auditTitle}>Rules Matched:</Text>
              {treatmentPlan.auditTrail.rulesMatched.map((rule, idx) => (
                <Text key={idx} style={styles.auditText}>• {rule}</Text>
              ))}
              
              <Text style={styles.auditTitle}>Evidence Used:</Text>
              {treatmentPlan.auditTrail.evidenceUsed.map((evidence, idx) => (
                <Text key={idx} style={styles.auditText}>
                  • {evidence.title} ({evidence.version})
                </Text>
              ))}
              
              <Text style={styles.auditTitle}>Processing Details:</Text>
              <Text style={styles.auditText}>
                • Evaluation time: {treatmentPlan.auditTrail.evaluationTime}ms
              </Text>
              <Text style={styles.auditText}>
                • Knowledge version: {treatmentPlan.auditTrail.knowledgeVersion}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
            <MaterialIcons name="picture-as-pdf" size={20} color="#007AFF" />
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.clinicianButton}
            onPress={() => Alert.alert(
              'Discuss with Clinician',
              'Please schedule an appointment to discuss these recommendations with your healthcare provider.',
              [{ text: 'OK' }]
            )}
          >
            <MaterialIcons name="local-hospital" size={20} color="#FFF" />
            <Text style={styles.clinicianButtonText}>Discuss with Clinician</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderValidationModal()}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginLeft: 8,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerMain: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  planId: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  headerControls: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  simulateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  simulateLabel: {
    fontSize: 16,
    color: '#2C3E50',
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
  urgentText: {
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
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
  },
  generalPlanItem: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 8,
  },
  recommendationCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    marginBottom: 12,
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confidenceBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priorityText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  recommendationText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 12,
  },
  dataWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  dataWarningText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 4,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },
  rationaleSection: {
    marginBottom: 12,
  },
  evidenceSection: {
    marginBottom: 12,
  },
  contraindicationsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  rationaleText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  evidenceText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  contraindicationText: {
    fontSize: 14,
    color: '#FF4444',
    marginBottom: 4,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snapshotContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 4,
    marginTop: 12,
  },
  snapshotText: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: 'monospace',
  },
  auditContainer: {
    marginTop: 12,
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8,
  },
  auditText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clinicianButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    borderRadius: 8,
  },
  clinicianButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 32,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 16,
    lineHeight: 24,
  },
  missingField: {
    fontSize: 14,
    color: '#FF4444',
    marginBottom: 8,
    fontWeight: '500',
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8800',
    marginTop: 16,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#FF8800',
    marginBottom: 4,
  },
  caveatText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 16,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  proceedButton: {
    backgroundColor: '#FF8800',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});