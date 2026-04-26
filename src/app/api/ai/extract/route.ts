import { NextRequest, NextResponse } from "next/server";
import { extractReportFields } from "@/lib/ai/gemini";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { rawText } = body;

        if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
            return NextResponse.json(
                { error: "rawText is required and must be non-empty" },
                { status: 400 }
            );
        }

        const extracted = await extractReportFields(rawText);

        return NextResponse.json({ data: extracted });
    } catch (error) {
        console.error("AI extraction error:", error);
        return NextResponse.json(
            { error: "AI extraction failed. Please fill in the fields manually." },
            { status: 500 }
        );
    }
}
