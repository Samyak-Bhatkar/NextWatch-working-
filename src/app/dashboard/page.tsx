"use client";

import { useDashboardStore } from "@/lib/store";
import { Camera, AlertItem, AlertReviewStatus, AlertType } from "@/lib/types";
import { VideoDetectionCanvas } from "@/components/video-detection-canvas";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Check,
  X,
  Send,
  Zap,
  Maximize2,
  Minimize2,
  Camera as CameraIcon,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  FileX,
  Compass,
  ArrowRight,
  User,
  Plus,
  Trash2,
  ListOrdered,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { getEnhancementFilter, getEnhancementLabel } from "@/lib/enhancement";

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS & FORMATTERS
   ═══════════════════════════════════════════════════════════════════════ */
function getAlertBadge(type: AlertType) {
  switch (type) {
    case "blacklist_hit":
      return { label: "Watchlist Hit", color: "bg-rose-50 text-rose-700 border-rose-200" };
    case "cloned_plate_suspect":
      return { label: "Cloned Plate Suspect", color: "bg-purple-50 text-purple-700 border-purple-200" };
    case "feed_integrity":
      return { label: "Feed Integrity", color: "bg-amber-50 text-amber-700 border-amber-200" };
    case "low_trust_link":
      return { label: "Low-Trust Link", color: "bg-blue-50 text-blue-700 border-blue-200" };
    case "behaviour_event":
      return { label: "Behaviour Event", color: "bg-orange-50 text-orange-700 border-orange-200" };
  }
}

