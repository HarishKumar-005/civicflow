// ---------------------------------------------------------------------------
// CivicFlow AI — Public Service Layer
// The ONLY file that other parts of the app should import from.
// Server-side only — never import from client components.
// ---------------------------------------------------------------------------

import { callOpenRouter } from "./openrouter";
import { getModelsForTask } from "./model-registry";
import {
    ExtractedReportFieldsSchema,
    type ExtractedReportFields,
    ClassifiedReportSchema,
    type ClassifiedReport,
} from "./schemas";
import type { AITask } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strip markdown code fences that some models hallucinate around JSON.
 */
function stripCodeFences(raw: string): string {
    return raw
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();
}

/**
 * Attempt a JSON-returning AI call. If the first attempt produces invalid
 * JSON, retry once with a repair prompt. If that also fails, return the
 * deterministic fallback.
 */
async function safeJsonCall<T>(
    task: AITask,
    prompt: string | import("./types").OpenRouterContentPart[],
    parse: (raw: unknown) => T,
    fallback: T
): Promise<T> {
    const models = getModelsForTask(task);

    // --- Attempt 1 ---
    try {
        const res = await callOpenRouter(models, prompt, { requireJson: true });
        console.log(`[CivicFlow AI] Task="${task}" served by model="${res.modelUsed}"`);
        const parsed = JSON.parse(stripCodeFences(res.content));
        return parse(parsed);
    } catch (firstError) {
        console.warn(`[CivicFlow AI] First attempt failed for task="${task}":`, firstError);
    }

    // --- Attempt 2: Repair prompt ---
    try {
        // If the prompt was an array (vision), extract just the text for the repair so we don't send `[object Object]`
        const originalText = Array.isArray(prompt)
            ? prompt.find(p => p.type === "text")?.text || "Visual Prompt"
            : prompt;

        const repairPrompt = `The previous response was not valid JSON.
Please try again and return ONLY a raw JSON object with no markdown formatting, no code fences, and no explanation.

Original request:
${originalText}`;

        const res = await callOpenRouter(models, repairPrompt, { requireJson: true });
        console.log(`[CivicFlow AI] Repair attempt served by model="${res.modelUsed}"`);
        const parsed = JSON.parse(stripCodeFences(res.content));
        return parse(parsed);
    } catch (secondError) {
        console.error(
            `[CivicFlow AI] Permanent failure for task="${task}". Using deterministic fallback.`,
            secondError
        );
        return fallback;
    }
}

/**
 * Attempt a plain-text AI call with one retry.
 */
async function safeTextCall(
    task: AITask,
    prompt: string | import("./types").OpenRouterContentPart[],
    fallback: string
): Promise<string> {
    const models = getModelsForTask(task);

    try {
        const res = await callOpenRouter(models, prompt, { requireJson: false });
        console.log(`[CivicFlow AI] Task="${task}" served by model="${res.modelUsed}"`);
        return res.content.trim();
    } catch (firstError) {
        console.warn(`[CivicFlow AI] First text attempt failed for task="${task}":`, firstError);
    }

    // Retry once
    try {
        const res = await callOpenRouter(models, prompt, { requireJson: false });
        console.log(`[CivicFlow AI] Retry served by model="${res.modelUsed}"`);
        return res.content.trim();
    } catch (secondError) {
        console.error(
            `[CivicFlow AI] Permanent text failure for task="${task}". Using fallback.`,
            secondError
        );
        return fallback;
    }
}

// ---------------------------------------------------------------------------
// Exported AI Functions
// ---------------------------------------------------------------------------

/**
 * Extract structured fields from raw report text.
 */
