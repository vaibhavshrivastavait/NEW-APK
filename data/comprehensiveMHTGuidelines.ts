// Comprehensive MHT Guidelines Data - World-Class Clinical Reference
// Based on: NAMS 2022, NICE 2015/2019, ACOG 2014/2021, Endocrine Society 2015, IMS 2016

export interface GuidelineReference {
  source: string;
  year: number;
  url?: string;
  level: 'A' | 'B' | 'C' | 'GPP'; // Evidence levels
}

export interface ClinicalRecommendation {
  text: string;
  grade: 'Strong' | 'Conditional' | 'Expert Opinion';
  evidenceLevel: 'High' | 'Moderate' | 'Low' | 'Very Low';
  references: GuidelineReference[];
}

export interface GuidelineSection {
  id: string;
  title: string;
  icon: string;
  category: 'indications' | 'contraindications' | 'risks' | 'routes' | 'dosing' | 'monitoring' | 'alternatives' | 'counseling';
  priority: 'critical' | 'important' | 'standard';
  content: {
    overview: string;
    keyPoints: string[];
    recommendations: ClinicalRecommendation[];
    clinicalPearls?: string[];
    warnings?: string[];
    patientCounseling?: string[];
  };
  decisionTree?: DecisionTreeNode;
  quickReference?: QuickReferenceCard;
  lastUpdated: string;
}

export interface DecisionTreeNode {
  id: string;
  question: string;
  type: 'decision' | 'outcome' | 'warning';
  options?: {
    text: string;
    nextNodeId?: string;
    outcome?: string;
    riskLevel?: 'low' | 'moderate' | 'high';
  }[];
  outcome?: string;
  recommendation?: string;
}

export interface QuickReferenceCard {
  title: string;
  items: {
    label: string;
    value: string;
    highlight?: boolean;
    severity?: 'info' | 'warning' | 'danger';
  }[];
}

