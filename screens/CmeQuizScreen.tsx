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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Import CME content with proper error handling for APK compatibility
const loadCmeContent = () => {
  try {
    return require('../assets/cme-content-merged.json');
  } catch (error) {
    console.error('Error loading CME content:', error);
    return {
      modules: [],
      popularQuizzes: { quizzes: [] }
    };
  }
};

type RootStackParamList = {
  Cme: undefined;
  CmeModule: { moduleId: string };
  CmeQuiz: { moduleId: string };
  CmeCertificate: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CmeQuiz'>;

interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeTaken: number;
}

interface QuizAttempt {
  moduleId: string;
  score: number;
  passed: boolean;
  startedAt: string;
  finishedAt: string;
  durationSec: number;
  answers: QuizAnswer[];
  attemptNumber: number;
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
};

const PASSING_SCORE = 80; // 80% required to pass

export default function CmeQuizScreen({ navigation, route }: Props) {
  const { moduleId } = route.params;
  
  // Safely handle CME content with fallback for APK builds
  const [cmeContent] = useState(() => loadCmeContent());
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizAttempt | null>(null);
  const [progress, setProgress] = useState<CmeProgress>({});
  
  // Find the module from regular modules or popular quizzes
  const module = cmeContent.modules.find((m: any) => m.id === moduleId) || 
                 cmeContent.popularQuizzes?.quizzes.find((q: any) => q.id === moduleId);
  
  const [shuffledQuestions] = useState(() => {
    if (!module) return [];
    
    // Handle different question structures - modules have quizQuestions, popular quizzes have questions
    const questionsSource = module.quizQuestions || module.questions;
    if (!questionsSource) return [];
    
    // Create a copy of questions and shuffle them
    const questions = [...questionsSource];
    
    // Simple shuffle using Math.random - deterministic per session
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    // For each question, shuffle the options but track the correct answer
    questions.forEach((question: any) => {
      const originalCorrectIndex = question.correctIndex;
      const optionsWithIndex = question.options.map((option: string, index: number) => ({
        option,
        originalIndex: index,
        isCorrect: index === originalCorrectIndex
      }));
      
      // Shuffle the options
      for (let i = optionsWithIndex.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
      }
      
      // Extract shuffled options and find new correct index
      question.shuffledOptions = optionsWithIndex.map(item => item.option);
      question.shuffledCorrectIndex = optionsWithIndex.findIndex(item => item.isCorrect);
    });
    
    return questions;
  });

  useEffect(() => {
    loadProgress();
    setQuestionStartTime(Date.now());
  }, []);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const loadProgress = async () => {
    try {
      const savedProgress = await crashProofStorage.getItem(STORAGE_KEYS.CME_PROGRESS);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Add atomic state management for answer selection
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionToken, setSelectionToken] = useState<string | null>(null);

  const handleAnswerSelect = async (optionIndex: number) => {
    if (showExplanation || isSubmitting) return; // Prevent changing answer after seeing explanation or during submission
    
    // Atomic selection with race-condition prevention
    const token = Date.now().toString();
    setSelectionToken(token);
    setIsSubmitting(true);
    
    // Immediately update selection state
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
    
    // Add small debounce to prevent rapid double-clicks
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Check if this selection is still current (not superseded by another click)
    if (selectionToken !== token) {
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(false);
  };

  const handleSubmitAnswer = async () => {
    const selectedIndex = selectedAnswers[currentQuestionIndex];
    if (selectedIndex === undefined) {
      Alert.alert('No Answer Selected', 'Please select an answer before submitting.');
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.shuffledCorrectIndex;
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedIndex,
      isCorrect,
      timeTaken,
    };

    setQuizAnswers([...quizAnswers, answer]);
    
    // Small delay before showing explanation to ensure state is stable
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setShowExplanation(true);
    setIsSubmitting(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    const totalQuestions = shuffledQuestions.length;
    const correctAnswers = quizAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= PASSING_SCORE;
    const durationSec = Math.floor((Date.now() - startTime) / 1000);

    try {
      // Save quiz attempt
      const attempts = await crashProofStorage.getItem(STORAGE_KEYS.CME_ATTEMPTS);
      const allAttempts = attempts ? JSON.parse(attempts) : [];
      const moduleAttempts = allAttempts.filter((a: QuizAttempt) => a.moduleId === moduleId);
      
      const attempt: QuizAttempt = {
        moduleId,
        score,
        passed,
        startedAt: new Date(startTime).toISOString(),
        finishedAt: new Date().toISOString(),
        durationSec,
        answers: quizAnswers,
        attemptNumber: moduleAttempts.length + 1,
      };

      allAttempts.push(attempt);
      await crashProofStorage.setItem(STORAGE_KEYS.CME_ATTEMPTS, JSON.stringify(allAttempts));

      // Update progress
      const currentProgress = { ...progress };
      if (!currentProgress[moduleId]) {
        currentProgress[moduleId] = {
          completed: false,
          bestScore: 0,
          attempts: 0,
          lastSlideIndex: 0,
          timeSpent: 0,
          lastAccessedAt: new Date().toISOString(),
        };
      }

      currentProgress[moduleId].attempts += 1;
      currentProgress[moduleId].bestScore = Math.max(currentProgress[moduleId].bestScore, score);
      if (passed) {
        currentProgress[moduleId].completed = true;
      }
      currentProgress[moduleId].lastAccessedAt = new Date().toISOString();

      setProgress(currentProgress);
      await crashProofStorage.setItem(STORAGE_KEYS.CME_PROGRESS, JSON.stringify(currentProgress));

      setQuizResults(attempt);
      setIsQuizComplete(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      Alert.alert('Error', 'There was an error saving your quiz results.');
    }
  };

  const handleRetakeQuiz = () => {
    // Reset quiz state
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizAnswers([]);
    setShowExplanation(false);
    setIsQuizComplete(false);
    setQuizResults(null);
    setQuestionStartTime(Date.now());
  };

  const handleFinishQuiz = () => {
    if (quizResults?.passed) {
      // Check if all modules completed for certificate
      const allModules = cmeContent.modules;
      const completedModules = Object.values(progress).filter(p => p.completed).length + (quizResults.passed ? 1 : 0);
      
      if (completedModules === allModules.length) {
        Alert.alert(
          'Congratulations!',
          'You\'ve completed all modules! Would you like to generate your certificate?',
          [
            { text: 'Later', onPress: () => navigation.navigate('Cme') },
            { text: 'Generate Certificate', onPress: () => navigation.navigate('CmeCertificate') }
          ]
        );
      } else {
        navigation.navigate('Cme');
      }
    } else {
      navigation.navigate('Cme');
    }
  };

  const getRetakeInfo = () => {
    const moduleProgress = progress[moduleId];
    if (!moduleProgress) return { canRetake: true, message: '' };
    
    if (moduleProgress.attempts === 0) {
      return { canRetake: true, message: '' };
    } else if (moduleProgress.attempts === 1) {
      return { canRetake: true, message: 'You have 1 immediate retake available.' };
    } else {
      // Check if 24 hours have passed since last attempt
      const lastAttempt = new Date(moduleProgress.lastAccessedAt);
      const now = new Date();
      const hoursSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastAttempt >= 24) {
        return { canRetake: true, message: 'Retake available (24-hour cooldown completed).' };
      } else {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastAttempt);
        return { 
          canRetake: false, 
          message: `Retake available in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}.` 
        };
      }
    }
  };

  if (!module) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color="#D81B60" />
          <Text style={styles.errorText}>Quiz not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isQuizComplete && quizResults) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.resultsContainer}>
            {/* Results Header */}
            <View style={[
              styles.resultsHeader,
              { backgroundColor: quizResults.passed ? '#4CAF50' : '#F44336' }
            ]}>
              <MaterialIcons 
                name={quizResults.passed ? "check-circle" : "cancel"} 
                size={64} 
                color="white" 
              />
              <Text style={styles.resultsTitle}>
                {quizResults.passed ? 'Congratulations!' : 'Not Quite There'}
              </Text>
              <Text style={styles.resultsSubtitle}>
                {quizResults.passed 
                  ? 'You passed the quiz!' 
                  : `You need ${PASSING_SCORE}% to pass`
                }
              </Text>
            </View>

            {/* Score Details */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={[
                styles.scoreValue,
                { color: quizResults.passed ? '#4CAF50' : '#F44336' }
              ]}>
                {quizResults.score}%
              </Text>
              <Text style={styles.scoreDetails}>
                {quizResults.answers.filter(a => a.isCorrect).length} out of {shuffledQuestions.length} correct
              </Text>
              <Text style={styles.scoreDetails}>
                Time: {Math.floor(quizResults.durationSec / 60)}m {quizResults.durationSec % 60}s
              </Text>
            </View>

            {/* Question Review */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>Question Review</Text>
              {shuffledQuestions.map((question: any, index: number) => {
                const answer = quizResults.answers[index];
                return (
                  <View key={question.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewQuestionNumber}>Q{index + 1}</Text>
                      <MaterialIcons 
                        name={answer.isCorrect ? "check" : "close"} 
                        size={20} 
                        color={answer.isCorrect ? "#4CAF50" : "#F44336"} 
                      />
                    </View>
                    <Text style={styles.reviewQuestion}>{question.question}</Text>
                    {!answer.isCorrect && (
                      <View style={styles.reviewExplanation}>
                        <Text style={styles.explanationTitle}>Correct Answer:</Text>
                        <Text style={styles.explanationText}>
                          {question.shuffledOptions[question.shuffledCorrectIndex]}
                        </Text>
                        <Text style={styles.explanationText}>
                          {question.explanation}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {!quizResults.passed && (
                <>
                  {(() => {
                    const retakeInfo = getRetakeInfo();
                    return retakeInfo.canRetake ? (
                      <TouchableOpacity 
                        style={styles.retakeButton} 
                        onPress={handleRetakeQuiz}
                      >
                        <MaterialIcons name="refresh" size={20} color="white" />
                        <Text style={styles.retakeButtonText}>Retake Quiz</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.retakeDisabled}>
                        <Text style={styles.retakeDisabledText}>{retakeInfo.message}</Text>
                      </View>
                    );
                  })()}
                </>
              )}
              
              <TouchableOpacity 
                style={styles.finishButton} 
                onPress={handleFinishQuiz}
              >
                <Text style={styles.finishButtonText}>
                  {quizResults.passed ? 'Continue to Dashboard' : 'Back to Dashboard'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedIndex = selectedAnswers[currentQuestionIndex];
  const isAnswerSelected = selectedIndex !== undefined;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('Close button pressed - navigating to CME dashboard');
            Alert.alert(
              'Exit Quiz?',
              'Your progress will be lost. Are you sure you want to exit?',
              [
                { text: 'Continue Quiz', style: 'cancel' },
                { text: 'Exit', onPress: () => {
                  console.log('Exiting quiz - navigating to Cme dashboard');
                  navigation.navigate('Cme');
                }, style: 'destructive' }
              ]
            );
          }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{module.title} Quiz</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} of {shuffledQuestions.length}
        </Text>
      </View>

      {/* Question */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.shuffledOptions.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  // Deterministic styling - correct state takes precedence over selected/incorrect
                  selectedIndex === index && !showExplanation && styles.optionButtonSelected,
                  showExplanation && index === currentQuestion.shuffledCorrectIndex && styles.optionButtonCorrect,
                  showExplanation && selectedIndex === index && index !== currentQuestion.shuffledCorrectIndex && styles.optionButtonIncorrect,
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={showExplanation || isSubmitting}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Option ${String.fromCharCode(65 + index)}: ${option}`}
                accessibilityState={{
                  selected: selectedIndex === index,
                  disabled: showExplanation || isSubmitting
                }}
              >
                <View style={[
                  styles.optionMarker,
                  // Deterministic styling - correct state takes precedence
                  selectedIndex === index && !showExplanation && styles.optionMarkerSelected,
                  showExplanation && index === currentQuestion.shuffledCorrectIndex && styles.optionMarkerCorrect,
                  showExplanation && selectedIndex === index && index !== currentQuestion.shuffledCorrectIndex && styles.optionMarkerIncorrect,
                ]}>
                  <Text style={[
                    styles.optionMarkerText,
                    selectedIndex === index && !showExplanation && styles.optionMarkerTextSelected,
                    showExplanation && index === currentQuestion.shuffledCorrectIndex && styles.optionMarkerTextCorrect,
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  selectedIndex === index && !showExplanation && styles.optionTextSelected,
                  showExplanation && index === currentQuestion.shuffledCorrectIndex && styles.optionTextCorrect,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <View 
              style={styles.explanationContainer}
              accessible={true}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              <View style={styles.explanationHeader}>
                <MaterialIcons 
                  name={selectedIndex === currentQuestion.shuffledCorrectIndex ? "check-circle" : "cancel"} 
                  size={24} 
                  color={selectedIndex === currentQuestion.shuffledCorrectIndex ? "#4CAF50" : "#F44336"} 
                />
                <Text 
                  style={styles.explanationTitle}
                  accessible={true}
                  accessibilityLabel={selectedIndex === currentQuestion.shuffledCorrectIndex ? 'Your answer is correct' : 'Your answer is incorrect'}
                >
                  {selectedIndex === currentQuestion.shuffledCorrectIndex ? 'Correct!' : 'Incorrect'}
                </Text>
              </View>
              <Text 
                style={styles.explanationText}
                accessible={true}
                accessibilityLabel={`Explanation: ${currentQuestion.explanation}`}
              >
                {currentQuestion.explanation}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {!showExplanation ? (
          <TouchableOpacity 
            style={[styles.submitButton, !isAnswerSelected && styles.submitButtonDisabled]}
            onPress={handleSubmitAnswer}
            disabled={!isAnswerSelected}
          >
            <Text style={[styles.submitButtonText, !isAnswerSelected && styles.submitButtonTextDisabled]}>
              Submit Answer
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
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
  closeButtonText: {
    fontSize: 20,
    color: '#D81B60',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    paddingVertical: 20,
  },
  questionNumber: {
    fontSize: 16,
    color: '#D81B60',
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: '#D81B60',
    backgroundColor: '#FDE7EF',
  },
  optionButtonCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  optionButtonIncorrect: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionMarkerSelected: {
    backgroundColor: '#D81B60',
  },
  optionMarkerCorrect: {
    backgroundColor: '#4CAF50',
  },
  optionMarkerIncorrect: {
    backgroundColor: '#F44336',
  },
  optionMarkerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  optionMarkerTextSelected: {
    color: 'white',
  },
  optionMarkerTextCorrect: {
    color: 'white',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#D81B60',
  },
  optionTextCorrect: {
    color: '#4CAF50',
  },
  explanationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#D81B60',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  resultsContainer: {
    padding: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 8,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reviewSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewQuestionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D81B60',
  },
  reviewQuestion: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewExplanation: {
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 12,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  retakeDisabled: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  retakeDisabledText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  finishButton: {
    backgroundColor: '#D81B60',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
  },
  backButton: {
    backgroundColor: '#D81B60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});