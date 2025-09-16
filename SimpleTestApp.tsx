import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SimpleTestApp() {
  console.log('🧪 SimpleTestApp rendering...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MHT Assessment</Text>
      <Text style={styles.subtitle}>Preview Test Working!</Text>
      <Text style={styles.info}>✅ Metro Bundler OK</Text>
      <Text style={styles.info}>✅ React Native OK</Text>
      <Text style={styles.info}>✅ Expo OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#27ae60',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
    textAlign: 'center',
  },
});