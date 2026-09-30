import { create } from "zustand";
import {
  Camera,
  AlertItem,
  VehicleTrajectory,
  EvidenceRecord,
  AuditLogEntry,
  CityAnalyticsSummary,
  UserRole,
  LayoutMode,
  OverlayMode,
  EnhancementMode,
  TrajectoryLink,
  TrajectorySighting,
} from "./types";

interface ActiveAttacksState {
  frozenCameraId: string | null;
  loopedCameraId: string | null;
  injectedClone: boolean;
  tamperedRecordId: string | null;
}

interface TrackSureStore {
  // Navigation & Control States
  role: UserRole;
  setRole: (role: UserRole) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  overlayMode: OverlayMode;
  setOverlayMode: (mode: OverlayMode) => void;
  enhancementMode: EnhancementMode;
  setEnhancementMode: (mode: EnhancementMode) => void;
  focusedCameraId: string;
  setFocusedCameraId: (id: string) => void;
  soundAlerts: boolean;
  toggleSoundAlerts: () => void;
  presenterMode: boolean;
  togglePresenterMode: () => void;

  // Selected Inspectables
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
  selectedEvidenceRecordId: string | null;
  setSelectedEvidenceRecordId: (id: string | null) => void;
  selectedLinkId: string | null;
  setSelectedLinkId: (id: string | null) => void;

  // Demo Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (plate: string, label: string) => void;
  removeFromWatchlist: (id: string) => void;

  // Domain Data
  cameras: Camera[];
  alerts: AlertItem[];
  trajectory: VehicleTrajectory;
  evidenceChain: EvidenceRecord[];
  auditLogs: AuditLogEntry[];
  cityAnalytics: CityAnalyticsSummary;

  // Attack simulator
  activeAttacks: ActiveAttacksState;

  // Actions
  addAlert: (alert: any) => void;
  confirmAlert: (alertId: string, operatorName?: string) => void;
  rejectAlert: (alertId: string, operatorName?: string) => void;
  notifyUnit: (alertId: string, unitName: string) => void;
  searchTrajectory: (
    plate: string,
    caseNumber: string,
    purpose: string,
    operatorName?: string
  ) => boolean;

  // Demo Attacks
  freezeCamera: (camId: string) => void;
  loopCamera: (camId: string) => void;
  injectClonedPlate: () => void;
  tamperEvidenceRecord: (recordId?: string) => void;
  verifyEvidenceChain: () => { valid: boolean; brokenRecordId?: string; message: string };
  resetDemo: () => void;

  // Fixture Hydration
  hydrateFromFixture: (data: any) => void;
}

export interface WatchlistItem {
  id: string;
  plate: string;
  label: string;
  addedAt: string;
}

export const DEFAULT_WATCHLIST: WatchlistItem[] = [
  {
    id: "WL-001",
    plate: "MH31CB8061",
    label: "Target Vehicle - Corridor Tracking (PCR 12)",
    addedAt: new Date().toISOString(),
  },
  {
    id: "WL-002",
    plate: "MH31EQ4892",
    label: "Transit Lane Stationary Hazard",
    addedAt: new Date().toISOString(),
  },
];

export const getTrackSureVideoUrl = (camId: string): string => {
  const normalized = camId.toUpperCase();
  if (normalized.includes("CAM-001") || normalized.includes("CAM-1") || normalized.includes("A")) {
    return "/videos/cam1_cfr.mp4";
  }
  if (normalized.includes("CAM-002") || normalized.includes("CAM-2") || normalized.includes("B")) {
    return "/videos/cam2_cfr.mp4";
  }
  if (normalized.includes("CAM-003") || normalized.includes("CAM-3") || normalized.includes("C")) {
    return "/videos/cam3_cfr.mp4";
  }
  if (normalized.includes("CAM-004") || normalized.includes("CAM-4") || normalized.includes("D")) {
    return "/videos/cam4_cfr.mp4";
  }
  return "/videos/cam1_cfr.mp4";
};

