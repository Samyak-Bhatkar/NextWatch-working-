"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { useDashboardStore } from "@/lib/store";
import { useSimulatedSocket } from "@/lib/simulated-socket";
import { UserRole, OverlayMode, EnhancementMode } from "@/lib/types";
import {
  ChevronLeft,
  ChevronDown,
  User,
  LayoutGrid,
  Maximize2,
  Map,
  ShieldCheck,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  Tv,
} from "lucide-react";
import { useState, useEffect } from "react";

function DashboardNav() {
  const pathname = usePathname();
  const role = useDashboardStore((s) => s.role);
  const setRole = useDashboardStore((s) => s.setRole);
  const layoutMode = useDashboardStore((s) => s.layoutMode);
  const setLayoutMode = useDashboardStore((s) => s.setLayoutMode);
  const overlayMode = useDashboardStore((s) => s.overlayMode);
  const setOverlayMode = useDashboardStore((s) => s.setOverlayMode);
  const enhancementMode = useDashboardStore((s) => s.enhancementMode);
  const setEnhancementMode = useDashboardStore((s) => s.setEnhancementMode);
  const soundAlerts = useDashboardStore((s) => s.soundAlerts);
  const toggleSoundAlerts = useDashboardStore((s) => s.toggleSoundAlerts);
  const presenterMode = useDashboardStore((s) => s.presenterMode);
  const togglePresenterMode = useDashboardStore((s) => s.togglePresenterMode);
  const alerts = useDashboardStore((s) => s.alerts);

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [time, setTime] = useState("");

  const needsReviewCount = alerts.filter((a) => a.status === "needs_review").length;

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    if (typeof window !== "undefined") {
      (window as any).__tracksureStore = useDashboardStore;
      (window as any).__injectClonedPlate = () => useDashboardStore.getState().injectClonedPlate();
      (window as any).__resetDemo = () => useDashboardStore.getState().resetDemo();
      (window as any).__setEnhancement = (mode: EnhancementMode) => useDashboardStore.getState().setEnhancementMode(mode);
    }
    return () => clearInterval(id);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Live Network" },
    { href: "/dashboard/events", label: "Live Events Feed" },
    { href: "/dashboard/trajectory", label: "Trajectory Search" },
    { href: "/dashboard/analytics", label: "City Analytics" },
    { href: "/dashboard/integrity", label: "Integrity & Evidence" },
    { href: "/dashboard/demo", label: "Demo Tools" },
  ];

  const enhancementOptions: { mode: EnhancementMode; label: string; desc: string }[] = [
    { mode: "off", label: "Enhancement: Normal", desc: "Native optical raw pixels" },
    { mode: "adaptive", label: "Adaptive CLAHE", desc: "Auto-contrast for low-light crops" },
    { mode: "night", label: "Night Sensor Boost", desc: "Gamma correction & noise floor filtering" },
    { mode: "fog", label: "Dehaze / Defog", desc: "Dark channel prior transmission recovery" },
  ];

  const currentEnhance = enhancementOptions.find((e) => e.mode === enhancementMode) || enhancementOptions[0];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/85 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 h-16 transition-colors shadow-xs select-none">
      {/* LEFT: Logo & Back Link */}
      <div className="flex items-center gap-3 lg:gap-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline font-medium">Home</span>
        </Link>
        <div className="w-px h-5 bg-slate-200" />
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
      </div>

      {/* CENTER: Navigation Tabs */}
      <nav className="hidden xl:flex items-center gap-1 p-1 rounded-full bg-slate-100/80 border border-slate-200/80 shadow-inner">
        {navLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all relative flex items-center ${
                active
                  ? "bg-white text-[#2563EB] shadow-xs border border-slate-200/70"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              {link.label}
              {link.href === "/dashboard" && needsReviewCount > 0 && (
                <span
                  suppressHydrationWarning
                  className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono-data font-bold bg-[#EF4444] text-white"
                  title={`${needsReviewCount} incidents awaiting human verification`}
                >
                  {needsReviewCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT: Layout & Dual Vision Controls + Role Clearance */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* Layout Switcher (Grid / Focus / Map) */}
        {pathname === "/dashboard" && (
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              onClick={() => setLayoutMode("grid")}
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                layoutMode === "grid"
                  ? "bg-white text-[#2563EB] shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="2x2 Multi-Camera Grid"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setLayoutMode("focus")}
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                layoutMode === "focus"
                  ? "bg-white text-[#2563EB] shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Focus 1-Major + Companion Feeds"
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={() => setLayoutMode("map")}
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                layoutMode === "map"
                  ? "bg-white text-[#2563EB] shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="City Corridor Map View"
            >
              <Map size={13} />
            </button>
          </div>
        )}

        {/* Control 1: Overlay (Detections | Clean) */}
        <div className="hidden md:flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono-data">
          <button
            onClick={() => setOverlayMode("detections")}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-bold ${
              overlayMode === "detections"
                ? "bg-white text-[#2563EB] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Display verified vehicle bounding boxes, consensus plates, and confidence"
          >
            Detections
          </button>
          <button
            onClick={() => setOverlayMode("clean")}
            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-bold ${
              overlayMode === "clean"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Clean raw camera optical feed"
          >
            Clean
          </button>
        </div>

        {/* Control 2: Enhancement (Off | Adaptive | Night | Fog) */}
        <div className="relative">
          <button
            onClick={() => setShowEnhanceMenu(!showEnhanceMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono-data transition-all cursor-pointer border bg-white border-slate-200 text-slate-800 shadow-xs hover:border-slate-300"
            title="Image enhancement pipeline applied to plate crops"
          >
            <Sparkles size={12} className={enhancementMode !== "off" ? "text-amber-500" : "text-slate-400"} />
            <span className="hidden lg:inline text-[11px] font-medium">{currentEnhance.label}</span>
            <ChevronDown size={11} className="text-slate-400" />
          </button>

          {showEnhanceMenu && (
            <div className="absolute right-0 mt-1.5 rounded-2xl p-1.5 min-w-[230px] z-50 shadow-xl border border-slate-200 bg-white/95 backdrop-blur-xl">
              <div className="px-2.5 py-1 text-[10px] uppercase font-mono-data text-slate-400 font-bold border-b border-slate-100 mb-1">
                Plate Crop Enhancement
              </div>
              {enhancementOptions.map((e) => {
                const active = e.mode === enhancementMode;
                return (
                  <button
                    key={e.mode}
                    onClick={() => {
                      setEnhancementMode(e.mode);
                      setShowEnhanceMenu(false);
                    }}
                    className={`w-full flex flex-col p-2 rounded-xl text-left transition-all cursor-pointer ${
                      active
                        ? "bg-indigo-50 text-[#2563EB] border border-indigo-200/60"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-semibold">{e.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono-data mt-0.5">{e.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Presenter Mode Toggle */}
        <button
          onClick={togglePresenterMode}
          className={`p-1.5 rounded-full border transition-all cursor-pointer shadow-xs ${
            presenterMode ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
          }`}
          title={presenterMode ? "Presenter Mode ON (Larger fonts, streamlined view)" : "Enable Presenter Mode"}
        >
          <Tv size={13} />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleSoundAlerts}
          className={`p-1.5 rounded-full border transition-all cursor-pointer shadow-xs ${
            soundAlerts ? "bg-white border-slate-200 text-[#2563EB]" : "bg-slate-100 border-slate-200 text-slate-400"
          }`}
          title={soundAlerts ? "Sound Alerts Active" : "Sound Alerts Muted"}
        >
          {soundAlerts ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        {/* Live Clock */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono-data text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span suppressHydrationWarning>{time || "LIVE"}</span>
          <span className="text-[9px] text-slate-400">IST</span>
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer border bg-white border-slate-200 text-slate-800 shadow-xs hover:border-slate-300"
            title="User role & clearance"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[#2563EB]">
              <User size={12} />
            </div>
            <span className="hidden sm:inline font-medium">{role}</span>
            {role === "Auditor" && (
              <span className="text-[9px] font-mono-data bg-amber-50 border border-amber-200 text-amber-700 font-bold px-1.5 py-0.2 rounded">
                Read-Only
              </span>
            )}
            <ChevronDown size={11} className="text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 rounded-2xl p-1.5 min-w-[210px] z-50 shadow-xl border border-slate-200 bg-white/95 backdrop-blur-xl">
              <div className="px-2.5 py-1 text-[10px] uppercase font-mono-data text-slate-400 font-bold border-b border-slate-100 mb-1">
                Access Clearance
              </div>
              {(["Operator", "Supervisor", "Auditor", "Admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    role === r
                      ? "bg-indigo-50 text-[#2563EB] font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{r}</span>
                    {r === "Auditor" && (
                      <span className="text-[9px] font-mono-data text-amber-600 bg-amber-50 px-1 rounded">
                        No Write
                      </span>
                    )}
                  </div>
                  {role === r && <ShieldCheck size={13} className="text-[#2563EB]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useSimulatedSocket();
  const presenterMode = useDashboardStore((s) => s.presenterMode);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-[#2563EB]/20 selection:text-[#1D4ED8] ${
      presenterMode ? "text-sm scale-[1.01] transition-transform" : ""
    }`}>
      <DashboardNav />

      {/* Mobile/Responsive sub-bar for smaller screens */}
      <div className="xl:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-slate-100/90 border-b border-slate-200 text-xs font-semibold scrollbar-none">
        {[
          { href: "/dashboard", label: "Live Network" },
          { href: "/dashboard/trajectory", label: "Trajectory Search" },
          { href: "/dashboard/analytics", label: "City Analytics" },
          { href: "/dashboard/integrity", label: "Integrity & Evidence" },
          { href: "/dashboard/demo", label: "Demo Tools" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 whitespace-nowrap shadow-2xs hover:text-[#2563EB]"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <main className="flex-1 p-3 md:p-4 overflow-hidden relative">
        {children}
      </main>

      {/* Honest Provenance Disclaimer Footer */}
      <footer className="px-4 py-2 border-t border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-between text-[11px] font-mono-data text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>TrackSure Multi-Camera ANPR Engine (PS 26127)</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-semibold">Recorded demo feed. Attacks are simulated.</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-400">
          <span>YOLOv11 Detection</span>
          <span>·</span>
          <span>ByteTrack Multi-Target</span>
          <span>·</span>
          <span>Consensus OCR</span>
          <span>·</span>
          <span>Ed25519 Signed Chains</span>
        </div>
      </footer>
    </div>
  );
}
