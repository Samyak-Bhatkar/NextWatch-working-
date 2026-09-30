"use client";

import { useDashboardStore } from "@/lib/store";
import { useState } from "react";
import {
  ShieldAlert,
  Flame,
  RotateCcw,
  Snowflake,
  Repeat,
  Copy,
  FileX2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Tv,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DemoToolsPage() {
  const cameras = useDashboardStore((s) => s.cameras);
  const activeAttacks = useDashboardStore((s) => s.activeAttacks);
  const freezeCamera = useDashboardStore((s) => s.freezeCamera);
  const loopCamera = useDashboardStore((s) => s.loopCamera);
  const injectClonedPlate = useDashboardStore((s) => s.injectClonedPlate);
  const tamperEvidenceRecord = useDashboardStore((s) => s.tamperEvidenceRecord);
  const resetDemo = useDashboardStore((s) => s.resetDemo);
  const presenterMode = useDashboardStore((s) => s.presenterMode);
  const togglePresenterMode = useDashboardStore((s) => s.togglePresenterMode);

  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const handleAction = (name: string, fn: () => void) => {
    fn();
    setLastActionMessage(name);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-104px)] overflow-y-auto pr-1">
      {/* Top Banner: Clearly labelled simulated attack controls */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-amber-950 font-mono-data">
              DEMO CONTROLS: SIMULATED ATTACKS & FAULT INJECTION
            </h2>
            <p className="text-[11px] text-amber-700 font-mono-data mt-0.5">
              Live proof of system resilience: inject real anomalies to demonstrate Link Trust decay, integrity audits, and cloned plate alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => handleAction("All demo states restored to clean baseline", resetDemo)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold font-mono-data transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Interactive Attack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attack 1: Freeze Camera B */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Snowflake size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 font-mono-data">Attack 1: Freeze Camera B (Mid Arterial)</h3>
            </div>
            {activeAttacks.frozenCameraId ? (
              <span className="text-[9px] font-mono-data font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                ACTIVE FAULT
              </span>
            ) : (
              <span className="text-[9px] font-mono-data text-slate-400">IDLE</span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-mono-data">
            Simulates a stalled edge RTSP stream or bad capture card. SSIM rolling perceptual difference drops to zero.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] font-mono-data text-slate-600 space-y-1">
            <div>• Camera B trust chip turns <strong className="text-rose-600">COMPROMISED (0.18)</strong></div>
            <div>• Trajectory link traversing Camera B drops to <strong className="text-amber-600">Amber (0.44)</strong></div>
            <div>• New <strong className="text-slate-900">Feed Integrity</strong> alert queued for human review</div>
          </div>

          <button
            onClick={() => handleAction("Camera B frozen: SSIM dropped to 0, trust reduced to 0.18", () => freezeCamera("CAM-002"))}
            disabled={activeAttacks.frozenCameraId === "CAM-002"}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold font-mono-data transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Freeze Camera B</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Attack 2: Loop Camera C */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Repeat size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 font-mono-data">Attack 2: Loop Camera C (Commercial Ring)</h3>
            </div>
            {activeAttacks.loopedCameraId ? (
              <span className="text-[9px] font-mono-data font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                ACTIVE SPOOF
              </span>
            ) : (
              <span className="text-[9px] font-mono-data text-slate-400">IDLE</span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-mono-data">
            Simulates a replay attack where attacker loops prior benign CCTV video. Repeating perceptual-hash pattern detected.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] font-mono-data text-slate-600 space-y-1">
            <div>• Camera C trust drops to <strong className="text-amber-600">DEGRADED (0.42)</strong></div>
            <div>• Edge integrity check flags <strong className="text-amber-700">Repeating Sequence</strong></div>
            <div>• Warning displayed on Integrity & Evidence audit view</div>
          </div>

          <button
            onClick={() => handleAction("Camera C looped: repeating perceptual hash detected, trust reduced to 0.42", () => loopCamera("CAM-003"))}
            disabled={activeAttacks.loopedCameraId === "CAM-003"}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold font-mono-data transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Loop Camera C</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Attack 3: Inject Cloned Plate */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Copy size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 font-mono-data">Attack 3: Inject Cloned Plate Anomaly</h3>
            </div>
            {activeAttacks.injectedClone ? (
              <span className="text-[9px] font-mono-data font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                CLONE INJECTED
              </span>
            ) : (
              <span className="text-[9px] font-mono-data text-slate-400">IDLE</span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-mono-data">
            Injects simultaneous duplicate sighting of hero plate MH31CB8061 at distant Camera D within 35 seconds (14 km separation).
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] font-mono-data text-slate-600 space-y-1">
            <div>• Calculates impossible travel speed: <strong className="text-rose-600">1,440 km/h</strong></div>
            <div>• Triggers <strong className="text-purple-700">CLONED_PLATE_SUSPECT</strong> critical alert</div>
            <div>• Displays dashed red impossible jump line on Trajectory Map</div>
          </div>

          <button
            onClick={() => handleAction("Cloned plate anomaly injected: impossible 1,440 km/h travel speed detected", injectClonedPlate)}
            disabled={activeAttacks.injectedClone}
            className="w-full py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-xs font-bold font-mono-data transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Inject Cloned Plate (MH31CB8061)</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Attack 4: Tamper Evidence Record */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <FileX2 size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 font-mono-data">Attack 4: Tamper Evidence Record</h3>
            </div>
            {activeAttacks.tamperedRecordId ? (
              <span className="text-[9px] font-mono-data font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                HASH CORRUPTED
              </span>
            ) : (
              <span className="text-[9px] font-mono-data text-slate-400">IDLE</span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-mono-data">
            Alters frame hash of Block #003 in evidence storage. Proves tamper-evident hash pointer verification detects exact forged record.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] font-mono-data text-slate-600 space-y-1">
            <div>• Modifies SHA-256 frame hash in Block <strong className="text-slate-900">EVD-REC-003</strong></div>
            <div>• Next "Verify Evidence Chain" run immediately flags corruption</div>
            <div>• Pinpoints exact broken record and breaks proof-of-custody</div>
          </div>

          <button
            onClick={() => handleAction("Record EVD-REC-003 tampered: hash corrupted, chain verification will fail", () => tamperEvidenceRecord("EVD-REC-003"))}
            disabled={Boolean(activeAttacks.tamperedRecordId)}
            className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold font-mono-data transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Tamper Record EVD-REC-003</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Live System Reaction Status */}
      {lastActionMessage && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-900 text-xs font-mono-data flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Info size={15} className="text-[#2563EB]" />
            <span><strong>Reaction Log:</strong> {lastActionMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="underline hover:text-blue-700 font-semibold">
              View in Live Network →
            </Link>
            <Link href="/dashboard/trajectory" className="underline hover:text-blue-700 font-semibold ml-2">
              View on Map →
            </Link>
          </div>
        </motion.div>
      )}

      {/* Presenter Mode Guide for Evaluation Pitch */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3 font-mono-data text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Tv size={15} className="text-slate-700" />
            <h3 className="font-bold text-slate-900">Evaluation Flow (90-Second Demo Script)</h3>
          </div>
          <button
            onClick={togglePresenterMode}
            className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              presenterMode ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            {presenterMode ? "Presenter Mode: ON" : "Turn Presenter Mode ON"}
          </button>
        </div>

        <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed text-[11px]">
          <li><strong>Step 1 (Trajectory Search):</strong> Query hero plate <span className="text-[#2563EB] font-bold">MH31CB8061</span> with Case # <span className="text-slate-900 font-bold">CASE-2026-NAG-4102</span>. Show 3-camera green verified path (Link Trust &gt; 0.89).</li>
          <li><strong>Step 2 (Simulated Freeze):</strong> Click "Freeze Camera B". Show Camera B turn <span className="text-rose-600 font-bold">COMPROMISED (0.18)</span> on Live Network and Link turn <span className="text-amber-600 font-bold">Amber (0.44)</span>.</li>
          <li><strong>Step 3 (Cloned Plate):</strong> Click "Inject Cloned Plate". Show dashed red impossible jump and <span className="text-purple-600 font-bold">CLONED_PLATE_SUSPECT</span> alert.</li>
          <li><strong>Step 4 (Tamper Evidence):</strong> Click "Tamper Record EVD-REC-003", go to <Link href="/dashboard/integrity" className="underline text-blue-600">Integrity & Evidence</Link>, click "Verify Evidence Chain" — fails exactly at Block #003.</li>
          <li><strong>Step 5 (Reset):</strong> Click "Reset Demo Baseline" to restore 100% green verified state.</li>
        </ol>
      </div>
    </div>
  );
}
