import { config } from "dotenv";
config({ path: ".env.local" });

const fetch = (...args: any[]) => import('node-fetch').then(({ default: fetch }) => fetch(...args as [any, any]));

async function ping() {
    console.log("Pinging OpenRouter with google/gemma-3-27b-it:free (JSON mode)...");
    const key = process.env.OPENROUTER_API_KEY;

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemma-3-27b-it:free",
                messages: [{ role: "user", content: "Extract this event into JSON: A fire at the market. Return fields: title, urgency. Return ONLY raw JSON." }],
                response_format: { type: "json_object" }
            })
        }) as any;

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Response Body:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Ping failed:", e);
    }
}

ping();
