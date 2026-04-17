/**
 * UiPath Data Fabric Seeder
 *
 * Creates all mock data records in Data Fabric entities.
 * Run AFTER creating the entities in the Data Fabric UI.
 *
 * Usage:
 *   node seed-data-fabric.mjs
 *
 * Prerequisites:
 *   - Be logged in: uip login
 *   - Entities must exist in Data Fabric (see entity-schema.md)
 */

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// ─── Auth ────────────────────────────────────────────────────────────────────

function loadAuth() {
  const authFile = join(homedir(), ".uipath", ".auth");
  const raw = readFileSync(authFile, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const [k, ...rest] = line.split("=");
    if (k && rest.length) env[k.trim()] = rest.join("=").trim();
  }
  return {
    token: env["UIPATH_ACCESS_TOKEN"],
    url: env["UIPATH_URL"],
    org: env["UIPATH_ORGANIZATION_NAME"],
    tenant: env["UIPATH_TENANT_NAME"],
  };
}

const auth = loadAuth();
const BASE = `${auth.url}/${auth.org}/${auth.tenant}/datafabric_/api/EntityService`;

// Data Fabric Choice fields require 0-based integer indices
const STAGE    = { "Data Prepared": 0, "Data Validated": 1, "Patient Record Updated": 2, "Readiness Evaluated": 3 };
const STATUS   = { "New": 0, "In Progress": 1, "Completed": 2 };
const CATEGORY = { "Allergy": 0, "Medication": 1, "Immunization": 2 };
const ROI_STATUS = { "Signature Pending": 0, "Sent to Facility": 1, "Completed": 2 };
const VISIT_STATUS = { "Completed": 0, "Pending": 1 };

async function insert(entityName, value) {
  const url = `${BASE}/${entityName}/insert`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(value),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`  ✗ ${entityName}: ${res.status} — ${JSON.stringify(body)}`);
    return null;
  }
  return body;
}

