import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function HomePage() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MHT Assessment</Text>
          <Text style={styles.subtitle}>
            Comprehensive Menopause Hormone Therapy Assessment Tool
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          
          <TouchableOpacity style={[styles.featureCard, { borderLeftColor: '#E91E63' }]}>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Patient Assessment</Text>
              <Text style={styles.featureSubtitle}>Complete risk assessment with calculators</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.featureCard, { borderLeftColor: '#9C27B0' }]}>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Drug Interaction Checker</Text>
              <Text style={styles.featureSubtitle}>Check HRT interactions with 150+ medications</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.featureCard, { borderLeftColor: '#3F51B5' }]}>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>CME Quiz</Text>
              <Text style={styles.featureSubtitle}>Continuing medical education modules</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.featureCard, { borderLeftColor: '#00BCD4' }]}>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Treatment Plan Generator</Text>
              <Text style={styles.featureSubtitle}>Evidence-based treatment recommendations</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.featureCard, { borderLeftColor: '#4CAF50' }]}>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Export Reports</Text>
              <Text style={styles.featureSubtitle}>Generate PDF and Excel reports</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.featureCard, { borderLeftColor: '#FF9800' }]}>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Risk Models Explained</Text>
              <Text style={styles.featureSubtitle}>Knowledge hub for risk calculators</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Quick Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Medicine Categories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150</Text>
              <Text style={styles.statLabel}>Drug Interactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>CME Modules</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Evidence-based clinical decision support for menopause care
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D81B60',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    gap: 12,
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});