export async function extractReportFields(
    rawText: string
): Promise<ExtractedReportFields> {
    const fallback: ExtractedReportFields = {
        title: rawText.slice(0, 80),
        category: "general",
        severity: 3,
        urgency: 3,
        affected_count: 1,
        location: "Unknown",
        summary: rawText.slice(0, 200),
        confidence: 0.1,
    };

    const prompt = `You are a community report analysis system. Extract structured information from the following raw field report text.

Raw Text:
"""
${rawText}
"""

Return a JSON object matching this schema exactly:
{
  "title": "Concise title for the report (max 80 chars)",
  "category": "Must be ONE of: water, sanitation, health, food, shelter, education, transport, safety, infrastructure, environment, general",
  "severity": <integer 1-5, where 5 is critical>,
  "urgency": <integer 1-5, where 5 is emergency>,
  "affected_count": <integer estimate of people affected>,
  "location": "Extracted location (or 'Unknown')",
  "summary": "A 2-3 sentence summary of the report",
  "confidence": <float 0.0-1.0 representing your confidence>
}

IMPORTANT: Return ONLY the raw JSON object. No markdown, no code fences, no explanation.`;

    return safeJsonCall(
        "report_extraction",
        prompt,
        (raw) => ExtractedReportFieldsSchema.parse(raw),
        fallback
    );
}

/**
 * Summarize a report for quick reading by an NGO coordinator.
 */
export async function summarizeReport(
    title: string,
    description: string
): Promise<string> {
    const fallback =
        "Summary could not be generated. Please read the original description.";

    const prompt = `Summarize this community report in 2-3 concise sentences for an NGO coordinator:

Title: ${title}
Description: ${description}

Return ONLY the summary text. No formatting, no JSON.`;

    return safeTextCall("report_summarization", prompt, fallback);
}

/**
 * Classify a report's category and urgency.
 */
export async function classifyReport(text: string): Promise<ClassifiedReport> {
    const fallback: ClassifiedReport = {
        category: "general",
        urgency: 3,
        confidence: 0.1,
    };

    const prompt = `Classify this community report:

"${text}"

Return a JSON object with:
- "category": One of: water, sanitation, health, food, shelter, education, transport, safety, infrastructure, environment, general
- "urgency": 1-5 (1=low priority, 5=emergency)
- "confidence": Your confidence (0.0-1.0)

Return ONLY the JSON object. No markdown, no code fences.`;

    return safeJsonCall(
        "report_classification",
        prompt,
        (raw) => ClassifiedReportSchema.parse(raw),
        fallback
    );
}

/**
 * Extract structured fields directly from a user-uploaded image.
 */
export async function extractReportFromImage(
    rawText: string,
    imageBase64: string
): Promise<ExtractedReportFields> {
    const fallback: ExtractedReportFields = {
        title: rawText ? rawText.slice(0, 80) : "Image Report",
        category: "general",
        severity: 3,
        urgency: 3,
        affected_count: 1,
        location: "Unknown",
        summary: rawText ? rawText.slice(0, 200) : "Extracted from an uploaded photograph.",
        confidence: 0.1,
    };

    const textContent = `You are a community report analysis system. Extract structured information from the following user description and the attached image.
    
User Description (if any):
"""
${rawText || "No context provided. Analyze the image carefully."}
"""

Return a JSON object matching this schema exactly:
{
  "title": "Concise title for the report (max 80 chars)",
  "category": "Must be ONE of: water, sanitation, health, food, shelter, education, transport, safety, infrastructure, environment, general",
  "severity": <integer 1-5, where 5 is critical>,
  "urgency": <integer 1-5, where 5 is emergency>,
  "affected_count": <integer estimate of people affected>,
  "location": "Extracted location from description or image context (or 'Unknown')",
  "summary": "A 2-3 sentence summary of the visible incident",
  "confidence": <float 0.0-1.0 representing your confidence>
}

IMPORTANT: Return ONLY the raw JSON object. No markdown, no code fences, no explanation.`;

    const prompt: import("./types").OpenRouterContentPart[] = [
        { type: "text", text: textContent },
        { type: "image_url", image_url: { url: imageBase64 } }
    ];

    return safeJsonCall(
        "report_vision_extraction",
        prompt,
        (raw) => ExtractedReportFieldsSchema.parse(raw),
        fallback
    );
}
