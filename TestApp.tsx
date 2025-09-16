import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 MHT Assessment Test</Text>
      <Text style={styles.subtitle}>Emergent Preview Working!</Text>
      <Text style={styles.info}>Metro Bundler Successfully Compiled</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});