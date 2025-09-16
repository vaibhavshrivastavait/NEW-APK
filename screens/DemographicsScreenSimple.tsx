import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  PatientList: undefined;
  Demographics: undefined;
  Symptoms: undefined;
  Cme: undefined;
  Guidelines: undefined;
};

type DemographicsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Demographics'>;

interface Props {
  navigation: DemographicsNavigationProp;
}

export default function DemographicsScreenSimple({ navigation }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [menopausalStatus, setMenopausalStatus] = useState('postmenopausal');
  const [hysterectomy, setHysterectomy] = useState(false);
  const [oophorectomy, setOophorectomy] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateBMI = () => {
    if (!height || !weight) return null;
    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    if (isNaN(heightM) || isNaN(weightKg) || heightM <= 0 || weightKg <= 0) return null;
    return weightKg / (heightM * heightM);
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return '#2196F3'; // Blue for underweight
    if (bmi >= 18.5 && bmi <= 24.9) return '#4CAF50'; // Green for normal
    if (bmi >= 25 && bmi <= 29.9) return '#FF9800'; // Orange for overweight
    if (bmi >= 30) return '#F44336'; // Red for obese
    return '#666';
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

  const handleContinue = () => {
    console.log('=== CONTINUE TO SYMPTOMS BUTTON CLICKED ===');
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Clear previous errors and validate
    setErrors({});
    const isValid = validateForm();
    
    if (!isValid) {
      console.log('Form validation failed - showing inline errors');
      setIsSubmitting(false);
      return;
    }

    // All validation passed - collect patient data and navigate to Symptoms
    console.log('All validations passed - collecting patient data and navigating to Symptoms');
    
    try {
      // Calculate BMI
      const heightM = parseFloat(height) / 100;
      const bmi = parseFloat(weight) / (heightM * heightM);
      
      // Prepare complete demographics data
      const demographicsData = {
        name: name.trim(),
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        bmi: bmi,
        bmiCategory: getBMICategory(bmi),
        menopausalStatus,
        hysterectomy,
        oophorectomy,
      };
      
      console.log('Patient demographics data:', demographicsData);
      
      // Navigate to Symptoms screen with patient data
      navigation.navigate('Symptoms', { demographicsData });
      
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to symptoms screen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Patient Demographics (Full Version)</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Patient Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) {
              setErrors(prev => ({ ...prev, name: '' }));
            }
          }}
          placeholder="Enter patient name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Age *</Text>
        <TextInput
          style={[styles.input, errors.age && styles.inputError]}
          value={age}
          onChangeText={(text) => {
            setAge(text);
            if (errors.age) {
              setErrors(prev => ({ ...prev, age: '' }));
            }
          }}
          placeholder="Enter age"
          keyboardType="numeric"
        />
        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

        <Text style={styles.label}>Height (cm) *</Text>
        <TextInput
          style={[styles.input, errors.height && styles.inputError]}
          value={height}
          onChangeText={(text) => {
            setHeight(text);
            if (errors.height) {
              setErrors(prev => ({ ...prev, height: '' }));
            }
          }}
          placeholder="e.g., 165"
          keyboardType="numeric"
        />
        {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}

        <Text style={styles.label}>Weight (kg) *</Text>
        <TextInput
          style={[styles.input, errors.weight && styles.inputError]}
          value={weight}
          onChangeText={(text) => {
            setWeight(text);
            if (errors.weight) {
              setErrors(prev => ({ ...prev, weight: '' }));
            }
          }}
          placeholder="e.g., 65"
          keyboardType="numeric"
        />
        {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}

        {calculateBMI() && (
          <View style={[styles.bmiCard, { borderLeftColor: getBMIColor(calculateBMI()!) }]}>
            <Text style={[styles.bmiLabel, { color: getBMIColor(calculateBMI()!) }]}>
              BMI: {calculateBMI()!.toFixed(1)} kg/m² — {getBMICategory(calculateBMI()!)}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Menopausal Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={menopausalStatus}
            onValueChange={(itemValue) => setMenopausalStatus(itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="Premenopausal" value="premenopausal" />
            <Picker.Item label="Perimenopausal" value="perimenopausal" />
            <Picker.Item label="Postmenopausal" value="postmenopausal" />
          </Picker>
        </View>

        <Text style={styles.label}>Surgical History</Text>
        
        <TouchableOpacity 
          style={styles.checkboxRow} 
          onPress={() => setHysterectomy(!hysterectomy)}
        >
          <MaterialIcons 
            name={hysterectomy ? "check-box" : "check-box-outline-blank"} 
            size={24} 
            color="#D81B60" 
          />
          <Text style={styles.checkboxLabel}>Hysterectomy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.checkboxRow} 
          onPress={() => setOophorectomy(!oophorectomy)}
        >
          <MaterialIcons 
            name={oophorectomy ? "check-box" : "check-box-outline-blank"} 
            size={24} 
            color="#D81B60" 
          />
          <Text style={styles.checkboxLabel}>Oophorectomy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isSubmitting && styles.buttonDisabled]} 
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.buttonText}>Processing...</Text>
          ) : (
            <Text style={styles.buttonText}>Continue to Symptoms</Text>
          )}
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
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
  },
  bmiCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50', // Default, will be overridden
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50', // Default, will be overridden
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 5,
  },
  picker: {
    height: 50,
    color: '#333',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#D81B60',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});