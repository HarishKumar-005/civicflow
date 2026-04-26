// CivicFlow Priority Scoring Engine
// Transparent, explainable priority scoring for community reports

export interface PriorityFactors {
    severity: number;         // 1-5
    urgency: number;          // 1-5
    affectedCount: number;    // raw count
    recency: number;          // 0-1 (1 = just submitted)
    confidence: number;       // 0-1 (AI confidence or manual = 1.0)
    recurrence: number;       // 0-1 (0 = first report, 1 = many similar)
    locationVulnerability: number; // 0-1 (0 = low risk area, 1 = high risk)
}

export interface PriorityBreakdown {
    severity_score: number;
    urgency_score: number;
    affected_score: number;
    recency_score: number;
    confidence_score: number;
    recurrence_score: number;
    location_score: number;
    total: number;
}

// Default weights — organizers can adjust these
const DEFAULT_WEIGHTS = {
    severity: 0.25,
    urgency: 0.25,
    affected: 0.15,
    recency: 0.10,
    confidence: 0.10,
    recurrence: 0.10,
    location: 0.05,
};

/**
 * Normalize affected count to 0-1 scale.
 * Uses logarithmic scaling: 1 person = 0.1, 10 = 0.5, 100 = 0.8, 1000+ = 1.0
 */
function normalizeAffectedCount(count: number): number {
    if (count <= 0) return 0;
    return Math.min(Math.log10(count + 1) / 3, 1);
}

/**
 * Calculate recency score based on report age.
 * 0-1 hour = 1.0, 24 hours = 0.5, 7 days = 0.1, 30+ days = 0.0
 */
export function calculateRecency(createdAt: string | Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (hoursAgo <= 1) return 1.0;
    if (hoursAgo <= 24) return 0.8 - (hoursAgo / 24) * 0.3;
    if (hoursAgo <= 168) return 0.5 - ((hoursAgo - 24) / 144) * 0.4; // 7 days
    if (hoursAgo <= 720) return 0.1 - ((hoursAgo - 168) / 552) * 0.1; // 30 days
    return 0;
}

/**
 * Calculate priority score with full breakdown.
 * Score range: 0-5 (maps to severity scale for intuitive understanding)
 */
export function calculatePriorityScore(
    factors: PriorityFactors,
    weights = DEFAULT_WEIGHTS
): PriorityBreakdown {
    const normalizedSeverity = factors.severity / 5;
    const normalizedUrgency = factors.urgency / 5;
    const normalizedAffected = normalizeAffectedCount(factors.affectedCount);

    const severity_score = normalizedSeverity * weights.severity;
    const urgency_score = normalizedUrgency * weights.urgency;
    const affected_score = normalizedAffected * weights.affected;
    const recency_score = factors.recency * weights.recency;
    const confidence_score = factors.confidence * weights.confidence;
    const recurrence_score = factors.recurrence * weights.recurrence;
    const location_score = factors.locationVulnerability * weights.location;

    const total =
        severity_score +
        urgency_score +
        affected_score +
        recency_score +
        confidence_score +
        recurrence_score +
        location_score;

    // Scale to 0-5 range
    const scaledTotal = total * 5;

    return {
        severity_score: Math.round(severity_score * 1000) / 1000,
        urgency_score: Math.round(urgency_score * 1000) / 1000,
        affected_score: Math.round(affected_score * 1000) / 1000,
        recency_score: Math.round(recency_score * 1000) / 1000,
        confidence_score: Math.round(confidence_score * 1000) / 1000,
        recurrence_score: Math.round(recurrence_score * 1000) / 1000,
        location_score: Math.round(location_score * 1000) / 1000,
        total: Math.round(scaledTotal * 100) / 100,
    };
}

/**
 * Quick priority score for a report object (convenience wrapper)
 */
export function scoreReport(report: {
    severity: number;
    urgency: number;
    affected_count: number;
    created_at: string;
    ai_confidence?: number | null;
}): number {
    const breakdown = calculatePriorityScore({
        severity: report.severity,
        urgency: report.urgency,
        affectedCount: report.affected_count,
        recency: calculateRecency(report.created_at),
        confidence: report.ai_confidence ?? 1.0,
        recurrence: 0,
        locationVulnerability: 0.5,
    });
    return breakdown.total;
}
