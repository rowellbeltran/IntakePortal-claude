import React, { useState } from "react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  sidebar: "#0F172A",
  sidebarActive: "#1E293B",
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  teal: "#0D9488",
  tealLight: "#F0FDFA",
  success: "#16A34A",
  successLight: "#F0FDF4",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  text: "#0F172A",
  textMid: "#475569",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  radius: "8px",
  radiusSm: "6px",
};

// Stage system — 4 milestones
const STAGES = ["Data Prepared", "Data Validated", "Patient Record Updated", "Readiness Evaluated"];
const STAGE_COLORS = [T.primary, T.teal, T.warning, T.success];

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Patient {
  id: number; name: string; mrn: string; date: string;
  provider: string; nurse: string; stage: string;
  status: string; exception: string; readiness: number;
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

// ─── Data ──────────────────────────────────────────────────────────────────────
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
  // Completed
  { id: 11, name: "James Wilson", mrn: "MRN-009", date: "2026-04-04", provider: "Dr. Harris", nurse: "Sarah Johnson, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 12, name: "Patricia Moore", mrn: "MRN-010", date: "2026-04-03", provider: "Dr. Clark", nurse: "Michael Chen, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 13, name: "Christopher Davis", mrn: "MRN-011", date: "2026-04-02", provider: "Dr. Lewis", nurse: "Emily Rodriguez, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 14, name: "Jennifer Martinez", mrn: "MRN-012", date: "2026-04-01", provider: "Dr. Walker", nurse: "James Patterson, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 15, name: "Daniel Rodriguez", mrn: "MRN-013", date: "2026-03-31", provider: "Dr. Young", nurse: "Lisa Wong, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 16, name: "Maria Garcia", mrn: "MRN-014", date: "2026-03-30", provider: "Dr. Hernandez", nurse: "David Kumar, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 17, name: "Thomas Anderson", mrn: "MRN-015", date: "2026-03-29", provider: "Dr. Lopez", nurse: "Jennifer Lee, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
  { id: 18, name: "Angela Thomas", mrn: "MRN-016", date: "2026-03-28", provider: "Dr. Martinez", nurse: "Robert Thompson, RN", stage: "Readiness Evaluated", status: "Completed", exception: "None", readiness: 100 },
];

const defaultDetails: PatientDetail = {
  visits: [], allergies: { reconciled: [], unreconciled: [] },
  medications: { reconciled: [], unreconciled: [] }, immunizations: { reconciled: [], unreconciled: [] },
  careGaps: [], nurseSummary: "No data available.", roi: [],
};

const patientDetails: Record<number, PatientDetail> = {
  1: {
    ...defaultDetails,
    visits: [{ type: "Pulmonary", date: "2025-12-01" }, { type: "Cardiology", date: "2025-11-15" }, { type: "General Checkup", date: "2025-10-20" }],
    allergies: { reconciled: ["Peanuts", "Latex", "Sulfa"], unreconciled: ["Penicillin", "Shellfish"] },
    medications: { reconciled: ["Metformin", "Atorvastatin"], unreconciled: ["Lisinopril", "Aspirin"] },
    immunizations: { reconciled: ["Flu Shot", "Pneumonia"], unreconciled: ["COVID Booster", "Shingles"] },
    careGaps: ["Annual Physical", "Blood Pressure Check", "Cholesterol Screening"],
    nurseSummary: "Confirm medication adherence. Monitor cardiac medications. Patient education provided regarding allergy management.",
    roi: [
      { id: 1, facility: "General Hospital", requestedDate: "2026-04-08", status: "Patient Signature Pending" },
      { id: 2, facility: "City Clinic", requestedDate: "2026-04-07", status: "Sent to Facility" },
    ],
  },
  2: {
    ...defaultDetails,
    visits: [{ type: "Cardiology", date: "2025-11-15" }, { type: "General Checkup", date: "2025-10-20" }, { type: "Dermatology", date: "2025-09-10" }],
    allergies: { reconciled: ["Sulfa", "NSAIDs"], unreconciled: ["Latex", "Penicillin"] },
    medications: { reconciled: ["Atorvastatin", "Ibuprofen"], unreconciled: ["Aspirin", "Metformin"] },
    immunizations: { reconciled: ["Pneumonia", "Flu Shot"], unreconciled: ["Shingles", "COVID Booster"] },
    careGaps: ["Blood Pressure Check", "Cholesterol Screening", "Skin Cancer Screening"],
    nurseSummary: "Monitor cardiac medications. Advise on NSAID alternatives. Encourage regular skin checks.",
    roi: [{ id: 3, facility: "Heart Center", requestedDate: "2026-04-06", status: "Completed" }],
  },
  3: {
    ...defaultDetails,
    visits: [{ type: "Orthopedic", date: "2025-09-30" }, { type: "Physical Therapy", date: "2025-10-15" }],
    allergies: { reconciled: ["NSAIDs"], unreconciled: ["Sulfa", "Shellfish"] },
    medications: { reconciled: ["Ibuprofen"], unreconciled: ["Metformin", "Atorvastatin"] },
    immunizations: { reconciled: ["Flu Shot", "COVID Booster"], unreconciled: ["Pneumonia"] },
    careGaps: ["Physical Therapy", "Annual Physical"],
    nurseSummary: "Follow-up on surgery recovery. Reinforce importance of physical therapy attendance.",
    roi: [],
  },
  4: {
    ...defaultDetails,
    visits: [{ type: "General Checkup", date: "2025-10-05" }, { type: "Neurology", date: "2025-09-20" }],
    allergies: { reconciled: ["Penicillin", "Codeine"], unreconciled: ["Latex"] },
    medications: { reconciled: ["Gabapentin", "Levothyroxine"], unreconciled: ["Sertraline"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia", "Shingles"] },
    careGaps: ["Thyroid Function Test", "Mental Health Screening", "Neurological Assessment"],
    nurseSummary: "Monitor neurological symptoms. Verify thyroid medication compliance. Screen for depression.",
    roi: [{ id: 4, facility: "Neurology Clinic", requestedDate: "2026-04-05", status: "Patient Signature Pending" }],
  },
  5: {
    ...defaultDetails,
    visits: [{ type: "Gastroenterology", date: "2025-11-10" }, { type: "General Checkup", date: "2025-10-15" }],
    allergies: { reconciled: ["Shellfish", "Soy"], unreconciled: ["Nuts", "Sesame"] },
    medications: { reconciled: ["Omeprazole", "Simvastatin"], unreconciled: ["Metformin"] },
    immunizations: { reconciled: ["Pneumonia", "Flu Shot", "COVID Booster"], unreconciled: ["Shingles"] },
    careGaps: ["Colonoscopy", "Liver Function Tests", "Dietary Consultation"],
    nurseSummary: "Schedule colonoscopy screening. Review dietary modifications. Monitor GI symptoms.",
    roi: [
      { id: 5, facility: "GI Specialists", requestedDate: "2026-04-04", status: "Sent to Facility" },
      { id: 6, facility: "Lab Services", requestedDate: "2026-04-02", status: "Completed" },
    ],
  },
  6: {
    ...defaultDetails,
    visits: [{ type: "Rheumatology", date: "2025-11-01" }, { type: "Physical Therapy", date: "2025-10-20" }],
    allergies: { reconciled: ["Aspirin", "NSAIDs"], unreconciled: ["Sulfa"] },
    medications: { reconciled: ["Methotrexate", "Prednisone"], unreconciled: ["Hydroxychloroquine"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia", "Shingles"] },
    careGaps: ["Blood Work", "Rheumatology Follow-up", "Joint Assessment"],
    nurseSummary: "Monitor methotrexate side effects. Ensure regular lab work. Assess joint mobility and pain levels.",
    roi: [{ id: 7, facility: "Rheumatology Center", requestedDate: "2026-04-08", status: "Patient Signature Pending" }],
  },
  7: {
    ...defaultDetails,
    visits: [{ type: "Pulmonary", date: "2025-12-10" }, { type: "Sleep Medicine", date: "2025-11-25" }],
    allergies: { reconciled: ["Tree Nuts"], unreconciled: ["Shellfish", "Fish"] },
    medications: { reconciled: ["Albuterol", "Fluticasone"], unreconciled: ["Montelukast"] },
    immunizations: { reconciled: ["Flu Shot", "Pneumonia", "COVID Booster"], unreconciled: ["Shingles"] },
    careGaps: ["Pulmonary Function Test", "Sleep Study", "Oxygen Saturation Monitoring"],
    nurseSummary: "Assess asthma control. Review inhaler technique. Schedule sleep study if indicated.",
    roi: [{ id: 8, facility: "Pulmonology Associates", requestedDate: "2026-04-07", status: "Sent to Facility" }],
  },
  8: {
    ...defaultDetails,
    visits: [{ type: "Oncology", date: "2025-10-30" }, { type: "General Checkup", date: "2025-10-15" }],
    allergies: { reconciled: ["Contrast Dye", "Latex"], unreconciled: ["Chemotherapy agents"] },
    medications: { reconciled: ["Tamoxifen", "Loratadine"], unreconciled: ["Vitamin D supplement"] },
    immunizations: { reconciled: ["Flu Shot"], unreconciled: ["COVID Booster", "Pneumonia"] },
    careGaps: ["Oncology Follow-up", "Mammography", "Tumor Markers", "Bone Density Scan"],
    nurseSummary: "Monitor Tamoxifen side effects. Schedule mammography screening. Assess cancer-related fatigue.",
    roi: [
      { id: 9, facility: "Cancer Center", requestedDate: "2026-04-06", status: "Completed" },
      { id: 10, facility: "Imaging Center", requestedDate: "2026-04-05", status: "Patient Signature Pending" },
    ],
  },
};

const visitsToday: VisitToday[] = [
  { id: 1, patient: "John Doe", time: "09:00 AM", provider: "Dr. Smith", nurse: "Sarah Johnson, RN", status: "Completed" },
  { id: 2, patient: "Jane Roe", time: "09:30 AM", provider: "Dr. Adams", nurse: "Michael Chen, RN", status: "Completed" },
  { id: 3, patient: "Michael Lee", time: "10:00 AM", provider: "Dr. Brown", nurse: "Emily Rodriguez, RN", status: "Pending" },
  { id: 4, patient: "Sarah Johnson", time: "10:30 AM", provider: "Dr. Wilson", nurse: "James Patterson, RN", status: "Pending" },
  { id: 5, patient: "Robert Martinez", time: "11:00 AM", provider: "Dr. Garcia", nurse: "Sarah Johnson, RN", status: "Completed" },
  { id: 6, patient: "Emily Chen", time: "11:30 AM", provider: "Dr. Taylor", nurse: "Michael Chen, RN", status: "Pending" },
];

const roiRequests: ROI[] = [
  { id: 1, patient: "John Doe", facility: "General Hospital", requestedDate: "2026-04-08", status: "Patient Signature Pending" },
  { id: 2, patient: "John Doe", facility: "City Clinic", requestedDate: "2026-04-07", status: "Sent to Facility" },
  { id: 3, patient: "Jane Roe", facility: "Heart Center", requestedDate: "2026-04-06", status: "Completed" },
  { id: 4, patient: "Michael Lee", facility: "Specialty Clinic", requestedDate: "2026-04-05", status: "Patient Signature Pending" },
  { id: 5, patient: "Sarah Johnson", facility: "General Hospital", requestedDate: "2026-04-04", status: "Sent to Facility" },
  { id: 6, patient: "Robert Martinez", facility: "Cardiology Center", requestedDate: "2026-04-03", status: "Completed" },
];

const weeklyVisits: WeeklyVisit[] = [
  { week: "Week 1", visits: 58, aht: 22 },
  { week: "Week 2", visits: 72, aht: 18 },
  { week: "Week 3", visits: 65, aht: 28 },
  { week: "Week 4", visits: 85, aht: 24 },
  { week: "Week 5", visits: 92, aht: 26 },
];

// ─── Badge ─────────────────────────────────────────────────────────────────────
const Badge: React.FC<{ label: string; color?: "green" | "blue" | "teal" | "amber" | "red" | "gray" }> = ({ label, color = "gray" }) => {
  const map = {
    green: { bg: T.successLight, text: T.success },
    blue: { bg: T.primaryLight, text: T.primary },
    teal: { bg: T.tealLight, text: T.teal },
    amber: { bg: T.warningLight, text: T.warning },
    red: { bg: T.dangerLight, text: T.danger },
    gray: { bg: "#F1F5F9", text: T.textMid },
  };
  const c = map[color];
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: c.bg, color: c.text }}>
      {label}
    </span>
  );
};

const statusBadge = (s: string) => {
  if (s === "New") return <Badge label="New" color="blue" />;
  if (s === "In Progress") return <Badge label="In Progress" color="amber" />;
  if (s === "Completed") return <Badge label="Completed" color="green" />;
  return <Badge label={s} />;
};

const stageBadge = (s: string) => {
  if (s === "Data Prepared") return <Badge label={s} color="blue" />;
  if (s === "Data Validated") return <Badge label={s} color="teal" />;
  if (s === "Patient Record Updated") return <Badge label={s} color="amber" />;
  if (s === "Readiness Evaluated") return <Badge label={s} color="green" />;
  return <Badge label={s} />;
};

const roiStatusBadge = (s: string) => {
  if (s === "Completed") return <Badge label="Completed" color="green" />;
  if (s === "Sent to Facility") return <Badge label="Sent to Facility" color="blue" />;
  if (s === "Patient Signature Pending") return <Badge label="Signature Pending" color="red" />;
  return <Badge label={s} />;
};

// ─── ReadinessBar ──────────────────────────────────────────────────────────────
const ReadinessBar: React.FC<{ value: number }> = ({ value }) => {
  const color = value < 40 ? T.danger : value < 80 ? T.warning : T.success;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.3s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 30, textAlign: "right" }}>{value}%</span>
    </div>
  );
};

