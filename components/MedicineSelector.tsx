/**
 * Enhanced Medicine Selector Component
 * Features: Remove controls, multi-select, accessibility, confirmation dialogs
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Vibration,
  AccessibilityInfo
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MedicineItem } from '../utils/enhancedDrugAnalyzer';

interface MedicineSelectorProps {
  medicines: MedicineItem[];
  onRemoveMedicine: (medicineId: string) => void;
  onRemoveMultipleMedicines: (medicineIds: string[]) => void;
  multiSelectMode?: boolean;
  showRemoveControls?: boolean;
  accessibilityLabel?: string;
  onSelectionChange?: (selectedIds: string[]) => void;
}

interface ConfirmationModalProps {
  visible: boolean;
  medicine?: MedicineItem;
  medicines?: MedicineItem[];
  onConfirm: () => void;
  onCancel: () => void;
  isMultiple?: boolean;
}

const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'high':
      return '#FF4444';
    case 'moderate':
      return '#FF8800';
    case 'low':
      return '#FFA500';
    default:
      return '#666666';
  }
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  medicine,
  medicines,
  onConfirm,
  onCancel,
  isMultiple = false
}) => {
  const medicineNames = isMultiple && medicines 
    ? medicines.map(m => m.displayName || m.name).join(', ')
    : medicine?.displayName || medicine?.name || '';

  const message = isMultiple
    ? `Remove ${medicines?.length} selected medications from this assessment?`
    : `Remove "${medicine?.displayName || medicine?.name}" from this assessment?`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="warning" size={24} color="#FF6B35" />
              <Text style={styles.modalTitle}>Confirm Removal</Text>
            </View>
            
            <Text style={styles.modalMessage}>{message}</Text>
            
            {isMultiple && medicines && medicines.length > 3 && (
              <View style={styles.medicinePreview}>
                <Text style={styles.previewText}>
                  {medicines.slice(0, 3).map(m => m.displayName || m.name).join(', ')}
                  {medicines.length > 3 && ` and ${medicines.length - 3} more...`}
                </Text>
              </View>
            )}
            
            <Text style={styles.modalSubtext}>
              This will also invalidate any cached analysis for this patient session.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onCancel}
                accessibilityLabel="Cancel removal"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={onConfirm}
                accessibilityLabel={`Confirm removal of ${isMultiple ? 'selected medications' : medicine?.displayName || medicine?.name}`}
                accessibilityRole="button"
              >
                <MaterialIcons name="delete" size={16} color="white" />
                <Text style={styles.confirmButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const MedicineSelector: React.FC<MedicineSelectorProps> = ({
  medicines,
  onRemoveMedicine,
  onRemoveMultipleMedicines,
  multiSelectMode = false,
  showRemoveControls = true,
  accessibilityLabel = "Medicine selection list",
  onSelectionChange
}) => {
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [medicineToRemove, setMedicineToRemove] = useState<MedicineItem | undefined>();
  const [medicinesToRemove, setMedicinesToRemove] = useState<MedicineItem[]>([]);
  const [isMultipleRemoval, setIsMultipleRemoval] = useState(false);

  const handleSingleRemove = useCallback((medicine: MedicineItem) => {
    // Haptic feedback for accessibility
    Vibration.vibrate(50);
    
    setMedicineToRemove(medicine);
    setIsMultipleRemoval(false);
    setShowConfirmModal(true);
  }, []);

  const handleMultipleRemove = useCallback(() => {
    if (selectedMedicines.length === 0) {
      Alert.alert('No Selection', 'Please select medicines to remove.');
      return;
    }

    const medicines = selectedMedicines.map(id => 
      medicines.find(m => m.id === id)
    ).filter(Boolean) as MedicineItem[];

    setMedicinesToRemove(medicines);
    setIsMultipleRemoval(true);
    setShowConfirmModal(true);
    
    // Haptic feedback
    Vibration.vibrate([50, 100, 50]);
  }, [selectedMedicines, medicines]);

  const confirmRemoval = useCallback(() => {
    if (isMultipleRemoval) {
      const idsToRemove = medicinesToRemove.map(m => m.id);
      onRemoveMultipleMedicines(idsToRemove);
      setSelectedMedicines([]);
      onSelectionChange?.([]);
    } else if (medicineToRemove) {
      onRemoveMedicine(medicineToRemove.id);
    }
    
    setShowConfirmModal(false);
    setMedicineToRemove(undefined);
    setMedicinesToRemove([]);
  }, [isMultipleRemoval, medicinesToRemove, medicineToRemove, onRemoveMedicine, onRemoveMultipleMedicines, onSelectionChange]);

  const cancelRemoval = useCallback(() => {
    setShowConfirmModal(false);
    setMedicineToRemove(undefined);
    setMedicinesToRemove([]);
  }, []);

  const toggleMedicineSelection = useCallback((medicineId: string) => {
    setSelectedMedicines(prev => {
      const newSelection = prev.includes(medicineId)
        ? prev.filter(id => id !== medicineId)
        : [...prev, medicineId];
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  const selectAll = useCallback(() => {
    const allIds = medicines.map(m => m.id);
    setSelectedMedicines(allIds);
    onSelectionChange?.(allIds);
  }, [medicines, onSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelectedMedicines([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  if (medicines.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="medication" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No medicines selected</Text>
        <Text style={styles.emptySubtext}>Add medicines to check for interactions</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with multi-select controls */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Selected Medicines ({medicines.length})
        </Text>
        
        {multiSelectMode && showRemoveControls && (
          <View style={styles.multiSelectControls}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={selectedMedicines.length === medicines.length ? clearSelection : selectAll}
              accessibilityLabel={selectedMedicines.length === medicines.length ? "Clear all selections" : "Select all medicines"}
              accessibilityRole="button"
            >
              <Text style={styles.selectButtonText}>
                {selectedMedicines.length === medicines.length ? 'Clear All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            
            {selectedMedicines.length > 0 && (
              <TouchableOpacity
                style={styles.removeSelectedButton}
                onPress={handleMultipleRemove}
                accessibilityLabel={`Remove ${selectedMedicines.length} selected medicines`}
                accessibilityRole="button"
              >
                <MaterialIcons name="delete" size={16} color="white" />
                <Text style={styles.removeSelectedText}>
                  Remove ({selectedMedicines.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Medicine list */}
      <ScrollView
        style={styles.medicineList}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={accessibilityLabel}
      >
        {medicines.map((medicine) => {
          const isSelected = selectedMedicines.includes(medicine.id);
          
          return (
            <View
              key={medicine.id}
              style={[
                styles.medicineItem,
                isSelected && styles.medicineItemSelected
              ]}
            >
              {multiSelectMode && (
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleMedicineSelection(medicine.id)}
                  accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${medicine.displayName || medicine.name}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <MaterialIcons
                    name={isSelected ? "check-box" : "check-box-outline-blank"}
                    size={20}
                    color={isSelected ? "#007AFF" : "#ccc"}
                  />
                </TouchableOpacity>
              )}
              
              <View style={styles.medicineInfo}>
                <View style={styles.medicineNameRow}>
                  <Text style={styles.medicineName}>{medicine.displayName || medicine.name}</Text>
                  {medicine.severity && (
                    <View style={[
                      styles.severityBadge, 
                      { backgroundColor: getSeverityColor(medicine.severity) }
                    ]}>
                      <Text style={styles.severityText}>{medicine.severity.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.medicineDetails}>
                  <Text style={styles.medicineCategory}>{medicine.category}</Text>
                  <Text style={styles.medicineSeparator}>•</Text>
                  <Text style={styles.medicineType}>{medicine.type.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.medicineTimestamp}>
                  Added: {new Date(medicine.timestamp).toLocaleDateString()}
                </Text>
              </View>
              
              {showRemoveControls && !multiSelectMode && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleSingleRemove(medicine)}
                  accessibilityLabel={`Remove ${medicine.displayName || medicine.name} from selection`}
                  accessibilityRole="button"
                  accessibilityHint="Double tap to remove this medicine"
                >
                  <MaterialIcons name="close" size={20} color="#FF6B35" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        medicine={medicineToRemove}
        medicines={medicinesToRemove}
        onConfirm={confirmRemoval}
        onCancel={cancelRemoval}
        isMultiple={isMultipleRemoval}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  multiSelectControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  
  selectButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  removeSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6B35',
    borderRadius: 6,
    gap: 4,
  },
  
  removeSelectedText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  
  medicineList: {
    flex: 1,
  },
  
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  medicineItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  
  checkbox: {
    marginRight: 12,
    padding: 4,
  },
  
  medicineInfo: {
    flex: 1,
  },
  
  medicineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  medicineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  medicineDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  
  medicineCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  medicineSeparator: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 6,
  },
  
  medicineType: {
    fontSize: 12,
    color: '#666',
  },
  
  medicineTimestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  
  removeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  
  modalMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  
  medicinePreview: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  
  previewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 20,
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  
  confirmButton: {
    backgroundColor: '#FF6B35',
  },
  
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  confirmButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});

export default MedicineSelector;