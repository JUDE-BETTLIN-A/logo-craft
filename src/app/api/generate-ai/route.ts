import { NextRequest, NextResponse } from "next/server";
import { generateAILogos } from "@/lib/ai-logo-gen";

/**
 * Separate endpoint for AI logo generation.
 * Called asynchronously AFTER the main font-based logos are shown,
 * so the user sees results immediately while AI logos load in.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, industry, keywords, style } = body;

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const aiLogos = await generateAILogos(
      {
        businessName,
        industry: industry || "Technology",
        keywords,
        style,
      },
      4
    );

    return NextResponse.json({ aiLogos });
  } catch (error) {
    console.error("AI logo generation error:", error);
    return NextResponse.json({ aiLogos: [] });
  }
}
