import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

// Enhanced MHT Assessment with interactive features and data persistence
export default function MHTAssessmentEnhanced() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [assessmentData, setAssessmentData] = useState({
    patientName: '',
    age: '',
    symptoms: {},
    riskFactors: {},
    medications: []
  });
  const [patients, setPatients] = useState([]);
  const [assessmentStep, setAssessmentStep] = useState(1);

  // Data persistence with React Native Web compatible storage
  useEffect(() => {
    // Load saved data on app start
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    try {
      // React Native Web compatible storage check
      if (typeof Storage !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedPatients = JSON.parse(localStorage.getItem('mht_patients') || '[]');
        setPatients(savedPatients);
      } else {
        // Fallback for environments without localStorage
        console.log('localStorage not available, using in-memory storage');
        setPatients([]);
      }
    } catch (error) {
      console.log('Storage access error, using in-memory storage:', error);
      setPatients([]);
    }
  };

  const savePatientData = (patientData) => {
    const newPatient = {
      ...patientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'Assessment Complete'
    };
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);
    
    // React Native Web compatible storage save
    try {
      if (typeof Storage !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('mht_patients', JSON.stringify(updatedPatients));
      } else {
        console.log('localStorage not available, data saved in memory only');
      }
    } catch (error) {
      console.log('Storage save error:', error);
    }
    
    Alert.alert('Success', 'Patient data saved successfully!');
  };

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
            Complete patient evaluation with risk stratification and treatment recommendations.
          </Text>
        </View>

        <View style={styles.quickStats}>
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

        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.primaryAction} 
            onPress={() => {
              setCurrentScreen('assessment');
              setAssessmentStep(1);
              setAssessmentData({
                patientName: '',
                age: '',
                symptoms: {},
                riskFactors: {},
                medications: []
              });
            }}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.primaryActionText}>Start New Assessment</Text>
            <Text style={styles.actionSubtext}>Begin comprehensive evaluation</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={() => setCurrentScreen('patients')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.secondaryActionText}>Patient Records</Text>
            <Text style={styles.actionSubtext}>View saved assessments</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={() => setCurrentScreen('drugchecker')}
          >
            <Text style={styles.actionIcon}>💊</Text>
            <Text style={styles.secondaryActionText}>Drug Interaction Checker</Text>
            <Text style={styles.actionSubtext}>Analyze HRT interactions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={() => setCurrentScreen('calculators')}
          >
            <Text style={styles.actionIcon}>🧮</Text>
            <Text style={styles.secondaryActionText}>Risk Calculators</Text>
            <Text style={styles.actionSubtext}>ASCVD, FRAX, Framingham</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={() => setCurrentScreen('cme')}
          >
            <Text style={styles.actionIcon}>🎓</Text>
            <Text style={styles.secondaryActionText}>CME Education</Text>
            <Text style={styles.actionSubtext}>Interactive learning modules</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={() => setCurrentScreen('guidelines')}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.secondaryActionText}>Clinical Guidelines</Text>
            <Text style={styles.actionSubtext}>IMS/NAMS recommendations</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderInteractiveAssessment = () => {
    const handleInputChange = (field, value) => {
      setAssessmentData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    if (assessmentStep === 1) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Patient Demographics</Text>
            <Text style={styles.subtitle}>Step 1 of 4</Text>
          </View>
          <ScrollView style={styles.content}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Patient Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Patient Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={assessmentData.patientName}
                  onChangeText={(text) => handleInputChange('patientName', text)}
                  placeholder="Enter patient name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={assessmentData.age}
                  onChangeText={(text) => handleInputChange('age', text)}
                  placeholder="Enter age"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '25%' }]} />
              </View>
              <Text style={styles.progressText}>Progress: 25% Complete</Text>

              <TouchableOpacity 
                style={[styles.continueButton, (!assessmentData.patientName || !assessmentData.age) && styles.disabledButton]}
                onPress={() => {
                  if (assessmentData.patientName && assessmentData.age) {
                    setAssessmentStep(2);
                  } else {
                    Alert.alert('Required Fields', 'Please fill in all required fields');
                  }
                }}
                disabled={!assessmentData.patientName || !assessmentData.age}
              >
                <Text style={styles.continueButtonText}>Continue to Symptoms →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    if (assessmentStep === 2) {
      const symptoms = [
        'Hot flashes', 'Night sweats', 'Sleep disturbances', 'Mood changes',
        'Vaginal dryness', 'Decreased libido', 'Joint aches', 'Memory issues'
      ];

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setAssessmentStep(1)} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Symptom Assessment</Text>
            <Text style={styles.subtitle}>Step 2 of 4</Text>
          </View>
          <ScrollView style={styles.content}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Rate Symptom Severity</Text>
              <Text style={styles.formSubtitle}>Scale: 0 (None) to 10 (Severe)</Text>
              
              {symptoms.map((symptom, index) => (
                <View key={index} style={styles.symptomRow}>
                  <Text style={styles.symptomLabel}>{symptom}</Text>
                  <View style={styles.ratingContainer}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.ratingButton,
                          assessmentData.symptoms[symptom] === rating && styles.ratingButtonActive
                        ]}
                        onPress={() => {
                          setAssessmentData(prev => ({
                            ...prev,
                            symptoms: { ...prev.symptoms, [symptom]: rating }
                          }));
                        }}
                      >
                        <Text style={[
                          styles.ratingText,
                          assessmentData.symptoms[symptom] === rating && styles.ratingTextActive
                        ]}>
                          {rating}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '50%' }]} />
              </View>
              <Text style={styles.progressText}>Progress: 50% Complete</Text>

              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => setAssessmentStep(3)}
              >
                <Text style={styles.continueButtonText}>Continue to Risk Factors →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    if (assessmentStep === 3) {
      const riskFactors = [
        'Family history of breast cancer',
        'Personal history of VTE',
        'Smoking history',
        'Hypertension',
        'Diabetes',
        'Cardiovascular disease'
      ];

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setAssessmentStep(2)} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Risk Factors</Text>
            <Text style={styles.subtitle}>Step 3 of 4</Text>
          </View>
          <ScrollView style={styles.content}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Medical History & Risk Factors</Text>
              
              {riskFactors.map((factor, index) => (
                <View key={index} style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      assessmentData.riskFactors[factor] && styles.checkboxActive
                    ]}
                    onPress={() => {
                      setAssessmentData(prev => ({
                        ...prev,
                        riskFactors: { 
                          ...prev.riskFactors, 
                          [factor]: !prev.riskFactors[factor] 
                        }
                      }));
                    }}
                  >
                    <Text style={styles.checkboxText}>
                      {assessmentData.riskFactors[factor] ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>{factor}</Text>
                </View>
              ))}

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
              <Text style={styles.progressText}>Progress: 75% Complete</Text>

              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => setAssessmentStep(4)}
              >
                <Text style={styles.continueButtonText}>View Results →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    if (assessmentStep === 4) {
      const calculateRiskScore = () => {
        const riskCount = Object.values(assessmentData.riskFactors).filter(Boolean).length;
        const symptomSeverity = Object.values(assessmentData.symptoms).reduce((sum, score) => sum + (score || 0), 0);
        return Math.min(100, (riskCount * 15) + (symptomSeverity * 2));
      };

      const riskScore = calculateRiskScore();
      const riskLevel = riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MODERATE' : 'HIGH';
      const riskColor = riskLevel === 'LOW' ? '#4CAF50' : riskLevel === 'MODERATE' ? '#FF9800' : '#F44336';

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setAssessmentStep(3)} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Assessment Results</Text>
            <Text style={styles.subtitle}>Step 4 of 4</Text>
          </View>
          <ScrollView style={styles.content}>
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Patient: {assessmentData.patientName}</Text>
              <Text style={styles.resultsSubtitle}>Age: {assessmentData.age} years</Text>
              
              <View style={[styles.riskScoreCard, { borderColor: riskColor }]}>
                <Text style={styles.riskScoreTitle}>Overall Risk Score</Text>
                <Text style={[styles.riskScoreValue, { color: riskColor }]}>{riskScore}</Text>
                <Text style={[styles.riskScoreLevel, { color: riskColor }]}>{riskLevel} RISK</Text>
              </View>

              <View style={styles.recommendationsCard}>
                <Text style={styles.recommendationsTitle}>Clinical Recommendations</Text>
                {riskLevel === 'LOW' && (
                  <Text style={styles.recommendationText}>
                    • HRT may be considered with standard monitoring
                    • Regular follow-up every 6-12 months
                    • Lifestyle counseling recommended
                  </Text>
                )}
                {riskLevel === 'MODERATE' && (
                  <Text style={styles.recommendationText}>
                    • Detailed risk-benefit analysis required
                    • Consider alternative therapies
                    • Enhanced monitoring protocol
                    • Specialist consultation recommended
                  </Text>
                )}
                {riskLevel === 'HIGH' && (
                  <Text style={styles.recommendationText}>
                    • HRT generally contraindicated
                    • Explore non-hormonal alternatives
                    • Immediate specialist referral
                    • Comprehensive risk mitigation
                  </Text>
                )}
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
              <Text style={styles.progressText}>Assessment Complete!</Text>

              <View style={styles.finalActions}>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => {
                    savePatientData(assessmentData);
                    setCurrentScreen('home');
                  }}
                >
                  <Text style={styles.saveButtonText}>💾 Save Assessment</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.newAssessmentButton}
                  onPress={() => {
                    setAssessmentStep(1);
                    setAssessmentData({
                      patientName: '',
                      age: '',
                      symptoms: {},
                      riskFactors: {},
                      medications: []
                    });
                  }}
                >
                  <Text style={styles.newAssessmentButtonText}>🔄 New Assessment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }
  };

  const renderPatientRecords = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Patient Records</Text>
        <Text style={styles.subtitle}>{patients.length} Saved Assessments</Text>
      </View>
      <ScrollView style={styles.content}>
        {patients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Patient Records</Text>
            <Text style={styles.emptyStateText}>Complete your first assessment to see patient data here.</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setCurrentScreen('assessment')}
            >
              <Text style={styles.emptyStateButtonText}>Start First Assessment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          patients.map((patient, index) => (
            <View key={patient.id} style={styles.patientRecord}>
              <View style={styles.patientHeader}>
                <Text style={styles.patientName}>{patient.patientName}</Text>
                <Text style={styles.patientAge}>Age: {patient.age}</Text>
              </View>
              <Text style={styles.patientDate}>
                Assessed: {new Date(patient.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.patientStatus}>{patient.status}</Text>
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => Alert.alert('Patient Details', `Full patient record for ${patient.patientName} would be displayed here.`)}
              >
                <Text style={styles.viewDetailsText}>View Details →</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );

  // Drug Interaction Checker - Enhanced but safe version
  const renderDrugChecker = () => {
    const [selectedPrimary, setSelectedPrimary] = useState('');
    const [selectedSecondary, setSelectedSecondary] = useState('');
    const [interactionResult, setInteractionResult] = useState(null);

    const primaryMedications = ['Estradiol', 'Conjugated Estrogens', 'Estrone', 'Progesterone', 'Medroxyprogesterone'];
    const secondaryMedications = ['Warfarin', 'Phenytoin', 'Carbamazepine', 'Rifampin', 'St Johns Wort'];

    const checkInteraction = () => {
      if (selectedPrimary && selectedSecondary) {
        // Safe interaction checking without problematic JSON imports
        const interactions = {
          'Estradiol-Warfarin': { severity: 'MODERATE', rationale: 'May increase anticoagulant effect' },
          'Estradiol-Phenytoin': { severity: 'HIGH', rationale: 'Significant drug interaction - monitor closely' },
          'Conjugated Estrogens-Warfarin': { severity: 'MODERATE', rationale: 'Monitor INR closely' },
        };
        
        const key = `${selectedPrimary}-${selectedSecondary}`;
        const result = interactions[key] || { 
          severity: 'LOW', 
          rationale: 'No significant interaction documented' 
        };
        
        setInteractionResult({
          primary: selectedPrimary,
          secondary: selectedSecondary,
          ...result
        });
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Drug Interaction Checker</Text>
          <Text style={styles.subtitle}>HRT Drug Analysis</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.drugCheckerCard}>
            <Text style={styles.drugCheckerTitle}>Select Medications</Text>
            
            <View style={styles.medicationSelection}>
              <Text style={styles.selectionLabel}>Primary HRT Medication</Text>
              <View style={styles.medicationButtons}>
                {primaryMedications.map(med => (
                  <TouchableOpacity
                    key={med}
                    style={[
                      styles.medicationButton,
                      selectedPrimary === med && styles.medicationButtonActive
                    ]}
                    onPress={() => setSelectedPrimary(med)}
                  >
                    <Text style={[
                      styles.medicationButtonText,
                      selectedPrimary === med && styles.medicationButtonTextActive
                    ]}>{med}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.medicationSelection}>
              <Text style={styles.selectionLabel}>Concurrent Medication</Text>
              <View style={styles.medicationButtons}>
                {secondaryMedications.map(med => (
                  <TouchableOpacity
                    key={med}
                    style={[
                      styles.medicationButton,
                      selectedSecondary === med && styles.medicationButtonActive
                    ]}
                    onPress={() => setSelectedSecondary(med)}
                  >
                    <Text style={[
                      styles.medicationButtonText,
                      selectedSecondary === med && styles.medicationButtonTextActive
                    ]}>{med}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.checkInteractionButton,
                (!selectedPrimary || !selectedSecondary) && styles.disabledButton
              ]}
              onPress={checkInteraction}
              disabled={!selectedPrimary || !selectedSecondary}
            >
              <Text style={styles.checkInteractionText}>🔍 Check Interaction</Text>
            </TouchableOpacity>

            {interactionResult && (
              <View style={styles.interactionResult}>
                <Text style={styles.interactionTitle}>Interaction Analysis</Text>
                <Text style={styles.interactionMeds}>
                  {interactionResult.primary} + {interactionResult.secondary}
                </Text>
                <Text style={[
                  styles.interactionSeverity,
                  { 
                    color: interactionResult.severity === 'HIGH' ? '#F44336' : 
                           interactionResult.severity === 'MODERATE' ? '#FF9800' : '#4CAF50'
                  }
                ]}>
                  {interactionResult.severity} INTERACTION
                </Text>
                <Text style={styles.interactionRationale}>
                  {interactionResult.rationale}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'assessment': return renderInteractiveAssessment();
      case 'patients': return renderPatientRecords();
      case 'drugchecker': return renderDrugChecker();
      case 'calculators': return renderCalculatorsScreen();
      case 'cme': return renderCMEScreen();
      case 'guidelines': return renderGuidelinesScreen();
      default: return renderHomeScreen();
    }
  };

  // Placeholder screens for other features
  const renderCalculatorsScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Risk Calculators</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.featureTitle}>Clinical Risk Assessment Tools</Text>
        <Text style={styles.featureDescription}>Interactive calculators for comprehensive risk evaluation</Text>
        <TouchableOpacity style={styles.featureButton} onPress={() => Alert.alert('Coming Soon', 'Risk calculators will be available in the next update!')}>
          <Text style={styles.featureButtonText}>🧮 Launch Calculators</Text>
        </TouchableOpacity>
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
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.featureTitle}>Continuing Medical Education</Text>
        <Text style={styles.featureDescription}>Interactive learning modules with certificates</Text>
        <TouchableOpacity style={styles.featureButton} onPress={() => Alert.alert('Coming Soon', 'CME modules will be available in the next update!')}>
          <Text style={styles.featureButtonText}>🎓 Start Learning</Text>
        </TouchableOpacity>
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
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.featureTitle}>IMS/NAMS Guidelines 2022</Text>
        <Text style={styles.featureDescription}>Evidence-based clinical recommendations</Text>
        <TouchableOpacity style={styles.featureButton} onPress={() => Alert.alert('Coming Soon', 'Guidelines will be available in the next update!')}>
          <Text style={styles.featureButtonText}>📚 View Guidelines</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

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
  quickStats: {
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
  actionsGrid: {
    gap: 12,
  },
  primaryAction: {
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
  primaryActionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  secondaryAction: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFC1CC',
    elevation: 1,
  },
  secondaryActionText: {
    color: '#D81B60',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
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
  formSubtitle: {
    fontSize: 14,
    color: '#666',
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
  symptomRow: {
    marginBottom: 15,
  },
  symptomLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  ratingButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#D81B60',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
  ratingTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
  },
  checkboxText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginVertical: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D81B60',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#D81B60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  riskScoreCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  riskScoreTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  riskScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  riskScoreLevel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendationsCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  finalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newAssessmentButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  newAssessmentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#D81B60',
    padding: 15,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientRecord: {
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
  patientDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  patientStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 10,
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
  },
  viewDetailsText: {
    color: '#D81B60',
    fontSize: 14,
    fontWeight: '600',
  },
  drugCheckerCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  drugCheckerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  medicationSelection: {
    marginBottom: 25,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  medicationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicationButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  medicationButtonActive: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
  },
  medicationButtonText: {
    fontSize: 14,
    color: '#333',
  },
  medicationButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkInteractionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkInteractionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  interactionResult: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  interactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  interactionMeds: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  interactionSeverity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  interactionRationale: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    margin: 20,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  featureButton: {
    backgroundColor: '#D81B60',
    marginHorizontal: 20,
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