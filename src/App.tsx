import React, { useState } from "react";
import { Tasks, TaskPriority, type TaskGetResponse } from "@uipath/uipath-typescript/tasks";
import { useAuth, type AuthState } from "./hooks/useAuth";
import { usePolling } from "./hooks/usePolling";
import { sdk, ENV, isConfigured } from "./lib/sdk";
import type { Patient, PatientDetail, ROI, VisitToday, WeeklyVisit, PieChartData, RecordsState, AdditionalState, SubstanceState } from "./data/types";
import { stages, stageColors } from "./data/mockData";
import { useAppData } from "./hooks/useAppData";
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
function ReadinessGauge({ value, size = 56 }: { value: number; size?: number }): JSX.Element {
  // Text/pivot color follows progression
  const textColor = value < 25 ? "#ef4444" : value < 50 ? "#f97316" : value < 75 ? "#ca8a04" : "#16a34a";
  const cx = 50, cy = 52, r = 36;
  const startX = cx - r; // 14
  const endX = cx + r;   // 86
  const theta = -Math.PI + (value / 100) * Math.PI;
  const arcX = cx + r * Math.cos(theta);
  const arcY = cy + r * Math.sin(theta);
  const svgH = cy + 8;
  const displayH = Math.round(size * svgH / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={displayH} viewBox={`0 0 100 ${svgH}`}>
        <defs>
          {/* Horizontal gradient mapped to the arc's x-span (14→86) */}
          <linearGradient id="rgGrad" x1={startX} y1="0" x2={endX} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="33%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        {/* Track — full arc, gradient at low opacity */}
        <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`}
          fill="none" stroke="url(#rgGrad)" strokeWidth={9} strokeLinecap="round" opacity={0.2} />
        {/* Fill arc */}
        {value > 0 && value < 100 && (
          <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${arcX.toFixed(2)} ${arcY.toFixed(2)}`}
            fill="none" stroke="url(#rgGrad)" strokeWidth={9} strokeLinecap="round" />
        )}
        {value >= 100 && (
          <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`}
            fill="none" stroke="url(#rgGrad)" strokeWidth={9} strokeLinecap="round" />
        )}
        {/* Tip dot */}
        {value > 0 && value < 100 && (
          <circle cx={arcX.toFixed(2)} cy={arcY.toFixed(2)} r={5.5} fill="url(#rgGrad)" />
        )}
        {/* Value label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill={textColor}>{value}%</text>
        {/* Center pivot */}
        <circle cx={cx} cy={cy} r={4} fill="#fff" stroke={textColor} strokeWidth={2} />
      </svg>
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
  const { patients, patientDetails, visitsToday, roiRequests, weeklyVisits, defaultDetails, loading: dataLoading, addROI } = useAppData();
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
          {dataLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Loading patient data…</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : showROI && selectedPatient ? (
            <CreateROIPage
              patient={selectedPatient}
              authState={authState}
              onBack={() => setShowROI(false)}
              onSubmit={(roi) => {
                addROI(selectedPatient.guid ?? String(selectedPatient.id), roi);
                setShowROI(false);
              }}
            />
          ) : selectedPatient ? (
            <PatientRecord
              patient={selectedPatient}
              detail={patientDetails[selectedPatient.guid ?? String(selectedPatient.id)] ?? defaultDetails}
              authState={authState}
              onBack={() => setSelectedPatient(null)}
              onCreateROI={() => setShowROI(true)}
            />
          ) : view === "dashboard" ? (
            <DashboardPage
              patients={patients}
              visitsToday={visitsToday}
              weeklyVisits={weeklyVisits}
              roiRequests={roiRequests}
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
function DashboardPage({ patients: pts, visitsToday, weeklyVisits, roiRequests, onNavigateToUpcoming, onNavigateToCompleted }: {
  patients: Patient[];
  visitsToday: VisitToday[];
  weeklyVisits: WeeklyVisit[];
  roiRequests: ROI[];
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
        <div style={{ background: "#fff", border: "1px solid #ddd6fe", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #ddd6fe", background: "linear-gradient(90deg,#f5f3ff,#fff)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: "#4338ca", flexShrink: 0 }} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Stage Distribution</span>
          </div>
          <div style={{ padding: "16px 20px" }}><DonutChart data={stageData} total={totalCount} /></div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #bfdbfe", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #bfdbfe", background: "linear-gradient(90deg,#eff6ff,#fff)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: "#2563eb", flexShrink: 0 }} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Status Overview</span>
          </div>
          <div style={{ padding: "16px 20px" }}><DonutChart data={statusData} total={totalCount} /></div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #cffafe", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #cffafe", background: "linear-gradient(90deg,#ecfeff,#fff)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: "#0891b2", flexShrink: 0 }} />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Weekly Visits — YTD</span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#64748b" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, background: "#bfdbfe", borderRadius: 2, display: "inline-block" }} />AHT (min)</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ display: "inline-block", width: 16, height: 2, background: "#2563eb", verticalAlign: "middle" }} />Visits</span>
            </div>
          </div>
          <div style={{ padding: "16px 20px" }}>
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
      </div>
      {/* Bottom tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #bbf7d0", background: "linear-gradient(90deg,#f0fdf4,#fff)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: "#16a34a", flexShrink: 0 }} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Nurse Visit Assignments</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Today's schedule — click a row to filter queue</div>
            </div>
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
        <div style={{ background: "#fff", border: "1px solid #ddd6fe", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #ddd6fe", background: "linear-gradient(90deg,#f5f3ff,#fff)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: "#7c3aed", flexShrink: 0 }} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Recent ROI Requests</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Latest release of information activity</div>
            </div>
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
      <div style={{ background: "#fff", border: "1px solid #bfdbfe", borderRadius: 12, overflow: "hidden", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #bfdbfe", background: "linear-gradient(90deg,#eff6ff,#fff)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: "#2563eb", flexShrink: 0 }} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Filter Records</span>
          </div>
          {(search || stageF || statusF || providerF || nurseF) && (
            <button onClick={() => { setSearch(""); setStageF(""); setStatusF(""); setProviderF(""); setNurseF(""); }}
              style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4 }}>
              Clear filters
            </button>
          )}
        </div>
        <div style={{ padding: "14px 20px", display: "flex", gap: 12, flexWrap: "wrap" }}>
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
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(90deg,#f8fafc,#fff)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: isCompleted ? "#16a34a" : "#f59e0b", flexShrink: 0 }} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isCompleted ? "#15803d" : "#b45309"} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{isCompleted ? "Completed Visits" : "Upcoming Visits"}</span>
          </div>
          <span style={{ fontSize: 12, color: "#64748b" }}>Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of <strong style={{ color: "#0f172a" }}>{pts.length}</strong></span>
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
function PatientRecord({ patient, detail, authState, onBack, onCreateROI }: {
  patient: Patient;
  detail: PatientDetail;
  authState: AuthState;
  onBack: () => void;
  onCreateROI: () => void;
}): JSX.Element {
  const d = detail;
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
          {/* Readiness */}
          {(() => {
            const rv = patient.readiness;
            const rColor = rv < 25 ? "#ef4444" : rv < 50 ? "#f97316" : rv < 75 ? "#ca8a04" : "#16a34a";
            const rBg = rv < 25 ? "linear-gradient(160deg,#fef2f2,#fff7ed)" : rv < 50 ? "linear-gradient(160deg,#fff7ed,#fffbeb)" : rv < 75 ? "linear-gradient(160deg,#fffbeb,#fefce8)" : "linear-gradient(160deg,#f0fdf4,#ecfeff)";
            const rBorder = rv < 25 ? "#fecaca" : rv < 50 ? "#fed7aa" : rv < 75 ? "#fde68a" : "#bbf7d0";
            const rLabel = rv < 25 ? "Action Required" : rv < 50 ? "Needs Attention" : rv < 75 ? "In Progress" : "Visit Ready";
            const rIcon = rv < 25
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={rColor} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              : rv < 75
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={rColor} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={rColor} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
            return (
              <div style={{ margin: "12px 12px 0", borderRadius: 12, border: `1px solid ${rBorder}`, background: rBg, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", gap: 6 }}>
                  {rIcon}
                  <span style={{ fontSize: 10, fontWeight: 700, color: rColor, textTransform: "uppercase", letterSpacing: "0.07em" }}>Readiness Score</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0 10px" }}>
                  <Tooltip text={rv < 40 ? "Low readiness — action required" : rv < 70 ? "Moderate readiness — in progress" : "High readiness — visit ready"} position="top">
                    <ReadinessGauge value={rv} size={110} />
                  </Tooltip>
                  <span style={{ fontSize: 12, fontWeight: 700, color: rColor, background: rColor + "18", border: `1px solid ${rColor}40`, borderRadius: 20, padding: "3px 12px", marginTop: 2 }}>{rLabel}</span>
                </div>
              </div>
            );
          })()}
          <div style={{ height: 12 }} />
          {/* Intake Progress */}
          {(() => {
            const pct = Math.round((currentStageIdx / (stages.length - 1)) * 100);
            const stageDesc: Record<string, string> = {
              "Data Prepared": "Patient data gathered and prepared",
              "Data Validated": "Verified against source records",
              "Patient Record Updated": "EMR updated with validated information",
              "Readiness Evaluated": "Patient is fully ready for visit",
            };
            return (
              <div style={{ margin: "10px 12px 12px", borderRadius: 12, border: "1px solid #bfdbfe", background: "#fff", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ background: "linear-gradient(90deg,#eff6ff 0%,#fff 100%)", borderBottom: "1px solid #bfdbfe", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>Intake Progress</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: "#dbeafe" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#3b82f6,#22c55e)" : "linear-gradient(90deg,#3b82f6,#60a5fa)", borderRadius: "0 2px 2px 0", transition: "width 0.4s ease" }} />
                </div>
                {/* Steps */}
                <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 0 }}>
                  {stages.map((s, i) => {
                    const done = i < currentStageIdx;
                    const active = i === currentStageIdx;
                    const pending = i > currentStageIdx;
                    const isLast = i === stages.length - 1;
                    return (
                      <div key={s} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        {/* Connector column */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0, marginTop: 2 }}>
                          <Tooltip text={stageDesc[s] ?? s} position="top">
                            <div style={{
                              width: 20, height: 20, borderRadius: "50%", flexShrink: 0, cursor: "default",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: done ? "#2563eb" : active ? "#eff6ff" : "#f8fafc",
                              border: done ? "2px solid #2563eb" : active ? "2px solid #3b82f6" : "2px solid #cbd5e1",
                              boxShadow: active ? "0 0 0 3px #bfdbfe" : "none",
                            }}>
                              {done && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              )}
                              {active && (
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                              )}
                            </div>
                          </Tooltip>
                          {!isLast && (
                            <div style={{ width: 2, flex: 1, minHeight: 18, marginTop: 2, background: done ? "#2563eb" : "#e2e8f0", borderRadius: 1 }} />
                          )}
                        </div>
                        {/* Label */}
                        <div style={{ paddingTop: 2, paddingBottom: isLast ? 0 : 18, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: active ? 700 : done ? 600 : 400, color: done ? "#1e40af" : active ? "#1d4ed8" : "#94a3b8", lineHeight: 1.3 }}>{s}</span>
                            {active && <span style={{ fontSize: 9, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8", borderRadius: 8, padding: "1px 6px", letterSpacing: "0.04em" }}>CURRENT</span>}
                            {done && <span style={{ fontSize: 9, fontWeight: 700, background: "#dcfce7", color: "#15803d", borderRadius: 8, padding: "1px 6px", letterSpacing: "0.04em" }}>DONE</span>}
                          </div>
                          {active && <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{stageDesc[s] ?? ""}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
        {/* Right content */}
        <div style={{ flex: 1, padding: "24px 32px" }}>
          {/* Tabs */}
          <div style={{ borderBottom: "1px solid #e2e8f0", marginBottom: 24 }}>
            {tabBtn("intake", "Intake")}
            {tabBtn("chart", "Patient Chart")}
            {tabBtn("roi", "Release of Information")}
          </div>
          {/* Intake tab */}
          {activeTab === "intake" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Clinical Information card */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "linear-gradient(90deg,#f8fafc 0%,#fff 100%)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 18, borderRadius: 2, background: "#2563eb", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: "0.01em" }}>Clinical Information</span>
                </div>
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Nurse Intake Notes + Complaints row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {/* Nurse Intake Notes */}
                    <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 14 }}>⚡</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Nurse Intake Notes</span>
                      </div>
                      {d.nurseSummary.length === 0
                        ? <div style={{ fontSize: 13, color: "#a16207", fontStyle: "italic" }}>No notes recorded.</div>
                        : d.nurseSummary.map((note, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: i < d.nurseSummary.length - 1 ? "1px dashed #fcd34d" : "none" }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706", flexShrink: 0, marginTop: 6 }} />
                              <span style={{ fontSize: 13, color: "#78350f", lineHeight: 1.5 }}>{note}</span>
                            </div>
                          ))
                      }
                    </div>
                    {/* Complaints */}
                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Complaints</span>
                      </div>
                      {d.complaints.length === 0
                        ? <div style={{ fontSize: 13, color: "#a16207", fontStyle: "italic" }}>No complaints recorded.</div>
                        : <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
                            {d.complaints.map((c, i) => (
                              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: i < d.complaints.length - 1 ? "1px dashed #fcd34d" : "none" }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706", flexShrink: 0, marginTop: 6 }} />
                                <span style={{ fontSize: 13, color: "#78350f", lineHeight: 1.5 }}>{c}</span>
                              </div>
                            ))}
                          </div>
                      }
                    </div>
                  </div>
                  {/* Recent Visits + Care Gaps */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {/* Recent Visits */}
                    <div style={{ border: "1px solid #e0e7ff", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ padding: "10px 14px", background: "#eef2ff", borderBottom: "1px solid #e0e7ff", display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#3730a3", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Recent Visits</span>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            {["Type", "Provider", "Date"].map(h => (
                              <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...d.visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((v, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                              <td style={{ padding: "7px 12px", fontSize: 12, color: "#1e293b", fontWeight: 500, borderBottom: "1px solid #f1f5f9" }}>{v.type}</td>
                              <td style={{ padding: "7px 12px", fontSize: 12, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>{v.provider}</td>
                              <td style={{ padding: "7px 12px", fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>{v.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Care Gaps */}
                    <div style={{ border: "1px solid #fde8d8", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ padding: "10px 14px", background: "#fff7ed", borderBottom: "1px solid #fde8d8", display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#9a3412", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Care Gaps</span>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            {["Preventive Service", "Last Performed", "Next Due"].map(h => (
                              <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...d.careGaps].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()).map((g, i) => {
                            const today = new Date(); today.setHours(0, 0, 0, 0);
                            const due = new Date(g.nextDueDate);
                            const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                            const isOverdue = days < 0;
                            const isDueSoon = days >= 0 && days <= 60;
                            return (
                              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fff7ed" }}>
                                <td style={{ padding: "7px 12px", fontSize: 12, color: "#1e293b", fontWeight: 500, borderBottom: "1px solid #f1f5f9" }}>{g.name}</td>
                                <td style={{ padding: "7px 12px", fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>{g.lastPerformed}</td>
                                <td style={{ padding: "7px 12px", fontSize: 12, borderBottom: "1px solid #f1f5f9" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: isOverdue || isDueSoon ? 700 : 400, color: isOverdue ? "#dc2626" : isDueSoon ? "#d97706" : "#64748b", background: isOverdue ? "#fee2e2" : isDueSoon ? "#fef3c7" : "transparent", padding: isOverdue || isDueSoon ? "2px 7px" : "0", borderRadius: 20, fontSize: 11 }}>
                                    {isOverdue && "⚠ "}
                                    {isDueSoon && "⏰ "}
                                    {g.nextDueDate}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reconciliation Status card */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "linear-gradient(90deg,#f8fafc 0%,#fff 100%)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 18, borderRadius: 2, background: "#16a34a", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: "0.01em" }}>Reconciliation Status</span>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {[
                      { title: "Allergies", data: d.allergies, accent: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", iconColor: "#6d28d9" },
                      { title: "Medications", data: d.medications, accent: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", iconColor: "#1d4ed8" },
                    ].map(({ title, data, accent, bg, border, iconColor }) => (
                      <div key={title} style={{ border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ padding: "10px 14px", background: bg, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: iconColor, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{title}</span>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 7px", borderRadius: 20 }}>{data.reconciled.length} ✓</span>
                            {data.unreconciled.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "2px 7px", borderRadius: 20 }}>{data.unreconciled.length} pending</span>}
                          </div>
                        </div>
                        <div style={{ padding: "8px 14px" }}>
                          {data.reconciled.map((item) => (
                            <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#dcfce7" /><path d="M4 7l2.5 2.5L10 5" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                                <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                              </div>
                              <Tooltip text="Verified against EMR records" position="top"><span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", cursor: "default", background: "#f0fdf4", padding: "2px 6px", borderRadius: 10 }}>Reconciled</span></Tooltip>
                            </div>
                          ))}
                          {data.unreconciled.map((item) => (
                            <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" /></svg>
                                <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                              </div>
                              <Tooltip text="Awaiting verification or provider review" position="top"><span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", cursor: "default", background: "#fffbeb", padding: "2px 6px", borderRadius: 10 }}>Pending</span></Tooltip>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {/* Immunizations — with administration dates */}
                    <div style={{ border: "1px solid #bbf7d0", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ padding: "10px 14px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Immunizations</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 7px", borderRadius: 20 }}>{d.immunizations.reconciled.length} ✓</span>
                          {d.immunizations.unreconciled.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "2px 7px", borderRadius: 20 }}>{d.immunizations.unreconciled.length} pending</span>}
                        </div>
                      </div>
                      <div style={{ padding: "8px 14px" }}>
                        {d.immunizations.reconciled.map((im) => (
                          <div key={im.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#dcfce7" /><path d="M4 7l2.5 2.5L10 5" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                              <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{im.name}</span>
                            </div>
                            <Tooltip text="Verified against EMR records" position="top"><span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", cursor: "default", background: "#f0fdf4", padding: "2px 6px", borderRadius: 10 }}>Reconciled</span></Tooltip>
                          </div>
                        ))}
                        {d.immunizations.unreconciled.map((im) => (
                          <div key={im.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" /></svg>
                              <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{im.name}</span>
                            </div>
                            <Tooltip text="Awaiting administration or verification" position="top"><span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", cursor: "default", background: "#fffbeb", padding: "2px 6px", borderRadius: 10 }}>Pending</span></Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Patient Chart tab */}
          {activeTab === "chart" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Top row: Vitals, Medications, Allergies */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "linear-gradient(90deg,#f8fafc 0%,#fff 100%)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 18, borderRadius: 2, background: "#0891b2", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: "0.01em" }}>Clinical Summary</span>
                </div>
                <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  {/* Vital Signs */}
                  <div style={{ border: "1px solid #cffafe", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#ecfeff", borderBottom: "1px solid #cffafe", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#155e75", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Vital Signs</span>
                    </div>
                    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column" as const, gap: 4 }}>
                      {["BP: 128/82 mmHg", "HR: 72 bpm", "Temp: 98.6°F", "O2: 98% (RA)"].map((v, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0891b2", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "#374151" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Medications */}
                  <div style={{ border: "1px solid #bfdbfe", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#eff6ff", borderBottom: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1e40af", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Current Medications</span>
                    </div>
                    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column" as const, gap: 4 }}>
                      {[...d.medications.reconciled, ...d.medications.unreconciled].map((m, i, arr) => (
                        <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "#374151" }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Allergies */}
                  <div style={{ border: "1px solid #ddd6fe", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#f5f3ff", borderBottom: "1px solid #ddd6fe", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#5b21b6", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Allergies</span>
                    </div>
                    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column" as const, gap: 4 }}>
                      {[...d.allergies.reconciled, ...d.allergies.unreconciled].map((a, i, arr) => (
                        <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "#374151" }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom row: Immunizations + Screenings */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "linear-gradient(90deg,#f8fafc 0%,#fff 100%)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 18, borderRadius: 2, background: "#16a34a", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: "0.01em" }}>Preventive Care</span>
                </div>
                <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Immunizations */}
                  <div style={{ border: "1px solid #bbf7d0", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Immunizations</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr style={{ background: "#f8fafc" }}>{["Vaccine", "Date Administered", "Administered By"].map(h => <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {[...d.immunizations.reconciled.map(v => ({ ...v, reconciled: true })), ...d.immunizations.unreconciled.map(v => ({ ...v, reconciled: false }))].map((im, i) => (
                          <tr key={im.name + i} style={{ background: i % 2 === 0 ? "#fff" : "#f0fdf4" }}>
                            <td style={{ padding: "7px 12px", fontSize: 12, color: "#374151", borderBottom: "1px solid #f1f5f9", fontWeight: 500 }}>{im.name || "—"}</td>
                            <td style={{ padding: "7px 12px", fontSize: 12, color: im.date ? "#374151" : "#9ca3af", borderBottom: "1px solid #f1f5f9" }}>{im.date || "—"}</td>
                            <td style={{ padding: "7px 12px", fontSize: 12, color: im.administeredBy ? "#374151" : "#9ca3af", borderBottom: "1px solid #f1f5f9" }}>{im.administeredBy || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Screenings & Labs */}
                  <div style={{ border: "1px solid #e0e7ff", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#eef2ff", borderBottom: "1px solid #e0e7ff", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4m0-4h6m0 0v4m0-4h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4"/></svg>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#3730a3", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Screenings & Labs</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr style={{ background: "#f8fafc" }}>{["Test", "Facility", "Date"].map(h => <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {d.screeningsAndLabs.map((sc, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#eef2ff" }}>
                            <td style={{ padding: "7px 12px", fontSize: 12, color: "#1e293b", fontWeight: 500, borderBottom: "1px solid #f1f5f9" }}>{sc.test}</td>
                            <td style={{ padding: "7px 12px", fontSize: 12, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>{sc.facility}</td>
                            <td style={{ padding: "7px 12px", fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>{sc.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ROI tab */}
          {activeTab === "roi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Action Center Tasks */}
              {isAuthenticated && (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "linear-gradient(90deg,#f8fafc 0%,#fff 100%)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 4, height: 18, borderRadius: 2, background: "#0891b2", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Action Center Tasks</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#0891b2", background: "#ecfeff", border: "1px solid #cffafe", padding: "2px 8px", borderRadius: 20 }}>LIVE</span>
                    </div>
                    <button onClick={liveRefresh} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, padding: "4px 12px", cursor: "pointer", color: "#475569", fontWeight: 600 }}>↻ Refresh</button>
                  </div>
                  <div style={{ padding: "12px 20px" }}>
                    {liveLoading && liveTasks.length === 0 && <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Loading…</p>}
                    {liveError && <p style={{ fontSize: 13, color: "#d97706", margin: 0 }}>{liveError.message}</p>}
                    {!liveLoading && !liveError && liveTasks.length === 0 && <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0", fontStyle: "italic" }}>No action center tasks for this patient.</p>}
                    {liveTasks.map((task, i) => (
                      <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderRadius: 6, border: "1px solid #e2e8f0", marginBottom: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
                        <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>{task.title}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: task.status === "Completed" ? "#16a34a" : "#d97706", background: task.status === "Completed" ? "#dcfce7" : "#fef3c7", padding: "2px 8px", borderRadius: 20 }}>{task.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* ROI Requests */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "linear-gradient(90deg,#f8fafc 0%,#fff 100%)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 2, background: "#7c3aed", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Release of Information Requests</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#6d28d9", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "2px 8px", borderRadius: 20 }}>{d.roi.length} record{d.roi.length !== 1 ? "s" : ""}</span>
                  </div>
                  {patient.status !== "Completed" && (
                    <button onClick={onCreateROI} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 3px rgba(37,99,235,0.3)" }}>
                      + New ROI Request
                    </button>
                  )}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f8fafc" }}>{["ID", "Facility", "Requested Date", "Status"].map(h => <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {d.roi.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>#{r.id}</td>
                        <td style={{ padding: "9px 14px", fontSize: 13, color: "#1e293b", fontWeight: 500, borderBottom: "1px solid #f1f5f9" }}>{r.facility}</td>
                        <td style={{ padding: "9px 14px", fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>{r.requestedDate}</td>
                        <td style={{ padding: "9px 14px", borderBottom: "1px solid #f1f5f9" }}><span style={roiStatusStyle(r.status)}>{r.status.toUpperCase()}</span></td>
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
  const secStyle = (accent: string, bg: string, border: string): React.CSSProperties => ({ background: "#fff", border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 16 });
  const secHeader = (accent: string, bg: string, border: string, label: string, icon: React.ReactNode) => (
    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${border}`, background: bg, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 4, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
      {icon}
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: "0.01em" }}>{label}</span>
    </div>
  );
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
        {/* Page header */}
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f5f3ff", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Release of Information Request</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Patient: <strong style={{ color: "#0f172a" }}>{patient.name}</strong> <span style={{ color: "#94a3b8" }}>·</span> <span style={{ fontFamily: "monospace", background: "#f1f5f9", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>{patient.mrn}</span></p>
        </div>
        {sdkError && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p style={{ color: "#92400e", fontSize: 13, margin: 0 }}>Task creation failed: {sdkError}. Request saved locally.</p>
          </div>
        )}
        {/* Request Details */}
        <div style={secStyle("#2563eb", "#eff6ff", "#bfdbfe")}>
          {secHeader("#2563eb", "linear-gradient(90deg,#eff6ff,#fff)", "#bfdbfe", "Request Details",
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
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
        {/* Records to be Released */}
        <div style={secStyle("#0891b2", "#ecfeff", "#cffafe")}>
          {secHeader("#0891b2", "linear-gradient(90deg,#ecfeff,#fff)", "#cffafe", "Records to be Released",
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          )}
          <div style={{ padding: "16px 20px" }}>
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
        </div>
        {/* Additional Records */}
        <div style={secStyle("#16a34a", "#f0fdf4", "#bbf7d0")}>
          {secHeader("#16a34a", "linear-gradient(90deg,#f0fdf4,#fff)", "#bbf7d0", "Additional Records",
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4m0-4h6m0 0v4m0-4h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4"/></svg>
          )}
          <div style={{ padding: "16px 20px" }}>
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
        </div>
        {/* Substance Abuse Records */}
        <div style={secStyle("#d97706", "#fffbeb", "#fde68a")}>
          {secHeader("#d97706", "linear-gradient(90deg,#fffbeb,#fff)", "#fde68a", "Substance Abuse Records",
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          )}
          <div style={{ padding: "16px 20px" }}>
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
        </div>
        {/* Submit */}
        <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
          <button onClick={submitting ? undefined : handleSubmit} disabled={submitting}
            style={{ padding: "10px 22px", background: submitting ? "#94a3b8" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 1px 3px rgba(37,99,235,0.3)" }}>
            {submitting ? "Submitting…" : canCreateTask ? "Submit & Create Action Center Task" : "Trigger ROI Request"}
          </button>
          <button onClick={onBack} style={{ padding: "10px 22px", background: "#fff", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
