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
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type definitions with proper error handling
type RootStackParamList = {
  Home: undefined;
  Guidelines: undefined;
  [key: string]: undefined;
};

type GuidelinesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Guidelines'>;

interface Props {
  navigation: GuidelinesNavigationProp;
}

interface GuidelineSection {
  id: string;
  title: string;
  icon: string;
  body_md: string;
  bullets: string[];
  tables: Array<{
    title: string;
    columns: string[];
    rows: string[][];
  }>;
  citations: Array<{
    label: string;
    url: string;
  }>;
}

interface GuidelinesData {
  version: string;
  lastUpdated: string;
  sections: GuidelineSection[];
}

// Safe data loading with comprehensive fallbacks
const loadGuidelinesData = (): GuidelinesData => {
  const fallbackData: GuidelinesData = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: "basic-principles",
        title: "Basic MHT Principles",
        icon: "info",
        body_md: "Menopause Hormone Therapy (MHT) should be individualized based on patient symptoms, risk factors, and preferences.",
        bullets: [
          "Assess individual risk-benefit profile",
          "Use lowest effective dose",
          "Regular monitoring and review",
          "Patient education and shared decision making"
        ],
        tables: [],
        citations: []
      },
      {
        id: "contraindications",
        title: "Contraindications",
        icon: "warning",
        body_md: "Absolute contraindications to MHT include active or recent hormone-dependent cancers and thrombotic disease.",
        bullets: [
          "Current breast cancer",
          "Active liver disease",
          "Recent VTE or stroke",
          "Unexplained vaginal bleeding"
        ],
        tables: [],
        citations: []
      }
    ]
  };

  try {
    const data = require('../assets/guidelines.json');
    
    // Validate data structure
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ Invalid guidelines data - using fallback');
      return fallbackData;
    }

    if (!data.sections || !Array.isArray(data.sections)) {
      console.warn('⚠️ Invalid sections array - using fallback');
      return fallbackData;
    }

    console.log('✅ Guidelines data loaded successfully');
    return {
      version: data.version || "1.0.0",
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      sections: data.sections
    };
  } catch (error) {
    console.error('❌ Error loading guidelines data:', error);
    return fallbackData;
  }
};

// Crash-proof storage utilities
const STORAGE_KEYS = {
  BOOKMARKS: 'mht_guidelines_bookmarks_safe',
  VERSION: 'mht_guidelines_version_safe'
};

