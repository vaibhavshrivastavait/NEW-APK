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
import { useAssessmentStore } from '../store/assessmentStore';

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

export default function PatientListScreenBulletproof({ navigation }: Props) {
  // Safe store access
  const store = useAssessmentStore();
  const [patients, setPatients] = useState<SafePatientData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load patients safely
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = useCallback(() => {
    try {
      setIsLoading(true);
      const storePatients = store?.patients || [];
      
      // Transform to safe format
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
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [store]);

  // Safe filtering function that ALWAYS returns array
  const getFilteredPatients = (): SafePatientData[] => {
    try {
      if (!searchQuery.trim()) {
        return [...patients]; // Always return a copy
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
      return [...patients]; // Fallback to all patients
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
      `Are you sure you want to delete all ${patients.length} patient records? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => {
            try {
              store?.deleteAllPatients?.();
              setPatients([]);
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
              loadPatients(); // Reload to refresh the list
              Alert.alert('Success', `${patient.name}'s record has been deleted.`);
            } catch (error) {
              console.error('Error deleting patient:', error);
              Alert.alert('Error', 'Failed to delete patient record.');
            }
          }
        }
      ]
    );
  }, [store, loadPatients]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPatients();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadPatients]);

  const navigateToPatientDetails = useCallback((patient: SafePatientData) => {
    try {
      // For now, just show an alert - you can implement navigation later
      Alert.alert(
        'Patient Details',
        `Name: ${patient.name}\nAge: ${patient.age}\nBMI: ${patient.bmi?.toFixed(1) || 'N/A'}\nStatus: ${patient.menopausalStatus}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error showing patient details:', error);
      Alert.alert('Error', 'Unable to show patient details.');
    }
  }, []);

  // Bulletproof render patient item - NO FLATLIST
  const renderPatientItem = (item: SafePatientData, index: number) => {
    if (!item || !item.id) {
      return (
        <View key={`error_${index}`} style={styles.errorCard}>
          <Text style={styles.errorText}>Invalid patient data</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        key={item.id}
        style={styles.patientCard}
        onPress={() => navigateToPatientDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientDetails}>
            Age: {item.age} • BMI: {item.bmi ? item.bmi.toFixed(1) : 'N/A'}
          </Text>
          <Text style={styles.patientDetails}>
            Status: {item.menopausalStatus}
          </Text>
          <Text style={styles.patientDate}>
            Created: {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={(e) => {
              e.stopPropagation();
              navigateToPatientDetails(item);
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="visibility" size={20} color="#2196F3" />
            <Text style={styles.detailsText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeletePatient(item);
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="delete" size={20} color="#F44336" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFC1CC" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
          </TouchableOpacity>
          <Text style={styles.title}>Patient Records</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowSearch(!showSearch)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="search" size={24} color="#D81B60" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleDeleteAll}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="delete-sweep" size={24} color="#F44336" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('PatientIntake')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="add" size={24} color="#D81B60" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
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
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{patients.length}</Text>
              <Text style={styles.statLabel}>Total Records</Text>
            </View>
            {searchQuery && (
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{filteredPatients.length}</Text>
                <Text style={styles.statLabel}>Search Results</Text>
              </View>
            )}
          </View>
        )}

        {/* BULLETPROOF PATIENT LIST - NO FLATLIST */}
        <ScrollView
          style={styles.content}
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
              <Text style={styles.loadingText}>Loading patients...</Text>
            </View>
          ) : filteredPatients.length === 0 && !searchQuery ? (
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
          ) : filteredPatients.length === 0 && searchQuery ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={80} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptySubtitle}>
                No patient records match "{searchQuery}".
              </Text>
              <TouchableOpacity 
                style={styles.clearSearchButton} 
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredPatients.map((item, index) => renderPatientItem(item, index))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D81B60',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 1,
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
  content: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
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
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  detailsText: {
    fontSize: 12,
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 12,
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
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
  },
});