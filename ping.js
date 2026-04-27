const fetch = require("node-fetch");

async function ping() {
    console.log("Pinging OpenRouter...");
    const key = "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";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: "Hello" }]
        })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
}

ping();