// ─── ReadinessMeter ────────────────────────────────────────────────────────────
const ReadinessMeter: React.FC<{ value: number }> = ({ value }) => {
  // Semicircle gauge: 180° arc from left to right, needle points to value
  const W = 90, H = 54;
  const cx = W / 2, cy = H - 4;
  const r = 36, rTick = 30, rNeedle = 32;
  // -180° (left) = 0%, 0° (right) = 100%; angle in degrees from positive-x
  const toAngle = (v: number) => 180 - (v / 100) * 180; // 180→0 as value goes 0→100
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const needleAngle = toRad(toAngle(value));
  const nx = cx + rNeedle * Math.cos(needleAngle);
  const ny = cy - rNeedle * Math.sin(needleAngle);
  // Color zones: red 0-40, amber 40-80, green 80-100
  const zones = [
    { from: 0, to: 40, color: T.danger },
    { from: 40, to: 80, color: T.warning },
    { from: 80, to: 100, color: T.success },
  ];
  const arcPath = (from: number, to: number) => {
    const a1 = toRad(toAngle(from));
    const a2 = toRad(toAngle(to));
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  // Tick marks at 0,25,50,75,100
  const ticks = [0, 25, 50, 75, 100];
  const color = value < 40 ? T.danger : value < 80 ? T.warning : T.success;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Track */}
        <path d={arcPath(0, 100)} fill="none" stroke={T.border} strokeWidth={5} strokeLinecap="round" />
        {/* Color zone arcs */}
        {zones.map(z => (
          <path key={z.from} d={arcPath(z.from, z.to)} fill="none" stroke={z.color} strokeWidth={5} strokeLinecap="round" opacity={0.25} />
        ))}
        {/* Filled value arc */}
        <path d={arcPath(0, value)} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
        {/* Tick marks */}
        {ticks.map(t => {
          const a = toRad(toAngle(t));
          const x1 = cx + (r - 5) * Math.cos(a), y1 = cy - (r - 5) * Math.sin(a);
          const x2 = cx + (r + 1) * Math.cos(a), y2 = cy - (r + 1) * Math.sin(a);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.textLight} strokeWidth={1.5} strokeLinecap="round" />;
        })}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={T.text} strokeWidth={1.5} strokeLinecap="round" style={{ transition: "x2 0.4s ease, y2 0.4s ease" }} />
        {/* Needle pivot */}
        <circle cx={cx} cy={cy} r={3} fill={T.text} />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 800, color, marginTop: -2, lineHeight: 1 }}>{value}%</span>
    </div>
  );
};

