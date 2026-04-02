/**
 * Unified AI Logo Generation — orchestrates ALL available AI models
 * (DeepInfra with Gemini prompts, Replicate Flux.1, DeepAI, and HuggingFace SDXL)
 * to produce maximum variety and highest quality emblem/badge-style logos.
 */

import { buildReplicateLogoPrompt, generateWithReplicate } from "@/lib/replicate";
import { buildDeepAILogoPrompt, generateWithDeepAI } from "@/lib/deepai";
import { buildLogoPrompt as buildHFPrompt, generateLogoImage as generateHFImage } from "@/lib/huggingface";

/* ─── Types ─── */

export interface LogoPromptInput {
  businessName: string;
  industry: string;
  keywords?: string;
  style?: string;
  tagline?: string;
  targetAudience?: string;
  personality?: string;
  colors?: string;
  iconPreference?: string;
  backgroundType?: string;
  additionalNotes?: string;
}

export interface AIGeneratedLogo {
  id: string;
  imageUrl: string;
  prompt: string;
  businessName: string;
  industry: string;
  style: string;
  styleName: string; // The backend provider/model used
}

/* ─── Logo Style Templates (for Gemini + DeepInfra) ─── */

// Industry-specific templates for highly relatable logos
const TECH_STYLE_TEMPLATES = [
  {
    name: "shield-circuit",
    description: 'A futuristic shield-based logo for "${name}". A sleek, modern shield shape with the first letter "${initial}" prominently inside. Circuit board trace patterns and data connection nodes emerging from the letter and shield edges. Blue-to-purple gradient (#3B82F6 to #8B5CF6) on the shield with cyan (#06B6D4) circuit highlights and glowing node dots. The full name "${name}" in bold, wide-spaced futuristic sans-serif typography below. Dark navy-to-black gradient background (#0F172A). Subtle blue lens flare glow underneath. Premium tech company branding.',
  },
  {
    name: "gradient-lettermark",
    description: 'A premium gradient lettermark logo for "${name}". The first letter "${initial}" designed as a large, bold 3D letterform with a flowing blue (#3B82F6) to violet (#8B5CF6) to cyan (#06B6D4) gradient. The letter has depth, subtle inner shadows, and a polished glass-like surface. Small geometric circuit/tech elements integrated into the letter design. The full name "${name}" in clean, modern uppercase sans-serif below with wide letter-spacing. Dark background (#0D1117) with subtle particle/star effects. Professional tech startup aesthetic.',
  },
  {
    name: "hexagonal-tech",
    description: 'A hexagonal technology logo for "${name}". A geometric hexagon frame with clean edges and a subtle glow effect. Inside: the first letter "${initial}" or a tech-related icon (circuit chip, code brackets, or network nodes). Color scheme: electric cyan (#00F5FF) and deep indigo (#4F46E5) on a dark background (#020617). Digital circuit traces connecting to the hexagon edges. The name "${name}" below in a sleek monospace or geometric sans-serif font. Futuristic, AI, blockchain, or software company feel.',
  },
  {
    name: "orbital-ring",
    description: 'A dynamic orbital ring logo for "${name}". The first letter "${initial}" at the center with one or two elliptical orbital rings circling around it at dynamic angles, like electron orbits. The rings have a gradient from blue (#2563EB) to emerald (#10B981). Small glowing dots on the orbits representing data or nodes. The name "${name}" in clean modern typography below. Dark space-like background (#0F172A). Innovation, AI, cloud computing, or SaaS brand feel.',
  },
  {
    name: "code-bracket-mark",
    description: 'A developer-focused code bracket logo for "${name}". Stylized angle brackets < > or curly braces { } framing the first letter "${initial}" or a simple tech symbol. Clean, geometric design with sharp edges. Gradient from indigo (#6366F1) to sky blue (#0EA5E9). The name "${name}" in a JetBrains Mono or similar monospace/geometric font below. Either dark (#111827) or clean white background. Developer tools, software, or coding platform aesthetic. Minimal, modern, precise.',
  },
];

