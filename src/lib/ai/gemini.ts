// CivicFlow Gemini AI Integration
// Server-side only — never expose API key to client

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

function getModel() {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export interface ExtractedReportFields {
    title: string;
    category: string;
    severity: number;
    urgency: number;
    affected_count: number;
    location: string;
    summary: string;
    confidence: number;
}

/**
 * Extract structured fields from raw report text using Gemini.
 */
export async function extractReportFields(
    rawText: string
): Promise<ExtractedReportFields> {
    const model = getModel();

    const prompt = `You are a community report analysis system. Extract structured information from the following raw field report text.

Raw Text:
"""
${rawText}
"""

Return a JSON object with these fields:
- title: A concise title for this report (max 80 chars)
- category: One of: water, sanitation, health, food, shelter, education, transport, safety, infrastructure, environment, general
- severity: 1-5 (1=minimal, 5=critical)
- urgency: 1-5 (1=low, 5=emergency)
- affected_count: Estimated number of people affected (integer)
- location: Extracted location or address (string, or "Unknown" if not found)
- summary: A 2-3 sentence summary of the report
- confidence: Your confidence in the extraction (0.0-1.0)

IMPORTANT: Return ONLY the JSON object, no markdown, no code fences, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
        // Clean the response - strip any markdown code fences
        const cleanedText = text
            .replace(/```json\s*/g, "")
            .replace(/```\s*/g, "")
            .trim();
        return JSON.parse(cleanedText);
    } catch {
        // If parsing fails, return defaults
        return {
            title: rawText.slice(0, 80),
            category: "general",
            severity: 3,
            urgency: 3,
            affected_count: 1,
            location: "Unknown",
            summary: rawText.slice(0, 200),
            confidence: 0.3,
        };
    }
}

/**
 * Summarize a report for quick reading.
 */
export async function summarizeReport(
    title: string,
    description: string
): Promise<string> {
    const model = getModel();

    const prompt = `Summarize this community report in 2-3 concise sentences for an NGO coordinator:

Title: ${title}
Description: ${description}

Return ONLY the summary text, no formatting.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

/**
 * Classify a report's category and urgency.
 */
export async function classifyReport(
    text: string
): Promise<{ category: string; urgency: number; confidence: number }> {
    const model = getModel();

    const prompt = `Classify this community report:

"${text}"

Return a JSON object with:
- category: One of: water, sanitation, health, food, shelter, education, transport, safety, infrastructure, environment, general
- urgency: 1-5 (1=low priority, 5=emergency)
- confidence: Your confidence (0.0-1.0)

Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const cleanedText = result.response.text()
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

    try {
        return JSON.parse(cleanedText);
    } catch {
        return { category: "general", urgency: 3, confidence: 0.3 };
    }
}
