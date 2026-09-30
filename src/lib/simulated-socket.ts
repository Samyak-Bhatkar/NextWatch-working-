"use client";

import { useEffect, useRef } from "react";
import { useDashboardStore } from "./store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/alerts";

/**
 * TrackSure Data Loader & Real-Time Alert WebSocket Hook.
 * Hydrates baseline demo state from /demo/fixture.json for offline operation,
 * and maintains a live connection to the TrackSure FastAPI WebSocket when online.
 */
export function useSimulatedSocket() {
  const hydrateFromFixture = useDashboardStore((s) => s.hydrateFromFixture);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Initial hydration from public demo fixture
    fetch("/demo/fixture.json")
      .then((res) => {
        if (!res.ok) throw new Error("Fixture not found");
        return res.json();
      })
      .then((data) => {
        hydrateFromFixture(data);
      })
      .catch((err) => {
        console.warn("[TrackSure] Offline fixture load:", err.message);
      });

    // 2. Connect to live backend WebSocket if available
    let isSubscribed = true;
    function connectWS() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[TrackSure WS] Connected to live pipeline stream:", WS_URL);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type === "alert") {
              // Add alert to queue
              useDashboardStore.setState((s) => ({
                alerts: [data.payload, ...s.alerts],
              }));
            } else if (data && data.type === "camera_trust") {
              useDashboardStore.setState((s) => ({
                cameras: s.cameras.map((c) =>
                  c.id === data.cameraId
                    ? { ...c, trustScore: data.trustScore, healthStatus: data.healthStatus }
                    : c
                ),
              }));
            }
          } catch (e) {
            console.error("[TrackSure WS] Parse error:", e);
          }
        };

        ws.onerror = () => {
          // Silent fallback to local fixture state
        };

        ws.onclose = () => {
          if (isSubscribed) {
            // Optional reconnect after 15s without flood
            setTimeout(connectWS, 15000);
          }
        };
      } catch (e) {
        // Fallback silently
      }
    }

    connectWS();

    return () => {
      isSubscribed = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [hydrateFromFixture]);
}
