"use client";

import Link from "next/link";
import {
  Shield,
  Activity,
  ArrowRight,
  Compass,
  FileCheck2,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB]/20 selection:text-[#1D4ED8] flex flex-col justify-between">
      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-55 scale-100 transition-opacity duration-700"
        >
          <source src="/videos/Tracksure-Video1st.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/85 via-[#F8FAFC]/65 to-[#F8FAFC]/90 backdrop-blur-[1.5px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_20%,rgba(37,99,235,0.08),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* Navigation */}
        <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <nav className="glass-navbar rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 shadow-md bg-white/80 backdrop-blur-xl border border-slate-200/80">
            <Link href="/">
              <Logo size="md" />
            </Link>

            <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-md p-1 rounded-full border border-slate-200/80 shadow-xs">
              <Link href="/dashboard" className="px-4 py-1.5 rounded-full text-[#2563EB] bg-white shadow-xs flex items-center gap-1.5 border border-slate-200/60 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Network
              </Link>
              <Link href="/dashboard/trajectory" className="px-4 py-1.5 rounded-full hover:text-[#0F172A] hover:bg-white/80 transition-all">
                Trajectory Search
              </Link>
              <Link href="/dashboard/analytics" className="px-4 py-1.5 rounded-full hover:text-[#0F172A] hover:bg-white/80 transition-all">
                City Analytics
              </Link>
              <Link href="/dashboard/integrity" className="px-4 py-1.5 rounded-full hover:text-[#0F172A] hover:bg-white/80 transition-all">
                Integrity & Evidence
              </Link>
              <Link href="/dashboard/demo" className="px-4 py-1.5 rounded-full hover:text-[#0F172A] hover:bg-white/80 transition-all text-amber-700 font-semibold">
                Demo Tools
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 group cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>Console</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono-data font-semibold shadow-xs">
                <Activity size={12} className="text-emerald-600 animate-pulse" />
                <span>Edge Online</span>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-xs font-medium text-slate-700 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="font-bold text-[#2563EB] uppercase text-[10px] tracking-wider font-mono-data">Smart India Hackathon · PS 26127</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono-data text-[11px] text-slate-600">Multi-Camera ANPR Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.14] mb-5 drop-shadow-xs"
          >
            Multi-Camera ANPR Trajectory Tracking & Urban Traffic Analytics
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-3xl font-medium leading-relaxed mb-9 bg-white/50 backdrop-blur-xs py-2 px-4 rounded-2xl border border-white/80"
          >
            Reconstruct vehicle trajectories across city intersections with mathematical Link Trust Scores, camera integrity verification, consensus OCR voting, and tamper-evident cryptographic chains.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto justify-center mb-12"
          >
            <Link
              href="/dashboard"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 group cursor-pointer shadow-xl shadow-blue-500/25"
            >
              <span>Launch Live Network</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard/trajectory"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-sm bg-white/95 hover:bg-white text-slate-800 border border-slate-200 shadow-md backdrop-blur-md hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass size={16} className="text-[#2563EB]" />
              <span>Trajectory Search & GIS Map</span>
            </Link>
          </motion.div>

          {/* 3 Core Value Pillar Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left"
          >
            <div className="glass-card rounded-2xl p-5 border border-slate-200/90 bg-white/90 backdrop-blur-xl shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] flex-shrink-0 shadow-2xs">
                <Compass size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Link Trust Score</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Weighted geometric mean of consensus plate confidence, camera trust, physical road feasibility, and appearance embeddings.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-200/90 bg-white/90 backdrop-blur-xl shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-2xs">
                <Shield size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Camera Integrity Probes</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Continuous SSIM freeze detection, repeating loop detection, blackout checks, and clock skew auditing to reject spoofed video.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-200/90 bg-white/90 backdrop-blur-xl shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-2xs">
                <FileCheck2 size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Tamper-Evident Chains</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Cryptographically chained SHA-256 frame hashes with Ed25519 digital signatures and purpose-bound audit logs for evidentiary integrity.
                </p>
              </div>
            </div>
          </motion.div>
        </main>

        <footer className="px-6 py-4 border-t border-slate-200/80 bg-white/60 backdrop-blur-md flex items-center justify-between text-xs font-mono-data text-slate-500">
          <div>TrackSure · Smart India Hackathon PS 26127</div>
          <div className="text-slate-400">Recorded demo feed. Attacks are simulated.</div>
        </footer>
      </div>
    </div>
  );
}
