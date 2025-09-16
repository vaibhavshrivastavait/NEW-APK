import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList as RNFlatList,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import SafeFlatList from '../components/SafeFlatList';
import crashProofStorage from '../utils/asyncStorageUtils';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import the guidelines data - using import instead of require for APK compatibility
import guidelinesDataImport from '../assets/guidelines.json';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  Demographics: undefined;
  Symptoms: undefined;
  RiskFactors: undefined;
  Results: undefined;
  Cme: undefined;
  Guidelines: undefined;
  PatientList: undefined;
  Export: undefined;
  PatientDetails: undefined;
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

const BOOKMARKS_KEY = 'mht_guidelines_bookmarks';
const GUIDELINES_VERSION_KEY = 'mht_guidelines_version';

export default function GuidelinesScreen({ navigation }: Props) {
  const [guidelines, setGuidelines] = useState<GuidelinesData>(guidelinesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<GuidelineSection | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Control modal state explicitly

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
    checkForUpdates();
  }, []);

  // Sync modal visibility with selectedSection
  useEffect(() => {
    setModalVisible(!!selectedSection);
  }, [selectedSection]);

  const openSectionModal = (section: GuidelineSection) => {
    setSelectedSection(section);
    setModalVisible(true);
  };

  const closeSectionModal = () => {
    setModalVisible(false);
    // Add slight delay to ensure modal closes before clearing section
    setTimeout(() => {
      setSelectedSection(null);
    }, 100);
  };

  const loadBookmarks = async () => {
    try {
      const savedBookmarks = await crashProofStorage.getItem(BOOKMARKS_KEY);
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const saveBookmarks = async (newBookmarks: string[]) => {
    try {
      await crashProofStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const toggleBookmark = (sectionId: string) => {
    const newBookmarks = bookmarks.includes(sectionId)
      ? bookmarks.filter(id => id !== sectionId)
      : [...bookmarks, sectionId];
    saveBookmarks(newBookmarks);
  };

  const checkForUpdates = async () => {
    try {
      const savedVersion = await crashProofStorage.getItem(GUIDELINES_VERSION_KEY);
      if (savedVersion && savedVersion !== guidelines.version) {
        // Could implement remote update check here
        console.log('Guidelines version mismatch - could check for updates');
      }
    } catch (error) {
      console.error('Error checking version:', error);
    }
  };

  // Search functionality
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return guidelines.sections;
    
    const query = searchQuery.toLowerCase();
    return guidelines.sections.filter(section =>
      section.title.toLowerCase().includes(query) ||
      section.body_md.toLowerCase().includes(query) ||
      section.bullets.some(bullet => bullet.toLowerCase().includes(query)) ||
      section.tables.some(table => 
        table.title.toLowerCase().includes(query) ||
        table.rows.some(row => row.some(cell => cell.toLowerCase().includes(query)))
      )
    );
  }, [searchQuery, guidelines.sections]);

  const openWebLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    });
  };

  const renderSectionCard = ({ item }: { item: GuidelineSection }) => {
    // Add defensive checks for item data
    if (!item) {
      console.error('🚨 GuidelinesScreen: Received null/undefined item in renderSectionCard');
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.errorText}>Invalid guideline data</Text>
        </View>
      );
    }

    // Ensure required fields exist
    const safeItem = {
      id: item.id || `fallback_${Date.now()}`,
      title: item.title || 'Unknown Guideline',
      body_md: item.body_md || 'No content available',
      bullets: item.bullets || [],
      icon: item.icon || 'help',
      ...item
    };

    try {
      const isBookmarked = bookmarks.includes(safeItem.id);
      
      return (
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => openSectionModal(safeItem)}
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
    } catch (error) {
      console.error('🚨 GuidelinesScreen: Error rendering section card:', error, 'Item:', item);
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.errorText}>Error displaying: {safeItem.title}</Text>
        </View>
      );
    }
  };

  const renderTable = (table: any, index: number) => (
    <View key={index} style={styles.tableContainer}>
      <Text style={styles.tableTitle}>{table.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableRow}>
            {table.columns.map((column: string, colIndex: number) => (
              <Text key={colIndex} style={[styles.tableCell, styles.tableHeader]}>
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

  const renderSectionDetail = () => {
    if (!selectedSection) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSectionModal} // Android back button support
        supportedOrientations={['portrait', 'landscape']} // Better device support
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeSectionModal}
            >
              <MaterialIcons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedSection.title}
            </Text>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => toggleBookmark(selectedSection.id)}
            >
              <MaterialIcons 
                name={bookmarks.includes(selectedSection.id) ? "bookmark" : "bookmark-border"} 
                size={24} 
                color={bookmarks.includes(selectedSection.id) ? "#D81B60" : "#999"} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Main content */}
            <Text style={styles.sectionContent}>
              {selectedSection.body_md.replace(/##/g, '\n').replace(/\*\*/g, '')}
            </Text>

            {/* Key points */}
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

            {/* Tables */}
            {selectedSection.tables.map((table, index) => renderTable(table, index))}

            {/* Citations */}
            {selectedSection.citations.length > 0 && (
              <View style={styles.citationsSection}>
                <Text style={styles.subsectionTitle}>References</Text>
                {selectedSection.citations.map((citation, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.citationItem}
                    onPress={() => openWebLink(citation.url)}
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
                Guidelines v{guidelines.version} • Last updated: {new Date(guidelines.lastUpdated).toLocaleDateString()}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

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
        <Text style={styles.title}>MHT Guidelines</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <MaterialIcons name="search" size={24} color="#D81B60" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
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
            >
              <MaterialIcons name="clear" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Guidelines overview */}
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

      {/* Sections list */}
      <SafeFlatList
        data={filteredSections || []}
        keyExtractor={(item) => item.id}
        renderItem={renderSectionCard}
        contentContainerStyle={styles.sectionsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Section detail modal */}
      {renderSectionDetail()}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D81B60" />
          <Text style={styles.loadingText}>Updating guidelines...</Text>
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