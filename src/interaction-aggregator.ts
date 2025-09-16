// interaction-aggregator.ts
// Production-ready logic to fetch severity for 1:1 (main vs optional) mapping

// Import drug interaction data using import instead of require for APK compatibility
import drugInteractionDataImport from "../assets/rules/drug_interactions.json";

// Safely handle drug interaction data with fallback for APK builds
const drugInteractionData = (() => {
  try {
    return drugInteractionDataImport || { rules: [] };
  } catch (error) {
    console.warn('Could not load drug interaction data:', error);
    return { rules: [] };
  }
})();

export interface InteractionResult {
  severity: string;
  optional: string;
  source: string;
  rationale: string;
  recommended_action: string;
}

interface DrugInteractionRule {
  primary: string;
  interaction_with: string;
  examples: string[];
  severity: string;
  rationale: string;
  recommended_action: string;
}

// FIXED: Safe array initialization with multiple fallbacks
const getRules = (): DrugInteractionRule[] => {
  try {
    if (drugInteractionData && Array.isArray(drugInteractionData.rules)) {
      return drugInteractionData.rules;
    }
    if (drugInteractionData && drugInteractionData.rules && drugInteractionData.rules.length) {
      return drugInteractionData.rules;
    }
    return [];
  } catch (error) {
    console.warn('Error accessing rules:', error);
    return [];
  }
};

const rules: DrugInteractionRule[] = getRules();

export function getInteractionSeverity(main: string, optional: string) {
  console.log(`[getInteractionSeverity] Looking for: ${main} + ${optional}`);
  
  // FIXED: Safe array operations with null checks
  if (!Array.isArray(rules) || rules.length === 0) {
    console.warn('[getInteractionSeverity] Rules array is not available');
    return {
      severity: "Unknown",
      rationale: "Drug interaction data not available",
      action: "Consult specialist or refer to guidelines"
    };
  }
  
  // Find matching rule with safe array method
  const rule = rules.find(r => 
    r && r.primary === main && r.interaction_with === optional
  );
  
  if (!rule) {
    console.log(`[getInteractionSeverity] No rule found for ${main} + ${optional}`);
    return {
      severity: "Unknown",
      rationale: "No reliable data available",
      action: "Consult specialist or refer to guidelines"
    };
  }
  
  console.log(`[getInteractionSeverity] Found rule:`, rule);
  return {
    severity: rule.severity,
    rationale: rule.rationale,
    action: rule.recommended_action
  };
}

// Enhanced async function for drug interaction checking
export async function getSeverityForMainOptional(main: string, optional: string): Promise<InteractionResult> {
  console.log(`[getSeverityForMainOptional] Checking: ${main} + ${optional}`);
  
  try {
    // FIXED: Safe array operations with comprehensive checks
    if (!Array.isArray(rules) || rules.length === 0) {
      console.warn('[getSeverityForMainOptional] Rules array is not available or empty');
      return {
        severity: 'UNKNOWN',
        optional: optional,
        source: 'local-json',
        rationale: 'Drug interaction data not available',
        recommended_action: 'Consult specialist or refer to guidelines'
      };
    }
    
    // Find matching rule in the rules array with safe operations
    const rule = rules.find(r => 
      r && r.primary === main && r.interaction_with === optional
    );

    if (!rule) {
      console.log(`[getSeverityForMainOptional] No rule found for ${main} + ${optional}`);
      // FIXED: Safe debugging with array checks
      const availablePrimaries = Array.isArray(rules) && rules.length > 0 
        ? [...new Set(rules.map(r => r && r.primary).filter(Boolean))]
        : [];
      console.log(`[getSeverityForMainOptional] Available primaries:`, availablePrimaries);
      
      // FIXED: Safe logging with array checks  
      const availableOptionals = Array.isArray(rules) && rules.length > 0
        ? rules
            .filter(r => r && r.primary === main)
            .map(r => r.interaction_with)
            .filter(Boolean)
        : [];
      console.log(`[getSeverityForMainOptional] Available optionals for ${main}:`, availableOptionals);
      
      return {
        severity: 'UNKNOWN',
        optional: optional,
        source: 'local-json',
        rationale: 'No reliable data available',
        recommended_action: 'Consult specialist or refer to guidelines'
      };
    }

    console.log(`[getSeverityForMainOptional] Found rule:`, rule);
    
    return {
      severity: rule.severity || 'UNKNOWN',
      optional: optional,
      source: 'local-json',
      rationale: rule.rationale || 'No rationale available',
      recommended_action: rule.recommended_action || 'Consult specialist'
    };
  } catch (error) {
    console.error(`[getSeverityForMainOptional] Error:`, error);
    return {
      severity: 'UNKNOWN',
      optional: optional,
      source: 'local-json',
      rationale: 'Error loading interaction data',
      recommended_action: 'Please try again or consult specialist'
    };
  }
}

// Color mapping for severity levels
export function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'HIGH':
      return '#DC2626'; // Red-600
    case 'MODERATE':
      return '#EA580C'; // Orange-600
    case 'LOW':
      return '#FFC107'; // Yellow-500
    case 'UNKNOWN':
    default:
      return '#6B7280'; // Gray-500
  }
}

// Text color for severity levels (for contrast)
export function getSeverityTextColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'HIGH':
      return '#FFFFFF'; // White text on red
    case 'MODERATE':
      return '#FFFFFF'; // White text on orange
    case 'LOW':
      return '#000000'; // Black text on yellow
    case 'UNKNOWN':
    default:
      return '#FFFFFF'; // White text on gray
  }
}