async function insertAll(entityName, records) {
  console.log(`\nSeeding ${entityName} (${records.length} records)...`);
  const results = [];
  for (const rec of records) {
    const result = await insert(entityName, rec);
    if (result) {
      process.stdout.write(".");
      results.push(result);
    }
  }
  console.log(`\n  Done: ${results.length}/${records.length} inserted`);
  return results;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const patients = [
  { Name: "John Doe", MRN: "MRN-001", AppointmentDate: "2026-04-10", Provider: "Dr. Smith", Nurse: "Sarah Johnson, RN", Stage: "Data Prepared", Status: "New", Exception: "None", Readiness: 25 },
  { Name: "Jane Roe", MRN: "MRN-002", AppointmentDate: "2026-04-11", Provider: "Dr. Adams", Nurse: "Michael Chen, RN", Stage: "Data Validated", Status: "In Progress", Exception: "Missing Labs", Readiness: 60 },
  { Name: "Michael Lee", MRN: "MRN-003", AppointmentDate: "2026-04-05", Provider: "Dr. Brown", Nurse: "Emily Rodriguez, RN", Stage: "Data Prepared", Status: "New", Exception: "None", Readiness: 45 },
  { Name: "Sarah Johnson", MRN: "MRN-004", AppointmentDate: "2026-04-12", Provider: "Dr. Wilson", Nurse: "James Patterson, RN", Stage: "Data Validated", Status: "In Progress", Exception: "Insurance Verification", Readiness: 55 },
  { Name: "Robert Martinez", MRN: "MRN-005", AppointmentDate: "2026-04-13", Provider: "Dr. Garcia", Nurse: "Lisa Wong, RN", Stage: "Data Validated", Status: "In Progress", Exception: "None", Readiness: 75 },
  { Name: "Emily Chen", MRN: "MRN-006", AppointmentDate: "2026-04-14", Provider: "Dr. Taylor", Nurse: "David Kumar, RN", Stage: "Patient Record Updated", Status: "In Progress", Exception: "Pending Approval", Readiness: 50 },
  { Name: "David Thompson", MRN: "MRN-007", AppointmentDate: "2026-04-15", Provider: "Dr. Anderson", Nurse: "Jennifer Lee, RN", Stage: "Data Prepared", Status: "New", Exception: "None", Readiness: 20 },
  { Name: "Lisa Anderson", MRN: "MRN-008", AppointmentDate: "2026-04-16", Provider: "Dr. Martinez", Nurse: "Robert Thompson, RN", Stage: "Data Validated", Status: "In Progress", Exception: "Lab Results Pending", Readiness: 65 },
  { Name: "Kevin Wilson", MRN: "MRN-017", AppointmentDate: "2026-04-17", Provider: "Dr. Harris", Nurse: "Sarah Johnson, RN", Stage: "Data Prepared", Status: "New", Exception: "None", Readiness: 30 },
  { Name: "Patricia Brown", MRN: "MRN-018", AppointmentDate: "2026-04-18", Provider: "Dr. Clark", Nurse: "Michael Chen, RN", Stage: "Data Validated", Status: "In Progress", Exception: "Insurance Pending", Readiness: 55 },
  { Name: "James Wilson", MRN: "MRN-009", AppointmentDate: "2026-04-04", Provider: "Dr. Harris", Nurse: "Sarah Johnson, RN", Stage: "Readiness Evaluated", Status: "Completed", Exception: "None", Readiness: 100 },
  { Name: "Patricia Moore", MRN: "MRN-010", AppointmentDate: "2026-04-03", Provider: "Dr. Clark", Nurse: "Michael Chen, RN", Stage: "Readiness Evaluated", Status: "Completed", Exception: "None", Readiness: 100 },
  { Name: "Christopher Davis", MRN: "MRN-011", AppointmentDate: "2026-04-02", Provider: "Dr. Lewis", Nurse: "Emily Rodriguez, RN", Stage: "Readiness Evaluated", Status: "Completed", Exception: "None", Readiness: 100 },
  { Name: "Jennifer Martinez", MRN: "MRN-012", AppointmentDate: "2026-04-01", Provider: "Dr. Walker", Nurse: "James Patterson, RN", Stage: "Readiness Evaluated", Status: "Completed", Exception: "None", Readiness: 100 },
  { Name: "Daniel Rodriguez", MRN: "MRN-013", AppointmentDate: "2026-03-31", Provider: "Dr. Young", Nurse: "Lisa Wong, RN", Stage: "Readiness Evaluated", Status: "Completed", Exception: "None", Readiness: 100 },
  { Name: "Maria Garcia", MRN: "MRN-014", AppointmentDate: "2026-03-30", Provider: "Dr. Hernandez", Nurse: "David Kumar, RN", Stage: "Readiness Evaluated", Status: "Completed", Exception: "None", Readiness: 100 },
  { Name: "Thomas Anderson", MRN: "MRN-015", AppointmentDate: "2026-03-29", Provider: "Dr. Lopez", Nurse: "Jennifer Lee, RN", Stage: "Readiness Evaluated", Status: "Completed", Exception: "None", Readiness: 100 },
  { Name: "Angela Thomas", MRN: "MRN-016", AppointmentDate: "2026-03-28", Provider: "Dr. Martinez", Nurse: "Robert Thompson, RN", Stage: "Readiness Evaluated", Status: "Completed", Exception: "None", Readiness: 100 },
];

// Patient details keyed by MRN (id 1-8 = first 8 patients above)
const patientDetails = {
  "MRN-001": {
    visits: [{ VisitType: "Pulmonary", VisitDate: "2025-12-01", Provider: "Dr. Smith" }, { VisitType: "Cardiology", VisitDate: "2025-11-15", Provider: "Dr. Patel" }, { VisitType: "General Checkup", VisitDate: "2025-10-20", Provider: "Dr. Smith" }],
    allergies: { reconciled: ["Peanuts", "Latex", "Sulfa"], unreconciled: ["Penicillin", "Shellfish"] },
    medications: { reconciled: ["Metformin", "Atorvastatin"], unreconciled: ["Lisinopril", "Aspirin"] },
    immunizations: { reconciled: ["Flu Shot", "Pneumonia"], unreconciled: ["COVID Booster", "Shingles"] },
    careGaps: [{ Name: "Annual Physical", LastPerformed: "2024-03-10", NextDueDate: "2026-03-10" }, { Name: "Blood Pressure Check", LastPerformed: "2025-01-22", NextDueDate: "2026-01-22" }, { Name: "Cholesterol Screening", LastPerformed: "2024-08-15", NextDueDate: "2026-05-20" }],
    screeningsAndLabs: [{ Test: "Blood Pressure", Facility: "Main Clinic", TestDate: "2026-02-10" }, { Test: "CBC", Facility: "Main Clinic", TestDate: "2025-09-05" }, { Test: "Cholesterol Panel", Facility: "Lab Corp", TestDate: "2025-04-18" }, { Test: "Blood Pressure", Facility: "Main Clinic", TestDate: "2024-11-20" }, { Test: "HbA1c", Facility: "Lab Corp", TestDate: "2024-06-12" }],
    nurseSummary: ["Meds: Pt. states taking Metformin + Atorvastatin as prescribed. Lisinopril + Aspirin unreconciled — unable to confirm; follow up with PCP.", "Allergies: Penicillin + Shellfish reported unverified — pt. confirmed allergic to both. Chart updated.", "Vitals: BP 138/86 at intake — slightly elevated, flagged for provider. HR 74, Temp 98.4°F.", "Vaccines: COVID Booster + Shingles not yet received per pt. — referral to pharmacy placed.", "Care Gaps: Annual Physical overdue since 03/2024 — pt. unaware; PCP referral placed. BP check completed today.", "Pt. denies chest pain or SOB today. C/o mild bilateral ankle swelling x2 wks — noted for provider review."],
    complaints: ["Bilateral ankle swelling x2 weeks, pitting noted on left > right", "Exertional shortness of breath — occurs with climbing >1 flight of stairs", "Afternoon fatigue, difficulty completing ADLs by mid-day", "Occasional mild chest tightness at rest — denies radiation to arm/jaw"],
    roi: [{ Facility: "General Hospital", RequestedDate: "2026-04-08", Status: "Signature Pending" }, { Facility: "City Clinic", RequestedDate: "2026-04-07", Status: "Sent to Facility" }],
  },
  "MRN-002": {
    visits: [{ VisitType: "Cardiology", VisitDate: "2025-11-15", Provider: "Dr. Adams" }, { VisitType: "General Checkup", VisitDate: "2025-10-20", Provider: "Dr. Adams" }, { VisitType: "Dermatology", VisitDate: "2025-09-10", Provider: "Dr. Lee" }],
    allergies: { reconciled: ["Sulfa", "NSAIDs"], unreconciled: ["Latex", "Penicillin"] },
    medications: { reconciled: ["Atorvastatin", "Ibuprofen"], unreconciled: ["Aspirin", "Metformin"] },
    immunizations: { reconciled: ["Pneumonia", "Flu Shot"], unreconciled: ["Shingles", "COVID Booster"] },
    careGaps: [{ Name: "Blood Pressure Check", LastPerformed: "2025-02-10", NextDueDate: "2026-02-10" }, { Name: "Cholesterol Screening", LastPerformed: "2024-07-18", NextDueDate: "2026-05-10" }, { Name: "Skin Cancer Screening", LastPerformed: "2023-11-05", NextDueDate: "2026-05-01" }],
    screeningsAndLabs: [{ Test: "Lipid Panel", Facility: "Heart Center", TestDate: "2026-01-14" }, { Test: "Blood Pressure", Facility: "Main Clinic", TestDate: "2025-08-22" }, { Test: "ECG", Facility: "Heart Center", TestDate: "2025-03-09" }, { Test: "Cholesterol Panel", Facility: "Lab Corp", TestDate: "2024-09-30" }, { Test: "Blood Pressure", Facility: "Main Clinic", TestDate: "2024-05-17" }],
    nurseSummary: ["Meds: Atorvastatin + Ibuprofen active. ⚠ Pt. has NSAIDs allergy — confirmed NOT taking Ibuprofen; flagged for provider. Aspirin + Metformin unreconciled.", "Allergies: Latex + Penicillin unverified — pt. reports h/o mild rash with Penicillin. Latex sensitivity noted, gloves changed. Chart updated.", "Vitals: BP 126/82 — within baseline. HR 68, Temp 98.2°F.", "Vaccines: Shingles + COVID Booster not received per pt. — scheduled at next pharmacy visit.", "Care Gaps: BP check completed today. Skin Cancer Screening due 05/2026 — pt. denies new lesions; referred to Dermatology.", "Pt. c/o intermittent palpitations x1 wk, no dizziness. Denies skin changes. Noted for cardiology review."],
    complaints: ["Intermittent heart palpitations x1 week — episodes lasting ~30 seconds, no syncope", "New pigmented mole on left forearm, noticed ~3 weeks ago; no bleeding or itching reported", "Occasional dizziness on standing from seated position, resolves within seconds"],
    roi: [{ Facility: "Heart Center", RequestedDate: "2026-04-06", Status: "Completed" }],
  },
  "MRN-003": {
    visits: [{ VisitType: "Orthopedic", VisitDate: "2025-09-30", Provider: "Dr. Brown" }, { VisitType: "Physical Therapy", VisitDate: "2025-10-15", Provider: "Dr. Brown" }],
    allergies: { reconciled: ["NSAIDs"], unreconciled: ["Sulfa", "Shellfish"] },
    medications: { reconciled: ["Ibuprofen"], unreconciled: ["Metformin", "Atorvastatin"] },
    immunizations: { reconciled: ["Flu Shot", "COVID Booster"], unreconciled: ["Pneumonia"] },
    careGaps: [{ Name: "Physical Therapy", LastPerformed: "2025-10-15", NextDueDate: "2026-04-15" }, { Name: "Annual Physical", LastPerformed: "2024-06-20", NextDueDate: "2026-06-10" }],
    screeningsAndLabs: [{ Test: "X-Ray (Knee)", Facility: "Orthopedic Center", TestDate: "2025-09-30" }, { Test: "CBC", Facility: "Main Clinic", TestDate: "2025-05-14" }, { Test: "X-Ray (Knee)", Facility: "Orthopedic Center", TestDate: "2024-10-08" }, { Test: "Metabolic Panel", Facility: "Lab Corp", TestDate: "2024-06-20" }],
    nurseSummary: ["Meds: Ibuprofen active. Metformin + Atorvastatin unreconciled — pt. unsure if still prescribed; will follow up with PCP for clarification.", "Allergies: Sulfa + Shellfish unverified — pt. confirmed h/o hives with Sulfa. Shellfish — pt. unsure; documented as unverified.", "Vitals: BP 118/76, HR 80, Temp 98.6°F. Pain level 4/10 (right knee).", "Vaccines: Pneumonia vaccine not received post-op per pt. — scheduled at next visit.", "Care Gaps: PT attendance confirmed — attended 3 of last 4 sessions. Annual Physical due 06/2026 — PCP appointment not yet booked.", "Pt. c/o right knee stiffness in AM, improving throughout day. No redness or warmth at surgical site. Home PT exercises done 3x/wk per pt."],
    complaints: ["Right knee pain rated 4/10 at rest, 7/10 with activity; worsens on stair climbing", "Morning stiffness lasting ~30 minutes, improving with movement", "Difficulty fully extending right knee — limited ROM noted", "Mild generalized fatigue following physical therapy sessions"],
    roi: [],
  },
  "MRN-004": {
    visits: [{ VisitType: "General Checkup", VisitDate: "2025-10-05", Provider: "Dr. Martinez" }, { VisitType: "Neurology", VisitDate: "2025-09-20", Provider: "Dr. Chen" }],
    allergies: { reconciled: ["Penicillin", "Codeine"], unreconciled: ["Latex"] },
    medications: { reconciled: ["Gabapentin", "Levothyroxine"], unreconciled: ["Sertraline"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia", "Shingles"] },
    careGaps: [{ Name: "Thyroid Function Test", LastPerformed: "2024-12-01", NextDueDate: "2026-06-01" }, { Name: "Mental Health Screening", LastPerformed: "2024-09-14", NextDueDate: "2026-03-20" }, { Name: "Neurological Assessment", LastPerformed: "2025-09-20", NextDueDate: "2026-05-25" }],
    screeningsAndLabs: [{ Test: "TSH (Thyroid)", Facility: "Lab Corp", TestDate: "2026-01-08" }, { Test: "Neurological Assessment", Facility: "Neurology Clinic", TestDate: "2025-09-20" }, { Test: "TSH (Thyroid)", Facility: "Lab Corp", TestDate: "2025-03-15" }, { Test: "CBC", Facility: "Main Clinic", TestDate: "2024-10-05" }, { Test: "TSH (Thyroid)", Facility: "Lab Corp", TestDate: "2024-06-18" }],
    nurseSummary: ["Meds: Gabapentin + Levothyroxine confirmed. Pt. states taking Levothyroxine at 7AM daily. Sertraline unreconciled — pt. states started 2 months ago by PCP; dose unknown.", "Allergies: Latex unverified — pt. reports no prior reactions; documented as precautionary. Gloves changed to non-latex.", "Vitals: BP 122/78, HR 66, Temp 98.5°F. PHQ-2 score: 2 — PHQ-9 administered; score 7 (mild depression), flagged for provider.", "Vaccines: COVID Booster, Pneumonia + Shingles all pending — pt. declined today; documented. Follow up at next visit.", "Care Gaps: Mental Health Screening completed today (PHQ-9). Neuro Assessment due 05/2026 — pt. aware; coord. with Dr. Chen.", "Pt. c/o fatigue and mild memory lapses x3 wks. Denies headaches or vision changes. Reports 5 lb weight gain over 2 months — noted for thyroid review."],
    complaints: ["Persistent fatigue and low energy x3 weeks — difficulty concentrating at work", "Memory lapses — forgetting names and appointments; new onset per pt.", "5 lb unintentional weight gain over past 2 months despite no dietary changes", "Recurring headaches 2-3x/week, frontal, moderate intensity, relieved with Tylenol", "Low mood and decreased motivation — PHQ-9 score 7 (mild) today"],
    roi: [{ Facility: "Neurology Clinic", RequestedDate: "2026-04-05", Status: "Signature Pending" }],
  },
  "MRN-005": {
    visits: [{ VisitType: "Gastroenterology", VisitDate: "2025-11-10", Provider: "Dr. Nguyen" }, { VisitType: "General Checkup", VisitDate: "2025-10-15", Provider: "Dr. Nguyen" }],
    allergies: { reconciled: ["Shellfish", "Soy"], unreconciled: ["Nuts", "Sesame"] },
    medications: { reconciled: ["Omeprazole", "Simvastatin"], unreconciled: ["Metformin"] },
    immunizations: { reconciled: ["Pneumonia", "Flu Shot", "COVID Booster"], unreconciled: ["Shingles"] },
    careGaps: [{ Name: "Colonoscopy", LastPerformed: "2021-05-12", NextDueDate: "2026-05-12" }, { Name: "Liver Function Tests", LastPerformed: "2024-11-03", NextDueDate: "2026-05-03" }, { Name: "Dietary Consultation", LastPerformed: "2024-04-28", NextDueDate: "2026-04-28" }],
    screeningsAndLabs: [{ Test: "Liver Function Tests", Facility: "GI Specialists", TestDate: "2026-02-20" }, { Test: "H. Pylori Test", Facility: "GI Specialists", TestDate: "2025-11-10" }, { Test: "Liver Function Tests", Facility: "Lab Corp", TestDate: "2025-05-03" }, { Test: "Lipid Panel", Facility: "Lab Corp", TestDate: "2024-10-15" }],
    nurseSummary: ["Meds: Omeprazole + Simvastatin confirmed. Metformin unreconciled — pt. states taking 500mg BID; reports mild nausea. Added to reconciled list pending provider sign-off.", "Allergies: Nuts + Sesame unverified — pt. reports h/o throat tightening with tree nuts. Sesame unclear. EpiPen at home per pt. Chart flagged.", "Vitals: BP 120/74, HR 70, Temp 98.7°F. Wt: 182 lbs (down 4 lbs from last visit).", "Vaccines: Shingles pending — pt. eligible; scheduled for next pharmacy visit.", "Care Gaps: Colonoscopy overdue — pt. has not had one since 2021; urgent GI Specialists referral placed today. LFTs ordered.", "Pt. c/o bloating and reflux 3-4x/wk, worse after dinner. Denies blood in stool. BMs regular. Dietary consult referral placed."],
    complaints: ["Bloating and acid reflux 3-4x/week, worse after evening meals and when lying down", "Morning nausea without vomiting x3 weeks; pt. relates to Metformin initiation", "Change in bowel habits x6 weeks — alternating loose stools and constipation", "Mild epigastric discomfort after meals, rated 3/10"],
    roi: [{ Facility: "GI Specialists", RequestedDate: "2026-04-04", Status: "Sent to Facility" }, { Facility: "Lab Services", RequestedDate: "2026-04-02", Status: "Completed" }],
  },
  "MRN-006": {
    visits: [{ VisitType: "Rheumatology", VisitDate: "2025-11-01", Provider: "Dr. Patel" }, { VisitType: "Physical Therapy", VisitDate: "2025-10-20", Provider: "Dr. Brown" }],
    allergies: { reconciled: ["Aspirin", "NSAIDs"], unreconciled: ["Sulfa"] },
    medications: { reconciled: ["Methotrexate", "Prednisone"], unreconciled: ["Hydroxychloroquine"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia", "Shingles"] },
    careGaps: [{ Name: "Blood Work", LastPerformed: "2025-03-05", NextDueDate: "2026-06-05" }, { Name: "Rheumatology Follow-up", LastPerformed: "2025-01-15", NextDueDate: "2026-03-15" }, { Name: "Joint Assessment", LastPerformed: "2024-10-20", NextDueDate: "2026-04-20" }],
    screeningsAndLabs: [{ Test: "CBC / Metabolic Panel", Facility: "Lab Corp", TestDate: "2026-03-05" }, { Test: "CRP / ESR", Facility: "Rheumatology Center", TestDate: "2025-10-12" }, { Test: "CBC / Metabolic Panel", Facility: "Lab Corp", TestDate: "2025-04-28" }, { Test: "CRP / ESR", Facility: "Rheumatology Center", TestDate: "2024-11-01" }, { Test: "CBC / Metabolic Panel", Facility: "Lab Corp", TestDate: "2024-05-22" }],
    nurseSummary: ["Meds: Methotrexate + Prednisone confirmed. Pt. denies mouth sores or easy bruising. Reports mild nausea 1-2x/wk after Methotrexate. Hydroxychloroquine unreconciled — pt. states starting next week per rheumatologist.", "Allergies: Sulfa unverified — pt. confirmed h/o rash. Critical given immunosuppressive therapy — provider alerted.", "Vitals: BP 130/82, HR 76, Temp 98.3°F. Morning stiffness reported: ~45 min bilat. hands + wrists.", "Vaccines: COVID Booster, Pneumonia + Shingles pending — live vaccines contraindicated w/ Methotrexate; provider must approve before scheduling.", "Care Gaps: Rheumatology F/U overdue — pt. states appt. canceled 3/2026; rescheduling in progress. Joint Assessment performed today; ROM limited at wrists bilat.", "Pt. c/o increased joint pain over past 2 wks. Denies vision changes or light sensitivity. Ophthalmology screen (Hydroxychloroquine) not yet scheduled — noted."],
    complaints: ["Bilateral wrist and hand joint pain — rated 5/10 at rest, worsening with gripping", "Morning stiffness in hands and wrists lasting approximately 45 minutes daily", "Generalized fatigue x2 weeks — pt. reports difficulty completing household tasks", "Nausea 1-2x/week following Methotrexate dose on Mondays"],
    roi: [{ Facility: "Rheumatology Center", RequestedDate: "2026-04-08", Status: "Signature Pending" }],
  },
  "MRN-007": {
    visits: [{ VisitType: "Pulmonary", VisitDate: "2025-12-10", Provider: "Dr. Smith" }, { VisitType: "Sleep Medicine", VisitDate: "2025-11-25", Provider: "Dr. Lee" }],
    allergies: { reconciled: ["Tree Nuts"], unreconciled: ["Shellfish", "Fish"] },
    medications: { reconciled: ["Albuterol", "Fluticasone"], unreconciled: ["Montelukast"] },
    immunizations: { reconciled: ["Flu Shot", "Pneumonia", "COVID Booster"], unreconciled: ["Shingles"] },
    careGaps: [{ Name: "Pulmonary Function Test", LastPerformed: "2025-06-18", NextDueDate: "2026-06-10" }, { Name: "Sleep Study", LastPerformed: "2024-03-22", NextDueDate: "2026-03-22" }, { Name: "Oxygen Saturation Monitoring", LastPerformed: "2025-11-25", NextDueDate: "2026-02-28" }],
    screeningsAndLabs: [{ Test: "Pulmonary Function Test", Facility: "Pulmonology Associates", TestDate: "2025-12-10" }, { Test: "Oxygen Saturation", Facility: "Main Clinic", TestDate: "2025-06-18" }, { Test: "Chest X-Ray", Facility: "Pulmonology Associates", TestDate: "2025-01-30" }, { Test: "Pulmonary Function Test", Facility: "Pulmonology Associates", TestDate: "2024-07-09" }],
    nurseSummary: ["Meds: Albuterol + Fluticasone confirmed. Inhaler technique reviewed — pt. demonstrated correct use. Montelukast unreconciled — pt. states taking 10mg QD per pulmonologist.", "Allergies: Shellfish + Fish unverified — pt. reports h/o hives with shellfish; fish unclear. Chart flagged. Non-latex gloves used.", "Vitals: BP 118/74, HR 82, Temp 98.5°F. SpO2: 96% on RA — within acceptable range, noted.", "Vaccines: Shingles pending — scheduled for next visit.", "Care Gaps: Sleep Study overdue — pt. stopped CPAP 6 months ago; still symptomatic (snoring, daytime fatigue). Referral to Sleep Medicine placed. O2 Sat monitored today.", "Pt. c/o nighttime coughing 3-4x/wk and exertional SOB. Denies recent ER visits or oral steroids. No respiratory infections since last visit. PFT due 06/2026 — pt. aware."],
    complaints: ["Nighttime coughing episodes 3-4x/week, worse in early morning; disrupts sleep", "Exertional shortness of breath — onset after walking >1 city block", "Daytime fatigue — pt. falling asleep at desk; correlates with poor nighttime sleep", "Loud snoring with witnessed apnea episodes per bed partner; stopped CPAP 6 months ago"],
    roi: [{ Facility: "Pulmonology Associates", RequestedDate: "2026-04-07", Status: "Sent to Facility" }],
  },
  "MRN-008": {
    visits: [{ VisitType: "Oncology", VisitDate: "2025-10-30", Provider: "Dr. Chen" }, { VisitType: "General Checkup", VisitDate: "2025-10-15", Provider: "Dr. Martinez" }],
    allergies: { reconciled: ["Contrast Dye", "Latex"], unreconciled: ["Chemotherapy agents"] },
    medications: { reconciled: ["Tamoxifen", "Loratadine"], unreconciled: ["Vitamin D supplement"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia"] },
    careGaps: [{ Name: "Oncology Follow-up", LastPerformed: "2025-10-30", NextDueDate: "2026-04-30" }, { Name: "Mammography", LastPerformed: "2024-08-09", NextDueDate: "2026-02-15" }, { Name: "Tumor Markers", LastPerformed: "2025-09-15", NextDueDate: "2026-03-15" }, { Name: "Bone Density Scan", LastPerformed: "2023-12-01", NextDueDate: "2026-05-15" }],
    screeningsAndLabs: [{ Test: "Tumor Markers (CA 15-3)", Facility: "Cancer Center", TestDate: "2026-02-15" }, { Test: "Mammography", Facility: "Imaging Center", TestDate: "2025-08-09" }, { Test: "Tumor Markers (CA 15-3)", Facility: "Cancer Center", TestDate: "2025-03-20" }, { Test: "Bone Density Scan", Facility: "Imaging Center", TestDate: "2024-12-01" }, { Test: "CBC / Metabolic Panel", Facility: "Lab Corp", TestDate: "2024-07-11" }],
    nurseSummary: ["Meds: Tamoxifen + Loratadine confirmed. Pt. reports hot flashes daily and AM joint stiffness — documented, flagged for provider. Vitamin D supplement unreconciled; pt. states taking 2000 IU OTC.", "Allergies: Chemotherapy agents allergy unreconciled — critical; provider alerted before any new Rx ordered. Contrast Dye + Latex confirmed, chart updated.", "Vitals: BP 124/78, HR 70, Temp 98.4°F. Wt: 164 lbs (stable). Pt. denies leg swelling or unusual vaginal bleeding.", "Vaccines: COVID Booster + Pneumonia pending — immunosuppressed; vaccination hold confirmed with oncology team.", "Care Gaps: Mammography overdue — not done since 08/2024; urgent referral placed to Imaging Center. Tumor Markers (CA 15-3) overdue — labs ordered today.", "Pt. c/o increased fatigue x3 wks and decreased appetite. Denies new pain. Oncology F/U confirmed 04/30/2026 at Cancer Center."],
    complaints: ["Increased fatigue x3 weeks — sleeping 10+ hours/night, still exhausted; affecting daily function", "Decreased appetite — eating ~50% of usual meals; 3 lb unintentional weight loss in 3 weeks", "Daily hot flashes — 4-6 episodes/day, lasting 5-10 minutes; disrupting sleep", "AM joint stiffness in hands and knees, lasting ~20 minutes; attributed to Tamoxifen", "Mild lower back ache x1 week — rated 2/10, no radiation to legs; noted for oncology review"],
    roi: [{ Facility: "Cancer Center", RequestedDate: "2026-04-06", Status: "Completed" }, { Facility: "Imaging Center", RequestedDate: "2026-04-05", Status: "Signature Pending" }],
  },
};

const visitsToday = [
  { PatientName: "John Doe", AppointmentTime: "09:00 AM", Provider: "Dr. Smith", Nurse: "Sarah Johnson, RN", Status: "Completed" },
  { PatientName: "Jane Roe", AppointmentTime: "09:30 AM", Provider: "Dr. Adams", Nurse: "Michael Chen, RN", Status: "Completed" },
  { PatientName: "Michael Lee", AppointmentTime: "10:00 AM", Provider: "Dr. Brown", Nurse: "Emily Rodriguez, RN", Status: "Pending" },
  { PatientName: "Sarah Johnson", AppointmentTime: "10:30 AM", Provider: "Dr. Wilson", Nurse: "James Patterson, RN", Status: "Pending" },
  { PatientName: "Robert Martinez", AppointmentTime: "11:00 AM", Provider: "Dr. Garcia", Nurse: "Sarah Johnson, RN", Status: "Completed" },
  { PatientName: "Emily Chen", AppointmentTime: "11:30 AM", Provider: "Dr. Taylor", Nurse: "Michael Chen, RN", Status: "Pending" },
];

const weeklyMetrics = [
  { Week: "Week 1", VisitCount: 58, AHT: 22 },
  { Week: "Week 2", VisitCount: 72, AHT: 18 },
  { Week: "Week 3", VisitCount: 65, AHT: 28 },
  { Week: "Week 4", VisitCount: 85, AHT: 24 },
  { Week: "Week 5", VisitCount: 92, AHT: 26 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== UiPath Data Fabric Seeder ===");
  console.log(`Tenant: ${auth.org}/${auth.tenant}`);
  console.log(`Base URL: ${BASE}`);

  // 1. Seed FMIPatient (get back IDs to link related records)
  console.log("\n[1/6] Seeding FMIPatient entity...");
  const patientResults = [];
  for (const p of patients) {
    const result = await insert("FMIPatient", {
      ...p,
      Stage: STAGE[p.Stage],
      Status: STATUS[p.Status],
    });
    if (result) {
      process.stdout.write(".");
      patientResults.push({ mrn: p.MRN, id: result?.Id });
    }
  }
  console.log(`\n  Done: ${patientResults.length}/${patients.length} inserted`);

  // Build MRN → ID lookup
  const mrnToId = {};
  for (const r of patientResults) {
    if (r.id) mrnToId[r.mrn] = r.id;
  }
  console.log("  Patient ID map:", Object.keys(mrnToId).length, "entries");

  // 2-6. Seed related records for patients with detail data
  const visits = [], reconciliations = [], careGaps = [], screeningLabs = [], rois = [];
  const nurseSummaries = [], complaints = [];

  for (const [mrn, detail] of Object.entries(patientDetails)) {
    const patientId = mrnToId[mrn];

    for (const v of detail.visits) visits.push({ ...v, Patient: patientId });
    for (const c of detail.careGaps) careGaps.push({ ...c, Patient: patientId });
    for (const s of detail.screeningsAndLabs) screeningLabs.push({ ...s, Patient: patientId });
    for (const r of detail.roi) rois.push({ ...r, Patient: patientId, Status: ROI_STATUS[r.Status] });
    detail.nurseSummary.forEach((s, i) => nurseSummaries.push({ Patient: patientId, Summary: s, SortOrder: i + 1 }));
    detail.complaints.forEach((c, i) => complaints.push({ Patient: patientId, Complaint: c, SortOrder: i + 1 }));

    for (const item of detail.allergies.reconciled)
      reconciliations.push({ Patient: patientId, Category: CATEGORY["Allergy"], ItemName: item, IsReconciled: true });
    for (const item of detail.allergies.unreconciled)
      reconciliations.push({ Patient: patientId, Category: CATEGORY["Allergy"], ItemName: item, IsReconciled: false });
    for (const item of detail.medications.reconciled)
      reconciliations.push({ Patient: patientId, Category: CATEGORY["Medication"], ItemName: item, IsReconciled: true });
    for (const item of detail.medications.unreconciled)
      reconciliations.push({ Patient: patientId, Category: CATEGORY["Medication"], ItemName: item, IsReconciled: false });
    for (const item of detail.immunizations.reconciled)
      reconciliations.push({ Patient: patientId, Category: CATEGORY["Immunization"], ItemName: item, IsReconciled: true });
    for (const item of detail.immunizations.unreconciled)
      reconciliations.push({ Patient: patientId, Category: CATEGORY["Immunization"], ItemName: item, IsReconciled: false });
  }

  console.log("\n[2/6] Seeding FMIPatientVisit entity...");
  await insertAll("FMIPatientVisit", visits);

  console.log("\n[3/6] Seeding FMIReconciliationItem entity...");
  await insertAll("FMIReconciliationItem", reconciliations);

  console.log("\n[4/6] Seeding FMICareGap entity...");
  await insertAll("FMICareGap", careGaps);

  console.log("\n[5/6] Seeding FMIScreeningLab entity...");
  await insertAll("FMIScreeningLab", screeningLabs);

  console.log("\n[6/6] Seeding FMIROI entity...");
  await insertAll("FMIROI", rois);

  console.log("\n[+] Seeding FMINurseSummary entity...");
  await insertAll("FMINurseSummary", nurseSummaries);

  // FMIPatientComplaint entity not yet confirmed — skipping
  // await insertAll("FMIPatientComplaint", complaints);

  console.log("\n[+] Seeding FMITodayVisit entity...");
  await insertAll("FMITodayVisit", visitsToday.map(v => ({ ...v, Status: VISIT_STATUS[v.Status] })));

  console.log("\n[+] Seeding FMIWeeklyMetric entity...");
  await insertAll("FMIWeeklyMetric", weeklyMetrics);

  console.log("\n\n=== Seeding complete! ===");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
