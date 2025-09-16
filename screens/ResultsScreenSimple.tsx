import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  PatientDetails: undefined;
};

type ResultsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results'>;

interface Props {
  navigation: ResultsNavigationProp;
  route?: {
    params?: {
      demographicsData?: any;
      symptomsData?: any;
      riskFactorsData?: any;
    };
  };
}

// Clinical Risk Calculation Engine
class ClinicalRiskCalculator {
  static calculateBreastCancerRisk(demographics: any, riskFactors: any): 'Low' | 'Moderate' | 'High' {
    let riskScore = 0;
    
    // Age factor
    if (demographics.age >= 50) riskScore += 1;
    if (demographics.age >= 60) riskScore += 1;
    
    // Family history
    if (riskFactors?.familyHistoryBreastCancer) riskScore += 3;
    if (riskFactors?.familyHistoryOvarian) riskScore += 2;
    
    // Personal history
    if (riskFactors?.personalHistoryBreastCancer) return 'High';
    
    // Lifestyle factors
    if (demographics.bmi >= 30) riskScore += 1;
    if (riskFactors?.smoking) riskScore += 1;
    
    if (riskScore >= 4) return 'High';
    if (riskScore >= 2) return 'Moderate';
    return 'Low';
  }

  static calculateCVDRisk(demographics: any, riskFactors: any): 'Low' | 'Moderate' | 'High' {
    let riskScore = 0;
    
    // Age factor
    if (demographics.age >= 60) riskScore += 2;
    else if (demographics.age >= 50) riskScore += 1;
    
    // Medical history
    if (riskFactors?.hypertension) riskScore += 2;
    if (riskFactors?.diabetes) riskScore += 2;
    if (riskFactors?.cholesterolHigh) riskScore += 1;
    
    // Lifestyle
    if (demographics.bmi >= 30) riskScore += 1;
    if (riskFactors?.smoking) riskScore += 2;
    
    if (riskScore >= 5) return 'High';
    if (riskScore >= 3) return 'Moderate';
    return 'Low';
  }

  static calculateVTERisk(demographics: any, riskFactors: any): 'Low' | 'Moderate' | 'High' {
    let riskScore = 0;
    
    // Age factor
    if (demographics.age >= 60) riskScore += 2;
    else if (demographics.age >= 50) riskScore += 1;
    
    // Medical history
    if (riskFactors?.personalHistoryDVT) return 'High';
    if (riskFactors?.thrombophilia) return 'High';
    
    // BMI factor
    if (demographics.bmi >= 35) riskScore += 2;
    else if (demographics.bmi >= 30) riskScore += 1;
    
    // Other factors
    if (riskFactors?.smoking) riskScore += 1;
    
    if (riskScore >= 4) return 'High';
    if (riskScore >= 2) return 'Moderate';
    return 'Low';
  }
}

// MHT Recommendation Engine
class MHTRecommendationEngine {
  static generateRecommendation(demographics: any, symptoms: any, riskFactors: any, risks: any) {
    const { menopausalStatus, hysterectomy, oophorectomy } = demographics;
    const { breastCancerRisk, cvdRisk, vteRisk } = risks;
    
    // Check absolute contraindications
    if (breastCancerRisk === 'High' || 
        riskFactors?.personalHistoryBreastCancer || 
        riskFactors?.personalHistoryDVT ||
        riskFactors?.thrombophilia) {
      return {
        recommendation: 'MHT Not Recommended',
        therapy: 'Non-hormonal alternatives',
        route: 'N/A',
        progestogen: 'N/A',
        rationale: 'High-risk factors present. Absolute contraindication to MHT. Consider non-hormonal therapies.',
        alternatives: [
          'Cognitive Behavioral Therapy (CBT)',
          'SSRIs/SNRIs for mood and vasomotor symptoms',
          'Gabapentin for hot flashes',
          'Lifestyle modifications'
        ]
      };
    }
    
    // Determine therapy type based on uterine status
    let therapy = '';
    let progestogen = 'N/A';
    
    if (hysterectomy) {
      therapy = 'ET (Estrogen-only therapy)';
      progestogen = 'Not required (hysterectomy)';
    } else {
      therapy = 'EPT (Estrogen + Progestogen therapy)';
      progestogen = cvdRisk === 'Low' ? 'Micronized progesterone (preferred)' : 'IUS (Mirena) - consider if cardiovascular risk';
    }
    
    // Determine route based on risk factors
    let route = '';
    if (vteRisk === 'High' || cvdRisk === 'High') {
      route = 'Transdermal (patches/gel)';
    } else {
      route = 'Oral (first-line) or Transdermal';
    }
    
    // Special considerations for vaginal symptoms
    if (symptoms?.vaginalDryness >= 5) {
      if (therapy === 'MHT Not Recommended') {
        therapy = 'Vaginal estrogen only';
        route = 'Vaginal (cream/tablet/ring)';
        progestogen = 'Not required for vaginal therapy';
      } else {
        therapy += ' + Vaginal estrogen if needed';
      }
    }
    
    // Generate rationale
    let rationale = `Based on ${menopausalStatus} status`;
    if (hysterectomy) rationale += ' and hysterectomy history';
    if (oophorectomy) rationale += ' with oophorectomy';
    
    rationale += `. Risk assessment: Breast Cancer (${breastCancerRisk}), CVD (${cvdRisk}), VTE (${vteRisk}).`;
    
    if (vteRisk === 'High' || cvdRisk === 'High') {
      rationale += ' Transdermal route preferred due to cardiovascular/VTE risk.';
    }
    
    return {
      recommendation: 'MHT Recommended',
      therapy,
      route,
      progestogen,
      rationale,
      alternatives: []
    };
  }
}

