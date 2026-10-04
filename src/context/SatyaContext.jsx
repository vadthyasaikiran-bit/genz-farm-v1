import React, { createContext, useContext, useState } from "react";
import {
  INITIAL_INSTITUTES,
  INITIAL_INSPECTORS,
  INITIAL_ANOMALIES,
  SCHEME_STATS
} from "../services/mockData";
import { calculateInstituteRiskScore } from "../services/riskEngine";

const SatyaContext = createContext();

export function SatyaProvider({ children }) {
  // Navigation role state
  // COMMAND_CENTER | EDGE_CCTV | SMART_ASSIGN | SURPRISE_VC | INSPECTOR_APP
  const [activeTab, setActiveTab] = useState("COMMAND_CENTER");

  const [institutes, setInstitutes] = useState(INITIAL_INSTITUTES);
  const [inspectors, setInspectors] = useState(INITIAL_INSPECTORS);
  const [anomalies, setAnomalies] = useState(INITIAL_ANOMALIES);
  const [stats, setStats] = useState(SCHEME_STATS);

  // Modals / active focus
  const [selectedInstituteForAssign, setSelectedInstituteForAssign] = useState(null);
  const [selectedInstituteForVC, setSelectedInstituteForVC] = useState(null);
  const [activeVCRoomToken, setActiveVCRoomToken] = useState(null);
  
  // Field audit evidence log
  const [sealedEvidenceRecords, setSealedEvidenceRecords] = useState([]);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  /**
   * Action: Report Edge-AI CCTV snapshot results
   * If discrepancy detected, dynamically fires Anomaly and recalculates risk score
   */
  const processCctvSnapshotResult = (instituteId, detectedCount, snapshotUrl = null) => {
    setInstitutes((prev) =>
      prev.map((inst) => {
        if (inst.id !== instituteId) return inst;
        const updated = {
          ...inst,
          aiDetectedBeneficiaries: detectedCount,
          lastHeartbeat: "Just now",
          snapshotImage: snapshotUrl || inst.snapshotImage
        };
        const newRisk = calculateInstituteRiskScore(updated);
        const hasSevereDeficit = (inst.claimedBeneficiaries - detectedCount) / inst.claimedBeneficiaries > 0.3;
        
        return {
          ...updated,
          riskScore: newRisk,
          riskLevel: newRisk > 75 ? "CRITICAL" : newRisk > 40 ? "HIGH" : "LOW",
          cctvStatus: hasSevereDeficit ? "ANOMALY" : "ONLINE"
        };
      })
    );

    const targetInst = institutes.find((i) => i.id === instituteId);
    if (!targetInst) return;

    const deficit = targetInst.claimedBeneficiaries - detectedCount;
    const deficitPct = Math.round((deficit / targetInst.claimedBeneficiaries) * 100);

    if (deficitPct >= 25) {
      const newAnomaly = {
        id: `ANO-LIVE-${Date.now().toString().slice(-4)}`,
        instituteId,
        instituteName: targetInst.name,
        scheme: targetInst.scheme,
        district: `${targetInst.district}, ${targetInst.state}`,
        timestamp: "Just now (Live Feed)",
        claimedCount: targetInst.claimedBeneficiaries,
        detectedCount,
        deficitPercent: deficitPct,
        severity: deficitPct > 60 ? "CRITICAL" : "HIGH",
        status: "PENDING_DISPATCH",
        recommendedAction: "Immediate Risk-Weighted Inspection Dispatch"
      };

      setAnomalies((prev) => [newAnomaly, ...prev]);
      setStats((prev) => ({
        ...prev,
        ghostBeneficiariesFlagged: prev.ghostBeneficiariesFlagged + Math.max(0, deficit)
      }));

      addToast(
        "Edge-AI Anomaly Detected!",
        `${targetInst.name}: Claimed ${targetInst.claimedBeneficiaries}, AI Detected ${detectedCount} (${deficitPct}% Deficit)`,
        "danger"
      );
    } else {
      addToast(
        "AI Snapshot Verified",
        `${targetInst.name}: Normal headcount verified (${detectedCount} detected)`,
        "success"
      );
    }
  };

  /**
   * Action: Smart-Assign an inspector to an institute
   */
  const dispatchInspector = (instituteId, inspectorId) => {
    const targetInst = institutes.find((i) => i.id === instituteId);
    const targetInspector = inspectors.find((ins) => ins.id === inspectorId);

    if (!targetInst || !targetInspector) return;

    // Update inspector status
    setInspectors((prev) =>
      prev.map((ins) =>
        ins.id === inspectorId
          ? {
              ...ins,
              status: "ON-INSPECTION",
              lastVisitedInstituteId: instituteId,
              lastInspectionDate: "Today"
            }
          : ins
      )
    );

    // Update institute
    setInstitutes((prev) =>
      prev.map((inst) =>
        inst.id === instituteId
          ? {
              ...inst,
              lastInspectedBy: `${targetInspector.id} (${targetInspector.name})`
            }
          : inst
      )
    );

    // Update anomaly status
    setAnomalies((prev) =>
      prev.map((a) =>
        a.instituteId === instituteId
          ? {
              ...a,
              status: "DISPATCHED",
              assignedInspector: `${targetInspector.id} (${targetInspector.name})`
            }
          : a
      )
    );

    addToast(
      "AI Inspector Dispatched!",
      `${targetInspector.name} assigned to ${targetInst.name} with Geofence lock & Anti-Collusion clearance`,
      "success"
    );

    setSelectedInstituteForAssign(null);
  };

  /**
   * Action: Start Frictionless Surprise VC
   */
  const initiateSurpriseVC = (institute) => {
    const token = `SATYA-VC-${institute.id}-${Date.now().toString(36).toUpperCase()}`;
    setSelectedInstituteForVC(institute);
    setActiveVCRoomToken(token);
    setActiveTab("SURPRISE_VC");

    addToast(
      "Surprise VC Initiated",
      `One-time link generated for Incharge ${institute.inchargeName} (${institute.inchargePhone})`,
      "info"
    );
  };

  /**
   * Action: Register Cryptographic Field Evidence
   */
  const recordFieldEvidence = (sealedRecord) => {
    setSealedEvidenceRecords((prev) => [sealedRecord, ...prev]);
    addToast(
      "Tamper-Proof Evidence Recorded",
      `Digital SHA-256 Geo-Seal locked with Lat/Lng & Device ID`,
      "success"
    );
  };

  return (
    <SatyaContext.Provider
      value={{
        activeTab,
        setActiveTab,
        institutes,
        inspectors,
        anomalies,
        stats,
        selectedInstituteForAssign,
        setSelectedInstituteForAssign,
        selectedInstituteForVC,
        setSelectedInstituteForVC,
        activeVCRoomToken,
        setActiveVCRoomToken,
        sealedEvidenceRecords,
        toasts,
        addToast,
        processCctvSnapshotResult,
        dispatchInspector,
        initiateSurpriseVC,
        recordFieldEvidence
      }}
    >
      {children}
    </SatyaContext.Provider>
  );
}

export function useSatya() {
  const context = useContext(SatyaContext);
  if (!context) {
    throw new Error("useSatya must be used within a SatyaProvider");
  }
  return context;
}
