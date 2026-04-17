import type { Patient, PatientDetail } from "./types";

export const patients: Patient[] = [
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

export const defaultDetails: PatientDetail = {
  visits: [], allergies: { reconciled: [], unreconciled: [] }, medications: { reconciled: [], unreconciled: [] },
  immunizations: { reconciled: [], unreconciled: [] }, careGaps: [], screeningsAndLabs: [], nurseSummary: ["No intake data available."], complaints: [], roi: []
};

export const patientDetails: Record<number, PatientDetail> = {
  1: {
    visits: [{ type: "Pulmonary", date: "2025-12-01", provider: "Dr. Smith" }, { type: "Cardiology", date: "2025-11-15", provider: "Dr. Patel" }, { type: "General Checkup", date: "2025-10-20", provider: "Dr. Smith" }],
    allergies: { reconciled: ["Peanuts", "Latex", "Sulfa"], unreconciled: ["Penicillin", "Shellfish"] },
    medications: { reconciled: ["Metformin", "Atorvastatin"], unreconciled: ["Lisinopril", "Aspirin"] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-08", administeredBy: "Main Clinic" }, { name: "Pneumonia (PPSV23)", date: "2022-05-14", administeredBy: "Main Clinic" }], unreconciled: [{ name: "COVID Booster", date: "", administeredBy: "" }, { name: "Shingles (RZV Dose 1)", date: "", administeredBy: "" }] },
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
    immunizations: { reconciled: [{ name: "Pneumonia (PPSV23)", date: "2021-09-20", administeredBy: "Heart Center" }, { name: "Flu Shot", date: "2025-11-03", administeredBy: "CVS Pharmacy" }], unreconciled: [{ name: "Shingles (RZV Dose 1)", date: "", administeredBy: "" }, { name: "COVID Booster", date: "", administeredBy: "" }] },
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
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-09-22", administeredBy: "Walgreens Pharmacy" }, { name: "COVID Booster", date: "2025-04-10", administeredBy: "Main Clinic" }], unreconciled: [{ name: "Pneumonia (PPSV23)", date: "", administeredBy: "" }] },
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
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-15", administeredBy: "CVS Pharmacy" }], unreconciled: [{ name: "COVID Booster", date: "", administeredBy: "" }, { name: "Pneumonia (PPSV23)", date: "", administeredBy: "" }, { name: "Shingles (RZV Dose 1)", date: "", administeredBy: "" }] },
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
    immunizations: { reconciled: [{ name: "Pneumonia (PPSV23)", date: "2023-07-18", administeredBy: "GI Specialists" }, { name: "Flu Shot", date: "2025-10-28", administeredBy: "Walgreens Pharmacy" }, { name: "COVID Booster", date: "2025-03-14", administeredBy: "Main Clinic" }], unreconciled: [{ name: "Shingles (RZV Dose 1)", date: "", administeredBy: "" }] },
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
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-09-05", administeredBy: "Rheumatology Center" }], unreconciled: [{ name: "COVID Booster", date: "", administeredBy: "" }, { name: "Pneumonia (PPSV23)", date: "", administeredBy: "" }, { name: "Shingles (RZV)", date: "", administeredBy: "" }] },
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
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-20", administeredBy: "CVS Pharmacy" }, { name: "Pneumonia (PPSV23)", date: "2022-11-08", administeredBy: "Pulmonology Assoc." }, { name: "COVID Booster", date: "2025-04-02", administeredBy: "Main Clinic" }], unreconciled: [{ name: "Shingles (RZV Dose 1)", date: "", administeredBy: "" }] },
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
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-06", administeredBy: "Main Clinic" }], unreconciled: [{ name: "COVID Booster", date: "", administeredBy: "" }, { name: "Pneumonia (PPSV23)", date: "", administeredBy: "" }] },
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
  },
  // ── Completed visits ──────────────────────────────────────────────────────
  11: {
    visits: [
      { type: "Cardiology", date: "2026-03-28", provider: "Dr. Harris" },
      { type: "General Checkup", date: "2026-01-10", provider: "Dr. Harris" },
      { type: "Cardiology", date: "2025-09-22", provider: "Dr. Harris" },
    ],
    allergies: { reconciled: ["Penicillin", "Latex", "Sulfa"], unreconciled: [] },
    medications: { reconciled: ["Lisinopril", "Atorvastatin", "Metoprolol", "Aspirin 81mg"], unreconciled: [] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-12", administeredBy: "Heart Center" }, { name: "Pneumonia (PPSV23)", date: "2020-08-25", administeredBy: "Main Clinic" }, { name: "COVID Booster", date: "2025-04-18", administeredBy: "Walgreens Pharmacy" }, { name: "Shingles (RZV Dose 2)", date: "2024-01-09", administeredBy: "CVS Pharmacy" }], unreconciled: [] },
    careGaps: [
      { name: "Annual Physical", lastPerformed: "2026-01-10", nextDueDate: "2027-01-10" },
      { name: "Lipid Panel", lastPerformed: "2026-03-01", nextDueDate: "2027-03-01" },
      { name: "Blood Pressure Check", lastPerformed: "2026-04-04", nextDueDate: "2027-04-04" },
    ],
    screeningsAndLabs: [
      { test: "Lipid Panel", facility: "Heart Center", date: "2026-03-01" },
      { test: "ECG", facility: "Heart Center", date: "2026-03-28" },
      { test: "Blood Pressure", facility: "Main Clinic", date: "2026-04-04" },
      { test: "CBC / BMP", facility: "Lab Corp", date: "2026-01-10" },
      { test: "Echocardiogram", facility: "Heart Center", date: "2025-09-22" },
    ],
    nurseSummary: [
      "✔ Meds fully reconciled: Lisinopril 10mg QD, Atorvastatin 40mg QHS, Metoprolol 25mg BID, Aspirin 81mg QD — all confirmed with pharmacy records.",
      "✔ Allergies reconciled: Penicillin (anaphylaxis), Latex (urticaria), Sulfa (rash) — all verified and documented. No new allergies reported.",
      "Vitals: BP 118/72, HR 64 (well-controlled on Metoprolol), Temp 98.4°F, SpO2 99%.",
      "✔ Immunizations complete: All four vaccines up to date — confirmed with state registry.",
      "✔ Care gaps closed: Annual Physical completed 01/2026. Lipid panel completed 03/2026 (LDL 88 — at goal). BP check completed today.",
      "✔ Visit summary: Pt. reports excellent adherence. No new complaints at discharge. Follow-up with cardiology scheduled 09/2026. Patient discharged in stable condition.",
    ],
    complaints: [
      "Mild exertional dyspnea — resolved; attributed to deconditioning post-holidays; exercise plan initiated",
      "Occasional ankle swelling — resolved; reduced sodium intake and medication adjustment effective",
    ],
    roi: [
      { id: 11, facility: "Heart Center", requestedDate: "2026-03-30", status: "Completed" },
      { id: 12, facility: "Lab Corp", requestedDate: "2026-03-28", status: "Completed" },
    ]
  },
  12: {
    visits: [
      { type: "Endocrinology", date: "2026-03-15", provider: "Dr. Clark" },
      { type: "General Checkup", date: "2025-12-20", provider: "Dr. Clark" },
      { type: "Ophthalmology", date: "2025-11-08", provider: "Dr. Nguyen" },
    ],
    allergies: { reconciled: ["Sulfa", "Codeine"], unreconciled: [] },
    medications: { reconciled: ["Metformin 1000mg", "Glipizide", "Lisinopril", "Atorvastatin", "Vitamin D 2000IU"], unreconciled: [] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-11-01", administeredBy: "Walgreens Pharmacy" }, { name: "Pneumonia (PPSV23)", date: "2021-06-17", administeredBy: "Endocrinology Clinic" }, { name: "COVID Booster", date: "2025-03-28", administeredBy: "Main Clinic" }], unreconciled: [] },
    careGaps: [
      { name: "HbA1c", lastPerformed: "2026-02-20", nextDueDate: "2026-08-20" },
      { name: "Diabetic Eye Exam", lastPerformed: "2025-11-08", nextDueDate: "2026-11-08" },
      { name: "Foot Exam", lastPerformed: "2026-03-15", nextDueDate: "2027-03-15" },
      { name: "Microalbumin / Cr", lastPerformed: "2026-02-20", nextDueDate: "2026-08-20" },
    ],
    screeningsAndLabs: [
      { test: "HbA1c / BMP", facility: "Lab Corp", date: "2026-02-20" },
      { test: "Diabetic Eye Exam", facility: "Ophthalmology Assoc.", date: "2025-11-08" },
      { test: "Lipid Panel", facility: "Lab Corp", date: "2026-02-20" },
      { test: "Foot Exam", facility: "Endocrinology Clinic", date: "2026-03-15" },
      { test: "HbA1c", facility: "Lab Corp", date: "2025-08-14" },
    ],
    nurseSummary: [
      "✔ Meds fully reconciled: Metformin 1000mg BID, Glipizide 5mg QD, Lisinopril 5mg QD, Atorvastatin 20mg QHS, Vitamin D 2000 IU QD — all confirmed and documented.",
      "✔ Allergies reconciled: Sulfa (Stevens-Johnson syndrome — high severity), Codeine (nausea/vomiting) — both verified, EMR updated.",
      "Vitals: BP 122/76, HR 72, Temp 98.6°F. Weight 188 lbs (down 6 lbs from prior visit — encouraged).",
      "✔ Immunizations complete: Flu, Pneumonia, COVID Booster all up to date.",
      "✔ Care gaps closed: HbA1c 6.9% (at goal <7%) — improved from 7.4%. Diabetic eye exam completed 11/2025, no retinopathy. Foot exam today — sensation intact, no ulcers.",
      "✔ Visit summary: Diabetes well-controlled. Pt. motivated and adherent. Dietary counseling reinforced. Next endocrinology F/U 09/2026. Discharged in excellent condition.",
    ],
    complaints: [
      "Occasional mild hypoglycemia episodes in late afternoon — resolved; snack schedule adjusted, timing of Glipizide reviewed",
      "Mild lower extremity tingling — resolved; neuropathy monitoring plan in place, Vitamin D optimized",
    ],
    roi: [
      { id: 13, facility: "Endocrinology Clinic", requestedDate: "2026-03-20", status: "Completed" },
      { id: 14, facility: "Ophthalmology Assoc.", requestedDate: "2026-03-18", status: "Completed" },
    ]
  },
  13: {
    visits: [
      { type: "Nephrology", date: "2026-03-10", provider: "Dr. Lewis" },
      { type: "General Checkup", date: "2025-11-15", provider: "Dr. Lewis" },
      { type: "Cardiology", date: "2025-10-05", provider: "Dr. Patel" },
    ],
    allergies: { reconciled: ["ACE Inhibitors", "Contrast Dye", "NSAIDs"], unreconciled: [] },
    medications: { reconciled: ["Losartan 50mg", "Furosemide 20mg", "Amlodipine 5mg", "Ferrous Sulfate", "Calcitriol"], unreconciled: [] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-09-30", administeredBy: "Nephrology Assoc." }, { name: "Pneumonia (PPSV23)", date: "2019-04-22", administeredBy: "Main Clinic" }, { name: "COVID Booster", date: "2025-04-05", administeredBy: "Walgreens Pharmacy" }, { name: "Hepatitis B (Series)", date: "2018-11-10", administeredBy: "Main Clinic" }], unreconciled: [] },
    careGaps: [
      { name: "BMP / GFR", lastPerformed: "2026-03-01", nextDueDate: "2026-09-01" },
      { name: "Urine Protein / Cr", lastPerformed: "2026-03-01", nextDueDate: "2026-09-01" },
      { name: "Renal Ultrasound", lastPerformed: "2025-12-10", nextDueDate: "2026-12-10" },
    ],
    screeningsAndLabs: [
      { test: "BMP / GFR / Urine Protein", facility: "Nephrology Assoc.", date: "2026-03-01" },
      { test: "Renal Ultrasound", facility: "Imaging Center", date: "2025-12-10" },
      { test: "CBC / Iron Studies", facility: "Lab Corp", date: "2026-02-05" },
      { test: "BMP / GFR", facility: "Nephrology Assoc.", date: "2025-09-15" },
      { test: "Cardiac Echo", facility: "Heart Center", date: "2025-10-05" },
    ],
    nurseSummary: [
      "✔ Meds fully reconciled: Losartan 50mg QD, Furosemide 20mg QD, Amlodipine 5mg QD, Ferrous Sulfate 325mg BID, Calcitriol 0.25mcg QD — all confirmed with pharmacy.",
      "✔ Allergies reconciled: ACE Inhibitors (angioedema — class allergy), Contrast Dye (anaphylaxis — noted for radiology), NSAIDs (worsens renal function) — all verified, high-priority flags in EMR.",
      "Vitals: BP 132/82 (baseline for CKD stage 3), HR 68, Temp 98.3°F. Weight 174 lbs (fluid stable).",
      "✔ Immunizations complete: Flu, Pneumonia, COVID Booster, Hepatitis B series all current — confirmed registry.",
      "✔ Care gaps closed: BMP/GFR completed 03/2026 (GFR 42 — stable CKD3). Urine Protein/Cr completed. Renal US completed 12/2025.",
      "✔ Visit summary: Kidney function stable; no acute decline. Pt. compliant with fluid restriction and low-potassium diet. Follow-up nephrology 09/2026. Discharged in stable condition.",
    ],
    complaints: [
      "Mild bilateral leg edema — resolved; Furosemide dose adjusted, daily weight monitoring plan in place",
      "Occasional fatigue and mild dyspnea on exertion — resolved; anemia addressed with iron supplementation",
    ],
    roi: [
      { id: 15, facility: "Nephrology Assoc.", requestedDate: "2026-03-12", status: "Completed" },
    ]
  },
  14: {
    visits: [
      { type: "Orthopedic", date: "2026-03-20", provider: "Dr. Walker" },
      { type: "Physical Therapy", date: "2026-02-15", provider: "Dr. Brown" },
      { type: "Pain Management", date: "2026-01-08", provider: "Dr. Nguyen" },
    ],
    allergies: { reconciled: ["Codeine", "Morphine", "Latex"], unreconciled: [] },
    medications: { reconciled: ["Celecoxib 200mg", "Gabapentin 300mg", "Acetaminophen 500mg", "Calcium + Vitamin D"], unreconciled: [] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-19", administeredBy: "CVS Pharmacy" }, { name: "Pneumonia (PPSV23)", date: "2022-03-14", administeredBy: "Orthopedic Center" }, { name: "COVID Booster", date: "2025-04-22", administeredBy: "Main Clinic" }, { name: "Shingles (RZV Dose 2)", date: "2023-08-07", administeredBy: "Walgreens Pharmacy" }, { name: "Tdap", date: "2021-05-30", administeredBy: "Main Clinic" }], unreconciled: [] },
    careGaps: [
      { name: "Post-Op Follow-up", lastPerformed: "2026-03-20", nextDueDate: "2026-09-20" },
      { name: "Bone Density Scan", lastPerformed: "2026-01-25", nextDueDate: "2028-01-25" },
      { name: "PT Discharge Assessment", lastPerformed: "2026-03-18", nextDueDate: "2027-03-18" },
    ],
    screeningsAndLabs: [
      { test: "X-Ray (Hip — post-op)", facility: "Orthopedic Center", date: "2026-03-20" },
      { test: "PT Functional Assessment", facility: "Rehab Center", date: "2026-03-18" },
      { test: "Bone Density (DEXA)", facility: "Imaging Center", date: "2026-01-25" },
      { test: "CBC / BMP (pre-op)", facility: "Lab Corp", date: "2025-12-05" },
      { test: "X-Ray (Hip — baseline)", facility: "Orthopedic Center", date: "2025-09-14" },
    ],
    nurseSummary: [
      "✔ Meds fully reconciled: Celecoxib 200mg QD, Gabapentin 300mg TID, Acetaminophen 500mg Q6H PRN, Calcium 600mg + Vitamin D 400IU BID — all confirmed. ⚠ Opioid allergy (Codeine, Morphine) charted — non-opioid pain plan in place.",
      "✔ Allergies reconciled: Codeine (respiratory depression), Morphine (anaphylaxis), Latex (contact dermatitis) — all verified and flagged.",
      "Vitals: BP 120/74, HR 70, Temp 98.5°F. Pain: 2/10 at rest post-op (improved from 7/10 pre-op).",
      "✔ Immunizations all current: Flu, Pneumonia, COVID Booster, Shingles, Tdap — confirmed registry.",
      "✔ Care gaps closed: Post-op X-ray completed 03/20 — prosthesis aligned, no complications. Bone density completed 01/2026 (T-score -1.8, osteopenia — calcium therapy adjusted). PT discharge assessment completed 03/18 — full weight bearing achieved.",
      "✔ Visit summary: Full recovery achieved. ROM within normal limits. Pt. independent with ADLs. Discharged from PT. Follow-up orthopedic 09/2026.",
    ],
    complaints: [
      "Post-operative hip pain — resolved; pain at 2/10, well-managed with non-opioid regimen",
      "Mild swelling at surgical site — resolved; compression stocking use discontinued per surgeon",
      "Sleep disruption due to discomfort — resolved; sleep improved significantly at 8-week post-op",
    ],
    roi: [
      { id: 16, facility: "Orthopedic Center", requestedDate: "2026-03-22", status: "Completed" },
      { id: 17, facility: "Rehab Center", requestedDate: "2026-03-20", status: "Completed" },
    ]
  },
  15: {
    visits: [
      { type: "Pulmonary", date: "2026-03-25", provider: "Dr. Young" },
      { type: "Sleep Medicine", date: "2026-02-10", provider: "Dr. Lee" },
      { type: "General Checkup", date: "2025-12-18", provider: "Dr. Young" },
    ],
    allergies: { reconciled: ["Aspirin", "Penicillin"], unreconciled: [] },
    medications: { reconciled: ["Tiotropium inhaler", "Fluticasone/Salmeterol", "Montelukast 10mg", "Azithromycin PRN"], unreconciled: [] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-03", administeredBy: "Pulmonology Assoc." }, { name: "Pneumonia (PPSV23)", date: "2020-12-11", administeredBy: "Main Clinic" }, { name: "COVID Booster", date: "2025-03-07", administeredBy: "CVS Pharmacy" }], unreconciled: [] },
    careGaps: [
      { name: "Pulmonary Function Test", lastPerformed: "2026-03-25", nextDueDate: "2026-09-25" },
      { name: "Sleep Study Follow-up", lastPerformed: "2026-02-10", nextDueDate: "2026-08-10" },
      { name: "Chest X-Ray", lastPerformed: "2025-12-18", nextDueDate: "2026-12-18" },
    ],
    screeningsAndLabs: [
      { test: "Pulmonary Function Test", facility: "Pulmonology Assoc.", date: "2026-03-25" },
      { test: "O2 Saturation (Exertional)", facility: "Pulmonology Assoc.", date: "2026-03-25" },
      { test: "Sleep Study (Titration)", facility: "Sleep Center", date: "2026-02-10" },
      { test: "Chest X-Ray", facility: "Imaging Center", date: "2025-12-18" },
      { test: "ABG", facility: "Pulmonology Assoc.", date: "2025-09-30" },
    ],
    nurseSummary: [
      "✔ Meds fully reconciled: Tiotropium 18mcg QD, Fluticasone/Salmeterol 250/50 BID, Montelukast 10mg QHS, Azithromycin Z-pack PRN — all confirmed. Inhaler technique re-assessed; correct technique demonstrated.",
      "✔ Allergies reconciled: Aspirin (bronchospasm), Penicillin (rash) — both verified and charted.",
      "Vitals: BP 126/80, HR 74, Temp 98.4°F. SpO2 96% at rest, 93% on 6-min walk — within COPD target.",
      "✔ Immunizations current: Flu, Pneumonia, COVID Booster confirmed — critical given COPD diagnosis.",
      "✔ Care gaps closed: PFT completed today — FEV1/FVC 0.68 (GOLD stage 2, stable). CPAP titration sleep study 02/2026 — AHI reduced from 32 to 4 events/hr; excellent response. Chest X-Ray 12/2025 — no acute changes.",
      "✔ Visit summary: COPD stable on current regimen; no acute exacerbations in past 6 months. CPAP compliance 85% (good). Pt. educated on action plan. Discharged in stable condition.",
    ],
    complaints: [
      "Exertional dyspnea — significantly improved; O2 sats maintained on current inhaler regimen",
      "Nighttime awakenings due to apnea — resolved; CPAP therapy effective, AHI normalized",
      "Morning productive cough — resolved; attributed to post-nasal drip, treated with Montelukast",
    ],
    roi: [
      { id: 18, facility: "Pulmonology Assoc.", requestedDate: "2026-03-27", status: "Completed" },
      { id: 19, facility: "Sleep Center", requestedDate: "2026-02-12", status: "Completed" },
    ]
  },
  16: {
    visits: [
      { type: "Obstetrics/Gynecology", date: "2026-03-18", provider: "Dr. Hernandez" },
      { type: "Endocrinology", date: "2026-02-22", provider: "Dr. Clark" },
      { type: "General Checkup", date: "2025-11-30", provider: "Dr. Hernandez" },
    ],
    allergies: { reconciled: ["Sulfa", "Iodine", "Latex"], unreconciled: [] },
    medications: { reconciled: ["Levothyroxine 75mcg", "Metformin 500mg", "Prenatal Vitamins", "Folic Acid 400mcg"], unreconciled: [] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-25", administeredBy: "OB/GYN Clinic" }, { name: "COVID Booster", date: "2025-04-14", administeredBy: "Main Clinic" }, { name: "Tdap", date: "2020-08-03", administeredBy: "Main Clinic" }], unreconciled: [] },
    careGaps: [
      { name: "TSH / Free T4", lastPerformed: "2026-02-22", nextDueDate: "2026-08-22" },
      { name: "HbA1c / BMP", lastPerformed: "2026-02-22", nextDueDate: "2026-08-22" },
      { name: "Annual Gyn Exam", lastPerformed: "2026-03-18", nextDueDate: "2027-03-18" },
      { name: "Mammography", lastPerformed: "2025-06-14", nextDueDate: "2026-06-14" },
    ],
    screeningsAndLabs: [
      { test: "TSH / Free T4", facility: "Lab Corp", date: "2026-02-22" },
      { test: "HbA1c / BMP", facility: "Lab Corp", date: "2026-02-22" },
      { test: "Pap Smear", facility: "OB/GYN Clinic", date: "2026-03-18" },
      { test: "Mammography", facility: "Imaging Center", date: "2025-06-14" },
      { test: "Lipid Panel", facility: "Lab Corp", date: "2025-10-08" },
    ],
    nurseSummary: [
      "✔ Meds fully reconciled: Levothyroxine 75mcg QAM (fasting), Metformin 500mg BID with meals, Prenatal Vitamins QD, Folic Acid 400mcg QD — all confirmed. Medication timing counseling provided.",
      "✔ Allergies reconciled: Sulfa (rash), Iodine (anaphylaxis — noted for all contrast orders), Latex (contact dermatitis) — all verified and flagged.",
      "Vitals: BP 116/72, HR 76, Temp 98.5°F. Weight 142 lbs (stable). No peripheral edema.",
      "✔ Immunizations complete: Flu, COVID Booster, Tdap current — appropriate for reproductive-age female.",
      "✔ Care gaps closed: TSH 1.8 mIU/L (optimal), Free T4 1.1 ng/dL — thyroid well-controlled. HbA1c 6.2% (excellent control). Annual Gyn exam + Pap smear completed today — results pending (routine). Mammography 06/2025 — no abnormalities.",
      "✔ Visit summary: All chronic conditions well-managed. Pt. highly engaged in self-care. Next OB/GYN and Endo F/U scheduled 2026. Discharged in excellent condition.",
    ],
    complaints: [
      "Mild morning fatigue — resolved; attributed to suboptimal thyroid levels prior to medication adjustment",
      "Irregular menstrual cycle — resolved; cycles normalized after Metformin optimization and thyroid management",
    ],
    roi: [
      { id: 20, facility: "OB/GYN Clinic", requestedDate: "2026-03-20", status: "Completed" },
    ]
  },
  17: {
    visits: [
      { type: "Neurology", date: "2026-03-22", provider: "Dr. Lopez" },
      { type: "General Checkup", date: "2026-01-14", provider: "Dr. Lopez" },
      { type: "Psychiatry", date: "2025-12-05", provider: "Dr. Chen" },
    ],
    allergies: { reconciled: ["Phenytoin", "Carbamazepine", "Aspirin"], unreconciled: [] },
    medications: { reconciled: ["Levetiracetam 500mg", "Lamotrigine 100mg", "Sertraline 50mg", "Vitamin B6 50mg"], unreconciled: [] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-11-08", administeredBy: "Neurology Clinic" }, { name: "COVID Booster", date: "2025-04-01", administeredBy: "Main Clinic" }, { name: "Meningococcal (MenACWY)", date: "2022-06-19", administeredBy: "Main Clinic" }], unreconciled: [] },
    careGaps: [
      { name: "Epilepsy Monitoring", lastPerformed: "2026-03-22", nextDueDate: "2026-09-22" },
      { name: "Mood Disorder Screening", lastPerformed: "2025-12-05", nextDueDate: "2026-06-05" },
      { name: "Neurology EEG", lastPerformed: "2025-10-18", nextDueDate: "2026-10-18" },
    ],
    screeningsAndLabs: [
      { test: "Drug Level (Levetiracetam)", facility: "Lab Corp", date: "2026-03-22" },
      { test: "PHQ-9 / GAD-7", facility: "Neurology Clinic", date: "2026-03-22" },
      { test: "EEG", facility: "Neurology Center", date: "2025-10-18" },
      { test: "MRI Brain (w/o contrast)", facility: "Imaging Center", date: "2025-08-02" },
      { test: "CBC / BMP", facility: "Lab Corp", date: "2026-01-14" },
    ],
    nurseSummary: [
      "✔ Meds fully reconciled: Levetiracetam 500mg BID, Lamotrigine 100mg QD, Sertraline 50mg QAM, Vitamin B6 50mg QD — all confirmed. ⚠ Seizure threshold medications reviewed; Sertraline dose approved by neurology.",
      "✔ Allergies reconciled: Phenytoin (Stevens-Johnson syndrome), Carbamazepine (agranulocytosis), Aspirin (bronchospasm) — all critical; high-priority EMR flags placed.",
      "Vitals: BP 118/76, HR 68, Temp 98.4°F. Alert and oriented ×4. No neurological deficits on exam.",
      "✔ Immunizations current: Flu, COVID Booster, Meningococcal — current and appropriate.",
      "✔ Care gaps closed: Drug level in therapeutic range (23 mcg/mL). PHQ-9 score 3 (minimal depression, improved from 8). EEG 10/2025 — no epileptiform activity. Seizure-free x14 months.",
      "✔ Visit summary: Epilepsy well-controlled; 14 months seizure-free. Mental health improving. Pt. employed full-time. Driving clearance maintained. Discharged in excellent condition.",
    ],
    complaints: [
      "Breakthrough seizure aura (déjà vu) — resolved; occurred during medication adjustment period 14 months ago, no recurrence",
      "Low mood and anxiety — significantly improved; PHQ-9 score reduced from 8 to 3 with Sertraline therapy",
    ],
    roi: [
      { id: 21, facility: "Neurology Center", requestedDate: "2026-03-24", status: "Completed" },
      { id: 22, facility: "Imaging Center", requestedDate: "2026-03-22", status: "Completed" },
    ]
  },
  18: {
    visits: [
      { type: "Hematology", date: "2026-03-28", provider: "Dr. Martinez" },
      { type: "Oncology", date: "2026-02-14", provider: "Dr. Chen" },
      { type: "General Checkup", date: "2025-12-10", provider: "Dr. Martinez" },
    ],
    allergies: { reconciled: ["Heparin", "Sulfa", "Latex"], unreconciled: [] },
    medications: { reconciled: ["Apixaban 5mg", "Hydroxyurea 500mg", "Folic Acid 1mg", "Iron Sucrose IV PRN"], unreconciled: [] },
    immunizations: { reconciled: [{ name: "Flu Shot", date: "2025-10-16", administeredBy: "Hematology Clinic" }, { name: "Pneumonia (PPSV23)", date: "2021-02-28", administeredBy: "Main Clinic" }, { name: "COVID Booster", date: "2025-03-21", administeredBy: "Walgreens Pharmacy" }, { name: "Meningococcal (MenACWY)", date: "2023-04-05", administeredBy: "Main Clinic" }, { name: "Hepatitis B (Series)", date: "2019-07-14", administeredBy: "Main Clinic" }], unreconciled: [] },
    careGaps: [
      { name: "CBC / Reticulocyte Count", lastPerformed: "2026-03-28", nextDueDate: "2026-06-28" },
      { name: "Hemoglobin Electrophoresis", lastPerformed: "2025-11-20", nextDueDate: "2026-11-20" },
      { name: "Echocardiogram", lastPerformed: "2025-09-05", nextDueDate: "2026-09-05" },
      { name: "Transcranial Doppler", lastPerformed: "2025-06-18", nextDueDate: "2026-06-18" },
    ],
    screeningsAndLabs: [
      { test: "CBC / Reticulocyte / Iron Panel", facility: "Hematology Clinic", date: "2026-03-28" },
      { test: "LDH / Bilirubin", facility: "Lab Corp", date: "2026-03-28" },
      { test: "Hemoglobin Electrophoresis", facility: "Lab Corp", date: "2025-11-20" },
      { test: "Echocardiogram", facility: "Heart Center", date: "2025-09-05" },
      { test: "Transcranial Doppler", facility: "Neurology Center", date: "2025-06-18" },
    ],
    nurseSummary: [
      "✔ Meds fully reconciled: Apixaban 5mg BID, Hydroxyurea 500mg QD, Folic Acid 1mg QD, Iron Sucrose IV PRN (last dose 02/2026) — all confirmed and reconciled. ⚠ Heparin allergy (HIT) — alternative anticoagulation protocol in place.",
      "✔ Allergies reconciled: Heparin (HIT — life-threatening; absolute contraindication flagged), Sulfa (rash), Latex (urticaria) — all verified with critical alerts.",
      "Vitals: BP 114/70, HR 78, Temp 98.5°F. Hgb 10.2 g/dL (stable, baseline 9.5–11 for SCD). No acute pain crisis.",
      "✔ Immunizations fully current: Flu, Pneumonia, COVID Booster, Meningococcal, Hepatitis B — all critical given functional asplenia; confirmed registry.",
      "✔ Care gaps closed: CBC today — Hgb 10.2, MCV 86, Retic 4.2% (stable chronic hemolysis). LDH 220 (baseline). Hgb electrophoresis 11/2025 — HbSS confirmed. Echo 09/2025 — LVEF 62%, no pulmonary HTN. TCD 06/2025 — normal velocities.",
      "✔ Visit summary: Sickle cell disease stable; no vasoocclusive crises in past 6 months on Hydroxyurea. Hgb at personal baseline. Psychosocial support resources provided. Discharged in stable condition.",
    ],
    complaints: [
      "Occasional mild joint aches — resolved; managed with hydration, acetaminophen; no acute pain crisis",
      "Fatigue — resolved at baseline; Hgb stable, iron stores replenished with IV Iron infusion 02/2026",
    ],
    roi: [
      { id: 23, facility: "Hematology Clinic", requestedDate: "2026-03-30", status: "Completed" },
      { id: 24, facility: "Lab Corp", requestedDate: "2026-03-28", status: "Completed" },
    ]
  },
};