// ─── DonutChart ────────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = 50, cy = 50, r = 40, stroke = 12, circumference = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = total > 0 ? (seg.value / total) * circumference : 0;
    // Use SVG transform attribute (not CSS) so rotation origin works correctly inside <svg>
    const el = (
      <circle key={seg.label} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`} />
    );
    offset += dash;
    return el;
  });
  return (
    <div>
      {/* SVG centered, fixed size — no horizontal flex that can overflow */}
      <svg width={100} height={100} viewBox="0 0 100 100" style={{ display: "block", margin: "0 auto" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        {arcs}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight={700} fill={T.text}>{total}</text>
      </svg>
      {/* Legend below, 2-col grid so long labels wrap gracefully */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px", marginTop: 14 }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: T.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <strong style={{ color: T.text }}>{seg.value}</strong> {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Shared UI ─────────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "20px 24px", ...style }}>{children}</div>
);

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => {
  const p = name.trim().split(" ");
  const initials = p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: T.primaryLight, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, flexShrink: 0 }}>
      {initials.toUpperCase()}
    </div>
  );
};

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</label>
);

const FieldInput: React.FC<{ value?: string; onChange?: (v: string) => void; placeholder?: string; type?: string }> = ({ value, onChange, placeholder, type = "text" }) => {
  const [f, setF] = useState(false);
  return <input type={type} value={value ?? ""} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)}
    style={{ width: "100%", padding: "8px 12px", border: `1px solid ${f ? T.primary : T.border}`, borderRadius: T.radiusSm, outline: "none", boxShadow: f ? `0 0 0 3px ${T.primaryLight}` : "none", fontSize: 14, color: T.text, background: T.white, transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box" }} />;
};

const FieldSelect: React.FC<{ value?: string; onChange?: (v: string) => void; options: string[] }> = ({ value, onChange, options }) => {
  const [f, setF] = useState(false);
  return <select value={value ?? ""} onChange={e => onChange?.(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)}
    style={{ width: "100%", padding: "8px 12px", border: `1px solid ${f ? T.primary : T.border}`, borderRadius: T.radiusSm, outline: "none", boxShadow: f ? `0 0 0 3px ${T.primaryLight}` : "none", fontSize: 14, color: T.text, background: T.white, appearance: "none", cursor: "pointer", boxSizing: "border-box" }}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>;
};

const Btn: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" }> = ({ children, onClick, variant = "primary", size = "md" }) => {
  const [h, setH] = useState(false);
  const sz = { sm: { padding: "6px 12px", fontSize: 13 }, md: { padding: "9px 18px", fontSize: 14 } };
  const v: Record<string, React.CSSProperties> = {
    primary: { background: h ? "#1D4ED8" : T.primary, color: T.white },
    secondary: { background: h ? T.border : "#F1F5F9", color: T.text, border: `1px solid ${T.border}` },
    ghost: { background: h ? "#F1F5F9" : "transparent", color: T.textMid },
  };
  return <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", border: "none", borderRadius: T.radiusSm, fontWeight: 600, lineHeight: 1, ...sz[size], ...v[variant] }}>{children}</button>;
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
const IconDash = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconClock = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheck = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconBack = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconCheckSm = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

// ─── Sidebar ───────────────────────────────────────────────────────────────────
type View = "dashboard" | "upcoming" | "completed" | "patient" | "create-roi";

const Sidebar: React.FC<{ active: string; onNav: (v: View) => void }> = ({ active, onNav }) => {
  const nav = [
    { id: "dashboard", label: "Dashboard", Icon: IconDash },
    { id: "upcoming", label: "Upcoming", Icon: IconClock },
    { id: "completed", label: "Completed", Icon: IconCheck },
  ];
  return (
    <div style={{ width: 216, minHeight: "100vh", background: T.sidebar, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#FA4616", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#FFF" }}>Family Medicine</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Intake Portal</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {nav.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onNav(id as View)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", background: isActive ? T.sidebarActive : "transparent", borderLeft: isActive ? `3px solid ${T.primary}` : "3px solid transparent", color: isActive ? "#FFF" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400, textAlign: "left" }}>
              <Icon />{label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>RB</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Rowell B.</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Coordinator</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const DashboardPage: React.FC<{ onNav: (v: View, nurse?: string) => void }> = ({ onNav }) => {
  const upcoming = patients.filter(p => p.status !== "Completed");
  const completed = patients.filter(p => p.status === "Completed");
  const newCount = patients.filter(p => p.status === "New").length;
  const inProgressCount = patients.filter(p => p.status === "In Progress").length;

  const aprnStats: Record<string, { total: number; pending: number; completed: number }> = {};
  visitsToday.forEach(v => {
    if (!aprnStats[v.nurse]) aprnStats[v.nurse] = { total: 0, pending: 0, completed: 0 };
    aprnStats[v.nurse].total++;
    if (v.status === "Pending") aprnStats[v.nurse].pending++; else aprnStats[v.nurse].completed++;
  });

  const stageSegments = STAGES.map((s, i) => ({ label: s, value: patients.filter(p => p.stage === s).length, color: STAGE_COLORS[i] }));
  const statusSegments = [
    { label: "New", value: newCount, color: T.primary },
    { label: "In Progress", value: inProgressCount, color: T.warning },
    { label: "Completed", value: completed.length, color: T.success },
  ];

  // KPI config
  const kpis = [
    { label: "Total Patients", value: patients.length, sub: "All records", accent: T.textMid, onClick: undefined },
    { label: "Upcoming", value: upcoming.length, sub: "Awaiting intake", accent: T.primary, onClick: () => onNav("upcoming") },
    { label: "In Progress", value: inProgressCount, sub: "Active today", accent: T.warning, onClick: () => onNav("upcoming") },
    { label: "Completed", value: completed.length, sub: "Intake done", accent: T.success, onClick: () => onNav("completed") },
  ];

  return (
    <div style={{ flex: 1, padding: "28px 32px", background: T.bg, overflowY: "auto" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Intake Summary</h1>
          <p style={{ color: T.textLight, fontSize: 13 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Btn variant="secondary" size="sm" onClick={() => onNav("upcoming")}>View Queue</Btn>
      </div>

      {/* KPI row — 4 equal cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} onClick={k.onClick}
            style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "20px 22px", cursor: k.onClick ? "pointer" : "default", borderLeft: `3px solid ${k.accent}`, transition: "box-shadow 0.15s" }}
            onMouseEnter={e => { if (k.onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.07)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
            <div style={{ fontSize: 12, color: T.textLight, fontWeight: 500, marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: k.accent, lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: T.textLight }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Middle row: two donuts + trend chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2.5fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Stage Distribution</div>
          <DonutChart segments={stageSegments} />
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Status Overview</div>
          <DonutChart segments={statusSegments} />
        </Card>

        {/* Weekly Visits Trend */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Weekly Visits — YTD</div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: T.teal, opacity: 0.65 }} />
                <span style={{ fontSize: 11, color: T.textLight }}>AHT (min)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 16, height: 2, borderRadius: 1, background: T.primary }} />
                <span style={{ fontSize: 11, color: T.textLight }}>Visits</span>
              </div>
            </div>
          </div>
          {/*
            width="100%" + no height attr → SVG scales to fill card width
            and adjusts height to maintain the viewBox aspect ratio (500:150 ≈ 3.3:1).
            No preserveAspectRatio="none" so nothing gets squished or stretched.
          */}
          <svg width="100%" viewBox="0 0 500 150" style={{ display: "block" }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((pct, i) => (
              <line key={i} x1="32" y1={126 - pct * 1.04} x2="500" y2={126 - pct * 1.04} stroke={T.border} strokeWidth="1" />
            ))}
            {/* Y-axis labels */}
            {[0, 50, 100].map((v, i) => (
              <text key={i} x="26" y={130 - (v / 100) * 104} fontSize="9" fill={T.textLight} textAnchor="end" dominantBaseline="middle">{v}</text>
            ))}
            {/* AHT bars */}
            {weeklyVisits.map((item, i) => {
              const bw = 24, x = 46 + (i / (weeklyVisits.length - 1)) * 416 - bw / 2;
              const bh = (item.aht / 30) * 104;
              return <rect key={`b${i}`} x={x} y={126 - bh} width={bw} height={bh} rx="3" fill={T.teal} opacity="0.4" />;
            })}
            {/* Visit line area fill */}
            <polyline
              points={[`46,126`, ...weeklyVisits.map((item, i) => `${46 + (i / (weeklyVisits.length - 1)) * 416},${126 - (item.visits / 100) * 104}`), `462,126`].join(" ")}
              fill={T.primary} fillOpacity="0.06" stroke="none"
            />
            {/* Visit line */}
            <polyline
              points={weeklyVisits.map((item, i) => `${46 + (i / (weeklyVisits.length - 1)) * 416},${126 - (item.visits / 100) * 104}`).join(" ")}
              fill="none" stroke={T.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Points + labels */}
            {weeklyVisits.map((item, i) => {
              const x = 46 + (i / (weeklyVisits.length - 1)) * 416;
              const y = 126 - (item.visits / 100) * 104;
              return (
                <g key={`p${i}`}>
                  <circle cx={x} cy={y} r="4" fill={T.white} stroke={T.primary} strokeWidth="2" />
                  <text x={x} y={y - 9} fontSize="9" fill={T.primary} textAnchor="middle" fontWeight="600">{item.visits}</text>
                  <text x={x} y={143} fontSize="9" fill={T.textLight} textAnchor="middle">{item.week}</text>
                </g>
              );
            })}
          </svg>
        </Card>
      </div>

      {/* Bottom row: nurse assignments + recent ROI */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Nurse Visit Assignments</div>
            <div style={{ fontSize: 12, color: T.textLight, marginTop: 2 }}>Today's schedule — click a row to filter queue</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {["Nurse", "Pending", "Completed", "Total"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 20px", fontSize: 11, fontWeight: 600, color: T.textLight, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(aprnStats).map(([nurse, stats], idx, arr) => (
                <tr key={nurse} onClick={() => onNav("upcoming", nurse)}
                  style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.bg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <td style={{ padding: "11px 20px", fontSize: 13, color: T.text, fontWeight: 500 }}>{nurse}</td>
                  <td style={{ padding: "11px 20px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.danger, background: T.dangerLight, padding: "3px 10px", borderRadius: 999 }}>{stats.pending}</span>
                  </td>
                  <td style={{ padding: "11px 20px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.success, background: T.successLight, padding: "3px 10px", borderRadius: 999 }}>{stats.completed}</span>
                  </td>
                  <td style={{ padding: "11px 20px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.primary, background: T.primaryLight, padding: "3px 10px", borderRadius: 999 }}>{stats.total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Recent ROI Requests</div>
            <div style={{ fontSize: 12, color: T.textLight, marginTop: 2 }}>Latest release of information activity</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {["Patient", "Facility", "Date", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 20px", fontSize: 11, fontWeight: 600, color: T.textLight, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roiRequests.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < roiRequests.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <td style={{ padding: "11px 20px", fontSize: 13, fontWeight: 500, color: T.text }}>{r.patient}</td>
                  <td style={{ padding: "11px 20px", fontSize: 13, color: T.textMid }}>{r.facility}</td>
                  <td style={{ padding: "11px 20px", fontSize: 12, color: T.textLight, whiteSpace: "nowrap" }}>{r.requestedDate}</td>
                  <td style={{ padding: "11px 20px" }}>{roiStatusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

// ─── Queue Page ─────────────────────────────────────────────────────────────────
const QueuePage: React.FC<{ queueType: "upcoming" | "completed"; onSelect: (p: Patient) => void; initialNurse?: string }> = ({ queueType, onSelect, initialNurse = "" }) => {
  const base = patients.filter(p => queueType === "completed" ? p.status === "Completed" : p.status !== "Completed");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [nurse, setNurse] = useState(initialNurse);

  const uniqueStages = Array.from(new Set(base.map(p => p.stage)));
  const uniqueStatuses = Array.from(new Set(base.map(p => p.status)));
  const uniqueProviders = Array.from(new Set(base.map(p => p.provider)));
  const uniqueNurses = Array.from(new Set(base.map(p => p.nurse)));

  const filtered = base.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.mrn.toLowerCase().includes(search.toLowerCase()) || p.nurse.toLowerCase().includes(search.toLowerCase())) &&
    (!stage || p.stage === stage) && (!status || p.status === status) &&
    (!provider || p.provider === provider) && (!nurse || p.nurse === nurse)
  );

  const anyFilter = !!(search || stage || status || provider || nurse);
  const clearAll = () => { setSearch(""); setStage(""); setStatus(""); setProvider(""); setNurse(""); };

  return (
    <div style={{ flex: 1, padding: 28, background: T.bg, overflowY: "auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{queueType === "completed" ? "Completed Visits" : "Upcoming Visits"}</h1>
        <p style={{ color: T.textMid, fontSize: 13, marginTop: 3 }}>{queueType === "completed" ? "Review and analyze past patient visits" : "Review upcoming visits and manage schedules"}</p>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 18, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Filter Records</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr", gap: 12 }}>
          <FieldInput value={search} onChange={setSearch} placeholder="Name, MRN, or Nurse..." />
          <FieldSelect value={stage || "All Stages"} onChange={v => setStage(v === "All Stages" ? "" : v)} options={["All Stages", ...uniqueStages]} />
          <FieldSelect value={status || "All Statuses"} onChange={v => setStatus(v === "All Statuses" ? "" : v)} options={["All Statuses", ...uniqueStatuses]} />
          <FieldSelect value={provider || "All Providers"} onChange={v => setProvider(v === "All Providers" ? "" : v)} options={["All Providers", ...uniqueProviders]} />
          <FieldSelect value={nurse || "All Nurses"} onChange={v => setNurse(v === "All Nurses" ? "" : v)} options={["All Nurses", ...uniqueNurses]} />
        </div>
        {anyFilter && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: "10px 14px", background: T.primaryLight, borderRadius: T.radiusSm }}>
            <span style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>Showing {filtered.length} of {base.length} records</span>
            <Btn variant="secondary" size="sm" onClick={clearAll}>Clear Filters</Btn>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, background: "#FAFBFC" }}>
              {["MRN", "Patient", "Date", "Provider", "Nurse", "Stage", "Status", "Readiness"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 10, fontWeight: 600, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} onClick={() => onSelect(p)} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = T.bg)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ padding: "12px 14px" }}><code style={{ background: "#F1F5F9", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{p.mrn}</code></td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Avatar name={p.name} size={30} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: T.textMid }}>{p.date}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: T.textMid }}>{p.provider}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: T.textMid }}>{p.nurse}</td>
                <td style={{ padding: "12px 14px" }}>{stageBadge(p.stage)}</td>
                <td style={{ padding: "12px 14px" }}>{statusBadge(p.status)}</td>
                <td style={{ padding: "12px 14px", minWidth: 120 }}><ReadinessBar value={p.readiness} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "40px 14px", textAlign: "center", color: T.textLight, fontSize: 14 }}>No records match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── Stage Stepper ─────────────────────────────────────────────────────────────
const StageStepper: React.FC<{ currentStage: string }> = ({ currentStage }) => {
  const idx = STAGES.indexOf(currentStage);
  const pct = STAGES.length === 1 ? 100 : (idx / (STAGES.length - 1)) * 100;
  return (
<div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 400 }}>
      {/* Track + dots */}
      <div style={{ position: "relative", height: 12, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: T.border, borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: 2, background: STAGE_COLORS[Math.max(0, idx)], borderRadius: 2, transition: "width 0.3s ease" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", width: "100%" }}>
          {STAGES.map((s, i) => {
            const done = i <= idx;
            const active = i === idx;
            return (
              <div key={s} style={{ width: active ? 12 : 10, height: active ? 12 : 10, borderRadius: "50%", background: done ? STAGE_COLORS[i] : T.border, border: `2px solid ${T.white}`, boxShadow: "0 0 0 1.5px " + (done ? STAGE_COLORS[i] : T.border), flexShrink: 0 }} />
            );
          })}
        </div>
      </div>
      {/* Stage labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {STAGES.map((s, i) => {
          const active = i === idx;
          const done = i < idx;
          return (
            <div key={s} style={{ flex: 1, textAlign: i === 0 ? "left" : i === STAGES.length - 1 ? "right" : "center", fontSize: 9, fontWeight: active ? 600 : 400, color: active ? STAGE_COLORS[i] : done ? T.textMid : T.textLight, whiteSpace: "nowrap" }}>{s}</div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Reconcile List ─────────────────────────────────────────────────────────────
const ReconcileList: React.FC<{ items: ReconcilableItem }> = ({ items }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {items.reconciled.map(item => (
      <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: T.successLight, borderRadius: T.radiusSm }}>
        <div style={{ color: T.success, display: "flex", flexShrink: 0 }}><IconCheckSm /></div>
        <span style={{ fontSize: 13, color: T.text }}>{item}</span>
        <span style={{ marginLeft: "auto" }}><Badge label="Reconciled" color="green" /></span>
      </div>
    ))}
    {items.unreconciled.map(item => (
      <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: T.warningLight, borderRadius: T.radiusSm }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${T.warning}`, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: T.text }}>{item}</span>
        <span style={{ marginLeft: "auto" }}><Badge label="Pending" color="amber" /></span>
      </div>
    ))}
    {items.reconciled.length === 0 && items.unreconciled.length === 0 && (
      <div style={{ fontSize: 13, color: T.textLight, padding: "6px 0" }}>No items recorded.</div>
    )}
  </div>
);