const GENERAL_STYLE_TEMPLATES = [
  {
    name: "circular-emblem",
    description: 'A premium circular emblem logo. Thick circular border frame with depth, shadow and 3D effect. The name "${name}" in bold serif curved along the top inside the ring. A richly detailed illustration in the center related to ${industry} — realistic shading, warm tones. A short tagline curved along the bottom. Color palette appropriate for ${industry}. Clean background.',
  },
  {
    name: "3d-metallic",
    description: 'A sleek 3D metallic logo mark for "${name}". The first letter of the name rendered as a large chrome/brushed-steel 3D letterform with realistic reflections and highlights, floating above a subtle shadow. The full name "${name}" in clean thin sans-serif below. Cool palette: silver, gunmetal gray, with one accent color appropriate for ${industry}. Dark charcoal background. Professional brand.',
  },
  {
    name: "line-art-gradient",
    description: 'A minimalist single-line continuous line art logo for "${name}". A single elegant unbroken line drawing of an object or symbol specifically related to ${industry}, drawn in a modern geometric style. The line has a gradient color shifting from electric violet to hot coral. The name "${name}" in a lightweight geometric sans-serif font below. Tons of white space. Clean, airy, premium minimalist design. Pure white background.',
  },
  {
    name: "neon-glow",
    description: 'A vibrant neon glow sign logo for "${name}". The business name rendered as a glowing neon sign with a bright neon tube effect — choose from electric blue, hot pink, or lime green glow. Realistic neon tube bends with light bloom, reflections, and a subtle haze. A small neon icon specifically related to ${industry} above the text. Dark midnight background. Modern urban feel.',
  },
  {
    name: "geometric-mosaic",
    description: 'A bold geometric mosaic logo for "${name}". An abstract symbol specifically related to ${industry} constructed entirely from geometric triangles, hexagons, and polygons in a low-poly/faceted style. Each polygon face has a different shade creating a gradient 3D effect. Vibrant palette appropriate for ${industry}. The name "${name}" in a strong bold geometric sans-serif below. White background.',
  },
];

// Select templates based on industry for more relatable results
function getTemplatesForIndustry(industry: string): typeof GENERAL_STYLE_TEMPLATES {
  const ind = industry.toLowerCase();
  if (ind.includes("tech") || ind === "technology" || ind.includes("software") || ind.includes("e-commerce")) {
    // Mix tech-specific and general templates — heavily favor tech
    return [...TECH_STYLE_TEMPLATES, ...GENERAL_STYLE_TEMPLATES.slice(0, 2)];
  }
  // Other industries: use general templates (can add more industry-specific ones later)
  return GENERAL_STYLE_TEMPLATES;
}

