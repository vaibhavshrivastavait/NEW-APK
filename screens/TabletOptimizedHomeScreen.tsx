import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ResponsiveLayout from '../components/ResponsiveLayout';
import ResponsiveGrid from '../components/ResponsiveGrid';
import ResponsiveText from '../components/ResponsiveText';
import TabletOptimizedHeader from '../components/TabletOptimizedHeader';
import SafeDrugInteractionChecker from '../components/SafeDrugInteractionChecker';

import { 
  getDeviceInfo, 
  getResponsiveSpacing, 
  getTouchTargetSize,
  shouldUseMultiPane 
} from '../utils/deviceUtils';

type RootStackParamList = {
  Home: undefined;
  PatientIntake: undefined;
  PatientList: undefined;
  Demographics: undefined;
  Symptoms: undefined;
  Cme: undefined;
  Guidelines: undefined;
  RiskModelsExplained: undefined;
  PersonalizedRiskCalculators: undefined;
  About: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface ActionCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: keyof RootStackParamList | 'DrugChecker';
  isPrimary?: boolean;
  category: 'assessment' | 'tools' | 'reference' | 'settings';
  color: string;
}

const ACTION_CARDS: ActionCard[] = [
  {
    id: 'start-assessment',
    title: 'Start New Assessment',
    description: 'Begin comprehensive MHT risk evaluation',
    icon: 'assignment',
    route: 'PatientIntake',
    isPrimary: true,
    category: 'assessment',
    color: '#D81B60',
  },
  {
    id: 'patient-records',
    title: 'Patient Records',
    description: 'View and manage assessment history',
    icon: 'people',
    route: 'PatientList',
    category: 'assessment',
    color: '#1976D2',
  },
  {
    id: 'drug-checker',
    title: 'Drug Interaction Checker',
    description: 'Check MHT and medication interactions',
    icon: 'support',
    route: 'DrugChecker',
    category: 'tools',
    color: '#388E3C',
  },
  {
    id: 'guidelines',
    title: 'MHT Guidelines',
    description: 'Evidence-based clinical guidelines',
    icon: 'book',
    route: 'Guidelines',
    category: 'reference',
    color: '#F57C00',
  },
  {
    id: 'risk-calculators',
    title: 'Risk Calculators',
    description: 'Personalized risk assessment tools',
    icon: 'calculate',
    route: 'PersonalizedRiskCalculators',
    category: 'tools',
    color: '#7B1FA2',
  },
  {
    id: 'cme',
    title: 'CME Mode',
    description: 'Educational content and certification',
    icon: 'school',
    route: 'Cme',
    category: 'reference',
    color: '#0097A7',
  },
  {
    id: 'risk-models',
    title: 'Risk Models Explained',
    description: 'Understanding risk calculation methods',
    icon: 'info',
    route: 'RiskModelsExplained',
    category: 'reference',
    color: '#5D4037',
  },
  {
    id: 'about',
    title: 'About & Settings',
    description: 'App information and preferences',
    icon: 'settings',
    route: 'About',
    category: 'settings',
    color: '#616161',
  },
];

