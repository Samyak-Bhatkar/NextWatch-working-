"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSize = size === "sm" ? 32 : size === "lg" ? 44 : 36;
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* TrackSure Shield & Vector Trajectory Emblem */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#2563EB] via-[#4F46E5] to-[#7C3AED] p-[1.5px] shadow-md shadow-indigo-500/20 group-hover:scale-105 group-hover:shadow-indigo-500/35 transition-all duration-300"
        style={{ width: iconSize, height: iconSize }}
      >
        <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.35),transparent_70%)]" />

          {/* Connected Trajectory Vector Nodes SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-[68%] h-[68%] text-white relative z-10 drop-shadow-xs"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Trajectory path */}
            <path
              d="M4 18 L10 12 L14 15 L20 6"
              stroke="#00E5FF"
              strokeWidth="2.2"
              strokeDasharray="0"
            />
            {/* Camera Nodes */}
            <circle cx="4" cy="18" r="2.2" fill="#10B981" stroke="white" strokeWidth="1.2" />
            <circle cx="10" cy="12" r="2.2" fill="#00E5FF" stroke="white" strokeWidth="1.2" />
            <circle cx="14" cy="15" r="2.2" fill="#00E5FF" stroke="white" strokeWidth="1.2" />
            <circle cx="20" cy="6" r="2.4" fill="#6366F1" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex items-baseline tracking-tight">
          <span className={`${textSize} font-extrabold text-slate-900 tracking-tight`}>Track</span>
          <span
            className={`${textSize} font-black bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent ml-0.5`}
          >
            Sure
          </span>
          <span className="text-[9px] font-mono-data uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded-md ml-2 hidden sm:inline">
            PS 26127
          </span>
        </div>
      )}
    </div>
  );
}
