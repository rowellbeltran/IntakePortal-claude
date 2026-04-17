import type {
  Patient, PatientDetail, ReconcilableItem, ImmunizationRecord,
  Visit, CareGap, ScreeningLab, ROI, VisitToday, WeeklyVisit,
} from "../data/types";

// ─── Raw Data Fabric field shapes ────────────────────────────────────────────

interface RawPatient {
  Id: string;
  Name: string;
  MRN: string;
  AppointmentDate: string;
  Provider: string;
  Nurse: string;
  Stage: number;
  Status: number;
  Exception: string;
  Readiness: number;
}
interface RawVisit    { VisitType: string; VisitDate: string; Provider: string; Patient: string; }
interface RawRecon    { Category: number; IsReconciled: boolean; ItemName: string; Patient: string; }
interface RawCareGap  { Name: string; LastPerformed: string; NextDueDate: string; Patient: string; }
interface RawScreening{ Test: string; Facility: string; TestDate: string; Patient: string; }
interface RawROI      { Id: string; Facility: string; RequestedDate: string; Status: number; Patient: string; }
interface RawSummary  { Summary: string; SortOrder: number; Patient: string; }
interface RawComplaint{ Complaint: string; SortOrder: number; Patient: string; }
interface RawTodayVisit{ PatientName: string; AppointmentTime: string; Provider: string; Nurse: string; Status: number; }
interface RawWeekly   { Week: string; VisitCount: number; AHT: number; }

// ─── Enum maps ────────────────────────────────────────────────────────────────

const STAGE_MAP: Record<number, string> = {
  0: "Data Prepared", 1: "Data Validated", 2: "Patient Record Updated", 3: "Readiness Evaluated",
};
const STATUS_MAP:     Record<number, string> = { 0: "New", 1: "In Progress", 2: "Completed" };
const ROI_STATUS_MAP: Record<number, string> = { 0: "Signature Pending", 1: "Sent to Facility", 2: "Completed" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of arr) {
    const k = keyFn(item);
    (out[k] ??= []).push(item);
  }
  return out;
}

/** Trim ISO datetime to date-only string: "2026-04-10T00:00:00Z" → "2026-04-10" */
function dateOnly(s: string): string {
  return s ? s.split("T")[0] : s;
}

// ─── Query ────────────────────────────────────────────────────────────────────

