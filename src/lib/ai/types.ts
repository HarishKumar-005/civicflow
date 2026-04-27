// ---------------------------------------------------------------------------
// CivicFlow AI — Shared Type Definitions
// Server-side only. Never import this from client components.
// ---------------------------------------------------------------------------

/** Every AI-assisted task the app can perform. */
export type AITask =
    | "report_extraction"
    | "report_vision_extraction"
    | "report_classification"
    | "report_summarization"
    | "duplicate_detection"
    | "match_explanation";

/** Options forwarded to the low-level provider call. */
export interface AIRequestOptions {
    /** Which task is being performed — determines model selection. */
    task: AITask;
    /** If true, request JSON-mode from the model. */
    requireJson?: boolean;
    /** Optional system prompt. */
    systemPrompt?: string;
}

/** Normalized response returned by the provider wrapper. */
export interface AIResponse {
    /** Raw text content from the model. */
    content: string;
    /** The model ID that actually served the request (from response). */
    modelUsed: string;
    /** Why the model stopped generating. */
    finishReason: string | null;
}

// ---------------------------------------------------------------------------
// OpenRouter-specific wire types (match their REST API shape)
// ---------------------------------------------------------------------------

export type OpenRouterContentPart =
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } };

export interface OpenRouterMessage {
    role: "system" | "user" | "assistant";
    content: string | OpenRouterContentPart[];
}

export interface OpenRouterPayload {
    /** Single model (mutually exclusive with `models`). */
    model?: string;
    /** Ordered fallback list — OpenRouter tries each until one succeeds. */
    models?: string[];
    messages: OpenRouterMessage[];
    response_format?: { type: "json_object" };
    /** Optional provider routing hints. */
    provider?: {
        order?: string[];
        allow_fallbacks?: boolean;
    };
}

export interface OpenRouterChoice {
    message: {
        role: string;
        content: string;
    };
    finish_reason: string | null;
}

export interface OpenRouterAPIResponse {
    id: string;
    /** The model that actually served the request. */
    model: string;
    choices: OpenRouterChoice[];
}
