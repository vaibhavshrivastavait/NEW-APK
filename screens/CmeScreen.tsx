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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

// Import CME content - using import instead of require for APK compatibility
import cmeContentImport from '../assets/cme-content-merged.json';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  Demographics: undefined;
  Symptoms: undefined;
  RiskFactors: undefined;
  Results: undefined;
  Cme: undefined;
  CmeModule: { moduleId: string };
  CmeQuiz: { moduleId: string };
  CmeCertificate: undefined;
  Guidelines: undefined;
  PatientList: undefined;
  Export: undefined;
  PatientDetails: undefined;
  About: undefined;
};

type CmeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cme'>;

interface Props {
  navigation: CmeNavigationProp;
}

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

const STORAGE_KEYS = {
  CME_PROGRESS: 'cme_progress',
  CME_ATTEMPTS: 'cme_attempts',
  CME_CERTIFICATES: 'cme_certificates'
};

export default function CmeScreen({ navigation }: Props) {
  // Safely handle CME content with fallback for APK builds
  const [cmeContent] = useState(() => {
    try {
      return cmeContentImport || {
        modules: [],
        metadata: { totalCredits: 0 },
        popularQuizzes: { quizzes: [] }
      };
    } catch (error) {
      console.error('Error loading CME content:', error);
      return {
        modules: [],
        metadata: { totalCredits: 0 },
        popularQuizzes: { quizzes: [] }
      };
    }
  });
  const [progress, setProgress] = useState<CmeProgress>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  // Refresh progress when screen comes into focus (e.g., returning from quiz)
  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [])
  );

  const loadProgress = async () => {
    try {
      const savedProgress = await crashProofStorage.getItem(STORAGE_KEYS.CME_PROGRESS);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error loading CME progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalCredits = () => {
    let totalEarned = 0;
    cmeContent.modules.forEach((module: any) => {
      const moduleProgress = progress[module.id];
      if (moduleProgress?.completed) {
        totalEarned += module.credits;
      }
    });
    return totalEarned;
  };

  const calculateCompletionRate = () => {
    const completedModules = Object.values(progress).filter(p => p.completed).length;
    return cmeContent.modules.length > 0 ? (completedModules / cmeContent.modules.length) * 100 : 0;
  };

  const getLastActivity = () => {
    let lastAccess = '';
    Object.values(progress).forEach((p: any) => {
      if (p.lastAccessedAt && (!lastAccess || p.lastAccessedAt > lastAccess)) {
        lastAccess = p.lastAccessedAt;
      }
    });
    return lastAccess ? new Date(lastAccess).toLocaleDateString() : 'None';
  };

  const getContinueModule = () => {
    // Find the first incomplete module or the last accessed module
    for (const module of cmeContent.modules) {
      const moduleProgress = progress[module.id];
      if (!moduleProgress?.completed) {
        return module;
      }
    }
    return null;
  };

  const handleModulePress = (module: any) => {
    const moduleProgress = progress[module.id];
    if (moduleProgress?.completed) {
      Alert.alert(
        'Module Completed',
        `You've already completed this module with a score of ${moduleProgress.bestScore}%. Would you like to review it again?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Review', onPress: () => navigation.navigate('CmeModule', { moduleId: module.id }) }
        ]
      );
    } else {
      navigation.navigate('CmeModule', { moduleId: module.id });
    }
  };

  const handleTakeQuiz = (module: any) => {
    // Check if module has quiz questions
    if (!module.quizQuestions || module.quizQuestions.length === 0) {
      Alert.alert(
        'Quiz Not Available', 
        'This module does not have a quiz available yet.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate directly to quiz
    navigation.navigate('CmeQuiz', { moduleId: module.id });
  };

  const handleContinue = () => {
    const continueModule = getContinueModule();
    if (continueModule) {
      navigation.navigate('CmeModule', { moduleId: continueModule.id });
    }
  };

  const handleViewCertificate = () => {
    const completedModules = Object.values(progress).filter(p => p.completed).length;
    if (completedModules === cmeContent.modules.length) {
      navigation.navigate('CmeCertificate');
    } else {
      Alert.alert(
        'Certificate Not Available',
        `Complete all ${cmeContent.modules.length} modules to earn your certificate. You have completed ${completedModules} modules.`
      );
    }
  };

  // Helper function for difficulty colors
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#666';
    }
  };

  const renderModuleCard = ({ item }: { item: any }) => {
    const moduleProgress = progress[item.id];
    const isCompleted = moduleProgress?.completed || false;
    const progressPercentage = moduleProgress?.lastSlideIndex ? 
      ((moduleProgress.lastSlideIndex + 1) / item.slides.length) * 100 : 0;

    return (
      <View style={styles.moduleCard}>
        <TouchableOpacity onPress={() => handleModulePress(item)} style={styles.moduleMainContent}>
          <View style={styles.moduleHeader}>
            <MaterialIcons 
              name={isCompleted ? "check-circle" : "play-circle-outline"} 
              size={24} 
              color={isCompleted ? "#4CAF50" : "#D81B60"} 
            />
            <Text style={styles.moduleCredits}>{item.credits} Credit{item.credits !== 1 ? 's' : ''}</Text>
          </View>
          
          <Text style={styles.moduleTitle}>{item.title}</Text>
          <Text style={styles.moduleDescription} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${isCompleted ? 100 : progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {isCompleted ? 'Completed' : `${Math.round(progressPercentage)}%`}
            </Text>
          </View>
          
          <View style={styles.moduleFooter}>
            <Text style={styles.moduleTime}>~{item.estimatedMinutes} min</Text>
            <Text style={styles.moduleAction}>
              {isCompleted ? 'Review' : moduleProgress ? 'Continue' : 'Start'}
            </Text>
          </View>
          
          {isCompleted && moduleProgress && (
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>Score: {moduleProgress.bestScore}%</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.moduleActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.learnButton]}
            onPress={() => handleModulePress(item)}
            accessibilityRole="button"
            accessibilityLabel={`${isCompleted ? 'Review' : 'Start'} ${item.title} module`}
          >
            <MaterialIcons 
              name={isCompleted ? "refresh" : "play-arrow"} 
              size={16} 
              color="#D81B60" 
            />
            <Text style={styles.learnButtonText}>
              {isCompleted ? 'Review' : moduleProgress ? 'Continue' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.quizButton]}
            onPress={() => handleTakeQuiz(item)}
            accessibilityRole="button"
            accessibilityLabel={`Take quiz for ${item.title}`}
          >
            <MaterialIcons name="quiz" size={16} color="white" />
            <Text style={styles.quizButtonText}>Take Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading CME Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalCreditsEarned = calculateTotalCredits();
  const completionRate = calculateCompletionRate();
  const lastActivity = getLastActivity();
  const continueModule = getContinueModule();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CME Dashboard</Text>
        <TouchableOpacity
          style={styles.certificateButton}
          onPress={handleViewCertificate}
        >
          <MaterialIcons name="card-membership" size={24} color="#D81B60" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        nestedScrollEnabled={true}
      >
        {/* Progress Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalCreditsEarned}</Text>
              <Text style={styles.statLabel}>Credits Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.round(completionRate)}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{lastActivity}</Text>
              <Text style={styles.statLabel}>Last Activity</Text>
            </View>
          </View>
          
          {continueModule && (
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <MaterialIcons name="play-arrow" size={20} color="white" />
              <Text style={styles.continueButtonText}>
                Continue: {continueModule.title}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Popular CME Quizzes Section */}
        {cmeContent.popularQuizzes && (
          <View style={styles.popularSection}>
            <View style={styles.popularHeader}>
              <MaterialIcons name="star" size={24} color="#FFD700" />
              <Text style={styles.popularTitle}>Popular CME</Text>
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>NEW</Text>
              </View>
            </View>
            <Text style={styles.popularSubtitle}>
              Quick topic-focused quizzes on key MHT concepts
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.popularQuizzesContainer}
            >
              {cmeContent.popularQuizzes.quizzes.slice(0, 6).map((quiz: any) => (
                <TouchableOpacity
                  key={quiz.id}
                  style={styles.popularQuizCard}
                  onPress={() => navigation.navigate('CmeQuiz', { moduleId: quiz.id })}
                >
                  <View style={styles.quizIconContainer}>
                    <MaterialIcons name="quiz" size={32} color="#D81B60" />
                  </View>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizDetails}>
                    {quiz.questions.length} questions • {quiz.estimatedMinutes} min
                  </Text>
                  <View style={styles.quizDifficulty}>
                    <Text style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(quiz.difficulty) }
                    ]}>
                      {quiz.difficulty}
                    </Text>
                  </View>
                  <View style={styles.quizAction}>
                    <Text style={styles.quizActionText}>Start Quiz</Text>
                    <MaterialIcons name="play-arrow" size={16} color="#D81B60" />
                  </View>
                </TouchableOpacity>
              ))}
              
              {/* See All Button */}
              <TouchableOpacity
                style={styles.seeAllCard}
                onPress={() => {
                  Alert.alert(
                    'Popular CME Quizzes',
                    `View all ${cmeContent.popularQuizzes.quizzes.length} popular quizzes`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'View All', onPress: () => console.log('Navigate to all quizzes') }
                    ]
                  );
                }}
              >
                <MaterialIcons name="more-horiz" size={32} color="#666" />
                <Text style={styles.seeAllText}>
                  See All {cmeContent.popularQuizzes.quizzes.length} Quizzes
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Modules List */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Learning Modules</Text>
          {cmeContent.modules.map((module: any) => (
            <View key={module.id}>
              {renderModuleCard({ item: module })}
            </View>
          ))}
        </View>

        {/* CME Info */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color="#D81B60" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About This CME Program</Text>
            <Text style={styles.infoText}>
              Complete all modules to earn {cmeContent.metadata.totalCredits} practice credits. 
              Each module includes interactive slides and a quiz requiring ≥80% to pass.
            </Text>
          </View>
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
  backButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Increase opacity for better visibility
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.3)', // Add border for definition
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  backButtonText: {
    fontSize: 24,
    color: '#D81B60',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
  },
  certificateButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modulesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 16,
  },
  moduleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moduleMainContent: {
    padding: 16,
  },
  moduleActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48, // Accessibility requirement
  },
  learnButton: {
    backgroundColor: '#FFF5F7',
    borderWidth: 1,
    borderColor: '#D81B60',
  },
  learnButtonText: {
    color: '#D81B60',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quizButton: {
    backgroundColor: '#D81B60',
  },
  quizButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  moduleCredits: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#FDE7EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 60,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleTime: {
    fontSize: 12,
    color: '#999',
  },
  moduleAction: {
    fontSize: 14,
    color: '#D81B60',
    fontWeight: '600',
  },
  completionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  // Popular CME Styles
  popularSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginLeft: 8,
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#FF4081',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  popularSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  popularQuizzesContainer: {
    marginBottom: 8,
  },
  popularQuizCard: {
    backgroundColor: '#FFF5F7',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#F8BBD9',
  },
  quizIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    minHeight: 32,
  },
  quizDetails: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  quizDifficulty: {
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  quizAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D81B60',
  },
  quizActionText: {
    fontSize: 12,
    color: '#D81B60',
    fontWeight: '600',
    marginRight: 4,
  },
  seeAllCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
  },
  seeAllText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});