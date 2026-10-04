// ==========================================================================
// Project Satya - Risk-Weighted Assignment & Anti-Collusion Engine
// ==========================================================================

/**
 * Calculates great-circle distance between two GPS points using Haversine formula
 * Returns distance in Kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Computes Dynamic Risk Score for an Institute
 * Score from 0 (Safe) to 100 (Extremely High Risk)
 */
export function calculateInstituteRiskScore(institute, weights = { attendance: 0.5, cctv: 0.3, compliance: 0.2 }) {
  const claimed = institute.claimedBeneficiaries || 1;
  const detected = institute.aiDetectedBeneficiaries ?? claimed;
  const deficitRatio = Math.max(0, (claimed - detected) / claimed); // 0 to 1

  const attendanceScore = deficitRatio * 100; // 0 to 100
  const cctvDowntimeScore = Math.max(0, 100 - (institute.cctvUptimePercent || 100)); // 0 to 100
  const pastNonComplianceScore = institute.lastAuditDefects ? 80 : 20;

  const finalScore =
    attendanceScore * weights.attendance +
    cctvDowntimeScore * weights.cctv +
    pastNonComplianceScore * weights.compliance;

  return parseFloat(Math.min(100, Math.max(0, finalScore)).toFixed(1));
}

/**
 * Smart-Assign Engine:
 * 1. Evaluates inspectors within 50km geofence radius
 * 2. Enforces STRICT Anti-Collusion constraint (cannot visit same institute twice in a row)
 * 3. Ranks candidates by proximity, integrity rating, and workload balance
 */
export function evaluateSmartAssignment(institute, inspectors, maxRadiusKm = 50) {
  if (!institute || !inspectors) return { recommendations: [], bestMatch: null };

  const evaluated = inspectors.map((inspector) => {
    const distanceKm = calculateHaversineDistance(
      institute.lat,
      institute.lng,
      inspector.lat,
      inspector.lng
    );

    // Rule 1: Geofencing Radius (within 50km)
    const isWithinRadius = distanceKm <= maxRadiusKm;

    // Rule 2: Anti-Collusion Lock
    // Inspector MUST NOT have inspected this institute in the immediate prior inspection
    const isCollusionRisk = inspector.lastVisitedInstituteId === institute.id;

    // Rule 3: Availability
    const isAvailable = inspector.status === "AVAILABLE";

    let eligibilityStatus = "ELIGIBLE";
    let disqualificationReason = null;

    if (!isWithinRadius) {
      eligibilityStatus = "OUT_OF_GEOFENCE";
      disqualificationReason = `Beyond ${maxRadiusKm}km operational radius (${distanceKm} km away)`;
    } else if (isCollusionRisk) {
      eligibilityStatus = "COLLUSION_BLOCKED";
      disqualificationReason = `COLLUSION SAFEGUARD TRIGGERED: Inspector visited this institute on ${inspector.lastInspectionDate}. Consecutive assignment strictly prohibited.`;
    } else if (!isAvailable) {
      eligibilityStatus = "BUSY";
      disqualificationReason = `Inspector currently on another assignment (${inspector.status})`;
    }

    // Match Score (Higher is better for eligible inspectors)
    // Distance penalty (closer = higher score) + Integrity bonus
    const proximityScore = Math.max(0, 100 - distanceKm * 1.5);
    const integrityBonus = (inspector.integrityRating / 5.0) * 20;
    const matchScore = eligibilityStatus === "ELIGIBLE"
      ? parseFloat((proximityScore * 0.7 + integrityBonus * 0.3).toFixed(1))
      : 0;

    return {
      ...inspector,
      distanceKm,
      isWithinRadius,
      isCollusionRisk,
      eligibilityStatus,
      disqualificationReason,
      matchScore
    };
  });

  // Sort: Eligible candidates first by matchScore descending, then distance ascending
  const sorted = [...evaluated].sort((a, b) => {
    if (a.eligibilityStatus === "ELIGIBLE" && b.eligibilityStatus !== "ELIGIBLE") return -1;
    if (a.eligibilityStatus !== "ELIGIBLE" && b.eligibilityStatus === "ELIGIBLE") return 1;
    if (a.eligibilityStatus === "ELIGIBLE") return b.matchScore - a.matchScore;
    return a.distanceKm - b.distanceKm;
  });

  const bestMatch = sorted.find((cand) => cand.eligibilityStatus === "ELIGIBLE") || null;

  return {
    institute,
    candidates: sorted,
    bestMatch,
    eligibleCount: sorted.filter((c) => c.eligibilityStatus === "ELIGIBLE").length,
    collusionBlockedCount: sorted.filter((c) => c.eligibilityStatus === "COLLUSION_BLOCKED").length
  };
}
