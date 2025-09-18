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

import ResponsiveLayout from '../components/ResponsiveLayout';
import ResponsiveText from '../components/ResponsiveText';
import TabletOptimizedHeader from '../components/TabletOptimizedHeader';

import { 
  COMBINED_MHT_GUIDELINES,
  PINK_COLOR_SCHEME,
  PINK_CATEGORIES,
  PINK_PRIORITY_COLORS,
  EVIDENCE_COLORS,
  searchGuidelines,
  filterGuidelinesByCategory,
  getGuidelinesCountByCategory
} from '../data/combinedMHTGuidelines';

import { 
  GuidelineSection, 
  ClinicalRecommendation, 
  DecisionTreeNode,
  DECISION_TREES 
} from '../data/comprehensiveMHTGuidelines';

import { 
  getDeviceInfo, 
  getResponsiveSpacing, 
  getTouchTargetSize,
  shouldUseMultiPane 
} from '../utils/deviceUtils';

type GuidelinesNavigationProp = NativeStackNavigationProp<any, 'Guidelines'>;

interface Props {
  navigation: GuidelinesNavigationProp;
}

const BOOKMARKS_KEY = 'mht_combined_guidelines_bookmarks';

export default function TabletOptimizedGuidelinesScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuideline, setSelectedGuideline] = useState<GuidelineSection | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showDecisionTree, setShowDecisionTree] = useState(false);
  const [decisionTreePath, setDecisionTreePath] = useState<string[]>([]);
  const [currentDecisionNode, setCurrentDecisionNode] = useState<DecisionTreeNode | null>(null);

  const deviceInfo = getDeviceInfo();
  const spacing = getResponsiveSpacing(16);
  const touchTarget = getTouchTargetSize();
  const isMultiPane = shouldUseMultiPane();

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
    // First filter by category
    let filtered = filterGuidelinesByCategory(selectedCategory, COMBINED_MHT_GUIDELINES);
    
    // Then filter by search query
    if (searchQuery.trim()) {
      filtered = searchGuidelines(searchQuery, filtered);
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const guidelinesCount = useMemo(() => 
    getGuidelinesCountByCategory(COMBINED_MHT_GUIDELINES), 
    []
  );

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

  const handleGuidelineSelect = (guideline: GuidelineSection) => {
    if (isMultiPane) {
      setSelectedGuideline(guideline);
      setActiveTab('overview');
    } else {
      // Navigate to full screen guideline details
      setSelectedGuideline(guideline);
      setActiveTab('overview');
    }
  };

  const renderCategoryTabs = () => (
    <View style={[styles.tabContainer, { paddingHorizontal: spacing }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              selectedCategory === category.key && styles.activeTab,
              { 
                backgroundColor: selectedCategory === category.key ? category.color : 'white',
                minHeight: touchTarget 
              }
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <MaterialIcons 
              name={category.icon as any} 
              size={deviceInfo.isTablet ? 20 : 16} 
              color={selectedCategory === category.key ? 'white' : category.color} 
            />
            <ResponsiveText 
              variant="caption"
              style={[
                styles.tabText,
                { color: selectedCategory === category.key ? 'white' : category.color }
              ]}
            >
              {category.label}
            </ResponsiveText>
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
      <ResponsiveText 
        variant="caption"
        style={[styles.priorityText, { 
          color: priority === 'critical' ? '#D32F2F' : priority === 'important' ? '#F57C00' : '#757575' 
        }]}
      >
        {priority.toUpperCase()}
      </ResponsiveText>
    </View>
  );

  const renderEvidenceGrade = (recommendation: ClinicalRecommendation) => (
    <View style={styles.evidenceContainer}>
      <View style={[styles.evidenceBadge, { backgroundColor: EVIDENCE_COLORS[recommendation.evidenceLevel] }]}>
        <ResponsiveText variant="caption" style={styles.evidenceText}>
          {recommendation.evidenceLevel}
        </ResponsiveText>
      </View>
      <ResponsiveText variant="caption" style={styles.gradeText}>
        {recommendation.grade} Recommendation
      </ResponsiveText>
    </View>
  );

  const renderGuidelineCard = (guideline: GuidelineSection) => {
    const isBookmarked = bookmarks.includes(guideline.id);
    const isExpanded = !isMultiPane && expandedSections[guideline.id];
    const isSelected = selectedGuideline?.id === guideline.id;

    return (
      <View 
        key={guideline.id} 
        style={[
          styles.guidelineCard, 
          { backgroundColor: PRIORITY_COLORS[guideline.priority] },
          isSelected && styles.selectedGuidelineCard
        ]}
      >
        <TouchableOpacity
          style={[styles.cardHeader, { minHeight: touchTarget }]}
          onPress={() => isMultiPane ? handleGuidelineSelect(guideline) : toggleSection(guideline.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={guideline.icon as any} size={24} color="#1976D2" />
            </View>
            <View style={styles.titleContainer}>
              <ResponsiveText 
                variant={deviceInfo.isTablet ? 'body' : 'caption'}
                style={[styles.cardTitle, isSelected && styles.selectedText]}
              >
                {guideline.title}
              </ResponsiveText>
              {renderPriorityBadge(guideline.priority)}
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.bookmarkButton, { minHeight: touchTarget }]}
              onPress={() => toggleBookmark(guideline.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons 
                name={isBookmarked ? "bookmark" : "bookmark-border"} 
                size={20} 
                color={isBookmarked ? "#D32F2F" : "#757575"} 
              />
            </TouchableOpacity>
            {!isMultiPane && (
              <MaterialIcons 
                name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#757575" 
              />
            )}
            {isMultiPane && (
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={isSelected ? '#1976D2' : '#ccc'} 
              />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && !isMultiPane && (
          <View style={styles.expandedContent}>
            <ResponsiveText variant="caption" style={styles.overview}>
              {guideline.content.overview}
            </ResponsiveText>
            
            {/* Quick Reference */}
            {guideline.quickReference && (
              <View style={styles.quickRefContainer}>
                <ResponsiveText variant="body" style={styles.sectionTitle}>
                  Quick Reference
                </ResponsiveText>
                {guideline.quickReference.items.map((item, index) => (
                  <View key={index} style={[styles.quickRefItem, 
                    { backgroundColor: item.severity === 'danger' ? '#FFEBEE' : 
                                       item.severity === 'warning' ? '#FFF8E1' : '#E8F5E8' }
                  ]}>
                    <ResponsiveText 
                      variant="caption"
                      style={[styles.quickRefLabel, item.highlight && styles.boldText]}
                    >
                      {item.label}
                    </ResponsiveText>
                    <ResponsiveText variant="caption" style={styles.quickRefValue}>
                      {item.value}
                    </ResponsiveText>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { minHeight: touchTarget }]}
                onPress={() => handleGuidelineSelect(guideline)}
              >
                <MaterialIcons name="info" size={16} color="white" />
                <ResponsiveText variant="caption" style={styles.actionButtonText}>
                  Full Details
                </ResponsiveText>
              </TouchableOpacity>
              
              {guideline.decisionTree && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.decisionButton, { minHeight: touchTarget }]}
                  onPress={() => startDecisionTree(guideline)}
                >
                  <MaterialIcons name="account-tree" size={16} color="white" />
                  <ResponsiveText variant="caption" style={styles.actionButtonText}>
                    Decision Tool
                  </ResponsiveText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderGuidelinesList = () => (
    <View style={styles.guidelinesListContainer}>
      {/* Search */}
      <View style={[styles.searchContainer, { marginHorizontal: spacing }]}>
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
        style={styles.guidelinesScroll}
        contentContainerStyle={[styles.guidelinesContent, { paddingHorizontal: spacing }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredGuidelines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color="#E0E0E0" />
            <ResponsiveText variant="h4" style={styles.emptyText}>
              No guidelines found
            </ResponsiveText>
            <ResponsiveText variant="body" style={styles.emptySubtext}>
              Try adjusting your search or category filter
            </ResponsiveText>
          </View>
        ) : (
          filteredGuidelines.map(renderGuidelineCard)
        )}
      </ScrollView>
    </View>
  );

  const renderGuidelineDetails = () => {
    if (!selectedGuideline) {
      return (
        <View style={styles.emptyDetailsContainer}>
          <MaterialIcons name="book" size={80} color="#E0E0E0" />
          <ResponsiveText variant="h4" style={styles.emptyDetailsTitle}>
            Select a Guideline
          </ResponsiveText>
          <ResponsiveText variant="body" style={styles.emptyDetailsSubtitle}>
            Choose a guideline from the list to view detailed information
          </ResponsiveText>
        </View>
      );
    }

    const tabs = [
      { key: 'overview', label: 'Overview', icon: 'info' },
      { key: 'recommendations', label: 'Evidence', icon: 'fact-check' },
      { key: 'counseling', label: 'Counseling', icon: 'chat' }
    ];

    return (
      <View style={styles.detailsContainer}>
        {/* Details Header */}
        <View style={styles.detailsHeader}>
          <View style={styles.detailsHeaderLeft}>
            <View style={styles.detailsIcon}>
              <MaterialIcons name={selectedGuideline.icon as any} size={32} color="#1976D2" />
            </View>
            <View style={styles.detailsHeaderInfo}>
              <ResponsiveText variant="h4" style={styles.detailsTitle}>
                {selectedGuideline.title}
              </ResponsiveText>
              {renderPriorityBadge(selectedGuideline.priority)}
            </View>
          </View>
          <View style={styles.detailsHeaderActions}>
            <TouchableOpacity
              style={[styles.headerActionButton, { minHeight: touchTarget }]}
              onPress={() => toggleBookmark(selectedGuideline.id)}
            >
              <MaterialIcons 
                name={bookmarks.includes(selectedGuideline.id) ? "bookmark" : "bookmark-border"} 
                size={24} 
                color={bookmarks.includes(selectedGuideline.id) ? "#D32F2F" : "#757575"} 
              />
            </TouchableOpacity>
            {selectedGuideline.decisionTree && (
              <TouchableOpacity
                style={[styles.headerActionButton, { minHeight: touchTarget }]}
                onPress={() => startDecisionTree(selectedGuideline)}
              >
                <MaterialIcons name="account-tree" size={24} color="#388E3C" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.detailsTab,
                activeTab === tab.key && styles.activeDetailsTab,
                { minHeight: touchTarget }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialIcons 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.key ? "#1976D2" : "#757575"} 
              />
              <ResponsiveText 
                variant="caption"
                style={[
                  styles.detailsTabText,
                  { color: activeTab === tab.key ? "#1976D2" : "#757575" }
                ]}
              >
                {tab.label}
              </ResponsiveText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.detailsContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && (
            <View>
              <ResponsiveText variant="body" style={styles.detailsOverview}>
                {selectedGuideline.content.overview}
              </ResponsiveText>
              
              <ResponsiveText variant="h4" style={styles.detailsSectionTitle}>
                Key Points
              </ResponsiveText>
              {selectedGuideline.content.keyPoints.map((point, index) => (
                <View key={index} style={styles.keyPointItem}>
                  <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                  <ResponsiveText variant="body" style={styles.keyPointText}>
                    {point}
                  </ResponsiveText>
                </View>
              ))}

              {selectedGuideline.content.clinicalPearls && (
                <>
                  <ResponsiveText variant="h4" style={styles.detailsSectionTitle}>
                    Clinical Pearls
                  </ResponsiveText>
                  {selectedGuideline.content.clinicalPearls.map((pearl, index) => (
                    <View key={index} style={styles.pearlItem}>
                      <MaterialIcons name="lightbulb" size={16} color="#FF9800" />
                      <ResponsiveText variant="body" style={styles.pearlText}>
                        {pearl}
                      </ResponsiveText>
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
                  <ResponsiveText variant="body" style={styles.recommendationText}>
                    {rec.text}
                  </ResponsiveText>
                  
                  <ResponsiveText variant="caption" style={styles.referencesTitle}>
                    References:
                  </ResponsiveText>
                  {rec.references.map((ref, refIndex) => (
                    <ResponsiveText key={refIndex} variant="caption" style={styles.referenceText}>
                      • {ref.source} ({ref.year}) - Grade {ref.level}
                    </ResponsiveText>
                  ))}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'counseling' && selectedGuideline.content.patientCounseling && (
            <View>
              <ResponsiveText variant="h4" style={styles.detailsSectionTitle}>
                Patient Counseling Points
              </ResponsiveText>
              {selectedGuideline.content.patientCounseling.map((point, index) => (
                <View key={index} style={styles.counselingItem}>
                  <MaterialIcons name="chat-bubble" size={16} color="#2196F3" />
                  <ResponsiveText variant="body" style={styles.counselingText}>
                    {point}
                  </ResponsiveText>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderDecisionTreeModal = () => (
    <Modal
      visible={showDecisionTree}
      animationType="slide"
      onRequestClose={() => setShowDecisionTree(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <TabletOptimizedHeader
          title="Clinical Decision Tool"
          onBack={() => setShowDecisionTree(false)}
          showBackButton={true}
        />

        <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: spacing }}>
          {/* Decision Path */}
          {decisionTreePath.length > 0 && (
            <View style={styles.pathContainer}>
              <ResponsiveText variant="h4" style={styles.pathTitle}>
                Decision Path:
              </ResponsiveText>
              {decisionTreePath.map((step, index) => (
                <ResponsiveText key={index} variant="body" style={styles.pathStep}>
                  {index + 1}. {step}
                </ResponsiveText>
              ))}
            </View>
          )}

          {/* Current Decision */}
          {currentDecisionNode && (
            <View style={styles.decisionContainer}>
              <ResponsiveText variant="h3" style={styles.decisionQuestion}>
                {currentDecisionNode.question}
              </ResponsiveText>
              {currentDecisionNode.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.decisionOption,
                    { minHeight: touchTarget },
                    option.riskLevel === 'high' && styles.highRiskOption,
                    option.riskLevel === 'moderate' && styles.moderateRiskOption
                  ]}
                  onPress={() => handleDecisionChoice(option)}
                >
                  <ResponsiveText variant="body" style={styles.decisionOptionText}>
                    {option.text}
                  </ResponsiveText>
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

  const headerActions = [
    {
      icon: 'help',
      onPress: () => Alert.alert('Help', 'This screen contains evidence-based MHT clinical guidelines'),
      testID: 'guidelines-help',
    },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#E3F2FD" />
        
        <TabletOptimizedHeader
          title="MHT Clinical Guidelines"
          onBack={() => navigation.goBack()}
          actions={headerActions}
          backgroundColor="#E3F2FD"
          subtitle={`${filteredGuidelines.length} guideline${filteredGuidelines.length !== 1 ? 's' : ''}`}
        />

        <ResponsiveLayout
          leftPane={renderGuidelinesList()}
          rightPane={isMultiPane ? renderGuidelineDetails() : undefined}
          leftPaneWidth={deviceInfo.isLargeTablet ? 400 : 350}
          enableMultiPane={true}
        >
          {!isMultiPane && renderGuidelinesList()}
        </ResponsiveLayout>

        {renderDecisionTreeModal()}
        
        {/* Full screen modal for single pane */}
        {!isMultiPane && selectedGuideline && (
          <Modal
            visible={!!selectedGuideline}
            animationType="slide"
            onRequestClose={() => setSelectedGuideline(null)}
          >
            <SafeAreaView style={styles.modalContainer}>
              <TabletOptimizedHeader
                title={selectedGuideline.title}
                onBack={() => setSelectedGuideline(null)}
                showBackButton={true}
                backgroundColor="#E3F2FD"
              />
              {renderGuidelineDetails()}
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  guidelinesListContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
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
    fontWeight: '600',
    marginLeft: 6,
  },
  guidelinesScroll: {
    flex: 1,
  },
  guidelinesContent: {
    paddingVertical: 16,
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedGuidelineCard: {
    borderColor: '#1976D2',
    elevation: 4,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedText: {
    color: '#1976D2',
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  overview: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  quickRefContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
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
    color: '#333',
    flex: 1,
  },
  quickRefValue: {
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
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
  // Details Styles
  detailsContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  emptyDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 40,
  },
  emptyDetailsTitle: {
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDetailsSubtitle: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailsIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsHeaderInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailsTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeDetailsTab: {
    borderBottomColor: '#1976D2',
  },
  detailsTabText: {
    fontWeight: '600',
    marginLeft: 6,
  },
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  detailsOverview: {
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsSectionTitle: {
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
    color: '#333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
    fontStyle: 'italic',
  },
  recommendationCard: {
    backgroundColor: '#F8F9FA',
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
    color: '#666',
    fontWeight: '600',
  },
  recommendationText: {
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  referencesTitle: {
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  referenceText: {
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
    color: '#333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  modalContent: {
    flex: 1,
  },
  pathContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  pathTitle: {
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  pathStep: {
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
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
});