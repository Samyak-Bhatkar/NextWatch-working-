export type CameraHealthStatus = "HEALTHY" | "DEGRADED" | "COMPROMISED";

export type OverlayMode = "detections" | "clean";
export type EnhancementMode = "off" | "adaptive" | "night" | "fog";
export type LayoutMode = "grid" | "focus" | "map";

export type UserRole = "Operator" | "Supervisor" | "Auditor" | "Admin";

export interface CameraIntegrityChecks {
  freezeDetected: boolean;
  loopDetected: boolean;
  blackoutDetected: boolean;
  sceneDriftDetected: boolean;
  clockSkewMs: number;
  lastCheckedAt: string;
}

export interface Camera {
  id: string;
  name: string;
  roadGraphNodeId: string;
  location: { lat: number; lng: number };
  zone: string;
  trustScore: number; // 0.00 to 1.00
  healthStatus: CameraHealthStatus;
  fps: number;
  resolution: string;
  bitrate: string;
  bearing: number;
  fovAngle: number;
  lensType: string;
  streamUrl?: string;
  integrityChecks: CameraIntegrityChecks;
  cleanSrc?: string;
  trackedSrc?: string;
  isDemoFeed?: boolean;
  status?: "online" | "offline" | "degraded";
  sourceType?: string;
}

// ── Backwards Compatibility Aliases ──────────────────────────────────
export type AlertEventType = string;
export type AlertStatus = "new" | "acknowledged" | "resolved" | "false_positive";
export type AlertReviewStatus = "needs_review" | "confirmed" | "rejected" | AlertStatus;
export type AlertVehicleDetails = {
  objectClass: string;
  make?: string;
  color?: string;
  licensePlate?: string;
  plateConfidence?: number;
  speedKmph?: number;
  durationInZoneSec?: number;
};
export type Alert = Partial<AlertItem> & {
  id: string;
  cameraId: string;
  cameraName: string;
  severity: AlertSeverity;
  status: AlertReviewStatus;
  detectedAt: string;
  type?: AlertType;
  title?: string;
  roadGraphNodeId?: string;
  reason?: string;
  eventType?: string;
  confidence?: number;
  vehicleDetails?: AlertVehicleDetails;
  latencyMs?: number;
  deliveredAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  trackId?: string;
  snapshotUrl?: string;
  dispatchedUnit?: any;
};
export type DailyStat = {
  cameraId: string;
  date: string;
  totalAlerts: number;
  avgLatencyMs: number;
  falsePositiveRate: number;
  resolvedRate: number;
  hourlyBreakdown: { hour: number; count: number }[];
};

export type AlertType =
  | "blacklist_hit"
  | "cloned_plate_suspect"
  | "feed_integrity"
  | "low_trust_link"
  | "behaviour_event";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export interface OcrCandidateVote {
  engine: string;
  predictedPlate: string;
  confidence: number;
  normalizedPlate: string;
}

export interface TrustBreakdown {
  plateConfidence: number; // weight ~0.40
  cameraTrust: number; // weight ~0.25 (geometric mean of nodes)
  physicalFeasibility: number; // weight ~0.25 (speed vs road distance)
  appearanceMatch: number; // weight ~0.10 (HSV + re-ID feature agreement)
  compositeScore: number; // Link Trust Score
}

export interface TrackletVehicle {
  trackId: string;
  objectClass: "Car" | "SUV" | "Truck" | "Motorcycle" | "Auto-Rickshaw" | "Bus";
  plate: string;
  consensusConfidence: number;
  rawConfidence?: number;
  color: string;
  speedKmph: number;
  ocrVotes?: OcrCandidateVote[];
  behaviourFlag?: "wrong_way" | "stopped" | "collision" | "speeding" | null;
  behaviourPersistent?: boolean;
  behaviourConfidence?: number;
}

