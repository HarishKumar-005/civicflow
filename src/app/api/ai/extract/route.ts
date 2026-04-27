import { NextRequest, NextResponse } from "next/server";
import { extractReportFields, extractReportFromImage } from "@/lib/ai";
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
        const { rawText, imageBase64 } = body;

        // Either rawText or an image is required
        if ((!rawText || rawText.trim().length === 0) && !imageBase64) {
            return NextResponse.json(
                { error: "Either text description or an image is required" },
                { status: 400 }
            );
        }

        let extracted;
        if (imageBase64 && typeof imageBase64 === "string") {
            // User uploaded a photo -> Vision AI
            extracted = await extractReportFromImage(rawText || "", imageBase64);
        } else {
            // Text-only -> Standard AI
            extracted = await extractReportFields(rawText);
        }

        return NextResponse.json({ data: extracted });
    } catch (error) {
        console.error("AI extraction error:", error);
        return NextResponse.json(
            { error: "AI extraction failed. Please fill in the fields manually." },
            { status: 500 }
        );
    }
}
