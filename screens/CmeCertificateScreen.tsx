import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import crashProofStorage from '../utils/asyncStorageUtils';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Import CME content with proper error handling for APK compatibility
const loadCmeContent = () => {
  try {
    return require('../assets/cme-content.json');
  } catch (error) {
    console.error('Error loading CME content:', error);
    return {
      modules: [],
      metadata: { totalCredits: 0 }
    };
  }
};

type RootStackParamList = {
  Cme: undefined;
  CmeCertificate: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CmeCertificate'>;

interface CmeProgress {
  [moduleId: string]: {
    completed: boolean;
    bestScore: number;
    attempts: number;
    lastSlideIndex: number;
    timeSpent: number;
    lastAccessedAt: string;
  };
}

interface CmeAttempt {
  moduleId: string;
  score: number;
  passed: boolean;
  startedAt: string;
  finishedAt: string;
  durationSec: number;
  answers: any[];
  attemptNumber: number;
}

const STORAGE_KEYS = {
  CME_PROGRESS: 'cme_progress',
  CME_ATTEMPTS: 'cme_attempts',
  CME_CERTIFICATES: 'cme_certificates'
};

export default function CmeCertificateScreen({ navigation }: Props) {
  // Safely handle CME content with fallback for APK builds
  const [cmeContent] = useState(() => loadCmeContent());
  const [progress, setProgress] = useState<CmeProgress>({});
  const [attempts, setAttempts] = useState<CmeAttempt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateId, setCertificateId] = useState<string>('');

  useEffect(() => {
    loadData();
    generateCertificateId();
  }, []);

  const loadData = async () => {
    try {
      const [savedProgress, savedAttempts] = await Promise.all([
        crashProofStorage.getItem(STORAGE_KEYS.CME_PROGRESS),
        crashProofStorage.getItem(STORAGE_KEYS.CME_ATTEMPTS)
      ]);

      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }

      if (savedAttempts) {
        setAttempts(JSON.parse(savedAttempts));
      }
    } catch (error) {
      console.error('Error loading CME data:', error);
    }
  };

  const generateCertificateId = () => {
    // Generate a unique certificate ID
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCertificateId(`MHT-CME-${timestamp.slice(-6)}-${random}`);
  };

  const calculateStats = () => {
    const completedModules = Object.entries(progress).filter(([_, p]) => p.completed);
    const totalCredits = completedModules.reduce((sum, [moduleId]) => {
      const module = cmeContent.modules.find((m: any) => m.id === moduleId);
      return sum + (module?.credits || 0);
    }, 0);

    const averageScore = completedModules.reduce((sum, [moduleId]) => {
      return sum + progress[moduleId].bestScore;
    }, 0) / completedModules.length;

    const totalTimeSpent = Object.values(progress).reduce((sum, p) => sum + p.timeSpent, 0);
    const totalHours = Math.round((totalTimeSpent / 3600) * 10) / 10;

    return {
      completedModules: completedModules.length,
      totalModules: cmeContent.modules.length,
      totalCredits,
      averageScore: Math.round(averageScore),
      totalHours,
      completionDate: new Date().toLocaleDateString()
    };
  };

  const generateCertificateHTML = () => {
    const stats = calculateStats();
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Times New Roman', serif;
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #fdf7f7 0%, #f8f0f7 100%);
            }
            .certificate {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 60px;
                border: 8px solid #D81B60;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                position: relative;
            }
            .certificate::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                bottom: 20px;
                border: 3px solid #FFC1CC;
                border-radius: 10px;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .logo {
                width: 80px;
                height: 80px;
                background: #D81B60;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 36px;
                font-weight: bold;
            }
            .title {
                font-size: 36px;
                color: #D81B60;
                margin: 20px 0;
                font-weight: bold;
                letter-spacing: 2px;
            }
            .subtitle {
                font-size: 18px;
                color: #666;
                margin-bottom: 30px;
            }
            .recipient {
                text-align: center;
                margin: 40px 0;
            }
            .recipient-name {
                font-size: 32px;
                color: #333;
                margin: 20px 0;
                font-weight: bold;
                text-decoration: underline;
                text-decoration-color: #D81B60;
            }
            .achievement {
                text-align: center;
                font-size: 18px;
                color: #555;
                line-height: 1.8;
                margin: 30px 0;
            }
            .modules {
                margin: 30px 0;
            }
            .modules h3 {
                color: #D81B60;
                font-size: 20px;
                margin-bottom: 15px;
                text-align: center;
            }
            .module-list {
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
                margin-bottom: 20px;
            }
            .module-item {
                padding: 8px 12px;
                background: #FFF5F7;
                border-left: 4px solid #D81B60;
                font-size: 14px;
                color: #333;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin: 30px 0;
                text-align: center;
            }
            .stat-item {
                background: #FFF5F7;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #FFC1CC;
            }
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #D81B60;
                margin-bottom: 5px;
            }
            .stat-label {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .signature-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-top: 60px;
                text-align: center;
            }
            .signature-block {
                border-top: 2px solid #333;
                padding-top: 10px;
            }
            .signature-title {
                font-size: 14px;
                color: #666;
                font-weight: bold;
            }
            .signature-name {
                font-size: 16px;
                color: #333;
                margin-top: 5px;
            }
            .certificate-footer {
                text-align: center;
                margin-top: 40px;
                font-size: 12px;
                color: #999;
                border-top: 1px solid #E0E0E0;
                padding-top: 20px;
            }
            .certificate-id {
                font-family: 'Courier New', monospace;
                color: #666;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">
                <div class="logo">MHT</div>
                <h1 class="title">CERTIFICATE OF COMPLETION</h1>
                <p class="subtitle">Menopause Hormone Therapy (MHT) Assessment Program</p>
            </div>

            <div class="recipient">
                <p style="font-size: 18px; color: #666;">This certifies that</p>
                <div class="recipient-name">Healthcare Professional</div>
                <p style="font-size: 16px; color: #666;">has successfully completed</p>
            </div>

            <div class="achievement">
                <strong>MHT Clinical Assessment Training Program</strong><br>
                A comprehensive continuing medical education program covering evidence-based 
                menopause hormone therapy assessment, risk evaluation, and clinical decision-making.
            </div>

            <div class="modules">
                <h3>Completed Learning Modules</h3>
                <div class="module-list">
                    ${cmeContent.modules.map((module: any) => `
                        <div class="module-item">
                            <strong>${module.title}</strong> - ${module.credits} Credit${module.credits !== 1 ? 's' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.totalCredits}</div>
                    <div class="stat-label">Practice Credits</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.averageScore}%</div>
                    <div class="stat-label">Average Score</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalHours}h</div>
                    <div class="stat-label">Study Time</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.completionDate}</div>
                    <div class="stat-label">Completion Date</div>
                </div>
            </div>

            <div class="signature-section">
                <div class="signature-block">
                    <div class="signature-title">MEDICAL DIRECTOR</div>
                    <div class="signature-name">Dr. Sarah Johnson, MD</div>
                </div>
                <div class="signature-block">
                    <div class="signature-title">PROGRAM COORDINATOR</div>
                    <div class="signature-name">Dr. Michael Chen, MD</div>
                </div>
            </div>

            <div class="certificate-footer">
                <p><strong>MHT Assessment Training Program</strong></p>
                <p>This certificate represents the completion of ${stats.totalCredits} practice credits 
                   in menopause hormone therapy clinical assessment and evidence-based decision making.</p>
                <p><em>Note: This certificate represents practice credits and educational achievement. 
                   For accredited CME credits, please contact your professional medical organization.</em></p>
                <div class="certificate-id">Certificate ID: ${certificateId}</div>
            </div>
        </div>
    </body>
    </html>
    `;
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const htmlContent = generateCertificateHTML();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Save certificate record
      const certificateRecord = {
        id: certificateId,
        generatedAt: new Date().toISOString(),
        filePath: uri,
        stats: calculateStats(),
      };

      const existingCertificates = await crashProofStorage.getItem(STORAGE_KEYS.CME_CERTIFICATES);
      const certificates = existingCertificates ? JSON.parse(existingCertificates) : [];
      certificates.push(certificateRecord);
      await crashProofStorage.setItem(STORAGE_KEYS.CME_CERTIFICATES, JSON.stringify(certificates));

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Share Your CME Certificate',
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert(
          'Certificate Generated',
          'Your certificate has been generated successfully. You can find it in your device\'s downloads folder.',
        );
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      Alert.alert(
        'Error',
        'There was an error generating your certificate. Please try again.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPreview = async () => {
    try {
      const htmlContent = generateCertificateHTML();
      
      await Print.printAsync({
        html: htmlContent,
        printerUrl: undefined, // This will show print preview
      });
    } catch (error) {
      console.error('Error showing print preview:', error);
      Alert.alert('Error', 'Could not show print preview.');
    }
  };

  const stats = calculateStats();

  // Check if all modules are completed
  if (stats.completedModules < stats.totalModules) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
          </TouchableOpacity>
          <Text style={styles.title}>Certificate</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.incompleteContainer}>
          <MaterialIcons name="school" size={96} color="#DDD" />
          <Text style={styles.incompleteTitle}>Certificate Not Available</Text>
          <Text style={styles.incompleteMessage}>
            Complete all {stats.totalModules} learning modules to earn your certificate.
          </Text>
          <Text style={styles.incompleteProgress}>
            Progress: {stats.completedModules} of {stats.totalModules} modules completed
          </Text>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.navigate('Cme')}
          >
            <MaterialIcons name="play-arrow" size={20} color="white" />
            <Text style={styles.continueButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Certificate</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Congratulations */}
        <View style={styles.congratsCard}>
          <MaterialIcons name="celebration" size={64} color="#4CAF50" />
          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsMessage}>
            You have successfully completed the MHT Assessment Training Program!
          </Text>
        </View>

        {/* Achievement Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Achievement</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalCredits}</Text>
              <Text style={styles.statLabel}>Practice Credits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalHours}h</Text>
              <Text style={styles.statLabel}>Study Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedModules}</Text>
              <Text style={styles.statLabel}>Modules Completed</Text>
            </View>
          </View>
        </View>

        {/* Completed Modules */}
        <View style={styles.modulesCard}>
          <Text style={styles.modulesTitle}>Completed Modules</Text>
          {cmeContent.modules.map((module: any) => {
            const moduleProgress = progress[module.id];
            return (
              <View key={module.id} style={styles.moduleItem}>
                <View style={styles.moduleIcon}>
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleName}>{module.title}</Text>
                  <Text style={styles.moduleCredits}>
                    {module.credits} Credit{module.credits !== 1 ? 's' : ''} • 
                    Score: {moduleProgress?.bestScore || 0}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Certificate Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Download Your Certificate</Text>
          <Text style={styles.actionsMessage}>
            Generate a professional PDF certificate to share your achievement.
          </Text>
          
          <View style={styles.certificateInfo}>
            <MaterialIcons name="badge" size={24} color="#D81B60" />
            <View style={styles.certificateDetails}>
              <Text style={styles.certificateId}>Certificate ID: {certificateId}</Text>
              <Text style={styles.certificateDate}>
                Issued: {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={handlePrintPreview}
            >
              <MaterialIcons name="preview" size={20} color="#D81B60" />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={handleGeneratePDF}
              disabled={isGenerating}
            >
              <MaterialIcons 
                name={isGenerating ? "hourglass-empty" : "download"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating...' : 'Generate & Share'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <MaterialIcons name="info" size={20} color="#666" />
          <Text style={styles.disclaimerText}>
            This certificate represents practice credits and educational achievement. 
            For accredited CME credits, please contact your professional medical organization.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFC1CC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  congratsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  congratsMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFF5F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modulesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 16,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  moduleIcon: {
    marginRight: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  moduleCredits: {
    fontSize: 12,
    color: '#666',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 8,
  },
  actionsMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  certificateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  certificateDetails: {
    marginLeft: 12,
    flex: 1,
  },
  certificateId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  certificateDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F7',
    borderColor: '#D81B60',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 16,
  },
  previewButtonText: {
    color: '#D81B60',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D81B60',
    borderRadius: 8,
    paddingVertical: 16,
  },
  generateButtonDisabled: {
    backgroundColor: '#CCC',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginLeft: 8,
  },
  incompleteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  incompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  incompleteMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  incompleteProgress: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D81B60',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});