/**
 * Analysis Results Display Component
 * Shows grouped drug interaction results with expand/collapse functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  AnalysisResult, 
  DrugInteractionAnalysis, 
  ContraindicationResult,
  DuplicateTherapyResult,
  HighRiskCombination,
  groupInteractionsBySeverity 
} from '../utils/enhancedDrugAnalyzer';

interface AnalysisResultsDisplayProps {
  analysisResult: AnalysisResult | null;
  onRetryAnalysis?: () => void;
  isLoading?: boolean;
}

interface InteractionCardProps {
  interaction: DrugInteractionAnalysis;
  onExpand?: (interactionId: string) => void;
}

interface StatusBannerProps {
  status: AnalysisResult['analysisStatus'];
  apiErrors?: string[];
  onRetry?: () => void;
}

const getSeverityColor = (severity: string): string => {
  // Handle both old and new severity formats for backward compatibility
  const normalizedSeverity = severity.toLowerCase();
  switch (normalizedSeverity) {
    case 'critical':
    case 'high': 
      return '#DC2626'; // Red
    case 'major': 
      return '#EA580C'; // Orange
    case 'moderate': 
      return '#D97706'; // Amber
    case 'minor':
    case 'low': 
      return '#65A30D'; // Green
    default: 
      return '#6B7280'; // Gray
  }
};

const getSeverityIcon = (severity: string): string => {
  // Handle both old and new severity formats for backward compatibility
  const normalizedSeverity = severity.toLowerCase();
  switch (normalizedSeverity) {
    case 'critical':
    case 'high': 
      return 'dangerous';
    case 'major':
    case 'moderate': 
      return 'warning';
    case 'minor':
    case 'low': 
      return 'check-circle';
    default: 
      return 'help';
  }
};

const StatusBanner: React.FC<StatusBannerProps> = ({ status, apiErrors, onRetry }) => {
  if (status === 'complete') return null;

  const getBannerConfig = () => {
    switch (status) {
      case 'local_only':
        return {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          icon: 'wifi-off' as const,
          title: 'Local Analysis Only',
          message: 'Online check skipped — using local rules only',
          showRetry: !!onRetry
        };
      case 'partial':
        return {
          color: '#EF4444',
          backgroundColor: '#FEE2E2',
          icon: 'error-outline' as const,
          title: 'Partial Results',
          message: 'Online check failed — showing local results only',
          showRetry: !!onRetry
        };
      case 'failed':
        return {
          color: '#DC2626',
          backgroundColor: '#FEE2E2',
          icon: 'error' as const,
          title: 'Analysis Failed',
          message: 'Unable to complete analysis. Please try again.',
          showRetry: !!onRetry
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  return (
    <View style={[styles.statusBanner, { backgroundColor: config.backgroundColor }]}>
      <View style={styles.statusContent}>
        <MaterialIcons name={config.icon} size={20} color={config.color} />
        <View style={styles.statusText}>
          <Text style={[styles.statusTitle, { color: config.color }]}>
            {config.title}
          </Text>
          <Text style={[styles.statusMessage, { color: config.color }]}>
            {config.message}
          </Text>
          {apiErrors && apiErrors.length > 0 && (
            <Text style={[styles.statusDetails, { color: config.color }]}>
              Error: {apiErrors[0]}
            </Text>
          )}
        </View>
      </View>
      
      {config.showRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: config.color }]}
          onPress={onRetry}
          accessibilityLabel="Retry analysis"
          accessibilityRole="button"
        >
          <MaterialIcons name="refresh" size={16} color={config.color} />
          <Text style={[styles.retryButtonText, { color: config.color }]}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const InteractionCard: React.FC<InteractionCardProps> = ({ interaction, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const severityColor = getSeverityColor(interaction.severity);
  const severityIcon = getSeverityIcon(interaction.severity);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    onExpand?.(interaction.id);
  };

  const openSource = async () => {
    if (interaction.source === 'local') {
      Alert.alert(
        'Local Rule',
        'This interaction was identified using built-in clinical rules.',
        [{ text: 'OK' }]
      );
      return;
    }

    // For API sources, could open external links
    Alert.alert(
      'External Source',
      `This interaction was identified by: ${interaction.source}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.interactionCard, { borderLeftColor: severityColor }]}>
      <TouchableOpacity
        style={styles.interactionHeader}
        onPress={toggleExpanded}
        accessibilityLabel={`${interaction.title}, ${interaction.severity} severity, ${isExpanded ? 'collapse' : 'expand'} details`}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.interactionHeaderLeft}>
          <MaterialIcons name={severityIcon} size={20} color={severityColor} />
          <View style={styles.interactionTitleContainer}>
            <Text style={styles.interactionTitle}>{interaction.title}</Text>
            <Text style={styles.interactionSubtitle}>{interaction.shortExplanation}</Text>
          </View>
        </View>
        
        <View style={styles.interactionHeaderRight}>
          <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
            <Text style={styles.severityText}>{interaction.severity.toUpperCase()}</Text>
          </View>
          <MaterialIcons 
            name={isExpanded ? 'expand-less' : 'expand-more'} 
            size={20} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.interactionDetails}>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Clinical Impact:</Text>
            <Text style={styles.detailText}>{interaction.clinicalImpact}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Suggested Actions:</Text>
            {interaction.suggestedActions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <Text style={styles.actionBullet}>•</Text>
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Medications Involved:</Text>
            <Text style={styles.medicationList}>
              {interaction.medications.join(' + ')}
            </Text>
          </View>

          {interaction.expandedDetails && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Additional Details:</Text>
              <Text style={styles.detailText}>{interaction.expandedDetails}</Text>
            </View>
          )}

          <View style={styles.sourceSection}>
            <TouchableOpacity
              style={styles.sourceButton}
              onPress={openSource}
              accessibilityLabel={`View source: ${interaction.source}`}
              accessibilityRole="button"
            >
              <MaterialIcons name="info-outline" size={16} color="#007AFF" />
              <Text style={styles.sourceText}>
                Source: {interaction.source === 'local' ? 'Built-in Rules' : interaction.source}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const ContraindicationCard: React.FC<{ contraindication: ContraindicationResult }> = ({ contraindication }) => {
  const severityColor = contraindication.severity === 'absolute' ? '#DC2626' : '#EA580C';
  const severityIcon = contraindication.severity === 'absolute' ? 'block' : 'warning';

  return (
    <View style={[styles.contraindicationCard, { borderLeftColor: severityColor }]}>
      <View style={styles.contraindicationHeader}>
        <MaterialIcons name={severityIcon} size={20} color={severityColor} />
        <View style={styles.contraindicationInfo}>
          <Text style={styles.contraindicationMedication}>{contraindication.medication}</Text>
          <Text style={styles.contraindicationCondition}>{contraindication.condition}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Text style={styles.severityText}>
            {contraindication.severity.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.contraindicationReason}>{contraindication.reason}</Text>
      <Text style={styles.contraindicationRecommendation}>
        <Text style={styles.boldText}>Recommendation: </Text>
        {contraindication.recommendation}
      </Text>
    </View>
  );
};

const DuplicateTherapyCard: React.FC<{ duplicate: DuplicateTherapyResult }> = ({ duplicate }) => (
  <View style={styles.duplicateCard}>
    <View style={styles.duplicateHeader}>
      <MaterialIcons name="content-copy" size={20} color="#F59E0B" />
      <Text style={styles.duplicateCategory}>Duplicate {duplicate.category} therapy</Text>
    </View>
    <Text style={styles.duplicateMedications}>
      {duplicate.medications.join(', ')}
    </Text>
    <Text style={styles.duplicateRecommendation}>{duplicate.recommendation}</Text>
  </View>
);

const HighRiskCard: React.FC<{ risk: HighRiskCombination }> = ({ risk }) => {
  const severityColor = risk.severity === 'critical' ? '#DC2626' : '#EA580C';
  const riskIcons = {
    vte: 'bloodtype',
    bleeding: 'healing',
    cardiovascular: 'favorite',
    hepatic: 'local-hospital',
    metabolic: 'science'
  };

  return (
    <View style={[styles.highRiskCard, { borderLeftColor: severityColor }]}>
      <View style={styles.highRiskHeader}>
        <MaterialIcons 
          name={riskIcons[risk.riskType] || 'warning'} 
          size={20} 
          color={severityColor} 
        />
        <Text style={styles.highRiskType}>
          {risk.riskType.toUpperCase()} RISK - {risk.severity.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.highRiskMedications}>
        {risk.medications.join(' + ')}
      </Text>
      <Text style={styles.highRiskExplanation}>{risk.explanation}</Text>
      <Text style={styles.highRiskRecommendation}>
        <Text style={styles.boldText}>Recommendation: </Text>
        {risk.recommendation}
      </Text>
    </View>
  );
};

const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({
  analysisResult,
  onRetryAnalysis,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="hourglass-empty" size={32} color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing medicines...</Text>
        <Text style={styles.loadingSubtext}>
          Running local rules and checking for interactions
        </Text>
      </View>
    );
  }

  if (!analysisResult) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="science" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No analysis results</Text>
        <Text style={styles.emptySubtext}>
          Select medicines and tap "Analyze" to check for interactions
        </Text>
      </View>
    );
  }

  const groupedInteractions = groupInteractionsBySeverity(analysisResult.interactions);
  const hasResults = analysisResult.interactions.length > 0 || 
                    analysisResult.contraindications.length > 0 ||
                    analysisResult.duplicateTherapies.length > 0 ||
                    analysisResult.highRiskCombinations.length > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Status Banner */}
      <StatusBanner
        status={analysisResult.analysisStatus}
        apiErrors={analysisResult.apiErrors}
        onRetry={onRetryAnalysis}
      />

      {!hasResults ? (
        <View style={styles.noIssuesContainer}>
          <MaterialIcons name="check-circle" size={48} color="#22C55E" />
          <Text style={styles.noIssuesText}>No interactions found</Text>
          <Text style={styles.noIssuesSubtext}>
            The selected medicines appear to be compatible based on current analysis
          </Text>
        </View>
      ) : (
        <>
          {/* Critical Interactions */}
          {groupedInteractions.critical.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="dangerous" size={20} color="#DC2626" />
                <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>
                  Critical Interactions ({groupedInteractions.critical.length})
                </Text>
              </View>
              {groupedInteractions.critical.map(interaction => (
                <InteractionCard key={interaction.id} interaction={interaction} />
              ))}
            </View>
          )}

          {/* Major Interactions */}
          {groupedInteractions.major.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="warning" size={20} color="#EA580C" />
                <Text style={[styles.sectionTitle, { color: '#EA580C' }]}>
                  Major Interactions ({groupedInteractions.major.length})
                </Text>
              </View>
              {groupedInteractions.major.map(interaction => (
                <InteractionCard key={interaction.id} interaction={interaction} />
              ))}
            </View>
          )}

          {/* Contraindications */}
          {analysisResult.contraindications.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="block" size={20} color="#DC2626" />
                <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>
                  Contraindications ({analysisResult.contraindications.length})
                </Text>
              </View>
              {analysisResult.contraindications.map(contraindication => (
                <ContraindicationCard key={contraindication.id} contraindication={contraindication} />
              ))}
            </View>
          )}

          {/* High Risk Combinations */}
          {analysisResult.highRiskCombinations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="report-problem" size={20} color="#EA580C" />
                <Text style={[styles.sectionTitle, { color: '#EA580C' }]}>
                  High-Risk Combinations ({analysisResult.highRiskCombinations.length})
                </Text>
              </View>
              {analysisResult.highRiskCombinations.map(risk => (
                <HighRiskCard key={risk.id} risk={risk} />
              ))}
            </View>
          )}

          {/* Duplicate Therapies */}
          {analysisResult.duplicateTherapies.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="content-copy" size={20} color="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
                  Duplicate Therapies ({analysisResult.duplicateTherapies.length})
                </Text>
              </View>
              {analysisResult.duplicateTherapies.map(duplicate => (
                <DuplicateTherapyCard key={duplicate.id} duplicate={duplicate} />
              ))}
            </View>
          )}

          {/* Moderate Interactions */}
          {groupedInteractions.moderate.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="info" size={20} color="#D97706" />
                <Text style={[styles.sectionTitle, { color: '#D97706' }]}>
                  Moderate Interactions ({groupedInteractions.moderate.length})
                </Text>
              </View>
              {groupedInteractions.moderate.map(interaction => (
                <InteractionCard key={interaction.id} interaction={interaction} />
              ))}
            </View>
          )}

          {/* Minor Interactions */}
          {groupedInteractions.minor.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="check-circle" size={20} color="#65A30D" />
                <Text style={[styles.sectionTitle, { color: '#65A30D' }]}>
                  Minor Interactions ({groupedInteractions.minor.length})
                </Text>
              </View>
              {groupedInteractions.minor.map(interaction => (
                <InteractionCard key={interaction.id} interaction={interaction} />
              ))}
            </View>
          )}
        </>
      )}

      {/* Analysis timestamp */}
      <View style={styles.timestampContainer}>
        <Text style={styles.timestampText}>
          Analysis completed: {new Date(analysisResult.timestamp).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
    marginTop: 16,
  },
  
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  
  noIssuesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  noIssuesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22C55E',
    marginTop: 16,
  },
  
  noIssuesSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  statusText: {
    marginLeft: 8,
    flex: 1,
  },
  
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  statusMessage: {
    fontSize: 12,
    marginTop: 2,
  },
  
  statusDetails: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
  },
  
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    gap: 4,
  },
  
  retryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  section: {
    marginBottom: 20,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  interactionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  
  interactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  
  interactionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  interactionTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  
  interactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  
  interactionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  
  interactionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  interactionDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  
  detailSection: {
    marginBottom: 12,
  },
  
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  detailText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  
  actionBullet: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
    marginTop: 1,
  },
  
  actionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    flex: 1,
  },
  
  medicationList: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  sourceSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  sourceText: {
    fontSize: 12,
    color: '#007AFF',
  },
  
  contraindicationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  
  contraindicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  contraindicationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  
  contraindicationMedication: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  
  contraindicationCondition: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  
  contraindicationReason: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  
  contraindicationRecommendation: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  
  boldText: {
    fontWeight: '600',
  },
  
  duplicateCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  
  duplicateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  duplicateCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  
  duplicateMedications: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  
  duplicateRecommendation: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  highRiskCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  
  highRiskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  highRiskType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  
  highRiskMedications: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  
  highRiskExplanation: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  
  highRiskRecommendation: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  
  timestampContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  timestampText: {
    fontSize: 11,
    color: '#999',
  },
});

export default AnalysisResultsDisplay;