// ─── Patient Record ─────────────────────────────────────────────────────────────
type PatientTab = "intake" | "chart" | "roi";

const PatientRecord: React.FC<{ patient: Patient; onBack: () => void; onCreateROI: () => void }> = ({ patient, onBack, onCreateROI }) => {
  const [tab, setTab] = useState<PatientTab>("intake");
  const d = patientDetails[patient.id] || defaultDetails;
  const tabs: { id: PatientTab; label: string }[] = [
    { id: "intake", label: "Intake" },
    { id: "chart", label: "Patient Chart" },
    { id: "roi", label: "Release of Information" },
  ];

  return (
    <div style={{ flex: 1, padding: 28, background: T.bg, overflowY: "auto" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: T.textMid, fontSize: 13, fontWeight: 500, padding: 0, marginBottom: 18 }}>
        <IconBack /> Back
      </button>

      {/* Patient header */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {/* Info card */}
        <Card style={{ flex: "0 0 230px", background: T.primary, border: "none", padding: "18px 20px" }}>
          <Avatar name={patient.name} size={48} />
          <div style={{ marginTop: 12, fontSize: 17, fontWeight: 700, color: T.white }}>{patient.name}</div>
          {[{ l: "MRN", v: patient.mrn }, { l: "Visit Date", v: patient.date }, { l: "Provider", v: patient.provider }, { l: "Nurse", v: patient.nurse }].map(x => (
            <div key={x.l} style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{x.l}</div>
              <div style={{ fontSize: 13, color: T.white, fontWeight: 500, wordBreak: "break-word" }}>{x.v}</div>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "10px 12px", background: "linear-gradient(135deg, rgba(250,204,21,0.18) 0%, rgba(234,179,8,0.10) 100%)", border: "1px solid rgba(250,204,21,0.5)", borderLeft: "3px solid #FBBF24", borderRadius: T.radiusSm, boxShadow: "0 0 8px rgba(250,204,21,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{ fontSize: 13 }}>⚡</span>
              <div style={{ fontSize: 10, color: "#FCD34D", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Intake Summary</div>
            </div>
            <div style={{ fontSize: 12, color: T.white, lineHeight: 1.6 }}>{d.nurseSummary}</div>
          </div>
        </Card>

        {/* Tabs + content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Progress + Readiness — compact inline */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 0, marginBottom: 14 }}>
            {/* Intake Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Intake Progress</span>
              <StageStepper currentStage={patient.stage} />
            </div>
            {/* Divider */}
            <div style={{ width: 1, height: 52, background: T.border, margin: "0 14px" }} />
            {/* Readiness */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Readiness</span>
              <ReadinessMeter value={patient.readiness} />
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "9px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? T.primary : T.textMid, borderBottom: `2px solid ${tab === t.id ? T.primary : "transparent"}`, marginBottom: -1 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Intake tab */}
          {tab === "intake" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>Clinical Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <Card style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 8 }}>Recent Visits</div>
                    {d.visits.length > 0 ? d.visits.map((v, i) => <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 3 }}>• {v.type}</div>) : <div style={{ fontSize: 13, color: T.textLight }}>No visits</div>}
                  </Card>
                  <Card style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 8 }}>Care Gaps</div>
                    {d.careGaps.length > 0 ? d.careGaps.map((g, i) => <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 3 }}>• {g}</div>) : <div style={{ fontSize: 13, color: T.textLight }}>No gaps</div>}
                  </Card>
                  <Card style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 8 }}>Complaints</div>
                    <div style={{ fontSize: 13, color: T.textMid }}>Patient presenting with various medical concerns. Please review intake summary for details.</div>
                  </Card>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>Reconciliation Status</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  {[{ title: "Allergies", items: d.allergies }, { title: "Medications", items: d.medications }, { title: "Immunizations", items: d.immunizations }].map(({ title, items }) => (
                    <Card key={title} style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10 }}>{title}</div>
                      <ReconcileList items={items} />
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Patient Chart tab */}
          {tab === "chart" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <Card style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10 }}>Vital Signs</div>
                  {["BP: 128/82 mmHg", "HR: 72 bpm", "Temp: 98.6°F", "O2: 98% (RA)"].map((v, i) => <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 5 }}>• {v}</div>)}
                </Card>
                <Card style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10 }}>Current Medications</div>
                  {["Lisinopril - 10mg daily", "Metformin - 500mg twice daily", "Atorvastatin - 20mg daily"].map((m, i) => <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 5 }}>• {m}</div>)}
                </Card>
                <Card style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10 }}>Allergies</div>
                  {[...d.allergies.reconciled.map(a => ({ label: a, pending: false })), ...d.allergies.unreconciled.map(a => ({ label: a, pending: true }))].map((a, i) => (
                    <div key={i} style={{ fontSize: 13, color: a.pending ? T.textLight : T.textMid, marginBottom: 5 }}>• {a.label}{a.pending ? " (pending)" : ""}</div>
                  ))}
                  {d.allergies.reconciled.length === 0 && d.allergies.unreconciled.length === 0 && <div style={{ fontSize: 13, color: T.textLight }}>No allergies</div>}
                </Card>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>Health Care Maintenance</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Card style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10 }}>Immunizations</div>
                  {["COVID-19 (Moderna) - 01/15/2025", "Influenza (Quad) - 09/20/2024", "Tdap - 02/10/2020"].map((v, i) => <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 5 }}>• {v}</div>)}
                </Card>
                <Card style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10 }}>Physicals</div>
                  {["Annual Physical - 03/15/2025 - Normal", "Follow-up Visit - 01/20/2025 - Normal", "Pre-op Exam - 11/10/2024 - Cleared"].map((v, i) => <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 5 }}>• {v}</div>)}
                </Card>
                <Card style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10 }}>Screening</div>
                  {["Blood Pressure - Normal - 03/15/2025", "Cholesterol - Elevated - 01/20/2025", "Cancer Screening - Due"].map((v, i) => <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 5 }}>• {v}</div>)}
                </Card>
                <Card style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10 }}>Bloodwork / Labs</div>
                  {["CBC - Normal - 03/10/2025", "CMP - Normal - 03/10/2025", "Lipid Panel - High chol - 01/20/2025"].map((v, i) => <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 5 }}>• {v}</div>)}
                </Card>
              </div>
            </div>
          )}

          {/* ROI tab */}
          {tab === "roi" && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Release of Information Requests</div>
                {patient.status !== "Completed" && (
                  <Btn size="sm" onClick={onCreateROI}><IconPlus /> New ROI Request</Btn>
                )}
              </div>
              {d.roi.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {["ID", "Facility", "Requested Date", "Status"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 600, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.roi.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < d.roi.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <td style={{ padding: "11px 12px", fontSize: 13, color: T.textMid }}>{r.id}</td>
                        <td style={{ padding: "11px 12px", fontSize: 13, color: T.text, fontWeight: 500 }}>{r.facility}</td>
                        <td style={{ padding: "11px 12px", fontSize: 13, color: T.textMid }}>{r.requestedDate}</td>
                        <td style={{ padding: "11px 12px" }}>{roiStatusBadge(r.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0", color: T.textLight, fontSize: 14 }}>No ROI requests for this patient.</div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Checkbox ──────────────────────────────────────────────────────────────────
function Checkbox<T extends Record<string, boolean | string>>({ label, obj, k, set }: { label: string; obj: T; k: keyof T; set: (o: T) => void }) {
  return (
    <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 13, color: T.textMid, userSelect: "none" }}>
      <input type="checkbox" checked={typeof obj[k] === "boolean" ? (obj[k] as boolean) : false}
        onChange={e => set({ ...obj, [k]: e.target.checked } as T)}
        style={{ accentColor: T.primary, width: 15, height: 15, cursor: "pointer", flexShrink: 0 }} />
      {label}
    </label>
  );
}

// ─── Create ROI ────────────────────────────────────────────────────────────────
const CreateROIPage: React.FC<{ patient: Patient; onBack: () => void; onSubmit: (roi: ROI) => void }> = ({ patient, onBack, onSubmit }) => {
  const [facilityName, setFacilityName] = useState("");
  const [facilityFax, setFacilityFax] = useState("");
  const [roiType, setROIType] = useState("Patient Signature Required");
  const [records, setRecords] = useState<RecordsState>({ behavioralHealth: false, emergencyDept: false, operativeNotes: false, providerNotes: false, therapyNotes: false, otherDocument: "" });
  const [additional, setAdditional] = useState<AdditionalState>({ allergyList: false, immunizations: false, medicationList: false, labResults: false, hivLab: false, geneticTesting: false, pathology: false, ekg: false, radiologyReport: false, radiologyImages: false, billingInfo: false });
  const [substance, setSubstance] = useState<SubstanceState>({ assessment: false, historyPhysical: false, multidisciplinaryNotes: false, familyParticipation: false, questionnaires: false, treatmentSummary: false, treatmentPlans: false, other: "" });

  const labelOf = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

  return (
    <div style={{ flex: 1, padding: 28, background: T.bg, overflowY: "auto" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: T.textMid, fontSize: 13, fontWeight: 500, padding: 0, marginBottom: 20 }}>
        <IconBack /> Back
      </button>

      <div style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Release of Information Request</h1>
        <p style={{ color: T.textMid, fontSize: 13, marginBottom: 24 }}>Patient: <strong style={{ color: T.text }}>{patient.name}</strong> &middot; {patient.mrn}</p>

        {/* Request Details */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 16 }}>Request Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <FieldLabel>ROI Type</FieldLabel>
              <FieldSelect value={roiType} onChange={setROIType} options={["Patient Signature Required", "Facility To Facility"]} />
            </div>
            <div>
              <FieldLabel>Facility Name</FieldLabel>
              <FieldInput value={facilityName} onChange={setFacilityName} placeholder="Medical Center" />
            </div>
            <div>
              <FieldLabel>Facility Fax</FieldLabel>
              <FieldInput value={facilityFax} onChange={setFacilityFax} placeholder="(555) 000-0000" type="tel" />
            </div>
          </div>
        </Card>

        {/* Records to be Released */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Records to be Released</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(["behavioralHealth", "emergencyDept", "operativeNotes", "providerNotes", "therapyNotes"] as (keyof RecordsState)[]).map(k => (
              <Checkbox key={k as string} label={labelOf(k as string)} obj={records} k={k} set={setRecords} />
            ))}
            <div>
              <FieldLabel>Other</FieldLabel>
              <FieldInput value={records.otherDocument as string} onChange={v => setRecords({ ...records, otherDocument: v })} placeholder="Specify other records" />
            </div>
          </div>
        </Card>

        {/* Additional Records */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Additional Records</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {(Object.keys(additional) as (keyof AdditionalState)[]).map(k => (
              <Checkbox key={k as string} label={labelOf(k as string)} obj={additional} k={k} set={setAdditional} />
            ))}
          </div>
        </Card>

        {/* Substance Abuse Records */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Substance Abuse Records</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(Object.keys(substance) as (keyof SubstanceState)[]).map(k =>
              k === "other"
                ? <div key={k as string}><FieldLabel>Other</FieldLabel><FieldInput value={substance.other as string} onChange={v => setSubstance({ ...substance, other: v })} placeholder="Specify other records" /></div>
                : <Checkbox<SubstanceState> key={k as string} label={labelOf(k as string)} obj={substance} k={k} set={setSubstance} />
            )}
          </div>
        </Card>

        <div style={{ display: "flex", gap: 12 }}>
          <Btn onClick={() => onSubmit({ id: Date.now(), facility: facilityName, requestedDate: new Date().toISOString().split("T")[0], status: roiType })}>
            Trigger ROI Request
          </Btn>
          <Btn variant="secondary" onClick={onBack}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [nurseFilter, setNurseFilter] = useState("");

  const sidebarActive = view === "patient" || view === "create-roi"
    ? (selectedPatient?.status === "Completed" ? "completed" : "upcoming")
    : view;

  const handleNav = (v: View, nurse?: string) => {
    setView(v);
    setSelectedPatient(null);
    setNurseFilter(nurse ?? "");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
      <Sidebar active={sidebarActive} onNav={v => handleNav(v)} />

      {view === "dashboard" && <DashboardPage onNav={handleNav} />}

      {(view === "upcoming" || view === "completed") && (
        <QueuePage queueType={view} onSelect={p => { setSelectedPatient(p); setView("patient"); }} initialNurse={nurseFilter} />
      )}

      {view === "patient" && selectedPatient && (
        <PatientRecord patient={selectedPatient} onBack={() => { setView(selectedPatient.status === "Completed" ? "completed" : "upcoming"); setSelectedPatient(null); }} onCreateROI={() => setView("create-roi")} />
      )}

      {view === "create-roi" && selectedPatient && (
        <CreateROIPage patient={selectedPatient} onBack={() => setView("patient")}
          onSubmit={roi => {
            if (!patientDetails[selectedPatient.id]) patientDetails[selectedPatient.id] = { ...defaultDetails };
            patientDetails[selectedPatient.id].roi.push(roi);
            setView("patient");
          }} />
      )}
    </div>
  );
}
