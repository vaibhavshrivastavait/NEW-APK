import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import treatmentPlanGenerator, { 
  type TreatmentPlan, 
  type TreatmentPlanInputs,
  type TreatmentRecommendation,
  type SafetyFlag,
  type MonitoringPlan,
  type PatientCounseling
} from '../utils/treatmentPlanGenerator';
import useAssessmentStore from '../store/assessmentStore';

type RootStackParamList = {
  Home: undefined;
  TreatmentPlan: { 
    inputs?: TreatmentPlanInputs;
    planId?: string;
  };
  DecisionSupport: undefined;
};

type TreatmentPlanScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TreatmentPlan'>;
  route: {
    params?: {
      inputs?: TreatmentPlanInputs;
      planId?: string;
      generatedPlan?: any; // Medicine-based generated plan
      selectedMedicines?: any[]; // Selected medicines from Decision Support
    };
  };
};

export default function TreatmentPlanScreen({ 
  navigation, 
  route 
}: TreatmentPlanScreenProps) {
  const { currentPatient, savedTreatmentPlans, saveTreatmentPlan } = useAssessmentStore();
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    console.log('TreatmentPlanScreen useEffect triggered with params:', route.params);
    
    try {
      if (route.params?.generatedPlan) {
        console.log('Handling generated plan from Decision Support');
        handleGeneratedPlan(route.params.generatedPlan);
      } else if (route.params?.inputs) {
        console.log('Generating from inputs');
        generateTreatmentPlan(route.params.inputs);
      } else if (route.params?.planId) {
        console.log('Loading saved plan');
        loadSavedPlan(route.params.planId);
      } else if (currentPatient) {
        console.log('Generating from current patient');
        generateFromCurrentPatient();
      } else {
        console.log('No params found, creating default plan');
        // Create a default plan to prevent white screen
        const defaultPlan: TreatmentPlan = {
          id: 'default-plan-' + Date.now(),
          timestamp: new Date().toISOString(),
          rulesetVersion: '1.0.0',
          patientInfo: {
            age: 52,
            keyFlags: ['General assessment']
          },
          primaryRecommendation: {
            id: 'primary-1',
            type: 'primary',
            title: 'General Menopause Management',
            recommendation: 'Comprehensive assessment and lifestyle modifications',
            rationale: 'First-line approach for general menopause symptoms',
            safety: { level: 'preferred', color: 'green' },
            evidence: { level: 'A', description: 'Strong evidence base' }
          },
          alternatives: [
            {
              id: 'alt-1',
              type: 'alternative',
              title: 'Lifestyle Modifications',
              recommendation: 'Regular exercise, healthy diet, stress management',
              rationale: 'Non-pharmacological approach suitable for all patients',
              safety: { level: 'preferred', color: 'green' },
              evidence: { level: 'A', description: 'Well-established benefits' }
            }
          ],
          safetyFlags: [],
          contraindications: [],
          monitoringPlan: {
            timeline: 'baseline',
            assessments: [],
            followUpSchedule: '3-6 months'
          },
          counseling: {
            keyPoints: ['Lifestyle modifications are first-line therapy'],
            riskBenefitDiscussion: 'General menopause management approach',
            sharedDecisionMaking: 'Patient preferences considered'
          },
          clinicalSummary: 'General treatment plan for menopause management',
          chartDocumentation: 'Patient counseled on general menopause management approaches',
          inputsSnapshot: {},
          triggeredRules: ['general-assessment'],
          disclaimer: 'This is a general treatment recommendation. Individual assessment required.'
        };
        setTreatmentPlan(defaultPlan);
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      // Set a fallback plan to prevent white screen
      const fallbackPlan: TreatmentPlan = {
        id: 'fallback-plan-' + Date.now(),
        timestamp: new Date().toISOString(),
        rulesetVersion: '1.0.0',
        patientInfo: {
          age: 0,
          keyFlags: ['Error occurred']
        },
        primaryRecommendation: {
          id: 'error-1',
          type: 'primary',
          title: 'Error in Plan Generation',
          recommendation: 'Please try again or contact support',
          rationale: 'Error occurred during treatment plan generation',
          safety: { level: 'caution', color: 'yellow' },
          evidence: { level: 'N/A', description: 'Error state' }
        },
        alternatives: [],
        safetyFlags: [],
        contraindications: [],
        monitoringPlan: {
          timeline: 'n/a',
          assessments: [],
          followUpSchedule: 'As needed'
        },
        counseling: {
          keyPoints: ['Error occurred during plan generation'],
          riskBenefitDiscussion: 'Please retry plan generation',
          sharedDecisionMaking: 'Technical issue encountered'
        },
        clinicalSummary: 'Error occurred during treatment plan generation',
        chartDocumentation: 'Technical error in plan generation - retry required',
        inputsSnapshot: {},
        triggeredRules: ['error-handler'],
        disclaimer: 'Error occurred during plan generation. Please try again.'
      };
      setTreatmentPlan(fallbackPlan);
    }
  }, []);

  const handleGeneratedPlan = (generatedPlan: any) => {
    // Convert the medicine-based plan to the expected treatment plan format
    const convertedPlan = {
      id: generatedPlan.id,
      patientId: generatedPlan.patientId || currentPatient?.id,
      generatedAt: generatedPlan.generatedAt,
      type: determinePlanType(generatedPlan),
      route: determinePlanRoute(generatedPlan),
      progestogenType: determineProgestogenType(generatedPlan),
      rationale: generatedPlan.rationale?.map((r: any) => r.point) || [],
      alternatives: generatedPlan.alternativeTherapies?.map((a: any) => a.description) || [],
      monitoringPlan: generatedPlan.monitoring?.map((m: any) => m.parameter + ' - ' + m.frequency) || [],
      safetyFlags: convertSafetyFlags(generatedPlan),
      clinicalSummary: generateClinicalSummary(generatedPlan),
      inputsSnapshot: route.params?.selectedMedicines || [],
      isOfflineGenerated: generatedPlan.isOfflineGenerated || true,
      medicineBasedPlan: generatedPlan // Store the full generated plan for display
    };
    
    setTreatmentPlan(convertedPlan);
  };

  const determinePlanType = (plan: any): string => {
    const hrtMeds = plan.selectedMedicines?.filter((m: any) => m.type.includes('HRT')) || [];
    if (hrtMeds.length === 0) return 'not-recommended';
    
    const hasEstrogen = hrtMeds.some((m: any) => m.type === 'HRT_ESTROGEN');
    const hasProgestogen = hrtMeds.some((m: any) => m.type === 'HRT_PROGESTOGEN');
    
    if (hasEstrogen && hasProgestogen) return 'EPT';
    if (hasEstrogen) return 'ET';
    return 'not-recommended';
  };

  const determinePlanRoute = (plan: any): string => {
    const hrtMeds = plan.selectedMedicines?.filter((m: any) => m.type.includes('HRT')) || [];
    const patches = hrtMeds.filter((m: any) => m.name.toLowerCase().includes('patch'));
    if (patches.length > 0) return 'transdermal';
    return 'oral';
  };

  const determineProgestogenType = (plan: any): string => {
    const progestogenMeds = plan.selectedMedicines?.filter((m: any) => m.type === 'HRT_PROGESTOGEN') || [];
    if (progestogenMeds.length > 0) {
      const med = progestogenMeds[0];
      if (med.name.toLowerCase().includes('progesterone')) return 'micronized';
      if (med.name.toLowerCase().includes('ius')) return 'ius';
    }
    return 'micronized';
  };

  const convertSafetyFlags = (plan: any) => {
    const flags = [];
    
    if (plan.contraindicationAlerts?.length > 0) {
      flags.push({
        id: 'contraindications',
        type: 'contraindication',
        severity: 'high',
        message: `${plan.contraindicationAlerts.length} contraindication(s) identified`,
        recommendation: 'Review contraindications before prescribing',
        color: '#F44336'
      });
    }
    
    if (plan.drugInteractionWarnings?.length > 0) {
      const highRiskInteractions = plan.drugInteractionWarnings.filter((i: any) => i.severity === 'HIGH');
      if (highRiskInteractions.length > 0) {
        flags.push({
          id: 'interactions',
          type: 'interaction',
          severity: 'high',
          message: `${highRiskInteractions.length} high-risk interaction(s) identified`,
          recommendation: 'Monitor closely or consider alternatives',
          color: '#FF9800'
        });
      }
    }
    
    const herbalMeds = plan.selectedMedicines?.filter((m: any) => m.type === 'HERBAL_SUPPLEMENT') || [];
    if (herbalMeds.length > 0) {
      flags.push({
        id: 'herbal',
        type: 'information',
        severity: 'moderate',
        message: 'Herbal supplements included in analysis',
        recommendation: 'Limited evidence - consult pharmacist',
        color: '#FFC107'
      });
    }
    
    return flags;
  };

  const generateClinicalSummary = (plan: any): string => {
    const recommendations = plan.primaryRecommendations || [];
    const interactions = plan.drugInteractionWarnings || [];
    const contraindications = plan.contraindicationAlerts || [];
    
    let summary = `Treatment plan analysis for ${plan.selectedMedicines?.length || 0} selected medicine(s).\n\n`;
    
    if (recommendations.length > 0) {
      summary += 'PRIMARY RECOMMENDATIONS:\n';
      recommendations.forEach((rec: any, index: number) => {
        summary += `${index + 1}. ${rec.action}\n`;
      });
      summary += '\n';
    }
    
    if (contraindications.length > 0) {
      summary += 'CONTRAINDICATIONS:\n';
      contraindications.forEach((contra: any, index: number) => {
        summary += `${index + 1}. ${contra.description}\n`;
      });
      summary += '\n';
    }
    
    if (interactions.length > 0) {
      summary += 'DRUG INTERACTIONS:\n';
      interactions.forEach((interaction: any, index: number) => {
        summary += `${index + 1}. ${interaction.description}\n`;
      });
      summary += '\n';
    }
    
    if (plan.specialNotes?.length > 0) {
      summary += 'SPECIAL NOTES:\n';
      plan.specialNotes.forEach((note: string, index: number) => {
        summary += `${index + 1}. ${note}\n`;
      });
    }
    
    return summary;
  };

  const generateTreatmentPlan = async (inputs: TreatmentPlanInputs) => {
    setLoading(true);
    try {
      const plan = treatmentPlanGenerator.generateTreatmentPlan(inputs);
      setTreatmentPlan(plan);
    } catch (error) {
      console.error('Error generating treatment plan:', error);
      Alert.alert(
        'Error',
        'Failed to generate treatment plan. Please check input data and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateFromCurrentPatient = () => {
    if (!currentPatient) return;

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
      moodSymptoms: currentPatient.moodSymptoms || false,
      patientPreference: currentPatient.patientPreference || 'no_preference',
      bmi: currentPatient.bmi,
      breastfeeding: currentPatient.breastfeeding || false,
      timeSinceMenopause: currentPatient.timeSinceMenopause,
      currentMedications: currentPatient.currentMedications || [],
      allergies: currentPatient.allergies || [],
    };

    generateTreatmentPlan(inputs);
  };

  const loadSavedPlan = (planId: string) => {
    const plan = savedTreatmentPlans.find(p => p.id === planId);
    if (plan) {
      setTreatmentPlan(plan);
    }
  };

  const exportPDF = async () => {
    try {
      Alert.alert(
        'Export Treatment Plan',
        'Choose export method:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share as Text', 
            onPress: () => shareAsText()
          },
          { 
            text: 'Export PDF', 
            onPress: () => exportAsPDF()
          }
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export treatment plan');
    }
  };

  const shareAsText = async () => {
    try {
      if (!treatmentPlan) return;
      
      const textContent = generateTextContent(treatmentPlan);
      
      if (Platform.OS === 'web') {
        // For web platform, use browser's share API or clipboard
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
        // For mobile platforms
        await Share.share({
          message: textContent,
          title: 'Treatment Plan'
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share treatment plan');
    }
  };

  const exportAsPDF = async () => {
    try {
      Alert.alert('PDF Export', 'PDF export functionality will be implemented in the next update. For now, you can share as text.');
    } catch (error) {
      console.error('PDF export error:', error);
      Alert.alert('Error', 'PDF export failed');
    }
  };

  const generateTextContent = (plan: TreatmentPlan): string => {
    let content = `TREATMENT PLAN\n`;
    content += `Generated: ${new Date(plan.generatedAt).toLocaleDateString()}\n\n`;
    
    if (plan.medicineBasedPlan) {
      // Use medicine-based plan data
      const mbPlan = plan.medicineBasedPlan;
      content += `PRIMARY RECOMMENDATIONS:\n`;
      mbPlan.primaryRecommendations?.forEach((rec: any, index: number) => {
        content += `${index + 1}. ${rec.recommendation}\n`;
      });
      
      content += `\nINTERACTION WARNINGS:\n`;
      mbPlan.interactionWarnings?.forEach((warning: any, index: number) => {
        content += `${index + 1}. ${warning.description}\n`;
      });
      
      content += `\nALTERNATIVE THERAPIES:\n`;
      mbPlan.alternativeTherapies?.forEach((alt: any, index: number) => {
        content += `${index + 1}. ${alt.title}: ${alt.description}\n`;
      });
    } else {
      // Use standard plan data
      content += `THERAPY TYPE: ${plan.type}\n`;
      content += `ROUTE: ${plan.route}\n`;
      content += `PROGESTOGEN: ${plan.progestogenType}\n\n`;
      
      content += `RATIONALE:\n`;
      plan.rationale.forEach((rationale, index) => {
        content += `${index + 1}. ${rationale}\n`;
      });
    }
    
    return content;
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating Treatment Plan...</Text>
          <Text style={styles.loadingSubtext}>Analyzing patient data and clinical guidelines</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!treatmentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorTitle}>Unable to Generate Plan</Text>
          <Text style={styles.errorText}>
            Please ensure a complete assessment has been performed.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Treatment Plan</Text>
        <TouchableOpacity style={styles.moreButton} onPress={exportPDF}>
          <MaterialIcons name="share" size={24} color="#D81B60" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Patient Header */}
        <View style={styles.patientHeader}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>
              {currentPatient?.name || 'Patient'}, {treatmentPlan.patientInfo.age}yo
            </Text>
            <Text style={styles.generatedDate}>
              Generated: {new Date(treatmentPlan.timestamp).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.keyFlags}>
            {treatmentPlan.patientInfo.keyFlags.map((flag, index) => (
              <View 
                key={index} 
                style={[
                  styles.flagBadge, 
                  { backgroundColor: flag.includes('High') || flag.includes('Absolute') ? '#FFEBEE' : '#E8F5E8' }
                ]}
              >
                <Text style={[
                  styles.flagText,
                  { color: flag.includes('High') || flag.includes('Absolute') ? '#F44336' : '#4CAF50' }
                ]}>
                  {flag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary Recommendation Card */}
        <View style={styles.primaryCard}>
          <View style={styles.primaryHeader}>
            <MaterialIcons 
              name={getSafetyIcon(treatmentPlan.primaryRecommendation.safety.level)} 
              size={32} 
              color={getSafetyColor(treatmentPlan.primaryRecommendation.safety.color)} 
            />
            <View style={styles.primaryTitleSection}>
              <Text style={styles.primaryTitle}>Primary Recommendation</Text>
              <View style={[
                styles.safetyBadge, 
                { backgroundColor: getSafetyColor(treatmentPlan.primaryRecommendation.safety.color) }
              ]}>
                <Text style={styles.safetyBadgeText}>
                  {treatmentPlan.primaryRecommendation.safety.level.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.recommendationText}>
            {treatmentPlan.primaryRecommendation.recommendation}
          </Text>
          
          {treatmentPlan.primaryRecommendation.details && (
            <View style={styles.detailsSection}>
              {treatmentPlan.primaryRecommendation.details.firstLine && (
                <Text style={styles.detailText}>
                  First-line: {treatmentPlan.primaryRecommendation.details.firstLine}
                </Text>
              )}
              {treatmentPlan.primaryRecommendation.details.dosing && (
                <Text style={styles.detailText}>
                  Dosing: {treatmentPlan.primaryRecommendation.details.dosing}
                </Text>
              )}
              {treatmentPlan.primaryRecommendation.details.duration && (
                <Text style={styles.detailText}>
                  Duration: {treatmentPlan.primaryRecommendation.details.duration}
                </Text>
              )}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => toggleSection('rationale')}
          >
            <Text style={styles.expandButtonText}>
              {expandedSections.rationale ? 'Hide' : 'Show'} Rationale
            </Text>
            <MaterialIcons 
              name={expandedSections.rationale ? 'expand-less' : 'expand-more'} 
              size={20} 
              color="#D81B60" 
            />
          </TouchableOpacity>
          
          {expandedSections.rationale && (
            <View style={styles.rationaleSection}>
              <Text style={styles.rationaleText}>
                {treatmentPlan.primaryRecommendation.rationale}
              </Text>
              <View style={styles.evidenceSection}>
                <Text style={styles.evidenceTitle}>Evidence Base:</Text>
                <Text style={styles.evidenceText}>
                  Guidelines: {treatmentPlan.primaryRecommendation.evidence.guidelines.join(', ')}
                </Text>
                <Text style={styles.evidenceText}>
                  Strength: {treatmentPlan.primaryRecommendation.evidence.strength}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Safety Flags & Contraindications */}
        {(treatmentPlan.safetyFlags.length > 0 || treatmentPlan.contraindications.length > 0) && (
          <View style={styles.safetyCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="security" size={24} color="#F44336" />
              <Text style={styles.cardTitle}>Safety & Contraindications</Text>
            </View>
            
            {treatmentPlan.safetyFlags.map((flag, index) => (
              <View key={index} style={styles.safetyFlag}>
                <View style={styles.safetyFlagHeader}>
                  <MaterialIcons 
                    name={flag.severity === 'absolute' ? 'block' : 'warning'} 
                    size={20} 
                    color={flag.severity === 'absolute' ? '#F44336' : '#FF9800'} 
                  />
                  <Text style={[
                    styles.safetyFlagTitle,
                    { color: flag.severity === 'absolute' ? '#F44336' : '#FF9800' }
                  ]}>
                    {flag.title}
                  </Text>
                </View>
                <Text style={styles.safetyFlagDescription}>{flag.description}</Text>
                {flag.action && (
                  <Text style={styles.safetyFlagAction}>Action: {flag.action}</Text>
                )}
              </View>
            ))}
            
            {treatmentPlan.contraindications.length > 0 && (
              <View style={styles.contraindicationsSection}>
                <Text style={styles.contraindicationsTitle}>Detected Contraindications:</Text>
                {treatmentPlan.contraindications.map((contraindication, index) => (
                  <Text key={index} style={styles.contraindicationItem}>
                    • {contraindication}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Alternatives Section */}
        {treatmentPlan.alternatives.length > 0 && (
          <View style={styles.alternativesCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="alt-route" size={24} color="#2196F3" />
              <Text style={styles.cardTitle}>Alternative Options</Text>
            </View>
            
            {treatmentPlan.alternatives.map((alternative, index) => (
              <View key={index} style={styles.alternativeItem}>
                <View style={styles.alternativeHeader}>
                  <Text style={styles.alternativeTitle}>{alternative.title || alternative.recommendation}</Text>
                  <View style={styles.alternativeRank}>
                    <Text style={styles.alternativeRankText}>{index + 2}</Text>
                  </View>
                </View>
                <Text style={styles.alternativeDescription}>
                  {alternative.recommendation}
                </Text>
                {alternative.rationale && (
                  <Text style={styles.alternativeRationale}>
                    {alternative.rationale}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Monitoring & Follow-up */}
        <View style={styles.monitoringCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="schedule" size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Monitoring & Follow-up</Text>
          </View>
          
          <View style={styles.monitoringTimeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineMarker} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Baseline Assessment</Text>
                <Text style={styles.timelineDescription}>
                  {treatmentPlan.monitoringPlan.baseline.join(', ')}
                </Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={styles.timelineMarker} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Early Follow-up (3 months)</Text>
                <Text style={styles.timelineDescription}>
                  {treatmentPlan.monitoringPlan.earlyFollowup.join(', ')}
                </Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={styles.timelineMarker} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Ongoing Monitoring</Text>
                <Text style={styles.timelineDescription}>
                  {treatmentPlan.monitoringPlan.ongoing.join(', ')}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.scheduleNote}>
            <Text style={styles.scheduleNoteText}>
              Schedule: {treatmentPlan.monitoringPlan.timeline}
            </Text>
          </View>
        </View>

        {/* Clinical Documentation */}
        <View style={styles.documentationCard}>
          <TouchableOpacity 
            style={styles.cardHeader}
            onPress={() => toggleSection('documentation')}
          >
            <MaterialIcons name="description" size={24} color="#607D8B" />
            <Text style={styles.cardTitle}>Clinical Documentation</Text>
            <MaterialIcons 
              name={expandedSections.documentation ? 'expand-less' : 'expand-more'} 
              size={20} 
              color="#607D8B" 
            />
          </TouchableOpacity>
          
          {expandedSections.documentation && (
            <View style={styles.documentationContent}>
              <View style={styles.documentationSection}>
                <Text style={styles.documentationTitle}>Chart Note:</Text>
                <Text style={styles.documentationText}>
                  {treatmentPlan.chartDocumentation}
                </Text>
              </View>
              
              <View style={styles.documentationSection}>
                <Text style={styles.documentationTitle}>Clinical Summary:</Text>
                <Text style={styles.documentationText}>
                  {treatmentPlan.clinicalSummary}
                </Text>
              </View>
              
              <View style={styles.auditSection}>
                <Text style={styles.auditTitle}>Audit Information:</Text>
                <Text style={styles.auditText}>Plan ID: {treatmentPlan.id}</Text>
                <Text style={styles.auditText}>Ruleset Version: {treatmentPlan.rulesetVersion}</Text>
                <Text style={styles.auditText}>
                  Rules Applied: {treatmentPlan.triggeredRules.join(', ')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <MaterialIcons name="info" size={20} color="#666" />
          <Text style={styles.disclaimerText}>
            {treatmentPlan.disclaimer}
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#D81B60',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
  moreButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  patientHeader: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12,
  },
  patientInfo: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  generatedDate: {
    fontSize: 12,
    color: '#666',
  },
  keyFlags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  primaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  primaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  primaryTitleSection: {
    flex: 1,
  },
  primaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  safetyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  safetyBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: '500',
  },
  detailsSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 6,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#D81B60',
    fontWeight: '500',
  },
  rationaleSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rationaleText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  evidenceSection: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
  },
  evidenceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 6,
  },
  evidenceText: {
    fontSize: 12,
    color: '#388E3C',
    marginBottom: 2,
  },
  safetyCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  safetyFlag: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  safetyFlagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  safetyFlagTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  safetyFlagDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 6,
  },
  safetyFlagAction: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  contraindicationsSection: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  contraindicationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
  },
  contraindicationItem: {
    fontSize: 13,
    color: '#C62828',
    lineHeight: 18,
    marginBottom: 2,
  },
  alternativesCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alternativeItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alternativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  alternativeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  alternativeRank: {
    backgroundColor: '#E3F2FD',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternativeRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  alternativeDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 4,
  },
  alternativeRationale: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  monitoringCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monitoringTimeline: {
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  timelineMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  scheduleNote: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
  },
  scheduleNoteText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
  },
  documentationCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  documentationContent: {
    marginTop: 8,
  },
  documentationSection: {
    marginBottom: 16,
  },
  documentationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#607D8B',
    marginBottom: 6,
  },
  documentationText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 6,
  },
  auditSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  auditTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  auditText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 2,
  },
  disclaimerCard: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
    flex: 1,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 30,
  },
});