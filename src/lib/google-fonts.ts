/**
 * Google Fonts API integration.
 * Dynamically loads fonts from Google Fonts CDN — no API key needed.
 */

const loadedFonts = new Set<string>();

/**
 * System fonts that don't need loading from Google Fonts.
 */
const SYSTEM_FONTS = new Set([
  "Inter", // Already loaded via next/font
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "system-ui",
]);

/**
 * Dynamically inject a Google Fonts <link> tag for the given font family.
 * Idempotent: calling it twice for the same font is a no-op.
 */
export function loadGoogleFont(fontFamily: string): void {
  if (typeof window === "undefined") return; // SSR guard
  if (SYSTEM_FONTS.has(fontFamily)) return;   // Already available
  if (loadedFonts.has(fontFamily)) return;     // Already loaded

  loadedFonts.add(fontFamily);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700;800&display=swap`;
  document.head.appendChild(link);
}

/**
 * Load multiple fonts at once.
 */
export function loadGoogleFonts(fonts: string[]): void {
  fonts.forEach(loadGoogleFont);
}

/**
 * All font families used in the app — preload these for the generate grid.
 */
export const ALL_LOGO_FONTS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "Raleway",
  "Quicksand",
  "Oswald",
  "Bebas Neue",
  "Cormorant",
  "Cinzel",
  "Pacifico",
  "Nunito",
  "Ubuntu",
  "Roboto Mono",
  "Lato",
  "Roboto",
  "Open Sans",
];

/**
 * Preload all fonts used by the logo generator.
 */
export function preloadAllFonts(): void {
  ALL_LOGO_FONTS.forEach(loadGoogleFont);
}
