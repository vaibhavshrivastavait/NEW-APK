/**
 * Online Drug Interaction API Integration
 * Handles API calls for drug interaction checking when online mode is enabled
 */

import { DrugCheckSettings } from './drugSettings';

export interface ApiInteractionResult {
  medication1: string;
  medication2: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
  source: string;
  confidence: number;
}

export interface ApiResponse {
  status: 'success' | 'failure' | 'timeout';
  results: ApiInteractionResult[];
  provider: string;
  responseTime: number;
  errorMessage?: string;
}

/**
 * Call external API for drug interaction checking
 */
export async function checkDrugInteractionsOnline(
  medications: string[],
  settings: DrugCheckSettings
): Promise<ApiResponse> {
  const startTime = Date.now();
  
  if (!settings.onlineChecksEnabled || settings.apiProvider === 'None') {
    return {
      status: 'failure',
      results: [],
      provider: 'None',
      responseTime: 0,
      errorMessage: 'Online checks disabled'
    };
  }

  try {
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), settings.apiTimeout);

    let apiUrl: string;
    let requestBody: any;
    
    // Configure API based on provider
    switch (settings.apiProvider) {
      case 'OpenFDA':
        apiUrl = 'https://api.fda.gov/drug/event.json';
        requestBody = {
          search: medications.join(' AND '),
          limit: 10
        };
        break;
        
      case 'RxNorm':
        apiUrl = 'https://rxnav.nlm.nih.gov/REST/interaction/list.json';
        requestBody = {
          rxcuis: medications.join('+')
        };
        break;
        
      case 'DrugBank':
        // Note: DrugBank requires API key - this is a placeholder
        apiUrl = 'https://api.drugbank.com/v1/interactions';
        requestBody = {
          drugs: medications
        };
        break;
        
      default:
        throw new Error(`Unsupported API provider: ${settings.apiProvider}`);
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MHT-Assessment-App/1.0'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    const results = parseApiResponse(data, settings.apiProvider);
    
    return {
      status: 'success',
      results,
      provider: settings.apiProvider,
      responseTime: Date.now() - startTime,
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      return {
        status: 'timeout',
        results: [],
        provider: settings.apiProvider,
        responseTime,
        errorMessage: 'Request timed out'
      };
    }

    return {
      status: 'failure',
      results: [],
      provider: settings.apiProvider,
      responseTime,
      errorMessage: error.message || 'Unknown API error'
    };
  }
}

/**
 * Parse API response based on provider
 */
function parseApiResponse(data: any, provider: string): ApiInteractionResult[] {
  const results: ApiInteractionResult[] = [];
  
  try {
    switch (provider) {
      case 'OpenFDA':
        // Parse OpenFDA response format
        if (data.results) {
          data.results.forEach((item: any) => {
            if (item.patient && item.patient.drug) {
              const drugs = item.patient.drug.map((d: any) => d.medicinalproduct);
              if (drugs.length >= 2) {
                results.push({
                  medication1: drugs[0],
                  medication2: drugs[1],
                  severity: classifySeverity(item.serious || '1'),
                  description: item.patient.summary || 'Interaction reported in FDA database',
                  source: 'FDA Adverse Event Database',
                  confidence: 0.7
                });
              }
            }
          });
        }
        break;
        
      case 'RxNorm':
        // Parse RxNorm response format
        if (data.interactionTypeGroup) {
          data.interactionTypeGroup.forEach((group: any) => {
            group.interactionType.forEach((interaction: any) => {
              interaction.interactionPair.forEach((pair: any) => {
                results.push({
                  medication1: pair.interactionConcept[0].minConceptItem.name,
                  medication2: pair.interactionConcept[1].minConceptItem.name,
                  severity: mapRxNormSeverity(pair.severity),
                  description: pair.description,
                  source: 'RxNorm/NLM',
                  confidence: 0.8
                });
              });
            });
          });
        }
        break;
        
      case 'DrugBank':
        // Parse DrugBank response format
        if (data.interactions) {
          data.interactions.forEach((interaction: any) => {
            results.push({
              medication1: interaction.drug1.name,
              medication2: interaction.drug2.name,
              severity: mapDrugBankSeverity(interaction.severity),
              description: interaction.description,
              source: 'DrugBank',
              confidence: 0.9
            });
          });
        }
        break;
    }
  } catch (parseError) {
    console.warn(`Failed to parse ${provider} response:`, parseError);
  }
  
  return results;
}

/**
 * Classify severity from various API formats
 */
function classifySeverity(value: string | number): 'HIGH' | 'MODERATE' | 'LOW' {
  const val = String(value).toLowerCase();
  
  if (val.includes('serious') || val.includes('severe') || val.includes('high') || val === '1') {
    return 'HIGH';
  } else if (val.includes('moderate') || val.includes('medium') || val === '2') {
    return 'MODERATE';
  } else {
    return 'LOW';
  }
}

/**
 * Map RxNorm severity to our format
 */
function mapRxNormSeverity(severity: string): 'HIGH' | 'MODERATE' | 'LOW' {
  switch (severity?.toLowerCase()) {
    case 'high':
    case 'major':
      return 'HIGH';
    case 'moderate':
      return 'MODERATE';
    case 'minor':
    case 'low':
    default:
      return 'LOW';
  }
}

/**
 * Map DrugBank severity to our format
 */
function mapDrugBankSeverity(severity: string): 'HIGH' | 'MODERATE' | 'LOW' {
  switch (severity?.toLowerCase()) {
    case 'major':
    case 'contraindicated':
      return 'HIGH';
    case 'moderate':
      return 'MODERATE';
    case 'minor':
    default:
      return 'LOW';
  }
}

/**
 * Merge local and API results
 */
export function mergeInteractionResults(
  localResults: any[],
  apiResults: ApiInteractionResult[]
): any[] {
  const merged = [...localResults];
  const localMedPairs = new Set(
    localResults.map(r => `${r.medication}+${r.primary}`.toLowerCase())
  );

  // Add unique API results
  apiResults.forEach(apiResult => {
    const pairKey = `${apiResult.medication1}+${apiResult.medication2}`.toLowerCase();
    const reversePairKey = `${apiResult.medication2}+${apiResult.medication1}`.toLowerCase();
    
    if (!localMedPairs.has(pairKey) && !localMedPairs.has(reversePairKey)) {
      merged.push({
        medication: apiResult.medication1,
        primary: apiResult.medication2,
        severity: apiResult.severity,
        severityLabel: getSeverityLabel(apiResult.severity),
        rationale: apiResult.description,
        recommended_action: 'Review interaction with healthcare provider',
        source: `API: ${apiResult.source}`,
        match_type: 'api',
        confidence: apiResult.confidence
      });
    }
  });

  // Sort by severity score
  return merged.sort((a, b) => {
    const scoreMap = { HIGH: 4, MAJOR: 3, MODERATE: 2, MINOR: 1, LOW: 1 };
    return (scoreMap[b.severity] || 0) - (scoreMap[a.severity] || 0);
  });
}

function getSeverityLabel(severity: string): string {
  const labels = {
    'HIGH': 'Critical',
    'MODERATE': 'Moderate',
    'LOW': 'Minor'
  };
  return labels[severity] || severity;
}