const DEFAULT_CAMERAS: Camera[] = [
  {
    id: "CAM-001",
    name: "Camera A - Junction North",
    roadGraphNodeId: "RN-101",
    zone: "North Arterial Gateway",
    location: { lat: 21.1612, lng: 79.0834 },
    trustScore: 0.96,
    healthStatus: "HEALTHY",
    fps: 30,
    resolution: "1920×1080 (FHD)",
    bitrate: "6.8 Mbps",
    bearing: 145,
    fovAngle: 78,
    lensType: "Calibrated 8.0mm Fixed Lens",
    streamUrl: "/videos/cam1_cfr.mp4",
    cleanSrc: "/videos/cam1_cfr.mp4",
    trackedSrc: "/videos/cam1_cfr.mp4",
    isDemoFeed: true,
    integrityChecks: {
      freezeDetected: false,
      loopDetected: false,
      blackoutDetected: false,
      sceneDriftDetected: false,
      clockSkewMs: 8,
      lastCheckedAt: new Date().toISOString(),
    },
  },
  {
    id: "CAM-002",
    name: "Camera B - Mid Arterial",
    roadGraphNodeId: "RN-102",
    zone: "Central Corridor Midpoint",
    location: { lat: 21.1485, lng: 79.0792 },
    trustScore: 0.94,
    healthStatus: "HEALTHY",
    fps: 30,
    resolution: "1920×1080 (FHD)",
    bitrate: "6.2 Mbps",
    bearing: 160,
    fovAngle: 82,
    lensType: "Calibrated 6.0mm Fixed Lens",
    streamUrl: "/videos/cam2_cfr.mp4",
    cleanSrc: "/videos/cam2_cfr.mp4",
    trackedSrc: "/videos/cam2_cfr.mp4",
    isDemoFeed: true,
    integrityChecks: {
      freezeDetected: false,
      loopDetected: false,
      blackoutDetected: false,
      sceneDriftDetected: false,
      clockSkewMs: 11,
      lastCheckedAt: new Date().toISOString(),
    },
  },
  {
    id: "CAM-003",
    name: "Camera C - Commercial Ring",
    roadGraphNodeId: "RN-103",
    zone: "West Commercial Intersect",
    location: { lat: 21.1342, lng: 79.0688 },
    trustScore: 0.91,
    healthStatus: "HEALTHY",
    fps: 30,
    resolution: "1920×1080 (FHD)",
    bitrate: "7.1 Mbps",
    bearing: 210,
    fovAngle: 85,
    lensType: "Calibrated 4.0mm Wide Lens",
    streamUrl: "/videos/cam3_cfr.mp4",
    cleanSrc: "/videos/cam3_cfr.mp4",
    trackedSrc: "/videos/cam3_cfr.mp4",
    isDemoFeed: true,
    integrityChecks: {
      freezeDetected: false,
      loopDetected: false,
      blackoutDetected: false,
      sceneDriftDetected: false,
      clockSkewMs: 14,
      lastCheckedAt: new Date().toISOString(),
    },
  },
  {
    id: "CAM-004",
    name: "Camera D - Express Link",
    roadGraphNodeId: "RN-104",
    zone: "Outer Ring Expressway",
    location: { lat: 21.1189, lng: 79.0521 },
    trustScore: 0.95,
    healthStatus: "HEALTHY",
    fps: 30,
    resolution: "1920×1080 (FHD)",
    bitrate: "5.5 Mbps",
    bearing: 195,
    fovAngle: 90,
    lensType: "Calibrated 12.0mm Telephoto",
    streamUrl: "/videos/cam4_cfr.mp4",
    cleanSrc: "/videos/cam4_cfr.mp4",
    trackedSrc: "/videos/cam4_cfr.mp4",
    isDemoFeed: true,
    integrityChecks: {
      freezeDetected: false,
      loopDetected: false,
      blackoutDetected: false,
      sceneDriftDetected: false,
      clockSkewMs: 6,
      lastCheckedAt: new Date().toISOString(),
    },
  },
];

