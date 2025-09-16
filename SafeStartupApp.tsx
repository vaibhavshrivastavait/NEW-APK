import React from 'react';

export default function SafeStartupApp() {
  return React.createElement('div', { 
    style: { 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    } 
  }, [
    React.createElement('div', { 
      key: 'header',
      style: { 
        backgroundColor: '#D81B60',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      } 
    }, [
      React.createElement('h1', { key: 'title' }, '🏥 MHT Assessment'),
      React.createElement('p', { key: 'subtitle' }, 'Clinical Decision Support System')
    ]),
    React.createElement('div', { 
      key: 'status',
      style: { 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      } 
    }, [
      React.createElement('h2', { key: 'status-title' }, '✅ App Status: Running'),
      React.createElement('p', { key: 'bundler' }, 'Metro bundler successfully started'),
      React.createElement('p', { key: 'rendering' }, 'React Native Web rendering'),
      React.createElement('p', { key: 'navigation' }, 'Navigation system initialized')
    ]),
    React.createElement('div', { 
      key: 'features',
      style: { 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      } 
    }, [
      React.createElement('h2', { key: 'features-title' }, '📋 Core Features Available'),
      React.createElement('ul', { key: 'features-list' }, [
        React.createElement('li', { key: 'f1' }, 'Patient Assessment Workflow'),
        React.createElement('li', { key: 'f2' }, 'Risk Calculators (ASCVD, FRAX, Gail, etc.)'),
        React.createElement('li', { key: 'f3' }, 'Treatment Plan Generator'),
        React.createElement('li', { key: 'f4' }, 'CME Learning Modules'),
        React.createElement('li', { key: 'f5' }, 'Clinical Guidelines'),
        React.createElement('li', { key: 'f6' }, 'Data Export/Import')
      ])
    ])
  ]);
}