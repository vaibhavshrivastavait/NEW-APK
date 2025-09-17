import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params?: any;
  };
};

export default function TreatmentPlanScreenSimple({ navigation, route }: Props) {
  console.log('TreatmentPlanScreen rendering with params:', route.params);

  // Determine the source and content
  const isFromAssessment = route.params?.source === 'assessment_results';
  const assessmentData = route.params?.inputs;
  const generatedPlan = route.params?.generatedPlan;

  // Helper function for risk color coding
  const getRiskColor = (category: string | undefined) => {
    if (!category) return '#666';
    const cat = category.toLowerCase();
    if (cat.includes('high')) return '#F44336';
    if (cat.includes('moderate') || cat.includes('medium')) return '#FF9800';
    if (cat.includes('low')) return '#4CAF50';
    return '#666';
  };

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
        <Text style={styles.headerTitle}>
          {isFromAssessment ? 'Assessment Treatment Plan' : 'Treatment Plan'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assessment Results Treatment Plan */}
        {isFromAssessment && assessmentData && (
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>📋 Treatment Plan</Text>
            
            {/* Patient Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Patient Information</Text>
              <View style={styles.planDetail}>
                <Text style={styles.detailTitle}>Name:</Text>
                <Text style={styles.detailValue}>{assessmentData.patient?.name || 'Patient'}</Text>
              </View>
              <View style={styles.planDetail}>
                <Text style={styles.detailTitle}>Age:</Text>
                <Text style={styles.detailValue}>{assessmentData.patient?.age || 'N/A'}</Text>
              </View>
              <View style={styles.planDetail}>
                <Text style={styles.detailTitle}>BMI:</Text>
                <Text style={styles.detailValue}>{assessmentData.patientWithDefaults?.bmi?.toFixed(1) || 'N/A'}</Text>
              </View>
            </View>

            {/* Risk Assessment Results */}
            {assessmentData.riskResults && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Risk Assessment</Text>
                
                <View style={styles.riskItem}>
                  <Text style={styles.riskTitle}>ASCVD Risk:</Text>
                  <Text style={[styles.riskValue, { color: getRiskColor(assessmentData.riskResults.ascvd?.category) }]}>
                    {assessmentData.riskResults.ascvd?.risk?.toFixed(1)}% - {assessmentData.riskResults.ascvd?.category}
                  </Text>
                </View>
                
                <View style={styles.riskItem}>
                  <Text style={styles.riskTitle}>Breast Cancer (Gail):</Text>
                  <Text style={[styles.riskValue, { color: getRiskColor(assessmentData.riskResults.gail?.category) }]}>
                    {assessmentData.riskResults.gail?.risk?.toFixed(1)}% - {assessmentData.riskResults.gail?.category}
                  </Text>
                </View>
                
                <View style={styles.riskItem}>
                  <Text style={styles.riskTitle}>VTE (Wells):</Text>
                  <Text style={[styles.riskValue, { color: getRiskColor(assessmentData.riskResults.wells?.category) }]}>
                    Score: {assessmentData.riskResults.wells?.score} - {assessmentData.riskResults.wells?.category}
                  </Text>
                </View>
              </View>
            )}

            {/* Contraindications */}
            {assessmentData.contraindications && assessmentData.contraindications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Contraindications</Text>
                {assessmentData.contraindications.map((contra: any, index: number) => (
                  <View key={index} style={styles.warningItem}>
                    <Text style={styles.warningText}>
                      {contra.condition}: {contra.severity}
                    </Text>
                    <Text style={styles.rationaleText}>{contra.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Treatment Recommendations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Treatment Recommendations</Text>
              {assessmentData.treatmentRecommendation && (
                <View style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>
                    Type: {assessmentData.treatmentRecommendation.type}
                  </Text>
                  <Text style={styles.recommendationText}>
                    Route: {assessmentData.treatmentRecommendation.route}
                  </Text>
                  {assessmentData.treatmentRecommendation.progestogenType && (
                    <Text style={styles.recommendationText}>
                      Progestogen: {assessmentData.treatmentRecommendation.progestogenType}
                    </Text>
                  )}
                  {assessmentData.treatmentRecommendation.rationale && (
                    <View style={styles.rationaleSection}>
                      <Text style={styles.rationaleTitle}>Rationale:</Text>
                      {assessmentData.treatmentRecommendation.rationale.map((rationale: string, index: number) => (
                        <Text key={index} style={styles.rationaleText}>• {rationale}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
              
              {/* Medication Recommendations */}
              {assessmentData.recommendations && assessmentData.recommendations.length > 0 && (
                <View style={styles.medicationSection}>
                  <Text style={styles.rationaleTitle}>Specific Medications:</Text>
                  {assessmentData.recommendations.map((rec: string, index: number) => (
                    <Text key={index} style={styles.rationaleText}>• {rec}</Text>
                  ))}
                </View>
              )}
            </View>

            {/* Clinical Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Clinical Summary</Text>
              <Text style={styles.summaryText}>
                Comprehensive assessment completed with validated risk calculators (ASCVD, Gail, Wells, FRAX). 
                Treatment recommendations based on individual risk profile and current clinical guidelines.
                {assessmentData.contraindications?.length > 0 && ' Contraindications identified and factored into recommendations.'}
              </Text>
            </View>
          </View>
        )}
        
        {route.params?.generatedPlan && (
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>📋 Treatment Plan</Text>
            
            {/* Plan Details */}
            <View style={styles.planDetail}>
              <Text style={styles.detailTitle}>Plan ID:</Text>
              <Text style={styles.detailValue}>{route.params.generatedPlan.id}</Text>
            </View>
            
            <View style={styles.planDetail}>
              <Text style={styles.detailTitle}>Generated:</Text>
              <Text style={styles.detailValue}>
                {new Date(route.params.generatedPlan.generatedAt).toLocaleDateString()}
              </Text>
            </View>
            
            {/* Primary Recommendations */}
            {route.params.generatedPlan.primaryRecommendations && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Primary Recommendations</Text>
                {route.params.generatedPlan.primaryRecommendations.map((rec: any, index: number) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationText}>
                      {index + 1}. {rec.recommendation}
                    </Text>
                    {rec.rationale && (
                      <Text style={styles.rationaleText}>
                        Rationale: {rec.rationale}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            
            {/* Alternative Therapies */}
            {route.params.generatedPlan.alternativeTherapies && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌿 Alternative Therapies</Text>
                {route.params.generatedPlan.alternativeTherapies.map((alt: any, index: number) => (
                  <View key={index} style={styles.alternativeItem}>
                    <Text style={styles.alternativeTitle}>{alt.title}</Text>
                    <Text style={styles.alternativeDescription}>{alt.description}</Text>
                    <Text style={styles.suitabilityText}>
                      Suitability: {alt.suitability}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Interaction Warnings */}
            {route.params.generatedPlan.interactionWarnings && 
             route.params.generatedPlan.interactionWarnings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Interaction Warnings</Text>
                {route.params.generatedPlan.interactionWarnings.map((warning: any, index: number) => (
                  <View key={index} style={styles.warningItem}>
                    <Text style={styles.warningText}>{warning.description}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Clinical Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Clinical Summary</Text>
              <Text style={styles.summaryText}>
                {route.params.generatedPlan.rationale && route.params.generatedPlan.rationale[0] && route.params.generatedPlan.rationale[0].point || 
                 'General menopause management approach with evidence-based recommendations.'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.backHomeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
  },
  planInfo: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  planDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 12,
  },
  recommendationItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rationaleText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  alternativeItem: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  alternativeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alternativeDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  suitabilityText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  warningItem: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  riskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  riskValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  rationaleSection: {
    marginTop: 8,
  },
  rationaleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  medicationSection: {
    marginTop: 12,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  backHomeButton: {
    backgroundColor: '#D81B60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backHomeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});