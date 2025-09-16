import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  About: undefined;
  Disclaimer: undefined;
};

type AboutNavigationProp = NativeStackNavigationProp<RootStackParamList, 'About'>;

interface Props {
  navigation: AboutNavigationProp;
}

export default function AboutScreen({ navigation }: Props) {
  const handleDisclaimerPress = () => {
    navigation.navigate('Disclaimer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFC1CC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="medical-services" size={24} color="#D81B60" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>MHT Assessment</Text>
                  <Text style={styles.settingDescription}>
                    Professional menopause hormone therapy assessment tool for qualified healthcare professionals
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="info" size={24} color="#D81B60" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>App Version</Text>
                  <Text style={styles.settingDescription}>
                    Version 1
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="palette" size={24} color="#D81B60" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>App Theme</Text>
                  <Text style={styles.settingDescription}>
                    Professional pink theme optimized for medical use
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="security" size={24} color="#D81B60" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Data Privacy</Text>
                  <Text style={styles.settingDescription}>
                    All patient data is stored locally on your device for maximum privacy and security
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Compliance</Text>
          
          <TouchableOpacity style={styles.disclaimerButton} onPress={handleDisclaimerPress}>
            <View style={styles.disclaimerContent}>
              <MaterialIcons name="gavel" size={24} color="#FFFFFF" />
              <View style={styles.disclaimerText}>
                <Text style={styles.disclaimerTitle}>Disclaimer</Text>
                <Text style={styles.disclaimerDescription}>
                  Important medical and legal disclaimers for professional use
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For qualified healthcare professionals only
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFC1CC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.3)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D81B60',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 16,
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
    lineHeight: 20,
  },
  disclaimerButton: {
    backgroundColor: '#D81B60',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  disclaimerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerText: {
    marginLeft: 16,
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  disclaimerDescription: {
    fontSize: 14,
    color: '#FFE1EA',
    lineHeight: 20,
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});