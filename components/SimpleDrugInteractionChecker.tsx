/**
 * Enhanced Drug Interaction Checker with Categories
 * Updated to use comprehensive main and optional categories as requested
 * Now integrated with interaction-aggregator.ts for real severity calculations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getSeverityForMainOptional, getSeverityColor, getSeverityTextColor, InteractionResult } from '../src/interaction-aggregator';

// Category-based medicine organization as requested by user
const MAIN_CATEGORIES = [
  {
    id: 'hrt',
    title: 'Hormone Replacement Therapy (HRT)',
    medicines: ['hormone_estradiol', 'hormone_progesterone', 'hormone_testosterone'],
    color: '#E91E63'
  },
  {
    id: 'serms',
    title: 'Selective Estrogen Receptor Modulators (SERMs)',
    medicines: ['raloxifene', 'bazedoxifene'],
    color: '#9C27B0'
  },
  {
    id: 'tibolone',
    title: 'Tibolone',
    medicines: ['tibolone'],
    color: '#673AB7'
  },
  {
    id: 'antidepressants',
    title: 'SSRIs / SNRIs',
    medicines: ['paroxetine', 'venlafaxine'],
    color: '#3F51B5'
  },
  {
    id: 'anticonvulsants_menopause',
    title: 'Anticonvulsants (for menopause symptoms)',
    medicines: ['gabapentin', 'pregabalin'],
    color: '#2196F3'
  },
  {
    id: 'antihypertensives',
    title: 'Clonidine & Other Antihypertensives',
    medicines: ['clonidine'],
    color: '#03A9F4'
  },
  {
    id: 'herbal_estrogen',
    title: 'Herbal Estrogen Supplements (phytoestrogens)',
    medicines: ['black_cohosh', 'soy_isoflavones', 'red_clover'],
    color: '#4CAF50'
  },
  {
    id: 'herbal_general',
    title: 'General Herbal Supplements',
    medicines: ['evening_primrose_oil', 'ginseng', 'st_johns_wort'],
    color: '#8BC34A'
  },
  {
    id: 'alternative_therapies',
    title: 'Complementary & Alternative Therapies',
    medicines: ['acupuncture_herbs', 'traditional_chinese_medicine'],
    color: '#CDDC39'
  },
  {
    id: 'bisphosphonates',
    title: 'Bisphosphonates',
    medicines: ['alendronate', 'risedronate'],
    color: '#FF9800'
  }
];

// Import drug interaction data
import drugInteractionData from "../assets/rules/drug_interactions.json";

// Color palette for categories
const CATEGORY_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FF9800', '#FF5722', '#795548'
];

// Dynamically generate categories from JSON data
const generateCategoriesFromData = () => {
  const uniqueOptionals = [...new Set(drugInteractionData.rules.map(rule => rule.interaction_with))];
  
  return uniqueOptionals.map((category, index) => {
    // Extract example medicines from the rules for this category
    const exampleRules = drugInteractionData.rules.filter(rule => rule.interaction_with === category);
    const medicines = exampleRules.length > 0 && exampleRules[0].examples 
      ? exampleRules[0].examples 
      : ['various medications'];
    
    return {
      id: category.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      title: category,
      medicines: medicines,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    };
  });
};

// Generate optional categories dynamically from JSON data
const OPTIONAL_CATEGORIES = generateCategoriesFromData();

interface Category {
  id: string;
  title: string;
  medicines: string[];
  color: string;
}

interface CheckingItem {
  drugName: string;
  severity: 'high' | 'moderate' | 'low' | 'unknown';
  color: string;
  rationale?: string;
  recommended_action?: string;
}



function getSeverityDisplay(severity: 'high' | 'moderate' | 'low' | 'unknown'): string {
  switch (severity) {
    case 'high': return 'High';
    case 'moderate': return 'Moderate';
    case 'low': return 'Low';
    case 'unknown': return 'Unknown';
    default: return 'Unknown';
  }
}

export default function SimpleDrugInteractionChecker() {
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null);
  const [selectedOptionalCategories, setSelectedOptionalCategories] = useState<Category[]>([]);
  const [checkingResults, setCheckingResults] = useState<CheckingItem[]>([]);

  // Real interaction checking using drug_interactions.json via interaction-aggregator
  useEffect(() => {
    if (!selectedMainCategory || selectedOptionalCategories.length === 0) {
      setCheckingResults([]);
      return;
    }

    const checkInteractions = async () => {
      const mainMedicine = selectedMainCategory.title;
      const optionalMedicines = selectedOptionalCategories.map(cat => cat.title);
      
      console.log(`[SimpleDrugInteractionChecker] Checking interactions for ${mainMedicine} with ${optionalMedicines.length} optionals`);
      
      // Get interaction results from the aggregator using the new async function
      const results: CheckingItem[] = [];
      
      for (const optional of optionalMedicines) {
        try {
          const interactionResult = await getSeverityForMainOptional(mainMedicine, optional);
          results.push({
            drugName: interactionResult.optional,
            severity: interactionResult.severity.toLowerCase() as 'high' | 'moderate' | 'low' | 'unknown',
            color: getSeverityColor(interactionResult.severity),
            rationale: interactionResult.rationale,
            recommended_action: interactionResult.recommended_action,
          });
        } catch (error) {
          console.error(`[SimpleDrugInteractionChecker] Error checking ${mainMedicine} + ${optional}:`, error);
          // Fallback for error cases
          results.push({
            drugName: optional,
            severity: 'unknown',
            color: getSeverityColor('UNKNOWN'),
            rationale: 'Error loading interaction data',
            recommended_action: 'Please try again or consult specialist',
          });
        }
      }
      
      console.log(`[SimpleDrugInteractionChecker] Completed checking ${results.length} interactions`);
      setCheckingResults(results);
    };

    checkInteractions();
  }, [selectedMainCategory, selectedOptionalCategories]);

  const handleMainCategorySelect = (category: Category) => {
    setSelectedMainCategory(category);
    setSelectedOptionalCategories([]);
  };

  const handleOptionalCategoryToggle = (category: Category) => {
    const isSelected = selectedOptionalCategories.some(cat => cat.id === category.id);
    
    if (isSelected) {
      setSelectedOptionalCategories(prev => prev.filter(cat => cat.id !== category.id));
    } else {
      setSelectedOptionalCategories(prev => [...prev, category]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="medical-services" size={32} color="#667eea" />
          <Text style={styles.headerTitle}>Drug Interaction Checker</Text>
          <Text style={styles.headerSubtitle}>Professional Category-Based Assessment</Text>
        </View>

        {/* Main Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Treatment Categories</Text>
          <Text style={styles.sectionSubtitle}>Select your main treatment category</Text>
          
          <View style={styles.categoryGrid}>
            {MAIN_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedMainCategory?.id === category.id && styles.selectedCategoryCard,
                  { borderLeftColor: category.color }
                ]}
                onPress={() => handleMainCategorySelect(category)}
              >
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Text style={[styles.categoryIconText, { color: category.color }]}>
                      {category.title.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  {selectedMainCategory?.id === category.id && (
                    <MaterialIcons name="check-circle" size={20} color={category.color} />
                  )}
                </View>
                <Text style={[styles.categoryTitle, selectedMainCategory?.id === category.id && { color: category.color }]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Optional Categories Selection */}
        {selectedMainCategory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Medications</Text>
            <Text style={styles.sectionSubtitle}>
              Select categories of medications your patient is currently taking
            </Text>
            
            {/* Selected Categories Summary */}
            {selectedOptionalCategories.length > 0 && (
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryTitle}>
                  Selected: {selectedOptionalCategories.length} categories
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedTags}>
                  {selectedOptionalCategories.map((cat) => (
                    <View key={cat.id} style={[styles.selectedTag, { backgroundColor: cat.color }]}>
                      <Text style={styles.selectedTagText}>{cat.title}</Text>
                      <TouchableOpacity
                        onPress={() => handleOptionalCategoryToggle(cat)}
                        style={styles.removeTagButton}
                      >
                        <MaterialIcons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Available Optional Categories */}
            <View style={styles.categoryGrid}>
              {OPTIONAL_CATEGORIES.map((category) => {
                const isSelected = selectedOptionalCategories.some(cat => cat.id === category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      styles.optionalCategoryCard,
                      isSelected && styles.selectedCategoryCard,
                      { borderLeftColor: category.color }
                    ]}
                    onPress={() => handleOptionalCategoryToggle(category)}
                  >
                    <View style={styles.categoryHeader}>
                      <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                        <Text style={[styles.categoryIconText, { color: category.color }]}>
                          {category.title.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      {isSelected && (
                        <MaterialIcons name="check-circle" size={20} color={category.color} />
                      )}
                    </View>
                    <Text style={[styles.categoryTitle, isSelected && { color: category.color }]}>
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Checking Results */}
        {checkingResults.length > 0 && (
          <View style={styles.checkingSection}>
            <View style={styles.checkingHeader}>
              <Text style={styles.checkingTitle}>Checking</Text>
              <View style={styles.localBadge}>
                <Text style={styles.localBadgeText}>JSON-based mapping</Text>
              </View>
            </View>

            <View 
              style={styles.resultsContainer}
              id="interaction-results"
              aria-describedby="severity-legend"
            >
              {checkingResults.map((result, index) => (
                <View
                  key={`${result.drugName}-${index}`}
                  style={styles.checkingItem}
                  accessible={true}
                  accessibilityLabel={`${result.drugName}. Severity: ${getSeverityDisplay(result.severity)}. ${result.rationale || ''}. ${result.recommended_action ? `Action: ${result.recommended_action}` : ''}`}
                >
                  {/* Medicine name and severity badge row */}
                  <View style={styles.medicineRow}>
                    <View style={styles.medicineNameContainer}>
                      <View style={[styles.statusIcon, { backgroundColor: result.color }]} />
                      <Text style={styles.drugName}>{result.drugName}</Text>
                    </View>
                    <View 
                      style={[styles.severityBadge, { backgroundColor: result.color }]}
                      accessibilityLabel={`Severity: ${getSeverityDisplay(result.severity)}`}
                    >
                      <Text style={[styles.severityText, { color: getSeverityTextColor(result.severity) }]}>
                        {getSeverityDisplay(result.severity)}
                      </Text>
                    </View>
                  </View>

                  {/* Rationale and action text block */}
                  {(result.rationale || result.recommended_action) && (
                    <View style={styles.textBlock}>
                      <Text style={styles.rationaleAndAction} accessible={true}>
                        {result.rationale && (
                          <Text style={styles.rationale}>{result.rationale}</Text>
                        )}
                        {result.rationale && result.recommended_action && (
                          <Text style={styles.separator}>  </Text>
                        )}
                        {result.recommended_action && (
                          <Text>
                            <Text style={styles.actionLabel}>Action: </Text>
                            <Text style={styles.actionText}>{result.recommended_action}</Text>
                          </Text>
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Severity Legend */}
            <View style={styles.severityLegend} id="severity-legend">
              <Text style={styles.legendTitle}>Severity Legend</Text>
              
              <View style={styles.legendItem} 
                    accessible={true}
                    accessibilityLabel="Severity low: Minimal clinical concern. Monitor as needed.">
                <View style={[styles.legendCircle, { backgroundColor: '#FFC107' }]} />
                <View style={styles.legendContent}>
                  <Text style={styles.legendLabel}>LOW</Text>
                  <Text style={styles.legendDescription}>
                    Minimal clinical concern. Interaction is unlikely to cause harm but may need awareness or routine monitoring.
                  </Text>
                </View>
              </View>

              <View style={styles.legendItem}
                    accessible={true}
                    accessibilityLabel="Severity moderate: Potentially significant. Consider dose adjustment or monitoring.">
                <View style={[styles.legendCircle, { backgroundColor: '#FF9800' }]} />
                <View style={styles.legendContent}>
                  <Text style={styles.legendLabel}>MODERATE</Text>
                  <Text style={styles.legendDescription}>
                    Potentially significant. Interaction may require dose adjustment, monitoring, or considering an alternative if risk factors present.
                  </Text>
                </View>
              </View>

              <View style={styles.legendItem}
                    accessible={true}
                    accessibilityLabel="Severity high: Clinically serious. Avoid or supervise closely.">
                <View style={[styles.legendCircle, { backgroundColor: '#F44336' }]} />
                <View style={styles.legendContent}>
                  <Text style={styles.legendLabel}>HIGH</Text>
                  <Text style={styles.legendDescription}>
                    Clinically serious. Interaction may be dangerous, should usually be avoided, or requires close supervision if unavoidable.
                  </Text>
                </View>
              </View>
            </View>

            {/* Disclaimer Section */}
            <View style={styles.disclaimerSection}>
              <MaterialIcons name="warning" size={20} color="#FF9800" />
              <Text style={styles.disclaimerTitle}>Disclaimer</Text>
              <Text style={styles.disclaimerText}>
                The severity ratings shown (Low / Moderate / High) represent <Text style={styles.disclaimerBold}>1:1 interactions between a main medicine and each optional medicine</Text>. They are not cumulative or combined effects. Clinical judgment is required to interpret results in the context of the full patient profile. This tool does not replace professional medical advice.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  medicineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
  },
  selectedCard: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
  },
  disabledCard: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  medicineCardText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedCardText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledCardText: {
    color: '#999',
  },
  selectedMedicines: {
    marginBottom: 16,
  },
  selectedMedicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedMedicineName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  checkingSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  checkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checkingTitle: {
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
  checkingItem: {
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
  medicineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap', // Allow wrapping on narrow screens
  },
  medicineNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16, // Spacing between name and badge
    minWidth: 200, // Minimum width before wrapping
  },
  statusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  drugName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // Prevent badge from shrinking
  },
  severityText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textBlock: {
    marginTop: 4,
    paddingLeft: 24, // Align with medicine name (icon + margin)
  },
  rationaleAndAction: {
    fontSize: 12,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  rationale: {
    color: '#666666',
    fontStyle: 'italic',
  },
  separator: {
    color: '#666666',
  },
  actionLabel: {
    fontWeight: 'bold',
    color: '#E91E63', // App accent color
  },
  actionText: {
    color: '#333333',
  },
  summary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  summaryText: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  instructions: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  // New category-based styles
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  categoryGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategoryCard: {
    backgroundColor: '#F8F9FA',
    borderColor: '#D81B60',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
  selectedCategoryTitle: {
    color: '#D81B60',
  },
  categoryMedicineCount: {
    fontSize: 12,
    color: '#666',
  },
  selectedCategories: {
    marginBottom: 16,
  },
  selectedCategoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  // New styles for updated UI
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  optionalCategoryCard: {
    // Additional styling for optional category cards if needed
  },
  selectedSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectedSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedTags: {
    flexDirection: 'row',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  checkingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  resultsContainer: {
    marginBottom: 16,
  },
  // Severity Legend Styles
  severityLegend: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 12,
    textAlign: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  legendCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 2,
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 4,
  },
  legendDescription: {
    fontSize: 12,
    color: '#6C757D',
    lineHeight: 16,
  },
  disclaimerSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginLeft: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
    textAlign: 'left',
  },
  disclaimerBold: {
    fontWeight: 'bold',
    color: '#E65100',
  },
});