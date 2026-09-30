"use client";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store";
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  FileX,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Hash,
  Activity,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntegrityAndEvidencePage() {
  const cameras = useDashboardStore((s) => s.cameras);
  const evidenceChain = useDashboardStore((s) => s.evidenceChain);
  const auditLogs = useDashboardStore((s) => s.auditLogs);
  const verifyEvidenceChain = useDashboardStore((s) => s.verifyEvidenceChain);

  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    brokenRecordId?: string;
    message: string;
  } | null>(null);

  const handleVerify = () => {
    const res = verifyEvidenceChain();
    setVerifyResult(res);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-104px)] overflow-y-auto pr-1">
      {/* SECTION 1: Camera Sensor Integrity Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Edge Sensor Integrity & Trust Auditing</h3>
            <p className="text-[10px] font-mono-data text-slate-500">
              Continuous perceptual SSIM, repeating frame loop detection, blackout & NTP clock drift checks
            </p>
          </div>
          <span className="text-[10px] font-mono-data font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            REAL-TIME AGENT PROBES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-data text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                <th className="pb-2">Camera Node</th>
                <th className="pb-2">Node ID</th>
                <th className="pb-2">Trust Score</th>
                <th className="pb-2">Health State</th>
                <th className="pb-2">Video Freeze</th>
                <th className="pb-2">Frame Loop</th>
                <th className="pb-2">Blackout</th>
                <th className="pb-2">Clock Skew</th>
                <th className="pb-2">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {cameras.map((cam) => {
                const isCompromised = cam.healthStatus === "COMPROMISED";
                const isDegraded = cam.healthStatus === "DEGRADED";

                return (
                  <tr key={cam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-900">{cam.name}</td>
                    <td className="py-3 font-semibold text-indigo-700">{cam.roadGraphNodeId}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCompromised
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : isDegraded
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : "bg-emerald-50 text-emerald-700 border-emerald-300"
                        }`}
                      >
                        {cam.trustScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 font-bold">
                      <span className={isCompromised ? "text-rose-600" : isDegraded ? "text-amber-600" : "text-emerald-600"}>
                        {cam.healthStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      {cam.integrityChecks.freezeDetected ? (
                        <span className="text-rose-600 font-bold">FAIL (Freeze)</span>
                      ) : (
                        <span className="text-emerald-600">PASS</span>
                      )}
                    </td>
                    <td className="py-3">
                      {cam.integrityChecks.loopDetected ? (
                        <span className="text-amber-600 font-bold">FAIL (Loop)</span>
                      ) : (
                        <span className="text-emerald-600">PASS</span>
                      )}
                    </td>
                    <td className="py-3">
                      {cam.integrityChecks.blackoutDetected ? (
                        <span className="text-rose-600 font-bold">BLACKOUT</span>
                      ) : (
                        <span className="text-emerald-600">PASS</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">+{cam.integrityChecks.clockSkewMs} ms</td>
                    <td className="py-3 text-slate-500">
                      {new Date(cam.integrityChecks.lastCheckedAt).toLocaleTimeString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Cryptographic Evidence Chain Viewer */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Tamper-Evident Cryptographic Evidence Chain</h3>
            <p className="text-[10px] font-mono-data text-slate-500">
              Each vehicle sighting links SHA-256(prev_hash + frame_hash + metadata) signed by device Ed25519 key
            </p>
          </div>

          <button
            onClick={handleVerify}
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold font-mono-data transition-all cursor-pointer shadow-sm shadow-blue-500/25 flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <RefreshCw size={13} />
            <span>Verify Evidence Chain</span>
          </button>
        </div>

        {/* Verification Result Banner */}
        {verifyResult && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3.5 rounded-xl border text-xs font-mono-data flex items-center gap-2.5 ${
              verifyResult.valid
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-rose-50 border-rose-300 text-rose-900"
            }`}
          >
            {verifyResult.valid ? (
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <strong className="font-bold">{verifyResult.valid ? "CHAIN INTEGRITY VERIFIED" : "CHAIN TAMPERING DETECTED"}</strong>
              <p className="mt-0.5 text-[11px] leading-relaxed">{verifyResult.message}</p>
            </div>
          </motion.div>
        )}

        {/* Evidence Block List */}
        <div className="space-y-2 font-mono-data text-xs">
          {evidenceChain.map((rec, idx) => {
            const isTampered = rec.signatureStatus === "tampered" || rec.sourceFrameHash.startsWith("TAMPERED");

            return (
              <div
                key={rec.id}
                className={`p-3 rounded-xl border transition-all ${
                  isTampered
                    ? "border-rose-400 bg-rose-50/70 shadow-xs"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold text-slate-800">
                    Block #{idx + 1} · Record ID: <strong className="text-indigo-700">{rec.id}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{new Date(rec.timestamp).toLocaleTimeString("en-IN")}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        isTampered
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isTampered ? "TAMPERED HASH" : "ED25519 VERIFIED"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-600 mt-1">
                  <div className="truncate">
                    <span className="text-slate-400">Node / Plate:</span>{" "}
                    <strong>{rec.cameraName}</strong> ({rec.metadata.roadNodeId}) · Plate: <strong className="text-indigo-700">{rec.plate}</strong>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400">Signer Key:</span> {rec.signerKeyId}
                  </div>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 grid grid-cols-1 lg:grid-cols-3 gap-2 text-[9px] text-slate-500 break-all">
                  <div>
                    <span className="text-slate-400">Prev Hash:</span> {rec.prevHash.slice(0, 24)}...
                  </div>
                  <div>
                    <span className="text-slate-400">Frame Hash:</span> {rec.sourceFrameHash.slice(0, 24)}...
                  </div>
                  <div>
                    <span className="text-slate-400">Record Hash:</span> {rec.recordHash.slice(0, 24)}...
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Purpose-Bound Query Audit Logs */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Purpose-Bound Operator Query Audit Trail</h3>
            <p className="text-[10px] font-mono-data text-slate-500">
              Section 8 compliance: every plate search requires authorized case ID and logs operator clearance
            </p>
          </div>
          <span className="text-[10px] font-mono-data font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            IMMUTABLE LOGS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-data text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Operator</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Searched Plate</th>
                <th className="pb-2">Case / Reference #</th>
                <th className="pb-2">Investigation Purpose</th>
                <th className="pb-2">Action Executed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 text-slate-500">{new Date(log.timestamp).toLocaleTimeString("en-IN")} IST</td>
                  <td className="py-2.5 font-bold text-slate-900">{log.operatorName}</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-[10px]">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-[#2563EB]">{log.searchedPlate}</td>
                  <td className="py-2.5 font-bold text-slate-800">{log.caseNumber}</td>
                  <td className="py-2.5 text-slate-600 max-w-xs truncate">{log.purpose}</td>
                  <td className="py-2.5 text-slate-700">{log.actionTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
