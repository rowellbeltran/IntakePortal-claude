import React, { useState } from "react";
import { Tasks, TaskPriority, type TaskGetResponse } from "@uipath/uipath-typescript/tasks";
import { useAuth, type AuthState } from "./hooks/useAuth";
import { usePolling } from "./hooks/usePolling";
import { sdk, ENV, isConfigured } from "./lib/sdk";
// ============ TYPES ============
interface Patient {
  id: number; name: string; mrn: string; date: string; provider: string;
  nurse: string; stage: string; status: string; exception: string; readiness: number;
}
interface Visit { type: string; date: string; provider: string; }
interface ReconcilableItem { reconciled: string[]; unreconciled: string[]; }
interface CareGap { name: string; lastPerformed: string; nextDueDate: string; }
interface ScreeningLab { test: string; facility: string; date: string; }
interface PatientDetail {
  visits: Visit[]; allergies: ReconcilableItem; medications: ReconcilableItem;
  immunizations: ReconcilableItem; careGaps: CareGap[]; screeningsAndLabs: ScreeningLab[]; nurseSummary: string[]; complaints: string[]; roi: ROI[];
}
interface ROI { id: number; facility: string; requestedDate: string; status: string; patient?: string; }
interface VisitToday { id: number; patient: string; time: string; provider: string; nurse: string; status: string; }
interface WeeklyVisit { week: string; visits: number; aht: number; }
interface PieChartData { label: string; value: number; color: string; }
interface RecordsState extends Record<string, boolean | string> {
  behavioralHealth: boolean; emergencyDept: boolean; operativeNotes: boolean;
  providerNotes: boolean; therapyNotes: boolean; otherDocument: string;
}
interface AdditionalState extends Record<string, boolean | string> {
  allergyList: boolean; immunizations: boolean; medicationList: boolean; labResults: boolean;
  hivLab: boolean; geneticTesting: boolean; pathology: boolean; ekg: boolean;
  radiologyReport: boolean; radiologyImages: boolean; billingInfo: boolean;
}
interface SubstanceState extends Record<string, boolean | string> {
  assessment: boolean; historyPhysical: boolean; multidisciplinaryNotes: boolean;
  familyParticipation: boolean; questionnaires: boolean; treatmentSummary: boolean;
  treatmentPlans: boolean; other: string;
}
// ============ DATA ============
const patients: Patient[] = [
  { id: 1, name: "John Doe", mrn: "MRN-001", date: "2026-04-10", provider: "Dr. Smith", nurse: "Sarah Johnson, RN", stage: "Data Prepared", status: "New", exception: "None", readiness: 25 },
  { id: 2, name: "Jane Roe", mrn: "MRN-002", date: "2026-04-11", provider: "Dr. Adams", nurse: "Michael Chen, RN", stage: "Data Validated", status: "In Progress", exception: "Missing Labs", readiness: 60 },
  { id: 3, name: "Michael Lee", mrn: "MRN-003", date: "2026-04-05", provider: "Dr. Brown", nurse: "Emily Rodriguez, RN", stage: "Data Prepared", status: "New", exception: "None", readiness: 45 },
  { id: 4, name: "Sarah Johnson", mrn: "MRN-004", date: "2026-04-12", provider: "Dr. Wilson", nurse: "James Patterson, RN", stage: "Data Validated", status: "In Progress", exception: "Insurance Verification", readiness: 55 },
  { id: 5, name: "Robert Martinez", mrn: "MRN-005", date: "2026-04-13", provider: "Dr. Garcia", nurse: "Lisa Wong, RN", stage: "Data Validated", status: "In Progress", exception: "None", readiness: 75 },
  { id: 6, name: "Emily Chen", mrn: "MRN-006", date: "2026-04-14", provider: "Dr. Taylor", nurse: "David Kumar, RN", stage: "Patient Record Updated", status: "In Progress", exception: "Pending Approval", readiness: 50 },
  { id: 7, name: "David Thompson", mrn: "MRN-007", date: "2026-04-15", provider: "Dr. Anderson", nurse: "Jennifer Lee, RN", stage: "Data Prepared", status: "New", exception: "None", readiness: 20 },
  { id: 8, name: "Lisa Anderson", mrn: "MRN-008", date: "2026-04-16", provider: "Dr. Martinez", nurse: "Robert Thompson, RN", stage: "Data Validated", status: "In Progress", exception: "Lab Results Pending", readiness: 65 },
  { id: 9, name: "Kevin Wilson", mrn: "MRN-017", date: "2026-04-17", provider: "Dr. Harris", nurse: "Sarah Johnson, RN", stage: "Data Prepared", status: "New", exception: "None", readiness: 30 },
  { id: 10, name: "Patricia Brown", mrn: "MRN-018", date: "2026-04-18", provider: "Dr. Clark", nurse: "Michael Chen, RN", stage: "Data Validated", status: "In Progress", exception: "Insurance Pending", readiness: 55 },
  { id: 11, name: "James Wilson", mrn: "MRN-009", date: "2026-04-04", provider: "Dr. Harris", nurse: "Sarah Johnson, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 12, name: "Patricia Moore", mrn: "MRN-010", date: "2026-04-03", provider: "Dr. Clark", nurse: "Michael Chen, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 13, name: "Christopher Davis", mrn: "MRN-011", date: "2026-04-02", provider: "Dr. Lewis", nurse: "Emily Rodriguez, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 14, name: "Jennifer Martinez", mrn: "MRN-012", date: "2026-04-01", provider: "Dr. Walker", nurse: "James Patterson, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 15, name: "Daniel Rodriguez", mrn: "MRN-013", date: "2026-03-31", provider: "Dr. Young", nurse: "Lisa Wong, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 16, name: "Maria Garcia", mrn: "MRN-014", date: "2026-03-30", provider: "Dr. Hernandez", nurse: "David Kumar, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 17, name: "Thomas Anderson", mrn: "MRN-015", date: "2026-03-29", provider: "Dr. Lopez", nurse: "Jennifer Lee, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 18, name: "Angela Thomas", mrn: "MRN-016", date: "2026-03-28", provider: "Dr. Martinez", nurse: "Robert Thompson, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 }
];
const defaultDetails: PatientDetail = {
  visits: [], allergies: { reconciled: [], unreconciled: [] }, medications: { reconciled: [], unreconciled: [] },
  immunizations: { reconciled: [], unreconciled: [] }, careGaps: [], screeningsAndLabs: [], nurseSummary: ["No intake data available."], complaints: [], roi: []
};
const patientDetails: Record<number, PatientDetail> = {
  1: {
    visits: [{ type: "Pulmonary", date: "2025-12-01", provider: "Dr. Smith" }, { type: "Cardiology", date: "2025-11-15", provider: "Dr. Patel" }, { type: "General Checkup", date: "2025-10-20", provider: "Dr. Smith" }],
    allergies: { reconciled: ["Peanuts", "Latex", "Sulfa"], unreconciled: ["Penicillin", "Shellfish"] },
    medications: { reconciled: ["Metformin", "Atorvastatin"], unreconciled: ["Lisinopril", "Aspirin"] },
    immunizations: { reconciled: ["Flu Shot", "Pneumonia"], unreconciled: ["COVID Booster", "Shingles"] },
    careGaps: [{ name: "Annual Physical", lastPerformed: "2024-03-10", nextDueDate: "2026-03-10" }, { name: "Blood Pressure Check", lastPerformed: "2025-01-22", nextDueDate: "2026-01-22" }, { name: "Cholesterol Screening", lastPerformed: "2024-08-15", nextDueDate: "2026-05-20" }],
    screeningsAndLabs: [
      { test: "Blood Pressure", facility: "Main Clinic", date: "2026-02-10" },
      { test: "CBC", facility: "Main Clinic", date: "2025-09-05" },
      { test: "Cholesterol Panel", facility: "Lab Corp", date: "2025-04-18" },
      { test: "Blood Pressure", facility: "Main Clinic", date: "2024-11-20" },
      { test: "HbA1c", facility: "Lab Corp", date: "2024-06-12" },
    ],
    nurseSummary: [
      "Meds: Pt. states taking Metformin + Atorvastatin as prescribed. Lisinopril + Aspirin unreconciled — unable to confirm; follow up with PCP.",
      "Allergies: Penicillin + Shellfish reported unverified — pt. confirmed allergic to both. Chart updated.",
      "Vitals: BP 138/86 at intake — slightly elevated, flagged for provider. HR 74, Temp 98.4°F.",
      "Vaccines: COVID Booster + Shingles not yet received per pt. — referral to pharmacy placed.",
      "Care Gaps: Annual Physical overdue since 03/2024 — pt. unaware; PCP referral placed. BP check completed today.",
      "Pt. denies chest pain or SOB today. C/o mild bilateral ankle swelling x2 wks — noted for provider review.",
    ],
    complaints: [
      "Bilateral ankle swelling x2 weeks, pitting noted on left > right",
      "Exertional shortness of breath — occurs with climbing >1 flight of stairs",
      "Afternoon fatigue, difficulty completing ADLs by mid-day",
      "Occasional mild chest tightness at rest — denies radiation to arm/jaw",
    ],
    roi: [
      { id: 1, facility: "General Hospital", requestedDate: "2026-04-08", status: "Signature Pending" },
      { id: 2, facility: "City Clinic", requestedDate: "2026-04-07", status: "Sent to Facility" }
    ]
  },
  2: {
    visits: [{ type: "Cardiology", date: "2025-11-15", provider: "Dr. Adams" }, { type: "General Checkup", date: "2025-10-20", provider: "Dr. Adams" }, { type: "Dermatology", date: "2025-09-10", provider: "Dr. Lee" }],
    allergies: { reconciled: ["Sulfa", "NSAIDs"], unreconciled: ["Latex", "Penicillin"] },
    medications: { reconciled: ["Atorvastatin", "Ibuprofen"], unreconciled: ["Aspirin", "Metformin"] },
    immunizations: { reconciled: ["Pneumonia", "Flu Shot"], unreconciled: ["Shingles", "COVID Booster"] },
    careGaps: [{ name: "Blood Pressure Check", lastPerformed: "2025-02-10", nextDueDate: "2026-02-10" }, { name: "Cholesterol Screening", lastPerformed: "2024-07-18", nextDueDate: "2026-05-10" }, { name: "Skin Cancer Screening", lastPerformed: "2023-11-05", nextDueDate: "2026-05-01" }],
    screeningsAndLabs: [
      { test: "Lipid Panel", facility: "Heart Center", date: "2026-01-14" },
      { test: "Blood Pressure", facility: "Main Clinic", date: "2025-08-22" },
      { test: "ECG", facility: "Heart Center", date: "2025-03-09" },
      { test: "Cholesterol Panel", facility: "Lab Corp", date: "2024-09-30" },
      { test: "Blood Pressure", facility: "Main Clinic", date: "2024-05-17" },
    ],
    nurseSummary: [
      "Meds: Atorvastatin + Ibuprofen active. ⚠ Pt. has NSAIDs allergy — confirmed NOT taking Ibuprofen; flagged for provider. Aspirin + Metformin unreconciled.",
      "Allergies: Latex + Penicillin unverified — pt. reports h/o mild rash with Penicillin. Latex sensitivity noted, gloves changed. Chart updated.",
      "Vitals: BP 126/82 — within baseline. HR 68, Temp 98.2°F.",
      "Vaccines: Shingles + COVID Booster not received per pt. — scheduled at next pharmacy visit.",
      "Care Gaps: BP check completed today. Skin Cancer Screening due 05/2026 — pt. denies new lesions; referred to Dermatology.",
      "Pt. c/o intermittent palpitations x1 wk, no dizziness. Denies skin changes. Noted for cardiology review.",
    ],
    complaints: [
      "Intermittent heart palpitations x1 week — episodes lasting ~30 seconds, no syncope",
      "New pigmented mole on left forearm, noticed ~3 weeks ago; no bleeding or itching reported",
      "Occasional dizziness on standing from seated position, resolves within seconds",
    ],
    roi: [{ id: 3, facility: "Heart Center", requestedDate: "2026-04-06", status: "Completed" }]
  },
  3: {
    visits: [{ type: "Orthopedic", date: "2025-09-30", provider: "Dr. Brown" }, { type: "Physical Therapy", date: "2025-10-15", provider: "Dr. Brown" }],
    allergies: { reconciled: ["NSAIDs"], unreconciled: ["Sulfa", "Shellfish"] },
    medications: { reconciled: ["Ibuprofen"], unreconciled: ["Metformin", "Atorvastatin"] },
    immunizations: { reconciled: ["Flu Shot", "COVID Booster"], unreconciled: ["Pneumonia"] },
    careGaps: [{ name: "Physical Therapy", lastPerformed: "2025-10-15", nextDueDate: "2026-04-15" }, { name: "Annual Physical", lastPerformed: "2024-06-20", nextDueDate: "2026-06-10" }],
    screeningsAndLabs: [
      { test: "X-Ray (Knee)", facility: "Orthopedic Center", date: "2025-09-30" },
      { test: "CBC", facility: "Main Clinic", date: "2025-05-14" },
      { test: "X-Ray (Knee)", facility: "Orthopedic Center", date: "2024-10-08" },
      { test: "Metabolic Panel", facility: "Lab Corp", date: "2024-06-20" },
    ],
    nurseSummary: [
      "Meds: Ibuprofen active. Metformin + Atorvastatin unreconciled — pt. unsure if still prescribed; will follow up with PCP for clarification.",
      "Allergies: Sulfa + Shellfish unverified — pt. confirmed h/o hives with Sulfa. Shellfish — pt. unsure; documented as unverified.",
      "Vitals: BP 118/76, HR 80, Temp 98.6°F. Pain level 4/10 (right knee).",
      "Vaccines: Pneumonia vaccine not received post-op per pt. — scheduled at next visit.",
      "Care Gaps: PT attendance confirmed — attended 3 of last 4 sessions. Annual Physical due 06/2026 — PCP appointment not yet booked.",
      "Pt. c/o right knee stiffness in AM, improving throughout day. No redness or warmth at surgical site. Home PT exercises done 3x/wk per pt.",
    ],
    complaints: [
      "Right knee pain rated 4/10 at rest, 7/10 with activity; worsens on stair climbing",
      "Morning stiffness lasting ~30 minutes, improving with movement",
      "Difficulty fully extending right knee — limited ROM noted",
      "Mild generalized fatigue following physical therapy sessions",
    ],
    roi: []
  },
  4: {
    visits: [{ type: "General Checkup", date: "2025-10-05", provider: "Dr. Martinez" }, { type: "Neurology", date: "2025-09-20", provider: "Dr. Chen" }],
    allergies: { reconciled: ["Penicillin", "Codeine"], unreconciled: ["Latex"] },
    medications: { reconciled: ["Gabapentin", "Levothyroxine"], unreconciled: ["Sertraline"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia", "Shingles"] },
    careGaps: [{ name: "Thyroid Function Test", lastPerformed: "2024-12-01", nextDueDate: "2026-06-01" }, { name: "Mental Health Screening", lastPerformed: "2024-09-14", nextDueDate: "2026-03-20" }, { name: "Neurological Assessment", lastPerformed: "2025-09-20", nextDueDate: "2026-05-25" }],
    screeningsAndLabs: [
      { test: "TSH (Thyroid)", facility: "Lab Corp", date: "2026-01-08" },
      { test: "Neurological Assessment", facility: "Neurology Clinic", date: "2025-09-20" },
      { test: "TSH (Thyroid)", facility: "Lab Corp", date: "2025-03-15" },
      { test: "CBC", facility: "Main Clinic", date: "2024-10-05" },
      { test: "TSH (Thyroid)", facility: "Lab Corp", date: "2024-06-18" },
    ],
    nurseSummary: [
      "Meds: Gabapentin + Levothyroxine confirmed. Pt. states taking Levothyroxine at 7AM daily. Sertraline unreconciled — pt. states started 2 months ago by PCP; dose unknown.",
      "Allergies: Latex unverified — pt. reports no prior reactions; documented as precautionary. Gloves changed to non-latex.",
      "Vitals: BP 122/78, HR 66, Temp 98.5°F. PHQ-2 score: 2 — PHQ-9 administered; score 7 (mild depression), flagged for provider.",
      "Vaccines: COVID Booster, Pneumonia + Shingles all pending — pt. declined today; documented. Follow up at next visit.",
      "Care Gaps: Mental Health Screening completed today (PHQ-9). Neuro Assessment due 05/2026 — pt. aware; coord. with Dr. Chen.",
      "Pt. c/o fatigue and mild memory lapses x3 wks. Denies headaches or vision changes. Reports 5 lb weight gain over 2 months — noted for thyroid review.",
    ],
    complaints: [
      "Persistent fatigue and low energy x3 weeks — difficulty concentrating at work",
      "Memory lapses — forgetting names and appointments; new onset per pt.",
      "5 lb unintentional weight gain over past 2 months despite no dietary changes",
      "Recurring headaches 2–3x/week, frontal, moderate intensity, relieved with Tylenol",
      "Low mood and decreased motivation — PHQ-9 score 7 (mild) today",
    ],
    roi: [{ id: 4, facility: "Neurology Clinic", requestedDate: "2026-04-05", status: "Signature Pending" }]
  },
  5: {
    visits: [{ type: "Gastroenterology", date: "2025-11-10", provider: "Dr. Nguyen" }, { type: "General Checkup", date: "2025-10-15", provider: "Dr. Nguyen" }],
    allergies: { reconciled: ["Shellfish", "Soy"], unreconciled: ["Nuts", "Sesame"] },
    medications: { reconciled: ["Omeprazole", "Simvastatin"], unreconciled: ["Metformin"] },
    immunizations: { reconciled: ["Pneumonia", "Flu Shot", "COVID Booster"], unreconciled: ["Shingles"] },
    careGaps: [{ name: "Colonoscopy", lastPerformed: "2021-05-12", nextDueDate: "2026-05-12" }, { name: "Liver Function Tests", lastPerformed: "2024-11-03", nextDueDate: "2026-05-03" }, { name: "Dietary Consultation", lastPerformed: "2024-04-28", nextDueDate: "2026-04-28" }],
    screeningsAndLabs: [
      { test: "Liver Function Tests", facility: "GI Specialists", date: "2026-02-20" },
      { test: "H. Pylori Test", facility: "GI Specialists", date: "2025-11-10" },
      { test: "Liver Function Tests", facility: "Lab Corp", date: "2025-05-03" },
      { test: "Lipid Panel", facility: "Lab Corp", date: "2024-10-15" },
    ],
    nurseSummary: [
      "Meds: Omeprazole + Simvastatin confirmed. Metformin unreconciled — pt. states taking 500mg BID; reports mild nausea. Added to reconciled list pending provider sign-off.",
      "Allergies: Nuts + Sesame unverified — pt. reports h/o throat tightening with tree nuts. Sesame unclear. EpiPen at home per pt. Chart flagged.",
      "Vitals: BP 120/74, HR 70, Temp 98.7°F. Wt: 182 lbs (down 4 lbs from last visit).",
      "Vaccines: Shingles pending — pt. eligible; scheduled for next pharmacy visit.",
      "Care Gaps: Colonoscopy overdue — pt. has not had one since 2021; urgent GI Specialists referral placed today. LFTs ordered.",
      "Pt. c/o bloating and reflux 3–4x/wk, worse after dinner. Denies blood in stool. BMs regular. Dietary consult referral placed.",
    ],
    complaints: [
      "Bloating and acid reflux 3–4x/week, worse after evening meals and when lying down",
      "Morning nausea without vomiting x3 weeks; pt. relates to Metformin initiation",
      "Change in bowel habits x6 weeks — alternating loose stools and constipation",
      "Mild epigastric discomfort after meals, rated 3/10",
    ],
    roi: [
      { id: 5, facility: "GI Specialists", requestedDate: "2026-04-04", status: "Sent to Facility" },
      { id: 6, facility: "Lab Services", requestedDate: "2026-04-02", status: "Completed" }
    ]
  },
  6: {
    visits: [{ type: "Rheumatology", date: "2025-11-01", provider: "Dr. Patel" }, { type: "Physical Therapy", date: "2025-10-20", provider: "Dr. Brown" }],
    allergies: { reconciled: ["Aspirin", "NSAIDs"], unreconciled: ["Sulfa"] },
    medications: { reconciled: ["Methotrexate", "Prednisone"], unreconciled: ["Hydroxychloroquine"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia", "Shingles"] },
    careGaps: [{ name: "Blood Work", lastPerformed: "2025-03-05", nextDueDate: "2026-06-05" }, { name: "Rheumatology Follow-up", lastPerformed: "2025-01-15", nextDueDate: "2026-03-15" }, { name: "Joint Assessment", lastPerformed: "2024-10-20", nextDueDate: "2026-04-20" }],
    screeningsAndLabs: [
      { test: "CBC / Metabolic Panel", facility: "Lab Corp", date: "2026-03-05" },
      { test: "CRP / ESR", facility: "Rheumatology Center", date: "2025-10-12" },
      { test: "CBC / Metabolic Panel", facility: "Lab Corp", date: "2025-04-28" },
      { test: "CRP / ESR", facility: "Rheumatology Center", date: "2024-11-01" },
      { test: "CBC / Metabolic Panel", facility: "Lab Corp", date: "2024-05-22" },
    ],
    nurseSummary: [
      "Meds: Methotrexate + Prednisone confirmed. Pt. denies mouth sores or easy bruising. Reports mild nausea 1–2x/wk after Methotrexate. Hydroxychloroquine unreconciled — pt. states starting next week per rheumatologist.",
      "Allergies: Sulfa unverified — pt. confirmed h/o rash. ⚠ Critical given immunosuppressive therapy — provider alerted.",
      "Vitals: BP 130/82, HR 76, Temp 98.3°F. Morning stiffness reported: ~45 min bilat. hands + wrists.",
      "Vaccines: ⚠ COVID Booster, Pneumonia + Shingles pending — live vaccines contraindicated w/ Methotrexate; provider must approve before scheduling.",
      "Care Gaps: Rheumatology F/U overdue — pt. states appt. canceled 3/2026; rescheduling in progress. Joint Assessment performed today; ROM limited at wrists bilat.",
      "Pt. c/o increased joint pain over past 2 wks. Denies vision changes or light sensitivity. Ophthalmology screen (Hydroxychloroquine) not yet scheduled — noted.",
    ],
    complaints: [
      "Bilateral wrist and hand joint pain — rated 5/10 at rest, worsening with gripping",
      "Morning stiffness in hands and wrists lasting approximately 45 minutes daily",
      "Generalized fatigue x2 weeks — pt. reports difficulty completing household tasks",
      "Nausea 1–2x/week following Methotrexate dose on Mondays",
    ],
    roi: [{ id: 7, facility: "Rheumatology Center", requestedDate: "2026-04-08", status: "Signature Pending" }]
  },
  7: {
    visits: [{ type: "Pulmonary", date: "2025-12-10", provider: "Dr. Smith" }, { type: "Sleep Medicine", date: "2025-11-25", provider: "Dr. Lee" }],
    allergies: { reconciled: ["Tree Nuts"], unreconciled: ["Shellfish", "Fish"] },
    medications: { reconciled: ["Albuterol", "Fluticasone"], unreconciled: ["Montelukast"] },
    immunizations: { reconciled: ["Flu Shot", "Pneumonia", "COVID Booster"], unreconciled: ["Shingles"] },
    careGaps: [{ name: "Pulmonary Function Test", lastPerformed: "2025-06-18", nextDueDate: "2026-06-10" }, { name: "Sleep Study", lastPerformed: "2024-03-22", nextDueDate: "2026-03-22" }, { name: "Oxygen Saturation Monitoring", lastPerformed: "2025-11-25", nextDueDate: "2026-02-28" }],
    screeningsAndLabs: [
      { test: "Pulmonary Function Test", facility: "Pulmonology Associates", date: "2025-12-10" },
      { test: "Oxygen Saturation", facility: "Main Clinic", date: "2025-06-18" },
      { test: "Chest X-Ray", facility: "Pulmonology Associates", date: "2025-01-30" },
      { test: "Pulmonary Function Test", facility: "Pulmonology Associates", date: "2024-07-09" },
    ],
    nurseSummary: [
      "Meds: Albuterol + Fluticasone confirmed. Inhaler technique reviewed — pt. demonstrated correct use. Montelukast unreconciled — pt. states taking 10mg QD per pulmonologist.",
      "Allergies: Shellfish + Fish unverified — pt. reports h/o hives with shellfish; fish unclear. Chart flagged. Non-latex gloves used.",
      "Vitals: BP 118/74, HR 82, Temp 98.5°F. SpO2: 96% on RA — within acceptable range, noted.",
      "Vaccines: Shingles pending — scheduled for next visit.",
      "Care Gaps: Sleep Study overdue — pt. stopped CPAP 6 months ago; still symptomatic (snoring, daytime fatigue). Referral to Sleep Medicine placed. O2 Sat monitored today.",
      "Pt. c/o nighttime coughing 3–4x/wk and exertional SOB. Denies recent ER visits or oral steroids. No respiratory infections since last visit. PFT due 06/2026 — pt. aware.",
    ],
    complaints: [
      "Nighttime coughing episodes 3–4x/week, worse in early morning; disrupts sleep",
      "Exertional shortness of breath — onset after walking >1 city block",
      "Daytime fatigue — pt. falling asleep at desk; correlates with poor nighttime sleep",
      "Loud snoring with witnessed apnea episodes per bed partner; stopped CPAP 6 months ago",
    ],
    roi: [{ id: 8, facility: "Pulmonology Associates", requestedDate: "2026-04-07", status: "Sent to Facility" }]
  },
  8: {
    visits: [{ type: "Oncology", date: "2025-10-30", provider: "Dr. Chen" }, { type: "General Checkup", date: "2025-10-15", provider: "Dr. Martinez" }],
    allergies: { reconciled: ["Contrast Dye", "Latex"], unreconciled: ["Chemotherapy agents"] },
    medications: { reconciled: ["Tamoxifen", "Loratadine"], unreconciled: ["Vitamin D supplement"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia"] },
    careGaps: [{ name: "Oncology Follow-up", lastPerformed: "2025-10-30", nextDueDate: "2026-04-30" }, { name: "Mammography", lastPerformed: "2024-08-09", nextDueDate: "2026-02-15" }, { name: "Tumor Markers", lastPerformed: "2025-09-15", nextDueDate: "2026-03-15" }, { name: "Bone Density Scan", lastPerformed: "2023-12-01", nextDueDate: "2026-05-15" }],
    screeningsAndLabs: [
      { test: "Tumor Markers (CA 15-3)", facility: "Cancer Center", date: "2026-02-15" },
      { test: "Mammography", facility: "Imaging Center", date: "2025-08-09" },
      { test: "Tumor Markers (CA 15-3)", facility: "Cancer Center", date: "2025-03-20" },
      { test: "Bone Density Scan", facility: "Imaging Center", date: "2024-12-01" },
      { test: "CBC / Metabolic Panel", facility: "Lab Corp", date: "2024-07-11" },
    ],
    nurseSummary: [
      "Meds: Tamoxifen + Loratadine confirmed. Pt. reports hot flashes daily and AM joint stiffness — documented, flagged for provider. Vitamin D supplement unreconciled; pt. states taking 2000 IU OTC.",
      "Allergies: ⚠ Chemotherapy agents allergy unreconciled — critical; provider alerted before any new Rx ordered. Contrast Dye + Latex confirmed, chart updated.",
      "Vitals: BP 124/78, HR 70, Temp 98.4°F. Wt: 164 lbs (stable). Pt. denies leg swelling or unusual vaginal bleeding.",
      "Vaccines: ⚠ COVID Booster + Pneumonia pending — immunosuppressed; vaccination hold confirmed with oncology team.",
      "Care Gaps: Mammography overdue — not done since 08/2024; urgent referral placed to Imaging Center. Tumor Markers (CA 15-3) overdue — labs ordered today.",
      "Pt. c/o increased fatigue x3 wks and decreased appetite. Denies new pain. Oncology F/U confirmed 04/30/2026 at Cancer Center.",
    ],
    complaints: [
      "Increased fatigue x3 weeks — sleeping 10+ hours/night, still exhausted; affecting daily function",
      "Decreased appetite — eating ~50% of usual meals; 3 lb unintentional weight loss in 3 weeks",
      "Daily hot flashes — 4–6 episodes/day, lasting 5–10 minutes; disrupting sleep",
      "AM joint stiffness in hands and knees, lasting ~20 minutes; attributed to Tamoxifen",
      "Mild lower back ache x1 week — rated 2/10, no radiation to legs; noted for oncology review",
    ],
    roi: [
      { id: 9, facility: "Cancer Center", requestedDate: "2026-04-06", status: "Completed" },
      { id: 10, facility: "Imaging Center", requestedDate: "2026-04-05", status: "Signature Pending" }
    ]
  }
};
const stages: string[] = ["Data Prepared", "Data Validated", "Patient Record Updated", "Readiness Evaluated"];
const stageColors: Record<string, string> = {
  "Data Prepared": "#3b82f6",
  "Data Validated": "#06b6d4",
  "Patient Record Updated": "#f59e0b",
  "Readiness Evaluated": "#22c55e"
};
const visitsToday: VisitToday[] = [
  { id: 1, patient: "John Doe", time: "09:00 AM", provider: "Dr. Smith", nurse: "Sarah Johnson, RN", status: "Completed" },
  { id: 2, patient: "Jane Roe", time: "09:30 AM", provider: "Dr. Adams", nurse: "Michael Chen, RN", status: "Completed" },
  { id: 3, patient: "Michael Lee", time: "10:00 AM", provider: "Dr. Brown", nurse: "Emily Rodriguez, RN", status: "Pending" },
  { id: 4, patient: "Sarah Johnson", time: "10:30 AM", provider: "Dr. Wilson", nurse: "James Patterson, RN", status: "Pending" },
  { id: 5, patient: "Robert Martinez", time: "11:00 AM", provider: "Dr. Garcia", nurse: "Sarah Johnson, RN", status: "Completed" },
  { id: 6, patient: "Emily Chen", time: "11:30 AM", provider: "Dr. Taylor", nurse: "Michael Chen, RN", status: "Pending" }
];
const roiRequests: ROI[] = [
  { id: 1, patient: "John Doe", facility: "General Hospital", requestedDate: "2026-04-08", status: "Signature Pending" },
  { id: 2, patient: "John Doe", facility: "City Clinic", requestedDate: "2026-04-07", status: "Sent to Facility" },
  { id: 3, patient: "Jane Roe", facility: "Heart Center", requestedDate: "2026-04-06", status: "Completed" },
  { id: 4, patient: "Michael Lee", facility: "Specialty Clinic", requestedDate: "2026-04-05", status: "Signature Pending" },
  { id: 5, patient: "Sarah Johnson", facility: "General Hospital", requestedDate: "2026-04-04", status: "Sent to Facility" },
  { id: 6, patient: "Robert Martinez", facility: "Cardiology Center", requestedDate: "2026-04-03", status: "Completed" }
];
const weeklyVisits: WeeklyVisit[] = [
  { week: "Week 1", visits: 58, aht: 22 },
  { week: "Week 2", visits: 72, aht: 18 },
  { week: "Week 3", visits: 65, aht: 28 },
  { week: "Week 4", visits: 85, aht: 24 },
  { week: "Week 5", visits: 92, aht: 26 }
];
// ============ HELPERS ============
function getInitials(name: string): string {
  return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
}
function getAvatarColor(name: string): string {
  const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}
function statusColor(status: string): string {
  if (status === "Completed") return "#22c55e";
  if (status === "In Progress") return "#f59e0b";
  if (status === "New") return "#3b82f6";
  return "#6b7280";
}
function roiStatusStyle(status: string): React.CSSProperties {
  if (status === "Completed") return { color: "#16a34a", background: "#dcfce7", fontWeight: 600, fontSize: 11, padding: "3px 9px", borderRadius: 20 };
  if (status === "Sent to Facility") return { color: "#2563eb", background: "#dbeafe", fontWeight: 600, fontSize: 11, padding: "3px 9px", borderRadius: 20 };
  return { color: "#dc2626", background: "#fee2e2", fontWeight: 600, fontSize: 11, padding: "3px 9px", borderRadius: 20 };
}
// ============ TOOLTIP ============
function Tooltip({ text, children, position = "top" }: { text: string; children: React.ReactNode; position?: "top" | "bottom" }): JSX.Element {
  const [visible, setVisible] = useState(false);
  const isTop = position !== "bottom";
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div style={{
          position: "absolute",
          ...(isTop ? { bottom: "calc(100% + 7px)" } : { top: "calc(100% + 7px)" }),
          left: "50%", transform: "translateX(-50%)",
          background: "#1e293b", color: "#f1f5f9", fontSize: 11, fontWeight: 500,
          padding: "5px 10px", borderRadius: 6, whiteSpace: "nowrap",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)", zIndex: 9999, pointerEvents: "none",
          lineHeight: 1.5,
        }}>
          {text}
          <div style={{
            position: "absolute",
            ...(isTop ? { top: "100%", borderTopColor: "#1e293b", borderTopWidth: 5, borderBottomWidth: 0 } : { bottom: "100%", borderBottomColor: "#1e293b", borderBottomWidth: 5, borderTopWidth: 0 }),
            left: "50%", transform: "translateX(-50%)",
            border: "5px solid transparent",
          }} />
        </div>
      )}
    </div>
  );
}
// ============ DONUT CHART ============
function DonutChart({ data, total }: { data: PieChartData[]; total: number }): JSX.Element {
  const r = 32, cx = 42, cy = 42;
  let cumulAngle = -90;
  const slices = data.map((item) => {
    const pct = item.value / total;
    const angle = pct * 360;
    const startRad = (cumulAngle * Math.PI) / 180;
    const endRad = ((cumulAngle + angle) * Math.PI) / 180;
    cumulAngle += angle;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    return <path key={item.label} d={d} fill={item.color} stroke="#fff" strokeWidth={1.5} />;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={84} height={84} viewBox="0 0 84 84">
          {slices}
          <circle cx={cx} cy={cy} r={r - 8} fill="#fff" />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#1e293b">{total}</text>
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {data.map((item) => (
          <Tooltip key={item.label} text={`${total > 0 ? Math.round((item.value / total) * 100) : 0}% of total`} position="top">
            <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "default" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#475569" }}><strong style={{ color: "#1e293b" }}>{item.value}</strong> {item.label}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
// ============ READINESS GAUGE ============
function ReadinessGauge({ value }: { value: number }): JSX.Element {
  const color = value < 40 ? "#ef4444" : value < 70 ? "#f97316" : "#22c55e";
  const r = 34, cx = 50, cy = 46;
  const angle = -180 + (value / 100) * 180;
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endRad = (angle * Math.PI) / 180;
  const arcX = cx + r * Math.cos(endRad);
  const arcY = cy + r * Math.sin(endRad);
  const largeArc = 0;
  const needleRad = endRad;
  const needleX = cx + (r - 6) * Math.cos(needleRad);
  const needleY = cy + (r - 6) * Math.sin(needleRad);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={56} height={32} viewBox="0 0 100 58">
        <path d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${startY}`} fill="none" stroke="#e5e7eb" strokeWidth={6} strokeLinecap="round" />
        {value > 0 && (
          <path d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${arcX.toFixed(2)} ${arcY.toFixed(2)}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
        )}
        <line x1={cx} y1={cy} x2={needleX.toFixed(2)} y2={needleY.toFixed(2)} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={3} fill={color} />
      </svg>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: -2 }}>{value}%</div>
    </div>
  );
}
// ============ AVATAR ============
function Avatar({ name, size = 32 }: { name: string; size?: number }): JSX.Element {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: getAvatarColor(name),
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: Math.round(size * 0.35), fontWeight: 700, flexShrink: 0,
      letterSpacing: "-0.5px"
    }}>{getInitials(name)}</div>
  );
}
// ============ SIDEBAR ============
type View = "dashboard" | "upcoming" | "completed";
function Sidebar({ view, setView, onPatientClear }: { view: View; setView: (v: View) => void; onPatientClear: () => void }): JSX.Element {
  const navItems: { id: View; label: string; icon: JSX.Element }[] = [
    {
      id: "dashboard", label: "Dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      id: "upcoming", label: "Upcoming",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      id: "completed", label: "Completed",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
  ];
  return (
    <div style={{ width: 192, background: "#0f172a", display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
      <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <rect x="3" y="3" width="8" height="8" rx="1" opacity="0.95" />
            <rect x="13" y="3" width="8" height="8" rx="1" opacity="0.95" />
            <rect x="13" y="13" width="8" height="8" rx="1" opacity="0.95" />
            <rect x="3" y="13" width="8" height="8" rx="1" opacity="0.6" />
          </svg>
        </div>
        <div>
          <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>Family Medicine</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, lineHeight: 1.3 }}>Intake Portal</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {navItems.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setView(item.id); onPatientClear(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "11px 16px",
                background: active ? "rgba(59,130,246,0.12)" : "transparent",
                borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
                borderRight: "none", borderTop: "none", borderBottom: "none",
                color: active ? "#60a5fa" : "rgba(255,255,255,0.55)",
                fontSize: 14, fontWeight: active ? 600 : 400, cursor: "pointer", textAlign: "left",
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#93c5fd", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>RB</div>
        <div>
          <div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600 }}>Rowell B.</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Coordinator</div>
        </div>
      </div>
    </div>
  );
}
// ============ AUTH BANNER ============
function AuthBanner({ state, onLogin, onLogout }: { state: AuthState; onLogin: () => void; onLogout: () => void }): JSX.Element | null {
  if (!isConfigured || state === "demo") return null;
  if (state === "loading") {
    return <div style={{ background: "#ede9fe", borderBottom: "1px solid #ddd6fe", padding: "6px 24px", fontSize: 12, color: "#5b21b6", fontWeight: 600 }}>Connecting to UiPath…</div>;
  }
  if (state === "unauthenticated") {
    return (
      <div style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", padding: "6px 20px", display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
        <span style={{ color: "#64748b" }}>Sign in to enable live Action Center task creation.</span>
        <button onClick={onLogin} style={{ padding: "4px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Sign in with UiPath</button>
      </div>
    );
  }
  return (
    <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "6px 20px", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
      <span style={{ color: "#16a34a", fontWeight: 600 }}>Connected to UiPath</span>
      {!ENV.folderId && <span style={{ color: "#166534", marginLeft: 4 }}>— set <code style={{ background: "#bbf7d0", borderRadius: 3, padding: "1px 4px" }}>VITE_UIPATH_FOLDER_ID</code> to enable task creation</span>}
      <span style={{ flex: 1 }} />
      <button onClick={onLogout} style={{ padding: "3px 10px", background: "transparent", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Sign out</button>
    </div>
  );
}
// ============ SHARED COMPONENTS ============
function SectionCard({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{title}</h3>
      {children}
    </div>
  );
}
function FormField({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}
function CheckboxItem<T extends Record<string, boolean | string>>({ label, obj, k, set }: { label: string; obj: T; k: keyof T; set: (o: T) => void }): JSX.Element {
  const checked = typeof obj[k] === "boolean" ? (obj[k] as boolean) : false;
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#374151", padding: "2px 0" }}>
      <input type="checkbox" checked={checked} onChange={(e) => set({ ...obj, [k]: e.target.checked } as T)} style={{ accentColor: "#2563eb", width: 15, height: 15, cursor: "pointer", flexShrink: 0 }} />
      <span>{label}</span>
    </label>
  );
}
const inputCss: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #d1d5db",
  borderRadius: 6, background: "#fff", color: "#1f2937", boxSizing: "border-box",
  outline: "none", fontFamily: "inherit"
};
// ============ APP ROOT ============
export default function App(): JSX.Element {
  const { state: authState, login, logout } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showROI, setShowROI] = useState(false);
  const [nurseFilter, setNurseFilter] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AuthBanner state={authState} onLogin={login} onLogout={logout} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar
          view={view}
          setView={(v) => { setView(v); setNurseFilter(""); }}
          onPatientClear={() => { setSelectedPatient(null); setShowROI(false); }}
        />
        <div style={{ flex: 1, background: "#f8fafc", overflowY: "auto" }}>
          {showROI && selectedPatient ? (
            <CreateROIPage
              patient={selectedPatient}
              authState={authState}
              onBack={() => setShowROI(false)}
              onSubmit={(roi) => {
                if (!patientDetails[selectedPatient.id]) {
                  patientDetails[selectedPatient.id] = { ...defaultDetails, roi: [] };
                }
                patientDetails[selectedPatient.id].roi.push(roi);
                setShowROI(false);
              }}
            />
          ) : selectedPatient ? (
            <PatientRecord
              patient={selectedPatient}
              authState={authState}
              onBack={() => setSelectedPatient(null)}
              onCreateROI={() => setShowROI(true)}
            />
          ) : view === "dashboard" ? (
            <DashboardPage
              patients={patients}
              onNavigateToUpcoming={(nurse) => { setView("upcoming"); setNurseFilter(nurse || ""); }}
              onNavigateToCompleted={() => setView("completed")}
            />
          ) : (
            <QueuePage
              patients={view === "upcoming" ? patients.filter((p) => p.status !== "Completed") : patients.filter((p) => p.status === "Completed")}
              onSelect={setSelectedPatient}
              initialNurseFilter={nurseFilter}
              isCompleted={view === "completed"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
// ============ DASHBOARD ============
function DashboardPage({ patients: pts, onNavigateToUpcoming, onNavigateToCompleted }: {
  patients: Patient[];
  onNavigateToUpcoming: (nurse?: string) => void;
  onNavigateToCompleted: () => void;
}): JSX.Element {
  const totalCount = pts.length;
  const upcomingCount = pts.filter((p) => p.status !== "Completed").length;
  const inProgressCount = pts.filter((p) => p.status === "In Progress").length;
  const completedCount = pts.filter((p) => p.status === "Completed").length;
  const newCount = pts.filter((p) => p.status === "New").length;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const aprnStats: Record<string, { total: number; pending: number; completed: number }> = {};
  visitsToday.forEach((v) => {
    if (!aprnStats[v.nurse]) aprnStats[v.nurse] = { total: 0, pending: 0, completed: 0 };
    aprnStats[v.nurse].total++;
    if (v.status === "Pending") aprnStats[v.nurse].pending++; else aprnStats[v.nurse].completed++;
  });
  const stageData: PieChartData[] = stages.map((s) => ({ label: s, value: pts.filter((p) => p.stage === s).length, color: stageColors[s] }));
  const statusData: PieChartData[] = [
    { label: "New", value: newCount, color: "#3b82f6" },
    { label: "In Progress", value: inProgressCount, color: "#f59e0b" },
    { label: "Completed", value: completedCount, color: "#22c55e" }
  ];
  const statCards = [
    { label: "Total Patients", value: totalCount, sub: "All records", color: "#94a3b8", tooltip: "All patients currently in the system", onClick: undefined as (() => void) | undefined },
    { label: "Upcoming", value: upcomingCount, sub: "Awaiting intake", color: "#3b82f6", tooltip: "Patients not yet completed — click to open queue", onClick: () => onNavigateToUpcoming() },
    { label: "In Progress", value: inProgressCount, sub: "Active today", color: "#f59e0b", tooltip: "Intake sessions currently active today", onClick: () => onNavigateToUpcoming() },
    { label: "Completed", value: completedCount, sub: "Intake done", color: "#22c55e", tooltip: "Patients with fully completed intake — click to view", onClick: () => onNavigateToCompleted() },
  ];
  const thS: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" };
  const tdS: React.CSSProperties = { padding: "12px 14px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f1f5f9" };
  return (
    <div style={{ padding: "32px 36px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Intake Summary</h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>{today}</p>
        </div>
        <button onClick={() => onNavigateToUpcoming()} style={{ padding: "8px 18px", background: "#2563eb", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 1px 4px rgba(37,99,235,0.25)" }}>View Queue</button>
      </div>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} onClick={s.onClick} style={{ background: "#fff", border: "1px solid #e5e7eb", borderTop: `3px solid ${s.color}`, borderRadius: 10, padding: "20px 22px", cursor: s.onClick ? "pointer" : "default", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{s.label}</div>
            <Tooltip text={s.tooltip} position="bottom">
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1, cursor: "default" }}>{s.value}</div>
            </Tooltip>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Stage Distribution</div>
          <DonutChart data={stageData} total={totalCount} />
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Status Overview</div>
          <DonutChart data={statusData} total={totalCount} />
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Weekly Visits — YTD</div>
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#64748b" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, background: "#bfdbfe", borderRadius: 2, display: "inline-block" }} />AHT (min)</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 16, height: 2, background: "#2563eb", verticalAlign: "middle" }} />Visits</span>
            </div>
          </div>
          <svg width="100%" height={120} viewBox="0 0 500 120" preserveAspectRatio="none">
            {[0, 50, 100].map((v, i) => (
              <text key={i} x="2" y={100 - (v / 100) * 85 + 4} fontSize="9" fill="#94a3b8">{v}</text>
            ))}
            {weeklyVisits.map((w, i) => {
              const x = 30 + i * 95;
              const barH = (w.aht / 30) * 85;
              return <rect key={i} x={x - 20} y={100 - barH} width={40} height={barH} fill="#bfdbfe" rx={3} />;
            })}
            <polyline
              points={weeklyVisits.map((w, i) => `${30 + i * 95},${100 - (w.visits / 100) * 85}`).join(" ")}
              fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
            {weeklyVisits.map((w, i) => {
              const x = 30 + i * 95;
              const y = 100 - (w.visits / 100) * 85;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={4} fill="#fff" stroke="#2563eb" strokeWidth={2} />
                  <text x={x} y={y - 7} fontSize="9" fill="#2563eb" textAnchor="middle">{w.visits}</text>
                  <text x={x} y={114} fontSize="9" fill="#94a3b8" textAnchor="middle">{w.week}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      {/* Bottom tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Nurse Visit Assignments</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Today's schedule — click a row to filter queue</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Nurse", "Pending", "Completed", "Total"].map((h) => <th key={h} style={thS}>{h}</th>)}</tr></thead>
            <tbody>
              {Object.entries(aprnStats).map(([nurse, s]) => (
                <tr key={nurse} onClick={() => onNavigateToUpcoming(nurse)} style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}>
                  <td style={tdS}>{nurse}</td>
                  <td style={{ ...tdS, textAlign: "center" }}><Tooltip text={s.pending > 0 ? `${s.pending} visit${s.pending > 1 ? "s" : ""} not yet started` : "All visits started"} position="top"><span style={{ color: s.pending > 0 ? "#ef4444" : "#22c55e", fontWeight: 700, cursor: "default" }}>{s.pending}</span></Tooltip></td>
                  <td style={{ ...tdS, textAlign: "center" }}><Tooltip text={`${s.completed} visit${s.completed !== 1 ? "s" : ""} finished today`} position="top"><span style={{ color: "#22c55e", fontWeight: 700, cursor: "default" }}>{s.completed}</span></Tooltip></td>
                  <td style={{ ...tdS, textAlign: "center" }}><Tooltip text={`${s.total} total visit${s.total !== 1 ? "s" : ""} assigned today`} position="top"><span style={{ color: "#3b82f6", fontWeight: 700, cursor: "default" }}>{s.total}</span></Tooltip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Recent ROI Requests</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Latest release of information activity</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Patient", "Facility", "Date", "Status"].map((h) => <th key={h} style={thS}>{h}</th>)}</tr></thead>
            <tbody>
              {roiRequests.map((roi) => (
                <tr key={roi.id}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}>
                  <td style={{ ...tdS, fontWeight: 600, color: "#0f172a" }}>{roi.patient}</td>
                  <td style={tdS}>{roi.facility}</td>
                  <td style={{ ...tdS, color: "#64748b" }}>{roi.requestedDate}</td>
                  <td style={tdS}><Tooltip text={{ "Completed": "Records successfully released", "Sent to Facility": "Request sent, awaiting acknowledgment" }[roi.status] ?? "Pending release or action needed"} position="top"><span style={roiStatusStyle(roi.status)}>{roi.status.toUpperCase()}</span></Tooltip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// ============ QUEUE PAGE ============
function QueuePage({ patients: pts, onSelect, initialNurseFilter = "", isCompleted }: {
  patients: Patient[];
  onSelect: (p: Patient) => void;
  initialNurseFilter?: string;
  isCompleted: boolean;
}): JSX.Element {
  const [search, setSearch] = useState("");
  const [stageF, setStageF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [providerF, setProviderF] = useState("");
  const [nurseF, setNurseF] = useState(initialNurseFilter);
  const filtered = pts.filter((p) => {
    const s = search.toLowerCase();
    return (!search || p.name.toLowerCase().includes(s) || p.mrn.toLowerCase().includes(s) || p.nurse.toLowerCase().includes(s))
      && (!stageF || p.stage === stageF)
      && (!statusF || p.status === statusF)
      && (!providerF || p.provider === providerF)
      && (!nurseF || p.nurse === nurseF);
  });
  const uniq = <T,>(arr: T[]): T[] => [...new Set(arr)];
  const selStyle: React.CSSProperties = { ...inputCss, width: "auto", minWidth: 160, flex: "1 1 160px" };
  const thS: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #e2e8f0" };
  const tdS: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13 };
  return (
    <div style={{ padding: "32px 36px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{isCompleted ? "Completed Visits" : "Upcoming Visits"}</h1>
        <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>{isCompleted ? "Review past patient visits" : "Review upcoming visits and manage schedules"}</p>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Filter Records</div>
          {(search || stageF || statusF || providerF || nurseF) && (
            <button onClick={() => { setSearch(""); setStageF(""); setStatusF(""); setProviderF(""); setNurseF(""); }}
              style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4 }}>
              Clear filters
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input placeholder="Name, MRN, or Nurse..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputCss, minWidth: 200, flex: "1 1 200px" }} />
          {([
            { label: "All Stages", val: stageF, set: setStageF, opts: uniq(pts.map((p) => p.stage)) },
            { label: "All Statuses", val: statusF, set: setStatusF, opts: uniq(pts.map((p) => p.status)) },
            { label: "All Providers", val: providerF, set: setProviderF, opts: uniq(pts.map((p) => p.provider)) },
            { label: "All Nurses", val: nurseF, set: setNurseF, opts: uniq(pts.map((p) => p.nurse)) },
          ] as Array<{ label: string; val: string; set: (v: string) => void; opts: string[] }>).map(({ label, val, set, opts }) => (
            <select key={label} value={val} onChange={(e) => set(e.target.value)} style={selStyle}>
              <option value="">{label}</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 12, color: "#64748b" }}>
          Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of <strong style={{ color: "#0f172a" }}>{pts.length}</strong> rows
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>{["MRN", "Patient", "Date", "Provider", "Nurse", "Stage", "Status", "Readiness"].map((h) => <th key={h} style={thS}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} onClick={() => onSelect(p)} style={{ cursor: "pointer" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}>
                <td style={{ ...tdS, color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>{p.mrn}</td>
                <td style={tdS}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={p.name} size={30} />
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ ...tdS, color: "#475569" }}>{p.date}</td>
                <td style={{ ...tdS, color: "#475569" }}>{p.provider}</td>
                <td style={{ ...tdS, color: "#475569" }}>{p.nurse}</td>
                <td style={tdS}><Tooltip text={{ "Data Prepared": "Data gathered & prepared", "Data Validated": "Verified against source records", "Patient Record Updated": "EMR updated", "Readiness Evaluated": "Fully ready for visit" }[p.stage] ?? p.stage} position="bottom"><span style={{ color: stageColors[p.stage] || "#6b7280", background: (stageColors[p.stage] || "#6b7280") + "18", fontWeight: 600, fontSize: 11, padding: "3px 9px", borderRadius: 20, cursor: "default" }}>{p.stage}</span></Tooltip></td>
                <td style={tdS}><Tooltip text={{ "New": "Intake not yet started", "In Progress": "Intake currently underway", "Completed": "Intake fully completed" }[p.status] ?? p.status} position="bottom"><span style={{ color: statusColor(p.status), background: statusColor(p.status) + "18", fontWeight: 600, fontSize: 11, padding: "3px 9px", borderRadius: 20, cursor: "default" }}>{p.status}</span></Tooltip></td>
                <td style={tdS}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
                    <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: p.readiness + "%", height: "100%", background: p.readiness < 40 ? "#ef4444" : p.readiness < 70 ? "#f97316" : "#22c55e", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.readiness < 40 ? "#ef4444" : p.readiness < 70 ? "#f97316" : "#22c55e", minWidth: 32, textAlign: "right" }}>{p.readiness}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ============ PATIENT RECORD ============
function PatientRecord({ patient, authState, onBack, onCreateROI }: {
  patient: Patient;
  authState: AuthState;
  onBack: () => void;
  onCreateROI: () => void;
}): JSX.Element {
  const d = patientDetails[patient.id] || defaultDetails;
  const currentStageIdx = stages.indexOf(patient.stage);
  const [activeTab, setActiveTab] = useState<"intake" | "chart" | "roi">("intake");
  const isAuthenticated = authState === "authenticated";
  const { data: liveData, loading: liveLoading, error: liveError, refresh: liveRefresh } = usePolling<{ items: TaskGetResponse[] }>({
    fn: async () => {
      if (!sdk || !isAuthenticated) return { items: [] };
      const svc = new Tasks(sdk);
      return svc.getAll({ filter: `contains(Title,'${patient.mrn}')`, ...(ENV.folderId ? { folderId: ENV.folderId } : {}) }) as Promise<{ items: TaskGetResponse[] }>;
    },
    interval: 20000,
    enabled: isAuthenticated && activeTab === "roi",
    deps: [patient.id, isAuthenticated, activeTab],
  });
  const liveTasks = liveData?.items ?? [];
  const thS: React.CSSProperties = { padding: "5px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0" };
  const tdS: React.CSSProperties = { padding: "6px 10px", borderBottom: "1px solid #f1f5f9", fontSize: 12, color: "#374151" };
  const tabBtn = (id: typeof activeTab, label: string) => (
    <button onClick={() => setActiveTab(id)} style={{
      background: "none", border: "none", padding: "10px 4px", marginRight: 24, fontSize: 14, fontWeight: 500,
      color: activeTab === id ? "#2563eb" : "#64748b", cursor: "pointer",
      borderBottom: activeTab === id ? "2px solid #2563eb" : "2px solid transparent",
    }}>{label}</button>
  );
  return (
    <div>
      <div style={{ padding: "14px 32px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#64748b", fontWeight: 500, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
      </div>
      <div style={{ display: "flex" }}>
        {/* Left patient card */}
        <div style={{ width: 300, flexShrink: 0, background: "#eff6ff", borderRight: "1px solid #bfdbfe", display: "flex", flexDirection: "column", gap: 0, minHeight: "calc(100vh - 57px)" }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 20px", background: "linear-gradient(160deg, #bfdbfe 0%, #eff6ff 100%)", borderBottom: "1px solid #bfdbfe" }}>
            <Avatar name={patient.name} size={64} />
            <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 16, marginTop: 12, textAlign: "center" }}>{patient.name}</div>
            <div style={{ marginTop: 6, background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em" }}>{patient.mrn}</div>
          </div>
          {/* Info rows */}
          <div style={{ display: "flex", flexDirection: "column", padding: "10px 16px", gap: 8, borderBottom: "1px solid #bfdbfe" }}>
            {[
              { label: "Visit Date", value: patient.date, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { label: "Provider", value: patient.provider, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { label: "Nurse", value: patient.nurse, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 600, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Intake summary */}
          <div style={{ padding: "16px 20px" }}>
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 14px", boxShadow: "0 2px 6px rgba(245,158,11,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nurse Intake Notes</div>
              </div>
              {d.nurseSummary.map((note, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, paddingBottom: 6, borderBottom: i < d.nurseSummary.length - 1 ? "1px dashed #fcd34d" : "none" }}>
                  <span style={{ fontSize: 14, color: "#b45309", lineHeight: 1.4, flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right content */}
        <div style={{ flex: 1, padding: "24px 32px" }}>
          {/* Progress + Readiness */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Intake Progress</div>
              <div style={{ position: "relative", display: "flex", padding: "0 6px" }}>
                <div style={{ position: "absolute", top: 7, left: `${50 / stages.length}%`, right: `${50 / stages.length}%`, height: 2, background: "#e2e8f0", zIndex: 0 }} />
                <div style={{ position: "absolute", top: 7, left: `${50 / stages.length}%`, width: `${currentStageIdx / (stages.length - 1) * (100 - 100 / stages.length)}%`, height: 2, background: "#3b82f6", zIndex: 1 }} />
                {stages.map((s, i) => {
                  const done = i <= currentStageIdx;
                  const stageDesc: Record<string, string> = {
                    "Data Prepared": "Patient data has been gathered and prepared",
                    "Data Validated": "Data verified against source records",
                    "Patient Record Updated": "EMR updated with validated information",
                    "Readiness Evaluated": "Patient is fully ready for visit",
                  };
                  return (
                    <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                      <Tooltip text={stageDesc[s] ?? s} position="top">
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: done ? "#3b82f6" : "#e2e8f0", boxShadow: i === currentStageIdx ? "0 0 0 3px #bfdbfe" : "none", cursor: "default" }} />
                      </Tooltip>
                      <div style={{ fontSize: 9, color: done ? "#2563eb" : "#94a3b8", marginTop: 4, textAlign: "center", fontWeight: done ? 600 : 400, maxWidth: 72, lineHeight: 1.3 }}>{s}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "#e2e8f0", flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Readiness</div>
              <Tooltip text={patient.readiness < 40 ? "Low readiness — action required" : patient.readiness < 70 ? "Moderate readiness — in progress" : "High readiness — visit ready"} position="top">
                <ReadinessGauge value={patient.readiness} />
              </Tooltip>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ borderBottom: "1px solid #e2e8f0", marginBottom: 24 }}>
            {tabBtn("intake", "Intake")}
            {tabBtn("chart", "Patient Chart")}
            {tabBtn("roi", "Release of Information")}
          </div>
          {/* Intake tab */}
          {activeTab === "intake" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Clinical Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Recent Visits</div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ background: "#f8fafc" }}>
                        <tr>
                          <th style={{ padding: "4px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>Type</th>
                          <th style={{ padding: "4px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>Provider</th>
                          <th style={{ padding: "4px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...d.visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((v, i) => (
                          <tr key={i}>
                            <td style={{ padding: "4px 8px", fontSize: 12, color: "#374151", borderBottom: "1px solid #f1f5f9" }}>{v.type}</td>
                            <td style={{ padding: "4px 8px", fontSize: 12, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>{v.provider}</td>
                            <td style={{ padding: "4px 8px", fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>{v.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Care Gaps</div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ background: "#f8fafc" }}>
                        <tr>
                          <th style={{ padding: "4px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>Preventive Service</th>
                          <th style={{ padding: "4px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>Last Performed</th>
                          <th style={{ padding: "4px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>Next Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...d.careGaps].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()).map((g, i) => (
                          <tr key={i}>
                            <td style={{ padding: "4px 8px", fontSize: 12, color: "#374151", borderBottom: "1px solid #f1f5f9" }}>{g.name}</td>
                            <td style={{ padding: "4px 8px", fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>{g.lastPerformed}</td>
                            {(() => {
                              const today = new Date(); today.setHours(0, 0, 0, 0);
                              const due = new Date(g.nextDueDate);
                              const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                              const isOverdue = days < 0;
                              const isDueSoon = days >= 0 && days <= 60;
                              return (
                                <td style={{ padding: "4px 8px", fontSize: 12, borderBottom: "1px solid #f1f5f9" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: isOverdue || isDueSoon ? 600 : 400, color: isOverdue ? "#dc2626" : isDueSoon ? "#d97706" : "#64748b" }}>
                                    {isOverdue && <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" /></svg>}
                                    {isDueSoon && <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" /></svg>}
                                    {g.nextDueDate}
                                  </span>
                                </td>
                              );
                            })()}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Complaints</div>
                    {d.complaints.length === 0
                      ? <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>No complaints recorded.</div>
                      : d.complaints.map((c, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, paddingBottom: 6, borderBottom: i < d.complaints.length - 1 ? "1px dashed #e2e8f0" : "none" }}>
                          <span style={{ fontSize: 14, color: "#64748b", lineHeight: 1.4, flexShrink: 0 }}>•</span>
                          <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{c}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Reconciliation Status</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  {[
                    { title: "Allergies", data: d.allergies },
                    { title: "Medications", data: d.medications },
                    { title: "Immunizations", data: d.immunizations }
                  ].map(({ title, data }) => (
                    <div key={title} style={{ border: "1px solid #f1f5f9", borderRadius: 6, padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12 }}>{title}</div>
                      {data.reconciled.map((item) => (
                        <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#dcfce7" /><path d="M4 7l2.5 2.5L10 5" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                            <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                          </div>
                          <Tooltip text="Verified against EMR records" position="top"><span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", cursor: "default" }}>Reconciled</span></Tooltip>
                        </div>
                      ))}
                      {data.unreconciled.map((item) => (
                        <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" /></svg>
                            <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                          </div>
                          <Tooltip text="Awaiting verification or provider review" position="top"><span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", cursor: "default" }}>Pending</span></Tooltip>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Patient Chart tab */}
          {activeTab === "chart" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <SectionCard title="Vital Signs">
                  {["BP: 128/82 mmHg", "HR: 72 bpm", "Temp: 98.6°F", "O2: 98% (RA)"].map((v) => <div key={v} style={{ fontSize: 13, color: "#475569", padding: "3px 0" }}>• {v}</div>)}
                </SectionCard>
                <SectionCard title="Current Medications">
                  {[...d.medications.reconciled, ...d.medications.unreconciled].map((m) => <div key={m} style={{ fontSize: 13, color: "#475569", padding: "3px 0" }}>• {m}</div>)}
                </SectionCard>
                <SectionCard title="Allergies">
                  {[...d.allergies.reconciled, ...d.allergies.unreconciled].map((a) => <div key={a} style={{ fontSize: 13, color: "#475569", padding: "3px 0" }}>• {a}</div>)}
                </SectionCard>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <SectionCard title="Immunizations">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        {["Vaccine", "Status"].map((h) => <th key={h} style={thS}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[...d.immunizations.reconciled.map((v) => ({ vaccine: v, reconciled: true })), ...d.immunizations.unreconciled.map((v) => ({ vaccine: v, reconciled: false }))].map((im) => (
                        <tr key={im.vaccine}>
                          <td style={tdS}>{im.vaccine}</td>
                          <td style={tdS}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: im.reconciled ? "#16a34a" : "#d97706" }}>
                              {im.reconciled
                                ? <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#dcfce7" /><path d="M4 7l2.5 2.5L10 5" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                                : <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" /></svg>}
                              {im.reconciled ? "Reconciled" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </SectionCard>
                <SectionCard title="Screenings & Labs">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        {["Test", "Facility", "Date"].map((h) => <th key={h} style={thS}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {d.screeningsAndLabs.map((sc, i) => (
                        <tr key={i}>
                          <td style={tdS}>{sc.test}</td>
                          <td style={{ ...tdS, color: "#475569" }}>{sc.facility}</td>
                          <td style={{ ...tdS, color: "#64748b" }}>{sc.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </SectionCard>
              </div>
            </div>
          )}
          {/* ROI tab */}
          {activeTab === "roi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {isAuthenticated && (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Action Center Tasks <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>live</span></span>
                    <button onClick={liveRefresh} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 12, padding: "3px 10px", cursor: "pointer", color: "#475569" }}>↻</button>
                  </div>
                  {liveLoading && liveTasks.length === 0 && <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Loading…</p>}
                  {liveError && <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{liveError.message}</p>}
                  {!liveLoading && !liveError && liveTasks.length === 0 && <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No action center tasks for this patient.</p>}
                  {liveTasks.map((task) => (
                    <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "#f8fafc", borderRadius: 5, border: "1px solid #e2e8f0", marginBottom: 5 }}>
                      <span style={{ flex: 1, fontSize: 13 }}>{task.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: task.status === "Completed" ? "#16a34a" : "#d97706" }}>{task.status}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Release of Information Requests</div>
                  {patient.status !== "Completed" && (
                    <button onClick={onCreateROI} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      + New ROI Request
                    </button>
                  )}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8fafc" }}><tr>{["ID", "Facility", "Requested Date", "Status"].map((h) => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                  <tbody>
                    {d.roi.map((r) => (
                      <tr key={r.id}>
                        <td style={tdS}>{r.id}</td>
                        <td style={tdS}>{r.facility}</td>
                        <td style={{ ...tdS, color: "#64748b" }}>{r.requestedDate}</td>
                        <td style={tdS}><span style={roiStatusStyle(r.status)}>{r.status.toUpperCase()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ============ CREATE ROI PAGE ============
function CreateROIPage({ patient, authState, onBack, onSubmit }: {
  patient: Patient;
  authState: AuthState;
  onBack: () => void;
  onSubmit: (roi: { id: number; facility: string; requestedDate: string; status: string }) => void;
}): JSX.Element {
  const isAuthenticated = authState === "authenticated";
  const canCreateTask = isAuthenticated && !!ENV.folderId;
  const [facilityName, setFacilityName] = useState("");
  const [facilityFax, setFacilityFax] = useState("");
  const [roiType, setROIType] = useState("Patient Signature Required");
  const [records, setRecords] = useState<RecordsState>({ behavioralHealth: false, emergencyDept: false, operativeNotes: false, providerNotes: false, therapyNotes: false, otherDocument: "" });
  const [additional, setAdditional] = useState<AdditionalState>({ allergyList: false, immunizations: false, medicationList: false, labResults: false, hivLab: false, geneticTesting: false, pathology: false, ekg: false, radiologyReport: false, radiologyImages: false, billingInfo: false });
  const [substance, setSubstance] = useState<SubstanceState>({ assessment: false, historyPhysical: false, multidisciplinaryNotes: false, familyParticipation: false, questionnaires: false, treatmentSummary: false, treatmentPlans: false, other: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const handleSubmit = async () => {
    setSubmitting(true); setSdkError(null);
    let taskId: number | null = null;
    if (canCreateTask && sdk) {
      try {
        const svc = new Tasks(sdk);
        const result = await svc.create(
          { title: `ROI Request — ${patient.mrn} / ${facilityName || "Unknown"}`, priority: TaskPriority.Medium, data: { mrn: patient.mrn, patientName: patient.name, facilityName, facilityFax, roiType } },
          ENV.folderId
        );
        taskId = result.id;
      } catch (err: unknown) {
        setSdkError(err instanceof Error ? err.message : String(err));
      }
    }
    onSubmit({ id: taskId ?? Date.now(), facility: facilityName, requestedDate: new Date().toISOString().split("T")[0], status: roiType });
    setSubmitting(false);
  };
  const secStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 };
  const secTitle: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 };
  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" };
  const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 24px" };
  return (
    <div>
      <div style={{ padding: "14px 32px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#64748b", fontWeight: 500, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
      </div>
      <div style={{ padding: "32px 36px", maxWidth: 860 }}>
        <h1 style={{ margin: "0 0 6px 0", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Release of Information Request</h1>
        <p style={{ margin: "0 0 28px 0", fontSize: 13, color: "#64748b" }}>Patient: <strong style={{ color: "#0f172a" }}>{patient.name}</strong> · {patient.mrn}</p>
        {sdkError && (
          <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 7, padding: "10px 16px", marginBottom: 16 }}>
            <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>Task creation failed: {sdkError}. Request saved locally.</p>
          </div>
        )}
        <div style={secStyle}>
          <div style={secTitle}>Request Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <FormField label="ROI Type">
              <select value={roiType} onChange={(e) => setROIType(e.target.value)} style={inputCss}>
                <option>Patient Signature Required</option>
                <option>Facility To Facility</option>
              </select>
            </FormField>
            <FormField label="Facility Name">
              <input value={facilityName} onChange={(e) => setFacilityName(e.target.value)} placeholder="Medical Center" style={inputCss} />
            </FormField>
            <FormField label="Facility Fax">
              <input value={facilityFax} onChange={(e) => setFacilityFax(e.target.value)} placeholder="(555) 000-0000" style={inputCss} />
            </FormField>
          </div>
        </div>
        <div style={secStyle}>
          <div style={secTitle}>Records to be Released</div>
          <div style={grid2}>
            <CheckboxItem label="Behavioral Health" obj={records} k="behavioralHealth" set={setRecords} />
            <CheckboxItem label="Emergency Dept" obj={records} k="emergencyDept" set={setRecords} />
            <CheckboxItem label="Operative Notes" obj={records} k="operativeNotes" set={setRecords} />
            <CheckboxItem label="Provider Notes" obj={records} k="providerNotes" set={setRecords} />
            <CheckboxItem label="Therapy Notes" obj={records} k="therapyNotes" set={setRecords} />
            <FormField label="Other">
              <input value={records.otherDocument} onChange={(e) => setRecords({ ...records, otherDocument: e.target.value })} placeholder="Specify other records" style={inputCss} />
            </FormField>
          </div>
        </div>
        <div style={secStyle}>
          <div style={secTitle}>Additional Records</div>
          <div style={grid3}>
            <CheckboxItem label="Allergy List" obj={additional} k="allergyList" set={setAdditional} />
            <CheckboxItem label="Immunizations" obj={additional} k="immunizations" set={setAdditional} />
            <CheckboxItem label="Medication List" obj={additional} k="medicationList" set={setAdditional} />
            <CheckboxItem label="Lab Results" obj={additional} k="labResults" set={setAdditional} />
            <CheckboxItem label="Hiv Lab" obj={additional} k="hivLab" set={setAdditional} />
            <CheckboxItem label="Genetic Testing" obj={additional} k="geneticTesting" set={setAdditional} />
            <CheckboxItem label="Pathology" obj={additional} k="pathology" set={setAdditional} />
            <CheckboxItem label="Ekg" obj={additional} k="ekg" set={setAdditional} />
            <CheckboxItem label="Radiology Report" obj={additional} k="radiologyReport" set={setAdditional} />
            <CheckboxItem label="Radiology Images" obj={additional} k="radiologyImages" set={setAdditional} />
            <CheckboxItem label="Billing Info" obj={additional} k="billingInfo" set={setAdditional} />
          </div>
        </div>
        <div style={secStyle}>
          <div style={secTitle}>Substance Abuse Records</div>
          <div style={grid2}>
            <CheckboxItem label="Assessment" obj={substance} k="assessment" set={setSubstance} />
            <CheckboxItem label="History Physical" obj={substance} k="historyPhysical" set={setSubstance} />
            <CheckboxItem label="Multidisciplinary Notes" obj={substance} k="multidisciplinaryNotes" set={setSubstance} />
            <CheckboxItem label="Family Participation" obj={substance} k="familyParticipation" set={setSubstance} />
            <CheckboxItem label="Questionnaires" obj={substance} k="questionnaires" set={setSubstance} />
            <CheckboxItem label="Treatment Summary" obj={substance} k="treatmentSummary" set={setSubstance} />
            <CheckboxItem label="Treatment Plans" obj={substance} k="treatmentPlans" set={setSubstance} />
            <FormField label="Other">
              <input value={substance.other} onChange={(e) => setSubstance({ ...substance, other: e.target.value })} placeholder="Specify other records" style={inputCss} />
            </FormField>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={submitting ? undefined : handleSubmit} disabled={submitting}
            style={{ padding: "10px 20px", background: submitting ? "#94a3b8" : "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? "Submitting…" : canCreateTask ? "Submit & Create Action Center Task" : "Trigger ROI Request"}
          </button>
          <button onClick={onBack} style={{ padding: "10px 20px", background: "#fff", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
