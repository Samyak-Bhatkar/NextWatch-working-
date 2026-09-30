import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackSure — Verified City Trajectories",
  description:
    "City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking and Urban Traffic Analytics with Link Trust Verification and Camera Integrity (SIH PS 26127).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