const safeStorage = {
  async get(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`Storage get error for ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Storage set error for ${key}:`, error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error for ${key}:`, error);
      return false;
    }
  }
};

export default function GuidelinesScreenSafe({ navigation }: Props) {
  // State with safe defaults
  const [guidelines] = useState<GuidelinesData>(() => loadGuidelinesData());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<GuidelineSection | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Load bookmarks on mount with error handling
  useEffect(() => {
    loadBookmarks();
  }, []);

  // Sync modal visibility with selectedSection
  useEffect(() => {
    setModalVisible(!!selectedSection);
  }, [selectedSection]);

  const loadBookmarks = useCallback(async () => {
    try {
      const savedBookmarks = await safeStorage.get(STORAGE_KEYS.BOOKMARKS);
      if (savedBookmarks) {
        const parsed = JSON.parse(savedBookmarks);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      }
    } catch (error) {
      console.error('❌ Error loading bookmarks:', error);
      setBookmarks([]);
    }
  }, []);

  const saveBookmarks = useCallback(async (newBookmarks: string[]) => {
    try {
      const success = await safeStorage.set(STORAGE_KEYS.BOOKMARKS, JSON.stringify(newBookmarks));
      if (success) {
        setBookmarks(newBookmarks);
      }
    } catch (error) {
      console.error('❌ Error saving bookmarks:', error);
    }
  }, []);

  const toggleBookmark = useCallback((sectionId: string) => {
    const newBookmarks = bookmarks.includes(sectionId)
      ? bookmarks.filter(id => id !== sectionId)
      : [...bookmarks, sectionId];
    saveBookmarks(newBookmarks);
  }, [bookmarks, saveBookmarks]);

  const openSectionModal = useCallback((section: GuidelineSection) => {
    setSelectedSection(section);
  }, []);

  const closeSectionModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedSection(null), 100);
  }, []);

  // Safe search functionality
  const filteredSections = useMemo(() => {
    try {
      const sections = guidelines?.sections || [];
      if (!searchQuery.trim()) return sections;
      
      const query = searchQuery.toLowerCase();
      return sections.filter(section => {
        if (!section) return false;
        
        const title = (section.title || '').toLowerCase();
        const body = (section.body_md || '').toLowerCase();
        const bullets = (section.bullets || []).join(' ').toLowerCase();
        
        return title.includes(query) || 
               body.includes(query) || 
               bullets.includes(query);
      });
    } catch (error) {
      console.error('❌ Error filtering sections:', error);
      return guidelines?.sections || [];
    }
  }, [searchQuery, guidelines.sections]);

  const openWebLink = useCallback((url: string) => {
    try {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open this link');
        }
      });
    } catch (error) {
      console.error('❌ Error opening link:', error);
      Alert.alert('Error', 'Cannot open this link');
    }
  }, []);

  const renderSectionCard = useCallback(({ item }: { item: GuidelineSection }) => {
    if (!item) {
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.errorText}>Invalid guideline data</Text>
        </View>
      );
    }

    const safeItem = {
      id: item.id || `fallback_${Date.now()}`,
      title: item.title || 'Unknown Guideline',
      body_md: item.body_md || 'No content available',
      bullets: item.bullets || [],
      icon: item.icon || 'help',
      tables: item.tables || [],
      citations: item.citations || [],
    };

    const isBookmarked = bookmarks.includes(safeItem.id);
    
    return (
      <TouchableOpacity
        style={styles.sectionCard}
        onPress={() => openSectionModal(safeItem)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <MaterialIcons 
            name={safeItem.icon as any} 
            size={24} 
            color="#D81B60" 
          />
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => toggleBookmark(safeItem.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons 
              name={isBookmarked ? "bookmark" : "bookmark-border"} 
              size={20} 
              color={isBookmarked ? "#D81B60" : "#999"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardTitle}>{safeItem.title}</Text>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {safeItem.body_md.substring(0, 100)}...
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.bulletCount}>{safeItem.bullets.length} key points</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#D81B60" />
        </View>
      </TouchableOpacity>
    );
  }, [bookmarks, openSectionModal, toggleBookmark]);

  const renderTable = useCallback((table: any, index: number) => {
    if (!table || !table.columns || !table.rows) return null;

    return (
      <View key={index} style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{table.title || 'Table'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {table.columns.map((column: string, colIndex: number) => (
                <Text key={colIndex} style={[styles.tableCell, styles.tableHeader]}>
                  {column}
                </Text>
              ))}
            </View>
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
  }, []);

  const renderSectionDetail = useCallback(() => {
    if (!selectedSection) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSectionModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeSectionModal}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedSection.title}
            </Text>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionContent}>
              {selectedSection.body_md.replace(/##/g, '\n').replace(/\*\*/g, '')}
            </Text>

            {selectedSection.bullets.length > 0 && (
              <View style={styles.bulletsSection}>
                <Text style={styles.subsectionTitle}>Key Points</Text>
                {selectedSection.bullets.map((bullet, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <MaterialIcons name="fiber-manual-record" size={8} color="#D81B60" />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            )}

            {selectedSection.tables.map((table, index) => renderTable(table, index))}

            {selectedSection.citations.length > 0 && (
              <View style={styles.citationsSection}>
                <Text style={styles.subsectionTitle}>References</Text>
                {selectedSection.citations.map((citation, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.citationItem}
                    onPress={() => openWebLink(citation.url)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="link" size={16} color="#D81B60" />
                    <Text style={styles.citationText}>{citation.label}</Text>
                    <MaterialIcons name="open-in-new" size={16} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.versionText}>
                Guidelines v{guidelines.version} • Updated: {new Date(guidelines.lastUpdated).toLocaleDateString()}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }, [selectedSection, modalVisible, closeSectionModal, renderTable, openWebLink, guidelines]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.title}>MHT Guidelines</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="search" size={24} color="#D81B60" />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search guidelines..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="clear" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.overview}>
        <Text style={styles.overviewTitle}>Clinical Practice Guidelines</Text>
        <Text style={styles.overviewText}>
          Evidence-based guidelines for menopause hormone therapy management
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{guidelines.sections.length}</Text>
            <Text style={styles.statLabel}>Sections</Text>
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
      </View>

      <FlatList
        data={filteredSections}
        keyExtractor={(item) => item?.id || `fallback_${Date.now()}`}
        renderItem={renderSectionCard}
        contentContainerStyle={styles.sectionsList}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={200}
        windowSize={8}
        getItemLayout={(data, index) => (
          {length: 150, offset: 150 * index, index}
        )}
      />

      {renderSectionDetail()}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D81B60" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
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
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  overview: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
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
    marginBottom: 8,
  },
  overviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    color: '#999',
    marginTop: 4,
  },
  sectionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  bookmarkButton: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardPreview: {
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
  bulletCount: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  modalHeader: {
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
  closeButton: {
    padding: 8,
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
    paddingHorizontal: 20,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginVertical: 20,
  },
  bulletsSection: {
    marginVertical: 20,
  },
  subsectionTitle: {
    fontSize: 18,
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
    borderRadius: 12,
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableCell: {
    padding: 12,
    minWidth: 120,
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
    marginVertical: 20,
  },
  citationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  citationText: {
    fontSize: 14,
    color: '#D81B60',
    flex: 1,
    marginHorizontal: 12,
  },
  modalFooter: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'white',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
});