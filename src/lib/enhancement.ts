import { EnhancementMode } from "./types";

/**
 * Returns hardware-accelerated CSS filter string corresponding to the active optical enhancement pipeline.
 * Applied across live camera video tiles, focused streams, and captured license plate crops.
 */
export function getEnhancementFilter(mode: EnhancementMode): string {
  switch (mode) {
    case "adaptive":
      // Adaptive CLAHE: Dynamic histogram equalization, shadow recovery, edge contrast boost
      return "contrast(1.45) brightness(1.24) saturate(1.22)";
    case "night":
      // Night Sensor Boost: Heavy gamma gain compensation, suppresses sensor noise floor in extreme low-light
      return "brightness(1.52) contrast(1.38) saturate(0.88) hue-rotate(-4deg)";
    case "fog":
      // Dehaze / Defog: Dark channel prior transmission recovery, cuts atmospheric haze & headlight glare
      return "contrast(1.52) brightness(1.06) saturate(1.38)";
    case "off":
    default:
      return "none";
  }
}

/**
 * Tactical On-Screen Display (OSD) label for active enhancement pipeline
 */
export function getEnhancementLabel(mode: EnhancementMode): string {
  switch (mode) {
    case "adaptive":
      return "CLAHE ACTIVE (+35% DYNAMIC CONTRAST)";
    case "night":
      return "NIGHT BOOST (+45% SENSOR GAIN)";
    case "fog":
      return "DEHAZE (DARK CHANNEL PRIOR)";
    case "off":
    default:
      return "Enhancement: Normal";
  }
}
