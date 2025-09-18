import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAssessmentStore, PatientData } from '../store/assessmentStore';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  PatientList: undefined;
  Demographics: undefined;
  Symptoms: undefined;
  RiskFactors: undefined;
  Results: undefined;
  Cme: undefined;
  Guidelines: undefined;
  Export: undefined;
  PatientDetails: { patient: PatientData };
  About: undefined;
};

type PatientListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientList'>;

interface Props {
  navigation: PatientListNavigationProp;
}

export default function PatientListScreen({ navigation }: Props) {
  // State management with modern React patterns
  const storeData = useAssessmentStore();
  const { 
    patients = [], 
    deletePatient = () => {}, 
    deleteAllPatients = () => {} 
  } = storeData || {};
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized filtered patients list for search functionality
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients || [];
    
    const query = searchQuery.toLowerCase();
    return (patients || []).filter(patient => 
      patient.name.toLowerCase().includes(query) ||
      patient.menopausalStatus.toLowerCase().includes(query) ||
      patient.age.toString().includes(query)
    );
  }, [patients, searchQuery]);

  // Memoized date formatter to prevent recreation on every render
  const formatDate = useCallback((date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  // Enhanced delete all functionality with better UX
  const handleDeleteAll = useCallback(() => {
    if (patients.length === 0) {
      Alert.alert('Info', 'No patient records to delete.');
      return;
    }

    Alert.alert(
      'Delete All Patient Records',
      `Are you sure you want to delete all ${patients.length} patient records? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            try {
              deleteAllPatients();
              Alert.alert('Success', 'All patient records have been deleted.');
            } catch (error) {
              console.error('❌ Error deleting all patients:', error);
              Alert.alert('Error', 'Failed to delete patient records. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, [patients.length, deleteAllPatients]);

  // Enhanced delete patient functionality
  const handleDeletePatient = useCallback((patient: PatientData) => {
    Alert.alert(
      'Delete Patient Record',
      `Are you sure you want to delete ${patient.name}'s record? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            try {
              deletePatient(patient.id);
              Alert.alert('Success', `${patient.name}'s record has been deleted.`);
            } catch (error) {
              console.error('❌ Error deleting patient:', error);
              Alert.alert('Error', 'Failed to delete patient record. Please try again.');
            }
          }
        }
      ]
    );
  }, [deletePatient]);

  // Enhanced refresh functionality
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay - in a real app this would fetch fresh data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Navigate to patient details with proper error handling
  const navigateToPatientDetails = useCallback((patient: PatientData) => {
    try {
      navigation.navigate('PatientDetails', { 
        patient: {
          ...patient,
          createdAt: patient.createdAt && typeof patient.createdAt === 'object' && patient.createdAt.toISOString 
            ? patient.createdAt.toISOString() 
            : typeof patient.createdAt === 'string' 
              ? patient.createdAt 
              : new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Error navigating to patient details:', error);
      Alert.alert('Error', 'Unable to open patient details. Please try again.');
    }
  }, [navigation]);

  // Enhanced render function with proper error handling and memoization
  const renderPatientItem = useCallback(({ item }: { item: PatientData }) => {
    if (!item) {
      console.error('❌ PatientListScreen: Received null/undefined item in renderPatientItem');
      return (
        <View style={styles.patientCard}>
          <Text style={styles.errorText}>Invalid patient data</Text>
        </View>
      );
    }

    // Create safe item with all required fields
    const safeItem = {
      id: item.id || `fallback_${Date.now()}`,
      name: item.name || 'Unknown Patient',
      age: item.age || 0,
      bmi: item.bmi || null,
      menopausalStatus: item.menopausalStatus || 'Unknown',
      createdAt: item.createdAt || new Date(),
      height: item.height || 0,
      weight: item.weight || 0,
      hysterectomy: item.hysterectomy || false,
      oophorectomy: item.oophorectomy || false,
      hotFlushes: item.hotFlushes || 0,
      nightSweats: item.nightSweats || 0,
      sleepDisturbance: item.sleepDisturbance || 0,
      ...item
    };

    try {
      return (
        <TouchableOpacity 
          style={styles.patientCard}
          onPress={() => navigateToPatientDetails(safeItem)}
          activeOpacity={0.7}
        >
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{safeItem.name}</Text>
            <Text style={styles.patientDetails}>
              Age: {safeItem.age} • BMI: {safeItem.bmi ? safeItem.bmi.toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.patientDetails}>
              Status: {safeItem.menopausalStatus}
            </Text>
            <Text style={styles.patientDate}>
              Created: {formatDate(safeItem.createdAt)}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={(e) => {
                e.stopPropagation();
                navigateToPatientDetails(safeItem);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="visibility" size={20} color="#2196F3" />
              <Text style={styles.detailsText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePatient(safeItem);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="delete" size={20} color="#F44336" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('❌ PatientListScreen: Error rendering patient item:', error, 'Item:', item);
      return (
        <View style={styles.patientCard}>
          <Text style={styles.errorText}>Error displaying patient: {safeItem.name}</Text>
        </View>
      );
    }
  }, [navigateToPatientDetails, handleDeletePatient, formatDate]);

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
        <Text style={styles.title}>Patient Records</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleDeleteAll}
          >
            <MaterialIcons name="delete-sweep" size={24} color="#F44336" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('PatientIntake')}
          >
            <MaterialIcons name="add" size={24} color="#D81B60" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {patients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No Patient Records</Text>
            <Text style={styles.emptySubtitle}>
              Complete patient assessments will appear here for future reference.
            </Text>
            
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => navigation.navigate('PatientIntake')}
            >
              <MaterialIcons name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Start New Assessment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SafeFlatList
            data={patients || []}
            renderItem={renderPatientItem}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D81B60',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
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
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
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
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  patientDate: {
    fontSize: 12,
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
    gap: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  deleteText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});