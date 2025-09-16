/**
 * Medicine Analysis Settings Screen
 * Configure API providers and interaction checking options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { medicinePersistence, type AppSettings } from '../utils/medicinePersistence';
import { drugAnalyzer } from '../utils/enhancedDrugAnalyzer';

type RootStackParamList = {
  Home: undefined;
  DecisionSupport: undefined;
};

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: SettingsNavigationProp;
}

export default function MedicineSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<AppSettings>({
    enableOnlineChecks: false,
    apiProvider: 'none',
    showDetailedInteractions: true,
    confirmDestructiveActions: true,
    cacheAnalysisResults: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await medicinePersistence.loadAppSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    setIsSaving(true);
    try {
      await medicinePersistence.saveAppSettings(newSettings);
      
      // Update drug analyzer configuration
      drugAnalyzer.updateConfig({
        enableOnlineAPI: newSettings.enableOnlineChecks,
        apiProvider: newSettings.apiProvider,
        cacheResults: newSettings.cacheAnalysisResults
      });
      
      setSettings(newSettings);
      
      // Show success feedback
      Alert.alert('Settings Saved', 'Your preferences have been updated.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSetting = (key: keyof AppSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleAPIProviderChange = (provider: AppSettings['apiProvider']) => {
    if (provider !== 'none' && !settings.enableOnlineChecks) {
      Alert.alert(
        'Enable Online Checks',
        'To use an API provider, online checks must be enabled. Would you like to enable them now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enable', 
            onPress: () => {
              const newSettings = { 
                ...settings, 
                enableOnlineChecks: true, 
                apiProvider: provider 
              };
              saveSettings(newSettings);
            }
          }
        ]
      );
      return;
    }
    
    handleToggleSetting('apiProvider', provider);
  };

  const showAPIProviderInfo = (provider: string) => {
    const providerInfo = {
      none: {
        title: 'Local Rules Only',
        description: 'Uses built-in clinical rules for drug interaction checking. No internet connection required.',
        features: ['✓ Always available', '✓ Fast response', '✓ Privacy focused', '✓ Core interactions covered']
      },
      openfda: {
        title: 'OpenFDA',
        description: 'FDA Adverse Event Reporting System (FAERS) data for drug interactions and adverse events.',
        features: ['✓ Official FDA data', '✓ Comprehensive adverse events', '✓ Regular updates', '✗ Requires internet']
      },
      rxnorm: {
        title: 'RxNorm',
        description: 'National Library of Medicine drug terminology and interaction database.',
        features: ['✓ Standardized drug names', '✓ Comprehensive database', '✓ Clinical focus', '✗ Requires internet']
      },
      drugbank: {
        title: 'DrugBank',
        description: 'Comprehensive drug database with detailed interaction information.',
        features: ['✓ Detailed mechanisms', '✓ Clinical significance', '✓ Professional grade', '✗ Requires API key']
      }
    };

    const info = providerInfo[provider as keyof typeof providerInfo];
    if (!info) return;

    Alert.alert(
      info.title,
      `${info.description}\n\n${info.features.join('\n')}`,
      [{ text: 'OK' }]
    );
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all medicine analysis settings to their default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            const defaultSettings: AppSettings = {
              enableOnlineChecks: false,
              apiProvider: 'none',
              showDetailedInteractions: true,
              confirmDestructiveActions: true,
              cacheAnalysisResults: true
            };
            saveSettings(defaultSettings);
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#D81B60" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Analysis Settings</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Alert.alert(
            'Settings Help',
            'Configure how the app checks for drug interactions and manages medicine data.\n\n' +
            '• Local Rules: Built-in interaction checking (always available)\n' +
            '• Online APIs: Enhanced checking with external databases\n' +
            '• Caching: Saves analysis results for faster repeat access'
          )}
        >
          <MaterialIcons name="help-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Online Checking Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Online Drug Interaction Checking</Text>
          <Text style={styles.sectionDescription}>
            Enable online APIs for enhanced drug interaction checking. Local rules are always available.
          </Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons 
                  name={settings.enableOnlineChecks ? "cloud-done" : "cloud-off"} 
                  size={24} 
                  color={settings.enableOnlineChecks ? "#4CAF50" : "#999"} 
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Enable Online Checks</Text>
                  <Text style={styles.settingDescription}>
                    {settings.enableOnlineChecks 
                      ? 'Online APIs will be used when available' 
                      : 'Using local rules only (recommended for privacy)'
                    }
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.enableOnlineChecks}
                onValueChange={(value) => handleToggleSetting('enableOnlineChecks', value)}
                trackColor={{ false: '#ccc', true: '#D81B60' }}
                thumbColor={settings.enableOnlineChecks ? '#fff' : '#f4f3f4'}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>

        {/* API Provider Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Provider Selection</Text>
          <Text style={styles.sectionDescription}>
            Choose which external database to use for enhanced interaction checking.
          </Text>

          {(['none', 'openfda', 'rxnorm', 'drugbank'] as const).map((provider) => (
            <TouchableOpacity
              key={provider}
              style={[
                styles.providerCard,
                settings.apiProvider === provider && styles.providerCardSelected
              ]}
              onPress={() => handleAPIProviderChange(provider)}
              disabled={isSaving}
            >
              <View style={styles.providerRow}>
                <View style={styles.providerInfo}>
                  <View style={styles.providerHeader}>
                    <MaterialIcons
                      name={settings.apiProvider === provider ? "radio-button-checked" : "radio-button-unchecked"}
                      size={20}
                      color={settings.apiProvider === provider ? "#D81B60" : "#999"}
                    />
                    <Text style={[
                      styles.providerTitle,
                      settings.apiProvider === provider && styles.providerTitleSelected
                    ]}>
                      {provider === 'none' ? 'Local Rules Only' :
                       provider === 'openfda' ? 'OpenFDA' :
                       provider === 'rxnorm' ? 'RxNorm' : 'DrugBank'}
                    </Text>
                    {provider === 'none' && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>RECOMMENDED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.providerDescription}>
                    {provider === 'none' ? 'Built-in clinical rules - no internet required' :
                     provider === 'openfda' ? 'FDA adverse event database' :
                     provider === 'rxnorm' ? 'NLM drug terminology database' : 
                     'Comprehensive drug interaction database'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => showAPIProviderInfo(provider)}
                >
                  <MaterialIcons name="info-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Display Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Options</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="visibility" size={24} color="#666" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Show Detailed Interactions</Text>
                  <Text style={styles.settingDescription}>
                    Display comprehensive clinical information and mechanisms
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.showDetailedInteractions}
                onValueChange={(value) => handleToggleSetting('showDetailedInteractions', value)}
                trackColor={{ false: '#ccc', true: '#D81B60' }}
                thumbColor={settings.showDetailedInteractions ? '#fff' : '#f4f3f4'}
                disabled={isSaving}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="warning" size={24} color="#666" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Confirm Destructive Actions</Text>
                  <Text style={styles.settingDescription}>
                    Show confirmation dialogs when removing medicines
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.confirmDestructiveActions}
                onValueChange={(value) => handleToggleSetting('confirmDestructiveActions', value)}
                trackColor={{ false: '#ccc', true: '#D81B60' }}
                thumbColor={settings.confirmDestructiveActions ? '#fff' : '#f4f3f4'}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>

        {/* Performance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance & Storage</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="cached" size={24} color="#666" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Cache Analysis Results</Text>
                  <Text style={styles.settingDescription}>
                    Save analysis results locally for faster repeated access
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.cacheAnalysisResults}
                onValueChange={(value) => handleToggleSetting('cacheAnalysisResults', value)}
                trackColor={{ false: '#ccc', true: '#D81B60' }}
                thumbColor={settings.cacheAnalysisResults ? '#fff' : '#f4f3f4'}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>

        {/* Advanced Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={resetToDefaults}
            disabled={isSaving}
          >
            <MaterialIcons name="restore" size={24} color="#FF6B35" />
            <Text style={styles.actionButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert(
              'Update Local Rules',
              'To update the local drug interaction rules:\n\n' +
              '1. Modify /assets/rules/drug_interactions.json\n' +
              '2. Ensure valid JSON format\n' +
              '3. Update version number\n' +
              '4. Restart the app\n\n' +
              'The rules file contains comprehensive documentation on the expected format.'
            )}
          >
            <MaterialIcons name="edit" size={24} color="#2196F3" />
            <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>
              Update Local Rules Instructions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Information */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>Current Configuration</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Online Checking:</Text>
              <Text style={[
                styles.statusValue,
                { color: settings.enableOnlineChecks ? '#4CAF50' : '#999' }
              ]}>
                {settings.enableOnlineChecks ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>API Provider:</Text>
              <Text style={styles.statusValue}>
                {settings.apiProvider === 'none' ? 'Local Rules Only' :
                 settings.apiProvider.toUpperCase()}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Result Caching:</Text>
              <Text style={[
                styles.statusValue,
                { color: settings.cacheAnalysisResults ? '#4CAF50' : '#999' }
              ]}>
                {settings.cacheAnalysisResults ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
  },
  
  helpButton: {
    padding: 8,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  section: {
    marginVertical: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  settingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  
  providerCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  providerCardSelected: {
    borderColor: '#D81B60',
    backgroundColor: '#FFF0F5',
  },
  
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  providerInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  providerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  
  providerTitleSelected: {
    color: '#D81B60',
  },
  
  recommendedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  
  providerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  
  infoButton: {
    padding: 4,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
    marginLeft: 12,
  },
  
  statusSection: {
    marginVertical: 16,
  },
  
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  
  bottomPadding: {
    height: 60,
  },
});