async function query<T>(
  entity: string,
  token: string,
  base: string,
): Promise<T[]> {
  const res = await fetch(`${base}/${entity}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ start: 0, limit: 1000 }),
  });
  if (!res.ok) throw new Error(`Data Fabric ${entity}: ${res.status}`);
  const data = await res.json() as { value: T[] };
  return data.value ?? [];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface AppData {
  patients: Patient[];
  patientDetails: Record<string, PatientDetail>; // keyed by patient GUID
  visitsToday: VisitToday[];
  roiRequests: ROI[];
  weeklyVisits: WeeklyVisit[];
}

export async function fetchAppData(
  token: string,
  baseUrl: string,
  orgName: string,
  tenantName: string,
): Promise<AppData> {
  const base = `${baseUrl}/${orgName}/${tenantName}/datafabric_/api/EntityService`;

  const [
    rawPatients, rawVisits, rawRecon, rawCareGaps, rawScreenings,
    rawROIs, rawSummaries, rawComplaints, rawTodayVisits, rawWeekly,
  ] = await Promise.all([
    query<RawPatient>    ("FMIPatient",           token, base),
    query<RawVisit>      ("FMIPatientVisit",       token, base),
    query<RawRecon>      ("FMIReconciliationItem", token, base),
    query<RawCareGap>    ("FMICareGap",            token, base),
    query<RawScreening>  ("FMIScreeningLab",       token, base),
    query<RawROI>        ("FMIROI",                token, base),
    query<RawSummary>    ("FMINurseSummary",        token, base),
    query<RawComplaint>  ("PatientComplaint",      token, base),
    query<RawTodayVisit> ("FMITodayVisit",         token, base),
    query<RawWeekly>     ("FMIWeeklyMetric",        token, base),
  ]);

  // GUID → name lookup (for resolving TodayVisit.PatientName)
  const guidToName: Record<string, string> = {};
  rawPatients.forEach((p) => { guidToName[p.Id] = p.Name; });

  // Group detail entities by patient GUID
  const visitsByGuid    = groupBy(rawVisits,     (v) => v.Patient);
  const reconByGuid     = groupBy(rawRecon,       (r) => r.Patient);
  const careByGuid      = groupBy(rawCareGaps,    (c) => c.Patient);
  const screenByGuid    = groupBy(rawScreenings,  (s) => s.Patient);
  const roiByGuid       = groupBy(rawROIs,         (r) => r.Patient);
  const summaryByGuid   = groupBy(rawSummaries,   (n) => n.Patient);
  const complaintByGuid = groupBy(rawComplaints,  (c) => c.Patient);

  // Transform patients
  const patients: Patient[] = rawPatients.map((p, i) => ({
    id: i + 1,
    guid: p.Id,
    name: p.Name,
    mrn: p.MRN,
    date: dateOnly(p.AppointmentDate),
    provider: p.Provider,
    nurse: p.Nurse,
    stage: STAGE_MAP[p.Stage] ?? String(p.Stage),
    status: STATUS_MAP[p.Status] ?? String(p.Status),
    exception: p.Exception,
    readiness: p.Readiness,
  }));

  // Build patientDetails keyed by GUID
  const patientDetails: Record<string, PatientDetail> = {};
  for (const p of rawPatients) {
    const recon = reconByGuid[p.Id] ?? [];
    const reconcilable = (cat: number): ReconcilableItem => ({
      reconciled:   recon.filter((r) =>  r.IsReconciled && r.Category === cat).map((r) => r.ItemName),
      unreconciled: recon.filter((r) => !r.IsReconciled && r.Category === cat).map((r) => r.ItemName),
    });
    const immunizationRecord = (): ImmunizationRecord => ({
      reconciled:   recon.filter((r) =>  r.IsReconciled && r.Category === 2).map((r) => ({ name: r.ItemName, date: "", administeredBy: "" })),
      unreconciled: recon.filter((r) => !r.IsReconciled && r.Category === 2).map((r) => ({ name: r.ItemName, date: "", administeredBy: "" })),
    });

    patientDetails[p.Id] = {
      visits: (visitsByGuid[p.Id] ?? []).map((v): Visit => ({
        type: v.VisitType, date: dateOnly(v.VisitDate), provider: v.Provider,
      })),
      allergies:     reconcilable(0),
      medications:   reconcilable(1),
      immunizations: immunizationRecord(),
      careGaps: (careByGuid[p.Id] ?? []).map((g): CareGap => ({
        name: g.Name, lastPerformed: dateOnly(g.LastPerformed), nextDueDate: dateOnly(g.NextDueDate),
      })),
      screeningsAndLabs: (screenByGuid[p.Id] ?? []).map((s): ScreeningLab => ({
        test: s.Test, facility: s.Facility, date: dateOnly(s.TestDate),
      })),
      nurseSummary: (summaryByGuid[p.Id] ?? [])
        .sort((a, b) => a.SortOrder - b.SortOrder)
        .map((n) => n.Summary),
      complaints: (complaintByGuid[p.Id] ?? [])
        .sort((a, b) => a.SortOrder - b.SortOrder)
        .map((c) => c.Complaint),
      roi: (roiByGuid[p.Id] ?? []).map((r, i): ROI => ({
        id: i + 1,
        facility: r.Facility,
        requestedDate: dateOnly(r.RequestedDate),
        status: ROI_STATUS_MAP[r.Status] ?? String(r.Status),
      })),
    };
  }

  // visitsToday — PatientName field is a GUID, resolve to display name
  const visitsToday: VisitToday[] = rawTodayVisits.map((v, i): VisitToday => ({
    id: i + 1,
    patient: guidToName[v.PatientName] ?? v.PatientName,
    time: v.AppointmentTime,
    provider: v.Provider,
    nurse: v.Nurse,
    status: v.Status === 0 ? "Completed" : "Pending",
  }));

  // Dashboard ROI widget: all ROIs, most recent 6, with patient names
  const roiRequests: ROI[] = rawROIs
    .sort((a, b) => new Date(b.RequestedDate).getTime() - new Date(a.RequestedDate).getTime())
    .slice(0, 6)
    .map((r, i): ROI => ({
      id: i + 1,
      patient: guidToName[r.Patient] ?? r.Patient,
      facility: r.Facility,
      requestedDate: dateOnly(r.RequestedDate),
      status: ROI_STATUS_MAP[r.Status] ?? String(r.Status),
    }));

  const weeklyVisits: WeeklyVisit[] = rawWeekly.map((w): WeeklyVisit => ({
    week: w.Week, visits: w.VisitCount, aht: w.AHT,
  }));

  return { patients, patientDetails, visitsToday, roiRequests, weeklyVisits };
}
