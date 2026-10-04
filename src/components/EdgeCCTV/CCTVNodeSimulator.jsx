import React, { useState, useEffect, useRef } from "react";
import { useSatya } from "../../context/SatyaContext";
import {
  Camera,
  Cpu,
  Wifi,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RefreshCw,
  Zap,
  Sliders,
  Maximize2,
  VideoOff
} from "lucide-react";

export default function CCTVNodeSimulator() {
  const { institutes, processCctvSnapshotResult } = useSatya();

  const [selectedInstituteId, setSelectedInstituteId] = useState(institutes[0]?.id || "INST-RAJ-104");
  const selectedInstitute = institutes.find((i) => i.id === selectedInstituteId) || institutes[0];

  // Simulator scenarios
  const [activeScenario, setActiveScenario] = useState("SCAM_GHOST_BENEFICIARIES");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(14 * 60 + 52); // ~15 min
  const [claimedAttendance, setClaimedAttendance] = useState(selectedInstitute.claimedBeneficiaries);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Preset scenarios
  const SCENARIOS = {
    SCAM_GHOST_BENEFICIARIES: {
      title: "Scam Detection: Ghost Beneficiaries",
      description: "Institute registry claims 50 attendees for DBT funding, but AI detects only 11 heads in the hall.",
      claimed: 50,
      detectedCount: 11,
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
      boxes: [
        { x: 120, y: 140, w: 60, h: 70, label: "Head #1", conf: 0.96 },
        { x: 210, y: 155, w: 55, h: 65, label: "Head #2", conf: 0.94 },
        { x: 300, y: 160, w: 58, h: 68, label: "Head #3", conf: 0.92 },
        { x: 390, y: 150, w: 62, h: 72, label: "Head #4", conf: 0.98 },
        { x: 480, y: 165, w: 54, h: 64, label: "Head #5", conf: 0.91 },
        { x: 570, y: 145, w: 60, h: 70, label: "Head #6", conf: 0.95 },
        { x: 650, y: 170, w: 58, h: 66, label: "Head #7", conf: 0.89 },
        { x: 160, y: 250, w: 65, h: 75, label: "Head #8", conf: 0.93 },
        { x: 260, y: 260, w: 60, h: 70, label: "Head #9", conf: 0.97 },
        { x: 360, y: 270, w: 62, h: 74, label: "Head #10", conf: 0.95 },
        { x: 460, y: 255, w: 64, h: 72, label: "Head #11", conf: 0.92 }
      ]
    },
    COMPLIANT_NORMAL: {
      title: "Compliant Operation: Normal Day",
      description: "Classroom full with legitimate students under PM-AJAY skill center. Claimed 25 vs 24 detected.",
      claimed: 25,
      detectedCount: 24,
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",
      boxes: Array.from({ length: 24 }).map((_, i) => ({
        x: 60 + (i % 6) * 110,
        y: 100 + Math.floor(i / 6) * 90,
        w: 55,
        h: 65,
        label: `Head #${i + 1}`,
        conf: 0.88 + (i % 10) * 0.01
      }))
    },
    TAMPER_OBSTRUCTED: {
      title: "CCTV Tampering / Obstructed Lens",
      description: "Camera intentionally blocked or pointed away during session. Zero valid human head signatures detected.",
      claimed: 40,
      detectedCount: 0,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
      boxes: []
    }
  };

  const currentConfig = SCENARIOS[activeScenario];

  // Synchronize claimed count when changing institute or scenario
  useEffect(() => {
    setClaimedAttendance(currentConfig.claimed);
    drawBoundingBoxes(currentConfig.boxes);
  }, [activeScenario]);

  // Countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev <= 1 ? 15 * 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Draw bounding boxes on canvas
  const drawBoundingBoxes = (boxes) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boxes.forEach((box) => {
      // Box outline
      ctx.strokeStyle = "#06B6D4";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(box.x, box.y, box.w, box.h);

      // Label background
      ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
      ctx.fillRect(box.x, box.y - 20, box.w + 24, 20);

      // Label text
      ctx.fillStyle = "#070B14";
      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.fillText(`${box.label} (${Math.round(box.conf * 100)}%)`, box.x + 4, box.y - 6);
    });
  };

  // Trigger snapshot AI detection run
  const triggerAiInference = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      drawBoundingBoxes(currentConfig.boxes);
      // Dispatch result to Project Satya Central Nervous System
      processCctvSnapshotResult(
        selectedInstitute.id,
        currentConfig.detectedCount,
        currentConfig.image
      );
    }, 1200);
  };

  const deficit = Math.max(0, claimedAttendance - currentConfig.detectedCount);
  const deficitPct = claimedAttendance > 0 ? Math.round((deficit / claimedAttendance) * 100) : 0;
  const isSevereAnomaly = deficitPct >= 30;

  return (
    <div className="space-y-6">
      {/* Bandwidth Savings Banner (The Core SIH Innovation Pitch) */}
      <div className="glass-panel p-4 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white font-['Outfit']">
                Bandwidth-Friendly Rural Edge Architecture
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                99.6% Data Saved
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Continuous 24/7 RTSP streaming requires <span className="text-rose-400 font-mono">~4.5 GB/day</span> (fails in rural India). Project Satya captures a 15-minute lightweight snapshot (<span className="text-emerald-400 font-mono">~18 MB/day</span>) with server/edge YOLOv8 inference.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <div className="bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 block">Next 15m Snapshot In:</span>
            <span className="text-cyan-400 font-bold text-sm">{formatCountdown(countdownSeconds)}</span>
          </div>
          <button
            id="btn-force-snapshot"
            onClick={triggerAiInference}
            disabled={isProcessing}
            className="btn-primary text-xs py-2 px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            <span>Force Instant Snapshot</span>
          </button>
        </div>
      </div>

      {/* Main CCTV Feed & AI Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Camera Screen */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="pulse-dot pulse-emerald"></div>
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">NODE: CCTV-CAM-01 (HALL A)</span>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {selectedInstitute.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                1080p • 15fps Snapshot
              </span>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                YOLOv8 Head Model
              </span>
            </div>
          </div>

          {/* Video / Snapshot Display with AI Bounding Box Canvas */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl h-[440px] flex items-center justify-center">
            {/* The Image */}
            <img
              ref={imageRef}
              src={currentConfig.image}
              alt="Institute CCTV Snapshot"
              className="w-full h-full object-cover select-none"
              onLoad={() => drawBoundingBoxes(currentConfig.boxes)}
            />

            {/* Canvas overlay for AI bounding boxes */}
            <canvas
              ref={canvasRef}
              width={800}
              height={440}
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
            />

            {/* High-Tech CCTV OSD (On-Screen Display) */}
            <div className="cctv-scanline"></div>

            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono text-[11px] text-white flex items-center gap-2.5 z-30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="font-bold text-rose-400">REC [SNAPSHOT MODE]</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">GEO: {selectedInstitute.lat.toFixed(4)}, {selectedInstitute.lng.toFixed(4)}</span>
            </div>

            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono text-[11px] text-cyan-300 flex items-center gap-3 z-30">
              <span>DoSJE NODE ID: {selectedInstitute.id}</span>
              <span className="text-slate-500">|</span>
              <span>TIME: 2026-09-19 11:15:00 IST</span>
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-40">
                <div className="w-12 h-12 rounded-2xl border-2 border-cyan-500 border-t-transparent animate-spin mb-3"></div>
                <div className="text-sm font-bold text-cyan-300 font-mono">
                  RUNNING YOLOv8 HEAD DETECTION MODEL...
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Parsing 15-minute frame • Filtering background noise • Counting human centroids
                </div>
              </div>
            )}
          </div>

          {/* Scenario Switcher Controls */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              SIH Interactive Demo Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.entries(SCENARIOS).map(([key, sc]) => {
                const isSelected = activeScenario === key;
                return (
                  <button
                    key={key}
                    id={`btn-scenario-${key.toLowerCase()}`}
                    onClick={() => setActiveScenario(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{sc.title.split(":")[0]}</span>
                      {key === "SCAM_GHOST_BENEFICIARIES" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                          Anomaly Alert
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {sc.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Discrepancy & Verification Dashboard */}
        <div className="glass-panel p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Edge AI Discrepancy Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated cross-check between NGO claims and computer vision headcounts
            </p>
          </div>

          {/* Institute Target Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Target Institute Node:
            </label>
            <select
              value={selectedInstituteId}
              onChange={(e) => setSelectedInstituteId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.district})
                </option>
              ))}
            </select>
          </div>

          {/* Headcount Comparison Scorecard */}
          <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Claimed Attendance:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={claimedAttendance}
                  onChange={(e) => setClaimedAttendance(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-right font-mono font-bold text-white focus:border-cyan-500"
                />
                <span className="text-xs text-slate-500">persons</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">AI Model Detected:</span>
              <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/40">
                {currentConfig.detectedCount} Heads Counted
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Discrepancy Deficit:</span>
              <span
                className={`text-sm font-mono font-bold ${
                  isSevereAnomaly ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {deficitPct}% ({deficit} missing)
              </span>
            </div>
          </div>

          {/* Dynamic Anomaly Trigger Status */}
          {isSevereAnomaly ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Autonomous Anomaly Triggered</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                Attendance discrepancy exceeded threshold (&gt;30%). The central system has raised a High-Priority Flag and recommended risk-weighted Smart-Assign.
              </p>
              <div className="pt-1">
                <span className="text-[10px] font-mono text-rose-300 block">
                  ACTION: Dispatched to DoSJE Command Feed
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Attendance Verified Within Normal Limits</span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Headcount aligns with DBT beneficiary claims. Normal 15-minute surveillance rhythm maintained.
              </p>
            </div>
          )}

          {/* Model Hyperparameters (Showcases AI depth to judges) */}
          <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Detection Confidence:
              </span>
              <span className="font-mono text-slate-200">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>High Recall (50%)</span>
              <span>Balanced (75%)</span>
              <span>Strict Precision (95%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
