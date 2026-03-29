/**
 * AI Logo Generation — combines Google Gemini (smart prompt crafting)
 * with HuggingFace SDXL (image generation) to produce professional,
 * emblem/badge-style logo images.
 *
 * Target quality: circular emblem logos with business name, central
 * illustration, tagline, textured borders — like premium brand logos.
 */

/* ─── Types ─── */

interface LogoPromptInput {
  businessName: string;
  industry: string;
  keywords?: string;
  style?: string;
}

/* ─── Logo Style Templates — each one is a COMPLETELY DIFFERENT visual direction ─── */

const LOGO_STYLE_TEMPLATES = [
  // 0 — Classic wooden circular emblem
  {
    name: "circular-emblem",
    description:
      'A premium circular emblem logo. Thick wooden-textured or leather-textured circular border frame with depth, shadow and 3D effect. The name "${name}" in bold serif curved along the top inside the ring. A richly detailed illustration in the center related to ${industry} — realistic shading, warm tones. A short tagline curved along the bottom. Color palette: burnt sienna, deep brown, cream, golden amber. White outer background.',
  },
  // 1 — 3D metallic floating logo
  {
    name: "3d-metallic",
    description:
      'A sleek 3D metallic logo mark for "${name}". The first letter of the name rendered as a large chrome/brushed-steel 3D letterform with realistic reflections and highlights, floating above a subtle shadow. The full name "${name}" in clean thin sans-serif below. Cool palette: silver, gunmetal gray, with one electric blue accent. Dark charcoal background. Futuristic but professional, like a tech startup brand.',
  },
  // 2 — Watercolor splash art logo
  {
    name: "watercolor-splash",
    description:
      'An artistic watercolor splash style logo for "${name}". Fluid, organic watercolor paint splashes and drips forming a beautiful abstract shape related to ${industry}. Vibrant blending colors — coral pink, ocean teal, golden yellow, lavender purple — bleeding into each other. The name "${name}" in a clean modern sans-serif overlaid on top in dark charcoal. Creative, artistic, gallery-quality feel. Clean white background.',
  },
  // 3 — Minimalist line-art with gradient
  {
    name: "line-art-gradient",
    description:
      'An ultra-minimalist single-line continuous line art logo for "${name}". A single elegant unbroken line drawing of an object or symbol related to ${industry}, drawn in a modern geometric style. The line has a gradient color shifting from electric violet to hot coral. The name "${name}" in a lightweight geometric sans-serif font below. Tons of white space. Clean, airy, premium minimalist design. Pure white background.',
  },
  // 4 — Japanese/Zen ink stamp
  {
    name: "zen-stamp",
    description:
      'A Japanese-inspired ink stamp (hanko/chop) style logo for "${name}". A bold vermillion red square or circular stamp with the business initial or a symbolic icon carved in negative space. Brush-stroke texture and slight ink bleed effect. The name "${name}" in elegant thin lettering beside or below the stamp. Accents of charcoal black and gold. Zen, calm, refined aesthetic. Off-white/cream rice paper textured background.',
  },
  // 5 — Neon glow cyberpunk
  {
    name: "neon-glow",
    description:
      'A vibrant neon glow sign logo for "${name}". The business name rendered as a glowing neon sign with a bright neon tube effect — choose from electric blue, hot pink, or lime green glow. Realistic neon tube bends with light bloom, reflections, and a subtle haze. A small neon icon related to ${industry} above the text. Dark midnight background. Cyberpunk, nightlife, modern urban feel.',
  },
  // 6 — Vintage botanical illustration
  {
    name: "botanical-vintage",
    description:
      'A vintage botanical illustration logo for "${name}". Detailed hand-drawn engraving-style botanical elements — leaves, flowers, branches — forming an elegant wreath or frame. Scientific illustration detail with fine line hatching. The name "${name}" in ornate vintage serif typography at the center. Muted earth tones: olive green, dusty rose, antique gold, aged cream. Apothecary/artisanal luxury feel. Aged parchment white background.',
  },
  // 7 — Abstract geometric mosaic
  {
    name: "geometric-mosaic",
    description:
      'A bold geometric mosaic logo for "${name}". An abstract animal, object, or symbol related to ${industry} constructed entirely from geometric triangles, hexagons, and polygons in a low-poly/faceted style. Each polygon face has a different shade creating a gradient 3D effect. Vibrant palette: deep teal, electric orange, warm yellow, rich purple. The name "${name}" in a strong bold geometric sans-serif below. White background.',
  },
  // 8 — Art Deco luxury
  {
    name: "art-deco",
    description:
      'An Art Deco style logo for "${name}". Strong geometric symmetry with radiating sunburst lines, chevron patterns, and stepped pyramid shapes. Bold gold metallic elements on deep navy blue or black. The name "${name}" in an Art Deco display typeface with inline detailing. Ornamental geometric border frame. Roaring 20s glamour and luxury. 1920s poster design aesthetic. Clean outer background.',
  },
  // 9 — Sticker/mascot character
  {
    name: "mascot-sticker",
    description:
      'A fun illustrated mascot/character logo for "${name}". A cute, friendly cartoon character or animal mascot related to ${industry} — expressive eyes, dynamic pose, bold outlines. The character is holding or interacting with an object from the industry. Bright, saturated pop colors with thick black outlines like a vinyl sticker. The name "${name}" in a playful rounded bold font. White background. Fun, approachable, memorable brand identity.',
  },
];

