import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  MHT_GUIDELINES, 
  GuidelineSection, 
  ClinicalRecommendation, 
  DecisionTreeNode,
  DECISION_TREES 
} from '../data/comprehensiveMHTGuidelines';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = (SCREEN_WIDTH - 40) / 4;

type GuidelinesNavigationProp = NativeStackNavigationProp<any, 'Guidelines'>;

interface Props {
  navigation: GuidelinesNavigationProp;
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'view-module', color: '#1976D2' },
  { key: 'critical', label: 'Critical', icon: 'priority-high', color: '#D32F2F' },
  { key: 'important', label: 'Important', icon: 'star', color: '#F57C00' },
  { key: 'tools', label: 'Tools', icon: 'build', color: '#388E3C' },
];

const PRIORITY_COLORS = {
  critical: '#FFEBEE',
  important: '#FFF3E0',
  standard: '#F5F5F5'
};

const EVIDENCE_COLORS = {
  'High': '#4CAF50',
  'Moderate': '#FF9800',
  'Low': '#FF5722',
  'Very Low': '#9E9E9E'
};

const BOOKMARKS_KEY = 'mht_professional_guidelines_bookmarks';

export default function ProfessionalGuidelinesScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuideline, setSelectedGuideline] = useState<GuidelineSection | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showDecisionTree, setShowDecisionTree] = useState(false);
  const [decisionTreePath, setDecisionTreePath] = useState<string[]>([]);
  const [currentDecisionNode, setCurrentDecisionNode] = useState<DecisionTreeNode | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const saved = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const saveBookmarks = async (newBookmarks: string[]) => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const toggleBookmark = (guidelineId: string) => {
    const newBookmarks = bookmarks.includes(guidelineId)
      ? bookmarks.filter(id => id !== guidelineId)
      : [...bookmarks, guidelineId];
    saveBookmarks(newBookmarks);
  };

  const filteredGuidelines = useMemo(() => {
    let filtered = MHT_GUIDELINES;

    // Filter by category
    if (selectedCategory === 'critical') {
      filtered = filtered.filter(g => g.priority === 'critical');
    } else if (selectedCategory === 'important') {
      filtered = filtered.filter(g => g.priority === 'important');
    } else if (selectedCategory === 'tools') {
      filtered = filtered.filter(g => g.decisionTree || g.quickReference);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(guideline =>
        guideline.title.toLowerCase().includes(query) ||
        guideline.content.overview.toLowerCase().includes(query) ||
        guideline.content.keyPoints.some(point => point.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const startDecisionTree = (guideline: GuidelineSection) => {
    if (!guideline.decisionTree) return;
    
    setCurrentDecisionNode(guideline.decisionTree);
    setDecisionTreePath([]);
    setShowDecisionTree(true);
  };

  const handleDecisionChoice = (option: any) => {
    if (option.nextNodeId) {
      // Navigate to next node
      const treeKey = Object.keys(DECISION_TREES).find(key => 
        DECISION_TREES[key][option.nextNodeId]
      );
      if (treeKey && DECISION_TREES[treeKey][option.nextNodeId]) {
        setCurrentDecisionNode(DECISION_TREES[treeKey][option.nextNodeId]);
        setDecisionTreePath(prev => [...prev, option.text]);
      }
    } else {
      // Show outcome
      setDecisionTreePath(prev => [...prev, option.text]);
      Alert.alert(
        'Recommendation',
        option.outcome,
        [
          { text: 'Start Over', onPress: () => setShowDecisionTree(false) },
          { text: 'OK' }
        ]
      );
    }
  };

  const renderCategoryTabs = () => (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              selectedCategory === category.key && styles.activeTab,
              { backgroundColor: selectedCategory === category.key ? category.color : 'white' }
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <MaterialIcons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.key ? 'white' : category.color} 
            />
            <Text style={[
              styles.tabText,
              { color: selectedCategory === category.key ? 'white' : category.color }
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPriorityBadge = (priority: string) => (
    <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[priority] }]}>
      <MaterialIcons 
        name={priority === 'critical' ? 'priority-high' : priority === 'important' ? 'star' : 'info'} 
        size={12} 
        color={priority === 'critical' ? '#D32F2F' : priority === 'important' ? '#F57C00' : '#757575'} 
      />
      <Text style={[styles.priorityText, { 
        color: priority === 'critical' ? '#D32F2F' : priority === 'important' ? '#F57C00' : '#757575' 
      }]}>
        {priority.toUpperCase()}
      </Text>
    </View>
  );

  const renderEvidenceGrade = (recommendation: ClinicalRecommendation) => (
    <View style={styles.evidenceContainer}>
      <View style={[styles.evidenceBadge, { backgroundColor: EVIDENCE_COLORS[recommendation.evidenceLevel] }]}>
        <Text style={styles.evidenceText}>
          {recommendation.evidenceLevel}
        </Text>
      </View>
      <Text style={styles.gradeText}>
        {recommendation.grade} Recommendation
      </Text>
    </View>
  );

  const renderGuidelineCard = (guideline: GuidelineSection) => {
    const isBookmarked = bookmarks.includes(guideline.id);
    const isExpanded = expandedSections[guideline.id];

    return (
      <View key={guideline.id} style={[styles.guidelineCard, { backgroundColor: PRIORITY_COLORS[guideline.priority] }]}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleSection(guideline.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={guideline.icon as any} size={20} color="#1976D2" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>{guideline.title}</Text>
              {renderPriorityBadge(guideline.priority)}
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => toggleBookmark(guideline.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons 
                name={isBookmarked ? "bookmark" : "bookmark-border"} 
                size={20} 
                color={isBookmarked ? "#D32F2F" : "#757575"} 
              />
            </TouchableOpacity>
            <MaterialIcons 
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#757575" 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.overview}>{guideline.content.overview}</Text>
            
            {/* Quick Reference */}
            {guideline.quickReference && (
              <View style={styles.quickRefContainer}>
                <Text style={styles.sectionTitle}>Quick Reference</Text>
                {guideline.quickReference.items.map((item, index) => (
                  <View key={index} style={[styles.quickRefItem, 
                    { backgroundColor: item.severity === 'danger' ? '#FFEBEE' : 
                                       item.severity === 'warning' ? '#FFF8E1' : '#E8F5E8' }
                  ]}>
                    <Text style={[styles.quickRefLabel, item.highlight && styles.boldText]}>
                      {item.label}
                    </Text>
                    <Text style={styles.quickRefValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setSelectedGuideline(guideline)}
              >
                <MaterialIcons name="info" size={16} color="white" />
                <Text style={styles.actionButtonText}>Full Details</Text>
              </TouchableOpacity>
              
              {guideline.decisionTree && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.decisionButton]}
                  onPress={() => startDecisionTree(guideline)}
                >
                  <MaterialIcons name="account-tree" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Decision Tool</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderDetailModal = () => {
    if (!selectedGuideline) return null;

    const tabs = [
      { key: 'overview', label: 'Overview', icon: 'info' },
      { key: 'recommendations', label: 'Evidence', icon: 'fact-check' },
      { key: 'counseling', label: 'Counseling', icon: 'chat' }
    ];

    return (
      <Modal
        visible={!!selectedGuideline}
        animationType="slide"
        onRequestClose={() => setSelectedGuideline(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedGuideline(null)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="close" size={24} color="#1976D2" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedGuideline.title}</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Modal Tabs */}
          <View style={styles.modalTabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.modalTab,
                  activeTab === tab.key && styles.activeModalTab
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialIcons 
                  name={tab.icon as any} 
                  size={16} 
                  color={activeTab === tab.key ? "#1976D2" : "#757575"} 
                />
                <Text style={[
                  styles.modalTabText,
                  { color: activeTab === tab.key ? "#1976D2" : "#757575" }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.modalContent}>
            {activeTab === 'overview' && (
              <View>
                <Text style={styles.modalOverview}>{selectedGuideline.content.overview}</Text>
                
                <Text style={styles.modalSectionTitle}>Key Points</Text>
                {selectedGuideline.content.keyPoints.map((point, index) => (
                  <View key={index} style={styles.keyPointItem}>
                    <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.keyPointText}>{point}</Text>
                  </View>
                ))}

                {selectedGuideline.content.clinicalPearls && (
                  <>
                    <Text style={styles.modalSectionTitle}>Clinical Pearls</Text>
                    {selectedGuideline.content.clinicalPearls.map((pearl, index) => (
                      <View key={index} style={styles.pearlItem}>
                        <MaterialIcons name="lightbulb" size={16} color="#FF9800" />
                        <Text style={styles.pearlText}>{pearl}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}

            {activeTab === 'recommendations' && (
              <View>
                {selectedGuideline.content.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationCard}>
                    {renderEvidenceGrade(rec)}
                    <Text style={styles.recommendationText}>{rec.text}</Text>
                    
                    <Text style={styles.referencesTitle}>References:</Text>
                    {rec.references.map((ref, refIndex) => (
                      <Text key={refIndex} style={styles.referenceText}>
                        • {ref.source} ({ref.year}) - Grade {ref.level}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'counseling' && selectedGuideline.content.patientCounseling && (
              <View>
                <Text style={styles.modalSectionTitle}>Patient Counseling Points</Text>
                {selectedGuideline.content.patientCounseling.map((point, index) => (
                  <View key={index} style={styles.counselingItem}>
                    <MaterialIcons name="chat-bubble" size={16} color="#2196F3" />
                    <Text style={styles.counselingText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderDecisionTreeModal = () => (
    <Modal
      visible={showDecisionTree}
      animationType="slide"
      onRequestClose={() => setShowDecisionTree(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDecisionTree(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="close" size={24} color="#1976D2" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Clinical Decision Tool</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Decision Path */}
          {decisionTreePath.length > 0 && (
            <View style={styles.pathContainer}>
              <Text style={styles.pathTitle}>Decision Path:</Text>
              {decisionTreePath.map((step, index) => (
                <Text key={index} style={styles.pathStep}>
                  {index + 1}. {step}
                </Text>
              ))}
            </View>
          )}

          {/* Current Decision */}
          {currentDecisionNode && (
            <View style={styles.decisionContainer}>
              <Text style={styles.decisionQuestion}>{currentDecisionNode.question}</Text>
              {currentDecisionNode.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.decisionOption, 
                    option.riskLevel === 'high' && styles.highRiskOption,
                    option.riskLevel === 'moderate' && styles.moderateRiskOption
                  ]}
                  onPress={() => handleDecisionChoice(option)}
                >
                  <Text style={styles.decisionOptionText}>{option.text}</Text>
                  {option.riskLevel && (
                    <MaterialIcons 
                      name={option.riskLevel === 'high' ? 'warning' : 'info'} 
                      size={16} 
                      color={option.riskLevel === 'high' ? '#D32F2F' : '#FF9800'} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#E3F2FD" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1976D2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MHT Clinical Guidelines</Text>
          <TouchableOpacity style={styles.backButton}>
            <MaterialIcons name="help" size={24} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search guidelines, conditions, medications..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        {renderCategoryTabs()}

        {/* Guidelines List */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {filteredGuidelines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No guidelines found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
            </View>
          ) : (
            filteredGuidelines.map(renderGuidelineCard)
          )}
        </ScrollView>

        {renderDetailModal()}
        {renderDecisionTreeModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#E3F2FD',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeTab: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  guidelineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    padding: 8,
    marginRight: 8,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  overview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  quickRefContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickRefItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  quickRefLabel: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  quickRefValue: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  boldText: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  decisionButton: {
    backgroundColor: '#388E3C',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#E3F2FD',
    elevation: 2,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 1,
  },
  modalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeModalTab: {
    borderBottomColor: '#1976D2',
  },
  modalTabText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalOverview: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
    marginTop: 8,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  keyPointText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  pearlItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
  },
  pearlText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
    fontStyle: 'italic',
  },
  recommendationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  evidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  evidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  evidenceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gradeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  referencesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 2,
  },
  counselingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
  },
  counselingText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  pathContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  pathStep: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  decisionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  decisionQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  decisionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  highRiskOption: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  moderateRiskOption: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE0B2',
  },
  decisionOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
});