import React, { useState, useMemo } from 'react';
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

type SymptomsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Symptoms'>;

interface Props {
  navigation: SymptomsNavigationProp;
}

const symptoms = [
  { key: 'hotFlushes', label: 'Hot flashes', icon: 'local-fire-department' },
  { key: 'nightSweats', label: 'Night sweats', icon: 'bedtime' },
  { key: 'vaginalDryness', label: 'Vaginal dryness', icon: 'health-and-safety' },
  { key: 'sleepDisturbance', label: 'Sleep disturbance', icon: 'hotel' },
  { key: 'moodChanges', label: 'Mood changes/irritability', icon: 'mood' },
  { key: 'jointAches', label: 'Joint aches/stiffness', icon: 'accessibility' },
];

export default function SymptomsScreen({ navigation }: Props) {
  // Access Zustand store
  const { updateCurrentPatient } = useAssessmentStore();
  
  const [symptomRatings, setSymptomRatings] = useState<Record<string, number>>({
    hotFlushes: 0,
    nightSweats: 0,
    vaginalDryness: 0,
    sleepDisturbance: 0,
    moodChanges: 0,
    jointAches: 0,
  });

  // Memoize summary calculations to prevent continuous re-renders
  const summaryStats = useMemo(() => {
    const ratedCount = Object.values(symptomRatings).filter(rating => rating > 0).length;
    const totalSymptoms = symptoms.length;
    const averageSeverity = ratedCount > 0 
      ? (Object.values(symptomRatings).reduce((a, b) => a + b, 0) / totalSymptoms).toFixed(1)
      : '0.0';
    
    return {
      ratedCount,
      totalSymptoms,
      averageSeverity
    };
  }, [symptomRatings]);

  const handleRatingChange = (symptomKey: string, rating: number) => {
    setSymptomRatings(prev => ({
      ...prev,
      [symptomKey]: rating
    }));
  };

  const handleContinue = () => {
    // Use memoized summary values
    console.log('Symptoms data collected:', symptomRatings);
    console.log('Average severity:', summaryStats.averageSeverity);
    
    // Update patient data in store with symptoms
    updateCurrentPatient(symptomRatings);
    console.log('Symptoms data saved to store');
    
    console.log('Navigating to Risk Factors screen...');
    
    // Navigate to risk factors screen
    navigation.navigate('RiskFactors');
  };

  const renderRatingScale = (symptomKey: string) => {
    const currentRating = symptomRatings[symptomKey] || 0;
    
    return (
      <View style={styles.ratingContainer}>
        <View style={styles.ratingLabels}>
          <Text style={styles.ratingLabel}>None</Text>
          <Text style={styles.ratingLabel}>Severe</Text>
        </View>
        <View style={styles.ratingButtons}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                currentRating === rating && styles.ratingButtonActive
              ]}
              onPress={() => handleRatingChange(symptomKey, rating)}
            >
              <Text style={[
                styles.ratingButtonText,
                currentRating === rating && styles.ratingButtonTextActive
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

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
        <Text style={styles.title}>Symptom Assessment</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>2/4</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.instructionsCard}>
          <MaterialIcons name="info" size={24} color="#D81B60" />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>Rate Your Symptoms</Text>
            <Text style={styles.instructionsSubtitle}>
              Please rate each symptom from 0 (none) to 10 (severe) based on how you've been feeling over the past 4 weeks.
            </Text>
          </View>
        </View>

        {symptoms.map((symptom) => (
          <View key={symptom.key} style={styles.symptomCard}>
            <View style={styles.symptomHeader}>
              <MaterialIcons name={symptom.icon as any} size={24} color="#D81B60" />
              <Text style={styles.symptomLabel}>{symptom.label}</Text>
            </View>
            {renderRatingScale(symptom.key)}
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Assessment Summary</Text>
          <Text style={styles.summaryText}>
            Total symptoms rated: {summaryStats.ratedCount}/{summaryStats.totalSymptoms}
          </Text>
          <Text style={styles.summaryText}>
            Average severity: {summaryStats.averageSeverity}
          </Text>
        </View>
        
        {/* Add bottom padding to prevent button overlap */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed button container outside of KeyboardAvoidingView to prevent bouncing */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Risk Factors</Text>
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
  symptomCard: {
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
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  symptomLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ratingButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
  },
  ratingButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  ratingButtonTextActive: {
    color: 'white',
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