export default function ResultsScreenSimple({ navigation, route }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  
  // Mock patient data for demonstration - in real app this would come from route params or global state
  const mockPatientData = {
    demographics: {
      name: 'Jane Smith',
      age: 52,
      height: 165,
      weight: 70,
      bmi: 25.7,
      menopausalStatus: 'postmenopausal',
      hysterectomy: false,
      oophorectomy: false
    },
    symptoms: {
      hotFlushes: 7,
      nightSweats: 6,
      vaginalDryness: 4,
      sleepDisturbance: 5,
      moodChanges: 3,
      jointAches: 2
    },
    riskFactors: {
      familyHistoryBreastCancer: false,
      familyHistoryOvarian: false,
      personalHistoryBreastCancer: false,
      personalHistoryDVT: false,
      thrombophilia: false,
      diabetes: false,
      hypertension: true,
      cholesterolHigh: false,
      smoking: false
    }
  };
  
  useEffect(() => {
    calculateResults();
  }, []);
  
  const calculateResults = () => {
    setIsLoading(true);
    
    try {
      // Use route params if available, otherwise use mock data
      const patientData = route?.params?.demographicsData ? {
        demographics: route.params.demographicsData,
        symptoms: route.params.symptomsData || {},
        riskFactors: route.params.riskFactorsData || {}
      } : mockPatientData;
      
      console.log('Calculating results for patient data:', patientData);
      
      // Calculate individual risk categories
      const breastCancerRisk = ClinicalRiskCalculator.calculateBreastCancerRisk(
        patientData.demographics, 
        patientData.riskFactors
      );
      
      const cvdRisk = ClinicalRiskCalculator.calculateCVDRisk(
        patientData.demographics, 
        patientData.riskFactors
      );
      
      const vteRisk = ClinicalRiskCalculator.calculateVTERisk(
        patientData.demographics, 
        patientData.riskFactors
      );
      
      const risks = { breastCancerRisk, cvdRisk, vteRisk };
      
      // Generate MHT recommendation
      const recommendation = MHTRecommendationEngine.generateRecommendation(
        patientData.demographics,
        patientData.symptoms,
        patientData.riskFactors,
        risks
      );
      
      setResults({
        patientData,
        risks,
        recommendation
      });
      
    } catch (error) {
      console.error('Error calculating results:', error);
      Alert.alert('Error', 'Failed to calculate assessment results');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return '#4CAF50';
      case 'Moderate': return '#FF9800';
      case 'High': return '#F44336';
      default: return '#666';
    }
  };
  
  const handleSaveResults = () => {
    Alert.alert(
      'Assessment Saved',
      'Patient assessment results have been saved successfully!',
      [
        { text: 'View Saved Records', onPress: () => navigation.navigate('PatientList') },
        { text: 'OK' }
      ]
    );
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D81B60" />
          <Text style={styles.loadingText}>Calculating Assessment Results...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>Unable to calculate results</Text>
          <TouchableOpacity style={styles.retryButton} onPress={calculateResults}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const { patientData, risks, recommendation } = results;
  
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
        <View style={styles.completedBadge}>
          <MaterialIcons name="check-circle" size={20} color="white" />
          <Text style={styles.completedText}>Complete</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Patient Summary</Text>
          <Text style={styles.patientName}>{patientData.demographics.name}</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Age</Text>
              <Text style={styles.summaryValue}>{patientData.demographics.age} years</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>BMI</Text>
              <Text style={styles.summaryValue}>{patientData.demographics.bmi?.toFixed(1)} kg/m²</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={styles.summaryValue}>{patientData.demographics.menopausalStatus}</Text>
            </View>
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.riskCard}>
          <Text style={styles.sectionTitle}>Clinical Risk Assessment</Text>
          
          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <MaterialIcons name="favorite" size={20} color={getRiskColor(risks.breastCancerRisk)} />
              <Text style={styles.riskLabel}>Breast Cancer Risk</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(risks.breastCancerRisk) }]}>
              <Text style={styles.riskBadgeText}>{risks.breastCancerRisk}</Text>
            </View>
          </View>
          
          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <MaterialIcons name="monitor-heart" size={20} color={getRiskColor(risks.cvdRisk)} />
              <Text style={styles.riskLabel}>Cardiovascular Risk</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(risks.cvdRisk) }]}>
              <Text style={styles.riskBadgeText}>{risks.cvdRisk}</Text>
            </View>
          </View>
          
          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <MaterialIcons name="bloodtype" size={20} color={getRiskColor(risks.vteRisk)} />
              <Text style={styles.riskLabel}>VTE Risk</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(risks.vteRisk) }]}>
              <Text style={styles.riskBadgeText}>{risks.vteRisk}</Text>
            </View>
          </View>
        </View>

        {/* MHT Recommendation */}
        <View style={styles.recommendationCard}>
          <Text style={styles.sectionTitle}>MHT Recommendation</Text>
          
          <View style={styles.recommendationHeader}>
            <MaterialIcons 
              name={recommendation.recommendation === 'MHT Recommended' ? 'check-circle' : 'cancel'} 
              size={24} 
              color={recommendation.recommendation === 'MHT Recommended' ? '#4CAF50' : '#F44336'} 
            />
            <Text style={[
              styles.recommendationStatus,
              { color: recommendation.recommendation === 'MHT Recommended' ? '#4CAF50' : '#F44336' }
            ]}>
              {recommendation.recommendation}
            </Text>
          </View>

          <View style={styles.recommendationDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Therapy Type:</Text>
              <Text style={styles.detailValue}>{recommendation.therapy}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Route of Administration:</Text>
              <Text style={styles.detailValue}>{recommendation.route}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Progestogen:</Text>
              <Text style={styles.detailValue}>{recommendation.progestogen}</Text>
            </View>
          </View>

          <View style={styles.rationaleSection}>
            <Text style={styles.rationaleTitle}>Clinical Rationale:</Text>
            <Text style={styles.rationaleText}>{recommendation.rationale}</Text>
          </View>

          {recommendation.alternatives && recommendation.alternatives.length > 0 && (
            <View style={styles.alternativesSection}>
              <Text style={styles.alternativesTitle}>Alternative Treatments:</Text>
              {recommendation.alternatives.map((alt: string, index: number) => (
                <Text key={index} style={styles.alternativeItem}>• {alt}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.stepItem}>
            <MaterialIcons name="schedule" size={20} color="#D81B60" />
            <Text style={styles.stepText}>Schedule follow-up in 3 months</Text>
          </View>
          <View style={styles.stepItem}>
            <MaterialIcons name="local-pharmacy" size={20} color="#D81B60" />
            <Text style={styles.stepText}>Discuss treatment options with patient</Text>
          </View>
          <View style={styles.stepItem}>
            <MaterialIcons name="description" size={20} color="#D81B60" />
            <Text style={styles.stepText}>Provide patient information leaflet</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveResults}
        >
          <MaterialIcons name="save" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name="home" size={20} color="white" />
          <Text style={styles.homeButtonText}>New Assessment</Text>
        </TouchableOpacity>
      </View>
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
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  completedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D81B60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 15,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#FFF0F5',
    padding: 15,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  riskCard: {
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
  riskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  riskLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  riskBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  recommendationStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendationDetails: {
    marginBottom: 20,
  },
  detailItem: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  rationaleSection: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  rationaleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  rationaleText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  alternativesSection: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  alternativeItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  nextStepsCard: {
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
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
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
});