import React, { useState } from "react";
import { useSatya } from "../../context/SatyaContext";
import {
  calculateHaversineDistance,
  evaluateSmartAssignment
} from "../../services/riskEngine";
import {
  MapPin,
  Compass,
  Video,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Layers,
  Info
} from "lucide-react";

export default function GeoControlMap() {
  const {
    institutes,
    inspectors,
    setSelectedInstituteForAssign,
    initiateSurpriseVC,
    setActiveTab
  } = useSatya();

  const [selectedInst, setSelectedInst] = useState(institutes[0]);
  const [showGeofence50km, setShowGeofence50km] = useState(true);
  const [showCollusionVectors, setShowCollusionVectors] = useState(true);

  // Map projection scale for Rajasthan / North Region
  // Centered roughly at lat 26.91, lng 75.78 (Jaipur)
  // Map dimensions: 800 x 500
  const centerLat = 26.91;
  const centerLng = 75.78;
  const scale = 220; // pixels per degree

  const projectCoord = (lat, lng) => {
    const x = 400 + (lng - centerLng) * scale;
    // Invert y because SVG y goes down
    const y = 250 - (lat - centerLat) * scale;
    return { x: Math.max(20, Math.min(780, x)), y: Math.max(20, Math.min(480, y)) };
  };

  const evalResults = selectedInst
    ? evaluateSmartAssignment(selectedInst, inspectors, 50)
    : null;

  return (
    <div className="glass-panel p-6 space-y-4">
      {/* Map Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Geospatial Risk & Inspector Geofence Radar
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time GIS surveillance overlay with 50km radius constraint & anti-collusion vector monitoring
          </p>
        </div>

        {/* Toggle Layers */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowGeofence50km(!showGeofence50km)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              showGeofence50km
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            50km Geofence
          </button>

          <button
            onClick={() => setShowCollusionVectors(!showCollusionVectors)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              showCollusionVectors
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Collusion Vectors
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 relative bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl h-[480px]">
          {/* Subtle Grid Map Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#38BDF8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
              backgroundSize: "20px 20px, 40px 40px, 40px 40px"
            }}
          />

          <svg className="w-full h-full" viewBox="0 0 800 500">
            <defs>
              {/* Radial gradient for geofence */}
              <radialGradient id="geofenceGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.05" />
                <stop offset="85%" stopColor="#06B6D4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
              </radialGradient>
              <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Radar concentric circles around Jaipur Central Hub */}
            <circle cx="400" cy="250" r="70" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="3 3" />
            <circle cx="400" cy="250" r="140" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeDasharray="4 4" />
            <circle cx="400" cy="250" r="210" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeDasharray="5 5" />
            
            {/* Compass Axes */}
            <line x1="400" y1="20" x2="400" y2="480" stroke="rgba(255, 255, 255, 0.05)" />
            <line x1="20" y1="250" x2="780" y2="250" stroke="rgba(255, 255, 255, 0.05)" />

            {/* Render 50km Geofence circles around selected institute */}
            {showGeofence50km && selectedInst && (
              (() => {
                const center = projectCoord(selectedInst.lat, selectedInst.lng);
                // 50km in pixels at this projection scale ~ 90px
                return (
                  <g>
                    <circle
                      cx={center.x}
                      cy={center.y}
                      r="90"
                      fill="url(#geofenceGrad)"
                      stroke="#06B6D4"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                    <text
                      x={center.x + 95}
                      y={center.y - 10}
                      fill="#38BDF8"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      50km GEOFENCE RADIUS
                    </text>
                  </g>
                );
              })()
            )}

            {/* Render Collusion Vectors (Lines between inspectors and institutes they visited last) */}
            {showCollusionVectors &&
              inspectors.map((ins) => {
                const targetInstitute = institutes.find((i) => i.id === ins.lastVisitedInstituteId);
                if (!targetInstitute) return null;
                const p1 = projectCoord(ins.lat, ins.lng);
                const p2 = projectCoord(targetInstitute.lat, targetInstitute.lng);

                return (
                  <g key={`collusion-${ins.id}`}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      strokeOpacity="0.6"
                    />
                    <circle cx={(p1.x + p2.x) / 2} cy={(p1.y + p2.y) / 2} r="3" fill="#EF4444" />
                  </g>
                );
              })}

            {/* Render Inspectors */}
            {inspectors.map((ins) => {
              const pos = projectCoord(ins.lat, ins.lng);
              const isBlocked = selectedInst && ins.lastVisitedInstituteId === selectedInst.id;

              return (
                <g key={ins.id} className="cursor-pointer group">
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    fill="#1E293B"
                    stroke={isBlocked ? "#EF4444" : "#10B981"}
                    strokeWidth="2"
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="4"
                    fill={isBlocked ? "#EF4444" : "#10B981"}
                  />
                  <text
                    x={pos.x + 12}
                    y={pos.y + 4}
                    fill="#E2E8F0"
                    fontSize="10"
                    fontFamily="sans-serif"
                    fontWeight="600"
                  >
                    {ins.id} ({ins.name.split(" ")[0]})
                  </text>
                </g>
              );
            })}

            {/* Render Institutes */}
            {institutes.map((inst) => {
              const pos = projectCoord(inst.lat, inst.lng);
              const isSelected = selectedInst?.id === inst.id;
              const isCritical = inst.riskLevel === "CRITICAL";
              const isHigh = inst.riskLevel === "HIGH";

              const color = isCritical ? "#EF4444" : isHigh ? "#F59E0B" : "#10B981";

              return (
                <g
                  key={inst.id}
                  onClick={() => setSelectedInst(inst)}
                  className="cursor-pointer"
                >
                  {/* Outer pulse if critical or selected */}
                  {(isCritical || isSelected) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? "18" : "14"}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.7"
                      className="animate-ping"
                    />
                  )}

                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "10" : "7"}
                    fill="#0B1120"
                    stroke={color}
                    strokeWidth={isSelected ? "3" : "2"}
                  />
                  <circle cx={pos.x} cy={pos.y} r="3" fill={color} />

                  <text
                    x={pos.x}
                    y={pos.y - 12}
                    textAnchor="middle"
                    fill={isSelected ? "#38BDF8" : "#94A3B8"}
                    fontSize={isSelected ? "11" : "9"}
                    fontFamily="sans-serif"
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {inst.name.split(" ")[0]} ({inst.riskScore})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5 shadow-lg">
            <div className="font-bold text-slate-300 font-sans uppercase tracking-wider text-[10px]">
              Surveillance Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Critical Risk (&gt;75)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">High Risk (40-75)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Low Risk (&lt;40)</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
              <span className="text-slate-300">Inspector Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-rose-500"></span>
              <span className="text-rose-400">Anti-Collusion Lock</span>
            </div>
          </div>
        </div>

        {/* Right Details Panel for Selected Institute */}
        {selectedInst && (
          <div className="glass-panel p-5 space-y-4 border-slate-800">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    selectedInst.riskLevel === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : selectedInst.riskLevel === "HIGH"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  Risk Score: {selectedInst.riskScore}/100
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                  {selectedInst.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedInst.scheme}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Claimed Attendance:</span>
                <span className="text-white font-bold">{selectedInst.claimedBeneficiaries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Detected (CCTV):</span>
                <span className="text-rose-400 font-bold">{selectedInst.aiDetectedBeneficiaries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CCTV Status:</span>
                <span
                  className={`font-bold ${
                    selectedInst.cctvStatus === "ONLINE"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {selectedInst.cctvStatus} ({selectedInst.cctvUptimePercent}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Inspected By:</span>
                <span className="text-amber-300 font-bold">{selectedInst.lastInspectedBy}</span>
              </div>
            </div>

            {/* Smart-Assign Recommendation Preview */}
            {evalResults && (
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    Optimal AI Assign:
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {evalResults.eligibleCount} in 50km
                  </span>
                </div>

                {evalResults.bestMatch ? (
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs">
                    <div className="font-bold text-cyan-200">
                      {evalResults.bestMatch.name} ({evalResults.bestMatch.id})
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                      Distance: {evalResults.bestMatch.distanceKm} km • Integrity: {evalResults.bestMatch.integrityRating}/5.0
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
                    No eligible inspectors within 50km radius.
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                id="btn-map-smart-assign"
                onClick={() => {
                  setSelectedInstituteForAssign(selectedInst);
                  setActiveTab("SMART_ASSIGN");
                }}
                className="btn-primary text-xs py-2 px-3"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Smart-Assign</span>
              </button>

              <button
                id="btn-map-surprise-vc"
                onClick={() => initiateSurpriseVC(selectedInst)}
                className="btn-secondary text-xs py-2 px-3 hover:border-amber-500/40 hover:text-amber-300"
              >
                <Video className="w-3.5 h-3.5 text-amber-400" />
                <span>Surprise VC</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
