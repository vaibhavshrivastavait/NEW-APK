import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  PatientList: undefined;
  Demographics: undefined;
};

type PatientIntakeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientIntake'>;

interface Props {
  navigation: PatientIntakeNavigationProp;
}

export default function PatientIntakeScreen({ navigation }: Props) {
  const handleContinue = () => {
    try {
      console.log('=== handleContinue called ===');
      console.log('Starting new assessment...');
      console.log('About to navigate to Demographics screen...');
      navigation.navigate('Demographics');
      console.log('=== Navigation call completed ===');
    } catch (error) {
      console.error('=== Navigation error ===', error);
      alert('Navigation error: ' + error.message);
    }
  };

  const handleLoadExisting = () => {
    navigation.navigate('PatientList');
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
        <Text style={styles.title}>New Assessment</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={32} color="#D81B60" style={styles.infoIcon} />
          <Text style={styles.infoTitle}>MHT Assessment Protocol</Text>
          <Text style={styles.infoDescription}>
            This assessment will evaluate menopausal symptoms, risk factors, and provide evidence-based MHT recommendations following international guidelines.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Assessment Steps</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Patient Demographics</Text>
              <Text style={styles.stepDescription}>Age, height, weight, menopausal status</Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Symptom Assessment</Text>
              <Text style={styles.stepDescription}>VAS scores for menopausal symptoms</Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Risk Factors</Text>
              <Text style={styles.stepDescription}>Medical history and risk assessment</Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Results & Recommendations</Text>
              <Text style={styles.stepDescription}>Evidence-based MHT recommendations</Text>
            </View>
          </View>
        </View>

        <View style={styles.estimatedTime}>
          <MaterialIcons name="access-time" size={20} color="#666" />
          <Text style={styles.estimatedTimeText}>Estimated time: 5-8 minutes</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLoadExisting}>
          <MaterialIcons name="folder-open" size={20} color="#D81B60" />
          <Text style={styles.secondaryButtonText}>Load Existing Patient</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Start New Assessment</Text>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#D81B60',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIcon: {
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  stepsContainer: {
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
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFC1CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D81B60',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    gap: 8,
  },
  estimatedTimeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFC1CC',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#D81B60',
    fontSize: 14,
    fontWeight: '500',
  },
});