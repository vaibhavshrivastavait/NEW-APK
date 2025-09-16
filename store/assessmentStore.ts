import { create } from 'zustand';
import crashProofStorage from '../utils/asyncStorageUtils';
import { persist } from 'zustand/middleware';

export interface PatientData {
  id: string;
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  bmi?: number;
  menopausalStatus: 'premenopausal' | 'perimenopausal' | 'postmenopausal';
  hysterectomy: boolean;
  oophorectomy: boolean;
  
  // Symptoms (VAS scores 0-10)
  hotFlushes: number;
  nightSweats: number;
  sleepDisturbance: number;
  vaginalDryness: number;
  moodChanges: number;
  jointAches: number;
  
  // Risk Factors
  familyHistoryBreastCancer: boolean;
  familyHistoryOvarian: boolean;
  personalHistoryBreastCancer: boolean;
  personalHistoryDVT: boolean;
  thrombophilia: boolean;
  smoking: boolean;
  diabetes: boolean;
  hypertension: boolean;
  cholesterolHigh: boolean;
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RiskAssessment {
  patientId: string;
  breastCancerRisk: 'low' | 'medium' | 'high';
  cvdRisk: 'low' | 'moderate' | 'high';
  vteRisk: 'low' | 'moderate' | 'high' | 'very-high';
  overallRisk: 'low' | 'moderate' | 'high';
  calculatedAt: Date;
}

export interface MHTRecommendation {
  patientId: string;
  type: 'ET' | 'EPT' | 'vaginal-only' | 'not-recommended';
  route: 'oral' | 'transdermal' | 'vaginal' | 'none';
  progestogenType?: 'micronized' | 'ius' | 'synthetic';
  rationale: string[];
  followUpSchedule: {
    oneMonth: boolean;
    sixMonths: boolean;
    twelveMonths: boolean;
  };
  generatedAt: Date;
}

export interface FollowUp {
  id: string;
  patientId: string;
  type: '1-month' | '6-month' | '12-month';
  scheduledDate: Date;
  completed: boolean;
  notes?: string;
}

export interface TreatmentPlan {
  id: string;
  timestamp: string;
  rulesetVersion: string;
  patientId: string;
  patientInfo: {
    age: number;
    keyFlags: string[];
  };
  primaryRecommendation: any;
  alternatives: any[];
  safetyFlags: any[];
  contraindications: string[];
  monitoringPlan: any;
  counseling: any;
  clinicalSummary: string;
  chartDocumentation: string;
  inputsSnapshot: any;
  triggeredRules: string[];
  disclaimer: string;
  acceptanceStatus?: 'pending' | 'accepted' | 'deferred' | 'rejected';
  savedAt?: string;
  clinicianNotes?: string;
}

interface AssessmentStore {
  currentPatient: Partial<PatientData> | null;
  patients: PatientData[];
  assessments: RiskAssessment[];
  recommendations: MHTRecommendation[];
  followUps: FollowUp[];
  savedTreatmentPlans: TreatmentPlan[];
  
  // Actions
  setCurrentPatient: (patient: Partial<PatientData>) => void;
  updateCurrentPatient: (updates: Partial<PatientData>) => void;
  savePatient: () => void;
  loadPatients: () => void;
  deletePatient: (patientId: string) => void;
  deleteAllPatients: () => void;
  
  // Treatment Plan functions
  saveTreatmentPlan: (plan: TreatmentPlan) => void;
  loadTreatmentPlans: () => TreatmentPlan[];
  deleteTreatmentPlan: (planId: string) => void;
  calculateBMI: () => void;
  
  // Risk Assessment
  calculateRisks: (patientId: string) => RiskAssessment;
  generateRecommendation: (patientId: string, risks: RiskAssessment) => MHTRecommendation;
  
  // Follow-ups
  scheduleFollowUps: (patientId: string, schedule: any) => void;
  completeFollowUp: (followUpId: string, notes?: string) => void;
}

const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      currentPatient: null,
      patients: [],
      assessments: [],
      recommendations: [],
      followUps: [],
      savedTreatmentPlans: [],

      setCurrentPatient: (patient) => {
        set({ currentPatient: patient });
      },

