import { create } from 'zustand';

export interface PatientData {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
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

interface AssessmentStoreSimple {
  currentPatient: Partial<PatientData> | null;
  patients: PatientData[];
  
  // Actions
  setCurrentPatient: (patient: Partial<PatientData>) => void;
  updateCurrentPatient: (updates: Partial<PatientData>) => void;
  savePatient: () => void;
  loadPatients: () => void;
  deletePatient: (patientId: string) => void;
}

// 🔧 SIMPLIFIED STORE - NO PERSISTENCE FOR DEBUGGING
const useAssessmentStoreSimple = create<AssessmentStoreSimple>((set, get) => ({
  currentPatient: null,
  patients: [
    // Add dummy data for testing
    {
      id: '1',
      name: 'Test Patient 1',
      age: 52,
      height: 165,
      weight: 65,
      bmi: 23.9,
      menopausalStatus: 'postmenopausal',
      hysterectomy: false,
      oophorectomy: false,
      hotFlushes: 7,
      nightSweats: 6,
      sleepDisturbance: 5,
      vaginalDryness: 4,
      moodChanges: 6,
      jointAches: 3,
      familyHistoryBreastCancer: false,
      familyHistoryOvarian: false,
      personalHistoryBreastCancer: false,
      personalHistoryDVT: false,
      thrombophilia: false,
      smoking: false,
      diabetes: false,
      hypertension: false,
      cholesterolHigh: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  setCurrentPatient: (patient) => {
    console.log("🔍 Simple Store: setCurrentPatient called");
    set({ currentPatient: patient });
  },

  updateCurrentPatient: (updates) => {
    console.log("🔍 Simple Store: updateCurrentPatient called");
    const current = get().currentPatient;
    if (current) {
      const updated = { ...current, ...updates };
      set({ currentPatient: updated });
    }
  },

  savePatient: () => {
    console.log("🔍 Simple Store: savePatient called - NO PERSISTENCE");
    // Just log, don't save to storage
  },

  loadPatients: () => {
    console.log("🔍 Simple Store: loadPatients called - NO PERSISTENCE");
    // Do nothing, patients are already in state
  },

  deletePatient: (patientId: string) => {
    console.log("🔍 Simple Store: deletePatient called:", patientId);
    const patients = get().patients.filter(p => p.id !== patientId);
    set({ patients });
  },
}));

export { useAssessmentStoreSimple };
export default useAssessmentStoreSimple;