const DEFAULT_TRAJECTORY: VehicleTrajectory = {
  plate: "MH31CB8061",
  normalizedPlate: "MH31CB8061",
  vehicleClass: "Car (Sedan)",
  vehicleColor: "Metallic Silver",
  firstSeen: "2026-09-30T08:42:15.000Z",
  lastSeen: "2026-09-30T08:47:15.000Z",
  hasClonedAnomaly: false,
  sightings: [
    {
      id: "SGT-001",
      timestamp: "2026-09-30T08:42:15.000Z",
      cameraId: "CAM-001",
      cameraName: "Camera A - Junction North",
      roadGraphNodeId: "RN-101",
      coordinates: { lat: 21.1612, lng: 79.0834 },
      plate: "MH31CB8061",
      trackId: "TRK-482",
      plateConfidence: 0.95,
      cameraTrust: 0.96,
      speedKmph: 46.2,
      vehicleClass: "Car (Sedan)",
      vehicleColor: "Metallic Silver",
      directionHeading: 160,
      evidenceRecordId: "EVD-REC-001",
      snapshotUrl: "/videos/Tracksure-Video1st.mp4",
      cropUrl: "/snapshots/sample.jpg",
      ocrVotes: [
        { engine: "PaddleOCR-v4", predictedPlate: "MH31CB8061", confidence: 0.96, normalizedPlate: "MH31CB8061" },
        { engine: "TrOCR-PlateSmall", predictedPlate: "MH31CB8061", confidence: 0.94, normalizedPlate: "MH31CB8061" },
        { engine: "FastPlate-CRNN", predictedPlate: "MH31CB8061", confidence: 0.95, normalizedPlate: "MH31CB8061" },
      ],
    },
    {
      id: "SGT-002",
      timestamp: "2026-09-30T08:44:37.000Z",
      cameraId: "CAM-002",
      cameraName: "Camera B - Mid Arterial",
      roadGraphNodeId: "RN-102",
      coordinates: { lat: 21.1485, lng: 79.0792 },
      plate: "MH31CB8061",
      trackId: "TRK-219",
      plateConfidence: 0.93,
      cameraTrust: 0.94,
      speedKmph: 49.5,
      vehicleClass: "Car (Sedan)",
      vehicleColor: "Metallic Silver",
      directionHeading: 175,
      evidenceRecordId: "EVD-REC-002",
      snapshotUrl: "/videos/Tracksure-Video2nd.mp4",
      cropUrl: "/snapshots/sample.jpg",
      ocrVotes: [
        { engine: "PaddleOCR-v4", predictedPlate: "MH31CB8061", confidence: 0.94, normalizedPlate: "MH31CB8061" },
        { engine: "TrOCR-PlateSmall", predictedPlate: "MH31CB8061", confidence: 0.91, normalizedPlate: "MH31CB8061" },
        { engine: "FastPlate-CRNN", predictedPlate: "MH31CB8061", confidence: 0.93, normalizedPlate: "MH31CB8061" },
      ],
    },
    {
      id: "SGT-003",
      timestamp: "2026-09-30T08:47:15.000Z",
      cameraId: "CAM-003",
      cameraName: "Camera C - Commercial Ring",
      roadGraphNodeId: "RN-103",
      coordinates: { lat: 21.1342, lng: 79.0688 },
      plate: "MH31CB8061",
      trackId: "TRK-704",
      plateConfidence: 0.91,
      cameraTrust: 0.91,
      speedKmph: 47.8,
      vehicleClass: "Car (Sedan)",
      vehicleColor: "Metallic Silver",
      directionHeading: 210,
      evidenceRecordId: "EVD-REC-003",
      snapshotUrl: "/videos/Tracksure-Video3rd.mp4",
      cropUrl: "/snapshots/sample.jpg",
      ocrVotes: [
        { engine: "PaddleOCR-v4", predictedPlate: "MH31CB8061", confidence: 0.92, normalizedPlate: "MH31CB8061" },
        { engine: "TrOCR-PlateSmall", predictedPlate: "MH31CB8061", confidence: 0.89, normalizedPlate: "MH31CB8061" },
        { engine: "FastPlate-CRNN", predictedPlate: "MH31CB8061", confidence: 0.91, normalizedPlate: "MH31CB8061" },
      ],
    },
  ],
  links: [
    {
      id: "LNK-001",
      fromCameraId: "CAM-001",
      toCameraId: "CAM-002",
      distanceMeters: 1840,
      timeGapSeconds: 142,
      calculatedSpeedKmph: 46.6,
      isPhysicallyFeasible: true,
      linkTrustScore: 0.93,
      trustBreakdown: {
        plateConfidence: 0.94,
        cameraTrust: 0.95,
        physicalFeasibility: 0.98,
        appearanceMatch: 0.91,
        compositeScore: 0.93,
      },
      whyExplanation:
        "Road distance 1,840m covered in 142s (46.6 km/h) matches corridor profile (30-65 km/h) with 0.94 OCR consensus agreement and 0.91 appearance match.",
      evidenceRecordId: "EVD-REC-002",
    },
    {
      id: "LNK-002",
      fromCameraId: "CAM-002",
      toCameraId: "CAM-003",
      distanceMeters: 2120,
      timeGapSeconds: 158,
      calculatedSpeedKmph: 48.3,
      isPhysicallyFeasible: true,
      linkTrustScore: 0.89,
      trustBreakdown: {
        plateConfidence: 0.92,
        cameraTrust: 0.92,
        physicalFeasibility: 0.97,
        appearanceMatch: 0.88,
        compositeScore: 0.89,
      },
      whyExplanation:
        "Road distance 2,120m covered in 158s (48.3 km/h). Consistent heading and color signature across junction RN-102 to RN-103.",
      evidenceRecordId: "EVD-REC-003",
    },
  ],
};

const DEFAULT_ALERTS: AlertItem[] = [
  {
    id: "ALT-26127-01",
    type: "blacklist_hit",
    title: "Demo Watchlist Hit: Target Vehicle Identified",
    severity: "critical",
    status: "needs_review",
    detectedAt: "2026-09-30T08:48:10.000Z",
    cameraId: "CAM-001",
    cameraName: "Camera A - Junction North",
    roadGraphNodeId: "RN-101",
    plate: "MH31CB8061",
    trackId: "C1-T1",
    trustScore: 0.94,
    reason: "Plate matched active user-defined Demo Watchlist entry (PCR 12) with 0.94 consensus confidence across tracking window.",
    snapshotUrl: "/videos/cam1_cfr.mp4",
    evidenceRecordId: "EVD-REC-001",
  },
  {
    id: "ALT-26127-02",
    type: "low_trust_link",
    title: "Low-Trust Link: Ambiguous OCR Candidate",
    severity: "medium",
    status: "needs_review",
    detectedAt: "2026-09-30T08:45:22.000Z",
    cameraId: "CAM-003",
    cameraName: "Camera C - Commercial Ring",
    roadGraphNodeId: "RN-103",
    plate: "MH31CB8064",
    trackId: "C3-T3",
    trustScore: 0.68,
    reason: "Character similarity score 0.68 on ambiguous plate suffix; requires operator validation before dispatch.",
    snapshotUrl: "/videos/cam3_cfr.mp4",
    evidenceRecordId: "EVD-REC-003",
  },
  {
    id: "ALT-26127-03",
    type: "behaviour_event",
    title: "Transit Lane Stationary Hazard",
    severity: "high",
    status: "needs_review",
    detectedAt: "2026-09-30T08:46:05.000Z",
    cameraId: "CAM-003",
    cameraName: "Camera C - Commercial Ring",
    roadGraphNodeId: "RN-103",
    plate: "MH31EQ4892",
    trackId: "C3-T2",
    trustScore: 0.92,
    reason: "Vehicle stationary in primary active transit lane for > 40 seconds; measured speed 0.0 km/h with high tracking confidence.",
    snapshotUrl: "/videos/cam3_cfr.mp4",
    evidenceRecordId: "EVD-REC-004",
  },
  {
    id: "ALT-26127-04",
    type: "feed_integrity",
    title: "Feed Integrity: Minor Clock Skew Resolved",
    severity: "low",
    status: "confirmed",
    detectedAt: "2026-09-30T07:15:00.000Z",
    cameraId: "CAM-004",
    cameraName: "Camera D - Express Link",
    roadGraphNodeId: "RN-104",
    trustScore: 0.95,
    reason: "NTP clock skew deviation of +18ms detected and resynchronised by edge telemetry.",
    snapshotUrl: "/videos/cam4_cfr.mp4",
    confirmedBy: "Supervisor Desk",
    confirmedAt: "2026-09-30T07:16:30.000Z",
  },
];

