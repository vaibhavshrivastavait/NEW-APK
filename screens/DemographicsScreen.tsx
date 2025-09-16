import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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

type DemographicsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Demographics'>;

interface Props {
  navigation: DemographicsNavigationProp;
}

export default function DemographicsScreen({ navigation }: Props) {
  // Access Zustand store
  const { updateCurrentPatient, setCurrentPatient } = useAssessmentStore();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [menopausalStatus, setMenopausalStatus] = useState('postmenopausal');
  const [hysterectomy, setHysterectomy] = useState(false);
  const [oophorectomy, setOophorectomy] = useState(false);
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate BMI
  const calculateBMI = () => {
    if (height && weight) {
      const heightM = parseFloat(height) / 100;
      const weightKg = parseFloat(weight);
      return weightKg / (heightM * heightM);
    }
    return null;
  };

  const bmi = calculateBMI();

  const getBMIStatus = () => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = () => {
    if (!bmi) return '#666';
    if (bmi < 18.5) return '#2196F3';
    if (bmi < 25) return '#4CAF50';
    if (bmi < 30) return '#FF9800';
    return '#F44336';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Patient name is required';
    }
    
    // Age validation
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        newErrors.age = 'Please enter a valid age (18-100)';
      }
    }
    
    // Height validation
    if (!height.trim()) {
      newErrors.height = 'Height is required';
    } else {
      const heightNum = parseFloat(height);
      if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        newErrors.height = 'Please enter a valid height (100-250 cm)';
      }
    }
    
    // Weight validation
    if (!weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
        newErrors.weight = 'Please enter a valid weight (30-300 kg)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    console.log('=== BUTTON CLICKED - handleContinue called ===');
    
    if (isSubmitting) {
      console.log('Already submitting, returning');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Set isSubmitting to true');
    
    // Clear previous errors
    setErrors({});
    console.log('Cleared errors');
    
    // Validate form
    console.log('About to validate form...');
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed, stopping here');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Form is valid, processing data...');
      
      // Calculate BMI
      const heightM = parseFloat(height) / 100;
      const calculatedBmi = parseFloat(weight) / (heightM * heightM);
      
      // Store demographics data in Zustand store
      const demographicsData = {
        id: Date.now().toString(), // Generate unique ID
        name: name.trim(),
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        bmi: calculatedBmi,
        menopausalStatus,
        hysterectomy,
        oophorectomy,
      };
      
      console.log('Demographics data collected:', demographicsData);
      
      // Save to Zustand store
      setCurrentPatient(demographicsData);
      console.log('Demographics data saved to store');
      
      // Navigate directly to symptoms screen
      console.log('Attempting to navigate to Symptoms screen...');
      try {
        navigation.navigate('Symptoms');
        console.log('Navigation.navigate called successfully');
      } catch (navError) {
        console.error('Navigation error:', navError);
        Alert.alert('Navigation Error', 'Failed to navigate to next screen. Please try again.');
      }
      
    } catch (error) {
      console.error('Error processing demographics:', error);
      Alert.alert('Error', 'Failed to process patient information. Please try again.');
    } finally {
      console.log('Setting isSubmitting back to false');
      setIsSubmitting(false);
    }
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
        <Text style={styles.title}>Patient Demographics</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>1/4</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patient Name *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.name && styles.textInputError
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="Enter patient name"
              placeholderTextColor="#999"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.age && styles.textInputError
              ]}
              value={age}
              onChangeText={(text) => {
                setAge(text);
                if (errors.age) {
                  setErrors(prev => ({ ...prev, age: '' }));
                }
              }}
              placeholder="Enter age"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={3}
            />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Height (cm) *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.height && styles.textInputError
                ]}
                value={height}
                onChangeText={(text) => {
                  setHeight(text);
                  if (errors.height) {
                    setErrors(prev => ({ ...prev, height: '' }));
                  }
                }}
                placeholder="e.g., 165"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Weight (kg) *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.weight && styles.textInputError
                ]}
                value={weight}
                onChangeText={(text) => {
                  setWeight(text);
                  if (errors.weight) {
                    setErrors(prev => ({ ...prev, weight: '' }));
                  }
                }}
                placeholder="e.g., 65"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>
          </View>

          {bmi && (
            <View style={styles.bmiCard}>
              <View style={styles.bmiHeader}>
                <MaterialIcons name="calculate" size={20} color="#D81B60" />
                <Text style={styles.bmiTitle}>BMI Calculation</Text>
              </View>
              <View style={styles.bmiContent}>
                <Text style={styles.bmiValue}>{bmi.toFixed(1)} kg/m²</Text>
                <Text style={[styles.bmiStatus, { color: getBMIColor() }]}>
                  {getBMIStatus()}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Menopausal Status</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={menopausalStatus}
                onValueChange={setMenopausalStatus}
                style={styles.picker}
              >
                <Picker.Item label="Premenopausal" value="premenopausal" />
                <Picker.Item label="Perimenopausal" value="perimenopausal" />
                <Picker.Item label="Postmenopausal" value="postmenopausal" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Surgical History</Text>
          
          <TouchableOpacity
            style={[styles.checkboxRow, hysterectomy && styles.checkboxRowSelected]}
            onPress={() => setHysterectomy(!hysterectomy)}
          >
            <MaterialIcons
              name={hysterectomy ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={hysterectomy ? '#D81B60' : '#999'}
            />
            <Text style={[styles.checkboxLabel, hysterectomy && styles.checkboxLabelSelected]}>
              Hysterectomy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkboxRow, oophorectomy && styles.checkboxRowSelected]}
            onPress={() => setOophorectomy(!oophorectomy)}
          >
            <MaterialIcons
              name={oophorectomy ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={oophorectomy ? '#D81B60' : '#999'}
            />
            <Text style={[styles.checkboxLabel, oophorectomy && styles.checkboxLabelSelected]}>
              Oophorectomy
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Add bottom padding to prevent button overlap */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed button container outside of KeyboardAvoidingView to prevent bouncing */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            isSubmitting && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue to Symptoms</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </>
          )}
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
  formCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textInputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  bmiCard: {
    backgroundColor: '#FFF0F5',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  bmiTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D81B60',
  },
  bmiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bmiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bmiStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  checkboxRowSelected: {
    backgroundColor: '#FFF0F5',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  checkboxLabelSelected: {
    color: '#D81B60',
    fontWeight: '500',
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
  continueButtonDisabled: {
    backgroundColor: '#999',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContentContainer: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind fixed button
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSpacer: {
    height: 20,
  },
});