/* ─── Gemini Prompt Generation ─── */
async function generatePromptWithGemini(
  input: LogoPromptInput,
  styleIndex: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const templates = getTemplatesForIndustry(input.industry || "Technology");
  const template = templates[styleIndex % templates.length];

  const initial = input.businessName.charAt(0).toUpperCase();
  const styleDesc = template.description
    .replace(/\$\{name\}/g, input.businessName)
    .replace(/\$\{initial\}/g, initial)
    .replace(/\$\{industry\}/g, input.industry || "business");

  if (!apiKey) return buildFallbackPrompt(input, styleDesc);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a world-class creative director and logo designer. Generate a vivid, highly detailed Stable Diffusion XL prompt that will produce a stunning, unique logo image.

BUSINESS: "${input.businessName}"
INDUSTRY: ${input.industry}
${input.keywords ? `KEYWORDS: ${input.keywords}` : ""}
${input.tagline ? `TAGLINE: ${input.tagline}` : ""}
${input.personality ? `BRAND PERSONALITY: ${input.personality}` : ""}
${input.colors ? `COLOR PREFERENCES: ${input.colors}` : ""}
${input.style ? `STYLE NOTE: ${input.style}` : ""}
${input.iconPreference ? `ICON/SYMBOL PREFERENCE: ${input.iconPreference}` : ""}

CREATIVE DIRECTION (follow this visual style closely):
${styleDesc}

RULES:
1. Follow the creative direction above precisely — this defines the entire visual feel
2. Describe exact shapes, materials, textures, lighting, shadows, and color hex values
3. Make the design feel like a premium brand identity by a top design agency
4. End with quality tags: "professional logo design, ultra detailed, sharp edges, 4k"
5. The output should be between 80-150 words
6. Output ONLY the raw prompt — no labels, no markdown, no explanation`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.9, maxOutputTokens: 300 },
        }),
      }
    );

    if (!res.ok) return buildFallbackPrompt(input, styleDesc);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (text.length > 30) {
      let prompt = text;
      if (!prompt.toLowerCase().includes("4k")) prompt += ", ultra detailed, 4k quality";
      if (!prompt.toLowerCase().includes("white")) prompt += ", white outer background";
      return prompt;
    }
    return buildFallbackPrompt(input, styleDesc);
  } catch (err) {
    return buildFallbackPrompt(input, styleDesc);
  }
}

function buildFallbackPrompt(input: LogoPromptInput, styleDesc: string): string {
  const customStr = [input.keywords, input.personality, input.colors]
    .filter(Boolean)
    .join(", ");
  return `${styleDesc}. ${customStr ? `Themes: ${customStr}.` : ""} Professional logo design, ultra detailed, sharp vector edges, print-ready quality, 4k, white outer background, no blurry text, no distorted letters`;
}

/* ─── DeepInfra Image Generation (free SDXL) ─── */
const DEEPINFRA_URL = "https://api.deepinfra.com/v1/openai/images/generations";

async function generateImageWithDeepInfra(prompt: string, seed?: number): Promise<string | null> {
  try {
    const res = await fetch(DEEPINFRA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt + ". Do not include any text or letters in the image.",
        model: "stabilityai/sdxl-turbo",
        size: "1024x1024",
        n: 1,
        response_format: "b64_json",
        ...(seed !== undefined ? { seed } : {}),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    return b64 ? `data:image/jpeg;base64,${b64}` : null;
  } catch (err) {
    return null;
  }
}

/* ─── HuggingFace SDXL Handler ─── */
async function generateHuggingFaceWrapper(input: LogoPromptInput): Promise<string | null> {
  try {
    const prompt = buildHFPrompt({
      businessName: input.businessName,
      industry: input.industry,
      style: input.style || input.personality,
      colorHint: input.colors,
      keywords: input.keywords,
    });
    const buffer = await generateHFImage(prompt);
    const b64 = buffer.toString("base64");
    return `data:image/jpeg;base64,${b64}`;
  } catch (err) {
    // Gracefully fallback
    console.warn("HuggingFace fallback:", err);
    return null;
  }
}

/* ─── MAIN GENERATOR — Unified Multiple APIs ─── */

export async function generateAILogos(
  input: LogoPromptInput,
  count: number = 4
): Promise<AIGeneratedLogo[]> {
  const logos: AIGeneratedLogo[] = [];

  // DeepInfra tasks (using Gemini for intelligent random prompts)
  const templates = getTemplatesForIndustry(input.industry || "Technology");
  const deepInfraCount = Math.min(2, count); // Use up to 2 slots for DeepInfra
  const selectedStyleIndices: number[] = [];
  while (selectedStyleIndices.length < deepInfraCount) {
    const idx = Math.floor(Math.random() * templates.length);
    if (!selectedStyleIndices.includes(idx)) selectedStyleIndices.push(idx);
  }
  
  // Replicate + DeepAI params adapter
  const briefAdapter = {
    brandName: input.businessName,
    tagline: input.tagline,
    industry: input.industry,
    targetAudience: input.targetAudience,
    personality: input.personality,
    colors: input.colors,
    logoStyle: input.style,
    iconPreference: input.iconPreference,
    backgroundType: input.backgroundType,
    additionalNotes: input.additionalNotes || input.keywords,
  };

  const replicatePrompt = buildReplicateLogoPrompt(briefAdapter);
  const deepaiPrompt = buildDeepAILogoPrompt(briefAdapter);

  // Trigger all API requests in parallel!
  const promises = [
    // 1 & 2: Gemini + DeepInfra
    ...selectedStyleIndices.map(async (idx, i) => {
      const prompt = await generatePromptWithGemini(input, idx);
      const url = await generateImageWithDeepInfra(prompt, Math.floor(Math.random() * 999999));
      if (url) {
        logos.push({
          id: `deepinfra-${Date.now()}-${i}`,
          imageUrl: url,
          prompt,
          businessName: input.businessName,
          industry: input.industry,
          style: input.style || "modern",
          styleName: `DeepInfra (${templates[idx].name})`,
        });
      }
    }),
    
    // 3: Replicate (Flux.1)
    generateWithReplicate(replicatePrompt).then((url) => {
      if (url) {
        logos.push({
          id: `replicate-${Date.now()}`,
          imageUrl: url,
          prompt: replicatePrompt,
          businessName: input.businessName,
          industry: input.industry,
          style: input.style || "modern",
          styleName: "Flux.1 (Replicate)",
        });
      }
    }).catch(() => null),

    // 4: DeepAI
    generateWithDeepAI(deepaiPrompt).then((url) => {
      if (url) {
        logos.push({
          id: `deepai-${Date.now()}`,
          imageUrl: url,
          prompt: deepaiPrompt,
          businessName: input.businessName,
          industry: input.industry,
          style: input.style || "modern",
          styleName: "DeepAI",
        });
      }
    }).catch(() => null),

    // 5: HuggingFace SDXL
    generateHuggingFaceWrapper(input).then((url) => {
      if (url) {
        logos.push({
          id: `hf-${Date.now()}`,
          imageUrl: url,
          prompt: "HF SDXL Prompt",
          businessName: input.businessName,
          industry: input.industry,
          style: input.style || "modern",
          styleName: "HuggingFace SDXL",
        });
      }
    }).catch(() => null),
  ];

  // Wait for all to finish (or fail)
  await Promise.allSettled(promises);

  return logos;
}
