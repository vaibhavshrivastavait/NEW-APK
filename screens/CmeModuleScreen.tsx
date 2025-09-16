import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import crashProofStorage from '../utils/asyncStorageUtils';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

// Import CME content with proper error handling for APK compatibility
const loadCmeContent = () => {
  try {
    return require('../assets/cme-content.json');
  } catch (error) {
    console.error('Error loading CME content:', error);
    return {
      modules: []
    };
  }
};

type RootStackParamList = {
  Cme: undefined;
  CmeModule: { moduleId: string };
  CmeQuiz: { moduleId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'CmeModule'>;

const STORAGE_KEYS = {
  CME_PROGRESS: 'cme_progress',
};

const { width } = Dimensions.get('window');

export default function CmeModuleScreen({ navigation, route }: Props) {
  const { moduleId } = route.params;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [startTime] = useState(Date.now());

  const module = cmeContent.modules.find((m: any) => m.id === moduleId);

  useEffect(() => {
    if (module) {
      loadProgress();
    }
  }, [module]);

  const loadProgress = async () => {
    try {
      const savedProgress = await crashProofStorage.getItem(STORAGE_KEYS.CME_PROGRESS);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const moduleProgress = progress[moduleId];
        if (moduleProgress?.lastSlideIndex !== undefined) {
          setCurrentSlideIndex(moduleProgress.lastSlideIndex);
        }
      }
    } catch (error) {
      console.error('Error loading module progress:', error);
    }
  };

  const saveProgress = async (slideIndex: number) => {
    try {
      const savedProgress = await crashProofStorage.getItem(STORAGE_KEYS.CME_PROGRESS);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      
      if (!progress[moduleId]) {
        progress[moduleId] = {
          completed: false,
          bestScore: 0,
          attempts: 0,
          lastSlideIndex: 0,
          timeSpent: 0,
          lastAccessedAt: new Date().toISOString(),
        };
      }
      
      progress[moduleId].lastSlideIndex = slideIndex;
      progress[moduleId].timeSpent += Math.floor((Date.now() - startTime) / 1000);
      progress[moduleId].lastAccessedAt = new Date().toISOString();
      
      await crashProofStorage.setItem(STORAGE_KEYS.CME_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      saveProgress(newIndex);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < module.slides.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      saveProgress(newIndex);
    }
  };

  const handleTakeQuiz = () => {
    Alert.alert(
      'Ready for Quiz?',
      'You\'ve completed all slides. Ready to test your knowledge?',
      [
        { text: 'Review More', style: 'cancel' },
        { 
          text: 'Start Quiz', 
          onPress: () => navigation.navigate('CmeQuiz', { moduleId })
        }
      ]
    );
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a full implementation, save bookmarked slides to storage
  };

  const renderTable = (table: any) => {
    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{table.title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableRow}>
              {table.columns.map((column: string, index: number) => (
                <Text key={index} style={[styles.tableCell, styles.tableHeader]}>
                  {column}
                </Text>
              ))}
            </View>
            {/* Rows */}
            {table.rows.map((row: string[], rowIndex: number) => (
              <View key={rowIndex} style={styles.tableRow}>
                {row.map((cell: string, cellIndex: number) => (
                  <Text key={cellIndex} style={styles.tableCell}>
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  if (!module) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#F44336" />
          <Text style={styles.errorText}>Module not found</Text>
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

  const currentSlide = module.slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === module.slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{module.title}</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={toggleBookmark}
        >
          <MaterialIcons 
            name={isBookmarked ? "bookmark" : "bookmark-border"} 
            size={24} 
            color={isBookmarked ? "#D81B60" : "#999"} 
          />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentSlideIndex + 1) / module.slides.length) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentSlideIndex + 1} of {module.slides.length}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.slideContainer}>
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
          
          <Text style={styles.slideContent}>
            {currentSlide.body_md.replace(/##/g, '\n').replace(/\*\*/g, '')}
          </Text>

          {/* Bullets */}
          {currentSlide.bullets && currentSlide.bullets.length > 0 && (
            <View style={styles.bulletsSection}>
              <Text style={styles.bulletsTitle}>Key Points:</Text>
              {currentSlide.bullets.map((bullet: string, index: number) => (
                <View key={index} style={styles.bulletItem}>
                  <MaterialIcons name="fiber-manual-record" size={8} color="#D81B60" />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tables */}
          {currentSlide.tables && currentSlide.tables.map((table: any, index: number) => (
            <View key={index}>
              {renderTable(table)}
            </View>
          ))}

          {/* Citations */}
          {currentSlide.citations && currentSlide.citations.length > 0 && (
            <View style={styles.citationsSection}>
              <Text style={styles.citationsTitle}>References:</Text>
              {currentSlide.citations.map((citation: any, index: number) => (
                <View key={index} style={styles.citationItem}>
                  <MaterialIcons name="link" size={16} color="#D81B60" />
                  <Text style={styles.citationText}>
                    {citation.label} ({citation.year})
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentSlideIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentSlideIndex === 0}
        >
          <MaterialIcons 
            name="chevron-left" 
            size={24} 
            color={currentSlideIndex === 0 ? "#ccc" : "#D81B60"} 
          />
          <Text style={[
            styles.navButtonText, 
            currentSlideIndex === 0 && styles.navButtonTextDisabled
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        {isLastSlide ? (
          <TouchableOpacity 
            style={styles.quizButton}
            onPress={handleTakeQuiz}
          >
            <MaterialIcons name="quiz" size={20} color="white" />
            <Text style={styles.quizButtonText}>Take Quiz</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <MaterialIcons name="chevron-right" size={24} color="#D81B60" />
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
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
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  slideContainer: {
    padding: 20,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 20,
    lineHeight: 32,
  },
  slideContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  bulletsSection: {
    marginVertical: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bulletsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  tableContainer: {
    marginVertical: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableCell: {
    padding: 12,
    minWidth: 100,
    fontSize: 14,
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
    color: '#D81B60',
  },
  citationsSection: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  citationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 12,
  },
  citationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  citationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#D81B60',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D81B60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  quizButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginTop: 16,
    marginBottom: 24,
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