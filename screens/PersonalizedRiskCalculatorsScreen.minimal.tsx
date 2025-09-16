import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  PersonalizedRiskCalculators: undefined;
};

type PersonalizedRiskCalculatorsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PersonalizedRiskCalculators'>;
};

export default function PersonalizedRiskCalculatorsScreen({ 
  navigation 
}: PersonalizedRiskCalculatorsScreenProps) {
  const [showNewCalculators, setShowNewCalculators] = useState(false);

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
        <Text style={styles.headerTitle}>Risk Calculators</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Personalized Risk Assessment</Text>
          <Text style={styles.introText}>
            Calculate personalized risk scores based on individual patient factors.
            All calculations use validated clinical algorithms.
          </Text>
        </View>

        {/* Test Button for New Calculators */}
        <View style={styles.testSection}>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => setShowNewCalculators(!showNewCalculators)}
          >
            <MaterialIcons name="calculate" size={24} color="#FFF" />
            <Text style={styles.testButtonText}>
              {showNewCalculators ? 'Hide' : 'Show'} New Calculators
            </Text>
          </TouchableOpacity>
        </View>

        {/* New Calculators Section */}
        {showNewCalculators && (
          <View style={styles.newCalculatorsSection}>
            <Text style={styles.sectionTitle}>New Clinical Calculators</Text>
            
            {/* BMI Calculator Card */}
            <View style={styles.calculatorCard}>
              <View style={styles.calculatorHeader}>
                <MaterialIcons name="monitor-weight" size={28} color="#4CAF50" />
                <View style={styles.calculatorTitleSection}>
                  <Text style={styles.calculatorTitle}>BMI Calculator</Text>
                  <Text style={styles.calculatorSubtitle}>Body Mass Index assessment</Text>
                </View>
              </View>
              <Text style={styles.placeholderText}>BMI calculation functionality coming soon...</Text>
            </View>

            {/* BSA Calculator Card */}
            <View style={styles.calculatorCard}>
              <View style={styles.calculatorHeader}>
                <MaterialIcons name="straighten" size={28} color="#2196F3" />
                <View style={styles.calculatorTitleSection}>
                  <Text style={styles.calculatorTitle}>BSA Calculator</Text>
                  <Text style={styles.calculatorSubtitle}>Body Surface Area for drug dosing</Text>
                </View>
              </View>
              <Text style={styles.placeholderText}>BSA calculation functionality coming soon...</Text>
            </View>

            {/* eGFR Calculator Card */}
            <View style={styles.calculatorCard}>
              <View style={styles.calculatorHeader}>
                <MaterialIcons name="water-drop" size={28} color="#FF5722" />
                <View style={styles.calculatorTitleSection}>
                  <Text style={styles.calculatorTitle}>eGFR Calculator</Text>
                  <Text style={styles.calculatorSubtitle}>Kidney function assessment</Text>
                </View>
              </View>
              <Text style={styles.placeholderText}>eGFR calculation functionality coming soon...</Text>
            </View>

            {/* HRT Risk Calculator Card */}
            <View style={styles.calculatorCard}>
              <View style={styles.calculatorHeader}>
                <MaterialIcons name="medical-services" size={28} color="#9C27B0" />
                <View style={styles.calculatorTitleSection}>
                  <Text style={styles.calculatorTitle}>HRT Risk Assessment</Text>
                  <Text style={styles.calculatorSubtitle}>Hormone therapy risk evaluation</Text>
                </View>
              </View>
              <Text style={styles.placeholderText}>HRT risk calculation functionality coming soon...</Text>
            </View>
          </View>
        )}

        {/* Coming Soon Note */}
        <View style={styles.comingSoonSection}>
          <MaterialIcons name="construction" size={32} color="#FF9800" />
          <Text style={styles.comingSoonTitle}>Enhanced Features</Text>
          <Text style={styles.comingSoonText}>
            Dynamic calculations, unit conversions, and comprehensive risk assessments are being implemented.
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
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  introSection: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D81B60',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  newCalculatorsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  calculatorCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  calculatorTitleSection: {
    flex: 1,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  calculatorSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  comingSoonSection: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 30,
  },
});