export const MHT_GUIDELINES: GuidelineSection[] = [
  {
    id: 'indications',
    title: 'Indications for MHT',
    icon: 'assignment',
    category: 'indications',
    priority: 'critical',
    content: {
      overview: 'Menopause Hormone Therapy (MHT) is indicated for specific symptoms and conditions where benefits outweigh risks based on individual patient assessment.',
      keyPoints: [
        'Primary indication: Moderate to severe vasomotor symptoms',
        'Secondary indications: Genitourinary syndrome, bone health',
        'Consider patient age, time since menopause, and risk factors',
        'Individualized risk-benefit assessment required',
        'Shared decision-making essential'
      ],
      recommendations: [
        {
          text: 'MHT is the most effective treatment for vasomotor symptoms and should be offered to women with moderate to severe symptoms',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'NAMS Position Statement', year: 2022, level: 'A' },
            { source: 'NICE Guideline NG23', year: 2019, level: 'A' }
          ]
        },
        {
          text: 'For genitourinary syndrome of menopause (GSM), local estrogen is first-line treatment',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'ACOG Practice Bulletin', year: 2021, level: 'A' },
            { source: 'IMS Recommendations', year: 2016, level: 'A' }
          ]
        }
      ],
      clinicalPearls: [
        'Window of opportunity: Initiate within 10 years of menopause or before age 60',
        'Consider non-oral routes in women with VTE or cardiovascular risk factors',
        'Local estrogen for GSM has minimal systemic absorption'
      ],
      patientCounseling: [
        'Explain benefits: symptom relief, bone protection, potential cardiovascular benefits if started early',
        'Discuss timing: earlier initiation generally safer',
        'Review individual risk factors and contraindications'
      ]
    },
    quickReference: {
      title: 'Primary Indications',
      items: [
        { label: 'Vasomotor Symptoms', value: 'First-line therapy', highlight: true, severity: 'info' },
        { label: 'GSM/Vulvovaginal Atrophy', value: 'Local estrogen preferred', highlight: true, severity: 'info' },
        { label: 'Osteoporosis Prevention', value: 'Consider if other indications present', severity: 'info' },
        { label: 'Premature Menopause (<40y)', value: 'Until natural menopause age', highlight: true, severity: 'warning' }
      ]
    },
    lastUpdated: '2024-01-15'
  },
  {
    id: 'contraindications',
    title: 'Contraindications',
    icon: 'block',
    category: 'contraindications',
    priority: 'critical',
    content: {
      overview: 'Absolute and relative contraindications to MHT based on current evidence and clinical guidelines.',
      keyPoints: [
        'Absolute contraindications are evidence-based and non-negotiable',
        'Relative contraindications require careful risk-benefit assessment',
        'Individual patient factors may modify contraindication status',
        'Regular reassessment as patient status changes'
      ],
      recommendations: [
        {
          text: 'MHT is contraindicated in women with current or history of breast cancer',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'NAMS Position Statement', year: 2022, level: 'A' },
            { source: 'Endocrine Society Guideline', year: 2015, level: 'A' }
          ]
        },
        {
          text: 'Active liver disease or unexplained persistent liver function abnormalities are absolute contraindications',
          grade: 'Strong',
          evidenceLevel: 'Moderate',
          references: [
            { source: 'NICE Guideline NG23', year: 2019, level: 'B' }
          ]
        }
      ],
      warnings: [
        'Unexplained vaginal bleeding must be investigated before MHT initiation',
        'Active VTE or arterial thrombosis within 3 months is absolute contraindication',
        'Pregnancy must be excluded in perimenopausal women'
      ]
    },
    quickReference: {
      title: 'Contraindications',
      items: [
        { label: 'Breast Cancer (current/history)', value: 'Absolute', severity: 'danger', highlight: true },
        { label: 'Endometrial Cancer', value: 'Absolute*', severity: 'danger' },
        { label: 'Active VTE/PE', value: 'Absolute', severity: 'danger', highlight: true },
        { label: 'Active Liver Disease', value: 'Absolute', severity: 'danger' },
        { label: 'Unexplained Vaginal Bleeding', value: 'Absolute', severity: 'danger', highlight: true },
        { label: 'Acute MI/Stroke (<6 months)', value: 'Absolute', severity: 'danger' },
        { label: 'Previous VTE', value: 'Relative', severity: 'warning' },
        { label: 'High CVD Risk', value: 'Relative', severity: 'warning' }
      ]
    },
    lastUpdated: '2024-01-15'
  },
  {
    id: 'risk-stratification',
    title: 'Risk Assessment & Stratification',
    icon: 'assessment',
    category: 'risks',
    priority: 'critical',
    content: {
      overview: 'Systematic approach to cardiovascular, thrombotic, and breast cancer risk assessment before MHT initiation.',
      keyPoints: [
        'Risk assessment is mandatory before MHT initiation',
        'Use validated risk calculators where available',
        'Consider both baseline risks and MHT-associated risks',
        'Age and time since menopause are critical factors',
        'Regular risk reassessment during treatment'
      ],
      recommendations: [
        {
          text: 'Cardiovascular risk assessment using validated tools (QRISK, Framingham) should be performed',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'NICE Guideline NG23', year: 2019, level: 'A' },
            { source: 'NAMS Position Statement', year: 2022, level: 'A' }
          ]
        },
        {
          text: 'VTE risk assessment considering personal/family history, BMI, and other risk factors',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'ACOG Practice Bulletin', year: 2021, level: 'A' }
          ]
        }
      ],
      clinicalPearls: [
        'Transdermal estrogen has lower VTE risk than oral',
        'Risk increases with age, especially >60 years',
        'Family history of VTE increases risk 2-3 fold',
        'Obesity (BMI >30) significantly increases VTE risk'
      ]
    },
    decisionTree: {
      id: 'risk-assessment-start',
      question: 'Patient age and menopause onset?',
      type: 'decision',
      options: [
        { text: '<60 years, <10 years since menopause', nextNodeId: 'low-risk-age' },
        { text: '60-69 years, 10-19 years since menopause', nextNodeId: 'moderate-risk-age' },
        { text: '>70 years, >20 years since menopause', nextNodeId: 'high-risk-age' }
      ]
    },
    quickReference: {
      title: 'Risk Categories',
      items: [
        { label: 'Low Risk', value: '<60y, <10y menopause', severity: 'info', highlight: true },
        { label: 'Moderate Risk', value: '60-69y, 10-19y menopause', severity: 'warning' },
        { label: 'High Risk', value: '>70y, >20y menopause', severity: 'danger' },
        { label: 'VTE Risk Factors', value: 'Age, obesity, immobility', severity: 'warning' },
        { label: 'CVD Risk Factors', value: 'Use QRISK calculator', severity: 'info' }
      ]
    },
    lastUpdated: '2024-01-15'
  },
  {
    id: 'routes-administration',
    title: 'Routes of Administration',
    icon: 'route',
    category: 'routes',
    priority: 'important',
    content: {
      overview: 'Evidence-based selection of MHT delivery routes considering patient factors, risks, and preferences.',
      keyPoints: [
        'Route selection significantly impacts risk profile',
        'Transdermal routes avoid first-pass hepatic metabolism',
        'Oral routes may have different efficacy profiles',
        'Patient preference and convenience are important factors',
        'Consider switching routes if adverse effects occur'
      ],
      recommendations: [
        {
          text: 'Transdermal estrogen preferred for women with VTE risk factors',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'NICE Guideline NG23', year: 2019, level: 'A' },
            { source: 'NAMS Position Statement', year: 2022, level: 'A' }
          ]
        },
        {
          text: 'Vaginal estrogen is first-line for genitourinary symptoms alone',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'IMS Recommendations', year: 2016, level: 'A' }
          ]
        }
      ],
      clinicalPearls: [
        'Oral estrogen increases SHBG and may affect other hormones',
        'Patches may cause skin irritation in 10-15% of women',
        'Gels provide flexibility in dosing adjustments',
        'Vaginal rings provide sustained local delivery'
      ]
    },
    decisionTree: {
      id: 'route-selection',
      question: 'Primary indication and risk factors?',
      type: 'decision',
      options: [
        { text: 'GSM symptoms only', outcome: 'Vaginal estrogen first-line', riskLevel: 'low' },
        { text: 'VTE/CVD risk factors', outcome: 'Transdermal estrogen preferred', riskLevel: 'moderate' },
        { text: 'Low risk, vasomotor symptoms', outcome: 'Oral or transdermal options', riskLevel: 'low' },
        { text: 'Liver disease history', outcome: 'Transdermal routes only', riskLevel: 'high' }
      ]
    },
    quickReference: {
      title: 'Route Selection Guide',
      items: [
        { label: 'Oral', value: 'Low-risk patients, convenient dosing', severity: 'info' },
        { label: 'Transdermal (Patch)', value: 'VTE/CVD risk, steady levels', severity: 'info', highlight: true },
        { label: 'Transdermal (Gel)', value: 'Dose flexibility, avoid patches', severity: 'info' },
        { label: 'Vaginal', value: 'GSM symptoms, minimal systemic absorption', severity: 'info', highlight: true },
        { label: 'Nasal/Sublingual', value: 'Special circumstances only', severity: 'warning' }
      ]
    },
    lastUpdated: '2024-01-15'
  },
  {
    id: 'dosing-strategies',
    title: 'Dosing & Formulations',
    icon: 'medication',
    category: 'dosing',
    priority: 'important',
    content: {
      overview: 'Evidence-based dosing strategies and formulation selection for optimal efficacy and safety.',
      keyPoints: [
        'Start with lowest effective dose principle',
        'Individualize based on symptoms and tolerability',
        'Consider patient age and time since menopause',
        'Allow adequate trial period before dose adjustments',
        'Regular monitoring and dose optimization'
      ],
      recommendations: [
        {
          text: 'Use lowest effective dose to achieve symptom control',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'NAMS Position Statement', year: 2022, level: 'A' },
            { source: 'NICE Guideline NG23', year: 2019, level: 'A' }
          ]
        },
        {
          text: 'Continuous combined regimens preferred in postmenopausal women >1 year',
          grade: 'Conditional',
          evidenceLevel: 'Moderate',
          references: [
            { source: 'Endocrine Society Guideline', year: 2015, level: 'B' }
          ]
        }
      ],
      clinicalPearls: [
        'Allow 3-4 months for full therapeutic effect',
        'Breakthrough bleeding common in first 6 months',
        'Consider dose escalation if symptoms persist',
        'Bioidentical vs conventional - similar efficacy and risks'
      ]
    },
    quickReference: {
      title: 'Standard Dosing',
      items: [
        { label: 'Oral Estradiol', value: '1-2mg daily', severity: 'info', highlight: true },
        { label: 'Transdermal Estradiol', value: '25-50mcg/day patch', severity: 'info', highlight: true },
        { label: 'Estradiol Gel', value: '0.5-1mg daily', severity: 'info' },
        { label: 'Vaginal Estradiol', value: '10-25mcg 2-3x/week', severity: 'info' },
        { label: 'Micronized Progesterone', value: '100-200mg daily', severity: 'info', highlight: true },
        { label: 'Dydrogesterone', value: '10mg daily', severity: 'info' }
      ]
    },
    lastUpdated: '2024-01-15'
  },
  {
    id: 'monitoring-followup',
    title: 'Monitoring & Follow-up',
    icon: 'schedule',
    category: 'monitoring',
    priority: 'important',
    content: {
      overview: 'Structured monitoring and follow-up protocols to ensure safety and optimize treatment outcomes.',
      keyPoints: [
        'Regular structured follow-up appointments',
        'Symptom assessment and treatment response',
        'Side effect monitoring and management',
        'Risk reassessment at each visit',
        'Consideration of treatment duration'
      ],
      recommendations: [
        {
          text: 'Follow-up at 3 months, then annually unless problems arise',
          grade: 'Strong',
          evidenceLevel: 'Moderate',
          references: [
            { source: 'NICE Guideline NG23', year: 2019, level: 'B' },
            { source: 'NAMS Position Statement', year: 2022, level: 'B' }
          ]
        },
        {
          text: 'Annual breast examination and mammography screening as per guidelines',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'ACOG Practice Bulletin', year: 2021, level: 'A' }
          ]
        }
      ],
      clinicalPearls: [
        'Document symptom relief using validated scales',
        'Monitor blood pressure at each visit',
        'Investigate any unexpected bleeding promptly',
        'Consider treatment cessation after 5 years unless compelling indication'
      ],
      patientCounseling: [
        'Explain importance of regular follow-up',
        'Provide clear instructions on when to seek urgent care',
        'Discuss signs and symptoms to monitor'
      ]
    },
    quickReference: {
      title: 'Monitoring Schedule',
      items: [
        { label: '3 Months', value: 'Initial response, side effects', severity: 'info', highlight: true },
        { label: '6 Months', value: 'Symptom control, BP check', severity: 'info' },
        { label: 'Annually', value: 'Comprehensive review', severity: 'info', highlight: true },
        { label: 'Mammography', value: 'As per screening guidelines', severity: 'warning' },
        { label: 'Unexpected Bleeding', value: 'Investigate promptly', severity: 'danger', highlight: true }
      ]
    },
    lastUpdated: '2024-01-15'
  },
  {
    id: 'alternatives',
    title: 'Non-hormonal Alternatives',
    icon: 'healing',
    category: 'alternatives',
    priority: 'standard',
    content: {
      overview: 'Evidence-based non-hormonal treatments for menopausal symptoms when MHT is contraindicated or not preferred.',
      keyPoints: [
        'Multiple effective non-hormonal options available',
        'Consider patient preferences and contraindications',
        'Combine lifestyle and pharmacological approaches',
        'Regular reassessment of effectiveness',
        'May be used alongside MHT for additional benefit'
      ],
      recommendations: [
        {
          text: 'SSRIs/SNRIs are effective for vasomotor symptoms when MHT contraindicated',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'NAMS Position Statement', year: 2022, level: 'A' },
            { source: 'NICE Guideline NG23', year: 2019, level: 'A' }
          ]
        },
        {
          text: 'Gabapentin effective for hot flashes, particularly if sleep disturbance',
          grade: 'Conditional',
          evidenceLevel: 'Moderate',
          references: [
            { source: 'Endocrine Society Guideline', year: 2015, level: 'B' }
          ]
        }
      ],
      clinicalPearls: [
        'Cognitive behavioral therapy effective for multiple symptoms',
        'Clonidine may help but limited by side effects',
        'Lifestyle modifications should be first-line for all patients',
        'Complementary therapies have limited evidence but may help some patients'
      ]
    },
    quickReference: {
      title: 'Non-hormonal Options',
      items: [
        { label: 'Paroxetine 7.5mg', value: 'FDA approved for hot flashes', severity: 'info', highlight: true },
        { label: 'Venlafaxine 75mg', value: 'Effective for vasomotor symptoms', severity: 'info' },
        { label: 'Gabapentin 300-900mg', value: 'Especially if sleep issues', severity: 'info' },
        { label: 'Clonidine 0.1mg BID', value: 'Limited by side effects', severity: 'warning' },
        { label: 'CBT', value: 'Multiple symptom benefit', severity: 'info', highlight: true },
        { label: 'Lifestyle Changes', value: 'Diet, exercise, stress management', severity: 'info', highlight: true }
      ]
    },
    lastUpdated: '2024-01-15'
  },
  {
    id: 'patient-counseling',
    title: 'Patient Counseling & Communication',
    icon: 'chat',
    category: 'counseling',
    priority: 'important',
    content: {
      overview: 'Structured approach to patient education and shared decision-making for MHT.',
      keyPoints: [
        'Shared decision-making is essential',
        'Provide balanced information on risks and benefits',
        'Use clear, jargon-free language',
        'Address patient concerns and misconceptions',
        'Document discussions thoroughly'
      ],
      recommendations: [
        {
          text: 'Shared decision-making approach should be used for all MHT decisions',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'NICE Guideline NG23', year: 2019, level: 'A' },
            { source: 'NAMS Position Statement', year: 2022, level: 'A' }
          ]
        }
      ],
      patientCounseling: [
        'Explain that MHT is most effective treatment for moderate-severe symptoms',
        'Discuss individual risk factors and how they influence treatment choice',
        'Explain route selection rationale',
        'Set realistic expectations for symptom improvement timeline',
        'Provide written information and resources',
        'Schedule appropriate follow-up'
      ],
      clinicalPearls: [
        'Address media-driven fears with evidence-based information',
        'Use absolute rather than relative risk when discussing risks',
        'Acknowledge uncertainty where evidence is limited',
        'Respect patient values and preferences'
      ]
    },
    quickReference: {
      title: 'Key Counseling Points',
      items: [
        { label: 'Benefits', value: 'Symptom relief, bone health, QoL', severity: 'info', highlight: true },
        { label: 'Risks', value: 'Individual assessment required', severity: 'warning' },
        { label: 'Timeline', value: '3-4 months for full effect', severity: 'info' },
        { label: 'Follow-up', value: '3 months, then annually', severity: 'info', highlight: true },
        { label: 'Red Flags', value: 'Chest pain, leg swelling, unusual bleeding', severity: 'danger', highlight: true }
      ]
    },
    lastUpdated: '2024-01-15'
  }
];

