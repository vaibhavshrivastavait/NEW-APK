import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import SafeFlatList from '../components/SafeFlatList';
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
  // 🔧 CRITICAL FIX: Handle store initialization failures
  const storeData = useAssessmentStore();
  console.log("🔍 PatientListScreen: Store data:", storeData);
  
  const { 
    patients = [], 
    deletePatient = () => {}, 
    deleteAllPatients = () => {} 
  } = storeData || {};
  
  const [refreshing, setRefreshing] = useState(false);

  const handleDeleteAll = () => {
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
            deleteAllPatients();
          }
        }
      ]
    );
  };

  const handleDeletePatient = (patient: PatientData) => {
    Alert.alert(
      'Delete Patient Record',
      `Are you sure you want to delete ${patient.name}'s record? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deletePatient(patient.id)
        }
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (date: Date | string) => {
    // Handle both Date objects and string dates safely
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
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const renderPatientItem = ({ item }: { item: PatientData }) => {
    // Add defensive checks for item data
    if (!item) {
      console.error('🚨 PatientListScreen: Received null/undefined item in renderPatientItem');
      return (
        <View style={styles.patientCard}>
          <Text style={styles.errorText}>Invalid patient data</Text>
        </View>
      );
    }

    // Ensure required fields exist
    const safeItem = {
      name: item.name || 'Unknown Patient',
      age: item.age || 0,
      bmi: item.bmi || null,
      menopausalStatus: item.menopausalStatus || 'Unknown',
      createdAt: item.createdAt || new Date(),
      ...item
    };

    try {
      return (
        <TouchableOpacity 
          style={styles.patientCard}
          onPress={() => navigation.navigate('PatientDetails', { 
            patient: {
              ...safeItem,
              // Safely handle createdAt whether it's a Date object or string
              createdAt: safeItem.createdAt && typeof safeItem.createdAt === 'object' && safeItem.createdAt.toISOString 
                ? safeItem.createdAt.toISOString() 
                : typeof safeItem.createdAt === 'string' 
                  ? safeItem.createdAt 
                  : new Date().toISOString()
            }
          })}
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
                navigation.navigate('PatientDetails', { 
                  patient: {
                    ...safeItem,
                    createdAt: safeItem.createdAt && typeof safeItem.createdAt === 'object' && safeItem.createdAt.toISOString 
                      ? safeItem.createdAt.toISOString() 
                      : typeof safeItem.createdAt === 'string' 
                        ? safeItem.createdAt 
                        : new Date().toISOString()
                  }
                });
              }}
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
            >
              <MaterialIcons name="delete" size={20} color="#F44336" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('🚨 PatientListScreen: Error rendering patient item:', error, 'Item:', item);
      return (
        <View style={styles.patientCard}>
          <Text style={styles.errorText}>Error displaying patient: {safeItem.name}</Text>
        </View>
      );
    }
  };

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