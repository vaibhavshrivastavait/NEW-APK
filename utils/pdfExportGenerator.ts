import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { format } from 'date-fns';

// Define interfaces for PDF export data
export interface PatientData {
  name?: string;
  age?: number;
  id?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  gender?: string;
  dateOfBirth?: string;
  contactInfo?: string;
  clinicianName?: string;
  assessmentId?: string;
  assessmentDate?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    labValues?: Record<string, any>;
  };
  questionnaire?: Record<string, any>;
  riskScores?: {
    ascvd?: { risk: number; category: string; interpretation: string };
    framingham?: { risk: number; category: string; interpretation: string };
    gail?: { risk: number; category: string; interpretation: string };
    tyrerCuzick?: { risk: number; category: string; interpretation: string };
    wells?: { score: number; category: string; interpretation: string };
    frax?: { majorFractureRisk: number; category: string; interpretation: string };
    egfr?: { value: number; stage: string; interpretation: string };
    hrtRisk?: { overallRisk: string; details: string };
  };
  riskAssessment?: {
    overallRiskLevel: string;
    breastCancerRisk: string;
    cvdRisk: string;
    vteRisk: string;
    interpretation: string;
  };
  treatmentPlan?: {
    type: string;
    route: string;
    progestogenType?: string;
    rationale: string[];
    alternatives?: string[];
    monitoringPlan?: string[];
  };
  decisionSupport?: {
    drugInteractions?: string[];
    contraindications?: string[];
    recommendations?: string[];
  };
}

export interface ExportOptions {
  includePatientCounseling?: boolean;
  colorMode?: 'color' | 'monochrome';
  logoPath?: string;
}

class PDFExportGenerator {
  private generateHeader(): string {
    const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');
    return `
      <div class="header">
        <div class="logo-section">
          <div class="logo-placeholder">🏥</div>
          <div class="app-info">
            <h1>MHT Assessment</h1>
            <p>Clinical Decision Support System</p>
          </div>
        </div>
        <div class="export-info">
          <p><strong>Exported:</strong> ${currentDate}</p>
          <p><strong>Version:</strong> 1.0.0</p>
        </div>
      </div>
    `;
  }

  private generatePatientDemographics(data: PatientData): string {
    return `
      <div class="section">
        <h2>📋 Patient Demographics</h2>
        <div class="demographics-grid">
          <div class="demo-item">
            <strong>Full Name:</strong> ${data.name || '—'}
          </div>
          <div class="demo-item">
            <strong>Date of Birth:</strong> ${data.dateOfBirth || (data.age ? `${new Date().getFullYear() - data.age}` : '—')}
          </div>
          <div class="demo-item">
            <strong>Age:</strong> ${data.age || '—'} years
          </div>
          <div class="demo-item">
            <strong>Sex:</strong> ${data.gender || 'Female'}
          </div>
          <div class="demo-item">
            <strong>Patient ID:</strong> ${data.id || '—'}
          </div>
          <div class="demo-item">
            <strong>Contact:</strong> ${data.contactInfo || '—'}
          </div>
        </div>
      </div>
    `;
  }

  private generateVisitMetadata(data: PatientData): string {
    return `
      <div class="section">
        <h2>📅 Visit/Assessment Metadata</h2>
        <div class="metadata-grid">
          <div class="meta-item">
            <strong>Assessment ID:</strong> ${data.assessmentId || data.id || '—'}
          </div>
          <div class="meta-item">
            <strong>Clinician/Operator:</strong> ${data.clinicianName || '—'}
          </div>
          <div class="meta-item">
            <strong>Assessment Date/Time:</strong> ${data.assessmentDate || format(new Date(), 'dd/MM/yyyy HH:mm')}
          </div>
        </div>
      </div>
    `;
  }