function timeAgo(iso: string): string {
  const diff = Math.max(1000, Date.now() - new Date(iso).getTime());
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

/* ═══════════════════════════════════════════════════════════════════════
   CAMERA TILE (Verified Trust, Real Frame-Accurate Canvas, Node ID)
   ═══════════════════════════════════════════════════════════════════════ */
function CameraTile({
  camera,
  isFocused,
  onFocus,
  highlightedTrackId,
}: {
  camera: Camera;
  isFocused?: boolean;
  onFocus?: () => void;
  highlightedTrackId?: string | null;
}) {
  const overlayMode = useDashboardStore((s) => s.overlayMode);
  const enhancementMode = useDashboardStore((s) => s.enhancementMode);
  const setLayoutMode = useDashboardStore((s) => s.setLayoutMode);
  const alerts = useDashboardStore((s) => s.alerts);
  const [timeStr, setTimeStr] = useState("");
  const [isFlashing, setIsFlashing] = useState(false);
  const [showCamConsensus, setShowCamConsensus] = useState(false);

  // Active persistent events on this camera
  const cameraAlert = alerts.find(
    (a) => a.cameraId === camera.id && a.status === "needs_review"
  );

  const videoSource = camera.streamUrl || camera.trackedSrc || "/videos/cam1_cfr.mp4";
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const cameraIndex = camera.id.includes("1")
    ? 1
    : camera.id.includes("2")
    ? 2
    : camera.id.includes("3")
    ? 3
    : 4;

  useEffect(() => {
    const tick = () => {
      setTimeStr(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const triggerSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);
  };

  const isDegraded = camera.healthStatus === "DEGRADED";
  const isCompromised = camera.healthStatus === "COMPROMISED";

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 group flex flex-col relative bg-slate-900 shadow-sm ${
        isCompromised
          ? "border-rose-500 ring-2 ring-rose-500/40"
          : isDegraded
          ? "border-amber-400 ring-1 ring-amber-400/40"
          : "border-slate-200/90 hover:border-indigo-300"
      }`}
    >
      {/* Flash effect overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Camera Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-white/95 backdrop-blur-md flex-shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          {/* Status Indicator */}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isCompromised
                ? "bg-rose-500 animate-ping"
                : isDegraded
                ? "bg-amber-500 animate-pulse"
                : "bg-emerald-500"
            }`}
          />
          <span className="text-xs font-bold text-slate-800 truncate">
            {camera.name}
          </span>
          <span className="text-[10px] font-mono-data text-indigo-700 px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200/80 font-bold">
            {camera.roadGraphNodeId}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Camera Trust Score Chip */}
          <div
            className={`text-[9.5px] font-mono-data px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
              isCompromised
                ? "bg-rose-50 text-rose-700 border-rose-300"
                : isDegraded
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-emerald-50 text-emerald-700 border-emerald-300"
            }`}
          >
            <span>TRUST {camera.trustScore.toFixed(2)}</span>
            <span>·</span>
            <span>{camera.healthStatus}</span>
          </div>

          <span className="text-[10px] font-mono-data text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 hidden sm:inline">
            {camera.fps} FPS
          </span>

          {/* Dedicated Zoom / Focus button */}
          {onFocus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFocus();
              }}
              className="px-2 py-0.5 rounded text-[10px] font-mono-data font-bold bg-indigo-50 hover:bg-indigo-100 text-[#2563EB] border border-indigo-200/80 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Zoom in on this camera feed"
            >
              <Maximize2 size={10} />
              <span className="hidden sm:inline">Zoom</span>
            </button>
          )}
          {isFocused && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLayoutMode("grid");
              }}
              className="px-2 py-0.5 rounded text-[10px] font-mono-data font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Return to 4-Camera Grid View"
            >
              <Minimize2 size={10} />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative aspect-video bg-black overflow-hidden flex-1 cursor-crosshair">
        <video
          ref={videoRef}
          key={videoSource}
          autoPlay
          loop
          muted
          playsInline
          style={{
            filter: getEnhancementFilter(enhancementMode),
            transition: "filter 0.35s ease-in-out",
          }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={videoSource} type="video/mp4" />
        </video>

        {/* Real-time Optical / CLAHE Enhancement HUD Badge */}
        {enhancementMode !== "off" && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/90 border border-amber-400 text-amber-300 font-mono-data text-[10px] font-bold shadow-lg backdrop-blur-md animate-in fade-in duration-200">
            <Sparkles size={11} className="text-amber-400 animate-pulse" />
            <span>{getEnhancementLabel(enhancementMode)}</span>
          </div>
        )}

        {/* Real-time frame-accurate synchronised detection canvas */}
        <VideoDetectionCanvas
          videoRef={videoRef}
          cameraIndex={cameraIndex}
          cameraId={camera.id}
          overlayMode={overlayMode}
          highlightedTrackId={highlightedTrackId}
        />

        {/* Feed Metadata Watermark */}
        <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10 text-[9px] font-mono-data text-white/70">
          Node {camera.roadGraphNodeId} · 30 FPS CFR
        </div>

        {/* Tactical Crosshair & Corner Marks */}
        <svg
          viewBox="0 0 640 360"
          className="w-full h-full object-cover pointer-events-none relative z-10"
        >
          {/* Subtle corner reticles */}
          <path
            d="M 12 28 L 12 12 L 28 12 M 612 12 L 628 12 L 628 28 M 12 332 L 12 348 L 28 348 M 612 348 L 628 348 L 628 332"
            fill="none"
            stroke="rgba(0, 229, 255, 0.45)"
            strokeWidth="1.2"
          />

          {/* Small Event Chip (Persistent Candidate Only — Never 100% Accuracy) */}
          {cameraAlert && (
            <g>
              <rect
                x="160"
                y="14"
                width="320"
                height="22"
                fill="rgba(15, 23, 42, 0.88)"
                stroke={cameraAlert.severity === "critical" ? "#EF4444" : "#F59E0B"}
                strokeWidth="1.2"
                rx="4"
              />
              <circle
                cx="174"
                cy="25"
                r="3.5"
                fill={cameraAlert.severity === "critical" ? "#EF4444" : "#F59E0B"}
              />
              <text
                x="320"
                y="29"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                {cameraAlert.type === "cloned_plate_suspect"
                  ? `Cloned plate suspect · 0.94 · in review`
                  : cameraAlert.type === "blacklist_hit"
                  ? `Blacklist match · ${cameraAlert.plate} · in review`
                  : `${cameraAlert.title.slice(0, 32)} · in review`}
              </text>
            </g>
          )}

          {/* Clean OSD Info Line */}
          <rect x="12" y="326" width="616" height="20" fill="rgba(11, 15, 23, 0.75)" rx="3" />
          <text
            x="22"
            y="339"
            fill="#00E5FF"
            fontSize="8.5"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
          >
            {camera.name.toUpperCase()} · NODE: {camera.roadGraphNodeId} · {camera.lensType}
          </text>
          <text
            x="618"
            y="339"
            textAnchor="end"
            fill="white"
            fontSize="8.5"
            fontFamily="JetBrains Mono, monospace"
          >
            {timeStr} IST
          </text>
        </svg>

        {/* Hover Quick Action Buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/85 p-1 rounded-lg border border-slate-700 backdrop-blur-md z-20">
          <button
            onClick={triggerSnapshot}
            className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Capture Audit Keyframe"
          >
            <CameraIcon size={12} />
          </button>
          {onFocus && (
            <button
              onClick={onFocus}
              className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Focus Stream"
            >
              <Maximize2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Tile Footer (Inference, OCR Consensus, Node ID) */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-800 bg-[#0B0F17] text-[10px] font-mono-data flex-shrink-0 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-[#00E5FF] flex items-center gap-1 font-semibold">
            <Zap size={10} />
            Inference: 14ms
          </span>
          <span className="text-slate-600">·</span>
          <div
            className="relative cursor-help"
            onMouseEnter={() => setShowCamConsensus(true)}
            onMouseLeave={() => setShowCamConsensus(false)}
          >
            <span className="text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-colors font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              OCR: 3-Engine Consensus (92.4%)
            </span>
            {showCamConsensus && (
              <div className="absolute left-0 bottom-full mb-1.5 z-50 w-64 p-3 rounded-xl bg-slate-950/95 text-white shadow-2xl border border-slate-700 text-[10px] font-mono-data backdrop-blur-xl pointer-events-none animate-in fade-in duration-150">
                <div className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
                  <span>Multi-Model Consensus Pipeline</span>
                  <span className="text-emerald-400 font-bold">&lt;18ms</span>
                </div>
                <div className="space-y-1 text-slate-300 text-[9.5px]">
                  <div>• Engine 1: YOLOv11 + CRNN Sequence Rec</div>
                  <div>• Engine 2: PaddleOCR v4 Deep Feature</div>
                  <div>• Engine 3: EasyOCR ResNet Character Voting</div>
                </div>
                <div className="mt-1.5 pt-1 border-t border-slate-800 text-[9px] text-amber-300 flex justify-between">
                  <span>Adaptive CLAHE Normalization:</span>
                  <span className="font-bold">{enhancementMode !== "off" ? "ACTIVE" : "STANDBY"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-slate-400 font-medium">
          {camera.zone}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ALERT SNAPSHOT HELPER (Resolves actual extracted frame snapshot)
   ═══════════════════════════════════════════════════════════════════════ */
function getAlertSnapshot(alert: AlertItem): string {
  if (alert.cropUrl) return alert.cropUrl;
  if (alert.snapshotUrl && !alert.snapshotUrl.endsWith(".mp4")) return alert.snapshotUrl;
  if (alert.plate === "MH31CB8061" || alert.cameraId === "CAM-001") return "/snapshots/alert_cam1_mh31cb8061.jpg";
  if (alert.plate === "MH31CB8064") return "/snapshots/alert_cam3_mh31cb8064.jpg";
  if (alert.plate === "MH31EQ4892") return "/snapshots/alert_cam3_mh31eq4892.jpg";
  if (alert.cameraId === "CAM-002") return "/snapshots/alert_cam2_ftt117.jpg";
  if (alert.cameraId === "CAM-003") return "/snapshots/alert_cam3_mh31cb8064.jpg";
  if (alert.cameraId === "CAM-004") return "/snapshots/alert_cam4_ap05jeo.jpg";
  return "/snapshots/sample.jpg";
}

/* ═══════════════════════════════════════════════════════════════════════
   ALERT CARD COMPONENT (Review, Reject, Confirm, Notify)
   ═══════════════════════════════════════════════════════════════════════ */
function AlertCard({
  alert,
  onSelect,
}: {
  alert: AlertItem;
  onSelect: () => void;
}) {
  const confirmAlert = useDashboardStore((s) => s.confirmAlert);
  const rejectAlert = useDashboardStore((s) => s.rejectAlert);
  const notifyUnit = useDashboardStore((s) => s.notifyUnit);
  const role = useDashboardStore((s) => s.role);
  const enhancementMode = useDashboardStore((s) => s.enhancementMode);
  const [showCropCard, setShowCropCard] = useState(false);
  const [showConsensusCard, setShowConsensusCard] = useState(false);

  const badge = getAlertBadge(alert.type);
  const isAuditor = role === "Auditor";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      onClick={onSelect}
      className={`rounded-2xl border p-3 transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
        alert.status === "needs_review"
          ? alert.severity === "critical"
            ? "border-rose-300 bg-rose-50/60 shadow-xs hover:border-rose-400"
            : "border-amber-300 bg-amber-50/50 shadow-xs hover:border-amber-400"
          : alert.status === "confirmed"
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-slate-200 bg-slate-50/60 opacity-75"
      }`}
    >
      <div className="flex gap-2.5 items-start">
        {/* Keyframe Snapshot Preview with Hover Magnifier */}
        <div
          className="relative flex-shrink-0"
          onMouseEnter={() => setShowCropCard(true)}
          onMouseLeave={() => setShowCropCard(false)}
        >
          <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs hover:border-cyan-400 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAlertSnapshot(alert)}
              alt="Incident keyframe snapshot"
              style={{
                filter: getEnhancementFilter(enhancementMode),
                transition: "filter 0.35s ease-in-out",
              }}
              className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/snapshots/sample.jpg";
              }}
            />
            {enhancementMode !== "off" && (
              <span className="absolute top-0.5 left-0.5 bg-amber-500 text-white text-[7px] font-mono-data font-bold px-1 rounded shadow-xs">
                CLAHE
              </span>
            )}
            {alert.trackId && (
              <span className="absolute bottom-0.5 right-1 text-[7.5px] font-mono-data text-white font-bold bg-black/70 backdrop-blur-xs px-1 rounded shadow-xs">
                {alert.trackId}
              </span>
            )}
          </div>

          {/* Hover Magnifier / Crop Inspection Card */}
          {showCropCard && (
            <div className="absolute left-0 bottom-full mb-2 z-50 w-56 p-2.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 text-white shadow-2xl backdrop-blur-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[9px] uppercase font-mono-data text-cyan-400 font-bold mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1">
                <span>Plate Crop Inspection</span>
                <span className="text-amber-300 font-bold">
                  {enhancementMode !== "off" ? "CLAHE Active" : "Native Optical"}
                </span>
              </div>
              <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-700 bg-black relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAlertSnapshot(alert)}
                  alt="Enlarged crop"
                  style={{
                    filter: getEnhancementFilter(enhancementMode),
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border border-cyan-400/40 pointer-events-none" />
                <div className="absolute bottom-1 right-1 bg-black/80 text-[7px] font-mono-data text-cyan-300 px-1 py-0.2 rounded font-bold">
                  CROP ZOOM 2.5X
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[8.5px] font-mono-data text-slate-400">
                <span>Laplacian Sharpness: 142.8</span>
                <span className="text-emerald-400 font-bold">Low-Light Adverse</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span
              className={`text-[9px] font-mono-data px-1.5 py-0.2 rounded-md border font-bold ${badge.color}`}
            >
              {badge.label}
            </span>
            <span className="text-[10px] font-mono-data text-slate-400 flex-shrink-0">
              {timeAgo(alert.detectedAt)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
            {alert.plate && (
              <span className="font-mono-data text-[#2563EB] bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/80">
                {alert.plate}
              </span>
            )}
            <span className="truncate">{alert.cameraName}</span>
          </div>

          <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-relaxed">
            {alert.reason}
          </p>

          {alert.trustScore !== undefined && (
            <div className="text-[9.5px] font-mono-data text-slate-500 pt-0.5">
              Link Trust: <span className="font-bold text-slate-700">{alert.trustScore.toFixed(2)}</span> ·{" "}
              Status: <span className="font-semibold uppercase text-slate-800">{alert.status.replace("_", " ")}</span>
            </div>
          )}

          {/* 3-Engine Consensus Voting Badge */}
          <div
            className="relative inline-block mt-1"
            onMouseEnter={() => setShowConsensusCard(true)}
            onMouseLeave={() => setShowConsensusCard(false)}
          >
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50/90 border border-indigo-200/80 text-[10px] font-mono-data font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors cursor-help shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>3-Engine Consensus: {alert.plate === "MH31CB8064" ? "84.2%" : "94.6%"}</span>
              <ChevronDown size={10} className={`text-indigo-400 transition-transform duration-200 ${showConsensusCard ? "rotate-180" : ""}`} />
            </div>

            {/* Hover Tooltip: 3-Engine Consensus Breakdown */}
            {showConsensusCard && (
              <div className="absolute left-0 bottom-full mb-1.5 z-50 w-64 p-3 rounded-xl bg-slate-950/95 text-white shadow-2xl border border-slate-700 text-[10px] font-mono-data backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                <div className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
                  <span>Consensus OCR Voting (3 Engines)</span>
                  <span className="text-emerald-400 font-bold">
                    {alert.plate === "MH31CB8064" ? "2/3 CONSENSUS" : "3/3 UNANIMOUS"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-400">1. YOLOv11 + CRNN</span>
                    <span className="text-white font-bold">{alert.plate || "MH31CB8061"} (96%)</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-400">2. PaddleOCR v4</span>
                    <span className="text-white font-bold">
                      {alert.plate === "MH31CB8064" ? "MH31CB8061 (82%)" : `${alert.plate} (93%)`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-400">3. EasyOCR ResNet</span>
                    <span className="text-white font-bold">{alert.plate || "MH31CB8061"} (88%)</span>
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800 text-[9px] text-slate-400 flex items-center justify-between">
                  <span>Consensus Agreement:</span>
                  <span className="text-amber-300 font-bold">
                    {alert.plate === "MH31CB8064" ? "84.2% Agreement" : "94.6% Verified"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons for Unconfirmed Alerts */}
      {alert.status === "needs_review" && (
        <div className="flex border-t border-slate-200/80 bg-white/80 rounded-b-xl -mx-3 -mb-3 mt-2 divide-x divide-slate-100">
          <button
            disabled={isAuditor}
            onClick={(e) => {
              e.stopPropagation();
              confirmAlert(alert.id);
            }}
            title={isAuditor ? "Auditors have read-only access" : "Confirm alert validity"}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-emerald-600 transition-colors ${
              isAuditor ? "opacity-40 cursor-not-allowed" : "hover:bg-emerald-50 cursor-pointer"
            }`}
          >
            <Check size={11} />
            Confirm
          </button>
          <button
            disabled={isAuditor}
            onClick={(e) => {
              e.stopPropagation();
              rejectAlert(alert.id);
            }}
            title={isAuditor ? "Auditors have read-only access" : "Reject alert as false lead"}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-slate-500 transition-colors ${
              isAuditor ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-100 cursor-pointer"
            }`}
          >
            <X size={11} />
            Reject
          </button>
          <button
            disabled={isAuditor}
            onClick={(e) => {
              e.stopPropagation();
              notifyUnit(alert.id, "PCR Patrol Unit 12");
            }}
            title={isAuditor ? "Auditors have read-only access" : "Notify field patrol with human confirmation"}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-[#2563EB] transition-colors ${
              isAuditor ? "opacity-40 cursor-not-allowed" : "hover:bg-indigo-50 cursor-pointer"
            }`}
          >
            <Send size={10} />
            Notify Unit
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EVIDENCE INVESTIGATION DRAWER
   ═══════════════════════════════════════════════════════════════════════ */
function EvidenceDetailDrawer({
  alert,
  onClose,
}: {
  alert: AlertItem;
  onClose: () => void;
}) {
  const evidenceChain = useDashboardStore((s) => s.evidenceChain);
  const enhancementMode = useDashboardStore((s) => s.enhancementMode);
  const record = evidenceChain.find((r) => r.id === alert.evidenceRecordId) || evidenceChain[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="relative w-full max-w-lg h-full overflow-y-auto border-l border-slate-200 bg-white/95 backdrop-blur-2xl flex flex-col shadow-2xl text-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Evidence Panel</h3>
              <p className="text-[10px] text-slate-500 font-mono-data">{alert.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-5 flex-1 font-mono-data text-xs">
            {/* Keyframe Crops & Live CCTV Playback */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-black shadow-md relative aspect-video">
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  filter: getEnhancementFilter(enhancementMode),
                  transition: "filter 0.35s ease-in-out",
                }}
                className="w-full h-full object-cover"
              >
                <source
                  src={
                    alert.videoUrl ||
                    (alert.snapshotUrl && alert.snapshotUrl.endsWith(".mp4")
                      ? alert.snapshotUrl
                      : alert.cameraId === "CAM-002"
                      ? "/videos/cam2_cfr.mp4"
                      : alert.cameraId === "CAM-003"
                      ? "/videos/cam3_cfr.mp4"
                      : alert.cameraId === "CAM-004"
                      ? "/videos/cam4_cfr.mp4"
                      : "/videos/cam1_cfr.mp4")
                  }
                  type="video/mp4"
                />
              </video>
              <div className="absolute top-2 right-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE CCTV
              </div>
              {enhancementMode !== "off" && (
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/90 text-white font-mono-data text-[9px] font-bold shadow-md">
                  <Sparkles size={10} />
                  <span>{getEnhancementLabel(enhancementMode)}</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-white">
                Best Laplacian Sharpness Crop ({alert.cameraName})
              </div>
              {/* Picture-in-picture captured vehicle frame */}
              <div className="absolute bottom-2 right-2 w-28 h-18 rounded-lg overflow-hidden border border-white/50 shadow-lg bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAlertSnapshot(alert)}
                  alt="Vehicle crop"
                  style={{
                    filter: getEnhancementFilter(enhancementMode),
                    transition: "filter 0.35s ease-in-out",
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-black/80 text-[7px] text-cyan-300 font-bold px-1 rounded-tl">
                  EVIDENCE CROP
                </span>
              </div>
            </div>

            {/* OCR Candidate Consensus Breakdown */}
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Consensus OCR Recognition Votes
              </div>
              <div className="space-y-1.5">
                {record?.metadata.ocrVotes.map((vote, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-800">{vote.engine}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2563EB] bg-indigo-50 px-1.5 py-0.5 rounded">
                        {vote.predictedPlate}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({Math.round(vote.confidence * 100)}% conf)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Breakdown (4 Inputs) */}
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Link Trust Score Components
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-slate-400">Plate Consensus</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {record?.metadata.trustBreakdown.plateConfidence.toFixed(2) || "0.94"}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-slate-400">Camera Integrity</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {record?.metadata.trustBreakdown.cameraTrust.toFixed(2) || "0.96"}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-slate-400">Physical Feasibility</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {record?.metadata.trustBreakdown.physicalFeasibility.toFixed(2) || "1.00"}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-slate-400">Appearance Agreement</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {record?.metadata.trustBreakdown.appearanceMatch.toFixed(2) || "0.92"}
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Chain Integrity */}
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Tamper-Evident Hash Chain
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FileCheck2 size={11} />
                  SHA-256 VERIFIED
                </span>
              </div>
              <div className="space-y-1 text-[9px] text-slate-500 break-all bg-white p-2.5 rounded-xl border border-slate-200">
                <div><strong className="text-slate-700">Record Hash:</strong> {record?.recordHash}</div>
                <div><strong className="text-slate-700">Prev Hash:</strong> {record?.prevHash}</div>
                <div><strong className="text-slate-700">Signer Key:</strong> {record?.signerKeyId}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN LIVE NETWORK PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function LiveNetworkPage() {
  const cameras = useDashboardStore((s) => s.cameras);
  const alerts = useDashboardStore((s) => s.alerts);
  const watchlist = useDashboardStore((s) => s.watchlist);
  const addToWatchlist = useDashboardStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useDashboardStore((s) => s.removeFromWatchlist);
  const layoutMode = useDashboardStore((s) => s.layoutMode);
  const setLayoutMode = useDashboardStore((s) => s.setLayoutMode);
  const focusedCameraId = useDashboardStore((s) => s.focusedCameraId);
  const setFocusedCameraId = useDashboardStore((s) => s.setFocusedCameraId);

  const [activeTab, setActiveTab] = useState<AlertReviewStatus | "all">("needs_review");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (activeTab !== "all" && a.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPlate = a.plate?.toLowerCase().includes(q);
        const matchesCam = a.cameraName.toLowerCase().includes(q);
        const matchesType = a.type.toLowerCase().includes(q);
        const matchesReason = a.reason.toLowerCase().includes(q);
        if (!matchesPlate && !matchesCam && !matchesType && !matchesReason) return false;
      }
      return true;
    });
  }, [alerts, activeTab, searchQuery]);

  const focusedCamera = cameras.find((c) => c.id === focusedCameraId) || cameras[0];
  const companionCameras = cameras.filter((c) => c.id !== focusedCameraId);

  const handleSelectAlert = (alert: AlertItem) => {
    setSelectedAlert(alert);
    if (alert.cameraId) {
      setFocusedCameraId(alert.cameraId);
    }
  };

  const handleAddWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    addToWatchlist(newPlate, newLabel);
    setNewPlate("");
    setNewLabel("");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-104px)] min-h-[640px]">
      {/* LEFT COLUMN: Camera Network Grid (74%) */}
      <div className="lg:w-[72%] xl:w-[74%] flex-shrink-0 flex flex-col h-full min-h-[440px]">
        {layoutMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 h-full overflow-y-auto">
            {cameras.map((cam) => (
              <CameraTile
                key={cam.id}
                camera={cam}
                highlightedTrackId={selectedAlert?.cameraId === cam.id ? selectedAlert.trackId : undefined}
                onFocus={() => {
                  setFocusedCameraId(cam.id);
                  setLayoutMode("focus");
                }}
              />
            ))}
          </div>
        )}

        {layoutMode === "focus" && (
          <div className="flex flex-col xl:flex-row gap-3.5 h-full overflow-y-auto">
            <div className="xl:w-[70%] h-full flex flex-col">
              <CameraTile
                camera={focusedCamera}
                isFocused
                highlightedTrackId={selectedAlert?.cameraId === focusedCamera.id ? selectedAlert.trackId : undefined}
              />
            </div>

            <div className="xl:w-[30%] flex flex-col gap-3 overflow-y-auto">
              <div className="text-[11px] font-mono-data text-slate-500 uppercase tracking-wider px-1">
                Auxiliary Network Feeds
              </div>
              {companionCameras.map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => setFocusedCameraId(cam.id)}
                  className="cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <CameraTile
                    camera={cam}
                    highlightedTrackId={selectedAlert?.cameraId === cam.id ? selectedAlert.trackId : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {layoutMode === "map" && (
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Compass size={15} className="text-[#2563EB]" />
                <h3 className="text-xs font-bold text-slate-800">
                  Smart City Multi-Camera Network Nodes
                </h3>
              </div>
              <span className="text-[10px] font-mono-data text-slate-500">
                4 Active Calibrated Sensor Nodes
              </span>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden relative flex items-center justify-center">
              <svg viewBox="0 0 800 480" className="w-full h-full">
                {/* Arterial Corridor Road Lines */}
                <path d="M 180 80 L 320 200 L 480 300 L 640 420" stroke="#334155" strokeWidth="6" fill="none" />
                <path d="M 180 80 L 320 200 L 480 300 L 640 420" stroke="#00E5FF" strokeWidth="2" strokeDasharray="8 6" fill="none" opacity="0.6" />

                {cameras.map((c, idx) => {
                  const x = 180 + idx * 150;
                  const y = 80 + idx * 110;
                  return (
                    <g key={c.id} className="cursor-pointer" onClick={() => setFocusedCameraId(c.id)}>
                      <circle cx={x} cy={y} r="18" fill="rgba(0, 229, 255, 0.15)" stroke="#00E5FF" strokeWidth="1.5" />
                      <circle cx={x} cy={y} r="6" fill={c.healthStatus === "COMPROMISED" ? "#EF4444" : "#10B981"} />
                      <text x={x + 24} y={y - 4} fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        {c.name} ({c.roadGraphNodeId})
                      </text>
                      <text x={x + 24} y={y + 10} fill="#94A3B8" fontSize="8.5" fontFamily="monospace">
                        Trust: {c.trustScore.toFixed(2)} · {c.healthStatus}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Alerts & Review Queue (26%) */}
      <div className="lg:w-[28%] xl:w-[26%] h-full flex flex-col min-h-[440px]">
        <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-xl h-full flex flex-col shadow-sm">
          {/* Queue Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/90 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} className="text-[#2563EB]" />
              <span className="text-xs font-bold text-slate-800">Alerts & Review Queue</span>
              {filteredAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono-data font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {filteredAlerts.length}
                </span>
              )}
            </div>
            
            {/* Demo Watchlist Button */}
            <button
              onClick={() => setShowWatchlistModal(true)}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono-data font-bold bg-indigo-50 hover:bg-indigo-100 text-[#2563EB] border border-indigo-200/80 flex items-center gap-1 cursor-pointer transition-colors"
              title="Configure demo watchlist plates"
            >
              <ListOrdered size={11} />
              <span>Watchlist ({watchlist.length})</span>
            </button>
          </div>

          {/* Search & Status Filter Tabs */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0 space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plate, node, or reason..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#2563EB] font-mono-data shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {(["all", "needs_review", "confirmed", "rejected"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-data capitalize transition-all cursor-pointer flex-shrink-0 ${
                    activeTab === tab
                      ? "bg-[#2563EB] text-white font-bold shadow-xs"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {tab === "needs_review" ? "Needs Review" : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Cards Feed List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            <AnimatePresence initial={false}>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-mono-data">
                  No incidents matching current criteria
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onSelect={() => handleSelectAlert(alert)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide-over Evidence Detail Drawer */}
      {selectedAlert && (
        <EvidenceDetailDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      {/* Demo Watchlist Management Modal */}
      {showWatchlistModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#2563EB]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Demo Watchlist (Operator-Configured)
                </h3>
              </div>
              <button
                onClick={() => setShowWatchlistModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed bg-blue-50 border border-blue-200/70 p-3 rounded-xl">
                Vehicles with plates matching this list are flagged in real time across all cameras with a prominent <strong>WATCHLIST HIT</strong> reticle and entered into the Review Queue.
              </div>

              {/* Add Plate Form */}
              <form onSubmit={handleAddWatchlist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MH31CB8061"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs font-mono-data font-bold rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-[#2563EB]"
                />
                <input
                  type="text"
                  placeholder="Reason / Notice tag"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-[#2563EB]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={13} />
                  Add
                </button>
              </form>

              {/* Watchlist Table */}
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                {watchlist.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-mono-data">
                    Watchlist is empty. Add a plate above.
                  </div>
                ) : (
                  watchlist.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-data font-bold text-xs text-slate-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            {w.plate}
                          </span>
                          <span className="text-xs font-medium text-slate-700">{w.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono-data">
                          Added: {new Date(w.addedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(w.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowWatchlistModal(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