/* ─── Gemini Prompt Generation ─── */

/**
 * Use Gemini to craft a high-quality, detailed SDXL prompt
 * that produces emblem/badge-style logos similar to the reference image.
 */
async function generatePromptWithGemini(
  input: LogoPromptInput,
  styleIndex: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const template = LOGO_STYLE_TEMPLATES[styleIndex % LOGO_STYLE_TEMPLATES.length];

  // Fill template placeholders
  const styleDesc = template.description
    .replace(/\$\{name\}/g, input.businessName)
    .replace(/\$\{industry\}/g, input.industry || "business");

  if (!apiKey) {
    return buildFallbackPrompt(input, styleDesc);
  }

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
${input.style ? `STYLE NOTE: ${input.style}` : ""}

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
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("Gemini API error:", res.status, await res.text());
      return buildFallbackPrompt(input, styleDesc);
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (text.length > 30) {
      // Append quality boosters if missing
      let prompt = text;
      if (!prompt.toLowerCase().includes("4k")) {
        prompt += ", ultra detailed, 4k quality";
      }
      if (!prompt.toLowerCase().includes("white")) {
        prompt += ", white outer background";
      }
      return prompt;
    }
    return buildFallbackPrompt(input, styleDesc);
  } catch (err) {
    console.error("Gemini prompt generation failed:", err);
    return buildFallbackPrompt(input, styleDesc);
  }
}

/** Fallback prompt when Gemini is unavailable */
function buildFallbackPrompt(input: LogoPromptInput, styleDesc: string): string {
  return `${styleDesc}. ${input.keywords ? `Themes: ${input.keywords}.` : ""} Professional logo design, ultra detailed, sharp vector edges, print-ready quality, 4k, white outer background, no blurry text, no distorted letters`;
}

/* ─── DeepInfra Image Generation (free, no API key required) ─── */

const DEEPINFRA_URL =
  "https://api.deepinfra.com/v1/openai/images/generations";

/**
 * Generate a logo image via DeepInfra's free SDXL-turbo endpoint.
 * No API key needed — completely free tier.
 */
async function generateImageWithDeepInfra(
  prompt: string,
  seed?: number
): Promise<string | null> {
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

    if (!res.ok) {
      const body = await res.text();
      console.error("DeepInfra API error:", res.status, body);
      return null;
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      console.error("DeepInfra: no image data in response");
      return null;
    }

    return `data:image/jpeg;base64,${b64}`;
  } catch (err) {
    console.error("DeepInfra generation failed:", err);
    return null;
  }
}

/* ─── Public API ─── */

export interface AIGeneratedLogo {
  id: string;
  imageUrl: string;
  prompt: string;
  businessName: string;
  industry: string;
  style: string;
  styleName: string;
}

/**
 * Generate up to 4 AI logo images using Gemini + DeepInfra SDXL-turbo.
 *
 * Each logo uses a different style template producing
 * varied but consistently premium results.
 *
 * Non-blocking — failures are silently skipped.
 */
export async function generateAILogos(
  input: LogoPromptInput,
  count: number = 4
): Promise<AIGeneratedLogo[]> {
  const effectiveCount = Math.min(count, LOGO_STYLE_TEMPLATES.length);

  // Pick random non-repeating style indices
  const allIndices = Array.from({ length: LOGO_STYLE_TEMPLATES.length }, (_, i) => i);
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }
  const selectedIndices = allIndices.slice(0, effectiveCount);

  // Generate prompts from Gemini in parallel
  const promptResults = await Promise.allSettled(
    selectedIndices.map((idx) => generatePromptWithGemini(input, idx))
  );

  // Collect successful prompts
  const promptsWithStyles: { prompt: string; styleIdx: number }[] = [];
  promptResults.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) {
      promptsWithStyles.push({ prompt: r.value, styleIdx: selectedIndices[i] });
    }
  });

  if (promptsWithStyles.length === 0) return [];

  // Generate images in parallel with unique seeds
  const baseSeed = Math.floor(Math.random() * 999999);
  const imageResults = await Promise.allSettled(
    promptsWithStyles.map((ps, i) =>
      generateImageWithDeepInfra(ps.prompt, baseSeed + i * 12345)
    )
  );

  const logos: AIGeneratedLogo[] = [];
  imageResults.forEach((result, i) => {
    if (result.status === "fulfilled" && result.value) {
      const ps = promptsWithStyles[i];
      const template = LOGO_STYLE_TEMPLATES[ps.styleIdx];
      logos.push({
        id: `ai-logo-${Date.now()}-${i}`,
        imageUrl: result.value,
        prompt: ps.prompt,
        businessName: input.businessName,
        industry: input.industry,
        style: input.style || "modern",
        styleName: template.name,
      });
    }
  });

  return logos;
}
