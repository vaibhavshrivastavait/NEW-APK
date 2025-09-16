/**
 * Drug Interaction Checking Component
 * Displays real-time drug interaction checking results
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { CheckingResult } from '../utils/drugInteractionMapping';

interface DrugInteractionCheckingProps {
  checkingResults: CheckingResult[];
  isLocalMapping?: boolean;
  hasLoadError?: boolean;
  loadErrorMessage?: string;
}

const DrugInteractionChecking: React.FC<DrugInteractionCheckingProps> = ({
  checkingResults,
  isLocalMapping = true,
  hasLoadError = false,
  loadErrorMessage
}) => {
  
  // Don't render if no results and no error
  if (checkingResults.length === 0 && !hasLoadError) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Checking</Text>
        {isLocalMapping && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>Local mapping</Text>
          </View>
        )}
      </View>

      {/* Error State */}
      {hasLoadError && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={20} color="#D32F2F" />
          <Text style={styles.errorText}>
            {loadErrorMessage || 'Severity mapping unavailable — please update local rules file.'}
          </Text>
        </View>
      )}

      {/* Checking Results */}
      {checkingResults.map((result, index) => (
        <View 
          key={`${result.drugName}-${index}`}
          style={styles.checkingItem}
          accessible={true}
          accessibilityLabel={`Checking: ${result.displayName}, severity ${result.severityDisplay}`}
        >
          {/* Status Icon Circle */}
          <View style={[styles.statusIcon, { backgroundColor: result.color }]} />
          
          {/* Drug Name */}
          <Text style={styles.drugName}>{result.displayName}</Text>
          
          {/* Severity Badge */}
          <View style={[styles.severityBadge, { backgroundColor: result.color }]}>
            <Text style={styles.severityText}>{result.severityDisplay}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343A40',
  },
  
  localBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  
  localBadgeText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
    marginLeft: 8,
    lineHeight: 18,
  },
  
  checkingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  statusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  
  drugName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  severityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default DrugInteractionChecking;