import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAssessmentStoreSimple } from '../store/assessmentStoreSimple';

const PatientListScreenTest: React.FC = () => {
  console.log("🔍 PatientListScreenTest: Component starting to render");
  
  const navigation = useNavigation();
  const { patients, loadPatients, deletePatient } = useAssessmentStoreSimple();
  
  console.log("🔍 PatientListScreenTest: Store data loaded, patients count:", patients?.length || 0);

  useEffect(() => {
    console.log("🔍 PatientListScreenTest: useEffect running");
    loadPatients();
  }, [loadPatients]);

  const handleDeletePatient = (patientId: string, patientName: string) => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log("🔍 PatientListScreenTest: Deleting patient", patientId);
            deletePatient(patientId);
          },
        },
      ]
    );
  };

  console.log("🔍 PatientListScreenTest: About to render, patients:", patients);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFC1CC" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Records (Test)</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PatientIntake' as never)}
        >
          <MaterialIcons name="add" size={24} color="#D81B60" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.debugText}>
          🔍 DEBUG: Patients loaded: {patients?.length || 0}
        </Text>
        
        {patients && patients.length > 0 ? (
          <View>
            {patients.map((patient) => (
              <View key={patient.id} style={styles.patientCard}>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientDetails}>
                    Age: {patient.age} | BMI: {patient.bmi?.toFixed(1) || 'N/A'}
                  </Text>
                  <Text style={styles.patientStatus}>
                    Status: {patient.menopausalStatus}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePatient(patient.id, patient.name)}
                >
                  <MaterialIcons name="delete" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="people-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>No Patients Found</Text>
            <Text style={styles.emptyStateSubtext}>
              This is a test screen with simplified store (no AsyncStorage)
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFC1CC',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  patientCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  patientStatus: {
    fontSize: 14,
    color: '#D81B60',
  },
  deleteButton: {
    padding: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default PatientListScreenTest;