  private generateVitalInputs(data: PatientData): string {
    const bmiCategory = this.getBMICategory(data.bmi);
    return `
      <div class="section">
        <h2>📊 Vital Inputs & Anthropometry</h2>
        <div class="vitals-grid">
          <div class="vital-item">
            <strong>Height:</strong> ${data.height || '—'} cm
          </div>
          <div class="vital-item">
            <strong>Weight:</strong> ${data.weight || '—'} kg
          </div>
          <div class="vital-item">
            <strong>BMI:</strong> ${data.bmi ? `${data.bmi.toFixed(1)} kg/m²` : '—'}
          </div>
          <div class="vital-item">
            <strong>BMI Category:</strong> <span class="bmi-${bmiCategory.class}">${bmiCategory.category}</span>
          </div>
          <div class="vital-item">
            <strong>Blood Pressure:</strong> ${data.vitals?.bloodPressure || '—'}
          </div>
          <div class="vital-item">
            <strong>Heart Rate:</strong> ${data.vitals?.heartRate || '—'} bpm
          </div>
        </div>
        ${data.vitals?.labValues ? this.generateLabValues(data.vitals.labValues) : ''}
      </div>
    `;
  }

  private generateLabValues(labValues: Record<string, any>): string {
    const labItems = Object.entries(labValues)
      .map(([key, value]) => `<div class="lab-item"><strong>${key}:</strong> ${value}</div>`)
      .join('');
    
    return `
      <div class="lab-section">
        <h3>Laboratory Values</h3>
        <div class="lab-grid">${labItems}</div>
      </div>
    `;
  }

  private generateQuestionnaireInputs(data: PatientData): string {
    if (!data.questionnaire || Object.keys(data.questionnaire).length === 0) {
      return `
        <div class="section">
          <h2>📝 Questionnaire Inputs</h2>
          <p class="no-data">No questionnaire data available</p>
        </div>
      `;
    }

    const questionItems = Object.entries(data.questionnaire)
      .map(([question, answer]) => `
        <div class="question-item">
          <div class="question">${this.formatQuestionLabel(question)}</div>
          <div class="answer">${this.formatQuestionAnswer(answer)}</div>
        </div>
      `)
      .join('');

    return `
      <div class="section">
        <h2>📝 Questionnaire Inputs</h2>
        <div class="questionnaire-list">${questionItems}</div>
      </div>
    `;
  }

