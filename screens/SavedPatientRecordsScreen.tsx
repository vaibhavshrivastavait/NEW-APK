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
  Animated,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAssessmentStore } from '../store/assessmentStore';
import { getDeviceInfo, shouldUseMultiPane } from '../utils/deviceUtils';

// Pink color scheme matching the app theme
const PINK_COLORS = {
  primary: '#D81B60',
  primaryLight: '#FFC1CC',
  primaryLighter: '#FFF0F5',
  secondary: '#FFB3BA',
  accent: '#FF69B4',
  text: {
    primary: '#D81B60',
    secondary: '#B71C1C',
    muted: '#E91E63',
    dark: '#333333',
    light: '#666666'
  },
  background: {
    main: '#FFF0F5',
    card: '#FFFFFF',
    section: '#FAFAFA',
    accent: '#FCE4EC'
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  },
  risk: {
    low: '#4CAF50',
    moderate: '#FF9800',
    high: '#F44336'
  }
};

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'female' | 'male';
  patientId?: string;
  height: number;
  weight: number;
  bmi?: number;
  menopausalStatus: string;
  lastAssessment: string | Date;
  riskLevel: 'low' | 'moderate' | 'high';
  riskScore?: number;
  assessmentHistory: AssessmentHistoryItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AssessmentHistoryItem {
  id: string;
  date: string | Date;
  riskLevel: 'low' | 'moderate' | 'high';
  riskScore: number;
  symptoms: {
    hotFlushes: number;
    nightSweats: number;
    sleepDisturbance: number;
    vaginalDryness: number;
    moodChanges: number;
    jointAches: number;
  };
  notes?: string;
}

type SortOption = 'name' | 'age' | 'riskLevel' | 'lastUpdated';
type FilterOption = 'all' | 'low' | 'moderate' | 'high';

type SavedPatientRecordsNavigationProp = NativeStackNavigationProp<any, 'SavedPatientRecords'>;

interface Props {
  navigation: SavedPatientRecordsNavigationProp;
}

