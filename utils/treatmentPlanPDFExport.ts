import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TreatmentPlan } from './treatmentPlanRuleEngine';

const DISCLAIMER_TEXT = `**Disclaimer:** This treatment plan is an educational aid generated from the provided information. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Recommendations are advisory only — always consult a qualified healthcare provider before acting on these suggestions. The app does not prescribe medications or dosages. If you are experiencing an emergency, seek immediate medical attention.`;

/**
 * Export treatment plan to PDF
 */
export async function exportTreatmentPlanToPDF(treatmentPlan: TreatmentPlan): Promise<void> {
  try {
    console.log('📄 Starting PDF export for treatment plan:', treatmentPlan.planId);

    // Create HTML content for PDF
    const htmlContent = generateHTMLContent(treatmentPlan);
    
    // Define file path
    const fileName = `treatment_plan_${treatmentPlan.planId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Write HTML file
    await FileSystem.writeAsStringAsync(fileUri, htmlContent);
    console.log('✅ HTML file created:', fileUri);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: 'Export Treatment Plan'
      });
    } else {
      Alert.alert('Success', `Treatment plan saved to: ${fileName}`);
    }

  } catch (error) {
    console.error('❌ PDF export error:', error);
    throw error;
  }
}

/**
 * Generate HTML content for the treatment plan
 */
function generateHTMLContent(plan: TreatmentPlan): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      high: '#FF4444',
      medium: '#FF8800',
      low: '#4CAF50'
    };
    return `<span style="background-color: ${colors[urgency as keyof typeof colors]}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-weight: bold;">${urgency.toUpperCase()}</span>`;
  };

  const getConfidenceBadge = (confidence: number) => {
    const color = confidence >= 80 ? '#4CAF50' : confidence >= 60 ? '#FF8800' : '#FF4444';
    return `<span style="background-color: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-weight: bold;">${confidence}%</span>`;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MHT Assessment - Treatment Plan</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #007AFF;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin-top: 8px;
        }
        .disclaimer {
            background-color: #FFF3CD;
            border-left: 4px solid #FF8800;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .disclaimer h3 {
            color: #856404;
            margin-top: 0;
        }
        .disclaimer p {
            color: #856404;
            margin-bottom: 0;
            font-size: 14px;
        }
        .section {
            background-color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #2C3E50;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .urgent-section {
            background-color: #FFEBEE;
            border-left: 4px solid #FF4444;
        }
        .urgent-section h2 {
            color: #FF4444;
            border-bottom-color: #FF4444;
        }
        .recommendation {
            background-color: #F8F9FA;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
            border-left: 3px solid #007AFF;
        }
        .recommendation-header {
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .recommendation-number {
            background-color: #007AFF;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }
        .recommendation-content {
            flex: 1;
        }
        .recommendation-text {
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .recommendation-meta {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 10px;
        }
        .rationale {
            background-color: #E8F5E8;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            border-left: 3px solid #4CAF50;
        }
        .rationale h4 {
            color: #2E7D32;
            margin: 0 0 8px 0;
            font-size: 14px;
        }
        .rationale p {
            color: #2E7D32;
            margin: 0;
            font-size: 14px;
        }
        .references {
            margin-top: 8px;
        }
        .references h5 {
            color: #2E7D32;
            margin: 8px 0 4px 0;
            font-size: 12px;
        }
        .references ul {
            margin: 0;
            padding-left: 16px;
        }
        .references li {
            color: #2E7D32;
            font-size: 12px;
        }
        .alternatives {
            background-color: #FFF3E0;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            border-left: 3px solid #FF8800;
        }
        .alternatives h4 {
            color: #E65100;
            margin: 0 0 8px 0;
            font-size: 14px;
        }
        .alternatives ul {
            margin: 0;
            padding-left: 16px;
            color: #E65100;
        }
        .patient-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }
        .info-item {
            background-color: #F8F9FA;
            padding: 10px;
            border-radius: 4px;
        }
        .info-label {
            font-weight: bold;
            color: #2C3E50;
            font-size: 14px;
        }
        .info-value {
            color: #7F8C8D;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background-color: #2C3E50;
            color: white;
            border-radius: 8px;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
        }
        @media print {
            body {
                background-color: white;
            }
            .section {
                box-shadow: none;
                border: 1px solid #ddd;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MHT Assessment - Treatment Plan</h1>
        <div class="subtitle">Plan ID: ${plan.planId}</div>
        <div class="subtitle">Generated: ${formatDate(plan.generatedAt)}</div>
    </div>

    <div class="disclaimer">
        <h3>⚠️ Important Notice</h3>
        <p>${DISCLAIMER_TEXT}</p>
    </div>

    <div class="section">
        <h2>Patient Information</h2>
        <div class="patient-info">
            <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${plan.patientData.age} years</div>
            </div>
            <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${plan.patientData.gender}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Medicine Type</div>
                <div class="info-value">${plan.patientData.medicineType || 'Not specified'}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Risk Scores</h2>
        <div class="patient-info">
            ${Object.entries(plan.patientData.riskScores || {}).map(([key, value]) => `
                <div class="info-item">
                    <div class="info-label">${key}</div>
                    <div class="info-value">${value ? `${value}%` : 'Not calculated'}</div>
                </div>
            `).join('')}
        </div>
    </div>

    ${plan.urgentFlags.length > 0 ? `
    <div class="section urgent-section">
        <h2>🚨 Urgent Attention Required</h2>
        <ul>
            ${plan.urgentFlags.map(flag => `<li><strong>${flag}</strong></li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="section">
        <h2>Primary Recommendations</h2>
        ${plan.primaryRecommendations.map((rec, index) => `
            <div class="recommendation">
                <div class="recommendation-header">
                    <div class="recommendation-number">${index + 1}</div>
                    <div class="recommendation-content">
                        <div class="recommendation-text">${rec.recommendation}</div>
                        <div class="recommendation-meta">
                            ${getUrgencyBadge(rec.urgency)}
                            ${getConfidenceBadge(rec.confidence)}
                            <span style="font-style: italic; color: #7F8C8D; font-size: 12px;">${rec.category}</span>
                        </div>
                        <div class="rationale">
                            <h4>Rationale:</h4>
                            <p>${rec.rationale}</p>
                            ${rec.references && rec.references.length > 0 ? `
                                <div class="references">
                                    <h5>References:</h5>
                                    <ul>
                                        ${rec.references.map(ref => `<li>${ref}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                        ${rec.alternatives && rec.alternatives.length > 0 ? `
                            <div class="alternatives">
                                <h4>Alternative Options:</h4>
                                <ul>
                                    ${rec.alternatives.map(alt => `<li>${alt}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${rec.confidence < 50 ? `
                            <div style="background-color: #FFF3CD; padding: 8px; border-radius: 4px; margin-top: 8px;">
                                <small style="color: #856404; font-style: italic;">🧪 Hypothesis — confirm with clinician</small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    ${plan.alternativeTherapies.length > 0 ? `
    <div class="section">
        <h2>Alternative Therapies & Lifestyle</h2>
        <ul>
            ${plan.alternativeTherapies.map(therapy => `<li>${therapy}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="section">
        <h2>Clinical Summary</h2>
        <p>${plan.clinicalSummary}</p>
    </div>

    <div class="section">
        <h2>Action Items</h2>
        <ul>
            ${plan.actionItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Assessment Details</h2>
        <div class="patient-info">
            <div class="info-item">
                <div class="info-label">Overall Confidence</div>
                <div class="info-value">${plan.auditTrail.overallConfidence}%</div>
            </div>
            <div class="info-item">
                <div class="info-label">Rules Applied</div>
                <div class="info-value">${plan.auditTrail.firedRules.length}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Data Completeness</div>
                <div class="info-value">${plan.patientData.dataCompleteness || 'N/A'}%</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>MHT Assessment - Treatment Plan</strong></p>
        <p>Generated on ${formatDate(plan.generatedAt)}</p>
        <p>This is an educational aid. Always consult your healthcare provider.</p>
    </div>
</body>
</html>
  `;
}

/**
 * Create sample treatment plan for testing
 */
export function createSampleTreatmentPlan(): TreatmentPlan {
  return {
    planId: 'sample-123',
    generatedAt: new Date().toISOString(),
    patientData: {
      age: 55,
      gender: 'female',
      medicineType: 'HRT',
      riskScores: {
        ASCVD: 12.5,
        Framingham: 8.2,
        FRAX: 15.0,
        GailTyrer: 2.8,
        Wells: 2.0
      },
      history: {
        VTE: false,
        breastCancer_active: false,
        cardiovascular: false
      },
      symptoms: {
        severity: 'moderate'
      },
      dataCompleteness: 85
    },
    primaryRecommendations: [
      {
        id: 'rec-1',
        recommendation: 'Consider cardiology consultation before HRT initiation due to moderate cardiovascular risk.',
        rationale: 'ASCVD score of 12.5% indicates moderate cardiovascular risk requiring specialist evaluation.',
        confidence: 80,
        urgency: 'medium' as 'medium',
        category: 'caution',
        alternatives: ['Non-hormonal therapies', 'lifestyle modifications'],
        references: ['AHA/ACC Cardiovascular Risk Guidelines'],
        ruleId: 'high_ascvd_hrt_caution'
      }
    ],
    alternativeTherapies: [
      'Lifestyle modifications (diet, exercise, stress management)',
      'Regular follow-up with healthcare provider'
    ],
    clinicalSummary: 'Patient assessment for 55-year-old female. Generated 1 recommendations with average confidence of 80%. All recommendations are advisory and require clinician review.',
    actionItems: [
      '🟡 Schedule clinician review within 2 weeks',
      '📋 Discuss all recommendations with healthcare provider',
      '📊 Complete any missing assessments or laboratory tests'
    ],
    urgentFlags: [],
    auditTrail: {
      inputSnapshot: {
        age: 55,
        gender: 'female',
        medicineType: 'HRT',
        riskScores: { ASCVD: 12.5, Framingham: 8.2 },
        history: { VTE: false, breastCancer_active: false },
        symptoms: { severity: 'moderate' },
        dataCompleteness: 85
      },
      firedRules: ['high_ascvd_hrt_caution'],
      overallConfidence: 80
    }
  };
}