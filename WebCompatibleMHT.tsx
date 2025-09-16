import React from 'react';

export default function WebCompatibleMHT() {
  const buttonStyle = {
    backgroundColor: '#D81B60',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    margin: '8px 0',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center' as const,
  };

  const secondaryButtonStyle = {
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #E8E8E8',
    borderRadius: '12px',
    padding: '16px',
    margin: '8px 0',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center' as const,
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#FFF0F5',
      minHeight: '100vh',
      padding: '20px',
      maxWidth: '390px',
      margin: '0 auto',
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', paddingTop: '20px' }}>
        <div style={{
          backgroundColor: '#D81B60',
          color: 'white',
          borderRadius: '50px',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 15px',
          fontSize: '32px'
        }}>
          ⚕️
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#D81B60',
          margin: '0 0 8px 0',
        }}>
          MHT Assessment
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.4',
          margin: '0',
        }}>
          Comprehensive Menopause Hormone Therapy Assessment Tool
        </p>
      </div>

      {/* Main Action Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button style={buttonStyle} onClick={() => console.log('Start New Assessment')}>
          📝 Start New Assessment
        </button>
        <button style={buttonStyle} onClick={() => console.log('Patient Records')}>
          👥 Patient Records
        </button>
      </div>

      {/* Secondary Action Buttons */}
      <div style={{ marginBottom: '30px' }}>
        <button style={secondaryButtonStyle} onClick={() => console.log('MHT Guidelines')}>
          📚 MHT Guidelines
        </button>
        <button style={secondaryButtonStyle} onClick={() => console.log('CME Mode')}>
          🎓 CME Mode
        </button>
        <button style={secondaryButtonStyle} onClick={() => console.log('Risk Models Explained')}>
          ℹ️ Risk Models Explained
        </button>
        <button style={secondaryButtonStyle} onClick={() => console.log('Personalized Risk Calculators')}>
          🧮 Personalized Risk Calculators
        </button>
        <button style={secondaryButtonStyle} onClick={() => console.log('Drug Interaction Checker')}>
          💊 Drug Interaction Checker
        </button>
        <button style={secondaryButtonStyle} onClick={() => console.log('About')}>
          ℹ️ About
        </button>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '20px' }}>
        <p style={{
          fontSize: '14px',
          color: '#999',
          fontStyle: 'italic',
          margin: '0',
        }}>
          Evidence-based drug interaction checking for menopausal care
        </p>
      </div>
    </div>
  );
}