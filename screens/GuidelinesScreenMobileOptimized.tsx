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
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 160; // Fixed height for getItemLayout optimization

type GuidelinesNavigationProp = NativeStackNavigationProp<any, 'Guidelines'>;

interface Props {
  navigation: GuidelinesNavigationProp;
}

interface GuidelineItem {
  id: string;
  title: string;
  content: string;
  icon: string;
  keyPoints: string[];
}

// Mobile-optimized safe data
const SAFE_GUIDELINES_DATA: GuidelineItem[] = [
  {
    id: '1',
    title: 'Basic MHT Principles',
    content: 'Menopause Hormone Therapy should be individualized based on patient symptoms, risk factors, and preferences. Use the lowest effective dose for the shortest duration needed.',
    icon: 'info',
    keyPoints: [
      'Individualized risk-benefit assessment',
      'Lowest effective dose',
      'Regular monitoring and review',
      'Shared decision making with patient'
    ]
  },
  {
    id: '2',
    title: 'Contraindications',
    content: 'Absolute contraindications include current breast cancer, active liver disease, recent VTE, and unexplained vaginal bleeding.',
    icon: 'warning',
    keyPoints: [
      'Current or recent breast cancer',
      'Active liver disease with abnormal LFTs',
      'Recent venous thromboembolism',
      'Unexplained vaginal bleeding'
    ]
  },
  {
    id: '3',
    title: 'Route Selection',
    content: 'Choose between oral, transdermal, or vaginal routes based on patient risk factors and preferences.',
    icon: 'medical_services',
    keyPoints: [
      'Transdermal preferred for VTE risk',
      'Oral acceptable for low-risk patients',
      'Vaginal for genitourinary symptoms only',
      'Consider patient preference and convenience'
    ]
  },
  {
    id: '4',
    title: 'Monitoring Guidelines',
    content: 'Regular follow-up is essential for all patients on MHT to assess efficacy, safety, and continuation needs.',
    icon: 'schedule',
    keyPoints: [
      '1-month initial follow-up',
      '6-month routine monitoring',
      'Annual comprehensive review',
      'Breast and pelvic examination'
    ]
  }
];

const BOOKMARKS_KEY = 'mht_guidelines_bookmarks_mobile';

export default function GuidelinesScreenMobileOptimized({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  
  // Mobile-optimized state management
  const [guidelines] = useState<GuidelineItem[]>(SAFE_GUIDELINES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuideline, setSelectedGuideline] = useState<GuidelineItem | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard handling for mobile
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = useCallback(async () => {
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
      setBookmarks([]);
    }
  }, []);

  const saveBookmarks = useCallback(async (newBookmarks: string[]) => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }, []);

  const toggleBookmark = useCallback((guidelineId: string) => {
    const newBookmarks = bookmarks.includes(guidelineId)
      ? bookmarks.filter(id => id !== guidelineId)
      : [...bookmarks, guidelineId];
    saveBookmarks(newBookmarks);
  }, [bookmarks, saveBookmarks]);

  // Mobile-optimized search with useMemo
  const filteredGuidelines = useMemo(() => {
    try {
      if (!searchQuery.trim()) {
        return guidelines;
      }
      
      const query = searchQuery.toLowerCase();
      return guidelines.filter(item => 
        item && (
          item.title?.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query)
        )
      );
    } catch (error) {
      console.error('Error filtering guidelines:', error);
      return guidelines;
    }
  }, [searchQuery, guidelines]);

  // Mobile-optimized FlatList item layout
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  // Mobile-optimized render item with proper performance
  const renderGuidelineCard = useCallback(({ item }: { item: GuidelineItem }) => {
    if (!item) {
      return (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Invalid data</Text>
        </View>
      );
    }

    const isBookmarked = bookmarks.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.guidelineCard}
        onPress={() => setSelectedGuideline(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons 
              name={item.icon as any} 
              size={20} 
              color="#D81B60" 
            />
          </View>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => toggleBookmark(item.id)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons 
              name={isBookmarked ? "bookmark" : "bookmark-border"} 
              size={24} 
              color={isBookmarked ? "#D81B60" : "#999"} 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardContent} numberOfLines={3}>
          {item.content}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.keyPointsCount}>
            {item.keyPoints?.length || 0} key points
          </Text>
          <MaterialIcons name="arrow-forward" size={16} color="#D81B60" />
        </View>
      </TouchableOpacity>
    );
  }, [bookmarks, toggleBookmark]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const renderDetailModal = useCallback(() => {
    if (!selectedGuideline) return null;

    return (
      <Modal
        visible={!!selectedGuideline}
        animationType="slide"
        onRequestClose={() => setSelectedGuideline(null)}
      >
        <SafeAreaView style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedGuideline(null)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedGuideline.title}
            </Text>
            <View style={styles.closeButton} />
          </View>

          <ScrollView 
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.detailContent}>
              {selectedGuideline.content}
            </Text>

            {selectedGuideline.keyPoints && selectedGuideline.keyPoints.length > 0 && (
              <View style={styles.keyPointsSection}>
                <Text style={styles.sectionTitle}>Key Points</Text>
                {selectedGuideline.keyPoints.map((point, index) => (
                  <View key={index} style={styles.keyPoint}>
                    <MaterialIcons name="fiber-manual-record" size={6} color="#D81B60" />
                    <Text style={styles.keyPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }, [selectedGuideline, insets.top]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        
        {/* Mobile-optimized header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MHT Guidelines</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="search" size={24} color="#D81B60" />
          </TouchableOpacity>
        </View>

        {/* Mobile-optimized search */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search guidelines..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={dismissKeyboard}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <MaterialIcons name="clear" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Mobile-optimized stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{guidelines.length}</Text>
            <Text style={styles.statLabel}>Guidelines</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{bookmarks.length}</Text>
            <Text style={styles.statLabel}>Bookmarked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Offline</Text>
          </View>
        </View>

        {/* Mobile-optimized FlatList */}
        <View style={[styles.listContainer, { marginBottom: keyboardHeight }]}>
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#D81B60" />
            </View>
          ) : (
            <FlatList
              data={filteredGuidelines}
              keyExtractor={(item) => item?.id || `fallback_${Date.now()}`}
              renderItem={renderGuidelineCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              // Mobile Performance Optimizations
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              windowSize={5}
              initialNumToRender={3}
              onEndReachedThreshold={0.1}
              getItemLayout={getItemLayout}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={() => (
                <View style={styles.centerContainer}>
                  <MaterialIcons name="search-off" size={48} color="#E0E0E0" />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No results found' : 'No guidelines available'}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        {renderDetailModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFC1CC',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81B60',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  guidelineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: ITEM_HEIGHT - 12, // Account for margin
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyPointsCount: {
    fontSize: 12,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    minHeight: ITEM_HEIGHT - 12,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFC1CC',
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
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginVertical: 20,
  },
  keyPointsSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 12,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  keyPointText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});