// Combined MHT Guidelines - Old + New Comprehensive Guidelines
// Updated with calming pink color scheme to match home screen

import { GuidelineSection, ClinicalRecommendation, DecisionTreeNode } from './comprehensiveMHTGuidelines';

// Legacy/Traditional MHT Guidelines (Original from the app)
export const LEGACY_MHT_GUIDELINES: GuidelineSection[] = [
  {
    id: 'legacy-basic-indications',
    title: 'Basic MHT Indications',
    icon: 'local-hospital',
    category: 'indications',
    priority: 'important',
    content: {
      overview: 'Traditional indications for menopausal hormone therapy based on established clinical practice.',
      keyPoints: [
        'Hot flashes and night sweats',
        'Vaginal dryness and atrophy',
        'Prevention of osteoporosis',
        'Quality of life improvement',
        'Sleep disturbances related to menopause'
      ],
      recommendations: [
        {
          text: 'Consider MHT for women with troublesome menopausal symptoms',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'Traditional Clinical Practice', year: 2020, level: 'A' }
          ]
        }
      ],
      clinicalPearls: [
        'Start with the lowest effective dose',
        'Use for the shortest duration necessary',
        'Regular review every 6-12 months'
      ],
      patientCounseling: [
        'Discuss benefits and risks',
        'Individual risk assessment',
        'Alternative treatments available'
      ]
    },
    lastUpdated: '2023-01-01'
  },
  {
    id: 'legacy-contraindications',
    title: 'Traditional Contraindications',
    icon: 'warning',
    category: 'contraindications',
    priority: 'critical',
    content: {
      overview: 'Standard contraindications to hormone therapy commonly referenced in clinical practice.',
      keyPoints: [
        'History of breast cancer',
        'History of blood clots (VTE/PE)',
        'Active liver disease',
        'Unexplained vaginal bleeding',
        'Coronary artery disease'
      ],
      recommendations: [
        {
          text: 'Absolute contraindications include current breast cancer and active VTE',
          grade: 'Strong',
          evidenceLevel: 'High',
          references: [
            { source: 'Standard Practice Guidelines', year: 2020, level: 'A' }
          ]
        }
      ],
      warnings: [
        'Careful history taking essential',
        'Document contraindications clearly',
        'Consider alternatives when contraindicated'
      ]
    },
    lastUpdated: '2023-01-01'
  },
  {
    id: 'legacy-hormone-types',
    title: 'Hormone Types & Routes',
    icon: 'medication',
    category: 'routes',
    priority: 'important',
    content: {
      overview: 'Overview of different hormone types and delivery methods available for MHT.',
      keyPoints: [
        'Estrogen: oral, transdermal, topical',
        'Progestogen: oral, intrauterine (Mirena)',
        'Combined preparations available',
        'Tibolone as alternative',
        'Local estrogen for vaginal symptoms'
      ],
      recommendations: [
        {
          text: 'Transdermal estrogen preferred in women at risk of VTE',
          grade: 'Strong',
          evidenceLevel: 'Moderate',
          references: [
            { source: 'Clinical Practice Review', year: 2021, level: 'B' }
          ]
        }
      ],
      clinicalPearls: [
        'Oral estrogen increases SHBG more than transdermal',
        'Micronized progesterone may have better tolerability',
        'Local estrogen minimally absorbed systemically'
      ]
    },
    lastUpdated: '2023-01-01'
  },
  {
    id: 'legacy-monitoring',
    title: 'Basic Monitoring',
    icon: 'monitor-heart',
    category: 'monitoring',
    priority: 'important',
    content: {
      overview: 'Essential monitoring requirements for women on hormone replacement therapy.',
      keyPoints: [
        'Regular clinical review',
        'Breast examination',
        'Blood pressure monitoring',
        'Weight monitoring',
        'Symptom assessment'
      ],
      recommendations: [
        {
          text: 'Review patients on MHT at least annually',
          grade: 'Strong',
          evidenceLevel: 'Moderate',
          references: [
            { source: 'Standard Clinical Guidelines', year: 2022, level: 'B' }
          ]
        }
      ],
      clinicalPearls: [
        'Encourage breast awareness',
        'Regular mammography as per guidelines',
        'Monitor for breakthrough bleeding'
      ],
      patientCounseling: [
        'Report any unusual symptoms',
        'Attend regular appointments',
        'Maintain healthy lifestyle'
      ]
    },
    lastUpdated: '2023-01-01'
  },
  {
    id: 'legacy-side-effects',
    title: 'Common Side Effects',
    icon: 'report-problem',
    category: 'monitoring',
    priority: 'important',
    content: {
      overview: 'Common side effects and management strategies for hormone replacement therapy.',
      keyPoints: [
        'Breast tenderness',
        'Nausea (especially with oral preparations)',
        'Headaches',
        'Mood changes',
        'Breakthrough bleeding'
      ],
      recommendations: [
        {
          text: 'Most side effects are transient and resolve within 3 months',
          grade: 'Strong',
          evidenceLevel: 'Moderate',
          references: [
            { source: 'Clinical Experience Review', year: 2021, level: 'B' }
          ]
        }
      ],
      clinicalPearls: [
        'Take with food to reduce nausea',
        'Consider dose reduction if side effects persist',
        'Alternative routes may help side effects'
      ],
      patientCounseling: [
        'Most side effects temporary',
        'Report persistent or severe symptoms',
        'Alternative options available'
      ]
    },
    lastUpdated: '2023-01-01'
  }
];

