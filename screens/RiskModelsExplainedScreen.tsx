import React from 'react';
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

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RiskModelsExplainedScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            testID="back-button"
          >
            <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Models Explained</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Cardiovascular Risk Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🫀 Cardiovascular Risk</Text>
            
            <View style={styles.modelCard}>
              <Text style={styles.modelTitle}>ASCVD Risk Score</Text>
              <Text style={styles.modelDescription}>
                The ASCVD (Atherosclerotic Cardiovascular Disease) Risk Score estimates your 
                10-year risk of heart attack or stroke. It considers age, cholesterol levels, 
                blood pressure, diabetes, and smoking status.
              </Text>
              <View style={styles.interpretationBox}>
                <Text style={styles.interpretationTitle}>How to Interpret Results:</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#4CAF50'}]}>Low Risk:</Text> Less than 5%</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#FF9800'}]}>Borderline:</Text> 5-7.4%</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#FF9800'}]}>Intermediate:</Text> 7.5-19.9%</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#F44336'}]}>High Risk:</Text> 20% or higher</Text>
              </View>
            </View>

            <View style={styles.modelCard}>
              <Text style={styles.modelTitle}>Framingham Risk Score</Text>
              <Text style={styles.modelDescription}>
                The Framingham Risk Score is a traditional tool that calculates your 10-year 
                risk of coronary heart disease. It's based on data from the Framingham Heart Study 
                and considers age, cholesterol, blood pressure, smoking, and diabetes.
              </Text>
              <View style={styles.interpretationBox}>
                <Text style={styles.interpretationTitle}>How to Interpret Results:</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#4CAF50'}]}>Low Risk:</Text> Less than 10%</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#FF9800'}]}>Intermediate:</Text> 10-20%</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#F44336'}]}>High Risk:</Text> Greater than 20%</Text>
              </View>
            </View>
          </View>

          {/* Breast Cancer Risk Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎗️ Breast Cancer Risk</Text>
            
            <View style={styles.modelCard}>
              <Text style={styles.modelTitle}>Gail Model</Text>
              <Text style={styles.modelDescription}>
                The Gail Model estimates a woman's 5-year and lifetime risk of developing 
                invasive breast cancer. It considers age, race, family history, reproductive 
                history, and previous breast biopsies.
              </Text>
              <View style={styles.interpretationBox}>
                <Text style={styles.interpretationTitle}>How to Interpret Results:</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#4CAF50'}]}>Average Risk:</Text> Less than 1.7% (5-year)</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#FF9800'}]}>Moderate Risk:</Text> 1.7-3.0% (5-year)</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#F44336'}]}>High Risk:</Text> Greater than 3.0% (5-year)</Text>
              </View>
            </View>

            <View style={styles.modelCard}>
              <Text style={styles.modelTitle}>Tyrer-Cuzick Model</Text>
              <Text style={styles.modelDescription}>
                The Tyrer-Cuzick Model provides a more comprehensive assessment of breast cancer 
                risk over 10 years. It includes detailed family history, genetic factors, and 
                hormonal influences, making it more accurate for women with family history.
              </Text>
              <View style={styles.interpretationBox}>
                <Text style={styles.interpretationTitle}>How to Interpret Results:</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#4CAF50'}]}>Low Risk:</Text> Less than 5% (10-year)</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#FF9800'}]}>Moderate Risk:</Text> 5-8% (10-year)</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#F44336'}]}>High Risk:</Text> Greater than 8% (10-year)</Text>
              </View>
            </View>
          </View>

          {/* VTE Risk Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🩸 VTE (Thrombosis) Risk</Text>
            
            <View style={styles.modelCard}>
              <Text style={styles.modelTitle}>Wells Score</Text>
              <Text style={styles.modelDescription}>
                The Wells Score helps assess the probability of pulmonary embolism (blood clot in the lungs). 
                It considers clinical signs, symptoms, risk factors like immobilization, surgery, 
                and previous history of blood clots.
              </Text>
              <View style={styles.interpretationBox}>
                <Text style={styles.interpretationTitle}>How to Interpret Results:</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#4CAF50'}]}>Low Risk:</Text> Score 0-4 points</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#FF9800'}]}>Moderate Risk:</Text> Score 4.5-6 points</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#F44336'}]}>High Risk:</Text> Score greater than 6 points</Text>
              </View>
            </View>
          </View>

          {/* Osteoporosis Risk Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🦴 Osteoporosis Risk</Text>
            
            <View style={styles.modelCard}>
              <Text style={styles.modelTitle}>FRAX 10-year Fracture Risk</Text>
              <Text style={styles.modelDescription}>
                FRAX (Fracture Risk Assessment Tool) calculates the 10-year probability of 
                major osteoporotic fractures (spine, forearm, hip, or shoulder). It considers 
                age, gender, weight, height, previous fractures, family history, and lifestyle factors.
              </Text>
              <View style={styles.interpretationBox}>
                <Text style={styles.interpretationTitle}>How to Interpret Results:</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#4CAF50'}]}>Low Risk:</Text> Less than 10% (10-year)</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#FF9800'}]}>Moderate Risk:</Text> 10-20% (10-year)</Text>
                <Text style={styles.interpretationItem}>• <Text style={[styles.riskLevel, {color: '#F44336'}]}>High Risk:</Text> Greater than 20% (10-year)</Text>
              </View>
            </View>
          </View>

          {/* Important Note */}
          <View style={styles.noteSection}>
            <MaterialIcons name="info" size={24} color="#D81B60" />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Important Note</Text>
              <Text style={styles.noteText}>
                These risk calculators are clinical tools designed to support medical decision-making. 
                Results should always be interpreted by qualified healthcare professionals in the context 
                of your complete medical history and individual circumstances.
              </Text>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
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
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 15,
    textAlign: 'center',
  },
  modelCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#D81B60',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 10,
  },
  modelDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  interpretationBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  interpretationItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  riskLevel: {
    fontWeight: 'bold',
  },
  noteSection: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  noteContent: {
    flex: 1,
    marginLeft: 15,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 30,
  },
});