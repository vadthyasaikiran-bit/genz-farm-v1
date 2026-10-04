import React from "react";
import { useSatya } from "../context/SatyaContext";
import {
  ShieldAlert,
  Camera,
  Compass,
  Video,
  Smartphone,
  Activity,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info
} from "lucide-react";

export default function Navbar() {
  const { activeTab, setActiveTab, anomalies, stats, toasts } = useSatya();

  const criticalAnomaliesCount = anomalies.filter((a) => a.status === "PENDING_DISPATCH").length;

  const navItems = [
    {
      id: "COMMAND_CENTER",
      label: "DoSJE Command Center",
      subtext: "Ministry Neural Core",
      icon: ShieldAlert,
      badge: criticalAnomaliesCount > 0 ? `${criticalAnomaliesCount} Alerts` : null,
      badgeType: "danger"
    },
    {
      id: "EDGE_CCTV",
      label: "Edge-AI CCTV Node",
      subtext: "15-Min Snapshot Head Counter",
      icon: Camera,
      badge: "YOLOv8 Edge",
      badgeType: "cyan"
    },
    {
      id: "SMART_ASSIGN",
      label: "Smart-Assign Radar",
      subtext: "50km Geofence & Anti-Collusion",
      icon: Compass,
      badge: "Risk-Weighted",
      badgeType: "emerald"
    },
    {
      id: "SURPRISE_VC",
      label: "Surprise VC Hub",
      subtext: "Zero-Install WebRTC",
      icon: Video,
      badge: "Frictionless",
      badgeType: "amber"
    },
    {
      id: "INSPECTOR_APP",
      label: "Inspector Mobile App",
      subtext: "Liveness & Crypto Geo-Seal",
      icon: Smartphone,
      badge: "SHA-256",
      badgeType: "cyan"
    }
  ];

  return (
    <>
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Top Sovereign Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/50 px-6 py-1.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
              सत्यमेव जयते | Government of India
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Department of Social Justice and Empowerment (DoSJE)</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="pulse-dot pulse-emerald w-1.5 h-1.5"></span>
              Central Nervous System: AUTONOMOUS ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Nodes Monitored: {stats.activeEdgeCctvNodes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Inference Latency: 1.2s</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
              SIH 2026 SPECIAL PROTOTYPE
            </div>
          </div>
        </div>

        {/* Main Branding & Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-3.5 cursor-pointer"
              onClick={() => setActiveTab("COMMAND_CENTER")}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
                    PROJECT <span className="text-cyan-400">SATYA</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-mono font-semibold">
                    v2.4-AI
                  </span>
                </div>
                <p className="text-xs text-slate-400">Autonomous Sentinel for Social Welfare Schemes</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1.5">
              {navItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id.toLowerCase()}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 py-2 rounded-xl text-left transition-all duration-200 flex items-center gap-2.5 ${
                      isActive
                        ? "bg-cyan-500/10 text-white border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-cyan-400" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                        {tab.label}
                        {tab.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                              tab.badgeType === "danger"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                                : tab.badgeType === "cyan"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : tab.badgeType === "emerald"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono hidden md:block">
                        {tab.subtext}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Floating Notifications Toaster */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto glass-panel p-4 border rounded-xl shadow-2xl flex items-start gap-3 animate-fade-in transition-all bg-slate-900/95 border-slate-700/80"
          >
            {toast.type === "danger" && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
