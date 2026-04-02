/**
 * Replicate API integration — Flux.1 Schnell model for fast, high-quality logo generation.
 * Flux.1 is significantly better at rendering text/typography than SDXL.
 */

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

interface ReplicateInput {
  prompt: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  go_fast?: boolean;
  megapixels?: string;
  output_format?: string;
  output_quality?: number;
  num_inference_steps?: number;
}

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string[];
  error?: string;
  urls?: { get: string; cancel: string };
}

/**
 * Build a professional logo prompt from the structured input fields.
 */
export function buildReplicateLogoPrompt(options: {
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
  
  // Industry-specific visual direction
  let industryVisual = `for a ${industry} company`;
  if (ind.includes("tech") || ind === "technology") {
    industryVisual = `for a technology company. The logo should incorporate tech-related visual elements such as circuit board traces, digital nodes, code brackets, shield shapes, or hexagonal frames. Feature the letter "${initial}" prominently with a blue-to-purple gradient (#3B82F6 to #8B5CF6). The design should feel futuristic, innovative, and digital`;
  } else if (ind.includes("health")) {
    industryVisual = `for a healthcare company. Include medical-themed elements like a cross, heartbeat line, or caduceus subtly integrated into the design`;
  } else if (ind.includes("finance")) {
    industryVisual = `for a finance company. Include elements suggesting growth, stability, and trust such as upward arrows, shield shapes, or geometric patterns`;
  }

  const parts: string[] = [
    `A professional, high-quality logo design for "${brandName}"`,
    tagline ? `with tagline "${tagline}"` : "",
    industryVisual,
    targetAudience ? `targeting ${targetAudience}` : "",
    personality ? `with a ${personality} brand personality` : "",
    colors ? `using ${colors} color scheme` : "",
    logoStyle ? `in ${logoStyle} style` : "in a modern minimalist style",
    iconPreference && iconPreference !== "none"
      ? `incorporating a ${iconPreference} symbol/icon`
      : "",
    backgroundType ? `${backgroundType} background` : "dark navy background (#0F172A)",
    additionalNotes || "",
    "clean, scalable, professional logo design",
    "strong contrast and readability",
    "vector-style design, centered composition",
    "high resolution, suitable for websites, apps, and social media",
    "no watermark, no extra text beyond the brand name",
  ];

  return parts.filter(Boolean).join(", ");
}

/**
 * Create a prediction on Replicate using the Flux.1 Schnell model.
 * Returns the prediction ID for polling.
 */
async function createPrediction(prompt: string): Promise<ReplicatePrediction> {
  const apiKey = process.env.REPLICATE_API_KEY;

  if (!apiKey) {
    throw new Error("REPLICATE_API_KEY is not set");
  }

  const response = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      version:
        "2cf1edbe078e1b0b155c22aeb4ca0a80c4f63bbcad8d327b1eb3d95c95ea4f98",
      input: {
        prompt,
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 90,
        num_inference_steps: 4,
      } as ReplicateInput,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Replicate API error:", response.status, errorBody);
    throw new Error(`Replicate API error: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

/**
 * Poll a prediction until it completes.
 */
async function pollPrediction(
  predictionUrl: string
): Promise<ReplicatePrediction> {
  const apiKey = process.env.REPLICATE_API_KEY;

  for (let i = 0; i < 60; i++) {
    const res = await fetch(predictionUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      throw new Error(`Poll error: ${res.status}`);
    }

    const prediction: ReplicatePrediction = await res.json();

    if (prediction.status === "succeeded") {
      return prediction;
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(
        `Prediction ${prediction.status}: ${prediction.error || "unknown"}`
      );
    }

    // Wait 1 second before polling again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Prediction timed out after 60 seconds");
}

/**
 * Generate a logo image using Replicate's Flux.1 Schnell model.
 * Returns the image URL.
 */
export async function generateWithReplicate(
  prompt: string
): Promise<string | null> {
  try {
    const prediction = await createPrediction(prompt);

    // If the Prefer: wait header worked, we already have the result
    if (prediction.status === "succeeded" && prediction.output?.[0]) {
      return prediction.output[0];
    }

    // Otherwise, poll for the result
    if (prediction.urls?.get) {
      const completed = await pollPrediction(prediction.urls.get);
      return completed.output?.[0] || null;
    }

    return null;
  } catch (err) {
    console.error("Replicate generation failed:", err);
    return null;
  }
}
