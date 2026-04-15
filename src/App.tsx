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
interface Visit { type: string; date: string; }
interface ReconcilableItem { reconciled: string[]; unreconciled: string[]; }
interface PatientDetail {
  visits: Visit[]; allergies: ReconcilableItem; medications: ReconcilableItem;
  immunizations: ReconcilableItem; careGaps: string[]; nurseSummary: string; roi: ROI[];
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
  immunizations: { reconciled: [], unreconciled: [] }, careGaps: [], nurseSummary: "No data", roi: []
};
const patientDetails: Record<number, PatientDetail> = {
  1: {
    visits: [{ type: "Pulmonary", date: "2025-12-01" }, { type: "Cardiology", date: "2025-11-15" }, { type: "General Checkup", date: "2025-10-20" }],
    allergies: { reconciled: ["Peanuts", "Latex", "Sulfa"], unreconciled: ["Penicillin", "Shellfish"] },
    medications: { reconciled: ["Metformin", "Atorvastatin"], unreconciled: ["Lisinopril", "Aspirin"] },
    immunizations: { reconciled: ["Flu Shot", "Pneumonia"], unreconciled: ["COVID Booster", "Shingles"] },
    careGaps: ["Annual Physical", "Blood Pressure Check", "Cholesterol Screening"],
    nurseSummary: "Confirm medication adherence. Monitor cardiac medications. Patient education provided.",
    roi: [
      { id: 1, facility: "General Hospital", requestedDate: "2026-04-08", status: "Signature Pending" },
      { id: 2, facility: "City Clinic", requestedDate: "2026-04-07", status: "Sent to Facility" }
    ]
  },
  2: {
    visits: [{ type: "Cardiology", date: "2025-11-15" }, { type: "General Checkup", date: "2025-10-20" }, { type: "Dermatology", date: "2025-09-10" }],
    allergies: { reconciled: ["Sulfa", "NSAIDs"], unreconciled: ["Latex", "Penicillin"] },
    medications: { reconciled: ["Atorvastatin", "Ibuprofen"], unreconciled: ["Aspirin", "Metformin"] },
    immunizations: { reconciled: ["Pneumonia", "Flu Shot"], unreconciled: ["Shingles", "COVID Booster"] },
    careGaps: ["Blood Pressure Check", "Cholesterol Screening", "Skin Cancer Screening"],
    nurseSummary: "Monitor cardiac medications. Advise on NSAID alternatives. Encourage regular skin checks.",
    roi: [{ id: 3, facility: "Heart Center", requestedDate: "2026-04-06", status: "Completed" }]
  },
  3: {
    visits: [{ type: "Orthopedic", date: "2025-09-30" }, { type: "Physical Therapy", date: "2025-10-15" }],
    allergies: { reconciled: ["NSAIDs"], unreconciled: ["Sulfa", "Shellfish"] },
    medications: { reconciled: ["Ibuprofen"], unreconciled: ["Metformin", "Atorvastatin"] },
    immunizations: { reconciled: ["Flu Shot", "COVID Booster"], unreconciled: ["Pneumonia"] },
    careGaps: ["Physical Therapy", "Annual Physical"],
    nurseSummary: "Follow-up on surgery recovery. Reinforce importance of physical therapy attendance.",
    roi: []
  },
  4: {
    visits: [{ type: "General Checkup", date: "2025-10-05" }, { type: "Neurology", date: "2025-09-20" }],
    allergies: { reconciled: ["Penicillin", "Codeine"], unreconciled: ["Latex"] },
    medications: { reconciled: ["Gabapentin", "Levothyroxine"], unreconciled: ["Sertraline"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia", "Shingles"] },
    careGaps: ["Thyroid Function Test", "Mental Health Screening", "Neurological Assessment"],
    nurseSummary: "Monitor neurological symptoms. Verify thyroid medication compliance. Screen for depression.",
    roi: [{ id: 4, facility: "Neurology Clinic", requestedDate: "2026-04-05", status: "Signature Pending" }]
  },
  5: {
    visits: [{ type: "Gastroenterology", date: "2025-11-10" }, { type: "General Checkup", date: "2025-10-15" }],
    allergies: { reconciled: ["Shellfish", "Soy"], unreconciled: ["Nuts", "Sesame"] },
    medications: { reconciled: ["Omeprazole", "Simvastatin"], unreconciled: ["Metformin"] },
    immunizations: { reconciled: ["Pneumonia", "Flu Shot", "COVID Booster"], unreconciled: ["Shingles"] },
    careGaps: ["Colonoscopy", "Liver Function Tests", "Dietary Consultation"],
    nurseSummary: "Schedule colonoscopy screening. Review dietary modifications. Monitor GI symptoms.",
    roi: [
      { id: 5, facility: "GI Specialists", requestedDate: "2026-04-04", status: "Sent to Facility" },
      { id: 6, facility: "Lab Services", requestedDate: "2026-04-02", status: "Completed" }
    ]
  },
  6: {
    visits: [{ type: "Rheumatology", date: "2025-11-01" }, { type: "Physical Therapy", date: "2025-10-20" }],
    allergies: { reconciled: ["Aspirin", "NSAIDs"], unreconciled: ["Sulfa"] },
    medications: { reconciled: ["Methotrexate", "Prednisone"], unreconciled: ["Hydroxychloroquine"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia", "Shingles"] },
    careGaps: ["Blood Work", "Rheumatology Follow-up", "Joint Assessment"],
    nurseSummary: "Monitor methotrexate side effects. Ensure regular lab work. Assess joint mobility.",
    roi: [{ id: 7, facility: "Rheumatology Center", requestedDate: "2026-04-08", status: "Signature Pending" }]
  },
  7: {
    visits: [{ type: "Pulmonary", date: "2025-12-10" }, { type: "Sleep Medicine", date: "2025-11-25" }],
    allergies: { reconciled: ["Tree Nuts"], unreconciled: ["Shellfish", "Fish"] },
    medications: { reconciled: ["Albuterol", "Fluticasone"], unreconciled: ["Montelukast"] },
    immunizations: { reconciled: ["Flu Shot", "Pneumonia", "COVID Booster"], unreconciled: ["Shingles"] },
    careGaps: ["Pulmonary Function Test", "Sleep Study", "Oxygen Saturation Monitoring"],
    nurseSummary: "Assess asthma control. Review inhaler technique. Schedule sleep study if indicated.",
    roi: [{ id: 8, facility: "Pulmonology Associates", requestedDate: "2026-04-07", status: "Sent to Facility" }]
  },
  8: {
    visits: [{ type: "Oncology", date: "2025-10-30" }, { type: "General Checkup", date: "2025-10-15" }],
    allergies: { reconciled: ["Contrast Dye", "Latex"], unreconciled: ["Chemotherapy agents"] },
    medications: { reconciled: ["Tamoxifen", "Loratadine"], unreconciled: ["Vitamin D supplement"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia"] },
    careGaps: ["Oncology Follow-up", "Mammography", "Tumor Markers", "Bone Density Scan"],
    nurseSummary: "Monitor Tamoxifen side effects. Schedule mammography screening. Assess quality of life.",
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
  if (status === "Completed") return { color: "#16a34a", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.05em" };
  if (status === "Sent to Facility") return { color: "#2563eb", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.05em" };
  return { color: "#dc2626", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.05em", background: "#fee2e2", padding: "3px 8px", borderRadius: 4 };
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
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#475569" }}><strong style={{ color: "#1e293b" }}>{item.value}</strong> {item.label}</span>
          </div>
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
  const largeArc = value > 50 ? 1 : 0;
  const needleRad = endRad;
  const needleX = cx + (r - 6) * Math.cos(needleRad);
  const needleY = cy + (r - 6) * Math.sin(needleRad);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={100} height={58} viewBox="0 0 100 58">
        <path d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${startY}`} fill="none" stroke="#e5e7eb" strokeWidth={6} strokeLinecap="round" />
        {value > 0 && (
          <path d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${arcX.toFixed(2)} ${arcY.toFixed(2)}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
        )}
        <line x1={cx} y1={cy} x2={needleX.toFixed(2)} y2={needleY.toFixed(2)} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={3} fill={color} />
      </svg>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: -4 }}>{value}%</div>
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
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px" }}>
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
    { label: "Total Patients", value: totalCount, sub: "All records", color: "#94a3b8", onClick: undefined as (() => void) | undefined },
    { label: "Upcoming", value: upcomingCount, sub: "Awaiting intake", color: "#3b82f6", onClick: () => onNavigateToUpcoming() },
    { label: "In Progress", value: inProgressCount, sub: "Active today", color: "#f59e0b", onClick: () => onNavigateToUpcoming() },
    { label: "Completed", value: completedCount, sub: "Intake done", color: "#22c55e", onClick: () => onNavigateToCompleted() },
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
        <button onClick={() => onNavigateToUpcoming()} style={{ padding: "8px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>View Queue</button>
      </div>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} onClick={s.onClick} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${s.color}`, borderRadius: 8, padding: "18px 20px", cursor: s.onClick ? "pointer" : "default" }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Stage Distribution</div>
          <DonutChart data={stageData} total={totalCount} />
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Status Overview</div>
          <DonutChart data={statusData} total={totalCount} />
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px" }}>
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
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
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
                  <td style={{ ...tdS, textAlign: "center" }}><span style={{ color: s.pending > 0 ? "#ef4444" : "#22c55e", fontWeight: 700 }}>{s.pending}</span></td>
                  <td style={{ ...tdS, textAlign: "center" }}><span style={{ color: "#22c55e", fontWeight: 700 }}>{s.completed}</span></td>
                  <td style={{ ...tdS, textAlign: "center" }}><span style={{ color: "#3b82f6", fontWeight: 700 }}>{s.total}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
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
                  <td style={tdS}><span style={roiStatusStyle(roi.status)}>{roi.status.toUpperCase()}</span></td>
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
  const selStyle: React.CSSProperties = { ...inputCss, minWidth: 130 };
  const thS: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #e2e8f0" };
  const tdS: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13 };
  return (
    <div style={{ padding: "32px 36px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{isCompleted ? "Completed Visits" : "Upcoming Visits"}</h1>
        <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>{isCompleted ? "Review past patient visits" : "Review upcoming visits and manage schedules"}</p>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Filter Records</div>
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
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
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
                <td style={tdS}><span style={{ color: stageColors[p.stage] || "#6b7280", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>{p.stage.toUpperCase()}</span></td>
                <td style={tdS}><span style={{ color: statusColor(p.status), fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>{p.status.toUpperCase()}</span></td>
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
  const thS: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0" };
  const tdS: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#374151" };
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
        <div style={{ width: 220, flexShrink: 0, background: "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)", padding: "28px 20px", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 57px)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <Avatar name={patient.name} size={52} />
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginTop: 12, textAlign: "center" }}>{patient.name}</div>
          </div>
          {[
            { label: "MRN", value: patient.mrn },
            { label: "Visit Date", value: patient.date },
            { label: "Provider", value: patient.provider },
            { label: "Nurse", value: patient.nurse }
          ].map(({ label, value }) => (
            <div key={label} style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 12, paddingBottom: 12 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3, fontWeight: 700 }}>{label}</div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
          <div style={{ marginTop: 8, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: 6 }}>⚡ Intake Summary</div>
            <div style={{ color: "#fff", fontSize: 12, lineHeight: 1.5 }}>{d.nurseSummary}</div>
          </div>
        </div>
        {/* Right content */}
        <div style={{ flex: 1, padding: "24px 32px" }}>
          {/* Progress + Readiness */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 18 }}>Intake Progress</div>
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
                <div style={{ position: "absolute", top: 11, left: "6%", right: "6%", height: 2, background: "#e2e8f0", zIndex: 0 }} />
                <div style={{ position: "absolute", top: 11, left: "6%", width: `${Math.max(0, currentStageIdx / (stages.length - 1)) * 88}%`, height: 2, background: "#3b82f6", zIndex: 1 }} />
                {stages.map((s, i) => {
                  const done = i <= currentStageIdx;
                  return (
                    <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "#3b82f6" : "#e2e8f0", border: i === currentStageIdx ? "3px solid #bfdbfe" : done ? "none" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {done && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                      <div style={{ fontSize: 10, color: done ? "#2563eb" : "#94a3b8", marginTop: 6, textAlign: "center", fontWeight: done ? 600 : 400, maxWidth: 80 }}>{s}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Readiness</div>
              <ReadinessGauge value={patient.readiness} />
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
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Clinical Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Recent Visits</div>
                    {d.visits.map((v, i) => <div key={i} style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>• {v.type} ({v.date})</div>)}
                  </div>
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Care Gaps</div>
                    {d.careGaps.map((g, i) => <div key={i} style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>• {g}</div>)}
                  </div>
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Complaints</div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>Patient presenting with various medical concerns. Review intake summary for details.</div>
                  </div>
                </div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px" }}>
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
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Reconciled</span>
                        </div>
                      ))}
                      {data.unreconciled.map((item) => (
                        <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" /></svg>
                            <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706" }}>Pending</span>
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
                  {["Lisinopril 10mg daily", "Metformin 500mg twice daily", "Atorvastatin 20mg daily"].map((m) => <div key={m} style={{ fontSize: 13, color: "#475569", padding: "3px 0" }}>• {m}</div>)}
                </SectionCard>
                <SectionCard title="Allergies">
                  {[...d.allergies.reconciled, ...d.allergies.unreconciled].map((a) => <div key={a} style={{ fontSize: 13, color: "#475569", padding: "3px 0" }}>• {a}</div>)}
                </SectionCard>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <SectionCard title="Immunizations">
                  {["COVID-19 (Moderna) — 01/15/2025", "Influenza (Quad) — 09/20/2024", "Tdap — 02/10/2020"].map((im) => <div key={im} style={{ fontSize: 13, color: "#475569", padding: "3px 0" }}>• {im}</div>)}
                </SectionCard>
                <SectionCard title="Screenings & Labs">
                  {["Blood Pressure — Normal — 03/15/2025", "Cholesterol — Elevated — 01/20/2025", "CBC — Normal — 03/10/2025"].map((sc) => <div key={sc} style={{ fontSize: 13, color: "#475569", padding: "3px 0" }}>• {sc}</div>)}
                </SectionCard>
              </div>
            </div>
          )}
          {/* ROI tab */}
          {activeTab === "roi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {isAuthenticated && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px 20px" }}>
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
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
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
  const secStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px", marginBottom: 16 };
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
