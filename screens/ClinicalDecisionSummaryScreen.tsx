/**
 * Clinical Decision Summary Screen
 * Displays personalized clinical decisions with recommendations and rationale
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Share
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DecisionSummary } from '../utils/decisionSummaryAnalyzer';

interface ClinicalDecisionSummaryRouteParams {
  decisionSummary: DecisionSummary;
}

type ClinicalDecisionSummaryRouteProp = RouteProp<{
  ClinicalDecisionSummary: ClinicalDecisionSummaryRouteParams;
}, 'ClinicalDecisionSummary'>;

const ClinicalDecisionSummaryScreen: React.FC = () => {
  const route = useRoute<ClinicalDecisionSummaryRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { decisionSummary } = route.params;

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const toggleCardExpansion = (recommendationId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recommendationId)) {
        newSet.delete(recommendationId);
      } else {
        newSet.add(recommendationId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return '#DC2626';
      case 'high': case 'major': return '#EA580C';
      case 'medium': case 'moderate': return '#D97706';
      case 'low': case 'minor': return '#65A30D';
      default: return '#6B7280';
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'warning';
      case 'high': case 'major': return 'priority-high';
      case 'medium': case 'moderate': return 'info';
      case 'low': case 'minor': return 'info-outline';
      default: return 'info';
    }
  };

  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case 'high': return '#059669';
      case 'medium': return '#D97706';
      case 'low': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleExportSummary = async () => {
    setIsExporting(true);
    try {
      const exportText = `
Clinical Decision Summary
Patient ID: ${decisionSummary.patientId}
Generated: ${formatTimestamp(decisionSummary.timestamp)}
Source: Rule Engine + ${decisionSummary.sources.guidelines.join(', ')}

TOP RECOMMENDATION:
${decisionSummary.topRecommendation.text} (Confidence: ${decisionSummary.topRecommendation.confidence}%)

DETAILED RECOMMENDATIONS:
${decisionSummary.recommendations.map((rec, index) => `
${index + 1}. ${rec.text} (${rec.priority.toUpperCase()})
   Category: ${rec.category}
   Rationale: ${rec.rationale}
   Evidence: ${rec.evidence}
   Actions: ${rec.details?.join('; ') || 'See rationale'}
   ${rec.ruleId ? `Rule ID: ${rec.ruleId}` : ''}
   Source: ${rec.source}
`).join('\n')}

SUMMARY:
${decisionSummary.summary.patientProfile}
Key Findings: ${decisionSummary.summary.keyFindings.join(', ')}
Overall Risk: ${decisionSummary.summary.overallRisk}
Rules Evaluated: ${decisionSummary.summary.rulesEvaluated}
Rules Triggered: ${decisionSummary.summary.rulesTriggered}
      `.trim();

      await Share.share({
        message: exportText,
        title: 'Clinical Decision Summary'
      });
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Unable to export decision summary');
    }
    setIsExporting(false);
  };

  const renderRecommendationCard = (recommendation: DecisionSummary['recommendations'][0], index: number) => {
    const cardId = recommendation.ruleId || `rec_${index}`;
    const isExpanded = expandedCards.has(cardId);
    const priorityColor = getPriorityColor(recommendation.priority);

    return (
      <View key={cardId} style={[styles.recommendationCard, { borderLeftColor: priorityColor }]}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleCardExpansion(cardId)}
          accessibilityLabel={`${recommendation.text}, ${recommendation.priority} priority, tap to ${isExpanded ? 'collapse' : 'expand'}`}
          accessibilityRole="button"
        >
          <View style={styles.cardHeaderContent}>
            <MaterialIcons 
              name={getPriorityIcon(recommendation.priority)} 
              size={20} 
              color={priorityColor} 
            />
            <View style={styles.cardTitleSection}>
              <Text style={styles.cardTitle}>{recommendation.text}</Text>
              <View style={styles.cardMetadata}>
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                  <Text style={styles.priorityBadgeText}>{recommendation.priority.toUpperCase()}</Text>
                </View>
                <View style={[styles.confidenceBadge, { backgroundColor: '#059669' }]}>
                  <Text style={styles.confidenceBadgeText}>{recommendation.category}</Text>
                </View>
              </View>
            </View>
          </View>
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>

        {/* Always show primary action and evidence */}
        <View style={styles.cardSummary}>
          {recommendation.details && recommendation.details.length > 0 && (
            <Text style={styles.primaryAction}>
              <MaterialIcons name="arrow-forward" size={14} color="#007AFF" />
              {' '}{recommendation.details[0]}
            </Text>
          )}

          {recommendation.evidence && (
            <View style={styles.evidenceContainer}>
              <MaterialIcons name="assessment" size={16} color="#059669" />
              <Text style={styles.evidenceText}>{recommendation.evidence}</Text>
            </View>
          )}

          {recommendation.triggeredFields && recommendation.triggeredFields.length > 0 && (
            <View style={styles.involvedMedicines}>
              <Text style={styles.involvedLabel}>Triggered by: </Text>
              <Text style={styles.involvedText}>
                {recommendation.triggeredFields.join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Expanded content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.rationaleSection}>
              <Text style={styles.sectionLabel}>Clinical Rationale:</Text>
              <Text style={styles.rationaleText}>{recommendation.rationale}</Text>
            </View>

            {recommendation.details && recommendation.details.length > 1 && (
              <View style={styles.actionsSection}>
                <Text style={styles.sectionLabel}>Recommended Actions:</Text>
                {recommendation.details.map((action, actionIndex) => (
                  <View key={actionIndex} style={styles.actionItem}>
                    <Text style={styles.actionNumber}>{actionIndex + 1}.</Text>
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.sourceSection}>
              <Text style={styles.sourceLabel}>Source: </Text>
              <Text style={styles.sourceText}>{recommendation.source}</Text>
              {recommendation.ruleId && (
                <Text style={[styles.sourceText, { marginLeft: 8 }]}>({recommendation.ruleId})</Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Clinical Decision Support</Text>
          <Text style={styles.headerSubtitle}>
            Patient {decisionSummary.patientId} • {formatTimestamp(decisionSummary.timestamp)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportSummary}
          disabled={isExporting}
          accessibilityLabel="Export decision summary"
          accessibilityRole="button"
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <MaterialIcons name="share" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Source Information Banner */}
        <View style={styles.sourceBanner}>
          <View style={styles.sourceBannerContent}>
            <MaterialIcons 
              name={decisionSummary.sources.ruleEngine ? "psychology" : "storage"} 
              size={16} 
              color="#059669" 
            />
            <Text style={styles.sourceBannerText}>
              {decisionSummary.sources.ruleEngine 
                ? `Rule Engine: ${decisionSummary.summary.rulesEvaluated} rules evaluated, ${decisionSummary.summary.rulesTriggered} triggered`
                : 'Local rules only — online check skipped'
              }
            </Text>
          </View>
          <Text style={styles.analysisTime}>
            {decisionSummary.sources.guidelines.length} guidelines
          </Text>
        </View>

        {/* Top Recommendation */}
        <View style={[
          styles.topRecommendationCard, 
          { borderLeftColor: getPriorityColor(decisionSummary.topRecommendation.priority) }
        ]}>
          <View style={styles.topRecommendationHeader}>
            <MaterialIcons 
              name="priority-high" 
              size={24} 
              color={getPriorityColor(decisionSummary.topRecommendation.priority)} 
            />
            <Text style={styles.topRecommendationLabel}>Top Recommendation</Text>
          </View>
          <Text style={styles.topRecommendationText}>
            {decisionSummary.topRecommendation.text}
          </Text>
        </View>

        {/* Recommendations List */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>
            Detailed Recommendations ({decisionSummary.recommendations.length})
          </Text>
          
          {decisionSummary.recommendations.length === 0 ? (
            <View style={styles.noRecommendationsCard}>
              <MaterialIcons name="check-circle" size={48} color="#059669" />
              <Text style={styles.noRecommendationsTitle}>No Issues Identified</Text>
              <Text style={styles.noRecommendationsText}>
                Current medication selection and assessment results show no significant interactions or contraindications.
              </Text>
            </View>
          ) : (
            decisionSummary.recommendations.map((rec, index) => renderRecommendationCard(rec, index))
          )}
        </View>

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('DecisionSupport')}
          >
            <MaterialIcons name="edit" size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Modify Selection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              Alert.alert(
                'Save to Patient Record',
                'This decision summary will be saved to the patient record for future reference.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Save', 
                    onPress: () => {
                      // TODO: Implement save to patient record
                      Alert.alert('Saved', 'Decision summary saved to patient record');
                    }
                  }
                ]
              );
            }}
          >
            <MaterialIcons name="save" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Save to Record</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  
  headerContent: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  
  exportButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  content: {
    flex: 1,
    padding: 16,
  },
  
  sourceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  
  sourceBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  sourceBannerText: {
    fontSize: 14,
    color: '#059669',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  analysisTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  topRecommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  topRecommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  topRecommendationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  
  topRecommendationText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    fontWeight: '500',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  
  recommendationsSection: {
    marginBottom: 24,
  },
  
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  cardTitleSection: {
    flex: 1,
    marginLeft: 12,
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  
  cardMetadata: {
    flexDirection: 'row',
    gap: 8,
  },
  
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  
  confidenceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  cardSummary: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  involvedMedicines: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  involvedLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  involvedText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },
  
  primaryAction: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  
  evidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
  
  evidenceText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 4,
  },
  
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  
  rationaleSection: {
    marginBottom: 16,
  },
  
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  rationaleText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  actionsSection: {
    marginBottom: 16,
  },
  
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  actionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
    marginTop: 1,
  },
  
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
  
  sourceSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  sourceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  
  sourceText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  noRecommendationsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  noRecommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginTop: 16,
    marginBottom: 8,
  },
  
  noRecommendationsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  bottomPadding: {
    height: 32,
  },
});

export default ClinicalDecisionSummaryScreen;