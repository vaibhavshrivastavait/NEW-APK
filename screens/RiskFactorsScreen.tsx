import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useAssessmentStore from '../store/assessmentStore';

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

type RiskFactorsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RiskFactors'>;

interface Props {
  navigation: RiskFactorsNavigationProp;
}

const riskFactors = [
  { key: 'familyHistoryBreastCancer', label: 'Family history of breast cancer', category: 'Family History' },
  { key: 'familyHistoryOvarian', label: 'Family history of ovarian cancer', category: 'Family History' },
  { key: 'personalHistoryBreastCancer', label: 'Personal history of breast cancer', category: 'Medical History' },
  { key: 'personalHistoryDVT', label: 'History of DVT/PE (blood clots)', category: 'Medical History' },
  { key: 'thrombophilia', label: 'Thrombophilia (clotting disorder)', category: 'Medical History' },
  { key: 'diabetes', label: 'Diabetes', category: 'Medical History' },
  { key: 'hypertension', label: 'Hypertension (high blood pressure)', category: 'Medical History' },
  { key: 'cholesterolHigh', label: 'High cholesterol', category: 'Medical History' },
  { key: 'smoking', label: 'Current smoking', category: 'Lifestyle' },
];

export default function RiskFactorsScreen({ navigation }: Props) {
  // Access Zustand store
  const { updateCurrentPatient } = useAssessmentStore();
  
  const [selectedRiskFactors, setSelectedRiskFactors] = useState<Record<string, boolean>>({
    familyHistoryBreastCancer: false,
    familyHistoryOvarian: false,
    personalHistoryBreastCancer: false,
    personalHistoryDVT: false,
    thrombophilia: false,
    diabetes: false,
    hypertension: false,
    cholesterolHigh: false,
    smoking: false,
  });

  const handleRiskFactorToggle = (factorKey: string) => {
    setSelectedRiskFactors(prev => ({
      ...prev,
      [factorKey]: !prev[factorKey]
    }));
  };

  const handleContinue = () => {
    // Calculate summary
    const selectedCount = Object.values(selectedRiskFactors).filter(Boolean).length;
    
    console.log('Risk factors data collected:', selectedRiskFactors);
    console.log('Selected risk factors count:', selectedCount);
    
    // Update patient data in store with risk factors
    updateCurrentPatient(selectedRiskFactors);
    console.log('Risk factors data saved to store');
    
    console.log('Navigating to Results screen...');
    
    // Navigate to results screen - Results will handle missing data with defaults
    navigation.navigate('Results');
  };

  const groupedFactors = riskFactors.reduce((acc, factor) => {
    if (!acc[factor.category]) {
      acc[factor.category] = [];
    }
    acc[factor.category].push(factor);
    return acc;
  }, {} as Record<string, typeof riskFactors>);

  const selectedCount = Object.values(selectedRiskFactors).filter(Boolean).length;

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
        <Text style={styles.title}>Risk Factors</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>3/4</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.instructionsCard}>
          <MaterialIcons name="warning" size={24} color="#D81B60" />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>Risk Assessment</Text>
            <Text style={styles.instructionsSubtitle}>
              Please select all risk factors that apply to your patient. This will help determine the most appropriate MHT recommendations.
            </Text>
          </View>
        </View>

        {Object.entries(groupedFactors).map(([category, factors]) => (
          <View key={category} style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {factors.map((factor) => (
              <TouchableOpacity
                key={factor.key}
                style={[
                  styles.factorRow,
                  selectedRiskFactors[factor.key] && styles.factorRowSelected
                ]}
                onPress={() => handleRiskFactorToggle(factor.key)}
              >
                <MaterialIcons
                  name={selectedRiskFactors[factor.key] ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={selectedRiskFactors[factor.key] ? '#D81B60' : '#999'}
                />
                <Text style={[
                  styles.factorLabel,
                  selectedRiskFactors[factor.key] && styles.factorLabelSelected
                ]}>
                  {factor.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Risk Assessment Summary</Text>
          <Text style={styles.summaryText}>
            Selected risk factors: {selectedCount}
          </Text>
          <Text style={styles.summarySubtext}>
            {selectedCount === 0 
              ? 'No contraindications identified'
              : `${selectedCount} risk factor${selectedCount > 1 ? 's' : ''} identified`
            }
          </Text>
        </View>
        
        {/* Add bottom padding to prevent button overlap */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed button container outside of KeyboardAvoidingView to prevent bouncing */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>View Results & Recommendations</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
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
  flex1: {
    flex: 1,
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
  stepIndicator: {
    backgroundColor: '#FFC1CC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D81B60',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  bottomSpacer: {
    height: 80, // Ensure content doesn't get hidden behind fixed button
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 15,
  },
  instructionsText: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 8,
  },
  instructionsSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  categoryCard: {
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
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 15,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  factorRowSelected: {
    backgroundColor: '#FFF0F5',
  },
  factorLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  factorLabelSelected: {
    color: '#D81B60',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC1CC',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  summarySubtext: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
  },
  continueButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});