// Import the comprehensive guidelines
import { MHT_GUIDELINES } from './comprehensiveMHTGuidelines';

// Combined guidelines with legacy first, then comprehensive
export const COMBINED_MHT_GUIDELINES: GuidelineSection[] = [
  ...LEGACY_MHT_GUIDELINES,
  ...MHT_GUIDELINES
];

// Pink color scheme matching home screen
export const PINK_COLOR_SCHEME = {
  primary: '#D81B60',          // Main pink from home screen
  primaryLight: '#FFC1CC',     // Light pink background
  primaryLighter: '#FFF0F5',   // Very light pink
  secondary: '#FFB3BA',        // Complementary pink
  accent: '#FF69B4',           // Hot pink for highlights
  text: {
    primary: '#D81B60',        // Main text in pink
    secondary: '#B71C1C',      // Darker pink for contrast
    muted: '#E91E63',          // Muted pink
    light: '#FCE4EC'           // Very light pink text
  },
  background: {
    primary: '#FFF0F5',        // Main background
    card: '#FFFFFF',           // Card background
    selected: '#FFC1CC',       // Selected items
    hover: '#FFE0E6'           // Hover state
  },
  status: {
    critical: '#FF5252',       // Critical/danger - red-pink
    important: '#FF9800',      // Important - orange (unchanged)
    standard: '#FCE4EC',       // Standard - very light pink
    success: '#4CAF50'         // Success - green (unchanged)
  }
};

// Category configuration with pink theme
export const PINK_CATEGORIES = [
  { key: 'all', label: 'All', icon: 'view-module', color: PINK_COLOR_SCHEME.primary },
  { key: 'legacy', label: 'Traditional', icon: 'history', color: PINK_COLOR_SCHEME.secondary },
  { key: 'comprehensive', label: 'Evidence-Based', icon: 'verified', color: PINK_COLOR_SCHEME.accent },
  { key: 'critical', label: 'Critical', icon: 'priority-high', color: PINK_COLOR_SCHEME.status.critical },
  { key: 'important', label: 'Important', icon: 'star', color: '#FF9800' },
  { key: 'tools', label: 'Tools', icon: 'build', color: PINK_COLOR_SCHEME.primary },
];

// Priority colors with pink theme
export const PINK_PRIORITY_COLORS = {
  critical: '#FFEBEE',
  important: '#FFF3E0', 
  standard: PINK_COLOR_SCHEME.status.standard
};

// Evidence colors (keep medical standard colors for clarity)
export const EVIDENCE_COLORS = {
  'High': '#4CAF50',
  'Moderate': '#FF9800',
  'Low': '#FF5722',
  'Very Low': '#9E9E9E'
};

// Search function across all guidelines
export const searchGuidelines = (query: string, guidelines: GuidelineSection[] = COMBINED_MHT_GUIDELINES): GuidelineSection[] => {
  if (!query.trim()) {
    return guidelines;
  }
  
  const searchTerm = query.toLowerCase();
  
  return guidelines.filter(guideline => {
    // Search in title
    if (guideline.title.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in overview
    if (guideline.content.overview.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in key points
    if (guideline.content.keyPoints.some(point => 
      point.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
    
    // Search in recommendations
    if (guideline.content.recommendations.some(rec => 
      rec.text.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
    
    // Search in clinical pearls
    if (guideline.content.clinicalPearls?.some(pearl => 
      pearl.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
    
    // Search in patient counseling
    if (guideline.content.patientCounseling?.some(point => 
      point.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
    
    return false;
  });
};

// Filter guidelines by category
export const filterGuidelinesByCategory = (category: string, guidelines: GuidelineSection[] = COMBINED_MHT_GUIDELINES): GuidelineSection[] => {
  switch (category) {
    case 'all':
      return guidelines;
    case 'legacy':
      return guidelines.filter(g => g.id.startsWith('legacy-'));
    case 'comprehensive':
      return guidelines.filter(g => !g.id.startsWith('legacy-'));
    case 'critical':
      return guidelines.filter(g => g.priority === 'critical');
    case 'important':
      return guidelines.filter(g => g.priority === 'important');
    case 'tools':
      return guidelines.filter(g => g.decisionTree || g.quickReference);
    default:
      return guidelines;
  }
};

// Get guideline by ID
export const getGuidelineById = (id: string, guidelines: GuidelineSection[] = COMBINED_MHT_GUIDELINES): GuidelineSection | undefined => {
  return guidelines.find(guideline => guideline.id === id);
};

// Get guidelines count by category
export const getGuidelinesCountByCategory = (guidelines: GuidelineSection[] = COMBINED_MHT_GUIDELINES) => {
  return {
    all: guidelines.length,
    legacy: guidelines.filter(g => g.id.startsWith('legacy-')).length,
    comprehensive: guidelines.filter(g => !g.id.startsWith('legacy-')).length,
    critical: guidelines.filter(g => g.priority === 'critical').length,
    important: guidelines.filter(g => g.priority === 'important').length,
    tools: guidelines.filter(g => g.decisionTree || g.quickReference).length,
  };
};