const DEFAULT_EVIDENCE_CHAIN: EvidenceRecord[] = [
  {
    id: "EVD-REC-001",
    timestamp: "2026-09-30T08:42:15.000Z",
    cameraId: "CAM-001",
    cameraName: "Camera A - Junction North",
    plate: "MH31CB8061",
    trackId: "TRK-482",
    sourceFrameHash: "7f8b9e1d2c3a4b5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f",
    cropHash: "3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012",
    prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
    recordHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    signatureStatus: "verified",
    signerKeyId: "ed25519-edge-node-cam001",
    snapshotUrl: "/videos/Tracksure-Video1st.mp4",
    cropUrl: "/snapshots/sample.jpg",
    metadata: {
      roadNodeId: "RN-101",
      speedKmph: 46.2,
      ocrVotes: [
        { engine: "PaddleOCR-v4", predictedPlate: "MH31CB8061", confidence: 0.96, normalizedPlate: "MH31CB8061" },
        { engine: "TrOCR-PlateSmall", predictedPlate: "MH31CB8061", confidence: 0.94, normalizedPlate: "MH31CB8061" },
      ],
      trustBreakdown: {
        plateConfidence: 0.95,
        cameraTrust: 0.96,
        physicalFeasibility: 1.0,
        appearanceMatch: 0.95,
        compositeScore: 0.96,
      },
    },
  },
  {
    id: "EVD-REC-002",
    timestamp: "2026-09-30T08:44:37.000Z",
    cameraId: "CAM-002",
    cameraName: "Camera B - Mid Arterial",
    plate: "MH31CB8061",
    trackId: "TRK-219",
    sourceFrameHash: "c4d5e6f7a8b90123456789abcdef0123456789abcdef0123456789abcdef0123",
    cropHash: "89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
    prevHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    recordHash: "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
    signatureStatus: "verified",
    signerKeyId: "ed25519-edge-node-cam002",
    snapshotUrl: "/videos/Tracksure-Video2nd.mp4",
    cropUrl: "/snapshots/sample.jpg",
    metadata: {
      roadNodeId: "RN-102",
      speedKmph: 49.5,
      ocrVotes: [
        { engine: "PaddleOCR-v4", predictedPlate: "MH31CB8061", confidence: 0.94, normalizedPlate: "MH31CB8061" },
        { engine: "TrOCR-PlateSmall", predictedPlate: "MH31CB8061", confidence: 0.91, normalizedPlate: "MH31CB8061" },
      ],
      trustBreakdown: {
        plateConfidence: 0.93,
        cameraTrust: 0.94,
        physicalFeasibility: 0.98,
        appearanceMatch: 0.91,
        compositeScore: 0.93,
      },
    },
  },
  {
    id: "EVD-REC-003",
    timestamp: "2026-09-30T08:47:15.000Z",
    cameraId: "CAM-003",
    cameraName: "Camera C - Commercial Ring",
    plate: "MH31CB8061",
    trackId: "TRK-704",
    sourceFrameHash: "f1e2d3c4b5a60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    cropHash: "456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
    prevHash: "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
    recordHash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012",
    signatureStatus: "verified",
    signerKeyId: "ed25519-edge-node-cam003",
    snapshotUrl: "/videos/Tracksure-Video3rd.mp4",
    cropUrl: "/snapshots/sample.jpg",
    metadata: {
      roadNodeId: "RN-103",
      speedKmph: 47.8,
      ocrVotes: [
        { engine: "PaddleOCR-v4", predictedPlate: "MH31CB8061", confidence: 0.92, normalizedPlate: "MH31CB8061" },
        { engine: "TrOCR-PlateSmall", predictedPlate: "MH31CB8061", confidence: 0.89, normalizedPlate: "MH31CB8061" },
      ],
      trustBreakdown: {
        plateConfidence: 0.91,
        cameraTrust: 0.91,
        physicalFeasibility: 0.97,
        appearanceMatch: 0.88,
        compositeScore: 0.89,
      },
    },
  },
  {
    id: "EVD-REC-004",
    timestamp: "2026-09-30T08:46:05.000Z",
    cameraId: "CAM-003",
    cameraName: "Camera C - Commercial Ring",
    plate: "MH31EQ4892",
    trackId: "TRK-712",
    sourceFrameHash: "d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123456789a",
    cropHash: "123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
    prevHash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012",
    recordHash: "d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123",
    signatureStatus: "verified",
    signerKeyId: "ed25519-edge-node-cam003",
    snapshotUrl: "/videos/Tracksure-Video3rd.mp4",
    cropUrl: "/snapshots/sample.jpg",
    metadata: {
      roadNodeId: "RN-103",
      speedKmph: 2.1,
      ocrVotes: [
        { engine: "PaddleOCR-v4", predictedPlate: "MH31EQ4892", confidence: 0.94, normalizedPlate: "MH31EQ4892" },
      ],
      trustBreakdown: {
        plateConfidence: 0.94,
        cameraTrust: 0.91,
        physicalFeasibility: 0.95,
        appearanceMatch: 0.89,
        compositeScore: 0.92,
      },
    },
  },
];

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUDIT-001",
    timestamp: "2026-09-30T08:35:12.000Z",
    operatorName: "Insp. Sharma",
    role: "Supervisor",
    searchedPlate: "MH31CB8061",
    caseNumber: "CASE-2026-NAG-4102",
    purpose: "Investigation of stolen commercial sedan reported at North Gateway",
    ipAddress: "10.24.4.15",
    actionTaken: "Full 3-Camera Trajectory Generated & Evidence Exported",
  },
  {
    id: "AUDIT-002",
    timestamp: "2026-09-30T07:22:45.000Z",
    operatorName: "Officer Patel",
    role: "Operator",
    searchedPlate: "MH31EQ4892",
    caseNumber: "CASE-2026-NAG-3984",
    purpose: "Cross-verification of hazard stopped vehicle obstructing traffic",
    ipAddress: "10.24.4.18",
    actionTaken: "Dispatched Municipal Tow Unit",
  },
];