  private generateCalculatedScores(data: PatientData): string {
    if (!data.riskScores) {
      return '';
    }

    const scores = data.riskScores;
    return `
      <div class="section">
        <h2>🧮 Calculated Risk Scores</h2>
        
        ${scores.ascvd || scores.framingham ? `
          <div class="score-category">
            <h3>Cardiovascular Risk</h3>
            ${scores.ascvd ? `
              <div class="score-item">
                <div class="score-name">ASCVD Risk Score</div>
                <div class="score-value">${scores.ascvd.risk.toFixed(1)}%</div>
                <div class="score-interpretation ${scores.ascvd.category.toLowerCase()}">${scores.ascvd.category}</div>
                <div class="score-details">${scores.ascvd.interpretation}</div>
              </div>
            ` : ''}
            ${scores.framingham ? `
              <div class="score-item">
                <div class="score-name">Framingham Risk Score</div>
                <div class="score-value">${scores.framingham.risk.toFixed(1)}%</div>
                <div class="score-interpretation ${scores.framingham.category.toLowerCase()}">${scores.framingham.category}</div>
                <div class="score-details">${scores.framingham.interpretation}</div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${scores.gail || scores.tyrerCuzick ? `
          <div class="score-category">
            <h3>Breast Cancer Risk</h3>
            ${scores.gail ? `
              <div class="score-item">
                <div class="score-name">Gail Model</div>
                <div class="score-value">${scores.gail.risk.toFixed(1)}%</div>
                <div class="score-interpretation ${scores.gail.category.toLowerCase()}">${scores.gail.category}</div>
                <div class="score-details">${scores.gail.interpretation}</div>
              </div>
            ` : ''}
            ${scores.tyrerCuzick ? `
              <div class="score-item">
                <div class="score-name">Tyrer-Cuzick Model</div>
                <div class="score-value">${scores.tyrerCuzick.risk.toFixed(1)}%</div>
                <div class="score-interpretation ${scores.tyrerCuzick.category.toLowerCase()}">${scores.tyrerCuzick.category}</div>
                <div class="score-details">${scores.tyrerCuzick.interpretation}</div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${scores.wells ? `
          <div class="score-category">
            <h3>VTE Risk</h3>
            <div class="score-item">
              <div class="score-name">Wells Score</div>
              <div class="score-value">${scores.wells.score.toFixed(1)}</div>
              <div class="score-interpretation ${scores.wells.category.toLowerCase()}">${scores.wells.category}</div>
              <div class="score-details">${scores.wells.interpretation}</div>
            </div>
          </div>
        ` : ''}

        ${scores.frax ? `
          <div class="score-category">
            <h3>Osteoporosis Risk</h3>
            <div class="score-item">
              <div class="score-name">FRAX 10-year Fracture Risk</div>
              <div class="score-value">${scores.frax.majorFractureRisk.toFixed(1)}%</div>
              <div class="score-interpretation ${scores.frax.category.toLowerCase()}">${scores.frax.category}</div>
              <div class="score-details">${scores.frax.interpretation}</div>
            </div>
          </div>
        ` : ''}

        ${scores.egfr ? `
          <div class="score-category">
            <h3>Kidney Function</h3>
            <div class="score-item">
              <div class="score-name">eGFR</div>
              <div class="score-value">${scores.egfr.value} mL/min/1.73m²</div>
              <div class="score-interpretation">${scores.egfr.stage}</div>
              <div class="score-details">${scores.egfr.interpretation}</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateRiskAssessmentSummary(data: PatientData): string {
    if (!data.riskAssessment) {
      return '';
    }

    return `
      <div class="section">
        <h2>⚡ Risk Assessment Summary</h2>
        <div class="risk-summary">
          <div class="overall-risk">
            <div class="risk-level ${data.riskAssessment.overallRiskLevel}">
              <strong>Overall Risk Level:</strong> ${data.riskAssessment.overallRiskLevel.toUpperCase()}
            </div>
          </div>
          
          <div class="risk-breakdown">
            <div class="risk-item">
              <span class="risk-label">Breast Cancer Risk:</span>
              <span class="risk-value ${data.riskAssessment.breastCancerRisk}">${data.riskAssessment.breastCancerRisk.toUpperCase()}</span>
            </div>
            <div class="risk-item">
              <span class="risk-label">CVD Risk:</span>
              <span class="risk-value ${data.riskAssessment.cvdRisk}">${data.riskAssessment.cvdRisk.toUpperCase()}</span>
            </div>
            <div class="risk-item">
              <span class="risk-label">VTE Risk:</span>
              <span class="risk-value ${data.riskAssessment.vteRisk}">${data.riskAssessment.vteRisk.toUpperCase()}</span>
            </div>
          </div>

          <div class="risk-legend">
            <h4>Risk Categories:</h4>
            <div class="legend-items">
              <span class="legend-item low">■ Low Risk</span>
              <span class="legend-item moderate">■ Moderate Risk</span>
              <span class="legend-item high">■ High Risk</span>
            </div>
          </div>

          <div class="risk-interpretation">
            <p>${data.riskAssessment.interpretation}</p>
          </div>
        </div>
      </div>
    `;
  }

  private generateTreatmentPlan(data: PatientData, options: ExportOptions = {}): string {
    if (!data.treatmentPlan) {
      return '';
    }

    // Remove patient counseling points as requested
    const treatmentContent = `
      <div class="section">
        <h2>💊 Treatment Plan</h2>
        <div class="treatment-plan">
          <div class="primary-recommendation">
            <h3>Primary Recommendation</h3>
            <div class="treatment-details">
              <div class="treatment-item">
                <strong>Therapy Type:</strong> ${this.formatTherapyType(data.treatmentPlan.type)}
              </div>
              <div class="treatment-item">
                <strong>Route:</strong> ${this.formatRoute(data.treatmentPlan.route)}
              </div>
              ${data.treatmentPlan.progestogenType ? `
                <div class="treatment-item">
                  <strong>Progestogen:</strong> ${this.formatProgestogen(data.treatmentPlan.progestogenType)}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="rationale-section">
            <h4>Clinical Rationale:</h4>
            <ul class="rationale-list">
              ${data.treatmentPlan.rationale.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
          </div>

          ${data.treatmentPlan.alternatives && data.treatmentPlan.alternatives.length > 0 ? `
            <div class="alternatives-section">
              <h4>Alternative Options:</h4>
              <ul class="alternatives-list">
                ${data.treatmentPlan.alternatives.map(alt => `<li>${alt}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${data.treatmentPlan.monitoringPlan && data.treatmentPlan.monitoringPlan.length > 0 ? `
            <div class="monitoring-section">
              <h4>Monitoring Plan:</h4>
              <ul class="monitoring-list">
                ${data.treatmentPlan.monitoringPlan.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    return treatmentContent;
  }

  private generateDecisionSupport(data: PatientData): string {
    if (!data.decisionSupport) {
      return '';
    }

    return `
      <div class="section">
        <h2>🎯 Decision Support</h2>
        
        ${data.decisionSupport.contraindications && data.decisionSupport.contraindications.length > 0 ? `
          <div class="contraindications">
            <h3>⚠️ Contraindications</h3>
            <ul class="contraindication-list">
              ${data.decisionSupport.contraindications.map(item => `<li class="contraindication">${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${data.decisionSupport.drugInteractions && data.decisionSupport.drugInteractions.length > 0 ? `
          <div class="drug-interactions">
            <h3>💊 Drug Interactions</h3>
            <ul class="interaction-list">
              ${data.decisionSupport.drugInteractions.map(item => `<li class="interaction">${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${data.decisionSupport.recommendations && data.decisionSupport.recommendations.length > 0 ? `
          <div class="recommendations">
            <h3>📋 Recommended Next Steps</h3>
            <ul class="recommendation-list">
              ${data.decisionSupport.recommendations.map(item => `<li class="recommendation">${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateFooter(): string {
    return `
      <div class="footer">
        <div class="footer-content">
          <div class="generated-by">
            <p><strong>Generated by:</strong> MHT Assessment - Clinical Decision Support System</p>
          </div>
          <div class="confidentiality">
            <p><strong>CONFIDENTIAL:</strong> This report was generated by MHT Assessment for clinical decision-support. Not a substitute for clinical judgment. Confidential.</p>
          </div>
          <div class="page-info">
            <p>Page <span class="page-number"></span></p>
          </div>
        </div>
      </div>
    `;
  }

  private generateCSS(): string {
    return `
      <style>
        @page {
          margin: 20mm;
          size: A4;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #333;
          margin: 0;
          padding: 0;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #D81B60;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .logo-section {
          display: flex;
          align-items: center;
        }

        .logo-placeholder {
          font-size: 32px;
          margin-right: 15px;
        }

        .app-info h1 {
          margin: 0;
          font-size: 24px;
          color: #D81B60;
          font-weight: bold;
        }

        .app-info p {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #666;
        }

        .export-info {
          text-align: right;
          font-size: 10px;
          color: #666;
        }

        .section {
          margin-bottom: 25px;
          break-inside: avoid;
        }

        .section h2 {
          color: #D81B60;
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 15px 0;
          padding: 8px 0;
          border-bottom: 1px solid #E0E0E0;
        }

        .section h3 {
          color: #333;
          font-size: 14px;
          font-weight: 600;
          margin: 15px 0 10px 0;
        }

        .section h4 {
          color: #555;
          font-size: 12px;
          font-weight: 600;
          margin: 12px 0 8px 0;
        }

        .demographics-grid, .metadata-grid, .vitals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }

        .demo-item, .meta-item, .vital-item {
          padding: 8px;
          background-color: #F5F5F5;
          border-radius: 4px;
        }

        .lab-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }

        .lab-item {
          padding: 6px;
          background-color: #E3F2FD;
          border-radius: 4px;
          font-size: 10px;
        }

        .questionnaire-list {
          margin-bottom: 15px;
        }

        .question-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          margin-bottom: 5px;
          background-color: #F8F9FA;
          border-radius: 4px;
        }

        .question {
          font-weight: 500;
          flex: 1;
          margin-right: 15px;
        }

        .answer {
          font-weight: 600;
          color: #D81B60;
        }

        .score-category {
          margin-bottom: 20px;
        }

        .score-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 10px;
          padding: 10px;
          margin-bottom: 8px;
          background-color: #F8F9FA;
          border-radius: 6px;
          align-items: center;
        }

        .score-name {
          font-weight: 600;
        }

        .score-value {
          font-weight: bold;
          font-size: 14px;
          text-align: center;
        }

        .score-interpretation {
          font-weight: 600;
          text-align: center;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
        }

        .score-interpretation.low { background-color: #E8F5E8; color: #2E7D32; }
        .score-interpretation.moderate { background-color: #FFF3E0; color: #F57C00; }
        .score-interpretation.high { background-color: #FFEBEE; color: #C62828; }

        .score-details {
          grid-column: 1 / -1;
          font-size: 10px;
          color: #666;
          font-style: italic;
          margin-top: 5px;
        }

        .risk-summary {
          background-color: #FFF0F5;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #F8BBD9;
        }

        .overall-risk {
          text-align: center;
          margin-bottom: 15px;
        }

        .risk-level {
          display: inline-block;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
        }

        .risk-level.low { background-color: #E8F5E8; color: #2E7D32; }
        .risk-level.moderate { background-color: #FFF3E0; color: #F57C00; }
        .risk-level.high { background-color: #FFEBEE; color: #C62828; }

        .risk-breakdown {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }

        .risk-item {
          text-align: center;
          padding: 8px;
          background-color: white;
          border-radius: 6px;
        }

        .risk-label {
          display: block;
          font-size: 10px;
          color: #666;
          margin-bottom: 4px;
        }

        .risk-value {
          display: block;
          font-weight: bold;
          font-size: 12px;
        }

        .risk-value.low { color: #2E7D32; }
        .risk-value.moderate { color: #F57C00; }
        .risk-value.high { color: #C62828; }

        .risk-legend {
          margin-bottom: 15px;
        }

        .legend-items {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .legend-item {
          font-size: 10px;
          font-weight: 600;
        }

        .legend-item.low { color: #2E7D32; }
        .legend-item.moderate { color: #F57C00; }
        .legend-item.high { color: #C62828; }

        .risk-interpretation {
          background-color: white;
          padding: 10px;
          border-radius: 6px;
          font-style: italic;
        }

        .treatment-plan {
          background-color: #F0F8FF;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #BBDEFB;
        }

        .primary-recommendation {
          margin-bottom: 15px;
        }

        .treatment-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }

        .treatment-item {
          padding: 8px;
          background-color: white;
          border-radius: 4px;
        }

        .rationale-section, .alternatives-section, .monitoring-section {
          margin-bottom: 15px;
        }

        .rationale-list, .alternatives-list, .monitoring-list,
        .contraindication-list, .interaction-list, .recommendation-list {
          margin: 5px 0 0 15px;
          padding: 0;
        }

        .rationale-list li, .alternatives-list li, .monitoring-list li {
          margin-bottom: 5px;
          font-size: 11px;
        }

        .contraindications {
          background-color: #FFEBEE;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          border-left: 4px solid #F44336;
        }

        .contraindication {
          color: #C62828;
          font-weight: 500;
        }

        .drug-interactions {
          background-color: #FFF3E0;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          border-left: 4px solid #FF9800;
        }

        .interaction {
          color: #F57C00;
          font-weight: 500;
        }

        .recommendations {
          background-color: #E8F5E8;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid #4CAF50;
        }

        .recommendation {
          color: #2E7D32;
          font-weight: 500;
        }

        .bmi-normal { color: #2E7D32; font-weight: 600; }
        .bmi-overweight { color: #F57C00; font-weight: 600; }
        .bmi-obese { color: #C62828; font-weight: 600; }
        .bmi-underweight { color: #F57C00; font-weight: 600; }

        .no-data {
          font-style: italic;
          color: #666;
          text-align: center;
          padding: 20px;
        }

        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          border-top: 1px solid #E0E0E0;
          padding: 10px 20px;
          background-color: white;
          font-size: 9px;
          color: #666;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .generated-by {
          font-weight: 600;
        }

        .confidentiality {
          text-align: center;
          max-width: 400px;
        }

        .page-info {
          text-align: right;
        }

        @media print {
          .footer {
            position: fixed;
            bottom: 0;
          }
        }
      </style>
    `;
  }

  // Helper methods
  private getBMICategory(bmi?: number): { category: string; class: string } {
    if (!bmi) return { category: '—', class: 'normal' };
    if (bmi < 18.5) return { category: 'Underweight', class: 'underweight' };
    if (bmi < 25) return { category: 'Normal', class: 'normal' };
    if (bmi < 30) return { category: 'Overweight', class: 'overweight' };
    return { category: 'Obese', class: 'obese' };
  }

  private formatQuestionLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private formatQuestionAnswer(answer: any): string {
    if (typeof answer === 'boolean') return answer ? 'Yes' : 'No';
    if (typeof answer === 'number') return answer.toString();
    if (Array.isArray(answer)) return answer.join(', ');
    return String(answer);
  }

  private formatTherapyType(type: string): string {
    switch (type) {
      case 'ET': return 'Estrogen Therapy (ET)';
      case 'EPT': return 'Estrogen + Progestogen Therapy (EPT)';
      case 'vaginal-only': return 'Vaginal Estrogen Only';
      case 'not-recommended': return 'Not Recommended';
      default: return type;
    }
  }

  private formatRoute(route: string): string {
    switch (route) {
      case 'oral': return 'Oral';
      case 'transdermal': return 'Transdermal';
      case 'vaginal': return 'Vaginal';
      case 'none': return 'None';
      default: return route.charAt(0).toUpperCase() + route.slice(1);
    }
  }

  private formatProgestogen(type: string): string {
    switch (type) {
      case 'micronized': return 'Micronized Progesterone';
      case 'ius': return 'Levonorgestrel IUS';
      default: return type;
    }
  }

  private generateFileName(patientName?: string, patientId?: string): string {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
    const identifier = patientName ? 
      patientName.replace(/[^a-zA-Z0-9]/g, '_') : 
      (patientId ? `Patient_${patientId}` : 'Patient');
    
    return `MHT_Assessment_${identifier}_${timestamp}.pdf`;
  }

  public async generatePDF(data: PatientData, options: ExportOptions = {}): Promise<{
    success: boolean;
    uri?: string;
    error?: string;
  }> {
    try {
      console.log('📄 Starting PDF generation...');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>MHT Assessment - ${data.name || 'Patient'}</title>
          ${this.generateCSS()}
        </head>
        <body>
          ${this.generateHeader()}
          ${this.generatePatientDemographics(data)}
          ${this.generateVisitMetadata(data)}
          ${this.generateVitalInputs(data)}
          ${this.generateQuestionnaireInputs(data)}
          ${this.generateCalculatedScores(data)}
          ${this.generateRiskAssessmentSummary(data)}
          ${this.generateTreatmentPlan(data, options)}
          ${this.generateDecisionSupport(data)}
          ${this.generateFooter()}
        </body>
        </html>
      `;

      console.log('🖨️ Generating PDF from HTML...');
      const { uri } = await printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      console.log('✅ PDF generated at temporary location:', uri);

      // Try to move to documents directory with better error handling
      try {
        const fileName = this.generateFileName(data.name, data.id);
        const documentsDir = FileSystem.documentDirectory;
        
        if (!documentsDir) {
          console.warn('⚠️ Documents directory not available, using temporary location');
          return {
            success: true,
            uri: uri,
          };
        }

        const newUri = documentsDir + fileName;
        
        // Check if target file already exists and remove it
        const fileInfo = await FileSystem.getInfoAsync(newUri);
        if (fileInfo.exists) {
          console.log('🗑️ Removing existing file:', newUri);
          await FileSystem.deleteAsync(newUri);
        }
        
        console.log('📁 Moving PDF to Documents:', newUri);
        await FileSystem.moveAsync({
          from: uri,
          to: newUri,
        });

        console.log('✅ PDF successfully moved to Documents directory');
        return {
          success: true,
          uri: newUri,
        };
        
      } catch (moveError) {
        console.warn('⚠️ Failed to move PDF to Documents directory:', moveError);
        console.log('📄 Using temporary PDF location instead');
        
        // Return the original URI if move fails
        return {
          success: true,
          uri: uri,
        };
      }

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      
      // Detailed error logging for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during PDF generation',
      };
    }
  }

  public async exportAndShare(data: PatientData, options: ExportOptions = {}): Promise<void> {
    try {
      console.log('🚀 Starting PDF export for platform:', Platform.OS);
      
      // Check platform capabilities
      if (Platform.OS === 'web') {
        // Web platform - limited functionality
        Alert.alert(
          'Platform Limitation',
          'PDF export has limited functionality in web preview. This feature works fully on mobile devices (Android/iOS) with native file access and sharing capabilities.\n\nFor full functionality, please test on a physical device or Expo Go app.',
          [
            { 
              text: 'Generate Demo PDF', 
              onPress: async () => {
                try {
                  const result = await this.generatePDF(data, options);
                  if (result.success) {
                    Alert.alert(
                      'PDF Generated', 
                      `PDF generated successfully!\n\nOn mobile devices, this would open the native share dialog for saving to Files, sharing via email, or printing.\n\nFile: ${this.generateFileName(data.name, data.id)}`,
                      [{ text: 'OK' }]
                    );
                  } else {
                    throw new Error(result.error || 'PDF generation failed');
                  }
                } catch (demoError) {
                  Alert.alert('Demo Error', `PDF generation test failed: ${demoError instanceof Error ? demoError.message : 'Unknown error'}`);
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      // Mobile platforms - full functionality
      console.log('📱 Running on mobile platform - full PDF functionality available');
      
      const result = await this.generatePDF(data, options);
      
      if (!result.success || !result.uri) {
        throw new Error(result.error || 'Failed to generate PDF');
      }

      console.log('✅ PDF generated successfully:', result.uri);

      // Check if sharing is available
      const isAvailable = await shareAsync.isAvailableAsync?.() ?? true;
      
      if (!isAvailable) {
        // Fallback for devices without sharing capability
        Alert.alert(
          'PDF Generated',
          `Your assessment has been saved as a PDF file.\n\nFile location: ${result.uri}\n\nThe file has been saved to your device's Documents folder.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Share the PDF with full mobile functionality
      await shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export MHT Assessment',
        UTI: 'com.adobe.pdf',
      });

      console.log('📤 PDF shared successfully');

    } catch (error) {
      console.error('❌ Export and share error:', error);
      
      // Enhanced error logging for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      // Platform-specific error messages with more helpful information
      let errorMessage: string;
      
      if (Platform.OS === 'web') {
        errorMessage = `PDF export is limited in web preview. For full functionality, use the mobile app.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
      } else {
        // Mobile-specific error handling
        const errorText = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorText.includes('permission') || errorText.includes('Permission')) {
          errorMessage = `Permission error: Please ensure the app has permission to access device storage.\n\nGo to Settings > Apps > MHT Assessment > Permissions and enable Storage access.`;
        } else if (errorText.includes('space') || errorText.includes('storage')) {
          errorMessage = `Storage error: Insufficient storage space available.\n\nPlease free up some space on your device and try again.`;
        } else if (errorText.includes('network') || errorText.includes('Network')) {
          errorMessage = `Network error: Please check your internet connection and try again.`;
        } else {
          errorMessage = `Failed to export PDF: ${errorText}\n\nTips:\n• Ensure sufficient storage space\n• Check app permissions\n• Try closing other apps\n• Restart the app if issues persist`;
        }
      }
      
      Alert.alert(
        'PDF Export Error',
        errorMessage,
        [
          { text: 'Try Again', onPress: () => this.exportAndShare(data, options), style: 'default' },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  }
}

export default new PDFExportGenerator();