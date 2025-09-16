import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useAssessmentStore from '../store/assessmentStore';
import pdfExportGenerator, { PatientData } from '../utils/pdfExportGenerator';
import { calculateAllRisks } from '../utils/medicalCalculators';

type RootStackParamList = {
  Home: undefined;
  Results: undefined;
  Export: undefined;
};

type ExportNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Export'>;

interface Props {
  navigation: ExportNavigationProp;
}

export default function ExportScreen({ navigation }: Props) {
  const { currentPatient } = useAssessmentStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  const preparePatientData = (): PatientData => {
    if (!currentPatient) {
      throw new Error('No patient data available for export');
    }

    const bmi = currentPatient.bmi || (currentPatient.height && currentPatient.weight ? 
      currentPatient.weight / Math.pow(currentPatient.height / 100, 2) : undefined);

    // Calculate comprehensive risk scores
    const patientRiskData = {
      ...currentPatient,
      gender: 'female' as const,
      bmi
    };
    const comprehensiveRiskResults = calculateAllRisks(patientRiskData);

    // Calculate basic risk assessment (existing logic)
    const calculateBasicRisks = () => {
      const hasPersonalHistoryBC = Boolean(currentPatient.personalHistoryBreastCancer);
      const hasFamilyHistoryBC = Boolean(currentPatient.familyHistoryBreastCancer || currentPatient.familyHistoryOvarian);
      const isObese = (bmi || 0) >= 30;
      const cvdFactors = [
        Boolean(currentPatient.hypertension),
        Boolean(currentPatient.diabetes), 
        Boolean(currentPatient.cholesterolHigh)
      ].filter(Boolean).length;
      const isSmoker = Boolean(currentPatient.smoking);

      const breastCancerRisk = hasPersonalHistoryBC || (hasFamilyHistoryBC && isObese) ? 'high' :
                              (hasFamilyHistoryBC || isObese) ? 'moderate' : 'low';
      const cvdRisk = (cvdFactors >= 2 || (cvdFactors >= 1 && isSmoker)) ? 'high' :
                      (cvdFactors === 1 && !isSmoker) ? 'moderate' : 'low';
      const vteRisk = (Boolean(currentPatient.personalHistoryDVT) || Boolean(currentPatient.thrombophilia)) ? 'high' :
                      (isObese || isSmoker) ? 'moderate' : 'low';
      const overallRisk = [breastCancerRisk, cvdRisk, vteRisk].includes('high') ? 'high' :
                         [breastCancerRisk, cvdRisk, vteRisk].includes('moderate') ? 'moderate' : 'low';

      return { breastCancerRisk, cvdRisk, vteRisk, overallRisk };
    };

    const basicRisks = calculateBasicRisks();

    // Generate treatment recommendation
    const generateTreatmentRecommendation = () => {
      const hasHysterectomy = Boolean(currentPatient.hysterectomy);
      const hasGUSymptoms = (currentPatient.vaginalDryness || 0) >= 5;

      if (basicRisks.breastCancerRisk === 'high') {
        return {
          type: 'not-recommended',
          route: 'none',
          rationale: ['No systemic MHT due to high breast cancer risk', 
                     hasGUSymptoms ? 'Vaginal/local therapy only if GU symptoms present' : 'Consider non-hormonal alternatives']
        };
      } else if (basicRisks.cvdRisk === 'high' || basicRisks.vteRisk === 'high') {
        return {
          type: hasGUSymptoms ? 'vaginal-only' : (hasHysterectomy ? 'ET' : 'EPT'),
          route: hasGUSymptoms ? 'vaginal' : 'transdermal',
          progestogenType: (!hasGUSymptoms && !hasHysterectomy) ? 'micronized' : undefined,
          rationale: [`High ${basicRisks.cvdRisk === 'high' ? 'CVD' : 'VTE'} risk - ${hasGUSymptoms ? 'vaginal therapy preferred' : 'transdermal route only if systemic MHT needed'}`]
        };
      } else {
        return {
          type: hasHysterectomy ? 'ET' : 'EPT',
          route: 'oral',
          progestogenType: hasHysterectomy ? undefined : 'micronized',
          rationale: [hasHysterectomy ? 'Estrogen-only therapy - hysterectomy, low risks' : 'Combined therapy - uterus intact, low risks, oral route allowed']
        };
      }
    };

    const treatmentRecommendation = generateTreatmentRecommendation();

    // Prepare comprehensive questionnaire data
    const questionnaireData: Record<string, any> = {
      'Hot Flushes Severity': currentPatient.hotFlushes || 0,
      'Vaginal Dryness': currentPatient.vaginalDryness || 0,
      'Night Sweats': currentPatient.nightSweats || 0,
      'Sleep Disturbance': currentPatient.sleepDisturbance || 0,
      'Mood Changes': currentPatient.moodChanges || 0,
      'Joint Aches': currentPatient.jointAches || 0,
      'Hysterectomy History': currentPatient.hysterectomy ? 'Yes' : 'No',
      'Personal History Breast Cancer': currentPatient.personalHistoryBreastCancer ? 'Yes' : 'No',
      'Family History Breast Cancer': currentPatient.familyHistoryBreastCancer ? 'Yes' : 'No',
      'Family History Ovarian Cancer': currentPatient.familyHistoryOvarian ? 'Yes' : 'No',
      'Hypertension': currentPatient.hypertension ? 'Yes' : 'No',
      'Diabetes': currentPatient.diabetes ? 'Yes' : 'No',
      'High Cholesterol': currentPatient.cholesterolHigh ? 'Yes' : 'No',
      'Smoking': currentPatient.smoking ? 'Yes' : 'No',
      'Personal History DVT': currentPatient.personalHistoryDVT ? 'Yes' : 'No',
      'Thrombophilia': currentPatient.thrombophilia ? 'Yes' : 'No',
      'Menopausal Status': currentPatient.menopausalStatus || 'Postmenopausal'
    };

    const patientData: PatientData = {
      name: currentPatient.name,
      age: currentPatient.age,
      id: currentPatient.id,
      height: currentPatient.height,
      weight: currentPatient.weight,
      bmi: bmi,
      gender: 'Female',
      dateOfBirth: currentPatient.age ? `${new Date().getFullYear() - currentPatient.age}` : undefined,
      assessmentId: currentPatient.id,
      assessmentDate: new Date().toISOString(),
      questionnaire: questionnaireData,
      riskScores: comprehensiveRiskResults ? {
        ascvd: {
          risk: comprehensiveRiskResults.ascvd.risk,
          category: comprehensiveRiskResults.ascvd.category,
          interpretation: `10-year ASCVD risk based on pooled cohort equations`
        },
        framingham: {
          risk: comprehensiveRiskResults.framingham.risk,
          category: comprehensiveRiskResults.framingham.category,
          interpretation: `10-year CHD risk based on Framingham Risk Score`
        },
        gail: {
          risk: comprehensiveRiskResults.gail.risk,
          category: comprehensiveRiskResults.gail.category,
          interpretation: `5-year breast cancer risk based on Gail model`
        },
        tyrerCuzick: {
          risk: comprehensiveRiskResults.tyrerCuzick.risk,
          category: comprehensiveRiskResults.tyrerCuzick.category,
          interpretation: `10-year breast cancer risk based on Tyrer-Cuzick model`
        },
        wells: {
          score: comprehensiveRiskResults.wells.score,
          category: comprehensiveRiskResults.wells.category,
          interpretation: `DVT probability based on Wells Score`
        },
        frax: {
          majorFractureRisk: comprehensiveRiskResults.frax.majorFractureRisk,
          category: comprehensiveRiskResults.frax.category,
          interpretation: `10-year major osteoporotic fracture risk`
        }
      } : undefined,
      riskAssessment: {
        overallRiskLevel: basicRisks.overallRisk,
        breastCancerRisk: basicRisks.breastCancerRisk,
        cvdRisk: basicRisks.cvdRisk,
        vteRisk: basicRisks.vteRisk,
        interpretation: `Overall risk assessment based on individual risk factors and validated risk calculators. Risk levels guide MHT recommendations according to IMS/NAMS guidelines.`
      },
      treatmentPlan: {
        type: treatmentRecommendation.type,
        route: treatmentRecommendation.route,
        progestogenType: treatmentRecommendation.progestogenType,
        rationale: treatmentRecommendation.rationale,
        alternatives: [
          'Non-hormonal alternatives: SSRIs/SNRIs for vasomotor symptoms',
          'Lifestyle modifications: Regular exercise, dietary changes',
          'Complementary therapies: CBT, mindfulness, acupuncture'
        ],
        monitoringPlan: [
          'Baseline assessment: mammography, cardiovascular risk evaluation',
          '3-month follow-up: symptom assessment, side effects review',
          '6-month follow-up: efficacy evaluation, dosage adjustment if needed',
          'Annual review: comprehensive health assessment, risk-benefit evaluation'
        ]
      },
      decisionSupport: {
        contraindications: basicRisks.breastCancerRisk === 'high' ? 
          ['High breast cancer risk - systemic HRT contraindicated'] : [],
        recommendations: [
          'Discuss shared decision-making with patient',
          'Provide patient information leaflets',
          'Schedule appropriate follow-up based on treatment plan',
          'Consider specialist referral if complex case'
        ]
      }
    };

    return patientData;
  };

  const handleExportPDF = async () => {
    if (!currentPatient) {
      Alert.alert('Error', 'No patient data available for export');
      return;
    }

    setIsExporting(true);
    setExportStatus('Preparing patient data...');

    try {
      const patientData = preparePatientData();
      
      setExportStatus('Generating PDF...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay to show progress
      
      setExportStatus('Creating document...');
      await pdfExportGenerator.exportAndShare(patientData);
      
      setExportStatus('Export completed successfully!');
      
      Alert.alert(
        'Export Successful',
        'PDF has been generated and is ready to share.',
        [
          { text: 'OK', onPress: () => setExportStatus('') }
        ]
      );
      
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert(
        'Export Failed',
        `Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK', onPress: () => setExportStatus('') }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleSamplePDF = async () => {
    setIsExporting(true);
    setExportStatus('Generating sample PDF...');

    try {
      const sampleData: PatientData = {
        name: 'Jane Smith',
        age: 52,
        id: 'SAMPLE_001',
        height: 165,
        weight: 68,
        bmi: 25.0,
        gender: 'Female',
        dateOfBirth: '1972',
        assessmentId: 'SAMPLE_ASSESSMENT_001',
        assessmentDate: new Date().toISOString(),
        clinicianName: 'Dr. Sarah Johnson',
        questionnaire: {
          'Hot Flushes Severity': 7,
          'Vaginal Dryness': 5,
          'Night Sweats': 6,
          'Sleep Disturbance': 5,
          'Mood Changes': 4,
          'Joint Aches': 3,
          'Hysterectomy History': 'No',
          'Personal History Breast Cancer': 'No',
          'Family History Breast Cancer': 'Yes',
          'Hypertension': 'No',
          'Diabetes': 'No',
          'High Cholesterol': 'No',
          'Smoking': 'No'
        },
        riskScores: {
          ascvd: { risk: 3.2, category: 'Low', interpretation: '10-year ASCVD risk based on pooled cohort equations' },
          framingham: { risk: 2.8, category: 'Low', interpretation: '10-year CHD risk based on Framingham Risk Score' },
          gail: { risk: 1.8, category: 'Moderate', interpretation: '5-year breast cancer risk based on Gail model' },
          tyrerCuzick: { risk: 2.1, category: 'Moderate', interpretation: '10-year breast cancer risk based on Tyrer-Cuzick model' },
          wells: { score: 1, category: 'Low', interpretation: 'DVT probability based on Wells Score' },
          frax: { majorFractureRisk: 4.5, category: 'Low', interpretation: '10-year major osteoporotic fracture risk' }
        },
        riskAssessment: {
          overallRiskLevel: 'moderate',
          breastCancerRisk: 'moderate',
          cvdRisk: 'low',
          vteRisk: 'low',
          interpretation: 'Moderate overall risk due to family history of breast cancer. Suitable for MHT with appropriate monitoring.'
        },
        treatmentPlan: {
          type: 'EPT',
          route: 'oral',
          progestogenType: 'micronized',
          rationale: [
            'Combined therapy recommended - uterus intact, low-moderate risks',
            'Oral route appropriate given low cardiovascular and VTE risk',
            'Family history of breast cancer requires enhanced monitoring'
          ],
          alternatives: [
            'Transdermal estrogen with micronized progesterone',
            'Lower dose oral preparations',
            'Non-hormonal alternatives if symptoms persist'
          ],
          monitoringPlan: [
            'Baseline mammography and breast examination',
            '3-month follow-up for symptom assessment',
            '6-month review with breast examination',
            'Annual mammography and comprehensive review'
          ]
        },
        decisionSupport: {
          recommendations: [
            'Discuss family history implications',
            'Emphasize importance of regular breast screening',
            'Provide lifestyle advice for risk reduction',
            'Schedule appropriate follow-up intervals'
          ]
        }
      };

      await pdfExportGenerator.exportAndShare(sampleData);
      
      setExportStatus('Sample PDF generated successfully!');
      
      Alert.alert(
        'Sample Export Successful',
        'Sample PDF has been generated for demonstration.',
        [{ text: 'OK', onPress: () => setExportStatus('') }]
      );
      
    } catch (error) {
      console.error('Sample export failed:', error);
      Alert.alert('Sample Export Failed', 'Failed to generate sample PDF');
    } finally {
      setIsExporting(false);
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
        <Text style={styles.title}>Export Assessment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Export Status */}
        {(isExporting || exportStatus) && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MaterialIcons 
                name={isExporting ? "hourglass-empty" : "check-circle"} 
                size={24} 
                color={isExporting ? "#FF9800" : "#4CAF50"} 
              />
              <Text style={styles.statusTitle}>
                {isExporting ? 'Exporting...' : 'Export Status'}
              </Text>
            </View>
            
            {isExporting && (
              <ActivityIndicator size="small" color="#D81B60" style={styles.loadingIndicator} />
            )}
            
            <Text style={styles.statusText}>{exportStatus}</Text>
          </View>
        )}

        {/* Patient Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="person" size={24} color="#D81B60" />
            <Text style={styles.infoTitle}>Patient Information</Text>
          </View>
          
          {currentPatient ? (
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{currentPatient.name || 'Unknown Patient'}</Text>
              <Text style={styles.patientDetails}>
                Age: {currentPatient.age || 'N/A'} • ID: {currentPatient.id || 'N/A'}
              </Text>
              <Text style={styles.assessmentDate}>
                Assessment: {new Date().toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.noPatientText}>No patient data available</Text>
          )}
        </View>

        {/* Platform Warning */}
        {Platform.OS === 'web' && (
          <View style={styles.warningCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="info" size={24} color="#FF9800" />
              <Text style={styles.cardTitle}>Platform Notice</Text>
            </View>
            
            <Text style={styles.warningText}>
              PDF export has limited functionality in web preview. For full PDF generation, file saving, and native sharing capabilities, please test on:
            </Text>
            
            <View style={styles.platformList}>
              <Text style={styles.platformItem}>📱 Physical Android/iOS device</Text>
              <Text style={styles.platformItem}>📲 Expo Go app</Text>
              <Text style={styles.platformItem}>🏗️ Standalone APK build</Text>
            </View>
            
            <Text style={styles.warningSubtext}>
              Web preview will show a demo of the PDF generation process.
            </Text>
          </View>
        )}
        <View style={styles.exportCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="picture-as-pdf" size={24} color="#F44336" />
            <Text style={styles.cardTitle}>PDF Export</Text>
          </View>
          
          <Text style={styles.cardDescription}>
            Generate a comprehensive PDF report containing all assessment data, risk scores, and treatment recommendations.
          </Text>

          <View style={styles.exportFeatures}>
            <View style={styles.feature}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Complete patient demographics</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>All calculated risk scores (ASCVD, FRAX, Gail, etc.)</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Risk assessment summary with color coding</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Treatment plan recommendations</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Decision support and contraindications</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Professional medical formatting</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.exportButton, (!currentPatient || isExporting) && styles.exportButtonDisabled]} 
            onPress={handleExportPDF}
            disabled={!currentPatient || isExporting}
          >
            <MaterialIcons name="file-download" size={20} color="white" />
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Generating PDF...' : 'Export Patient Assessment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sample Export */}
        <View style={styles.sampleCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="preview" size={24} color="#2196F3" />
            <Text style={styles.cardTitle}>Sample Export</Text>
          </View>
          
          <Text style={styles.cardDescription}>
            Generate a sample PDF with demo patient data to preview the export format.
          </Text>

          <TouchableOpacity 
            style={[styles.sampleButton, isExporting && styles.sampleButtonDisabled]} 
            onPress={handleSamplePDF}
            disabled={isExporting}
          >
            <MaterialIcons name="visibility" size={20} color="#2196F3" />
            <Text style={styles.sampleButtonText}>Generate Sample PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Export Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Export Information</Text>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="info" size={20} color="#666" />
            <Text style={styles.infoItemText}>
              PDF files are saved to your device and can be shared via email, messaging apps, or cloud storage.
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="security" size={20} color="#666" />
            <Text style={styles.infoItemText}>
              All exports include a confidentiality notice and are suitable for clinical documentation.
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="print" size={20} color="#666" />
            <Text style={styles.infoItemText}>
              PDFs are optimized for both screen viewing and printing on standard A4 paper.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
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
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  loadingIndicator: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoCard: {
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  patientInfo: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 5,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  assessmentDate: {
    fontSize: 12,
    color: '#999',
  },
  noPatientText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  warningCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
    marginBottom: 12,
  },
  warningSubtext: {
    fontSize: 12,
    color: '#FF8F00',
    fontStyle: 'italic',
    marginTop: 8,
  },
  platformList: {
    backgroundColor: '#FFFDE7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  platformItem: {
    fontSize: 13,
    color: '#F57C00',
    marginBottom: 4,
  },
  exportCard: {
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
  sampleCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  exportFeatures: {
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  exportButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  exportButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sampleButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  sampleButtonDisabled: {
    borderColor: '#999',
    opacity: 0.6,
  },
  sampleButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoItemText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
});