/**
 * Hugging Face Inference API integration.
 * Generates AI logo images using Stable Diffusion XL.
 * Server-side only — the API key must not be exposed to the client.
 */

const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

/**
 * Build a prompt optimized for logo generation.
 */
export function buildLogoPrompt(options: {
  businessName: string;
  industry?: string;
  style?: string;
  colorHint?: string;
  keywords?: string;
}): string {
  const { businessName, industry, style, colorHint, keywords } = options;

  const parts = [
    "A professional, high-quality logo design",
    `for a ${industry || "technology"} company called "${businessName}"`,
    style ? `in a ${style} style` : "",
    colorHint ? `using ${colorHint} color scheme` : "",
    keywords ? `incorporating themes of ${keywords}` : "",
    "minimalist, vector art style, clean lines, centered composition",
    "white background, suitable for business use",
    "no text, no watermark, sharp edges, modern branding",
  ];

  return parts.filter(Boolean).join(", ");
}

/**
 * Generate a logo image via Hugging Face Inference API.
 * Returns the raw image bytes as a Buffer.
 */
export async function generateLogoImage(prompt: string): Promise<Buffer> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set");
  }

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        width: 512,
        height: 512,
        guidance_scale: 7.5,
        num_inference_steps: 30,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("HuggingFace API error:", response.status, errorBody);

    // Model is loading — tell the client to retry
    if (response.status === 503) {
      const parsed = JSON.parse(errorBody);
      const wait = parsed.estimated_time || 30;
      throw new Error(
        `MODEL_LOADING:${Math.ceil(wait)}`
      );
    }

    throw new Error(`Hugging Face API error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
