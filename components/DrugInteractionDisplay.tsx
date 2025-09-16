/**
 * Enhanced Drug Interaction Results Display
 * Shows results grouped by risk level with clear medicine names
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  DrugInteractionResult,
  GroupedInteractionResults,
  getRiskColor,
  getRiskIcon
} from '../utils/drugInteractionHandler';

interface DrugInteractionDisplayProps {
  groupedResults: GroupedInteractionResults | null;
  isLoading?: boolean;
}

const DrugInteractionDisplay: React.FC<DrugInteractionDisplayProps> = ({
  groupedResults,
  isLoading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    high: true,
    moderate: true,
    low: true
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing drug interactions...</Text>
      </View>
    );
  }

  if (!groupedResults || groupedResults.overallRiskLevel === 'NONE') {
    return (
      <View style={styles.noInteractionsContainer}>
        <MaterialIcons name="check-circle" size={48} color="#65A30D" />
        <Text style={styles.noInteractionsTitle}>No Interactions Found</Text>
        <Text style={styles.noInteractionsText}>
          No known drug interactions detected between your selected medicines.
        </Text>
      </View>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderInteractionItem = (interaction: DrugInteractionResult) => (
    <View key={`${interaction.mainMedicine}-${interaction.optionalMedicine}`} style={styles.interactionItem}>
      <View style={styles.medicineRow}>
        <Text style={styles.medicineName}>{interaction.mainMedicine}</Text>
        <MaterialIcons name="add" size={16} color="#6B7280" />
        <Text style={styles.medicineName}>{interaction.optionalMedicine}</Text>
      </View>
      
      <Text style={styles.rationale}>{interaction.rationale}</Text>
      
      <View style={styles.actionContainer}>
        <MaterialIcons name="info-outline" size={16} color="#6B7280" />
        <Text style={styles.recommendedAction}>{interaction.recommendedAction}</Text>
      </View>
    </View>
  );

  const renderRiskSection = (
    title: string,
    interactions: DrugInteractionResult[],
    severity: 'HIGH' | 'MODERATE' | 'LOW',
    sectionKey: string
  ) => {
    if (interactions.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];
    const riskColor = getRiskColor(severity);
    const riskIcon = getRiskIcon(severity);

    return (
      <View style={styles.riskSection}>
        <TouchableOpacity
          style={[styles.riskHeader, { borderLeftColor: riskColor }]}
          onPress={() => toggleSection(sectionKey)}
        >
          <View style={styles.riskHeaderLeft}>
            <MaterialIcons name={riskIcon as any} size={20} color={riskColor} />
            <Text style={[styles.riskTitle, { color: riskColor }]}>
              {title} ({interactions.length})
            </Text>
          </View>
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color={riskColor} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.riskContent}>
            {interactions.map(renderInteractionItem)}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.overallRiskContainer}>
        <View style={[
          styles.overallRiskBadge, 
          { backgroundColor: getRiskColor(groupedResults.overallRiskLevel) }
        ]}>
          <MaterialIcons 
            name={getRiskIcon(groupedResults.overallRiskLevel) as any} 
            size={20} 
            color="white" 
          />
          <Text style={styles.overallRiskText}>
            Overall Risk: {groupedResults.overallRiskLevel}
          </Text>
        </View>
      </View>

      {renderRiskSection(
        "High Risk",
        groupedResults.highRisk,
        "HIGH",
        "high"
      )}

      {renderRiskSection(
        "Moderate Risk", 
        groupedResults.moderateRisk,
        "MODERATE",
        "moderate"
      )}

      {renderRiskSection(
        "Low Risk",
        groupedResults.lowRisk,
        "LOW",
        "low"
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  noInteractionsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noInteractionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginTop: 16,
    marginBottom: 8,
  },
  noInteractionsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  overallRiskContainer: {
    padding: 16,
    alignItems: 'center',
  },
  overallRiskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  overallRiskText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  riskSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderLeftWidth: 4,
  },
  riskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  riskContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  interactionItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 4,
  },
  rationale: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendedAction: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 16,
    marginLeft: 4,
  },
});

export default DrugInteractionDisplay;