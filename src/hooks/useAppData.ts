import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { sdk, ENV, isConfigured } from "../lib/sdk";
import { fetchAppData, type AppData } from "../lib/dataFabric";
import { patients as mockPatients, patientDetails as mockPatientDetails, defaultDetails } from "../data/patients";
import { visitsToday as mockVisitsToday, roiRequests as mockRoiRequests, weeklyVisits as mockWeeklyVisits } from "../data/mockData";
import type { PatientDetail, ROI } from "../data/types";

export type { AppData };

export interface AppDataState {
  patients: AppData["patients"];
  patientDetails: Record<string, PatientDetail>;
  visitsToday: AppData["visitsToday"];
  roiRequests: AppData["roiRequests"];
  weeklyVisits: AppData["weeklyVisits"];
  defaultDetails: PatientDetail;
  loading: boolean;
  addROI: (patientKey: string, roi: ROI) => void;
}

function buildMockState(): Omit<AppDataState, "loading" | "addROI"> {
  // Mock patientDetails is keyed by number; remap to string keys
  const byString: Record<string, PatientDetail> = {};
  mockPatients.forEach((p) => {
    byString[String(p.id)] = (mockPatientDetails as Record<number, PatientDetail>)[p.id] ?? defaultDetails;
  });
  return {
    patients: mockPatients,
    patientDetails: byString,
    visitsToday: mockVisitsToday,
    roiRequests: mockRoiRequests,
    weeklyVisits: mockWeeklyVisits,
    defaultDetails,
  };
}

export function useAppData(): AppDataState {
  const { state: authState } = useAuth();

  const [data, setData] = useState<Omit<AppDataState, "loading" | "addROI">>(() => buildMockState());
  const [loading, setLoading] = useState<boolean>(() => isConfigured);

  useEffect(() => {
    if (!isConfigured || authState !== "authenticated" || !sdk) {
      if (authState !== "loading") setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = sdk!.getToken();
        if (!token) throw new Error("No auth token available");

        const live = await fetchAppData(token, ENV.baseUrl, ENV.orgName, ENV.tenantName);
        if (cancelled) return;
        setData({
          patients: live.patients,
          patientDetails: live.patientDetails,
          visitsToday: live.visitsToday,
          roiRequests: live.roiRequests,
          weeklyVisits: live.weeklyVisits,
          defaultDetails,
        });
      } catch (err) {
        if (cancelled) return;
        console.warn("[Data Fabric] Falling back to mock data:", err);
        setData(buildMockState());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authState]);

  const addROI = useCallback((patientKey: string, roi: ROI) => {
    setData((prev) => {
      const existing = prev.patientDetails[patientKey] ?? defaultDetails;
      return {
        ...prev,
        patientDetails: {
          ...prev.patientDetails,
          [patientKey]: { ...existing, roi: [...existing.roi, roi] },
        },
      };
    });
  }, []);

  return { ...data, loading, addROI };
}