export default function TabletOptimizedHomeScreen({ navigation }: Props) {
  const [showDrugInteractionChecker, setShowDrugInteractionChecker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const deviceInfo = getDeviceInfo();
  const spacing = getResponsiveSpacing(16);
  const touchTarget = getTouchTargetSize();
  const isMultiPane = shouldUseMultiPane();

  if (showDrugInteractionChecker) {
    return (
      <SafeAreaView style={styles.container}>
        <TabletOptimizedHeader
          title="Drug Interaction Checker"
          onBack={() => setShowDrugInteractionChecker(false)}
          subtitle="MHT Medication Interactions"
        />
        <SafeDrugInteractionChecker />
      </SafeAreaView>
    );
  }

  const handleActionPress = (action: ActionCard) => {
    if (action.route === 'DrugChecker') {
      setShowDrugInteractionChecker(true);
    } else {
      navigation.navigate(action.route);
    }
  };

  const categories = [
    { key: 'all', label: 'All Features', icon: 'apps' },
    { key: 'assessment', label: 'Assessment', icon: 'assignment' },
    { key: 'tools', label: 'Clinical Tools', icon: 'build' },
    { key: 'reference', label: 'Reference', icon: 'book' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const filteredActions = selectedCategory === 'all' 
    ? ACTION_CARDS 
    : ACTION_CARDS.filter(action => action.category === selectedCategory);

  const renderActionCard = (action: ActionCard) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionCard,
        action.isPrimary && styles.primaryCard,
        { 
          backgroundColor: action.isPrimary ? action.color : 'white',
          minHeight: deviceInfo.isTablet ? 140 : 120,
        }
      ]}
      onPress={() => handleActionPress(action)}
      activeOpacity={0.8}
      testID={action.id}
    >
      <View style={[styles.cardIcon, { backgroundColor: action.isPrimary ? 'rgba(255,255,255,0.2)' : `${action.color}20` }]}>
        <MaterialIcons 
          name={action.icon as any} 
          size={deviceInfo.isTablet ? 32 : 28} 
          color={action.isPrimary ? 'white' : action.color} 
        />
      </View>
      <ResponsiveText
        variant={deviceInfo.isTablet ? 'h4' : 'body'}
        style={[styles.cardTitle, { color: action.isPrimary ? 'white' : '#333' }]}
        numberOfLines={2}
      >
        {action.title}
      </ResponsiveText>
      <ResponsiveText
        variant="caption"
        style={[styles.cardDescription, { color: action.isPrimary ? 'rgba(255,255,255,0.8)' : '#666' }]}
        numberOfLines={2}
      >
        {action.description}
      </ResponsiveText>
    </TouchableOpacity>
  );

  const renderCategoryTabs = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              selectedCategory === category.key && styles.activeCategoryTab,
              { minHeight: touchTarget }
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <MaterialIcons 
              name={category.icon as any} 
              size={deviceInfo.isTablet ? 22 : 18} 
              color={selectedCategory === category.key ? 'white' : '#666'} 
            />
            <ResponsiveText
              variant="caption"
              style={[
                styles.categoryText,
                { color: selectedCategory === category.key ? 'white' : '#666' }
              ]}
            >
              {category.label}
            </ResponsiveText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <ResponsiveText variant="h3" style={styles.statNumber}>170</ResponsiveText>
        <ResponsiveText variant="caption" style={styles.statLabel}>Drug Interactions</ResponsiveText>
      </View>
      <View style={styles.statItem}>
        <ResponsiveText variant="h3" style={styles.statNumber}>10+</ResponsiveText>
        <ResponsiveText variant="caption" style={styles.statLabel}>Guidelines</ResponsiveText>
      </View>
      <View style={styles.statItem}>
        <ResponsiveText variant="h3" style={styles.statNumber}>5</ResponsiveText>
        <ResponsiveText variant="caption" style={styles.statLabel}>Risk Models</ResponsiveText>
      </View>
    </View>
  );

  const leftPane = isMultiPane ? (
    <View style={styles.leftPaneContent}>
      <View style={styles.appInfo}>
        <View style={styles.appIcon}>
          <MaterialIcons name="medical-services" size={48} color="#D81B60" />
        </View>
        <ResponsiveText variant="h2" style={styles.appTitle}>MHT Assessment</ResponsiveText>
        <ResponsiveText variant="body" style={styles.appSubtitle}>
          Menopausal Hormone Therapy Assessment Tool
        </ResponsiveText>
      </View>
      {renderQuickStats()}
      <View style={styles.leftPaneActions}>
        <TouchableOpacity 
          style={[styles.primaryAction, { minHeight: touchTarget }]}
          onPress={() => handleActionPress(ACTION_CARDS[0])}
        >
          <MaterialIcons name="assignment" size={24} color="white" />
          <ResponsiveText variant="body" style={styles.primaryActionText}>
            Start Assessment
          </ResponsiveText>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      
      <ResponsiveLayout
        leftPane={leftPane}
        leftPaneWidth={350}
        enableMultiPane={true}
      >
        <ScrollView 
          style={styles.mainContent}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing }]}
          showsVerticalScrollIndicator={false}
        >
          {!isMultiPane && (
            <>
              {/* Header for single pane */}
              <View style={[styles.headerSection, { paddingHorizontal: spacing }]}>
                <View style={styles.headerIcon}>
                  <MaterialIcons name="medical-services" size={deviceInfo.isTablet ? 48 : 40} color="#D81B60" />
                </View>
                <ResponsiveText variant={deviceInfo.isTablet ? 'h1' : 'h2'} style={styles.title}>
                  MHT Assessment
                </ResponsiveText>
                <ResponsiveText variant="body" style={styles.subtitle}>
                  Menopausal Hormone Therapy Assessment Tool
                </ResponsiveText>
              </View>

              {/* Features info */}
              <View style={[styles.featuresContainer, { marginHorizontal: spacing }]}>
                <ResponsiveText variant="h3" style={styles.featuresTitle}>
                  Professional Clinical Assessment
                </ResponsiveText>
                <ResponsiveText variant="body" style={styles.featuresDescription}>
                  Comprehensive risk stratification and evidence-based MHT recommendations following IMS/NAMS guidelines
                </ResponsiveText>
              </View>
            </>
          )}

          {/* Category tabs */}
          {renderCategoryTabs()}

          {/* Action cards grid */}
          <View style={[styles.actionsSection, { paddingHorizontal: spacing }]}>
            <ResponsiveGrid
              spacing={spacing}
              minItemWidth={deviceInfo.isTablet ? 250 : 200}
            >
              {filteredActions.map(renderActionCard)}
            </ResponsiveGrid>
          </View>

          {/* Footer */}
          <View style={[styles.footer, { paddingHorizontal: spacing }]}>
            <ResponsiveText variant="caption" style={styles.footerText}>
              Evidence-based clinical decision support for menopausal care
            </ResponsiveText>
          </View>
        </ScrollView>
      </ResponsiveLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  leftPaneContent: {
    flex: 1,
    padding: 24,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appIcon: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appTitle: {
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
    marginBottom: 8,
  },
  appSubtitle: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#D81B60',
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  leftPaneActions: {
    marginTop: 'auto',
  },
  primaryAction: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryActionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 12,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerIcon: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontWeight: '600',
    color: '#D81B60',
    marginBottom: 12,
  },
  featuresDescription: {
    color: '#666',
    lineHeight: 24,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryScrollContainer: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeCategoryTab: {
    backgroundColor: '#D81B60',
    shadowOpacity: 0.2,
    elevation: 3,
  },
  categoryText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  primaryCard: {
    borderColor: 'transparent',
    shadowOpacity: 0.3,
    elevation: 8,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});