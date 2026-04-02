/**
 * DeepAI API integration — Text-to-Image generation for logo design.
 * Uses DeepAI's image generation endpoint with detailed logo prompts.
 */

const DEEPAI_API_URL = "https://api.deepai.org/api/text2img";

/**
 * Build a professional logo prompt optimized for DeepAI's image generation.
 */
export function buildDeepAILogoPrompt(options: {
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
}): string {
  const {
    brandName,
    tagline,
    industry,
    targetAudience,
    personality,
    colors,
    logoStyle,
    iconPreference,
    backgroundType,
    additionalNotes,
  } = options;

  const initial = brandName.charAt(0).toUpperCase();
  const ind = industry.toLowerCase();
  
  // Industry-specific visual elements
  let industryDesc = `in the ${industry} industry`;
  if (ind.includes("tech") || ind === "technology") {
    industryDesc = `in the technology industry. Incorporate tech-related design elements: the letter "${initial}" integrated with circuit board patterns, digital nodes, shield shapes, or code symbols. Use a blue (#3B82F6) to purple (#8B5CF6) color gradient. Futuristic, digital, innovative feel`;
  } else if (ind.includes("health")) {
    industryDesc = `in the healthcare industry. Include subtle medical elements like a cross, heart, or healing symbol`;
  } else if (ind.includes("finance")) {
    industryDesc = `in the finance industry. Include elements of growth, stability, and trust`;
  }

  const parts: string[] = [
    `Professional logo design for "${brandName}"`,
    tagline ? `with the tagline "${tagline}"` : "",
    industryDesc,
    targetAudience ? `designed for ${targetAudience}` : "",
    personality ? `brand personality: ${personality}` : "",
    colors ? `color palette: ${colors}` : "",
    logoStyle ? `${logoStyle} design style` : "modern clean design style",
    iconPreference && iconPreference !== "none"
      ? `featuring a ${iconPreference} icon`
      : "",
    backgroundType ? `on a ${backgroundType} background` : "on a dark navy background",
    additionalNotes || "",
    "professional branding, scalable vector-style, sharp edges",
    "centered composition, high quality, corporate grade",
    "suitable for business cards, websites, and marketing materials",
  ];

  return parts.filter(Boolean).join(". ");
}

/**
 * Generate a logo image using DeepAI's Text-to-Image API.
 * Returns the image URL from DeepAI's CDN.
 */
export async function generateWithDeepAI(
  prompt: string
): Promise<string | null> {
  const apiKey = process.env.DEEPAI_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPAI_API_KEY is not set");
  }

  try {
    const formData = new FormData();
    formData.append("text", prompt);
    formData.append("grid_size", "1");
    formData.append("width", "1024");
    formData.append("height", "1024");

    const response = await fetch(DEEPAI_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("DeepAI API error:", response.status, errorBody);
      throw new Error(`DeepAI API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.output_url) {
      return data.output_url;
    }

    console.error("DeepAI: no output_url in response", data);
    return null;
  } catch (err) {
    console.error("DeepAI generation failed:", err);
    return null;
  }
}
