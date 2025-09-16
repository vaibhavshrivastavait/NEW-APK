import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

// Working MHT Assessment without problematic dependencies
export default function MHTAssessmentWorking() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [patients, setPatients] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 52,
      status: 'Assessment Complete',
      riskLevel: 'LOW'
    },
    {
      id: '2', 
      name: 'Maria Rodriguez',
      age: 58,
      status: 'Follow-up Required',
      riskLevel: 'MODERATE'
    }
  ]);
  const [assessmentData, setAssessmentData] = useState({
    patientName: '',
    age: '',
  });

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏥 MHT Assessment</Text>
        <Text style={styles.subtitle}>Clinical Decision Support System</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Professional Clinical Assessment</Text>
          <Text style={styles.welcomeText}>
            Evidence-based menopause hormone therapy assessment following IMS/NAMS guidelines.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{patients.length}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>150+</Text>
            <Text style={styles.statLabel}>Drug Interactions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Risk Models</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => setCurrentScreen('assessment')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.primaryButtonText}>Start New Assessment</Text>
            <Text style={styles.actionSubtext}>Begin comprehensive evaluation</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('patients')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.secondaryButtonText}>Patient Records</Text>
            <Text style={styles.actionSubtext}>View saved assessments</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('drugchecker')}
          >
            <Text style={styles.actionIcon}>💊</Text>
            <Text style={styles.secondaryButtonText}>Drug Interaction Checker</Text>
            <Text style={styles.actionSubtext}>Analyze HRT interactions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('calculators')}
          >
            <Text style={styles.actionIcon}>🧮</Text>
            <Text style={styles.secondaryButtonText}>Risk Calculators</Text>
            <Text style={styles.actionSubtext}>ASCVD, FRAX, Framingham</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('cme')}
          >
            <Text style={styles.actionIcon}>🎓</Text>
            <Text style={styles.secondaryButtonText}>CME Education</Text>
            <Text style={styles.actionSubtext}>Interactive learning</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('guidelines')}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.secondaryButtonText}>Clinical Guidelines</Text>
            <Text style={styles.actionSubtext}>IMS/NAMS recommendations</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderPatientRecords = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Patient Records</Text>
        <Text style={styles.subtitle}>{patients.length} Total Patients</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            placeholderTextColor="#999"
          />
        </View>
        
        {patients.map(patient => (
          <TouchableOpacity
            key={patient.id}
            style={styles.patientCard}
            onPress={() => Alert.alert('Patient Details', `${patient.name}, Age: ${patient.age}`)}
          >
            <View style={styles.patientHeader}>
              <View>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientAge}>Age: {patient.age}</Text>
              </View>
              <View style={[
                styles.riskBadge,
                { backgroundColor: patient.riskLevel === 'LOW' ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.riskBadgeText}>{patient.riskLevel}</Text>
              </View>
            </View>
            <Text style={styles.patientStatus}>Status: {patient.status}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={styles.addPatientButton}
          onPress={() => setCurrentScreen('assessment')}
        >
          <Text style={styles.addPatientText}>+ Add New Patient</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderAssessment = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Patient Assessment</Text>
        <Text style={styles.subtitle}>Demographics</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Patient Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient Name</Text>
            <TextInput
              style={styles.textInput}
              value={assessmentData.patientName}
              onChangeText={(text) => setAssessmentData(prev => ({ ...prev, patientName: text }))}
              placeholder="Enter patient name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              value={assessmentData.age}
              onChangeText={(text) => setAssessmentData(prev => ({ ...prev, age: text }))}
              placeholder="Enter age"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => {
              if (assessmentData.patientName && assessmentData.age) {
                Alert.alert('Assessment', 'Full assessment workflow available in mobile app!');
              } else {
                Alert.alert('Required Fields', 'Please fill in all fields');
              }
            }}
          >
            <Text style={styles.continueButtonText}>Continue Assessment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderDrugChecker = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Drug Interaction Checker</Text>
        <Text style={styles.subtitle}>HRT Drug Analysis</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Advanced Drug Interaction Analysis</Text>
          <Text style={styles.featureDescription}>
            Comprehensive database of 150+ HRT drug interactions with clinical significance ratings.
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Evidence-based interaction analysis</Text>
            <Text style={styles.featureItem}>• Clinical severity ratings (LOW/MODERATE/HIGH)</Text>
            <Text style={styles.featureItem}>• Mechanism and rationale explanations</Text>
            <Text style={styles.featureItem}>• Recommended clinical actions</Text>
          </View>
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => Alert.alert('Drug Checker', 'Full interaction checker available in mobile app!')}
          >
            <Text style={styles.featureButtonText}>Launch Drug Checker</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderCMEScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CME Education</Text>
        <Text style={styles.subtitle}>Continuing Medical Education</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Professional Development</Text>
          <Text style={styles.featureDescription}>
            Comprehensive learning modules for menopause hormone therapy education with interactive content.
          </Text>
          
          <View style={styles.modulesList}>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 1: HRT Fundamentals</Text>
              <Text style={styles.moduleStatus}>✓ Available</Text>
            </View>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 2: Risk Assessment</Text>
              <Text style={styles.moduleStatus}>✓ Available</Text>
            </View>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 3: Drug Interactions</Text>
              <Text style={styles.moduleStatus}>✓ Available</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => Alert.alert('CME Modules', 'Full interactive learning modules available in mobile app!')}
          >
            <Text style={styles.featureButtonText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderGuidelinesScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Clinical Guidelines</Text>
        <Text style={styles.subtitle}>IMS/NAMS Recommendations</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Evidence-Based Clinical Guidelines</Text>
          <Text style={styles.featureDescription}>
            Complete clinical guidelines following IMS/NAMS 2022 recommendations for menopause hormone therapy.
          </Text>
          
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineTitle}>✓ Patient Assessment Protocols</Text>
              <Text style={styles.guidelineDesc}>Comprehensive evaluation procedures</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineTitle}>✓ Risk Stratification Guidelines</Text>
              <Text style={styles.guidelineDesc}>Evidence-based risk assessment</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineTitle}>✓ Treatment Recommendations</Text>
              <Text style={styles.guidelineDesc}>Personalized therapy protocols</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => Alert.alert('Guidelines', 'Complete clinical guidelines available in mobile app!')}
          >
            <Text style={styles.featureButtonText}>View Guidelines</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderRiskCalculators = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Risk Calculators</Text>
        <Text style={styles.subtitle}>Clinical Assessment Tools</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Professional Risk Assessment</Text>
          <Text style={styles.featureDescription}>
            Evidence-based risk calculators for comprehensive patient evaluation.
          </Text>
          
          <View style={styles.calculatorsList}>
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorIcon}>🫀</Text>
              <Text style={styles.calculatorTitle}>ASCVD Risk Calculator</Text>
              <Text style={styles.calculatorDesc}>10-year cardiovascular disease risk</Text>
            </View>
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorIcon}>🦴</Text>
              <Text style={styles.calculatorTitle}>FRAX Bone Health</Text>
              <Text style={styles.calculatorDesc}>Osteoporotic fracture probability</Text>
            </View>
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorIcon}>🎯</Text>
              <Text style={styles.calculatorTitle}>Framingham Score</Text>
              <Text style={styles.calculatorDesc}>Traditional risk assessment</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => Alert.alert('Risk Calculators', 'Full interactive calculators available in mobile app!')}
          >
            <Text style={styles.featureButtonText}>Launch Calculators</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'patients': return renderPatientRecords();
      case 'assessment': return renderAssessment();
      case 'drugchecker': return renderDrugChecker();
      case 'calculators': return renderRiskCalculators();
      case 'cme': return renderCMEScreen();
      case 'guidelines': return renderGuidelinesScreen();
      default: return renderHomeScreen();
    }
  };

  return renderCurrentScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFC1CC',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 55,
  },
  backText: {
    color: '#D81B60',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#D81B60',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFC1CC',
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#D81B60',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
  },
  patientCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    elevation: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  patientAge: {
    fontSize: 14,
    color: '#666',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  riskBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  patientStatus: {
    fontSize: 14,
    color: '#666',
  },
  addPatientButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addPatientText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  continueButton: {
    backgroundColor: '#D81B60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  featureButton: {
    backgroundColor: '#D81B60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  featureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});