      updateCurrentPatient: (updates) => {
        const current = get().currentPatient;
        if (current) {
          const updated = { ...current, ...updates };
          // Auto-calculate BMI if height and weight are provided
          if (updated.height && updated.weight) {
            const heightInMeters = updated.height / 100;
            updated.bmi = updated.weight / (heightInMeters * heightInMeters);
          }
          set({ currentPatient: updated });
        }
      },

      calculateBMI: () => {
        const patient = get().currentPatient;
        if (patient && patient.height && patient.weight) {
          const heightInMeters = patient.height / 100;
          const bmi = patient.weight / (heightInMeters * heightInMeters);
          get().updateCurrentPatient({ bmi });
        }
      },

      savePatient: () => {
        const current = get().currentPatient;
        if (current && current.name && current.age) {
          const patient: PatientData = {
            id: current.id || Date.now().toString(),
            name: current.name,
            age: current.age,
            height: current.height || 0,
            weight: current.weight || 0,
            bmi: current.bmi,
            menopausalStatus: current.menopausalStatus || 'postmenopausal',
            hysterectomy: current.hysterectomy || false,
            oophorectomy: current.oophorectomy || false,
            hotFlushes: current.hotFlushes || 0,
            nightSweats: current.nightSweats || 0,
            sleepDisturbance: current.sleepDisturbance || 0,
            vaginalDryness: current.vaginalDryness || 0,
            moodChanges: current.moodChanges || 0,
            jointAches: current.jointAches || 0,
            familyHistoryBreastCancer: current.familyHistoryBreastCancer || false,
            familyHistoryOvarian: current.familyHistoryOvarian || false,
            personalHistoryBreastCancer: current.personalHistoryBreastCancer || false,
            personalHistoryDVT: current.personalHistoryDVT || false,
            thrombophilia: current.thrombophilia || false,
            smoking: current.smoking || false,
            diabetes: current.diabetes || false,
            hypertension: current.hypertension || false,
            cholesterolHigh: current.cholesterolHigh || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const patients = get().patients.filter(p => p.id !== patient.id);
          set({ patients: [...patients, patient] });
        }
      },

      loadPatients: () => {
        // Patients are automatically loaded via persist
      },

      deletePatient: (patientId: string) => {
        const patients = get().patients.filter(p => p.id !== patientId);
        set({ patients });
      },

      deleteAllPatients: () => {
        set({ patients: [] });
      },

      // Treatment Plan functions
      saveTreatmentPlan: (plan: TreatmentPlan) => {
        const existingPlans = get().savedTreatmentPlans;
        const updatedPlans = existingPlans.filter(p => p.id !== plan.id);
        set({ savedTreatmentPlans: [...updatedPlans, plan] });
      },

      loadTreatmentPlans: () => {
        // Plans are automatically loaded via persist
        return get().savedTreatmentPlans;
      },

      deleteTreatmentPlan: (planId: string) => {
        const plans = get().savedTreatmentPlans.filter(p => p.id !== planId);
        set({ savedTreatmentPlans: plans });
      },

      calculateRisks: (patientId: string): RiskAssessment => {
        const patient = get().patients.find(p => p.id === patientId);
        if (!patient) throw new Error('Patient not found');

        // Breast Cancer Risk Calculation
        let breastCancerScore = 0;
        if (patient.age > 50) breastCancerScore += 1;
        if (patient.age > 60) breastCancerScore += 1;
        if (patient.familyHistoryBreastCancer) breastCancerScore += 2;
        if (patient.personalHistoryBreastCancer) breastCancerScore += 3;
        if (patient.bmi && patient.bmi > 30) breastCancerScore += 1;
        
        const breastCancerRisk = breastCancerScore >= 3 ? 'high' : breastCancerScore >= 2 ? 'medium' : 'low';

        // CVD Risk (simplified QRISK/ASCVD)
        let cvdScore = 0;
        if (patient.age > 55) cvdScore += 1;
        if (patient.age > 65) cvdScore += 1;
        if (patient.smoking) cvdScore += 2;
        if (patient.diabetes) cvdScore += 2;
        if (patient.hypertension) cvdScore += 1;
        if (patient.cholesterolHigh) cvdScore += 1;
        if (patient.bmi && patient.bmi > 30) cvdScore += 1;

        const cvdRisk = cvdScore >= 4 ? 'high' : cvdScore >= 2 ? 'moderate' : 'low';

        // VTE Risk
        let vteScore = 0;
        if (patient.personalHistoryDVT) vteScore += 4;
        if (patient.thrombophilia) vteScore += 3;
        if (patient.bmi && patient.bmi > 30) vteScore += 1;
        if (patient.smoking) vteScore += 1;
        if (patient.age > 60) vteScore += 1;

        const vteRisk = vteScore >= 4 ? 'very-high' : vteScore >= 3 ? 'high' : vteScore >= 2 ? 'moderate' : 'low';

        // Overall Risk
        const risks = [breastCancerRisk, cvdRisk, vteRisk];
        const overallRisk = risks.includes('high') || vteRisk === 'very-high' ? 'high' : 
                           risks.includes('medium') || risks.includes('moderate') ? 'moderate' : 'low';

        const assessment: RiskAssessment = {
          patientId,
          breastCancerRisk,
          cvdRisk,
          vteRisk,
          overallRisk,
          calculatedAt: new Date(),
        };

        const assessments = get().assessments.filter(a => a.patientId !== patientId);
        set({ assessments: [...assessments, assessment] });

        return assessment;
      },

      generateRecommendation: (patientId: string, risks: RiskAssessment): MHTRecommendation => {
        const patient = get().patients.find(p => p.id === patientId);
        if (!patient) throw new Error('Patient not found');

        let type: 'ET' | 'EPT' | 'vaginal-only' | 'not-recommended' = 'not-recommended';
        let route: 'oral' | 'transdermal' | 'vaginal' | 'none' = 'none';
        let progestogenType: 'micronized' | 'ius' | 'synthetic' | undefined;
        const rationale: string[] = [];

        // Determine MHT type
        if (risks.overallRisk === 'high' || risks.vteRisk === 'very-high') {
          if (patient.vaginalDryness >= 6 && patient.hotFlushes < 4) {
            type = 'vaginal-only';
            route = 'vaginal';
            rationale.push('High systemic risk - vaginal therapy only for genitourinary symptoms');
          } else {
            type = 'not-recommended';
            rationale.push('High overall risk profile contraindicates systemic MHT');
          }
        } else {
          if (patient.hysterectomy) {
            type = 'ET';
            rationale.push('Estrogen-only therapy appropriate post-hysterectomy');
          } else {
            type = 'EPT';
            progestogenType = 'micronized';
            rationale.push('Combined therapy with progestogen protection for intact uterus');
          }
        }

        // Determine route
        if (type !== 'not-recommended' && type !== 'vaginal-only') {
          if (risks.cvdRisk === 'high' || risks.vteRisk === 'high' || risks.vteRisk === 'moderate') {
            route = 'transdermal';
            rationale.push('Transdermal route preferred due to CVD/VTE risk factors');
          } else {
            route = 'oral';
            rationale.push('Oral route appropriate with low CVD/VTE risk');
          }
        }

        const recommendation: MHTRecommendation = {
          patientId,
          type,
          route,
          progestogenType,
          rationale,
          followUpSchedule: {
            oneMonth: true,
            sixMonths: true,
            twelveMonths: true,
          },
          generatedAt: new Date(),
        };

        const recommendations = get().recommendations.filter(r => r.patientId !== patientId);
        set({ recommendations: [...recommendations, recommendation] });

        return recommendation;
      },

      scheduleFollowUps: (patientId: string, schedule: any) => {
        const followUps: FollowUp[] = [];
        const now = new Date();
        
        if (schedule.oneMonth) {
          const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          followUps.push({
            id: `${patientId}-1month-${Date.now()}`,
            patientId,
            type: '1-month',
            scheduledDate: oneMonth,
            completed: false,
          });
        }

        if (schedule.sixMonths) {
          const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
          followUps.push({
            id: `${patientId}-6month-${Date.now()}`,
            patientId,
            type: '6-month',
            scheduledDate: sixMonths,
            completed: false,
          });
        }

        if (schedule.twelveMonths) {
          const twelveMonths = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          followUps.push({
            id: `${patientId}-12month-${Date.now()}`,
            patientId,
            type: '12-month',
            scheduledDate: twelveMonths,
            completed: false,
          });
        }

        const existingFollowUps = get().followUps.filter(f => f.patientId !== patientId);
        set({ followUps: [...existingFollowUps, ...followUps] });
      },

      completeFollowUp: (followUpId: string, notes?: string) => {
        const followUps = get().followUps.map(f =>
          f.id === followUpId ? { ...f, completed: true, notes } : f
        );
        set({ followUps });
      },
    }),
    {
      name: 'mht-assessment-storage',
      storage: {
        getItem: async (name) => {
          try {
            // Additional safety check for crashProofStorage availability
            if (!crashProofStorage || typeof crashProofStorage.getItem !== 'function') {
              console.warn('crashProofStorage not available during getItem, returning empty state');
              return null;
            }

            const isAvailable = await crashProofStorage.isAvailable();
            if (!isAvailable) {
              console.warn('AsyncStorage not available, returning empty state');
              return null;
            }

            const value = await crashProofStorage.getItem(name);
            if (!value) return null;
            
            const parsed = JSON.parse(value);
            
            // Convert date strings back to Date objects for patients
            if (parsed?.state?.patients) {
              parsed.state.patients = parsed.state.patients.map((patient: any) => ({
                ...patient,
                createdAt: patient.createdAt ? new Date(patient.createdAt) : new Date(),
                updatedAt: patient.updatedAt ? new Date(patient.updatedAt) : new Date(),
              }));
            }
            
            // Handle follow-ups dates
            if (parsed?.state?.followUps) {
              parsed.state.followUps = parsed.state.followUps.map((followUp: any) => ({
                ...followUp,
                scheduledDate: followUp.scheduledDate ? new Date(followUp.scheduledDate) : new Date(),
              }));
            }
            
            // Handle assessments dates
            if (parsed?.state?.assessments) {
              parsed.state.assessments = parsed.state.assessments.map((assessment: any) => ({
                ...assessment,
                calculatedAt: assessment.calculatedAt ? new Date(assessment.calculatedAt) : new Date(),
              }));
            }
            
            return parsed;
          } catch (error) {
            console.error('Error parsing stored data:', error);
            // Return a default state instead of null to prevent crashes
            return {
              state: {
                currentPatient: null,
                patients: [],
                assessments: [],
                recommendations: [],
                followUps: [],
                savedTreatmentPlans: [],
              },
              version: 0,
            };
          }
        },
        setItem: async (name, value) => {
          try {
            // Additional safety check for crashProofStorage availability
            if (!crashProofStorage || typeof crashProofStorage.setItem !== 'function') {
              console.warn('crashProofStorage not available during setItem, cannot save data');
              return;
            }

            const isAvailable = await crashProofStorage.isAvailable();
            if (!isAvailable) {
              console.warn('AsyncStorage not available, cannot save data');
              return;
            }
            await crashProofStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Error saving data to storage:', error);
            // Don't throw error, just log it to prevent app crashes
          }
        },
        removeItem: async (name) => {
          try {
            const isAvailable = await crashProofStorage.isAvailable();
            if (!isAvailable) {
              console.warn('AsyncStorage not available, cannot remove data');
              return;
            }
            await crashProofStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing data from storage:', error);
            // Don't throw error, just log it to prevent app crashes
          }
        },
      },
      // Add error handling and recovery options
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating store:', error);
            // Initialize with default values if rehydration fails
            return {
              currentPatient: null,
              patients: [],
              assessments: [],
              recommendations: [],
              followUps: [],
              savedTreatmentPlans: [],
            };
          }
          return state;
        };
      },
      skipHydration: false,
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle version migrations if needed
        if (version === 0) {
          // Migrate from version 0 to 1
          return {
            ...persistedState,
            patients: persistedState.patients || [],
            assessments: persistedState.assessments || [],
            recommendations: persistedState.recommendations || [],
            followUps: persistedState.followUps || [],
            savedTreatmentPlans: persistedState.savedTreatmentPlans || [],
          };
        }
        return persistedState;
      },
    }
  )
);

// Export both as named export and default export for compatibility
export { useAssessmentStore };
export default useAssessmentStore;