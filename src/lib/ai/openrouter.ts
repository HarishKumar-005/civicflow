// ---------------------------------------------------------------------------
// CivicFlow AI — OpenRouter Provider (Low-Level)
// Stateless fetch wrapper. Supports the `models[]` fallback syntax.
// Server-side only — never import from client components.
// ---------------------------------------------------------------------------

import type {
    AIResponse,
    OpenRouterPayload,
    OpenRouterAPIResponse,
    OpenRouterMessage,
} from "./types";

const OPENROUTER_BASE_URL =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const REQUEST_TIMEOUT_MS = 30_000; // 30 seconds

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a chat completion request to OpenRouter.
 *
 * @param models   Ordered fallback list of model IDs.
 * @param prompt   The user prompt text.
 * @param options  Additional request options.
 * @returns        Parsed AIResponse with content + modelUsed.
 *
 * @throws {Error} On missing API key, network failure, timeout, or empty response.
 */
export async function callOpenRouter(
    models: string[],
    prompt: string | import("./types").OpenRouterContentPart[],
    options: { requireJson?: boolean; systemPrompt?: string } = {}
): Promise<AIResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error(
            "Missing OPENROUTER_API_KEY environment variable. AI calls cannot proceed."
        );
    }

    // Build messages array
    const messages: OpenRouterMessage[] = [];
    if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    // Build payload — use `models` (plural) for fallback chains
    const payload: OpenRouterPayload = {
        models,
        messages,
        provider: { allow_fallbacks: true },
    };

    if (options.requireJson) {
        payload.response_format = { type: "json_object" };
    }

    // Timeout via AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer":
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "CivicFlow",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        // Handle rate limiting
        if (response.status === 429) {
            const retryAfter = response.headers.get("retry-after");
            console.warn(
                `[CivicFlow AI] Rate limited by OpenRouter.${retryAfter ? ` Retry after ${retryAfter}s.` : ""}`
            );
            throw new Error("OpenRouter rate limit exceeded. Try again shortly.");
        }

        if (!response.ok) {
            // Log status but NEVER log the API key
            const errorBody = await response.text().catch(() => "(unreadable body)");
            console.error(
                `[CivicFlow AI] OpenRouter ${response.status}: ${errorBody.slice(0, 500)}`
            );
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data: OpenRouterAPIResponse = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("Empty content in OpenRouter response");
        }

        return {
            content,
            modelUsed: data.model ?? models[0] ?? "unknown",
            finishReason: data.choices?.[0]?.finish_reason ?? null,
        };
    } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
            throw new Error(
                `OpenRouter request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
            );
        }
        throw err; // Re-throw everything else
    } finally {
        clearTimeout(timeout);
    }
}
