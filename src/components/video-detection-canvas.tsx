"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "@/lib/store";

interface DetectionItem {
  track_id: string;
  class: string;
  conf: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  speed_kmh: number;
  plate?: string | null;
  plate_conf?: number | null;
  is_stationary?: boolean;
}

interface CameraDetectionsData {
  camera_id: string;
  camera_name: string;
  node_id: string;
  video: string;
  fps: number;
  width: number;
  height: number;
  frame_count: number;
  frames: Record<string, DetectionItem[]>;
}

interface VideoDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraIndex: number;
  cameraId: string;
  overlayMode: "detections" | "clean";
  highlightedTrackId?: string | null;
}

// In-memory cache for detection JSON files so we only fetch once
const detectionCache = new Map<number, CameraDetectionsData>();

export function VideoDetectionCanvas({
  videoRef,
  cameraIndex,
  cameraId,
  overlayMode,
  highlightedTrackId,
}: VideoDetectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<CameraDetectionsData | null>(null);
  const watchlist = useDashboardStore((s) => s.watchlist);

  // Load detection data
  useEffect(() => {
    let isMounted = true;
    if (detectionCache.has(cameraIndex)) {
      setData(detectionCache.get(cameraIndex)!);
      return;
    }

    const jsonUrl = `/data/detections/cam${cameraIndex}_detections.json`;
    fetch(jsonUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((jsonData: CameraDetectionsData) => {
        if (isMounted) {
          detectionCache.set(cameraIndex, jsonData);
          setData(jsonData);
        }
      })
      .catch((err) => {
        console.warn(`Could not load real detections for cam ${cameraIndex}:`, err);
      });

    return () => {
      isMounted = false;
    };
  }, [cameraIndex]);

  // Frame synchronization and canvas drawing loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animHandle: number | null = null;
    let rfcHandle: number | null = null;
    let isCancelled = false;

    // Normalised watchlist plates for quick hit-checking
    const watchlistPlates = new Set(
      watchlist.map((w) => w.plate.replace(/[^A-Z0-9]/gi, "").toUpperCase())
    );

    const render = (now: number, mediaTime?: number) => {
      if (isCancelled || !video || !canvas) return;

      const vWidth = canvas.clientWidth;
      const vHeight = canvas.clientHeight;

      // Ensure canvas internal buffer matches display dimensions
      if (canvas.width !== vWidth || canvas.height !== vHeight) {
        canvas.width = vWidth;
        canvas.height = vHeight;
      }

      ctx.clearRect(0, 0, vWidth, vHeight);

      if (overlayMode !== "detections" || !data) {
        scheduleNext();
        return;
      }

      // Calculate frame index from video media time or currentTime
      const effectiveTime =
        typeof mediaTime === "number" && !isNaN(mediaTime)
          ? mediaTime
          : video.currentTime;
      const fps = data.fps || 30.0;
      let frameIdx = Math.round(effectiveTime * fps);

      // Wrap if video loops past precomputed detection frames
      if (data.frame_count > 0) {
        frameIdx = frameIdx % data.frame_count;
      }

      const detections = data.frames[String(frameIdx)] || [];

      // Video aspect-ratio and object-cover scaling calculation
      const origW = data.width || 1920;
      const origH = data.height || 1080;

      const containerAspect = vWidth / (vHeight || 1);
      const videoAspect = origW / origH;

      let scale = 1.0;
      let offsetX = 0;
      let offsetY = 0;

      // Standard CSS object-cover mapping
      if (containerAspect > videoAspect) {
        scale = vWidth / origW;
        offsetY = (vHeight - origH * scale) / 2;
      } else {
        scale = vHeight / origH;
        offsetX = (vWidth - origW * scale) / 2;
      }

      // Draw real detections
      for (const det of detections) {
        const [x1, y1, x2, y2] = det.bbox;
        const boxX = x1 * scale + offsetX;
        const boxY = y1 * scale + offsetY;
        const boxW = (x2 - x1) * scale;
        const boxH = (y2 - y1) * scale;

        // Skip off-screen boxes
        if (boxX + boxW < 0 || boxX > vWidth || boxY + boxH < 0 || boxY > vHeight) {
          continue;
        }

        // Determine if watchlist hit
        const normPlate = det.plate
          ? det.plate.replace(/[^A-Z0-9]/gi, "").toUpperCase()
          : "";
        const isWatchlistHit = normPlate && watchlistPlates.has(normPlate);
        const isHighlighted = highlightedTrackId === det.track_id;

        // Colors
        let strokeColor = "#00E5FF"; // default cyber cyan
        let tagBg = "rgba(11, 15, 23, 0.92)";

        if (isWatchlistHit) {
          strokeColor = "#EF4444"; // red
        } else if (det.is_stationary) {
          strokeColor = "#F97316"; // orange
        } else if (det.class === "Motorcycle") {
          strokeColor = "#10B981"; // emerald
        } else if (det.class === "Bus" || det.class === "Truck") {
          strokeColor = "#F59E0B"; // amber
        }

        // Bounding box fill
        ctx.fillStyle = isWatchlistHit ? "rgba(239, 68, 68, 0.12)" : "rgba(0, 229, 255, 0.08)";
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Dashed border
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isHighlighted || isWatchlistHit ? 2.5 : 1.4;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.restore();

        // Corner Reticle Brackets
        const cornerSize = Math.min(12, boxW / 4, boxH / 4);
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isHighlighted || isWatchlistHit ? 3.0 : 2.0;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerSize);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerSize, boxY);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerSize, boxY);
        ctx.lineTo(boxX + boxW, boxY);
        ctx.lineTo(boxX + boxW, boxY + cornerSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + boxH - cornerSize);
        ctx.lineTo(boxX, boxY + boxH);
        ctx.lineTo(boxX + cornerSize, boxY + boxH);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerSize, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH - cornerSize);
        ctx.stroke();
        ctx.restore();

        // Header Tag
        const hasPlate = Boolean(det.plate);
        const tagH = hasPlate ? 26 : 16;
        const tagW = Math.max(135, hasPlate ? 145 : 110);
        const tagY = Math.max(16, boxY - tagH - 2);

        // Tag background
        ctx.fillStyle = tagBg;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.roundRect(boxX, tagY, tagW, tagH, 3);
        ctx.fill();
        ctx.stroke();

        // Line 1: Track ID, Class, Speed
        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.fillStyle = strokeColor;
        ctx.fillText(`${det.track_id} · ${det.class}`, boxX + 4, tagY + 9);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "7.5px 'JetBrains Mono', monospace";
        ctx.fillText(`${det.speed_kmh} km/h`, boxX + tagW - 44, tagY + 9);

        // Line 2: Plate OCR
        if (hasPlate) {
          ctx.font = "bold 8px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText("PLATE: ", boxX + 4, tagY + 21);

          if (det.plate === "reading...") {
            ctx.fillStyle = "#94A3B8";
            ctx.fillText("reading...", boxX + 38, tagY + 21);
          } else {
            ctx.fillStyle = isWatchlistHit ? "#EF4444" : "#38BDF8";
            ctx.fillText(det.plate || "", boxX + 38, tagY + 21);
            if (det.plate_conf) {
              ctx.fillStyle = "#64748B";
              ctx.font = "6.5px 'JetBrains Mono', monospace";
              ctx.fillText(
                `(${(det.plate_conf * 100).toFixed(0)}%)`,
                boxX + 106,
                tagY + 21
              );
            }
          }
        }

        // Status Badge (WATCHLIST HIT or STOPPED HAZARD)
        if (isWatchlistHit || det.is_stationary) {
          const badgeText = isWatchlistHit ? "WATCHLIST HIT" : "STOPPED HAZARD";
          const badgeW = badgeText.length * 5.8 + 8;
          const badgeH = 14;
          const badgeX = boxX + tagW + 4;

          ctx.fillStyle = isWatchlistHit ? "#EF4444" : "#F97316";
          ctx.beginPath();
          ctx.roundRect(badgeX, tagY, badgeW, badgeH, 2);
          ctx.fill();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 7px 'JetBrains Mono', monospace";
          ctx.fillText(badgeText, badgeX + 4, tagY + 10);
        }
      }

      scheduleNext();
    };

    const scheduleNext = () => {
      if (isCancelled) return;
      if (
        "requestVideoFrameCallback" in HTMLVideoElement.prototype &&
        video.requestVideoFrameCallback
      ) {
        rfcHandle = video.requestVideoFrameCallback((now, metadata) => {
          render(now, metadata.mediaTime);
        });
      } else {
        animHandle = requestAnimationFrame((now) => {
          render(now);
        });
      }
    };

    scheduleNext();

    return () => {
      isCancelled = true;
      if (rfcHandle !== null && "cancelVideoFrameCallback" in video) {
        // @ts-ignore
        video.cancelVideoFrameCallback(rfcHandle);
      }
      if (animHandle !== null) {
        cancelAnimationFrame(animHandle);
      }
    };
  }, [data, overlayMode, highlightedTrackId, watchlist]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
