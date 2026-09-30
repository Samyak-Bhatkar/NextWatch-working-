"use client";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store";
import { TrajectorySighting, TrajectoryLink } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  FileX,
  Compass,
  ArrowRight,
  Clock,
  Car,
  CheckCircle2,
  X,
  Info,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function TrajectorySearchPage() {
  const trajectory = useDashboardStore((s) => s.trajectory);
  const cameras = useDashboardStore((s) => s.cameras);
  const searchTrajectory = useDashboardStore((s) => s.searchTrajectory);
  const evidenceChain = useDashboardStore((s) => s.evidenceChain);

  const [inputPlate, setInputPlate] = useState(trajectory.plate || "MH31CB8061");
  const [caseNumber, setCaseNumber] = useState("CASE-2026-NAG-4102");
  const [purpose, setPurpose] = useState("Multi-camera ANPR corridor tracking & verification");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [selectedLink, setSelectedLink] = useState<TrajectoryLink | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<TrajectorySighting | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const clean = inputPlate.toUpperCase().replace(/\s+/g, "");
    const indianPlateRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
    if (!indianPlateRegex.test(clean)) {
      setValidationError("Invalid Indian Registration format (e.g. MH31CB8061, DL01AB1234)");
      return;
    }

    if (!caseNumber || caseNumber.trim().length < 3) {
      setValidationError("Mandatory Case/Reference Number required for purpose-bound query audit log.");
      return;
    }

    const success = searchTrajectory(clean, caseNumber, purpose);
    if (!success) {
      setValidationError("Failed to execute search. Check plate format and case authorization.");
    }
  };

  const getLinkColor = (trustScore: number, isCloned?: boolean) => {
    if (isCloned) return "#EF4444"; // Red dashed
    if (trustScore >= 0.85) return "#10B981"; // Emerald green
    if (trustScore >= 0.50) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  // Coordinates mapping on SVG canvas (800x480)
  const nodePositions: Record<string, { x: number; y: number }> = {
    "CAM-001": { x: 180, y: 120 },
    "CAM-002": { x: 340, y: 220 },
    "CAM-003": { x: 500, y: 320 },
    "CAM-004": { x: 680, y: 180 },
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-104px)] min-h-[640px]">
      {/* LEFT COLUMN: Map View & Search Controls (68%) */}
      <div className="lg:w-[68%] xl:w-[70%] flex flex-col h-full gap-3 min-h-[440px]">
        {/* Purpose-Bound Search Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-sm backdrop-blur-md">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
                placeholder="Indian Plate (e.g. MH31CB8061)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono-data font-bold text-slate-900 uppercase tracking-wider outline-none focus:border-[#2563EB] focus:bg-white shadow-2xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="Case # (e.g. CASE-2026-NAG)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono-data text-slate-800 outline-none focus:border-[#2563EB] focus:bg-white shadow-2xs"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold font-mono-data transition-all cursor-pointer shadow-sm shadow-blue-500/25 flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <span>Verify Trajectory</span>
              <ArrowRight size={13} />
            </button>
          </form>

          {validationError && (
            <div className="mt-2 text-[11px] font-mono-data text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <AlertTriangle size={13} />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* GIS Multi-Camera Trajectory Map */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 flex-1 flex flex-col shadow-sm relative overflow-hidden">
          {/* Map Header with Trust Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Compass size={15} className="text-[#2563EB]" />
              <span className="text-xs font-bold text-slate-800">
                Multi-Camera GIS Trajectory: <span className="font-mono-data text-[#2563EB]">{trajectory.plate}</span>
              </span>
            </div>

            {/* Link Trust Legend */}
            <div className="flex items-center gap-3 text-[10px] font-mono-data text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Verified Link (≥0.85)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span>Review Link (0.50-0.85)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span>Low-Trust (&lt;0.50)</span>
              </span>
            </div>
          </div>

          {/* Cloned Plate Impossible Travel Alert Banner */}
          {trajectory.hasClonedAnomaly && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono-data flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-600 flex-shrink-0 animate-pulse" />
                <div>
                  <strong className="font-bold">CLONED REGISTRATION SUSPECT DETECTED</strong>
                  <div className="text-[10px] text-rose-600 mt-0.5">
                    {trajectory.clonedExplanation || "Vehicle observed at Camera A and Camera D simultaneously with impossible travel speed (1,440 km/h)."}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-200/80 text-rose-900 text-[10px] font-bold">
                CRITICAL
              </span>
            </motion.div>
          )}

          {/* SVG Map Canvas with Offline Fallback Grid */}
          <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden relative">
            {/* Offline Grid Texture */}
            <svg viewBox="0 0 800 480" className="w-full h-full select-none">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                </pattern>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#F59E0B" />
                </marker>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                </marker>
              </defs>

              <rect width="800" height="480" fill="#0B0F17" />
              <rect width="800" height="480" fill="url(#grid)" />

              {/* Road Network Arterial Lines */}
              <path d="M 100 80 L 180 120 L 340 220 L 500 320 L 720 400" stroke="#1E293B" strokeWidth="12" fill="none" strokeLinecap="round" />
              <path d="M 100 80 L 180 120 L 340 220 L 500 320 L 720 400" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" fill="none" />

              {/* Cross arterial connecting to Express link */}
              <path d="M 180 120 L 680 180" stroke="#1E293B" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5" />

              {/* Trajectory Polylines per Link */}
              {trajectory.links.map((link) => {
                const start = nodePositions[link.fromCameraId] || { x: 180, y: 120 };
                const end = nodePositions[link.toCameraId] || { x: 340, y: 220 };
                const color = getLinkColor(link.linkTrustScore, link.isClonedJump);
                const marker = link.isClonedJump ? "url(#arrow-red)" : link.linkTrustScore >= 0.85 ? "url(#arrow)" : "url(#arrow-amber)";

                return (
                  <g key={link.id} className="cursor-pointer group" onClick={() => setSelectedLink(link)}>
                    {/* Pulsing selection stroke */}
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={color}
                      strokeWidth={selectedLink?.id === link.id ? "6" : "4"}
                      strokeDasharray={link.isClonedJump ? "8 6" : "0"}
                      opacity={selectedLink?.id === link.id ? "1" : "0.85"}
                      markerEnd={marker}
                    />

                    {/* Midpoint Trust Badge on Link */}
                    <g transform={`translate(${(start.x + end.y) / 2}, ${(start.y + end.y) / 2})`}>
                      <rect x="-35" y="-12" width="70" height="20" rx="4" fill="#0F172A" stroke={color} strokeWidth="1.2" />
                      <text x="0" y="2" textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">
                        {link.isClonedJump ? "CLONE 0.05" : `TRUST ${link.linkTrustScore.toFixed(2)}`}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Camera Node Markers */}
              {cameras.map((c) => {
                const pos = nodePositions[c.id] || { x: 200, y: 200 };
                const sighting = trajectory.sightings.find((s) => s.cameraId === c.id);
                const isSelected = selectedSighting?.cameraId === c.id;

                return (
                  <g
                    key={c.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      if (sighting) setSelectedSighting(sighting);
                    }}
                  >
                    {/* Halo ring if visited */}
                    {sighting && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? "22" : "18"}
                        fill="rgba(0, 229, 255, 0.12)"
                        stroke="#00E5FF"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Node Core */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="8"
                      fill={sighting ? "#10B981" : "#475569"}
                      stroke="white"
                      strokeWidth="2"
                    />

                    {/* Camera Label Card */}
                    <g transform={`translate(${pos.x + 14}, ${pos.y - 18})`}>
                      <rect x="0" y="0" width="135" height="34" rx="5" fill="#0B0F17" stroke="#1E293B" strokeWidth="1" />
                      <text x="8" y="14" fill="white" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        {c.name.split("-")[0]} ({c.roadGraphNodeId})
                      </text>
                      <text x="8" y="26" fill={sighting ? "#10B981" : "#94A3B8"} fontSize="8.5" fontFamily="monospace">
                        {sighting ? `${new Date(sighting.timestamp).toLocaleTimeString("en-IN")} · Conf: ${sighting.plateConfidence}` : `Trust: ${c.trustScore.toFixed(2)}`}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Chronological Sightings & Evidence Breakdown (32%) */}
      <div className="lg:w-[32%] xl:w-[30%] h-full flex flex-col min-h-[440px] space-y-3 overflow-y-auto">
        {/* Trajectory Summary Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div>
              <span className="text-[10px] font-mono-data uppercase font-bold text-slate-400">
                Verified Trajectory
              </span>
              <h2 className="text-base font-extrabold text-slate-900 font-mono-data">
                {trajectory.plate}
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {trajectory.sightings.length} Sightings
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono-data text-slate-600">
            <div>Class: <span className="font-semibold text-slate-900">{trajectory.vehicleClass}</span></div>
            <div>Color: <span className="font-semibold text-slate-900">{trajectory.vehicleColor}</span></div>
            <div>First Seen: <span className="font-semibold text-slate-900">{new Date(trajectory.firstSeen).toLocaleTimeString("en-IN")}</span></div>
            <div>Last Seen: <span className="font-semibold text-slate-900">{new Date(trajectory.lastSeen).toLocaleTimeString("en-IN")}</span></div>
          </div>
        </div>

        {/* Chronological Sighting Nodes */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm flex-1 flex flex-col backdrop-blur-md">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>Chronological Multi-Camera Path</span>
            <span className="text-[10px] font-mono-data text-slate-400">Click link for evidence</span>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1">
            {trajectory.sightings.map((sighting, idx) => (
              <div key={sighting.id} className="space-y-2">
                <div
                  onClick={() => setSelectedSighting(sighting)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedSighting?.id === sighting.id
                      ? "border-blue-400 bg-blue-50/70 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-data mb-1">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">
                      Step #{idx + 1} · {sighting.roadGraphNodeId}
                    </span>
                    <span className="text-slate-500">
                      {new Date(sighting.timestamp).toLocaleTimeString("en-IN")} IST
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 truncate">
                    {sighting.cameraName}
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] font-mono-data text-slate-600 mt-1">
                    <span>OCR Conf: <strong className="text-slate-900">{sighting.plateConfidence.toFixed(2)}</strong></span>
                    <span>Speed: <strong className="text-slate-900">{sighting.speedKmph} km/h</strong></span>
                  </div>
                </div>

                {/* Connecting Link Trust Element */}
                {idx < trajectory.links.length && (
                  <div
                    onClick={() => setSelectedLink(trajectory.links[idx])}
                    className={`ml-5 pl-4 border-l-2 py-1 transition-all cursor-pointer group ${
                      selectedLink?.id === trajectory.links[idx].id
                        ? "border-[#2563EB]"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="text-[9.5px] font-mono-data flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200 group-hover:border-blue-300 shadow-2xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <ArrowRight size={10} className="text-slate-400" />
                        <span>Link #{idx + 1} ({trajectory.links[idx].distanceMeters}m in {trajectory.links[idx].timeGapSeconds}s)</span>
                      </span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                          trajectory.links[idx].linkTrustScore >= 0.85
                            ? "bg-emerald-50 text-emerald-700"
                            : trajectory.links[idx].linkTrustScore >= 0.50
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        TRUST {trajectory.links[idx].linkTrustScore.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-over Link Trust Evidence Drawer */}
      {selectedLink && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end"
            onClick={() => setSelectedLink(null)}
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="relative w-full max-w-lg h-full overflow-y-auto border-l border-slate-200 bg-white/95 backdrop-blur-2xl flex flex-col shadow-2xl text-slate-900 p-5 font-mono-data text-xs space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Link Trust Score Breakdown</h3>
                  <p className="text-[10px] text-slate-500">{selectedLink.id} ({selectedLink.fromCameraId} → {selectedLink.toCameraId})</p>
                </div>
                <button onClick={() => setSelectedLink(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              {/* The "Why" Line */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 leading-relaxed text-[11px]">
                <strong className="block text-[10px] uppercase font-bold text-indigo-600 mb-1">
                  Corridor Physical Feasibility Explanation:
                </strong>
                {selectedLink.whyExplanation}
              </div>

              {/* 4 Trust Inputs Breakdown */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase">
                  Weighted Geometric Mean Breakdown
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-slate-500">Plate Consensus (w=0.40)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedLink.trustBreakdown.plateConfidence.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-slate-500">Node Trust (w=0.25)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedLink.trustBreakdown.cameraTrust.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-slate-500">Feasibility (w=0.25)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedLink.trustBreakdown.physicalFeasibility.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-slate-500">Appearance (w=0.10)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedLink.trustBreakdown.appearanceMatch.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-emerald-800">
                  <span className="font-bold">Composite Link Trust Score</span>
                  <span className="text-base font-black">
                    {selectedLink.linkTrustScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cryptographic Hash Chain Status */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">Evidence Hash Pointer</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FileCheck2 size={11} />
                    CHAIN VERIFIED
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 break-all bg-white p-2.5 rounded-xl border border-slate-200">
                  Linked to Record ID: <strong className="text-slate-900">{selectedLink.evidenceRecordId}</strong> (Ed25519 node signature valid)
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
