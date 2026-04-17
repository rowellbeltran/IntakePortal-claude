export interface Patient {
  id: number; guid?: string; name: string; mrn: string; date: string; provider: string;
  nurse: string; stage: string; status: string; exception: string; readiness: number;
}
export interface Visit { type: string; date: string; provider: string; }
export interface ReconcilableItem { reconciled: string[]; unreconciled: string[]; }
export interface ImmunizationItem { name: string; date: string; administeredBy: string; }
export interface ImmunizationRecord { reconciled: ImmunizationItem[]; unreconciled: ImmunizationItem[]; }
export interface CareGap { name: string; lastPerformed: string; nextDueDate: string; }
export interface ScreeningLab { test: string; facility: string; date: string; }
export interface PatientDetail {
  visits: Visit[]; allergies: ReconcilableItem; medications: ReconcilableItem;
  immunizations: ImmunizationRecord; careGaps: CareGap[]; screeningsAndLabs: ScreeningLab[]; nurseSummary: string[]; complaints: string[]; roi: ROI[];
}
export interface ROI { id: number; facility: string; requestedDate: string; status: string; patient?: string; }
export interface VisitToday { id: number; patient: string; time: string; provider: string; nurse: string; status: string; }
export interface WeeklyVisit { week: string; visits: number; aht: number; }
export interface PieChartData { label: string; value: number; color: string; }
export interface RecordsState extends Record<string, boolean | string> {
  behavioralHealth: boolean; emergencyDept: boolean; operativeNotes: boolean;
  providerNotes: boolean; therapyNotes: boolean; otherDocument: string;
}
export interface AdditionalState extends Record<string, boolean | string> {
  allergyList: boolean; immunizations: boolean; medicationList: boolean; labResults: boolean;
  hivLab: boolean; geneticTesting: boolean; pathology: boolean; ekg: boolean;
  radiologyReport: boolean; radiologyImages: boolean; billingInfo: boolean;
}
export interface SubstanceState extends Record<string, boolean | string> {
  assessment: boolean; historyPhysical: boolean; multidisciplinaryNotes: boolean;
  familyParticipation: boolean; questionnaires: boolean; treatmentSummary: boolean;
  treatmentPlans: boolean; other: string;
}