export default function SavedPatientRecordsScreen({ navigation }: Props) {
  const store = useAssessmentStore();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('lastUpdated');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const deviceInfo = getDeviceInfo();
  const isMultiPane = shouldUseMultiPane();
  const { width } = Dimensions.get('window');

  useEffect(() => {
    loadPatients();
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterAndSortPatients();
  }, [patients, searchQuery, sortBy, filterBy]);

  const loadPatients = useCallback(() => {
    try {
      const storePatients = store?.patients || [];
      const storeAssessments = store?.assessments || [];
      
      const patientRecords: PatientRecord[] = storePatients.map(patient => {
        // Find the most recent assessment for this patient
        const patientAssessments = storeAssessments.filter(a => a.patientId === patient.id);
        const latestAssessment = patientAssessments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        // Calculate risk level based on assessment
        const riskLevel = calculateRiskLevel(patient, latestAssessment);
        const riskScore = calculateRiskScore(patient, latestAssessment);

        // Create assessment history
        const assessmentHistory: AssessmentHistoryItem[] = patientAssessments.map(assessment => ({
          id: assessment.id,
          date: assessment.createdAt,
          riskLevel: assessment.overallRisk as 'low' | 'moderate' | 'high' || 'moderate',
          riskScore: riskScore,
          symptoms: {
            hotFlushes: patient.hotFlushes || 0,
            nightSweats: patient.nightSweats || 0,
            sleepDisturbance: patient.sleepDisturbance || 0,
            vaginalDryness: patient.vaginalDryness || 0,
            moodChanges: patient.moodChanges || 0,
            jointAches: patient.jointAches || 0,
          },
          notes: assessment.notes || ''
        }));

        return {
          id: patient.id,
          name: patient.name,
          age: patient.age,
          gender: 'female' as const, // MHT is primarily for females
          patientId: patient.id,
          height: patient.height,
          weight: patient.weight,
          bmi: patient.bmi,
          menopausalStatus: patient.menopausalStatus,
          lastAssessment: latestAssessment?.createdAt || patient.createdAt,
          riskLevel: riskLevel,
          riskScore: riskScore,
          assessmentHistory: assessmentHistory,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt || patient.createdAt,
        };
      });

      setPatients(patientRecords);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    }
  }, [store]);

  const calculateRiskLevel = (patient: any, assessment: any): 'low' | 'moderate' | 'high' => {
    // Simple risk calculation based on patient factors
    let riskScore = 0;
    
    // Age factor
    if (patient.age > 65) riskScore += 2;
    else if (patient.age > 55) riskScore += 1;
    
    // BMI factor
    if (patient.bmi > 30) riskScore += 2;
    else if (patient.bmi > 25) riskScore += 1;
    
    // Risk factors
    if (patient.familyHistoryBreastCancer) riskScore += 2;
    if (patient.personalHistoryBreastCancer) riskScore += 3;
    if (patient.personalHistoryDVT) riskScore += 2;
    if (patient.smoking) riskScore += 1;
    if (patient.diabetes) riskScore += 1;
    if (patient.hypertension) riskScore += 1;
    
    // Assessment-based risk
    if (assessment) {
      if (assessment.overallRisk === 'high') riskScore += 2;
      else if (assessment.overallRisk === 'moderate') riskScore += 1;
    }
    
    // Determine risk level
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'moderate';
    return 'low';
  };

  const calculateRiskScore = (patient: any, assessment: any): number => {
    // Return a percentage risk score (0-100)
    const riskLevel = calculateRiskLevel(patient, assessment);
    switch (riskLevel) {
      case 'high': return Math.min(85 + Math.random() * 15, 100);
      case 'moderate': return 40 + Math.random() * 40;
      case 'low': return Math.random() * 30;
      default: return 25;
    }
  };

  const filterAndSortPatients = useCallback(() => {
    let filtered = [...patients];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(query) ||
        patient.patientId?.toLowerCase().includes(query) ||
        patient.age.toString().includes(query)
      );
    }

    // Apply risk level filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(patient => patient.riskLevel === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return b.age - a.age;
        case 'riskLevel':
          const riskOrder = { high: 3, moderate: 2, low: 1 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        case 'lastUpdated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
  }, [patients, searchQuery, sortBy, filterBy]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPatients();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadPatients]);

  const handlePatientSelect = useCallback((patient: PatientRecord) => {
    if (isMultiPane) {
      setSelectedPatient(patient);
    } else {
      navigation.navigate('SavedPatientDetails', { patient });
    }
  }, [isMultiPane, navigation]);

  const handleDeletePatient = useCallback((patient: PatientRecord) => {
    Alert.alert(
      'Delete Patient Record',
      `Are you sure you want to delete ${patient.name}'s record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              store?.deletePatient?.(patient.id);
              if (selectedPatient?.id === patient.id) {
                setSelectedPatient(null);
              }
              loadPatients();
              Alert.alert('Success', `${patient.name}'s record has been deleted.`);
            } catch (error) {
              console.error('Error deleting patient:', error);
              Alert.alert('Error', 'Failed to delete patient record.');
            }
          }
        }
      ]
    );
  }, [store, selectedPatient, loadPatients]);



  const getRiskBadgeStyle = (riskLevel: 'low' | 'moderate' | 'high') => {
    return {
      backgroundColor: PINK_COLORS.risk[riskLevel],
      color: 'white',
    };
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSearchAndFilter = () => (
    <View style={styles.searchContainer}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={PINK_COLORS.text.light} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID, or age..."
          placeholderTextColor={PINK_COLORS.text.light}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="clear" size={20} color={PINK_COLORS.text.light} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter/Sort Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowSortModal(true)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialIcons name="tune" size={20} color={PINK_COLORS.primary} />
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPatientCard = ({ item, index }: { item: PatientRecord; index: number }) => {
    const isSelected = selectedPatient?.id === item.id;
    
    return (
      <Animated.View
        style={[
          styles.patientCard,
          isSelected && styles.selectedPatientCard,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          }
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handlePatientSelect(item)}
          activeOpacity={0.7}
        >
          {/* Patient Avatar */}
          <View style={styles.patientAvatar}>
            <MaterialIcons name="person" size={24} color={PINK_COLORS.primary} />
          </View>

          {/* Patient Info */}
          <View style={styles.patientInfo}>
            <Text style={[styles.patientName, isSelected && styles.selectedText]}>
              {item.name}
            </Text>
            <Text style={[styles.patientDetails, isSelected && styles.selectedSubText]}>
              {item.age} years • {item.gender === 'female' ? 'Female' : 'Male'}
            </Text>
            <Text style={[styles.patientDate, isSelected && styles.selectedSubText]}>
              Last assessed: {formatDate(item.lastAssessment)}
            </Text>
          </View>

          {/* Risk Badge */}
          <View style={styles.riskContainer}>
            <View style={[styles.riskBadge, getRiskBadgeStyle(item.riskLevel)]}>
              <Text style={styles.riskText}>
                {item.riskLevel.toUpperCase()}
              </Text>
            </View>
            {item.riskScore && (
              <Text style={styles.riskScore}>{item.riskScore.toFixed(0)}%</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Action Icons */}
        {!isMultiPane && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => navigation.navigate('PatientIntake', { editPatient: item })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="edit" size={18} color={PINK_COLORS.status.info} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => handleDeletePatient(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="delete" size={18} color={PINK_COLORS.status.error} />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderPatientList = () => (
    <View style={styles.patientListContainer}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredPatients.length} of {patients.length} patients
        </Text>
        <View style={styles.riskStats}>
          <View style={[styles.riskStat, { backgroundColor: PINK_COLORS.risk.high }]}>
            <Text style={styles.riskStatText}>
              {filteredPatients.filter(p => p.riskLevel === 'high').length}
            </Text>
          </View>
          <View style={[styles.riskStat, { backgroundColor: PINK_COLORS.risk.moderate }]}>
            <Text style={styles.riskStatText}>
              {filteredPatients.filter(p => p.riskLevel === 'moderate').length}
            </Text>
          </View>
          <View style={[styles.riskStat, { backgroundColor: PINK_COLORS.risk.low }]}>
            <Text style={styles.riskStatText}>
              {filteredPatients.filter(p => p.riskLevel === 'low').length}
            </Text>
          </View>
        </View>
      </View>

      {/* Patient List */}
      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        style={styles.patientList}
        contentContainerStyle={styles.patientListContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={64} color={PINK_COLORS.text.light} />
            <Text style={styles.emptyTitle}>No Patient Records Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Complete patient assessments will appear here'}
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderPatientDetails = () => {
    if (!selectedPatient) {
      return (
        <View style={styles.emptyDetailsContainer}>
          <MaterialIcons name="person-search" size={80} color={PINK_COLORS.text.light} />
          <Text style={styles.emptyDetailsTitle}>Select a Patient</Text>
          <Text style={styles.emptyDetailsSubtitle}>
            Choose a patient from the list to view their detailed information
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        {/* Patient Header */}
        <View style={styles.detailsHeader}>
          <View style={styles.detailsAvatar}>
            <MaterialIcons name="person" size={48} color={PINK_COLORS.primary} />
          </View>
          <View style={styles.detailsHeaderInfo}>
            <Text style={styles.detailsName}>{selectedPatient.name}</Text>
            <Text style={styles.detailsSubInfo}>
              {selectedPatient.age} years • {selectedPatient.gender === 'female' ? 'Female' : 'Male'}
            </Text>
            <Text style={styles.detailsId}>
              Patient ID: {selectedPatient.patientId || selectedPatient.id.slice(0, 8)}
            </Text>
          </View>
          <View style={[styles.detailsRiskBadge, getRiskBadgeStyle(selectedPatient.riskLevel)]}>
            <Text style={styles.detailsRiskText}>
              {selectedPatient.riskLevel.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Demographics Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Demographics</Text>
          <View style={styles.demographicsGrid}>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Height</Text>
              <Text style={styles.demographicValue}>{selectedPatient.height} cm</Text>
            </View>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Weight</Text>
              <Text style={styles.demographicValue}>{selectedPatient.weight} kg</Text>
            </View>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>BMI</Text>
              <Text style={styles.demographicValue}>
                {selectedPatient.bmi ? selectedPatient.bmi.toFixed(1) : 'N/A'}
              </Text>
            </View>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Status</Text>
              <Text style={styles.demographicValue}>{selectedPatient.menopausalStatus}</Text>
            </View>
          </View>
        </View>

        {/* Risk Assessment Summary */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Current Risk Assessment</Text>
          <View style={styles.riskSummaryContainer}>
            <View style={styles.riskScoreContainer}>
              <Text style={styles.riskScoreNumber}>
                {selectedPatient.riskScore?.toFixed(0) || '0'}%
              </Text>
              <Text style={styles.riskScoreLabel}>Overall Risk</Text>
            </View>
            <View style={styles.riskDetails}>
              <View style={[styles.riskLevelIndicator, getRiskBadgeStyle(selectedPatient.riskLevel)]}>
                <Text style={styles.riskLevelText}>{selectedPatient.riskLevel.toUpperCase()}</Text>
              </View>
              <Text style={styles.riskDescription}>
                {selectedPatient.riskLevel === 'high' 
                  ? 'High risk factors present. Requires careful monitoring and specialist consultation.'
                  : selectedPatient.riskLevel === 'moderate'
                  ? 'Moderate risk. Regular monitoring recommended with potential MHT benefits.'
                  : 'Low risk profile. MHT generally safe with appropriate monitoring.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Assessment History Timeline */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Assessment History</Text>
          <View style={styles.timeline}>
            {selectedPatient.assessmentHistory.length > 0 ? (
              selectedPatient.assessmentHistory.map((assessment, index) => (
                <View key={assessment.id} style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, getRiskBadgeStyle(assessment.riskLevel)]}>
                    <MaterialIcons name="assessment" size={16} color="white" />
                  </View>
                  {index < selectedPatient.assessmentHistory.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDate}>{formatDate(assessment.date)}</Text>
                    <Text style={styles.timelineRisk}>
                      Risk Level: {assessment.riskLevel.toUpperCase()} ({assessment.riskScore.toFixed(0)}%)
                    </Text>
                    {assessment.notes && (
                      <Text style={styles.timelineNotes}>{assessment.notes}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noHistory}>
                <MaterialIcons name="history" size={32} color={PINK_COLORS.text.light} />
                <Text style={styles.noHistoryText}>No assessment history available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.detailsActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => navigation.navigate('PatientIntake', { editPatient: selectedPatient })}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text style={styles.actionButtonText}>Reassess Patient</Text>
          </TouchableOpacity>
          

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerActionButton]}
            onPress={() => handleDeletePatient(selectedPatient)}
          >
            <MaterialIcons name="delete" size={20} color="white" />
            <Text style={styles.actionButtonText}>Delete Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity
              onPress={() => setShowSortModal(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="close" size={24} color={PINK_COLORS.text.dark} />
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Sort By</Text>
            {[
              { key: 'lastUpdated', label: 'Last Updated', icon: 'schedule' },
              { key: 'name', label: 'Name (A-Z)', icon: 'sort-by-alpha' },
              { key: 'age', label: 'Age (High to Low)', icon: 'person' },
              { key: 'riskLevel', label: 'Risk Level (High to Low)', icon: 'warning' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  sortBy === option.key && styles.selectedModalOption
                ]}
                onPress={() => setSortBy(option.key as SortOption)}
              >
                <MaterialIcons 
                  name={option.icon as any} 
                  size={20} 
                  color={sortBy === option.key ? PINK_COLORS.primary : PINK_COLORS.text.light} 
                />
                <Text style={[
                  styles.modalOptionText,
                  sortBy === option.key && styles.selectedModalOptionText
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <MaterialIcons name="check" size={20} color={PINK_COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Filter Options */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Filter by Risk Level</Text>
            {[
              { key: 'all', label: 'All Patients', icon: 'people', color: PINK_COLORS.text.light },
              { key: 'high', label: 'High Risk', icon: 'warning', color: PINK_COLORS.risk.high },
              { key: 'moderate', label: 'Moderate Risk', icon: 'info', color: PINK_COLORS.risk.moderate },
              { key: 'low', label: 'Low Risk', icon: 'check-circle', color: PINK_COLORS.risk.low },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  filterBy === option.key && styles.selectedModalOption
                ]}
                onPress={() => setFilterBy(option.key as FilterOption)}
              >
                <MaterialIcons 
                  name={option.icon as any} 
                  size={20} 
                  color={filterBy === option.key ? PINK_COLORS.primary : option.color} 
                />
                <Text style={[
                  styles.modalOptionText,
                  filterBy === option.key && styles.selectedModalOptionText
                ]}>
                  {option.label}
                </Text>
                {filterBy === option.key && (
                  <MaterialIcons name="check" size={20} color={PINK_COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={PINK_COLORS.primaryLight} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={PINK_COLORS.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Saved Patients</Text>
            <Text style={styles.headerSubtitle}>
              {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('PatientIntake')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="add" size={24} color={PINK_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        {renderSearchAndFilter()}

        {/* Content */}
        {isMultiPane ? (
          <View style={styles.multiPaneContainer}>
            <View style={styles.leftPane}>
              {renderPatientList()}
            </View>
            <View style={styles.rightPane}>
              {renderPatientDetails()}
            </View>
          </View>
        ) : (
          renderPatientList()
        )}

        {/* Sort Modal */}
        {renderSortModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PINK_COLORS.background.main,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: PINK_COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: PINK_COLORS.primaryLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PINK_COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: PINK_COLORS.text.muted,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },

  // Search and Filter Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: PINK_COLORS.background.card,
    borderBottomWidth: 1,
    borderBottomColor: PINK_COLORS.primaryLight,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK_COLORS.background.section,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: PINK_COLORS.primaryLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: PINK_COLORS.text.dark,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK_COLORS.background.card,
    borderWidth: 1,
    borderColor: PINK_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: PINK_COLORS.primary,
  },

  // Multi-pane Layout
  multiPaneContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPane: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: PINK_COLORS.primaryLight,
    backgroundColor: PINK_COLORS.background.section,
  },
  rightPane: {
    flex: 1,
    backgroundColor: PINK_COLORS.background.card,
  },

  // Patient List Styles
  patientListContainer: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: PINK_COLORS.background.card,
    borderBottomWidth: 1,
    borderBottomColor: PINK_COLORS.primaryLight,
  },
  statsText: {
    fontSize: 14,
    color: PINK_COLORS.text.dark,
    fontWeight: '500',
  },
  riskStats: {
    flexDirection: 'row',
    gap: 6,
  },
  riskStat: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskStatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  patientList: {
    flex: 1,
  },
  patientListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Patient Card Styles
  patientCard: {
    backgroundColor: PINK_COLORS.background.card,
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.1)',
  },
  selectedPatientCard: {
    backgroundColor: PINK_COLORS.primaryLighter,
    borderColor: PINK_COLORS.primary,
    elevation: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PINK_COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: PINK_COLORS.primaryLight,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PINK_COLORS.text.dark,
    marginBottom: 4,
  },
  selectedText: {
    color: PINK_COLORS.primary,
  },
  patientDetails: {
    fontSize: 14,
    color: PINK_COLORS.text.light,
    marginBottom: 2,
  },
  selectedSubText: {
    color: PINK_COLORS.text.muted,
  },
  patientDate: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    fontStyle: 'italic',
  },
  riskContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  riskText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  riskScore: {
    fontSize: 12,
    fontWeight: '600',
    color: PINK_COLORS.text.light,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PINK_COLORS.background.section,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: PINK_COLORS.text.light,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Patient Details Styles
  emptyDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyDetailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDetailsSubtitle: {
    fontSize: 16,
    color: PINK_COLORS.text.light,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: PINK_COLORS.primaryLight,
  },
  detailsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PINK_COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 3,
    borderColor: PINK_COLORS.primaryLight,
  },
  detailsHeaderInfo: {
    flex: 1,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PINK_COLORS.text.dark,
    marginBottom: 4,
  },
  detailsSubInfo: {
    fontSize: 16,
    color: PINK_COLORS.text.muted,
    marginBottom: 2,
  },
  detailsId: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    fontFamily: 'monospace',
  },
  detailsRiskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsRiskText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Details Sections
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PINK_COLORS.primary,
    marginBottom: 16,
  },
  demographicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  demographicItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: PINK_COLORS.background.section,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PINK_COLORS.primaryLight,
  },
  demographicLabel: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demographicValue: {
    fontSize: 16,
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
  },

  // Risk Summary
  riskSummaryContainer: {
    flexDirection: 'row',
    backgroundColor: PINK_COLORS.background.section,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PINK_COLORS.primaryLight,
  },
  riskScoreContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  riskScoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: PINK_COLORS.primary,
  },
  riskScoreLabel: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    marginTop: 4,
  },
  riskDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  riskLevelIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  riskDescription: {
    fontSize: 14,
    color: PINK_COLORS.text.dark,
    lineHeight: 20,
  },

  // Timeline Styles
  timeline: {
    paddingTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    bottom: -16,
    width: 2,
    backgroundColor: PINK_COLORS.primaryLight,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '600',
    color: PINK_COLORS.text.dark,
    marginBottom: 4,
  },
  timelineRisk: {
    fontSize: 12,
    color: PINK_COLORS.text.muted,
    marginBottom: 4,
  },
  timelineNotes: {
    fontSize: 12,
    color: PINK_COLORS.text.light,
    fontStyle: 'italic',
  },
  noHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noHistoryText: {
    fontSize: 14,
    color: PINK_COLORS.text.light,
    marginTop: 12,
  },

  // Action Buttons
  detailsActions: {
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: PINK_COLORS.primaryLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionButton: {
    backgroundColor: PINK_COLORS.primary,
  },
  secondaryActionButton: {
    backgroundColor: PINK_COLORS.background.card,
    borderWidth: 1,
    borderColor: PINK_COLORS.primary,
  },
  dangerActionButton: {
    backgroundColor: PINK_COLORS.status.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: PINK_COLORS.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: PINK_COLORS.primaryLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PINK_COLORS.text.dark,
  },
  modalSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PINK_COLORS.primary,
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: PINK_COLORS.background.section,
  },
  selectedModalOption: {
    backgroundColor: PINK_COLORS.primaryLighter,
    borderWidth: 1,
    borderColor: PINK_COLORS.primary,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    color: PINK_COLORS.text.dark,
    marginLeft: 12,
  },
  selectedModalOptionText: {
    color: PINK_COLORS.primary,
    fontWeight: '600',
  },
});