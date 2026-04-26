// CivicFlow Database Types
// Mirrors the Supabase schema exactly

export type UserRole = "admin" | "organizer" | "volunteer" | "reporter";

export type ReportStatus = "new" | "verified" | "in_progress" | "resolved" | "closed";
export type ReportCategory =
    | "water" | "sanitation" | "health" | "food" | "shelter"
    | "education" | "transport" | "safety" | "infrastructure" | "environment" | "general";
export type SourceType = "form" | "upload" | "field_note";

export type TaskStatus = "open" | "assigned" | "in_progress" | "completed" | "cancelled";

export type AssignmentStatus = "suggested" | "assigned" | "accepted" | "in_progress" | "completed" | "declined";

export type ExperienceLevel = "beginner" | "intermediate" | "experienced" | "expert";

export type ClusterStatus = "active" | "monitoring" | "resolved";

export type EntityType = "report" | "task" | "assignment" | "user" | "cluster";

// ============================================
// Core Types
// ============================================

export interface User {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    avatar_url: string | null;
    organization: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    updated_at: string;
}

export interface VolunteerProfile {
    id: string;
    user_id: string;
    skills: string[];
    languages: string[];
    availability: {
        weekdays: boolean;
        weekends: boolean;
        mornings: boolean;
        afternoons: boolean;
        evenings: boolean;
    };
    latitude: number | null;
    longitude: number | null;
    radius_km: number;
    preferred_categories: string[];
    experience_level: ExperienceLevel;
    reliability_score: number;
    max_concurrent_tasks: number;
    active_task_count: number;
    created_at: string;
    updated_at: string;
}

export interface Report {
    id: string;
    title: string;
    description: string | null;
    raw_text: string | null;
    source_type: SourceType;
    category: ReportCategory;
    severity: number;
    urgency: number;
    affected_count: number;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    status: ReportStatus;
    priority_score: number;
    ai_summary: string | null;
    ai_confidence: number | null;
    submitted_by: string | null;
    verified_by: string | null;
    cluster_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    report_id: string | null;
    title: string;
    description: string | null;
    required_skills: string[];
    estimated_duration_hours: number;
    latitude: number | null;
    longitude: number | null;
    priority_score: number;
    status: TaskStatus;
    assigned_volunteer_id: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface Assignment {
    id: string;
    task_id: string;
    volunteer_id: string;
    match_score: number;
    match_breakdown: Record<string, number>;
    status: AssignmentStatus;
    assigned_at: string;
    accepted_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    feedback: string | null;
    rating: number | null;
    created_at: string;
}

export interface Cluster {
    id: string;
    name: string;
    issue_type: string | null;
    latitude: number | null;
    longitude: number | null;
    report_count: number;
    priority_score: number;
    status: ClusterStatus;
    created_at: string;
    last_updated: string;
}

export interface ActivityLog {
    id: string;
    entity_type: EntityType;
    entity_id: string;
    action: string;
    actor_id: string | null;
    details: Record<string, unknown>;
    created_at: string;
}

export interface Attachment {
    id: string;
    report_id: string;
    file_url: string;
    file_type: string | null;
    file_name: string | null;
    created_at: string;
}

// ============================================
// Joined / Extended Types
// ============================================

export interface ReportWithSubmitter extends Report {
    submitter?: User;
}

export interface TaskWithReport extends Task {
    report?: Report;
    assigned_volunteer?: User;
}

export interface AssignmentWithDetails extends Assignment {
    task?: Task;
    volunteer?: User;
}

export interface VolunteerWithUser extends VolunteerProfile {
    user?: User;
}

// ============================================
// Form/Input Types
// ============================================

export interface ReportFormData {
    title: string;
    description: string;
    raw_text?: string;
    source_type: SourceType;
    category: ReportCategory;
    severity: number;
    urgency: number;
    affected_count: number;
    latitude?: number;
    longitude?: number;
    address?: string;
}

export interface VolunteerProfileFormData {
    skills: string[];
    languages: string[];
    availability: {
        weekdays: boolean;
        weekends: boolean;
        mornings: boolean;
        afternoons: boolean;
        evenings: boolean;
    };
    latitude?: number;
    longitude?: number;
    radius_km: number;
    preferred_categories: string[];
    experience_level: ExperienceLevel;
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
    totalReports: number;
    newReports: number;
    inProgressReports: number;
    resolvedReports: number;
    totalVolunteers: number;
    activeVolunteers: number;
    totalTasks: number;
    openTasks: number;
    completedTasks: number;
    avgResponseTime: number;
}

// Category labels for UI
export const CATEGORY_LABELS: Record<ReportCategory, string> = {
    water: "Water Supply",
    sanitation: "Sanitation",
    health: "Healthcare",
    food: "Food Security",
    shelter: "Shelter",
    education: "Education",
    transport: "Transport",
    safety: "Public Safety",
    infrastructure: "Infrastructure",
    environment: "Environment",
    general: "General",
};

export const SEVERITY_LABELS: Record<number, string> = {
    1: "Minimal",
    2: "Low",
    3: "Moderate",
    4: "High",
    5: "Critical",
};

export const URGENCY_LABELS: Record<number, string> = {
    1: "Low",
    2: "Routine",
    3: "Moderate",
    4: "Urgent",
    5: "Emergency",
};
