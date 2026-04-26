// CivicFlow Volunteer Matching Engine
// Multi-factor matching with explainable scoring

export interface VolunteerForMatching {
    id: string;
    user_id: string;
    skills: string[];
    languages: string[];
    latitude: number | null;
    longitude: number | null;
    radius_km: number;
    preferred_categories: string[];
    experience_level: string;
    reliability_score: number;
    max_concurrent_tasks: number;
    active_task_count: number;
    availability: {
        weekdays: boolean;
        weekends: boolean;
        mornings: boolean;
        afternoons: boolean;
        evenings: boolean;
    };
}

export interface TaskForMatching {
    id: string;
    required_skills: string[];
    latitude: number | null;
    longitude: number | null;
    priority_score: number;
    category?: string;
}

export interface MatchBreakdown {
    skill_fit: number;
    proximity: number;
    availability: number;
    category_pref: number;
    reliability: number;
    workload_balance: number;
    total: number;
}

export interface MatchResult {
    volunteer_id: string;
    user_id: string;
    score: number;
    breakdown: MatchBreakdown;
}

const DEFAULT_WEIGHTS = {
    skill_fit: 0.35,
    proximity: 0.20,
    availability: 0.15,
    category_pref: 0.10,
    reliability: 0.10,
    workload_balance: 0.10,
};

/**
 * Calculate Haversine distance between two coordinates in km.
 */
function haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
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
    return R * c;
}

/**
 * Calculate skill fit: how many required skills does the volunteer have?
 * Returns 0-1 (1 = perfect match)
 */
function calculateSkillFit(
    volunteerSkills: string[],
    requiredSkills: string[]
): number {
    if (requiredSkills.length === 0) return 1.0; // No skills required = everyone fits
    const normalizedVolunteer = volunteerSkills.map((s) => s.toLowerCase().trim());
    const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());

    const matchCount = normalizedRequired.filter((skill) =>
        normalizedVolunteer.some(
            (vs) => vs.includes(skill) || skill.includes(vs)
        )
    ).length;

    return matchCount / normalizedRequired.length;
}

/**
 * Calculate proximity score based on distance.
 * Within radius = high score, beyond = decreases
 */
function calculateProximity(
    volunteer: VolunteerForMatching,
    task: TaskForMatching
): number {
    if (!volunteer.latitude || !volunteer.longitude || !task.latitude || !task.longitude) {
        return 0.5; // Unknown location = neutral score
    }

    const distance = haversineDistance(
        volunteer.latitude,
        volunteer.longitude,
        task.latitude,
        task.longitude
    );

    if (distance <= volunteer.radius_km * 0.5) return 1.0;
    if (distance <= volunteer.radius_km) return 0.8;
    if (distance <= volunteer.radius_km * 2) return 0.5;
    if (distance <= volunteer.radius_km * 3) return 0.3;
    return 0.1;
}

/**
 * Calculate availability score based on current time and day.
 */
function calculateAvailability(volunteer: VolunteerForMatching): number {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    const isWeekend = day === 0 || day === 6;
    const isMorning = hour >= 6 && hour < 12;
    const isAfternoon = hour >= 12 && hour < 17;
    const isEvening = hour >= 17 && hour < 22;

    let score = 0;

    if (isWeekend && volunteer.availability.weekends) score += 0.5;
    if (!isWeekend && volunteer.availability.weekdays) score += 0.5;
    if (isMorning && volunteer.availability.mornings) score += 0.5;
    if (isAfternoon && volunteer.availability.afternoons) score += 0.5;
    if (isEvening && volunteer.availability.evenings) score += 0.5;

    return Math.min(score, 1.0);
}

/**
 * Calculate category preference score.
 */
function calculateCategoryPref(
    volunteer: VolunteerForMatching,
    taskCategory?: string
): number {
    if (!taskCategory || volunteer.preferred_categories.length === 0) return 0.5;
    return volunteer.preferred_categories
        .map((c) => c.toLowerCase())
        .includes(taskCategory.toLowerCase())
        ? 1.0
        : 0.3;
}

/**
 * Calculate workload balance score.
 * Less active tasks = higher score
 */
function calculateWorkloadBalance(volunteer: VolunteerForMatching): number {
    if (volunteer.active_task_count >= volunteer.max_concurrent_tasks) return 0;
    const utilization = volunteer.active_task_count / volunteer.max_concurrent_tasks;
    return 1 - utilization;
}

/**
 * Score a single volunteer against a task.
 */
export function scoreMatch(
    volunteer: VolunteerForMatching,
    task: TaskForMatching,
    weights = DEFAULT_WEIGHTS
): MatchBreakdown {
    const skill_fit = calculateSkillFit(volunteer.skills, task.required_skills) * weights.skill_fit;
    const proximity = calculateProximity(volunteer, task) * weights.proximity;
    const availability = calculateAvailability(volunteer) * weights.availability;
    const category_pref = calculateCategoryPref(volunteer, task.category) * weights.category_pref;
    const reliability = volunteer.reliability_score * weights.reliability;
    const workload_balance = calculateWorkloadBalance(volunteer) * weights.workload_balance;

    const total = skill_fit + proximity + availability + category_pref + reliability + workload_balance;

    return {
        skill_fit: Math.round(skill_fit * 1000) / 1000,
        proximity: Math.round(proximity * 1000) / 1000,
        availability: Math.round(availability * 1000) / 1000,
        category_pref: Math.round(category_pref * 1000) / 1000,
        reliability: Math.round(reliability * 1000) / 1000,
        workload_balance: Math.round(workload_balance * 1000) / 1000,
        total: Math.round(total * 100) / 100,
    };
}

/**
 * Match all available volunteers to a task, ranked by score.
 */
export function matchVolunteers(
    volunteers: VolunteerForMatching[],
    task: TaskForMatching,
    maxResults = 10
): MatchResult[] {
    const results: MatchResult[] = volunteers
        .filter((v) => v.active_task_count < v.max_concurrent_tasks) // Only available
        .map((volunteer) => {
            const breakdown = scoreMatch(volunteer, task);
            return {
                volunteer_id: volunteer.id,
                user_id: volunteer.user_id,
                score: breakdown.total,
                breakdown,
            };
        })
        .sort((a, b) => b.score - a.score) // Best matches first
        .slice(0, maxResults);

    return results;
}