// Decision Tree Data Structure
export const DECISION_TREES = {
  'risk-assessment': {
    'risk-assessment-start': {
      id: 'risk-assessment-start',
      question: 'Patient age and time since menopause?',
      type: 'decision' as const,
      options: [
        { text: '<60 years, <10 years since menopause', nextNodeId: 'low-risk-age' },
        { text: '60-69 years, OR 10-19 years since menopause', nextNodeId: 'moderate-risk-age' },
        { text: '>70 years, OR >20 years since menopause', nextNodeId: 'high-risk-age' }
      ]
    },
    'low-risk-age': {
      id: 'low-risk-age',
      question: 'Additional risk factors?',
      type: 'decision' as const,
      options: [
        { text: 'No additional risk factors', nextNodeId: 'low-risk-final' },
        { text: 'Cardiovascular risk factors present', nextNodeId: 'moderate-risk-cvd' },
        { text: 'VTE risk factors present', nextNodeId: 'moderate-risk-vte' }
      ]
    },
    'low-risk-final': {
      id: 'low-risk-final',
      question: '',
      type: 'outcome' as const,
      outcome: 'Low Risk - MHT appropriate if indicated',
      recommendation: 'Standard MHT regimens appropriate. Any route suitable based on patient preference.'
    },
    'moderate-risk-cvd': {
      id: 'moderate-risk-cvd',
      question: '',
      type: 'outcome' as const,
      outcome: 'Moderate Risk - CVD considerations',
      recommendation: 'Consider transdermal routes. Assess cardiovascular risk using validated calculator.'
    },
    'moderate-risk-vte': {
      id: 'moderate-risk-vte',
      question: '',
      type: 'outcome' as const,
      outcome: 'Moderate Risk - VTE considerations',
      recommendation: 'Transdermal estrogen preferred. Consider thrombophilia screening if strong family history.'
    }
  },
  'route-selection': {
    'route-selection': {
      id: 'route-selection',
      question: 'Primary indication and risk profile?',
      type: 'decision' as const,
      options: [
        { text: 'Genitourinary symptoms only', outcome: 'Vaginal estrogen first-line', riskLevel: 'low' as const },
        { text: 'VTE risk factors present', outcome: 'Transdermal estrogen preferred', riskLevel: 'moderate' as const },
        { text: 'Cardiovascular risk factors', outcome: 'Transdermal estrogen preferred', riskLevel: 'moderate' as const },
        { text: 'Low risk, vasomotor symptoms', outcome: 'Oral or transdermal - patient choice', riskLevel: 'low' as const },
        { text: 'Liver disease history', outcome: 'Transdermal routes only', riskLevel: 'high' as const }
      ]
    }
  }
};