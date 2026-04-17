import type { VisitToday, ROI, WeeklyVisit } from "./types";

export const stages: string[] = ["Data Prepared", "Data Validated", "Patient Record Updated", "Readiness Evaluated"];

export const stageColors: Record<string, string> = {
  "Data Prepared": "#3b82f6",
  "Data Validated": "#06b6d4",
  "Patient Record Updated": "#f59e0b",
  "Readiness Evaluated": "#22c55e"
};

export const visitsToday: VisitToday[] = [
  { id: 1,  patient: "John Doe",       time: "08:00 AM", provider: "Dr. Smith",    nurse: "Sarah Johnson, RN",   status: "Pending" },
  { id: 2,  patient: "Jane Roe",        time: "08:30 AM", provider: "Dr. Adams",   nurse: "Michael Chen, RN",   status: "Completed" },
  { id: 3,  patient: "Michael Lee",     time: "09:00 AM", provider: "Dr. Brown",   nurse: "Emily Rodriguez, RN",status: "Pending" },
  { id: 4,  patient: "Sarah Johnson",   time: "09:30 AM", provider: "Dr. Wilson",  nurse: "James Patterson, RN",status: "Pending" },
  { id: 5,  patient: "Robert Martinez", time: "10:00 AM", provider: "Dr. Garcia",  nurse: "Lisa Wong, RN",      status: "Completed" },
  { id: 6,  patient: "Emily Chen",      time: "10:30 AM", provider: "Dr. Taylor",  nurse: "David Kumar, RN",    status: "Pending" },
  { id: 7,  patient: "David Thompson",  time: "11:00 AM", provider: "Dr. Anderson",nurse: "Jennifer Lee, RN",   status: "Pending" },
  { id: 8,  patient: "Lisa Anderson",   time: "11:30 AM", provider: "Dr. Martinez",nurse: "Robert Thompson, RN",status: "Completed" },
  { id: 9,  patient: "Kevin Wilson",    time: "01:00 PM", provider: "Dr. Harris",  nurse: "Sarah Johnson, RN",  status: "Pending" },
  { id: 10, patient: "Patricia Brown",  time: "01:30 PM", provider: "Dr. Clark",   nurse: "Michael Chen, RN",   status: "Pending" },
];

export const roiRequests: ROI[] = [
  { id: 1,  patient: "John Doe",       facility: "General Hospital",      requestedDate: "2026-04-08", status: "Signature Pending" },
  { id: 7,  patient: "Emily Chen",     facility: "Rheumatology Center",   requestedDate: "2026-04-08", status: "Signature Pending" },
  { id: 2,  patient: "John Doe",       facility: "City Clinic",           requestedDate: "2026-04-07", status: "Sent to Facility" },
  { id: 8,  patient: "David Thompson", facility: "Pulmonology Associates", requestedDate: "2026-04-07", status: "Sent to Facility" },
  { id: 3,  patient: "Jane Roe",       facility: "Heart Center",          requestedDate: "2026-04-06", status: "Completed" },
  { id: 4,  patient: "Sarah Johnson",  facility: "Neurology Clinic",      requestedDate: "2026-04-05", status: "Signature Pending" },
  { id: 5,  patient: "Robert Martinez",facility: "GI Specialists",        requestedDate: "2026-04-04", status: "Sent to Facility" },
  { id: 6,  patient: "Robert Martinez",facility: "Lab Services",          requestedDate: "2026-04-02", status: "Completed" },
];

export const weeklyVisits: WeeklyVisit[] = [
  { week: "Week 1", visits: 58, aht: 22 },
  { week: "Week 2", visits: 72, aht: 18 },
  { week: "Week 3", visits: 65, aht: 28 },
  { week: "Week 4", visits: 85, aht: 24 },
  { week: "Week 5", visits: 92, aht: 26 }
];
