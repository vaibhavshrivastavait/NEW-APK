/**
 * Medicine Selection Modal with Severity Selection
 * Allows users to select medicines from optional list with severity levels
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Pressable
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import optionalMedicinesConfig from '../assets/rules/optional_medicines.json';
import { createMedicineItem, MedicineItem } from '../utils/enhancedDrugAnalyzer';

interface MedicineSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onMedicineSelected: (medicine: MedicineItem) => void;
  selectedMedicineIds: string[];
}

const MedicineSelectionModal: React.FC<MedicineSelectionModalProps> = ({
  visible,
  onClose,
  onMedicineSelected,
  selectedMedicineIds
}) => {
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const handleMedicinePress = (medicine: any) => {
    // Check if medicine is already selected
    const medicineId = medicine.id;
    if (selectedMedicineIds.some(id => id.includes(medicineId))) {
      Alert.alert('Already Selected', `${medicine.displayName} is already selected.`);
      return;
    }
    
    setSelectedMedicine(medicine);
    setSelectedSeverity(medicine.defaultSeverity || 'medium');
  };

  const handleConfirmSelection = () => {
    if (!selectedMedicine) return;

    const medicineItem = createMedicineItem(
      selectedMedicine.displayName,
      selectedMedicine.category,
      selectedMedicine.key,
      selectedSeverity
    );

    onMedicineSelected(medicineItem);
    setSelectedMedicine(null);
    onClose();
  };

  const handleCancel = () => {
    setSelectedMedicine(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Medicine</Text>
          <TouchableOpacity
            onPress={handleConfirmSelection}
            style={[styles.confirmButton, !selectedMedicine && styles.confirmButtonDisabled]}
            disabled={!selectedMedicine}
          >
            <Text style={[styles.confirmButtonText, !selectedMedicine && styles.confirmButtonTextDisabled]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Medicine List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Medicines:</Text>
            {optionalMedicinesConfig.medicines.map((medicine) => {
              const isAlreadySelected = selectedMedicineIds.some(id => id.includes(medicine.id));
              const isCurrentSelection = selectedMedicine?.id === medicine.id;
              
              return (
                <TouchableOpacity
                  key={medicine.id}
                  style={[
                    styles.medicineCard,
                    isCurrentSelection && styles.medicineCardSelected,
                    isAlreadySelected && styles.medicineCardAlreadySelected
                  ]}
                  onPress={() => handleMedicinePress(medicine)}
                  disabled={isAlreadySelected}
                >
                  <View style={styles.medicineHeader}>
                    <Text style={[
                      styles.medicineName,
                      isCurrentSelection && styles.medicineNameSelected,
                      isAlreadySelected && styles.medicineNameAlreadySelected
                    ]}>
                      {medicine.displayName}
                    </Text>
                    <View style={[
                      styles.defaultSeverityBadge,
                      { backgroundColor: getSeverityColor(medicine.defaultSeverity) }
                    ]}>
                      <Text style={styles.defaultSeverityText}>
                        {medicine.defaultSeverity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.medicineDescription}>{medicine.description}</Text>
                  <Text style={styles.medicineCategory}>Category: {medicine.category}</Text>
                  {isAlreadySelected && (
                    <Text style={styles.alreadySelectedText}>✓ Already selected</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Severity Selection */}
          {selectedMedicine && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Select Severity for {selectedMedicine.displayName}:
              </Text>
              <Text style={styles.severityDescription}>
                Choose the clinical significance level for this medicine in the context of your assessment.
              </Text>
              
              {optionalMedicinesConfig.severityLevels.map((severity) => (
                <TouchableOpacity
                  key={severity.value}
                  style={[
                    styles.severityOption,
                    selectedSeverity === severity.value && styles.severityOptionSelected
                  ]}
                  onPress={() => setSelectedSeverity(severity.value as 'low' | 'medium' | 'high')}
                >
                  <View style={styles.severityOptionHeader}>
                    <View style={styles.severityRadio}>
                      {selectedSeverity === severity.value && (
                        <View style={[styles.severityRadioInner, { backgroundColor: severity.color }]} />
                      )}
                    </View>
                    <Text style={[
                      styles.severityLabel,
                      selectedSeverity === severity.value && styles.severityLabelSelected
                    ]}>
                      {severity.label}
                    </Text>
                    <View style={[styles.severityColorBadge, { backgroundColor: severity.color }]} />
                  </View>
                  <Text style={styles.severityOptionDescription}>{severity.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  
  cancelButton: {
    padding: 8,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  
  confirmButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  
  confirmButtonTextDisabled: {
    color: '#999',
  },
  
  content: {
    flex: 1,
    padding: 16,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  
  medicineCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  
  medicineCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  
  medicineCardAlreadySelected: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  medicineNameSelected: {
    color: '#007AFF',
  },
  
  medicineNameAlreadySelected: {
    color: '#999',
  },
  
  defaultSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  defaultSeverityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  medicineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  medicineCategory: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  
  alreadySelectedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 8,
  },
  
  severityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  severityOption: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  
  severityOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  
  severityOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  severityRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  severityRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  severityLabelSelected: {
    color: '#007AFF',
  },
  
  severityColorBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  severityOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 32,
  },
});

export default MedicineSelectionModal;