export interface EvidenceRecord {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  plate: string;
  trackId: string;
  sourceFrameHash: string; // SHA-256
  cropHash: string; // SHA-256
  prevHash: string; // SHA-256 link
  recordHash: string; // SHA-256(prevHash + frameHash + metadata)
  signatureStatus: "verified" | "tampered" | "pending";
  signerKeyId: string;
  snapshotUrl: string;
  cropUrl?: string;
  metadata: {
    ocrVotes: OcrCandidateVote[];
    trustBreakdown: TrustBreakdown;
    roadNodeId: string;
    speedKmph: number;
  };
}

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  severity: AlertSeverity;
  status: AlertReviewStatus;
  detectedAt: string;
  cameraId: string;
  cameraName: string;
  roadGraphNodeId: string;
  plate?: string;
  trackId?: string;
  trustScore?: number;
  reason: string;
  snapshotUrl: string;
  evidenceRecordId?: string;
  unitNotified?: {
    unitName: string;
    notifiedAt: string;
    status: "dispatched" | "en_route" | "on_scene";
  };
  confirmedBy?: string;
  confirmedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
}

export interface TrajectorySighting {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  roadGraphNodeId: string;
  coordinates: { lat: number; lng: number };
  plate: string;
  trackId: string;
  plateConfidence: number;
  cameraTrust: number;
  speedKmph: number;
  vehicleClass: string;
  vehicleColor: string;
  directionHeading: number;
  behaviourEvent?: {
    type: "stopped" | "wrong_way" | "collision";
    confidence: number;
    description: string;
  };
  evidenceRecordId: string;
  snapshotUrl: string;
  cropUrl: string;
  ocrVotes: OcrCandidateVote[];
}

export interface TrajectoryLink {
  id: string;
  fromCameraId: string;
  toCameraId: string;
  distanceMeters: number;
  timeGapSeconds: number;
  calculatedSpeedKmph: number;
  isPhysicallyFeasible: boolean;
  linkTrustScore: number; // >= 0.85 green, 0.50-0.85 amber, < 0.50 red
  trustBreakdown: TrustBreakdown;
  isClonedJump?: boolean;
  whyExplanation: string;
  evidenceRecordId: string;
}

export interface VehicleTrajectory {
  plate: string;
  normalizedPlate: string;
  vehicleClass: string;
  vehicleColor: string;
  firstSeen: string;
  lastSeen: string;
  sightings: TrajectorySighting[];
  links: TrajectoryLink[];
  hasClonedAnomaly: boolean;
  clonedExplanation?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operatorName: string;
  role: UserRole;
  searchedPlate: string;
  caseNumber: string;
  purpose: string;
  ipAddress: string;
  actionTaken: string;
}

export interface OriginDestinationFlow {
  originNode: string;
  destinationNode: string;
  count: number;
  avgTravelTimeSec: number;
  peakHourFlow: number;
}

export interface BottleneckItem {
  id: string;
  corridor: string;
  segment: string;
  congestionIndex: number; // 0 to 100
  avgSpeedKmph: number;
  normalSpeedKmph: number;
  rootCause: "stopped_vehicle" | "collision" | "illegal_parking" | "high_volume";
  rootCauseDescription: string;
  associatedEventId?: string;
  detectedAt: string;
}

export interface SegmentDensity {
  hour: string;
  nodeA_B: number;
  nodeB_C: number;
  nodeC_D: number;
}

export interface CityAnalyticsSummary {
  totalPlateReadings: number;
  averageConsensusConfidence: number;
  verifiedTrajectoryLinks: number;
  activeBottlenecksCount: number;
  odMatrix: OriginDestinationFlow[];
  bottlenecks: BottleneckItem[];
  densityTimeSeries: SegmentDensity[];
  recentAnonymizedSightings: {
    plateHash: string; // SHA-256 anonymized
    corridor: string;
    timestamp: string;
    speedKmph: number;
    trustScore: number;
  }[];
}
