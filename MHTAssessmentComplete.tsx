import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Note: We'll integrate full screens gradually to avoid the "reduce" error
// For now, using safe implementations

// Mock navigation object
const createMockNavigation = (setCurrentScreen: (screen: string) => void) => ({
  navigate: (screen: string, params?: any) => {
    console.log(`Navigating to: ${screen}`, params);
    setCurrentScreen(screen.toLowerCase());
  },
  goBack: () => {
    setCurrentScreen('home');
  },
  canGoBack: () => true,
  reset: () => {
    setCurrentScreen('home');
  },
  setParams: () => {},
  setOptions: () => {},
});

// Complete MHT Assessment with actual screen integration
export default function MHTAssessmentComplete() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = createMockNavigation(setCurrentScreen);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return renderHomeScreen();
      
      case 'patientlist':
        return renderPatientListScreen();
      
      case 'demographics':
        return renderDemographicsScreen();
      
      case 'symptoms':
        return renderSymptomsScreen();
      
      case 'riskfactors':
        return renderRiskFactorsScreen();
      
      case 'results':
        return renderResultsScreen();
      
      case 'cme':
        return renderCMEScreen();
      
      case 'guidelines':
        return renderGuidelinesScreen();
      
      case 'decisionsupport':
        return renderDecisionSupportScreen();
      
      case 'patientintake':
        return renderPatientIntakeScreen();
      
      case 'personalizedriskcalculators':
        return renderRiskCalculatorsScreen();
      
      case 'riskmodelsexplained':
        return renderRiskModelsScreen();
      
      case 'about':
        return renderAboutScreen();
      
      default:
        return renderHomeScreen();
    }
  };

  const renderHomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="medical-services" size={40} color="#D81B60" />
          </View>
          <Text style={styles.title}>MHT Assessment</Text>
          <Text style={styles.subtitle}>Menopausal Hormone Therapy Assessment Tool</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Professional Clinical Assessment</Text>
          <Text style={styles.featuresDescription}>
            Comprehensive risk stratification and evidence-based MHT recommendations following IMS/NAMS guidelines
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => setCurrentScreen('patientintake')}
          >
            <MaterialIcons name="assignment" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Start New Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('patientlist')}
          >
            <MaterialIcons name="people" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Patient Records</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('guidelines')}
          >
            <MaterialIcons name="book" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>MHT Guidelines</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('cme')}
          >
            <MaterialIcons name="school" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>CME Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('riskmodelsexplained')}
          >
            <MaterialIcons name="info" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Risk Models Explained</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('personalizedriskcalculators')}
          >
            <MaterialIcons name="calculate" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Personalized Risk Calculators</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('decisionsupport')}
          >
            <MaterialIcons name="support" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>Drug Interaction Checker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setCurrentScreen('about')}
          >
            <MaterialIcons name="info" size={24} color="#D81B60" />
            <Text style={styles.secondaryButtonText}>About</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Evidence-based drug interaction checking for menopausal care
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderPatientListScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Patient Records</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Patient Management System</Text>
          <Text style={styles.featureDescription}>
            Advanced patient record management with search, filtering, and comprehensive assessment tracking.
          </Text>
          
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Patient search and filtering</Text>
            <Text style={styles.featureItem}>• Assessment history tracking</Text>
            <Text style={styles.featureItem}>• Risk level categorization</Text>
            <Text style={styles.featureItem}>• Follow-up scheduling</Text>
            <Text style={styles.featureItem}>• Data export capabilities</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setCurrentScreen('demographics')}
          >
            <MaterialIcons name="person-add" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Add New Patient</Text>
          </TouchableOpacity>
          
          <Text style={styles.comingSoonText}>
            Full patient management features available in mobile app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderDemographicsScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Patient Demographics</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>1/4</Text>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Comprehensive Patient Assessment</Text>
          <Text style={styles.featureDescription}>
            Interactive demographics collection with real-time BMI calculation and validation.
          </Text>
          
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Patient information collection</Text>
            <Text style={styles.featureItem}>• Real-time BMI calculation</Text>
            <Text style={styles.featureItem}>• Menopausal status assessment</Text>
            <Text style={styles.featureItem}>• Surgical history tracking</Text>
            <Text style={styles.featureItem}>• Form validation and error handling</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setCurrentScreen('symptoms')}
          >
            <Text style={styles.primaryButtonText}>Continue to Symptoms</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.comingSoonText}>
            Full interactive form available in mobile app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderSymptomsScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('demographics')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Symptom Assessment</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>2/4</Text>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Interactive VAS Rating Scales</Text>
          <Text style={styles.featureDescription}>
            Comprehensive symptom evaluation using Visual Analog Scales (0-10) for precise clinical assessment.
          </Text>
          
          <View style={styles.symptomsList}>
            <View style={styles.symptomItem}>
              <MaterialIcons name="local-fire-department" size={20} color="#FF5722" />
              <Text style={styles.symptomLabel}>Hot flashes</Text>
            </View>
            <View style={styles.symptomItem}>
              <MaterialIcons name="bedtime" size={20} color="#3F51B5" />
              <Text style={styles.symptomLabel}>Night sweats</Text>
            </View>
            <View style={styles.symptomItem}>
              <MaterialIcons name="health-and-safety" size={20} color="#E91E63" />
              <Text style={styles.symptomLabel}>Vaginal dryness</Text>
            </View>
            <View style={styles.symptomItem}>
              <MaterialIcons name="hotel" size={20} color="#9C27B0" />
              <Text style={styles.symptomLabel}>Sleep disturbance</Text>
            </View>
            <View style={styles.symptomItem}>
              <MaterialIcons name="mood" size={20} color="#FF9800" />
              <Text style={styles.symptomLabel}>Mood changes</Text>
            </View>
            <View style={styles.symptomItem}>
              <MaterialIcons name="accessibility" size={20} color="#795548" />
              <Text style={styles.symptomLabel}>Joint aches</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setCurrentScreen('riskfactors')}
          >
            <Text style={styles.primaryButtonText}>Continue to Risk Factors</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.comingSoonText}>
            Interactive VAS scales available in mobile app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderRiskFactorsScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('symptoms')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Risk Factors</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>3/4</Text>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Comprehensive Risk Assessment</Text>
          <Text style={styles.featureDescription}>
            Evidence-based risk factor evaluation for personalized treatment recommendations.
          </Text>
          
          <View style={styles.riskCategoriesList}>
            <View style={styles.riskCategory}>
              <Text style={styles.riskCategoryTitle}>Family History</Text>
              <Text style={styles.riskCategoryDesc}>Breast cancer, ovarian cancer history</Text>
            </View>
            <View style={styles.riskCategory}>
              <Text style={styles.riskCategoryTitle}>Medical History</Text>
              <Text style={styles.riskCategoryDesc}>Personal medical conditions and history</Text>
            </View>
            <View style={styles.riskCategory}>
              <Text style={styles.riskCategoryTitle}>Lifestyle Factors</Text>
              <Text style={styles.riskCategoryDesc}>Smoking, diet, exercise patterns</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setCurrentScreen('results')}
          >
            <Text style={styles.primaryButtonText}>View Results & Recommendations</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.comingSoonText}>
            Interactive risk factor assessment available in mobile app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderResultsScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('riskfactors')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Assessment Results</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>4/4</Text>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Comprehensive Results & Recommendations</Text>
          <Text style={styles.featureDescription}>
            Evidence-based risk stratification with personalized MHT recommendations and treatment plans.
          </Text>
          
          <View style={styles.resultsSummary}>
            <View style={styles.resultItem}>
              <MaterialIcons name="assessment" size={24} color="#4CAF50" />
              <Text style={styles.resultLabel}>Risk Stratification</Text>
              <Text style={styles.resultValue}>Complete Analysis</Text>
            </View>
            <View style={styles.resultItem}>
              <MaterialIcons name="medication" size={24} color="#2196F3" />
              <Text style={styles.resultLabel}>Treatment Plan</Text>
              <Text style={styles.resultValue}>Personalized</Text>
            </View>
            <View style={styles.resultItem}>
              <MaterialIcons name="warning" size={24} color="#FF9800" />
              <Text style={styles.resultLabel}>Drug Interactions</Text>
              <Text style={styles.resultValue}>Checked</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => Alert.alert('Export', 'PDF export available in mobile app')}
            >
              <MaterialIcons name="picture-as-pdf" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Export PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('home')}
            >
              <MaterialIcons name="home" size={20} color="#D81B60" />
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.comingSoonText}>
            Complete results analysis available in mobile app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderCMEScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>CME Education</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="school" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.featureTitle}>Continuing Medical Education</Text>
          <Text style={styles.featureDescription}>
            Comprehensive learning modules for menopause hormone therapy education with interactive content and certification.
          </Text>
          
          <View style={styles.modulesList}>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 1: HRT Fundamentals</Text>
              <Text style={styles.moduleStatus}>✓ Available - 1 Credit</Text>
            </View>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 2: Risk Assessment</Text>
              <Text style={styles.moduleStatus}>✓ Available - 1 Credit</Text>
            </View>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 3: Drug Interactions</Text>
              <Text style={styles.moduleStatus}>✓ Available - 1 Credit</Text>
            </View>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 4: Case Studies</Text>
              <Text style={styles.moduleStatus}>✓ Available - 1 Credit</Text>
            </View>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 5: Guidelines Update</Text>
              <Text style={styles.moduleStatus}>✓ Available - 1 Credit</Text>
            </View>
            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>Module 6: Advanced Topics</Text>
              <Text style={styles.moduleStatus}>✓ Available - 1 Credit</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => Alert.alert('CME Modules', 'Full interactive learning modules with quizzes and certificates available in mobile app!')}
          >
            <MaterialIcons name="play-circle-filled" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Start Learning (6 Credits)</Text>
          </TouchableOpacity>
          
          <Text style={styles.comingSoonText}>
            Interactive modules with quizzes and certificates available in mobile app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderGuidelinesScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Clinical Guidelines</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="book" size={48} color="#2196F3" />
          </View>
          <Text style={styles.featureTitle}>Evidence-Based Clinical Guidelines</Text>
          <Text style={styles.featureDescription}>
            Complete clinical guidelines following IMS/NAMS 2022 recommendations for menopause hormone therapy.
          </Text>
          
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineTitle}>Patient Assessment Protocols</Text>
                <Text style={styles.guidelineDesc}>Comprehensive evaluation procedures</Text>
              </View>
            </View>
            <View style={styles.guidelineItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineTitle}>Risk Stratification Guidelines</Text>
                <Text style={styles.guidelineDesc}>Evidence-based risk assessment</Text>
              </View>
            </View>
            <View style={styles.guidelineItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineTitle}>Treatment Recommendations</Text>
                <Text style={styles.guidelineDesc}>Personalized therapy protocols</Text>
              </View>
            </View>
            <View style={styles.guidelineItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineTitle}>Contraindication Management</Text>
                <Text style={styles.guidelineDesc}>Safety protocols and alternatives</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => Alert.alert('Guidelines', 'Complete searchable clinical guidelines with bookmarks available in mobile app!')}
          >
            <MaterialIcons name="menu-book" size={20} color="white" />
            <Text style={styles.primaryButtonText}>View Complete Guidelines</Text>
          </TouchableOpacity>
          
          <Text style={styles.comingSoonText}>
            Complete searchable guidelines with bookmarks available in mobile app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderDecisionSupportScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Drug Interaction Checker</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="warning" size={48} color="#FF9800" />
          </View>
          <Text style={styles.featureTitle}>Advanced Drug Interaction Analysis</Text>
          <Text style={styles.featureDescription}>
            Comprehensive database of 150+ HRT drug interactions with clinical significance ratings and evidence-based recommendations.
          </Text>
          
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Evidence-based interaction analysis</Text>
            <Text style={styles.featureItem}>• Clinical severity ratings (LOW/MODERATE/HIGH)</Text>
            <Text style={styles.featureItem}>• Mechanism and rationale explanations</Text>
            <Text style={styles.featureItem}>• Recommended clinical actions</Text>
            <Text style={styles.featureItem}>• Real-time interaction checking</Text>
            <Text style={styles.featureItem}>• Contraindication alerts</Text>
          </View>
          
          <View style={styles.severityExamples}>
            <View style={styles.severityItem}>
              <View style={[styles.severityDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.severityLabel}>HIGH: Contraindicated combinations</Text>
            </View>
            <View style={styles.severityItem}>
              <View style={[styles.severityDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.severityLabel}>MODERATE: Monitor closely</Text>
            </View>
            <View style={styles.severityItem}>
              <View style={[styles.severityDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.severityLabel}>LOW: Minimal interaction</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => Alert.alert('Drug Checker', 'Full interactive drug interaction checker with medicine selection available in mobile app!')}
          >
            <MaterialIcons name="science" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Launch Drug Checker</Text>
          </TouchableOpacity>
          
          <Text style={styles.comingSoonText}>
            Interactive drug selection and analysis available in mobile app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Patient Assessment</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="assignment" size={48} color="#D81B60" />
          </View>
          <Text style={styles.featureTitle}>MHT Assessment Protocol</Text>
          <Text style={styles.featureDescription}>
            Comprehensive 4-step assessment process following evidence-based clinical guidelines
          </Text>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Demographics</Text>
                <Text style={styles.stepDesc}>Patient information and BMI calculation</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Symptom Assessment</Text>
                <Text style={styles.stepDesc}>VAS rating scales for menopausal symptoms</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Risk Factors</Text>
                <Text style={styles.stepDesc}>Medical history and contraindications</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Results & Recommendations</Text>
                <Text style={styles.stepDesc}>Risk stratification and treatment plan</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.timeEstimate}>
            <MaterialIcons name="schedule" size={20} color="#666" />
            <Text style={styles.timeText}>Estimated time: 5-8 minutes</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setCurrentScreen('demographics')}
          >
            <Text style={styles.startButtonText}>Start New Assessment</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loadExistingButton}
            onPress={() => setCurrentScreen('patientlist')}
          >
            <Text style={styles.loadExistingText}>Load Existing Patient</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderRiskCalculatorsScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Risk Calculators</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Professional Risk Assessment Tools</Text>
          <Text style={styles.featureDescription}>
            Evidence-based calculators for comprehensive patient evaluation with real-time updates and unit conversions.
          </Text>
          
          <View style={styles.calculatorsList}>
            <View style={styles.calculatorItem}>
              <MaterialIcons name="calculate" size={24} color="#4CAF50" />
              <View style={styles.calculatorContent}>
                <Text style={styles.calculatorTitle}>BMI Calculator</Text>
                <Text style={styles.calculatorDesc}>Body Mass Index with health risk categories</Text>
              </View>
            </View>
            
            <View style={styles.calculatorItem}>
              <MaterialIcons name="timeline" size={24} color="#2196F3" />
              <View style={styles.calculatorContent}>
                <Text style={styles.calculatorTitle}>BSA Calculator</Text>
                <Text style={styles.calculatorDesc}>Body Surface Area using Du Bois formula</Text>
              </View>
            </View>
            
            <View style={styles.calculatorItem}>
              <MaterialIcons name="favorite" size={24} color="#FF5722" />
              <View style={styles.calculatorContent}>
                <Text style={styles.calculatorTitle}>eGFR Calculator</Text>
                <Text style={styles.calculatorDesc}>Kidney function assessment (CKD-EPI 2021)</Text>
              </View>
            </View>
            
            <View style={styles.calculatorItem}>
              <MaterialIcons name="health-and-safety" size={24} color="#9C27B0" />
              <View style={styles.calculatorContent}>
                <Text style={styles.calculatorTitle}>HRT Risk Calculator</Text>
                <Text style={styles.calculatorDesc}>Contraindications and recommendations</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Enhanced Features:</Text>
            <Text style={styles.featureItem}>• Dynamic updates with 250-400ms debouncing</Text>
            <Text style={styles.featureItem}>• Unit toggles (kg/lb, cm/ft-in, mg/dL/μmol/L)</Text>
            <Text style={styles.featureItem}>• Reset behavior on Home navigation</Text>
            <Text style={styles.featureItem}>• Manual reset button</Text>
            <Text style={styles.featureItem}>• Comprehensive validation and error handling</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.launchButton}
            onPress={() => Alert.alert('Risk Calculators', 'Enhanced calculators available in full mobile app with real-time calculations and unit conversions!')}
          >
            <Text style={styles.launchButtonText}>Launch Enhanced Calculators</Text>
            <MaterialIcons name="science" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderRiskModelsScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Risk Models Explained</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Clinical Risk Assessment Models</Text>
          <Text style={styles.featureDescription}>
            Understanding the evidence-based risk models used in MHT decision-making.
          </Text>
          
          <View style={styles.riskModelsList}>
            <View style={styles.riskModelItem}>
              <View style={styles.riskModelHeader}>
                <MaterialIcons name="favorite" size={20} color="#F44336" />
                <Text style={styles.riskModelTitle}>Cardiovascular Risk</Text>
              </View>
              <Text style={styles.riskModelDesc}>
                <Text style={styles.bold}>ASCVD Calculator:</Text> 10-year risk of atherosclerotic cardiovascular disease
              </Text>
              <Text style={styles.riskModelDesc}>
                <Text style={styles.bold}>Framingham Score:</Text> Traditional cardiovascular risk assessment
              </Text>
            </View>
            
            <View style={styles.riskModelItem}>
              <View style={styles.riskModelHeader}>
                <MaterialIcons name="health-and-safety" size={20} color="#E91E63" />
                <Text style={styles.riskModelTitle}>Breast Cancer Risk</Text>
              </View>
              <Text style={styles.riskModelDesc}>
                <Text style={styles.bold}>Gail Model:</Text> 5-year and lifetime breast cancer risk
              </Text>
              <Text style={styles.riskModelDesc}>
                <Text style={styles.bold}>Tyrer-Cuzick:</Text> More comprehensive model including family history
              </Text>
            </View>
            
            <View style={styles.riskModelItem}>
              <View style={styles.riskModelHeader}>
                <MaterialIcons name="opacity" size={20} color="#2196F3" />
                <Text style={styles.riskModelTitle}>VTE Risk</Text>
              </View>
              <Text style={styles.riskModelDesc}>
                <Text style={styles.bold}>Wells Score:</Text> Venous thromboembolism risk assessment
              </Text>
            </View>
            
            <View style={styles.riskModelItem}>
              <View style={styles.riskModelHeader}>
                <MaterialIcons name="accessibility" size={20} color="#FF9800" />
                <Text style={styles.riskModelTitle}>Fracture Risk</Text>
              </View>
              <Text style={styles.riskModelDesc}>
                <Text style={styles.bold}>FRAX Calculator:</Text> 10-year probability of osteoporotic fractures
              </Text>
            </View>
          </View>
          
          <View style={styles.guidelinesInfo}>
            <MaterialIcons name="book" size={20} color="#4CAF50" />
            <Text style={styles.guidelinesText}>
              All models follow IMS/NAMS 2022 guidelines and evidence-based medicine principles
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderAboutScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>About MHT Assessment</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.featureCard}>
          <View style={styles.aboutHeader}>
            <MaterialIcons name="medical-services" size={48} color="#D81B60" />
            <Text style={styles.appTitle}>MHT Assessment Tool</Text>
            <Text style={styles.version}>Version 1.0</Text>
          </View>
          
          <Text style={styles.aboutDescription}>
            Professional clinical decision support system for Menopause Hormone Therapy assessment, 
            following evidence-based guidelines from the International Menopause Society (IMS) and 
            North American Menopause Society (NAMS).
          </Text>
          
          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Key Features:</Text>
            <Text style={styles.featureItem}>• Comprehensive risk stratification</Text>
            <Text style={styles.featureItem}>• Drug interaction checking (150+ interactions)</Text>
            <Text style={styles.featureItem}>• AI-powered risk calculators</Text>
            <Text style={styles.featureItem}>• Evidence-based treatment recommendations</Text>
            <Text style={styles.featureItem}>• CME learning modules</Text>
            <Text style={styles.featureItem}>• Offline-first data persistence</Text>
          </View>
          
          <View style={styles.creditsSection}>
            <Text style={styles.creditsTitle}>Clinical Guidelines:</Text>
            <Text style={styles.creditItem}>• IMS Global Consensus Statement 2022</Text>
            <Text style={styles.creditItem}>• NAMS Position Statement 2022</Text>
            <Text style={styles.creditItem}>• ACOG Practice Bulletin</Text>
            <Text style={styles.creditItem}>• Endocrine Society Guidelines</Text>
          </View>
          
          <View style={styles.disclaimerSection}>
            <MaterialIcons name="info" size={20} color="#FF9800" />
            <Text style={styles.disclaimerText}>
              This tool is for educational and clinical decision support purposes. 
              Always consult with healthcare professionals for patient care decisions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>  
  );

  return (
    <View style={styles.appContainer}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D81B60" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFC1CC',
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 25,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  featureCard: {
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  stepsList: {
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    backgroundColor: '#D81B60',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadExistingButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 10,
  },
  loadExistingText: {
    color: '#D81B60',
    fontSize: 16,
    fontWeight: '500',
  },
  calculatorsList: {
    marginBottom: 20,
  },
  calculatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  calculatorContent: {
    marginLeft: 12,
    flex: 1,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  calculatorDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  featuresList: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  launchButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  launchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskModelsList: {
    marginBottom: 20,
  },
  riskModelItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  riskModelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  riskModelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  riskModelDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  guidelinesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  guidelinesText: {
    fontSize: 14,
    color: '#4CAF50',
    flex: 1,
    lineHeight: 18,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginTop: 10,
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: '#666',
  },
  aboutDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  creditsSection: {
    marginBottom: 20,
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  creditItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#FF9800',
    flex: 1,
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  headerIcon: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 10,
  },
  featuresDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionContainer: {
    gap: 15,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFC1CC',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#D81B60',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  stepIndicator: {
    backgroundColor: '#FFC1CC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    right: 20,
    top: 25,
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D81B60',
  },
  symptomsList: {
    marginBottom: 20,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  symptomLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  riskCategoriesList: {
    marginBottom: 20,
  },
  riskCategory: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 12,
  },
  riskCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  riskCategoryDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  resultsSummary: {
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 10,
    gap: 12,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  actionButtons: {
    gap: 10,
    marginBottom: 20,
  },
  modulesList: {
    marginBottom: 20,
  },
  moduleCard: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  moduleStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  guidelinesList: {
    marginBottom: 20,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 12,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guidelineDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  severityExamples: {
    marginBottom: 20,
  },
  severityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  severityLabel: {
    fontSize: 14,
    color: '#333',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
});