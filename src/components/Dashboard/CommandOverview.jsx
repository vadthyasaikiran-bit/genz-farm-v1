import React from "react";
import { useSatya } from "../../context/SatyaContext";
import {
  Building2,
  Users,
  Eye,
  ShieldCheck,
  TrendingDown,
  AlertOctagon,
  Clock,
  Sparkles
} from "lucide-react";

export default function CommandOverview() {
  const { stats, anomalies, institutes, setActiveTab, setSelectedInstituteForAssign } = useSatya();

  const pendingAnomalies = anomalies.filter((a) => a.status === "PENDING_DISPATCH");

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Critical Anomalies Exist */}
      {pendingAnomalies.length > 0 && (
        <div className="glass-panel glass-panel-danger p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/40">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  CRITICAL DEFICIT ANOMALY DETECTED
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-900/60 text-rose-200 border border-rose-700/50">
                  {pendingAnomalies.length} ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                AI Edge-CCTV detected severe headcount deficits (up to 78%) in active DoSJE institutes. System recommends immediate Smart-Assign or Surprise VC.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="btn-quick-resolve-first-anomaly"
              onClick={() => {
                const target = institutes.find((i) => i.id === pendingAnomalies[0].instituteId);
                if (target) {
                  setSelectedInstituteForAssign(target);
                  setActiveTab("SMART_ASSIGN");
                }
              }}
              className="btn-danger text-xs py-2 px-4"
            >
              Resolve with Smart-Assign
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Institutes Monitored
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-['Outfit'] text-white">
              {stats.totalInstitutesMonitored.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-medium">98.2% Active</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Across 28 States & 8 UTs (DoSJE Schemes)</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ghost Beneficiaries Flagged
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-['Outfit'] text-rose-400">
              {stats.ghostBeneficiariesFlagged.toLocaleString()}
            </span>
            <span className="text-xs text-rose-300/80 font-mono">+18 Today</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Prevented Phantom Claims via Edge Vision</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Estimated Funds Saved
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-['Outfit'] text-emerald-400">
              ₹{stats.estimatedFundsProtectedCr} Cr
            </span>
            <span className="text-xs text-emerald-300/80 font-mono">Direct Benefit</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>DBT leakages blocked before disbursement</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              AI Inspection Latency
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-['Outfit'] text-cyan-400">
              {stats.averageAiAuditLatencySeconds}s
            </span>
            <span className="text-xs text-cyan-300 font-mono">15-Min Cycle</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>99.4% Bandwidth Saved vs Continuous Video</span>
          </div>
        </div>
      </div>
    </div>
  );
}
