import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAssessmentStore } from '../store/assessmentStore';
import { TreatmentPlanEngine, TreatmentInputs, TreatmentRecommendation } from '../utils/treatmentPlanEngine';
import { TreatmentPlanGenerator, TreatmentPlanInputs, TreatmentPlan } from '../utils/treatmentPlanGenerator';
import crashProofStorage from '../utils/asyncStorageUtils';
import { SafeFlatList } from '../components/SafeFlatList';

interface CustomTreatmentInputs extends TreatmentPlanInputs {
  customRiskFactors?: string[];
  clinicianNotes?: string;
  medicinePreferences?: string[];
  urgencyLevel?: 'routine' | 'urgent' | 'emergency';
}

interface SavedPlan {
  id: string;
  patientName: string;
  timestamp: string;
  plan: TreatmentPlan;
  customInputs: CustomTreatmentInputs;
}

interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  inputs: Partial<TreatmentPlanInputs>;
}

const RobustTreatmentPlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentPatient, patients } = useAssessmentStore();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<TreatmentPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [planTemplates] = useState<PlanTemplate[]>([
    {
      id: 'low_risk_standard',
      name: 'Low Risk - Standard HRT',
      description: 'Standard template for low cardiovascular risk patients',
      inputs: {
        vasomotorSymptoms: 'moderate',
        patientPreference: 'hormonal',
        personalHistoryBreastCancer: false,
        personalHistoryDVT: false,
        smoking: false,
        hypertension: false,
        diabetes: false
      }
    },
    {
      id: 'high_risk_conservative',
      name: 'High Risk - Conservative Approach',
      description: 'Template for patients with elevated risk factors',
      inputs: {
        vasomotorSymptoms: 'mild',
        patientPreference: 'non_hormonal',
        personalHistoryBreastCancer: false,
        personalHistoryDVT: false,
        smoking: true,
        hypertension: true
      }
    },
    {
      id: 'contraindicated',
      name: 'HRT Contraindicated',
      description: 'Template for patients with absolute contraindications',
      inputs: {
        personalHistoryBreastCancer: true,
        vasomotorSymptoms: 'severe',
        patientPreference: 'non_hormonal'
      }
    }
  ]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'generate' | 'saved' | 'templates'>('generate');
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [customInputs, setCustomInputs] = useState<CustomTreatmentInputs>({
    age: 50,
    gender: 'female',
    personalHistoryBreastCancer: false,
    personalHistoryDVT: false,
    unexplainedVaginalBleeding: false,
    liverDisease: false,
    smoking: false,
    hypertension: false,
    diabetes: false,
    vasomotorSymptoms: 'moderate',
    genitourinarySymptoms: false,
    sleepDisturbance: false,
    moodSymptoms: false,
    patientPreference: 'no_preference'
  });
  
  // Generators
  const treatmentPlanEngine = useRef(new TreatmentPlanEngine()).current;
  const treatmentPlanGenerator = useRef(new TreatmentPlanGenerator()).current;

  // Load saved plans on component mount
  React.useEffect(() => {
    loadSavedPlans();
  }, []);

  // Generate treatment plan from current patient
  const generateFromCurrentPatient = useCallback(async () => {
    if (!currentPatient) {
      Alert.alert('No Patient Selected', 'Please select a patient from the Patient List first.');
      return;
    }

    setLoading(true);
    try {
      const inputs: TreatmentPlanInputs = {
        age: currentPatient.age,
        gender: currentPatient.gender,
        personalHistoryBreastCancer: currentPatient.personalHistoryBreastCancer || false,
        personalHistoryDVT: currentPatient.personalHistoryDVT || false,
        unexplainedVaginalBleeding: currentPatient.unexplainedVaginalBleeding || false,
        liverDisease: currentPatient.liverDisease || false,
        smoking: currentPatient.smoking || false,
        hypertension: currentPatient.hypertension || false,
        diabetes: currentPatient.diabetes || false,
        vasomotorSymptoms: currentPatient.vasomotorSymptoms || 'moderate',
        genitourinarySymptoms: currentPatient.genitourinarySymptoms || false,
        sleepDisturbance: currentPatient.sleepDisturbance || false,
        moodSymptoms: currentPatient.moodSymptomes || false,
        patientPreference: currentPatient.patientPreference || 'no_preference',
        bmi: currentPatient.bmi,
        currentMedications: currentPatient.currentMedications || [],
        allergies: currentPatient.allergies || [],
        // Risk scores from assessments
        ascvdResult: currentPatient.riskScores?.ascvd ? {
          tenYearRisk: currentPatient.riskScores.ascvd,
          riskCategory: getRiskCategory(currentPatient.riskScores.ascvd, 'ascvd')
        } : undefined,
        framinghamResult: currentPatient.riskScores?.framingham ? {
          tenYearRisk: currentPatient.riskScores.framingham,
          riskCategory: getRiskCategory(currentPatient.riskScores.framingham, 'framingham')
        } : undefined,
        wellsScore: currentPatient.riskScores?.wells,
        fraxResult: currentPatient.riskScores?.frax ? {
          majorFractureRisk: currentPatient.riskScores.frax,
          hipFractureRisk: currentPatient.riskScores.fraxHip || 0
        } : undefined,
        gailResult: currentPatient.riskScores?.gail ? {
          fiveYearRisk: currentPatient.riskScores.gail,
          lifetimeRisk: currentPatient.riskScores.gailLifetime || 0
        } : undefined
      };

      const plan = treatmentPlanGenerator.generateTreatmentPlan(inputs);
      setCurrentPlan(plan);
      
      // Auto-save the plan
      await savePlan(plan, inputs);
      
    } catch (error) {
      console.error('Error generating treatment plan:', error);
      Alert.alert('Generation Error', 'Failed to generate treatment plan. Please check patient data and try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPatient, treatmentPlanGenerator]);

  // Generate from custom inputs
  const generateFromCustomInputs = useCallback(async () => {
    setLoading(true);
    try {
      const plan = treatmentPlanGenerator.generateTreatmentPlan(customInputs);
      setCurrentPlan(plan);
      await savePlan(plan, customInputs);
    } catch (error) {
      console.error('Error generating custom treatment plan:', error);
      Alert.alert('Generation Error', 'Failed to generate treatment plan from custom inputs.');
    } finally {
      setLoading(false);
    }
  }, [customInputs, treatmentPlanGenerator]);

  // Generate from template
  const generateFromTemplate = useCallback(async (template: PlanTemplate) => {
    setLoading(true);
    try {
      const inputs: TreatmentPlanInputs = {
        ...customInputs,
        ...template.inputs
      };
      
      const plan = treatmentPlanGenerator.generateTreatmentPlan(inputs);
      setCurrentPlan(plan);
      await savePlan(plan, inputs);
    } catch (error) {
      console.error('Error generating template plan:', error);
      Alert.alert('Generation Error', 'Failed to generate treatment plan from template.');
    } finally {
      setLoading(false);
    }
  }, [customInputs, treatmentPlanGenerator]);

  // Save plan to local storage
  const savePlan = async (plan: TreatmentPlan, inputs: TreatmentPlanInputs) => {
    try {
      const savedPlan: SavedPlan = {
        id: plan.id,
        patientName: currentPatient?.name || 'Custom Patient',
        timestamp: plan.timestamp,
        plan,
        customInputs: inputs
      };

      const existingPlans = await loadSavedPlans();
      const updatedPlans = [savedPlan, ...existingPlans.filter(p => p.id !== plan.id)];
      
      await crashProofStorage.setItem('saved_treatment_plans', JSON.stringify(updatedPlans));
      setSavedPlans(updatedPlans);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  // Load saved plans from storage
  const loadSavedPlans = async (): Promise<SavedPlan[]> => {
    try {
      const plansData = await crashProofStorage.getItem('saved_treatment_plans');
      const plans = plansData ? JSON.parse(plansData) : [];
      setSavedPlans(plans);
      return plans;
    } catch (error) {
      console.error('Error loading saved plans:', error);
      return [];
    }
  };

  // Delete saved plan
  const deleteSavedPlan = async (planId: string) => {
    try {
      const updatedPlans = savedPlans.filter(p => p.id !== planId);
      await crashProofStorage.setItem('saved_treatment_plans', JSON.stringify(updatedPlans));
      setSavedPlans(updatedPlans);
      
      if (currentPlan?.id === planId) {
        setCurrentPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  // Export plan
  const exportPlan = async (plan: TreatmentPlan) => {
    try {
      const textContent = generatePlanText(plan);
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'Treatment Plan',
            text: textContent
          });
        } else {
          await navigator.clipboard.writeText(textContent);
          Alert.alert('Success', 'Treatment plan copied to clipboard');
        }
      } else {
        await Share.share({
          message: textContent,
          title: 'Treatment Plan'
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export treatment plan');
    }
  };

  // Generate plan text for export
  const generatePlanText = (plan: TreatmentPlan): string => {
    let content = `MHT ASSESSMENT - TREATMENT PLAN\n`;
    content += `Generated: ${new Date(plan.timestamp).toLocaleDateString()}\n`;
    content += `Plan ID: ${plan.id}\n\n`;
    
    content += `PATIENT: ${plan.patientInfo.age}yo\n`;
    if (plan.patientInfo.keyFlags.length > 0) {
      content += `Key Flags: ${plan.patientInfo.keyFlags.join(', ')}\n`;
    }
    content += `\n`;
    
    content += `PRIMARY RECOMMENDATION:\n`;
    content += `${plan.primaryRecommendation.recommendation}\n`;
    content += `Safety Level: ${plan.primaryRecommendation.safety.level.toUpperCase()}\n`;
    content += `Evidence Strength: ${plan.primaryRecommendation.evidence.strength}\n\n`;
    
    if (plan.primaryRecommendation.details) {
      content += `DETAILS:\n`;
      Object.entries(plan.primaryRecommendation.details).forEach(([key, value]) => {
        if (value) content += `${key}: ${value}\n`;
      });
      content += `\n`;
    }
    
    content += `RATIONALE:\n${plan.primaryRecommendation.rationale}\n\n`;
    
    if (plan.safetyFlags.length > 0) {
      content += `SAFETY FLAGS:\n`;
      plan.safetyFlags.forEach((flag, index) => {
        content += `${index + 1}. ${flag.title} (${flag.severity})\n`;
        content += `   ${flag.description}\n`;
        if (flag.action) content += `   Action: ${flag.action}\n`;
      });
      content += `\n`;
    }
    
    if (plan.alternatives.length > 0) {
      content += `ALTERNATIVES:\n`;
      plan.alternatives.forEach((alt, index) => {
        content += `${index + 1}. ${alt.title || alt.recommendation}\n`;
        content += `   ${alt.rationale}\n`;
      });
      content += `\n`;
    }
    
    content += `MONITORING:\n`;
    content += `Baseline: ${plan.monitoringPlan.baseline.join(', ')}\n`;
    content += `Early Follow-up: ${plan.monitoringPlan.earlyFollowup.join(', ')}\n`;
    content += `Ongoing: ${plan.monitoringPlan.ongoing.join(', ')}\n`;
    content += `Schedule: ${plan.monitoringPlan.timeline}\n\n`;
    
    content += `CLINICAL DOCUMENTATION:\n`;
    content += `${plan.chartDocumentation}\n\n`;
    
    content += `DISCLAIMER:\n${plan.disclaimer}\n`;
    
    return content;
  };

  // Helper functions
  const getRiskCategory = (score: number, type: string): string => {
    switch (type) {
      case 'ascvd':
        if (score < 7.5) return 'Low';
        if (score < 20) return 'Intermediate';
        return 'High';
      case 'framingham':
        if (score < 10) return 'Low';
        if (score < 20) return 'Moderate';
        return 'High';
      default:
        return 'Unknown';
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSafetyColor = (color: string) => {
    switch (color) {
      case 'green': return '#4CAF50';
      case 'yellow': return '#FF9800';
      case 'orange': return '#FF5722';
      case 'red': return '#F44336';
      default: return '#666';
    }
  };

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'preferred': return 'check-circle';
      case 'consider': return 'info';
      case 'caution': return 'warning';
      case 'avoid': return 'cancel';
      default: return 'help';
    }
  };

  // Render functions
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'generate' && styles.activeTab]}
        onPress={() => setActiveTab('generate')}
      >
        <MaterialIcons 
          name="build" 
          size={20} 
          color={activeTab === 'generate' ? '#D81B60' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'generate' && styles.activeTabText]}>
          Generate
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
        onPress={() => setActiveTab('saved')}
      >
        <MaterialIcons 
          name="bookmark" 
          size={20} 
          color={activeTab === 'saved' ? '#D81B60' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
          Saved ({savedPlans.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
        onPress={() => setActiveTab('templates')}
      >
        <MaterialIcons 
          name="template" 
          size={20} 
          color={activeTab === 'templates' ? '#D81B60' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>
          Templates
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderGenerateTab = () => (
    <View style={styles.tabContent}>
      {/* Generation Options */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Generate Treatment Plan</Text>
        
        <TouchableOpacity
          style={[styles.generateButton, !currentPatient && styles.disabledButton]}
          onPress={generateFromCurrentPatient}
          disabled={!currentPatient || loading}
        >
          <MaterialIcons name="person" size={20} color="#FFF" />
          <Text style={styles.generateButtonText}>
            From Current Patient{currentPatient ? ` (${currentPatient.name})` : ' (None Selected)'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => setShowCustomInputs(true)}
        >
          <MaterialIcons name="edit" size={20} color="#FFF" />
          <Text style={styles.generateButtonText}>Custom Inputs</Text>
        </TouchableOpacity>
      </View>

      {/* Current Plan Display */}
      {currentPlan && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Plan</Text>
            <TouchableOpacity onPress={() => exportPlan(currentPlan)}>
              <MaterialIcons name="share" size={24} color="#D81B60" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.planSummary}>
            <View style={styles.planHeader}>
              <MaterialIcons 
                name={getSafetyIcon(currentPlan.primaryRecommendation.safety.level)} 
                size={24} 
                color={getSafetyColor(currentPlan.primaryRecommendation.safety.color)} 
              />
              <View style={styles.planTitle}>
                <Text style={styles.planTitleText}>
                  {currentPlan.primaryRecommendation.title || 'Primary Recommendation'}
                </Text>
                <Text style={styles.planSubtitle}>
                  Generated: {new Date(currentPlan.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.recommendationText}>
              {currentPlan.primaryRecommendation.recommendation}
            </Text>
            
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => toggleSection('planDetails')}
            >
              <Text style={styles.viewDetailsText}>
                {expandedSections.planDetails ? 'Hide Details' : 'View Details'}
              </Text>
              <MaterialIcons 
                name={expandedSections.planDetails ? 'expand-less' : 'expand-more'} 
                size={20} 
                color="#D81B60" 
              />
            </TouchableOpacity>
            
            {expandedSections.planDetails && (
              <View style={styles.planDetails}>
                <Text style={styles.detailsTitle}>Rationale:</Text>
                <Text style={styles.detailsText}>{currentPlan.primaryRecommendation.rationale}</Text>
                
                {currentPlan.safetyFlags.length > 0 && (
                  <>
                    <Text style={styles.detailsTitle}>Safety Flags:</Text>
                    {currentPlan.safetyFlags.map((flag, index) => (
                      <View key={index} style={styles.safetyFlag}>
                        <Text style={styles.flagTitle}>{flag.title}</Text>
                        <Text style={styles.flagDescription}>{flag.description}</Text>
                      </View>
                    ))}
                  </>
                )}
                
                <Text style={styles.detailsTitle}>Monitoring Schedule:</Text>
                <Text style={styles.detailsText}>{currentPlan.monitoringPlan.timeline}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderSavedTab = () => (
    <View style={styles.tabContent}>
      {savedPlans.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="bookmark-border" size={48} color="#CCC" />
          <Text style={styles.emptyStateText}>No saved treatment plans</Text>
          <Text style={styles.emptyStateSubtext}>Generate a plan to save it for later reference</Text>
        </View>
      ) : (
        <SafeFlatList
          data={savedPlans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.savedPlanItem}>
              <View style={styles.savedPlanHeader}>
                <View style={styles.savedPlanInfo}>
                  <Text style={styles.savedPlanName}>{item.patientName}</Text>
                  <Text style={styles.savedPlanDate}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.savedPlanActions}>
                  <TouchableOpacity
                    onPress={() => setCurrentPlan(item.plan)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="visibility" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => exportPlan(item.plan)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="share" size={20} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Delete Plan',
                        'Are you sure you want to delete this treatment plan?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteSavedPlan(item.id) }
                        ]
                      );
                    }}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="delete" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.savedPlanRecommendation} numberOfLines={2}>
                {item.plan.primaryRecommendation.recommendation}
              </Text>
              
              <View style={styles.savedPlanFlags}>
                {item.plan.patientInfo.keyFlags.map((flag, index) => (
                  <View key={index} style={styles.flagBadge}>
                    <Text style={styles.flagBadgeText}>{flag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderTemplatesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Treatment Plan Templates</Text>
      <Text style={styles.sectionDescription}>
        Pre-configured templates for common clinical scenarios
      </Text>
      
      {planTemplates.map((template) => (
        <TouchableOpacity
          key={template.id}
          style={styles.templateItem}
          onPress={() => generateFromTemplate(template)}
          disabled={loading}
        >
          <View style={styles.templateHeader}>
            <MaterialIcons name="description" size={24} color="#2196F3" />
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D81B60" />
          <Text style={styles.loadingText}>Generating Treatment Plan...</Text>
          <Text style={styles.loadingSubtext}>Analyzing clinical data and applying evidence-based guidelines</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Treatment Plans</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Alert.alert(
            'Treatment Plan Generator',
            'This tool generates evidence-based treatment recommendations using clinical guidelines and risk assessment data. Plans are saved locally for offline access.'
          )}
        >
          <MaterialIcons name="help-outline" size={24} color="#D81B60" />
        </TouchableOpacity>
      </View>

      {renderTabBar()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'saved' && renderSavedTab()}
        {activeTab === 'templates' && renderTemplatesTab()}
      </ScrollView>

      {/* Custom Inputs Modal */}
      <Modal
        visible={showCustomInputs}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Custom Treatment Inputs</Text>
            <TouchableOpacity onPress={() => setShowCustomInputs(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Custom input form would go here */}
            <Text style={styles.modalDescription}>
              Custom input form for treatment plan generation will be implemented here.
              This would include fields for demographics, risk scores, symptoms, and preferences.
            </Text>
            
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => {
                setShowCustomInputs(false);
                generateFromCustomInputs();
              }}
            >
              <Text style={styles.generateButtonText}>Generate Plan</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 4,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  helpButton: {
    padding: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#D81B60',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#D81B60',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  planSummary: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  planTitle: {
    flex: 1,
  },
  planTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  planSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#D81B60',
    fontWeight: '500',
  },
  planDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  safetyFlag: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  flagTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 2,
  },
  flagDescription: {
    fontSize: 11,
    color: '#BF360C',
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
  },
  savedPlanItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  savedPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savedPlanInfo: {
    flex: 1,
  },
  savedPlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  savedPlanDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  savedPlanActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  savedPlanRecommendation: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 8,
  },
  savedPlanFlags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  flagBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  flagBadgeText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  templateItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginVertical: 40,
  },
});

export default RobustTreatmentPlanScreen;