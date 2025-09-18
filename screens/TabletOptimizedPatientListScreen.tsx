import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ResponsiveLayout from '../components/ResponsiveLayout';
import ResponsiveText from '../components/ResponsiveText';
import TabletOptimizedHeader from '../components/TabletOptimizedHeader';
import { useAssessmentStore } from '../store/assessmentStore';

import { 
  getDeviceInfo, 
  getResponsiveSpacing, 
  getTouchTargetSize,
  shouldUseMultiPane 
} from '../utils/deviceUtils';

type PatientListNavigationProp = NativeStackNavigationProp<any, 'PatientList'>;

interface Props {
  navigation: PatientListNavigationProp;
}

interface SafePatientData {
  id: string;
  name: string;
  age: number;
  bmi: number | null;
  menopausalStatus: string;
  createdAt: string;
  height: number;
  weight: number;
}

export default function TabletOptimizedPatientListScreen({ navigation }: Props) {
  const store = useAssessmentStore();
  const [patients, setPatients] = useState<SafePatientData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<SafePatientData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const deviceInfo = getDeviceInfo();
  const spacing = getResponsiveSpacing(16);
  const touchTarget = getTouchTargetSize();
  const isMultiPane = shouldUseMultiPane();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = useCallback(() => {
    try {
      setIsLoading(true);
      const storePatients = store?.patients || [];
      
      const safePatients: SafePatientData[] = storePatients.map(patient => ({
        id: patient?.id || `fallback_${Date.now()}_${Math.random()}`,
        name: patient?.name || 'Unknown Patient',
        age: patient?.age || 0,
        bmi: patient?.bmi || null,
        menopausalStatus: patient?.menopausalStatus || 'Unknown',
        createdAt: typeof patient?.createdAt === 'string' 
          ? patient.createdAt 
          : patient?.createdAt?.toISOString?.() || new Date().toISOString(),
        height: patient?.height || 0,
        weight: patient?.weight || 0,
      }));

      setPatients(safePatients);
      
      // Auto-select first patient in multi-pane mode
      if (isMultiPane && safePatients.length > 0 && !selectedPatient) {
        setSelectedPatient(safePatients[0]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [store, isMultiPane, selectedPatient]);

  const getFilteredPatients = (): SafePatientData[] => {
    try {
      if (!searchQuery.trim()) {
        return [...patients];
      }
      
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(patient => 
        patient && 
        patient.name && (
          patient.name.toLowerCase().includes(query) ||
          patient.menopausalStatus?.toLowerCase().includes(query) ||
          patient.age?.toString().includes(query)
        )
      );
      
      return filtered.length > 0 ? filtered : [];
    } catch (error) {
      console.error('Error filtering patients:', error);
      return [...patients];
    }
  };

  const filteredPatients = getFilteredPatients();

  const formatDate = useCallback((dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Unknown Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown Date';
    }
  }, []);

  const handleDeleteAll = useCallback(() => {
    if (patients.length === 0) {
      Alert.alert('Info', 'No patient records to delete.');
      return;
    }

    Alert.alert(
      'Delete All Patient Records',
      `Are you sure you want to delete all ${patients.length} patient records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => {
            try {
              store?.deleteAllPatients?.();
              setPatients([]);
              setSelectedPatient(null);
              Alert.alert('Success', 'All patient records have been deleted.');
            } catch (error) {
              console.error('Error deleting all patients:', error);
              Alert.alert('Error', 'Failed to delete patient records.');
            }
          }
        }
      ]
    );
  }, [patients.length, store]);

  const handleDeletePatient = useCallback((patient: SafePatientData) => {
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
              
              // Update selected patient if it was deleted
              if (selectedPatient?.id === patient.id) {
                const remainingPatients = patients.filter(p => p.id !== patient.id);
                setSelectedPatient(remainingPatients.length > 0 ? remainingPatients[0] : null);
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
  }, [store, loadPatients, selectedPatient, patients]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPatients();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadPatients]);

  const handlePatientSelect = useCallback((patient: SafePatientData) => {
    if (isMultiPane) {
      setSelectedPatient(patient);
    } else {
      // Navigate to patient details for single pane
      navigation.navigate('PatientDetails', { patient });
    }
  }, [isMultiPane, navigation]);

  const renderPatientItem = (item: SafePatientData, index: number) => {
    if (!item || !item.id) {
      return (
        <View key={`error_${index}`} style={styles.errorCard}>
          <ResponsiveText variant="caption" style={styles.errorText}>
            Invalid patient data
          </ResponsiveText>
        </View>
      );
    }

    const isSelected = selectedPatient?.id === item.id;

    return (
      <TouchableOpacity 
        key={item.id}
        style={[
          styles.patientCard,
          isSelected && styles.selectedPatientCard,
          { minHeight: touchTarget }
        ]}
        onPress={() => handlePatientSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.patientInfo}>
          <ResponsiveText variant="body" style={[styles.patientName, isSelected && styles.selectedText]}>
            {item.name}
          </ResponsiveText>
          <ResponsiveText variant="caption" style={[styles.patientDetails, isSelected && styles.selectedSubText]}>
            Age: {item.age} • BMI: {item.bmi ? item.bmi.toFixed(1) : 'N/A'}
          </ResponsiveText>
          <ResponsiveText variant="caption" style={[styles.patientDetails, isSelected && styles.selectedSubText]}>
            Status: {item.menopausalStatus}
          </ResponsiveText>
          <ResponsiveText variant="caption" style={[styles.patientDate, isSelected && styles.selectedSubText]}>
            Created: {formatDate(item.createdAt)}
          </ResponsiveText>
        </View>
        
        {!isMultiPane && (
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.detailsButton, { minHeight: touchTarget }]}
              onPress={(e) => {
                e.stopPropagation();
                handlePatientSelect(item);
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="visibility" size={20} color="#2196F3" />
              <ResponsiveText variant="caption" style={styles.detailsText}>View</ResponsiveText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.deleteButton, { minHeight: touchTarget }]}
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePatient(item);
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="delete" size={20} color="#F44336" />
              <ResponsiveText variant="caption" style={styles.deleteText}>Delete</ResponsiveText>
            </TouchableOpacity>
          </View>
        )}
        
        {isMultiPane && (
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color={isSelected ? 'white' : '#ccc'} 
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderPatientDetails = () => {
    if (!selectedPatient) {
      return (
        <View style={styles.emptyDetailsContainer}>
          <MaterialIcons name="person" size={80} color="#E0E0E0" />
          <ResponsiveText variant="h4" style={styles.emptyDetailsTitle}>
            Select a Patient
          </ResponsiveText>
          <ResponsiveText variant="body" style={styles.emptyDetailsSubtitle}>
            Choose a patient from the list to view their details
          </ResponsiveText>
        </View>
      );
    }

    // Get full patient data from store
    const fullPatientData = store?.patients?.find(p => p.id === selectedPatient.id);
    const patientAssessment = store?.assessments?.find(a => a.patientId === selectedPatient.id);
    const patientRecommendation = store?.recommendations?.find(r => r.patientId === selectedPatient.id);

    return (
      <ScrollView 
        style={styles.detailsContainer} 
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Header */}
        <View style={styles.detailsHeader}>
          <View style={styles.patientAvatar}>
            <MaterialIcons name="person" size={48} color="#D81B60" />
          </View>
          <View style={styles.patientHeaderInfo}>
            <ResponsiveText variant="h3" style={styles.detailsTitle}>
              {selectedPatient.name}
            </ResponsiveText>
            <ResponsiveText variant="body" style={styles.detailsSubtitle}>
              {selectedPatient.age} years • {selectedPatient.menopausalStatus}
            </ResponsiveText>
          </View>
          <View style={styles.detailsActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { minHeight: touchTarget }]}
              onPress={() => handleDeletePatient(selectedPatient)}
            >
              <MaterialIcons name="delete" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.detailsSection}>
          <ResponsiveText variant="h4" style={styles.sectionTitle}>
            Basic Information
          </ResponsiveText>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <ResponsiveText variant="caption" style={styles.infoLabel}>Height</ResponsiveText>
              <ResponsiveText variant="body" style={styles.infoValue}>
                {fullPatientData?.height || selectedPatient.height} cm
              </ResponsiveText>
            </View>
            <View style={styles.infoItem}>
              <ResponsiveText variant="caption" style={styles.infoLabel}>Weight</ResponsiveText>
              <ResponsiveText variant="body" style={styles.infoValue}>
                {fullPatientData?.weight || selectedPatient.weight} kg
              </ResponsiveText>
            </View>
            <View style={styles.infoItem}>
              <ResponsiveText variant="caption" style={styles.infoLabel}>BMI</ResponsiveText>
              <ResponsiveText variant="body" style={styles.infoValue}>
                {selectedPatient.bmi ? selectedPatient.bmi.toFixed(1) : 'N/A'}
              </ResponsiveText>
            </View>
            <View style={styles.infoItem}>
              <ResponsiveText variant="caption" style={styles.infoLabel}>Created</ResponsiveText>
              <ResponsiveText variant="body" style={styles.infoValue}>
                {formatDate(selectedPatient.createdAt)}
              </ResponsiveText>
            </View>
          </View>
        </View>

        {/* Symptoms */}
        {fullPatientData && (
          <View style={styles.detailsSection}>
            <ResponsiveText variant="h4" style={styles.sectionTitle}>
              Symptoms (VAS 0-10)
            </ResponsiveText>
            <View style={styles.symptomsGrid}>
              {[
                { label: 'Hot Flushes', value: fullPatientData.hotFlushes },
                { label: 'Night Sweats', value: fullPatientData.nightSweats },
                { label: 'Sleep Disturbance', value: fullPatientData.sleepDisturbance },
                { label: 'Vaginal Dryness', value: fullPatientData.vaginalDryness },
                { label: 'Mood Changes', value: fullPatientData.moodChanges },
                { label: 'Joint Aches', value: fullPatientData.jointAches },
              ].map((symptom, index) => (
                <View key={index} style={styles.symptomItem}>
                  <ResponsiveText variant="caption" style={styles.symptomLabel}>
                    {symptom.label}
                  </ResponsiveText>
                  <View style={styles.symptomBar}>
                    <View 
                      style={[
                        styles.symptomFill, 
                        { 
                          width: `${(symptom.value || 0) * 10}%`,
                          backgroundColor: (symptom.value || 0) > 7 ? '#F44336' : 
                                         (symptom.value || 0) > 4 ? '#FF9800' : '#4CAF50'
                        }
                      ]} 
                    />
                  </View>
                  <ResponsiveText variant="caption" style={styles.symptomValue}>
                    {symptom.value || 0}/10
                  </ResponsiveText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Risk Assessment */}
        {patientAssessment && (
          <View style={styles.detailsSection}>
            <ResponsiveText variant="h4" style={styles.sectionTitle}>
              Risk Assessment
            </ResponsiveText>
            <View style={styles.riskGrid}>
              {[
                { label: 'Breast Cancer Risk', value: patientAssessment.breastCancerRisk },
                { label: 'CVD Risk', value: patientAssessment.cvdRisk },
                { label: 'VTE Risk', value: patientAssessment.vteRisk },
                { label: 'Overall Risk', value: patientAssessment.overallRisk },
              ].map((risk, index) => (
                <View key={index} style={styles.riskItem}>
                  <ResponsiveText variant="caption" style={styles.riskLabel}>
                    {risk.label}
                  </ResponsiveText>
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: 
                      risk.value === 'high' ? '#FFEBEE' :
                      risk.value === 'moderate' ? '#FFF8E1' : '#E8F5E8'
                    }
                  ]}>
                    <ResponsiveText variant="caption" style={[
                      styles.riskValue,
                      { color:
                        risk.value === 'high' ? '#D32F2F' :
                        risk.value === 'moderate' ? '#F57C00' : '#388E3C'
                      }
                    ]}>
                      {risk.value?.toUpperCase() || 'N/A'}
                    </ResponsiveText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* MHT Recommendation */}
        {patientRecommendation && (
          <View style={styles.detailsSection}>
            <ResponsiveText variant="h4" style={styles.sectionTitle}>
              MHT Recommendation
            </ResponsiveText>
            <View style={styles.recommendationCard}>
              <ResponsiveText variant="body" style={styles.recommendationType}>
                Type: {patientRecommendation.type || 'N/A'}
              </ResponsiveText>
              <ResponsiveText variant="body" style={styles.recommendationRoute}>
                Route: {patientRecommendation.route || 'N/A'}
              </ResponsiveText>
              {patientRecommendation.progestogenType && (
                <ResponsiveText variant="body" style={styles.recommendationRoute}>
                  Progestogen: {patientRecommendation.progestogenType || 'N/A'}
                </ResponsiveText>
              )}
              {patientRecommendation.rationale && patientRecommendation.rationale.length > 0 && (
                <View style={styles.rationaleContainer}>
                  <ResponsiveText variant="caption" style={styles.rationaleTitle}>
                    Rationale:
                  </ResponsiveText>
                  <ResponsiveText variant="caption" style={styles.rationaleText}>
                    {patientRecommendation.rationale.join(', ')}
                  </ResponsiveText>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderPatientList = () => (
    <View style={styles.patientListContainer}>
      {/* Search bar */}
      {showSearch && (
        <View style={[styles.searchContainer, { marginHorizontal: spacing }]}>
          <MaterialIcons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
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

      {/* Patient statistics */}
      {patients.length > 0 && (
        <View style={[styles.statsContainer, { marginHorizontal: spacing }]}>
          <View style={styles.statItem}>
            <ResponsiveText variant="h4" style={styles.statNumber}>
              {patients.length}
            </ResponsiveText>
            <ResponsiveText variant="caption" style={styles.statLabel}>
              Total Records
            </ResponsiveText>
          </View>
          {searchQuery && (
            <View style={styles.statItem}>
              <ResponsiveText variant="h4" style={styles.statNumber}>
                {filteredPatients.length}
              </ResponsiveText>
              <ResponsiveText variant="caption" style={styles.statLabel}>
                Search Results
              </ResponsiveText>
            </View>
          )}
        </View>
      )}

      {/* Patient list */}
      <ScrollView
        style={styles.patientListScroll}
        contentContainerStyle={[styles.patientListContent, { paddingHorizontal: spacing }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#D81B60']}
            tintColor="#D81B60"
          />
        }
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#D81B60" />
            <ResponsiveText variant="body" style={styles.loadingText}>
              Loading patients...
            </ResponsiveText>
          </View>
        ) : filteredPatients.length === 0 && !searchQuery ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={80} color="#E0E0E0" />
            <ResponsiveText variant="h4" style={styles.emptyTitle}>
              No Patient Records
            </ResponsiveText>
            <ResponsiveText variant="body" style={styles.emptySubtitle}>
              Complete patient assessments will appear here for future reference.
            </ResponsiveText>
            <TouchableOpacity 
              style={[styles.addButton, { minHeight: touchTarget }]}
              onPress={() => navigation.navigate('PatientIntake')}
            >
              <MaterialIcons name="add" size={24} color="white" />
              <ResponsiveText variant="body" style={styles.addButtonText}>
                Start New Assessment
              </ResponsiveText>
            </TouchableOpacity>
          </View>
        ) : filteredPatients.length === 0 && searchQuery ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={80} color="#E0E0E0" />
            <ResponsiveText variant="h4" style={styles.emptyTitle}>
              No Results Found
            </ResponsiveText>
            <ResponsiveText variant="body" style={styles.emptySubtitle}>
              No patient records match "{searchQuery}".
            </ResponsiveText>
            <TouchableOpacity 
              style={[styles.clearSearchButton, { minHeight: touchTarget }]}
              onPress={() => setSearchQuery('')}
            >
              <ResponsiveText variant="body" style={styles.clearSearchButtonText}>
                Clear Search
              </ResponsiveText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredPatients.map((item, index) => renderPatientItem(item, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  const headerActions = [
    {
      icon: 'search',
      onPress: () => setShowSearch(!showSearch),
      testID: 'search-patients',
    },
    {
      icon: 'delete-sweep',
      onPress: handleDeleteAll,
      color: '#F44336',
      testID: 'delete-all-patients',
    },
    {
      icon: 'add',
      onPress: () => navigation.navigate('PatientIntake'),
      testID: 'add-patient',
    },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        
        <TabletOptimizedHeader
          title="Patient Records"
          onBack={() => navigation.goBack()}
          actions={headerActions}
          subtitle={`${patients.length} patient${patients.length !== 1 ? 's' : ''}`}
        />

        <ResponsiveLayout
          leftPane={renderPatientList()}
          rightPane={isMultiPane ? renderPatientDetails() : undefined}
          leftPaneWidth={deviceInfo.isLargeTablet ? 400 : 350}
          enableMultiPane={true}
        >
          {!isMultiPane && renderPatientList()}
        </ResponsiveLayout>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  patientListContainer: {
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
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#D81B60',
  },
  statLabel: {
    color: '#999',
    marginTop: 4,
  },
  patientListScroll: {
    flex: 1,
  },
  patientListContent: {
    paddingVertical: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 200,
  },
  loadingText: {
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 300,
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D81B60',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  clearSearchButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  clearSearchButtonText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPatientCard: {
    backgroundColor: '#D81B60',
    borderColor: '#C2185B',
    elevation: 4,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedText: {
    color: 'white',
  },
  patientDetails: {
    color: '#666',
    marginBottom: 2,
  },
  selectedSubText: {
    color: 'rgba(255,255,255,0.8)',
  },
  patientDate: {
    color: '#999',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  detailsText: {
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  deleteText: {
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 4,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    justifyContent: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  // Patient Details Styles
  detailsContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  detailsContent: {
    padding: 24,
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
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  patientAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  patientHeaderInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsSubtitle: {
    color: '#666',
  },
  detailsActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  detailsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    color: '#333',
    fontWeight: '600',
  },
  symptomsGrid: {
    gap: 12,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  symptomLabel: {
    flex: 1,
    color: '#333',
    fontWeight: '500',
  },
  symptomBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 16,
  },
  symptomFill: {
    height: '100%',
    borderRadius: 4,
  },
  symptomValue: {
    minWidth: 40,
    textAlign: 'right',
    color: '#666',
    fontWeight: '600',
  },
  riskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  riskItem: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  riskLabel: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  riskValue: {
    fontWeight: 'bold',
  },
  recommendationCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
  },
  recommendationType: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationRoute: {
    color: '#666',
    marginBottom: 8,
  },
  rationaleContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rationaleTitle: {
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  rationaleText: {
    color: '#666',
    lineHeight: 18,
  },
});