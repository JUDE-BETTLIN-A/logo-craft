import { NextRequest, NextResponse } from "next/server";
import { generateLogoConcepts } from "@/lib/logo-generator";
import { GenerateLogoRequest, LogoStyle, LogoConcept } from "@/lib/types";
import { generateAILogos } from "@/lib/ai-logo-gen";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, industry, keywords, style } = body as GenerateLogoRequest;

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const resolvedIndustry = industry || "Technology";

    // Generate font-based + AI image logos in parallel, wait for BOTH
    const [fontLogos, aiLogos] = await Promise.all([
      Promise.resolve(
        generateLogoConcepts(
          { businessName, industry: resolvedIndustry, keywords, style: style as LogoStyle },
          12
        )
      ),
      generateAILogos(
        { businessName, industry: resolvedIndustry, keywords, style: style as string | undefined },
        4
      ).catch((err) => {
        console.error("AI logo generation failed:", err);
        return [];
      }),
    ]);

    // Convert AI logos into LogoConcept objects
    const aiConcepts: LogoConcept[] = aiLogos.map((ai) => ({
      id: ai.id,
      name: businessName,
      businessName,
      industry: resolvedIndustry,
      style: (style as LogoStyle) || "modern",
      colors: ["#6366f1", "#8b5cf6"],
      fontFamily: "Inter",
      iconName: "sparkles",
      layout: "stacked" as const,
      backgroundColor: "#ffffff",
      textColor: "#111827",
      iconColor: "#6366f1",
      createdAt: new Date(),
      aiImageUrl: ai.imageUrl,
      aiPrompt: ai.prompt,
      aiStyleName: ai.styleName,
    }));

    // Interleave AI logos among font logos so they appear mixed
    const logos: LogoConcept[] = [];
    const aiPositions = [0, 3, 7, 11]; // spread AI logos across the grid
    let aiIdx = 0;
    let fontIdx = 0;

    for (let i = 0; i < fontLogos.length + aiConcepts.length; i++) {
      if (aiIdx < aiConcepts.length && aiPositions.includes(i)) {
        logos.push(aiConcepts[aiIdx]);
        aiIdx++;
      } else if (fontIdx < fontLogos.length) {
        logos.push(fontLogos[fontIdx]);
        fontIdx++;
      }
    }
    // Append any remaining
    while (aiIdx < aiConcepts.length) logos.push(aiConcepts[aiIdx++]);
    while (fontIdx < fontLogos.length) logos.push(fontLogos[fontIdx++]);

    return NextResponse.json({ logos });
  } catch (error) {
    console.error("Logo generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate logos" },
      { status: 500 }
    );
  }
}
