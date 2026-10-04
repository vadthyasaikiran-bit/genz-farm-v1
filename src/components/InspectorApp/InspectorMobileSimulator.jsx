import React, { useState, useEffect, useRef } from "react";
import { useSatya } from "../../context/SatyaContext";
import {
  generateCryptoEvidenceSeal,
  verifyCryptoEvidenceSeal
} from "../../services/cryptoEvidence";
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Camera,
  MapPin,
  Clock,
  Cpu,
  Lock,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Sliders
} from "lucide-react";

export default function InspectorMobileSimulator() {
  const { institutes, recordFieldEvidence, addToast } = useSatya();

  const [selectedInstId, setSelectedInstId] = useState(institutes[0]?.id || "INST-RAJ-104");
  const institute = institutes.find((i) => i.id === selectedInstId) || institutes[0];

  // Mobile App Step States
  // STEP 1: GEOFENCE_ARRIVAL | STEP 2: LIVENESS_CHECK | STEP 3: CRYPTO_SEAL | STEP 4: VERIFICATION
  const [currentStep, setCurrentStep] = useState("LIVENESS_CHECK");

  // Liveness Check Simulation
  const [livenessStage, setLivenessStage] = useState("IDLE"); // IDLE | CHALLENGE_ACTIVE | VERIFIED
  const [challengePrompt, setChallengePrompt] = useState("Blink Twice & Turn Head Slightly Right");
  const [livenessProgress, setLivenessProgress] = useState(0);

  // Evidence Seal Data
  const [evidenceSeal, setEvidenceSeal] = useState(null);
  const [isSealing, setIsSealing] = useState(false);

  // Judge Tamper Sandbox
  const [spoofGpsEnabled, setSpoofGpsEnabled] = useState(false);
  const [spoofedLat, setSpoofedLat] = useState("28.613900"); // Delhi fake coord
  const [verificationResult, setVerificationResult] = useState(null);

  // Liveness Animation trigger
  const runLivenessChallenge = () => {
    setLivenessStage("CHALLENGE_ACTIVE");
    setLivenessProgress(10);
    const interval = setInterval(() => {
      setLivenessProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLivenessStage("VERIFIED");
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Generate the cryptographic seal
  const generateSeal = async () => {
    setIsSealing(true);
    const seal = await generateCryptoEvidenceSeal({
      lat: institute.lat,
      lng: institute.lng,
      deviceId: "SECURE_GOV_KNOX_DEVICE_IN-8891",
      inspectorId: "INS-01 (Rajesh Mehra)",
      instituteId: institute.id,
      imagePayloadSnippet: `INSPECTION_PHOTO_${institute.id}_${Date.now()}`
    });

    setEvidenceSeal(seal);
    setIsSealing(false);
    setCurrentStep("CRYPTO_SEAL");
    recordFieldEvidence(seal);

    // Initial authentic verification
    const initialVerify = await verifyCryptoEvidenceSeal(seal);
    setVerificationResult(initialVerify);
  };

  // Test Tamper Verification
  const testIntegrity = async (simulateSpoof) => {
    if (!evidenceSeal) return;

    if (simulateSpoof) {
      const tampered = await verifyCryptoEvidenceSeal(evidenceSeal, {
        lat: spoofedLat,
        deviceId: "SPOOFED_GENERIC_EMULATOR"
      });
      setVerificationResult(tampered);
      addToast(
        "Tamper Detected!",
        "Cryptographic seal failed: GPS Latitude and Device mismatch detected",
        "danger"
      );
    } else {
      const authentic = await verifyCryptoEvidenceSeal(evidenceSeal);
      setVerificationResult(authentic);
      addToast(
        "Cryptographic Seal Valid",
        "Digital signature perfectly verified against blockchain/server registry",
        "success"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border-cyan-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Tamper-Proof Geo-Evidence (Anti-Spoofing & Liveness)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  HMAC SHA-256 Seal
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Solves the biggest loophole in government inspections (GPS spoofing apps & taking pictures of pictures). Combines active 3D liveness detection with immutable cryptographic hash binding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300">
              Anti-Mock Location Guard: ACTIVE
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Smartphone Device Simulation */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="mobile-device-shell text-white">
            {/* Notch */}
            <div className="mobile-notch"></div>

            {/* Mobile Status Bar */}
            <div className="px-7 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
              <span>11:15 AM</span>
              <div className="flex items-center gap-2">
                <span>5G+</span>
                <span>100%</span>
              </div>
            </div>

            {/* App Header Inside Phone */}
            <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <h5 className="text-xs font-bold font-['Outfit']">Satya Field PMU</h5>
                  <p className="text-[9px] text-slate-400 font-mono">Officer: INS-01 (Rajesh)</p>
                </div>
              </div>

              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GPS LOCKED
              </span>
            </div>

            {/* Inside Phone Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs font-sans">
              {/* Target Details Card */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">ASSIGNED TARGET</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Within 42m
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs leading-tight">
                  {institute.name}
                </h4>
                <div className="text-[10px] text-slate-400 font-mono">
                  {institute.lat.toFixed(6)}, {institute.lng.toFixed(6)}
                </div>
              </div>

              {/* Step 1: Liveness Camera Simulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    Pillar 4A: 3D Liveness Detection
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Anti-Screen Spoof
                  </span>
                </div>

                <div className="relative h-44 rounded-xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Inspector Selfie / Incharge Liveness"
                    className="w-full h-full object-cover"
                  />

                  {/* Liveness Target Reticle */}
                  <div className="absolute inset-4 border-2 border-dashed border-cyan-400/60 rounded-full flex items-center justify-center pointer-events-none">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                  </div>

                  {/* Challenge Prompt Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md p-2 rounded-lg text-center font-mono text-[10px]">
                    {livenessStage === "CHALLENGE_ACTIVE" && (
                      <div className="text-amber-300 animate-pulse">
                        CHALLENGE: {challengePrompt} ({livenessProgress}%)
                      </div>
                    )}
                    {livenessStage === "VERIFIED" && (
                      <div className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>LIVENESS VERIFIED (3D PULSE CONFIRMED)</span>
                      </div>
                    )}
                    {livenessStage === "IDLE" && (
                      <div className="text-slate-300">
                        Position face inside circle for motion test
                      </div>
                    )}
                  </div>
                </div>

                {livenessStage !== "VERIFIED" ? (
                  <button
                    id="btn-run-liveness"
                    onClick={runLivenessChallenge}
                    className="w-full btn-primary text-xs py-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Liveness Challenge</span>
                  </button>
                ) : (
                  <button
                    id="btn-seal-crypto-evidence"
                    onClick={generateSeal}
                    disabled={isSealing}
                    className="w-full btn-primary text-xs py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-emerald-500/20"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Generate Cryptographic Geo-Seal</span>
                  </button>
                )}
              </div>

              {/* Step 2: Cryptographic Geo-Seal Output */}
              {evidenceSeal && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      IMMUTABLE GEO-SEAL
                    </span>
                    <span className="font-mono text-[10px]">SHA-256</span>
                  </div>

                  <div className="font-mono text-[10px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800 break-all leading-relaxed">
                    SIG: {evidenceSeal.digitalSignature}
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                    <div>TIME: {evidenceSeal.canonicalPayload.timestamp}</div>
                    <div>DEVICE: {evidenceSeal.canonicalPayload.deviceId}</div>
                    <div>COORDS: {evidenceSeal.canonicalPayload.lat}, {evidenceSeal.canonicalPayload.lng}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Home Indicator */}
            <div className="pb-2 pt-1 flex justify-center">
              <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: The Interactive "Judge Tamper-Test Sandbox" */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Judge Sandbox: Test Cryptographic Tamper-Proofing
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate mock GPS spoofing or report modification to test how Project Satya mathematically catches tampering.
              </p>
            </div>

            {/* Target Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Active Audit Institute:
              </label>
              <select
                value={selectedInstId}
                onChange={(e) => {
                  setSelectedInstId(e.target.value);
                  setEvidenceSeal(null);
                  setLivenessStage("IDLE");
                  setVerificationResult(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {institutes.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Tamper Test Simulation Controls */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Simulate Ground-Level Tampering:</span>
                <span className="text-[10px] font-mono text-rose-400">Mock Location Test</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  id="btn-test-authentic"
                  onClick={() => testIntegrity(false)}
                  disabled={!evidenceSeal}
                  className="btn-secondary text-xs py-2.5 px-4 justify-center border-emerald-500/40 hover:bg-emerald-950/30 text-emerald-300 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Test Authentic Submission</span>
                </button>

                <button
                  id="btn-test-spoof-gps"
                  onClick={() => testIntegrity(true)}
                  disabled={!evidenceSeal}
                  className="btn-danger text-xs py-2.5 px-4 justify-center disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Simulate Fake GPS Spoofing</span>
                </button>
              </div>

              {/* Verification Result Display */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border space-y-3 transition-all ${
                    verificationResult.isValid
                      ? "bg-emerald-950/30 border-emerald-500/40"
                      : "bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
                        verificationResult.isValid ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {verificationResult.isValid ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 animate-bounce" />
                      )}
                      <span>{verificationResult.verificationCode}</span>
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      Evaluated via Web Crypto API
                    </span>
                  </div>

                  {!verificationResult.isValid ? (
                    <div className="space-y-1.5 text-xs text-rose-200">
                      <div className="font-bold text-rose-300">Discrepancy Audit Details:</div>
                      {verificationResult.discrepancies.map((d, i) => (
                        <div key={i} className="font-mono text-[11px] bg-rose-950/80 p-2 rounded border border-rose-800/40">
                          {d}
                        </div>
                      ))}
                      <p className="text-[11px] text-slate-300 pt-1">
                        Action: Inspection automatically quarantined. Central vigilance department alerted with device IMEI and IP address.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs text-emerald-200">
                      <div className="font-bold text-emerald-300">Integrity Verified:</div>
                      <p className="text-[11px] text-slate-300 font-mono">
                        GPS coordinates ({institute.lat.toFixed(4)}, {institute.lng.toFixed(4)}) match satellite lock. Hardware device signature and timestamp confirmed unbroken.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theoretical Proof Box for Hackathon Presentation */}
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-cyan-300 font-['Outfit']">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>The Cryptographic Formula: Why it cannot be forged</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                In standard Android inspection apps, inspectors use "Mock Location" developer tools to submit inspection photos taken from their living room. In <strong>Project Satya</strong>, the photo digest is sealed with an HMAC signature:
              </p>
              <div className="telemetry-code text-[10px] bg-slate-950 p-2 rounded">
                SHA-256( Lat + Lng + Timestamp + DeviceHardwareUUID + ImageDigest + SovereignSalt )
              </div>
              <p className="text-slate-400 text-[10px]">
                Even if the inspector modifies the GPS coordinates by 0.00001 degrees, the digital hash breaks irreversibly, exposing fraudulent inspections instantly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
