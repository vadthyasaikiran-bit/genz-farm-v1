import React, { useState } from "react";
import { SatyaProvider, useSatya } from "./context/SatyaContext";
import Navbar from "./components/Navbar";
import CommandOverview from "./components/Dashboard/CommandOverview";
import AnomalyFeed from "./components/Dashboard/AnomalyFeed";
import GeoControlMap from "./components/Dashboard/GeoControlMap";
import CCTVNodeSimulator from "./components/EdgeCCTV/CCTVNodeSimulator";
import SmartAssignEngine from "./components/SmartAssign/SmartAssignEngine";
import SurpriseVCHub from "./components/VideoAudit/SurpriseVCHub";
import InspectorMobileSimulator from "./components/InspectorApp/InspectorMobileSimulator";
import {
  ShieldAlert,
  Camera,
  Compass,
  Video,
  Smartphone,
  Presentation,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from "lucide-react";

function MainContent() {
  const { activeTab, setActiveTab } = useSatya();
  const [showPitchModal, setShowPitchModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 selection:bg-cyan-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Pitch Showcase Quick Bar for SIH Presentation */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/25">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Presentation className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white font-['Outfit'] block">
                SIH 2026 Presentation Mode: 4 Pillars of Project Satya
              </span>
              <span className="text-[11px] text-slate-400">
                Click any pillar to demonstrate the working innovation directly to evaluators
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setActiveTab("SMART_ASSIGN")}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === "SMART_ASSIGN"
                  ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:border-cyan-500/50"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>1. Smart-Assign (Anti-Collusion)</span>
            </button>

            <button
              onClick={() => setActiveTab("EDGE_CCTV")}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === "EDGE_CCTV"
                  ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:border-cyan-500/50"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>2. Edge-AI CCTV (Head Count)</span>
            </button>

            <button
              onClick={() => setActiveTab("SURPRISE_VC")}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === "SURPRISE_VC"
                  ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:border-cyan-500/50"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>3. Frictionless VC (WebRTC)</span>
            </button>

            <button
              onClick={() => setActiveTab("INSPECTOR_APP")}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                activeTab === "INSPECTOR_APP"
                  ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:border-cyan-500/50"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>4. Tamper-Proof Geo-Seal</span>
            </button>

            <button
              onClick={() => setShowPitchModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pitch Deck Notes</span>
            </button>
          </div>
        </div>

        {/* View Router */}
        {activeTab === "COMMAND_CENTER" && (
          <div className="space-y-8 animate-fade-in">
            <CommandOverview />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 space-y-6">
                <AnomalyFeed />
              </div>
              <div className="lg:col-span-6 space-y-6">
                <GeoControlMap />
              </div>
            </div>
          </div>
        )}

        {activeTab === "EDGE_CCTV" && (
          <div className="animate-fade-in">
            <CCTVNodeSimulator />
          </div>
        )}

        {activeTab === "SMART_ASSIGN" && (
          <div className="animate-fade-in">
            <SmartAssignEngine />
          </div>
        )}

        {activeTab === "SURPRISE_VC" && (
          <div className="animate-fade-in">
            <SurpriseVCHub />
          </div>
        )}

        {activeTab === "INSPECTOR_APP" && (
          <div className="animate-fade-in">
            <InspectorMobileSimulator />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <strong className="text-white font-['Outfit']">PROJECT SATYA</strong> — AI-Powered Central Nervous System for DoSJE Schemes
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>SIH 2026 Innovation Submission</span>
            <span>•</span>
            <span className="text-cyan-400">Sovereign GovTech Stack</span>
          </div>
        </div>
      </footer>

      {/* Pitch Deck / SIH Guide Modal */}
      {showPitchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-5 bg-slate-900 border-cyan-500/40 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  SIH 2026 Pitch Notes: How to Win Judges with Project Satya
                </h3>
              </div>
              <button
                onClick={() => setShowPitchModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] mb-1">
                  1. The Philosophy Hook: "The System Does the Watching"
                </h4>
                <p>
                  Most hackathon teams build a video viewer where officials sit and watch CCTV cameras manually. Tell the judges: <em>"A government official cannot watch 1,800 cameras at once. In Project Satya, the Edge AI watches 24/7 and alerts the official ONLY when an anomaly is detected."</em>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] mb-1">
                  2. Rural Bandwidth Solution (15-Min Snapshots)
                </h4>
                <p>
                  Explain why 24/7 video streaming fails in rural India (bandwidth cost, buffering, server load). Project Satya uses 15-minute image snapshots, reducing daily data transmission from <strong>4,500 MB to 18 MB</strong> (99.6% reduction).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-1">
                  3. Anti-Collusion Smart-Assign
                </h4>
                <p>
                  Demonstrate the 50km geofence. Show the judges how Inspector Sunil is disqualified from inspecting Adarsh Kendra because he visited it on August 14. <em>"Collusion between inspectors and NGO directors is eliminated by mathematical constraint."</em>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] mb-1">
                  4. Zero-Install Frictionless Surprise VC
                </h4>
                <p>
                  Demonstrate the one-click WebRTC link. In-charges can no longer say "the app crashed" or "I forgot the password." The link opens directly in mobile Chrome/Safari with verified GPS and timestamp watermarks.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[11px] mb-1">
                  5. Anti-Spoofing & Cryptographic Proof
                </h4>
                <p>
                  Open the Judge Sandbox on Pillar 4. Click "Simulate Fake GPS Spoofing" and watch the HMAC-SHA256 signature break in real time. Prove to the judges that inspectors cannot fake their location or take pictures of pictures.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowPitchModal(false)}
                className="btn-primary text-xs py-2 px-5"
              >
                Start Demonstration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SatyaProvider>
      <MainContent />
    </SatyaProvider>
  );
}
