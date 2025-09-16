import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

console.log('🌐 WebTestApp loaded - Platform:', Platform.OS);

export default function WebTestApp() {
  console.log('🎯 WebTestApp rendering...');
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏥 MHT Assessment</Text>
        <Text style={styles.subtitle}>Web-Compatible Test Version</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          ✅ React Native Web working correctly!
        </Text>
        <Text style={styles.info}>
          Platform: {Platform.OS}
        </Text>
        <Text style={styles.info}>
          This confirms Emergent preview compatibility
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ready for Emergent built-in preview
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D81B60',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
    maxWidth: 400,
  },
  description: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});