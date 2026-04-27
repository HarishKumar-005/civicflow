// ---------------------------------------------------------------------------
// CivicFlow AI — Dynamic Model Registry
// Maps each AI task to an ordered fallback chain of OpenRouter model IDs.
// Env-var overrides let operators swap models without touching code.
// ---------------------------------------------------------------------------

import type { AITask } from "./types";

/**
 * Default model chains per task.
 * OpenRouter tries each model in order — if the first is unavailable or
 * rate-limited it automatically falls through to the next.
 *
 * "openrouter/auto" is the catch-all router that picks the best available
 * free model at request time.  It is NOT a deterministic primary — always
 * put a specific model first.
 */
const DEFAULT_MODEL_CHAINS: Record<AITask, string[]> = {
    report_extraction: [
        "google/gemma-4-26b-a4b-it:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-3-27b-it:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "openrouter/free",
    ],
    report_vision_extraction: [
        "google/gemini-2.5-flash", // Top-tier fast vision
        "openai/gpt-4o-mini",      // Fallback fast vision
        "openrouter/auto",         // Router fallback
    ],
    report_classification: [
        "google/gemma-4-26b-a4b-it:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-3-27b-it:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "openrouter/free",
    ],
    report_summarization: [
        "google/gemma-4-26b-a4b-it:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-3-27b-it:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "openrouter/free",
    ],
    duplicate_detection: [
        "google/gemma-4-26b-a4b-it:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-3-27b-it:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "openrouter/free",
    ],
    match_explanation: [
        "google/gemma-4-26b-a4b-it:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-3-27b-it:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "openrouter/free",
    ],
};

/**
 * Environment variable names that can override the default chain for a
 * specific task.  When set, the env value is treated as a **single** model
 * ID and becomes the sole entry in the chain (no fallback list).
 */
const ENV_OVERRIDES: Record<AITask, string> = {
    report_extraction: "OPENROUTER_MODEL_EXTRACT",
    report_vision_extraction: "OPENROUTER_MODEL_VISION",
    report_classification: "OPENROUTER_MODEL_CLASSIFY",
    report_summarization: "OPENROUTER_MODEL_SUMMARIZE",
    duplicate_detection: "OPENROUTER_MODEL_DUPLICATE",
    match_explanation: "OPENROUTER_MODEL_EXPLAIN",
};

/**
 * Resolve the ordered model list for a given task.
 *
 * Priority:
 *  1. Task-specific env var (e.g. `OPENROUTER_MODEL_EXTRACT`)
 *  2. Default chain from `DEFAULT_MODEL_CHAINS`
 */
export function getModelsForTask(task: AITask): string[] {
    const envKey = ENV_OVERRIDES[task];
    const override = envKey ? process.env[envKey] : undefined;

    if (override && override.trim().length > 0) {
        // Operator explicitly chose a model — use it as a single-entry chain.
        return [override.trim()];
    }

    return DEFAULT_MODEL_CHAINS[task];
}
