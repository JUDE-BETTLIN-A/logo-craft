import { NextRequest, NextResponse } from "next/server";
import {
  buildReplicateLogoPrompt,
  generateWithReplicate,
} from "@/lib/replicate";
import { buildDeepAILogoPrompt, generateWithDeepAI } from "@/lib/deepai";

/**
 * Professional AI Logo Studio endpoint.
 * Generates logos using BOTH Replicate (Flux.1) and DeepAI simultaneously
 * for maximum variety and quality.
 */

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

interface LogoBriefInput {
  brandName: string;
  tagline?: string;
  industry: string;
  targetAudience?: string;
  personality?: string;
  colors?: string;
  logoStyle?: string;
  iconPreference?: string;
  backgroundType?: string;
  additionalNotes?: string;
}

/**
 * Build prompt variations — each provider gets a slightly different emphasis
 * to produce diverse results.
 */
function buildPromptVariations(input: LogoBriefInput) {
  // Replicate (Flux.1) prompt — optimized for Flux's strengths
  const replicatePrompt = buildReplicateLogoPrompt({
    brandName: input.brandName,
    tagline: input.tagline,
    industry: input.industry,
    targetAudience: input.targetAudience,
    personality: input.personality,
    colors: input.colors,
    logoStyle: input.logoStyle,
    iconPreference: input.iconPreference,
    backgroundType: input.backgroundType,
    additionalNotes: input.additionalNotes,
  });

  // Variation 2 — different emphasis for Replicate
  const replicateVariation = buildReplicateLogoPrompt({
    brandName: input.brandName,
    tagline: input.tagline,
    industry: input.industry,
    targetAudience: input.targetAudience,
    personality: input.personality
      ? `${input.personality}, creative, unique`
      : "creative, unique",
    colors: input.colors,
    logoStyle: input.logoStyle
      ? `${input.logoStyle}, emblem-style`
      : "emblem-style, badge",
    iconPreference: input.iconPreference,
    backgroundType: input.backgroundType,
    additionalNotes: input.additionalNotes
      ? `${input.additionalNotes}. Make this version bolder and more iconic.`
      : "Make this version bolder and more iconic.",
  });

  // DeepAI prompt — optimized for DeepAI's model
  const deepaiPrompt = buildDeepAILogoPrompt({
    brandName: input.brandName,
    tagline: input.tagline,
    industry: input.industry,
    targetAudience: input.targetAudience,
    personality: input.personality,
    colors: input.colors,
    logoStyle: input.logoStyle,
    iconPreference: input.iconPreference,
    backgroundType: input.backgroundType,
    additionalNotes: input.additionalNotes,
  });

  // Variation 2 — different emphasis for DeepAI
  const deepaiVariation = buildDeepAILogoPrompt({
    brandName: input.brandName,
    tagline: input.tagline,
    industry: input.industry,
    targetAudience: input.targetAudience,
    personality: input.personality
      ? `${input.personality}, luxurious, premium`
      : "luxurious, premium",
    colors: input.colors,
    logoStyle: input.logoStyle
      ? `${input.logoStyle}, 3D metallic`
      : "3D metallic, futuristic",
    iconPreference: input.iconPreference,
    backgroundType: input.backgroundType,
    additionalNotes: input.additionalNotes
      ? `${input.additionalNotes}. Focus on typography and lettering.`
      : "Focus on typography and lettering.",
  });

  return {
    replicatePrompt,
    replicateVariation,
    deepaiPrompt,
    deepaiVariation,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: LogoBriefInput = await request.json();
    const { brandName } = body;

    if (!brandName?.trim()) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    const prompts = buildPromptVariations(body);

    // Fire all 4 requests in parallel — Replicate x2 + DeepAI x2
    const results = await Promise.allSettled([
      generateWithReplicate(prompts.replicatePrompt),
      generateWithReplicate(prompts.replicateVariation),
      generateWithDeepAI(prompts.deepaiPrompt),
      generateWithDeepAI(prompts.deepaiVariation),
    ]);

    const providerNames = [
      "Flux.1 (Replicate)",
      "Flux.1 Variation (Replicate)",
      "DeepAI",
      "DeepAI Variation",
    ];

    const promptTexts = [
      prompts.replicatePrompt,
      prompts.replicateVariation,
      prompts.deepaiPrompt,
      prompts.deepaiVariation,
    ];

    interface ProLogoResult {
      id: string;
      imageUrl: string;
      provider: string;
      prompt: string;
      brandName: string;
      industry: string;
      style: string;
    }

    const logos: ProLogoResult[] = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value) {
        logos.push({
          id: `pro-logo-${Date.now()}-${i}`,
          imageUrl: result.value,
          provider: providerNames[i],
          prompt: promptTexts[i],
          brandName,
          industry: body.industry,
          style: body.logoStyle || "modern",
        });
      } else if (result.status === "rejected") {
        console.error(`${providerNames[i]} failed:`, result.reason);
      }
    });

    return NextResponse.json({
      logos,
      totalGenerated: logos.length,
      brief: body,
    });
  } catch (error) {
    console.error("Pro logo generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate logos. Please try again." },
      { status: 500 }
    );
  }
}
