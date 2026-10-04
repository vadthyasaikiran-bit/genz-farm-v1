import React from "react";
import { useSatya } from "../../context/SatyaContext";
import {
  AlertTriangle,
  Compass,
  Video,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Building,
  UserCheck
} from "lucide-react";

export default function AnomalyFeed() {
  const {
    anomalies,
    institutes,
    setActiveTab,
    setSelectedInstituteForAssign,
    initiateSurpriseVC
  } = useSatya();

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
          <h3 className="text-base font-bold text-white font-['Outfit']">
            Autonomous Anomaly Alert Feed
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
            {anomalies.length} Flagged Events
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">Real-Time Edge Synced</span>
      </div>

      <div className="mt-4 space-y-3.5">
        {anomalies.map((item) => {
          const institute = institutes.find((i) => i.id === item.instituteId);
          const isPending = item.status === "PENDING_DISPATCH";

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                isPending
                  ? "bg-slate-900/80 border-rose-500/30 hover:border-rose-500/60 shadow-lg shadow-rose-950/10"
                  : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        item.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {item.severity} SEVERITY
                    </span>
                    <span className="text-xs text-cyan-400 font-medium font-mono">
                      {item.scheme}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.timestamp}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {item.instituteName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {item.district} | ID: <span className="font-mono text-slate-300">{item.instituteId}</span>
                  </p>

                  {/* Discrepancy Bar */}
                  <div className="pt-2 flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span>Claimed:</span>
                      <strong className="text-white bg-slate-800 px-2 py-0.5 rounded">
                        {item.claimedCount}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <span>AI Counted:</span>
                      <strong className="text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/40">
                        {item.detectedCount}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{item.deficitPercent}% Deficit Flagged</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap lg:flex-col items-end gap-2.5 shrink-0 justify-start">
                  {isPending ? (
                    <>
                      <button
                        id={`btn-assign-${item.id}`}
                        onClick={() => {
                          if (institute) {
                            setSelectedInstituteForAssign(institute);
                            setActiveTab("SMART_ASSIGN");
                          }
                        }}
                        className="btn-primary text-xs py-2 px-3.5 w-full sm:w-auto"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Smart-Assign (50km)</span>
                      </button>

                      <button
                        id={`btn-vc-${item.id}`}
                        onClick={() => {
                          if (institute) {
                            initiateSurpriseVC(institute);
                          }
                        }}
                        className="btn-secondary text-xs py-2 px-3.5 w-full sm:w-auto hover:text-amber-300 hover:border-amber-500/40"
                      >
                        <Video className="w-3.5 h-3.5 text-amber-400" />
                        <span>Frictionless Surprise VC</span>
                      </button>
                    </>
                  ) : (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2.5 text-right w-full">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Audit Dispatched</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                        {item.assignedInspector}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
