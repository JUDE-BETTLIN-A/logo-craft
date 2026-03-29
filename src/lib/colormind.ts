/**
 * Colormind API integration.
 * AI-generated color palettes — no API key needed.
 * http://colormind.io/api/
 */

export interface ColorPalette {
  name: string;
  colors: string[];
}

/**
 * Convert an RGB array [r, g, b] to a hex string #RRGGBB.
 */
function rgbToHex(rgb: number[]): string {
  return "#" + rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

/**
 * Fetch a random AI-generated color palette from Colormind.
 * Returns 5 harmonious colors.
 */
export async function generateAIPalette(): Promise<string[]> {
  try {
    const res = await fetch("http://colormind.io/api/", {
      method: "POST",
      body: JSON.stringify({ model: "default" }),
    });
    const data = await res.json();
    // data.result is [[r,g,b], [r,g,b], [r,g,b], [r,g,b], [r,g,b]]
    return (data.result as number[][]).map(rgbToHex);
  } catch (error) {
    console.warn("Colormind API failed, using fallback palette:", error);
    return fallbackPalette();
  }
}

/**
 * Generate a palette with a seed color locked in.
 * Pass the seed color as [r, g, b] at any position.
 * Other positions should be "N" to let the API fill them.
 */
export async function generatePaletteWithSeed(seedHex: string): Promise<string[]> {
  try {
    const rgb = hexToRgb(seedHex);
    const input = ["N", "N", rgb, "N", "N"];

    const res = await fetch("http://colormind.io/api/", {
      method: "POST",
      body: JSON.stringify({ model: "default", input }),
    });
    const data = await res.json();
    return (data.result as number[][]).map(rgbToHex);
  } catch (error) {
    console.warn("Colormind seed palette failed:", error);
    return fallbackPalette();
  }
}

/**
 * Generate multiple palettes at once.
 */
export async function generateMultiplePalettes(count: number = 5): Promise<ColorPalette[]> {
  const names = ["Harmony", "Vivid", "Calm", "Contrast", "Fresh", "Warm", "Cool", "Bold", "Soft", "Deep"];
  const palettes: ColorPalette[] = [];

  for (let i = 0; i < count; i++) {
    const colors = await generateAIPalette();
    palettes.push({
      name: names[i % names.length],
      colors,
    });
  }

  return palettes;
}

function hexToRgb(hex: string): number[] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function fallbackPalette(): string[] {
  const fallbacks = [
    ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
    ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],
    ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"],
    ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#6FFFE9"],
    ["#2B2D42", "#8D99AE", "#EDF2F4", "#EF233C", "#D90429"],
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