const DEFAULT_CITY_ANALYTICS: CityAnalyticsSummary = {
  totalPlateReadings: 142850,
  averageConsensusConfidence: 0.942,
  verifiedTrajectoryLinks: 38412,
  activeBottlenecksCount: 3,
  odMatrix: [
    { originNode: "RN-101 (North)", destinationNode: "RN-102 (Mid)", count: 4820, avgTravelTimeSec: 145, peakHourFlow: 820 },
    { originNode: "RN-101 (North)", destinationNode: "RN-103 (Commercial)", count: 2940, avgTravelTimeSec: 310, peakHourFlow: 510 },
    { originNode: "RN-102 (Mid)", destinationNode: "RN-103 (Commercial)", count: 5120, avgTravelTimeSec: 162, peakHourFlow: 940 },
    { originNode: "RN-103 (Commercial)", destinationNode: "RN-104 (Express)", count: 3780, avgTravelTimeSec: 210, peakHourFlow: 670 },
  ],
  bottlenecks: [
    {
      id: "BTN-001",
      corridor: "Commercial Ring Segment RN-103",
      segment: "RN-102 -> RN-103",
      congestionIndex: 84,
      avgSpeedKmph: 18.4,
      normalSpeedKmph: 45.0,
      rootCause: "stopped_vehicle",
      rootCauseDescription: "Immobilized vehicle TRK-712 blocking right lane (52s persistence)",
      detectedAt: "2026-09-30T08:46:05.000Z",
    },
    {
      id: "BTN-002",
      corridor: "North Arterial Merge RN-101",
      segment: "RN-101 Entry",
      congestionIndex: 72,
      avgSpeedKmph: 24.2,
      normalSpeedKmph: 50.0,
      rootCause: "high_volume",
      rootCauseDescription: "Peak morning inflow surge exceeding lane capacity threshold (820 veh/h)",
      detectedAt: "2026-09-30T08:40:00.000Z",
    },
    {
      id: "BTN-003",
      corridor: "Express Connector RN-104",
      segment: "RN-103 -> RN-104",
      congestionIndex: 61,
      avgSpeedKmph: 29.5,
      normalSpeedKmph: 60.0,
      rootCause: "illegal_parking",
      rootCauseDescription: "Unauthorised delivery staging in curb lane reducing roadway",
      detectedAt: "2026-09-30T08:32:00.000Z",
    },
  ],
  densityTimeSeries: [
    { hour: "06:00", nodeA_B: 180, nodeB_C: 210, nodeC_D: 140 },
    { hour: "07:00", nodeA_B: 420, nodeB_C: 480, nodeC_D: 310 },
    { hour: "08:00", nodeA_B: 820, nodeB_C: 940, nodeC_D: 670 },
    { hour: "09:00", nodeA_B: 790, nodeB_C: 880, nodeC_D: 640 },
    { hour: "10:00", nodeA_B: 540, nodeB_C: 610, nodeC_D: 450 },
    { hour: "11:00", nodeA_B: 490, nodeB_C: 520, nodeC_D: 410 },
  ],
  recentAnonymizedSightings: [
    { plateHash: "SHA256: 7f8b9e1d2c3a...", corridor: "RN-101 -> RN-102", timestamp: "08:47:12", speedKmph: 48.2, trustScore: 0.94 },
    { plateHash: "SHA256: 3a4b5c6d7e8f...", corridor: "RN-102 -> RN-103", timestamp: "08:46:58", speedKmph: 44.5, trustScore: 0.91 },
    { plateHash: "SHA256: b2c3d4e5f607...", corridor: "RN-101 -> RN-102", timestamp: "08:46:40", speedKmph: 51.0, trustScore: 0.96 },
    { plateHash: "SHA256: c3d4e5f60718...", corridor: "RN-103 -> RN-104", timestamp: "08:46:25", speedKmph: 49.8, trustScore: 0.89 },
    { plateHash: "SHA256: d4e5f6071829...", corridor: "RN-102 -> RN-103", timestamp: "08:46:05", speedKmph: 18.4, trustScore: 0.88 },
  ],
};

