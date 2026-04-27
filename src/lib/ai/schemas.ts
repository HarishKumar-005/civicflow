import { z } from "zod";

// Schema for the extraction endpoint
export const ExtractedReportFieldsSchema = z.object({
    title: z.string().max(80).catch("Untitled Report"),
    category: z.enum([
        "water",
        "sanitation",
        "health",
        "food",
        "shelter",
        "education",
        "transport",
        "safety",
        "infrastructure",
        "environment",
        "general"
    ]).catch("general"),
    severity: z.number().int().min(1).max(5).catch(3),
    urgency: z.number().int().min(1).max(5).catch(3),
    affected_count: z.number().int().min(0).catch(1),
    location: z.string().catch("Unknown"),
    summary: z.string().catch("A general report requiring attention."),
    confidence: z.number().min(0).max(1).catch(0.5)
});

export type ExtractedReportFields = z.infer<typeof ExtractedReportFieldsSchema>;

// Schema for the classification endpoint
export const ClassifiedReportSchema = z.object({
    category: z.enum([
        "water",
        "sanitation",
        "health",
        "food",
        "shelter",
        "education",
        "transport",
        "safety",
        "infrastructure",
        "environment",
        "general"
    ]).catch("general"),
    urgency: z.number().int().min(1).max(5).catch(3),
    confidence: z.number().min(0).max(1).catch(0.5)
});

export type ClassifiedReport = z.infer<typeof ClassifiedReportSchema>;
