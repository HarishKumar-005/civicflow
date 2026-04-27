import { config } from "dotenv";
config({ path: ".env.local" });

import { extractReportFields } from "./src/lib/ai/index.js";

async function test() {
    console.log("Testing AI Extraction...");
    try {
        const res = await extractReportFields("There is a massive fire downtown, people are trapped.");
        console.log("Result:", res);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
