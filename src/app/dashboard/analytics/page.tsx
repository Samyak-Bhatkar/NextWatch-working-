"use client";

import { useDashboardStore } from "@/lib/store";
import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Car,
  Layers,
  ArrowRight,
  Hash,
  Compass,
} from "lucide-react";

function RootCauseBadge({ cause }: { cause: string }) {
  switch (cause) {
    case "stopped_vehicle":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Stopped Vehicle Hazard
        </span>
      );
    case "collision":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Collision Incident
        </span>
      );
    case "illegal_parking":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Illegal Staging / Parking
        </span>
      );
    case "high_volume":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data font-bold bg-purple-50 text-purple-700 border border-purple-200">
          Capacity Surge
        </span>
      );
    default:
      return null;
  }
}

export default function CityAnalyticsPage() {
  const cityAnalytics = useDashboardStore((s) => s.cityAnalytics);

  return (
    <div className="space-y-4 h-[calc(100vh-104px)] overflow-y-auto pr-1">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10.5px] font-mono-data uppercase font-bold">Total Plate Sightings</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Hash size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">
            {cityAnalytics.totalPlateReadings.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono-data mt-1">
            Across 4 calibrated edge sensor nodes
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10.5px] font-mono-data uppercase font-bold">Consensus OCR Confidence</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">
            {(cityAnalytics.averageConsensusConfidence * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-emerald-700 font-mono-data mt-1 font-semibold">
            3-recogniser character voting
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10.5px] font-mono-data uppercase font-bold">Verified Trajectory Links</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">
            {cityAnalytics.verifiedTrajectoryLinks.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono-data mt-1">
            Link Trust Score ≥ 0.85
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10.5px] font-mono-data uppercase font-bold">Active Bottlenecks</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">
            {cityAnalytics.activeBottlenecksCount} Corridors
          </div>
          <div className="text-[10px] text-amber-700 font-mono-data mt-1 font-semibold">
            With verified root-cause tags
          </div>
        </div>
      </div>

      {/* Middle Grid: Density Time-Series + Origin-Destination Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly Traffic Density Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Traffic Density per Corridor Segment</h3>
              <p className="text-[10px] font-mono-data text-slate-500">Hourly throughput time-series (Vehicles/Hour)</p>
            </div>
            <span className="text-[10px] font-mono-data text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md font-semibold">
              Live Edge Sensors
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cityAnalytics.densityTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#94A3B8" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Line type="monotone" dataKey="nodeA_B" stroke="#2563EB" strokeWidth={2.5} name="Segment RN-101 → RN-102" />
                <Line type="monotone" dataKey="nodeB_C" stroke="#10B981" strokeWidth={2.5} name="Segment RN-102 → RN-103" />
                <Line type="monotone" dataKey="nodeC_D" stroke="#F59E0B" strokeWidth={2.5} name="Segment RN-103 → RN-104" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Origin-Destination (OD) Matrix */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Origin-Destination (OD) Flow Matrix</h3>
              <p className="text-[10px] font-mono-data text-slate-500">Corridor interchange volume & avg travel duration</p>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left font-mono-data text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                  <th className="pb-2">Origin Node</th>
                  <th className="pb-2">Destination Node</th>
                  <th className="pb-2">Volume</th>
                  <th className="pb-2">Avg Travel Time</th>
                  <th className="pb-2">Peak Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {cityAnalytics.odMatrix.map((flow, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800">{flow.originNode}</td>
                    <td className="py-2.5 font-bold text-slate-800">{flow.destinationNode}</td>
                    <td className="py-2.5 text-[#2563EB] font-bold">{flow.count.toLocaleString()}</td>
                    <td className="py-2.5 text-slate-600">{Math.floor(flow.avgTravelTimeSec / 60)}m {flow.avgTravelTimeSec % 60}s</td>
                    <td className="py-2.5 font-semibold text-slate-700">{flow.peakHourFlow}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Bottlenecks with Root Cause Tags + Anonymized SHA-256 Plate Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Identified Bottlenecks with Root Cause Tags */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Corridor Bottlenecks & Root Causes</h3>
              <p className="text-[10px] font-mono-data text-slate-500">Attributed directly to verified sensor events</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {cityAnalytics.bottlenecks.map((btn) => (
              <div
                key={btn.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 font-mono-data text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{btn.corridor}</span>
                  <RootCauseBadge cause={btn.rootCause} />
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-slate-600">
                  <span>Congestion Index: <strong className="text-slate-900">{btn.congestionIndex}%</strong></span>
                  <span>Avg Speed: <strong className="text-rose-600">{btn.avgSpeedKmph} km/h</strong> (Normal: {btn.normalSpeedKmph} km/h)</span>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Root Cause: {btn.rootCauseDescription}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Anonymized Plate Hashes (Privacy Preserving) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Privacy-Preserving Aggregate Stream</h3>
              <p className="text-[10px] font-mono-data text-slate-500">Cryptographically hashed SHA-256 identifiers in public analytics</p>
            </div>
            <span className="text-[9px] font-mono-data font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              DPDP ACT COMPLIANT
            </span>
          </div>

          <div className="space-y-2 font-mono-data text-xs">
            {cityAnalytics.recentAnonymizedSightings.map((sighting, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2563EB] bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                    {sighting.plateHash}
                  </span>
                  <span className="text-slate-600 text-[10.5px]">{sighting.corridor}</span>
                </div>
                <div className="flex items-center gap-3 text-[10.5px] text-slate-500">
                  <span>{sighting.speedKmph} km/h</span>
                  <span className="text-emerald-600 font-bold">TRUST {sighting.trustScore.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