export const useDashboardStore = create<TrackSureStore>((set, get) => ({
  role: "Operator",
  setRole: (role) => set({ role }),

  layoutMode: "grid",
  setLayoutMode: (layoutMode) => set({ layoutMode }),

  overlayMode: "detections",
  setOverlayMode: (overlayMode) => set({ overlayMode }),

  enhancementMode: "off",
  setEnhancementMode: (enhancementMode) => set({ enhancementMode }),

  focusedCameraId: "CAM-001",
  setFocusedCameraId: (focusedCameraId) => set({ focusedCameraId }),

  soundAlerts: true,
  toggleSoundAlerts: () => set((s) => ({ soundAlerts: !s.soundAlerts })),

  presenterMode: false,
  togglePresenterMode: () => set((s) => ({ presenterMode: !s.presenterMode })),

  selectedAlertId: null,
  setSelectedAlertId: (selectedAlertId) => set({ selectedAlertId }),

  selectedEvidenceRecordId: null,
  setSelectedEvidenceRecordId: (selectedEvidenceRecordId) => set({ selectedEvidenceRecordId }),

  selectedLinkId: null,
  setSelectedLinkId: (selectedLinkId) => set({ selectedLinkId }),

  watchlist: DEFAULT_WATCHLIST,
  addToWatchlist: (plate: string, label: string) =>
    set((s) => ({
      watchlist: [
        {
          id: `WL-${Date.now()}`,
          plate: plate.trim().toUpperCase(),
          label: label.trim() || "Manual Flag",
          addedAt: new Date().toISOString(),
        },
        ...s.watchlist,
      ],
    })),
  removeFromWatchlist: (id: string) =>
    set((s) => ({
      watchlist: s.watchlist.filter((w) => w.id !== id),
    })),

  cameras: DEFAULT_CAMERAS,
  alerts: DEFAULT_ALERTS,
  trajectory: DEFAULT_TRAJECTORY,
  evidenceChain: DEFAULT_EVIDENCE_CHAIN,
  auditLogs: DEFAULT_AUDIT_LOGS,
  cityAnalytics: DEFAULT_CITY_ANALYTICS,

  activeAttacks: {
    frozenCameraId: null,
    loopedCameraId: null,
    injectedClone: false,
    tamperedRecordId: null,
  },

  addAlert: (alert: any) =>
    set((s) => ({
      alerts: [
        {
          id: alert.id || `ALT-${Date.now()}`,
          type: (alert.type || alert.eventType || "behaviour_event") as any,
          title: alert.title || alert.eventType || "Observed Sensor Event",
          severity: alert.severity || "medium",
          status: "needs_review",
          detectedAt: alert.detectedAt || new Date().toISOString(),
          cameraId: alert.cameraId || "CAM-001",
          cameraName: alert.cameraName || "Camera A - Junction North",
          roadGraphNodeId: alert.roadGraphNodeId || "RN-101",
          plate: alert.plate || alert.vehicleDetails?.licensePlate,
          trackId: alert.trackId,
          trustScore: alert.trustScore || alert.confidence || 0.92,
          reason: alert.reason || "Automated sensor sighting recorded by edge node",
          snapshotUrl: alert.snapshotUrl || "/snapshots/sample.jpg",
        },
        ...s.alerts,
      ],
    })),

  confirmAlert: (alertId, operatorName) => {
    const role = get().role;
    if (role === "Auditor") {
      console.warn("Permission denied: Auditors have read-only clearance.");
      return;
    }
    const by = operatorName || `${role} Desk`;
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: "confirmed",
              confirmedBy: by,
              confirmedAt: new Date().toISOString(),
            }
          : a
      ),
    }));
  },

  rejectAlert: (alertId, operatorName) => {
    const role = get().role;
    if (role === "Auditor") {
      console.warn("Permission denied: Auditors have read-only clearance.");
      return;
    }
    const by = operatorName || `${role} Desk`;
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: "rejected",
              rejectedBy: by,
              rejectedAt: new Date().toISOString(),
            }
          : a
      ),
    }));
  },

  notifyUnit: (alertId, unitName) => {
    const role = get().role;
    if (role === "Auditor") return;
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              unitNotified: {
                unitName,
                notifiedAt: new Date().toISOString(),
                status: "dispatched",
              },
            }
          : a
      ),
    }));
  },

  searchTrajectory: (plate, caseNumber, purpose, operatorName) => {
    const cleanPlate = plate.toUpperCase().replace(/\s+/g, "");
    const role = get().role;
    const operator = operatorName || `${role} Desk`;

    // Indian plate regex validation
    const indianPlateRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
    if (!indianPlateRegex.test(cleanPlate)) {
      return false;
    }

    // Require case number for purpose-bound query
    if (!caseNumber || caseNumber.trim().length < 3) {
      return false;
    }

    const newAuditLog: AuditLogEntry = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      operatorName: operator,
      role,
      searchedPlate: cleanPlate,
      caseNumber: caseNumber.trim(),
      purpose: purpose.trim() || "Multi-camera vehicle trajectory verification",
      ipAddress: "10.24.4.12",
      actionTaken: "Generated verified link trust trajectory",
    };

    set((s) => ({
      auditLogs: [newAuditLog, ...s.auditLogs],
      trajectory: {
        ...s.trajectory,
        plate: cleanPlate,
        normalizedPlate: cleanPlate,
      },
    }));

    return true;
  },

  // ── Attack Simulator Methods ──────────────────────────────────────────
  freezeCamera: (camId: string) => {
    set((s) => {
      const updatedCameras: Camera[] = s.cameras.map((c) =>
        c.id === camId
          ? {
              ...c,
              healthStatus: "COMPROMISED" as const,
              trustScore: 0.18,
              integrityChecks: {
                freezeDetected: true,
                loopDetected: c.integrityChecks?.loopDetected ?? false,
                blackoutDetected: c.integrityChecks?.blackoutDetected ?? false,
                sceneDriftDetected: c.integrityChecks?.sceneDriftDetected ?? false,
                clockSkewMs: c.integrityChecks?.clockSkewMs ?? 8,
                lastCheckedAt: new Date().toISOString(),
              },
            }
          : c
      );

      // Downgrade any trajectory links traversing this camera
      const updatedLinks = s.trajectory.links.map((link) => {
        if (link.fromCameraId === camId || link.toCameraId === camId) {
          return {
            ...link,
            linkTrustScore: 0.44,
            trustBreakdown: {
              ...link.trustBreakdown,
              cameraTrust: 0.18,
              compositeScore: 0.44,
            },
            whyExplanation: `Camera node ${camId} flagged as COMPROMISED (video freeze detected). Link trust score dropped to 0.44 (amber/red).`,
          };
        }
        return link;
      });

      const newAlert: AlertItem = {
        id: `ALT-ATK-${Date.now()}`,
        type: "feed_integrity",
        title: `Feed Integrity Attack: Camera Freeze (${camId})`,
        severity: "critical",
        status: "needs_review",
        detectedAt: new Date().toISOString(),
        cameraId: camId,
        cameraName: s.cameras.find((c) => c.id === camId)?.name || camId,
        roadGraphNodeId: s.cameras.find((c) => c.id === camId)?.roadGraphNodeId || "RN-102",
        trustScore: 0.18,
        reason: "Rolling SSIM perceptual difference dropped to zero across 90 consecutive frames (>3.0s frozen frame condition).",
        snapshotUrl: getTrackSureVideoUrl(camId),
      };

      return {
        cameras: updatedCameras,
        trajectory: { ...s.trajectory, links: updatedLinks },
        alerts: [newAlert, ...s.alerts],
        activeAttacks: { ...s.activeAttacks, frozenCameraId: camId },
      };
    });
  },

  loopCamera: (camId: string) => {
    set((s) => {
      const updatedCameras: Camera[] = s.cameras.map((c) =>
        c.id === camId
          ? {
              ...c,
              healthStatus: "DEGRADED" as const,
              trustScore: 0.42,
              integrityChecks: {
                freezeDetected: c.integrityChecks?.freezeDetected ?? false,
                loopDetected: true,
                blackoutDetected: c.integrityChecks?.blackoutDetected ?? false,
                sceneDriftDetected: c.integrityChecks?.sceneDriftDetected ?? false,
                clockSkewMs: c.integrityChecks?.clockSkewMs ?? 11,
                lastCheckedAt: new Date().toISOString(),
              },
            }
          : c
      );

      const newAlert: AlertItem = {
        id: `ALT-ATK-${Date.now()}`,
        type: "feed_integrity",
        title: `Feed Integrity Attack: Video Loop Detected (${camId})`,
        severity: "high",
        status: "needs_review",
        detectedAt: new Date().toISOString(),
        cameraId: camId,
        cameraName: s.cameras.find((c) => c.id === camId)?.name || camId,
        roadGraphNodeId: s.cameras.find((c) => c.id === camId)?.roadGraphNodeId || "RN-103",
        trustScore: 0.42,
        reason: "Repeating perceptual-hash frame sequence detected over 12.4s window. Feed spoofing suspect.",
        snapshotUrl: getTrackSureVideoUrl(camId),
      };

      return {
        cameras: updatedCameras,
        alerts: [newAlert, ...s.alerts],
        activeAttacks: { ...s.activeAttacks, loopedCameraId: camId },
      };
    });
  },

  injectClonedPlate: () => {
    set((s) => {
      const cloneSighting: TrajectorySighting = {
        id: "SGT-CLONE-001",
        timestamp: "2026-09-30T08:42:50.000Z", // Only 35s after Camera A
        cameraId: "CAM-004",
        cameraName: "Camera D - Express Link",
        roadGraphNodeId: "RN-104",
        coordinates: { lat: 21.1189, lng: 79.0521 },
        plate: s.trajectory.plate,
        trackId: "TRK-999-CLONE",
        plateConfidence: 0.94,
        cameraTrust: 0.95,
        speedKmph: 72.0,
        vehicleClass: "Car (Sedan)",
        vehicleColor: "Metallic Silver",
        directionHeading: 195,
        evidenceRecordId: "EVD-REC-CLONE",
        snapshotUrl: "/videos/Tracksure-Video4th.mp4",
        cropUrl: "/snapshots/sample.jpg",
        ocrVotes: [
          { engine: "PaddleOCR-v4", predictedPlate: s.trajectory.plate, confidence: 0.94, normalizedPlate: s.trajectory.plate },
          { engine: "TrOCR-PlateSmall", predictedPlate: s.trajectory.plate, confidence: 0.92, normalizedPlate: s.trajectory.plate },
        ],
      };

      // Impossible physical link: 14 km distance in 35 seconds => calculated speed 1,440 km/h!
      const impossibleLink: TrajectoryLink = {
        id: "LNK-IMPOSSIBLE-CLONE",
        fromCameraId: "CAM-001",
        toCameraId: "CAM-004",
        distanceMeters: 14000,
        timeGapSeconds: 35,
        calculatedSpeedKmph: 1440.0,
        isPhysicallyFeasible: false,
        linkTrustScore: 0.05,
        isClonedJump: true,
        trustBreakdown: {
          plateConfidence: 0.94,
          cameraTrust: 0.95,
          physicalFeasibility: 0.0,
          appearanceMatch: 0.92,
          compositeScore: 0.05,
        },
        whyExplanation:
          "IMPOSSIBLE TRAVEL TIME: Duplicate plate observed 14,000m apart in 35 seconds (implied speed 1,440 km/h). Severe Cloned Plate anomaly detected!",
        evidenceRecordId: "EVD-REC-CLONE",
      };

      const newAlert: AlertItem = {
        id: `ALT-CLONE-${Date.now()}`,
        type: "cloned_plate_suspect",
        title: `Cloned Plate Suspect: ${s.trajectory.plate}`,
        severity: "critical",
        status: "needs_review",
        detectedAt: new Date().toISOString(),
        cameraId: "CAM-004",
        cameraName: "Camera D - Express Link",
        roadGraphNodeId: "RN-104",
        plate: s.trajectory.plate,
        trackId: "TRK-999-CLONE",
        trustScore: 0.05,
        reason: `Simultaneous sighting of plate ${s.trajectory.plate} at Camera A (RN-101) and Camera D (RN-104) with impossible travel time (14km in 35s). Cloned registration suspect.`,
        snapshotUrl: "/videos/Tracksure-Video4th.mp4",
      };

      return {
        trajectory: {
          ...s.trajectory,
          hasClonedAnomaly: true,
          clonedExplanation: `Cloned plate anomaly detected: vehicle observed at Camera A and Camera D simultaneously (14 km separation in 35s).`,
          sightings: [...s.trajectory.sightings, cloneSighting],
          links: [...s.trajectory.links, impossibleLink],
        },
        alerts: [newAlert, ...s.alerts],
        activeAttacks: { ...s.activeAttacks, injectedClone: true },
      };
    });
  },

  tamperEvidenceRecord: (recordId = "EVD-REC-003") => {
    set((s) => {
      const updatedChain = s.evidenceChain.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              sourceFrameHash: "TAMPERED_0000000000000000000000000000000000000000000000000000000000",
              signatureStatus: "tampered" as const,
            }
          : rec
      );

      return {
        evidenceChain: updatedChain,
        activeAttacks: { ...s.activeAttacks, tamperedRecordId: recordId },
      };
    });
  },

  verifyEvidenceChain: () => {
    const chain = get().evidenceChain;
    for (let i = 0; i < chain.length; i++) {
      const rec = chain[i];
      if (rec.sourceFrameHash.startsWith("TAMPERED") || rec.signatureStatus === "tampered") {
        return {
          valid: false,
          brokenRecordId: rec.id,
          message: `Evidence Chain Tampering Detected at Record ${rec.id} (${rec.cameraName}, ${rec.plate}). Cryptographic SHA-256 hash mismatch with preceding block!`,
        };
      }
    }
    return {
      valid: true,
      message: `Evidence Chain Fully Verified: All ${chain.length} blocks match SHA-256 hash pointers with valid Ed25519 node signatures.`,
    };
  },

  resetDemo: () => {
    set({
      cameras: DEFAULT_CAMERAS,
      alerts: DEFAULT_ALERTS,
      trajectory: DEFAULT_TRAJECTORY,
      evidenceChain: DEFAULT_EVIDENCE_CHAIN,
      activeAttacks: {
        frozenCameraId: null,
        loopedCameraId: null,
        injectedClone: false,
        tamperedRecordId: null,
      },
    });
  },

  hydrateFromFixture: (data: any) => {
    if (!data) return;
    set((s) => ({
      cameras: data.cameras || s.cameras,
      trajectory: data.trajectory || s.trajectory,
      alerts: data.alerts || s.alerts,
      evidenceChain: data.evidenceChain || s.evidenceChain,
      auditLogs: data.auditLogs || s.auditLogs,
      cityAnalytics: data.cityAnalytics || s.cityAnalytics,
    }));
  },
}));
