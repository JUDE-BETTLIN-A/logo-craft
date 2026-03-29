import { LogoConcept, LogoStyle, LogoLayout, GenerateLogoRequest } from "./types";
import { generateId } from "./utils";

// ── Icon mapping by industry ──
const INDUSTRY_ICONS: Record<string, string[]> = {
  Technology: ["Monitor", "Cpu", "Code", "Wifi", "Zap", "Globe", "Layers", "Terminal"],
  Healthcare: ["Heart", "Activity", "Stethoscope", "Shield", "Cross", "Pill"],
  Education: ["BookOpen", "GraduationCap", "Lightbulb", "PenTool", "Award"],
  Finance: ["DollarSign", "TrendingUp", "BarChart", "PieChart", "Wallet", "Landmark"],
  "Food & Beverage": ["Coffee", "UtensilsCrossed", "Cherry", "Soup", "Wine"],
  Fashion: ["Shirt", "Scissors", "Gem", "Crown", "Sparkles"],
  "Real Estate": ["Home", "Building", "MapPin", "Key", "Landmark"],
  "Sports & Fitness": ["Dumbbell", "Trophy", "Target", "Flame", "Timer"],
  Travel: ["Plane", "Map", "Compass", "Globe", "Anchor", "Mountain"],
  Entertainment: ["Music", "Film", "Camera", "Gamepad", "Star", "Tv"],
  Consulting: ["Briefcase", "Users", "Target", "TrendingUp", "Lightbulb"],
  Construction: ["Hammer", "HardHat", "Wrench", "Building", "Ruler"],
  Automotive: ["Car", "Gauge", "Wrench", "Fuel", "Settings"],
  "Beauty & Spa": ["Flower", "Sparkles", "Heart", "Droplet", "Sun"],
  Photography: ["Camera", "Aperture", "Image", "Focus", "Eye"],
  Music: ["Music", "Headphones", "Radio", "Mic", "Volume2"],
  Legal: ["Scale", "Shield", "BookOpen", "Gavel", "FileText"],
  Agriculture: ["Leaf", "Sprout", "Sun", "Cloud", "TreeDeciduous"],
  "Non-Profit": ["Heart", "HandHelping", "Globe", "Users", "Ribbon"],
  "E-Commerce": ["ShoppingCart", "Package", "CreditCard", "Store", "Tag"],
};

// ── Color palettes — each is [primary, secondary, bg] ──
const STYLE_COLORS: Record<LogoStyle, string[][]> = {
  modern: [
    ["#2563EB", "#3B82F6", "#FFFFFF"],
    ["#0F172A", "#334155", "#F8FAFC"],
    ["#7C3AED", "#8B5CF6", "#F5F3FF"],
    ["#0891B2", "#06B6D4", "#ECFEFF"],
    ["#4F46E5", "#818CF8", "#EEF2FF"],
    ["#DC2626", "#EF4444", "#FFFFFF"],
    ["#059669", "#10B981", "#F0FDF4"],
  ],
  classic: [
    ["#1E3A5F", "#C0A062", "#F5F0E1"],
    ["#8B0000", "#D4AF37", "#FFF8DC"],
    ["#2F4F4F", "#B8860B", "#FAFAD2"],
    ["#1A1A2E", "#C9B037", "#F7F3E3"],
    ["#3D0C02", "#B5651D", "#FFF5EB"],
  ],
  minimalist: [
    ["#000000", "#666666", "#FFFFFF"],
    ["#1A1A2E", "#404040", "#FAFAFA"],
    ["#2D3436", "#636E72", "#F5F5F5"],
    ["#111827", "#9CA3AF", "#FFFFFF"],
    ["#18181B", "#52525B", "#FAFAFA"],
  ],
  bold: [
    ["#FF0000", "#FF4500", "#FFF5F5"],
    ["#FF6B00", "#FF8C00", "#FFFBEB"],
    ["#DC2626", "#EA580C", "#FFFFFF"],
    ["#BE123C", "#F43F5E", "#FFF1F2"],
    ["#7C2D12", "#EA580C", "#FFF7ED"],
  ],
  elegant: [
    ["#1B1B2F", "#C0A062", "#F9F6F0"],
    ["#2C3E50", "#BDC3C7", "#FFFFFF"],
    ["#4A0E4E", "#C39BD3", "#FAF5FF"],
    ["#1F2937", "#D4AF37", "#FFFBEB"],
    ["#312E81", "#A78BFA", "#F5F3FF"],
  ],
  playful: [
    ["#FF6B6B", "#4ECDC4", "#FFFFF0"],
    ["#A8E6CF", "#FFD3B6", "#FFFFFF"],
    ["#F38181", "#FCE38A", "#FFFFFF"],
    ["#6C5CE7", "#FD79A8", "#FFFFFF"],
    ["#00B894", "#FDCB6E", "#FFFFFF"],
  ],
  geometric: [
    ["#00B4D8", "#0077B6", "#F0F9FF"],
    ["#E63946", "#457B9D", "#F1FAEE"],
    ["#2B2D42", "#8D99AE", "#EDF2F4"],
    ["#F72585", "#7209B7", "#F5F3FF"],
    ["#023E8A", "#0096C7", "#CAF0F8"],
  ],
  vintage: [
    ["#8B4513", "#D2691E", "#FFF8F0"],
    ["#704214", "#C19A6B", "#FAEBD7"],
    ["#556B2F", "#8FBC8F", "#FFFFF0"],
    ["#800020", "#CD853F", "#FFF5EB"],
    ["#2F4F4F", "#BC8F8F", "#FFF0F5"],
  ],
  tech: [
    ["#00FF87", "#0A0F1C", "#F0FDF4"],
    ["#7B61FF", "#1A1A2E", "#F5F3FF"],
    ["#00F5FF", "#0D1117", "#ECFEFF"],
    ["#8B5CF6", "#06B6D4", "#FFFFFF"],
    ["#10B981", "#1E293B", "#F0FDF4"],
  ],
  organic: [
    ["#2D6A4F", "#52B788", "#F0FDF4"],
    ["#606C38", "#283618", "#FEFAE0"],
    ["#386641", "#6A994E", "#F7FEE7"],
    ["#14532D", "#86EFAC", "#F0FDF4"],
    ["#365314", "#84CC16", "#F7FEE7"],
  ],
};

// ── Fonts per style ──
const STYLE_FONTS: Record<LogoStyle, string[]> = {
  modern: ["Inter", "Poppins", "Montserrat", "DM Sans", "Outfit"],
  classic: ["Playfair Display", "Merriweather", "Lora", "Crimson Text", "EB Garamond"],
  minimalist: ["Inter", "Raleway", "Quicksand", "Work Sans", "Karla"],
  bold: ["Oswald", "Bebas Neue", "Montserrat", "Archivo Black", "Anton"],
  elegant: ["Playfair Display", "Cormorant", "Cinzel", "Bodoni Moda", "DM Serif Display"],
  playful: ["Pacifico", "Quicksand", "Nunito", "Fredoka", "Baloo 2"],
  geometric: ["Montserrat", "Raleway", "Ubuntu", "Rubik", "Outfit"],
  vintage: ["Playfair Display", "Merriweather", "Lora", "Old Standard TT", "Libre Baskerville"],
  tech: ["Ubuntu", "Roboto Mono", "Inter", "JetBrains Mono", "Space Grotesk"],
  organic: ["Quicksand", "Nunito", "Lato", "Comfortaa", "Varela Round"],
};

// ── All layouts ──
const ALL_LAYOUTS: LogoLayout[] = [
  "lettermark", "initial-top", "initial-left",
  "icon-left", "icon-top", "icon-right", "stacked",
  "wordmark", "monogram", "emblem", "badge", "minimal", "split",
];

// ── Per-style layout pools (letter-based layouts heavily weighted) ──
const STYLE_LAYOUTS: Record<LogoStyle, LogoLayout[]> = {
  modern:     ["lettermark", "initial-top", "initial-left", "icon-left", "minimal", "wordmark"],
  classic:    ["lettermark", "initial-top", "emblem", "badge", "stacked", "icon-top"],
  minimalist: ["lettermark", "initial-left", "wordmark", "minimal", "monogram", "icon-left"],
  bold:       ["lettermark", "initial-top", "icon-left", "badge", "split", "wordmark"],
  elegant:    ["lettermark", "initial-top", "initial-left", "emblem", "wordmark", "monogram"],
  playful:    ["lettermark", "initial-top", "icon-left", "stacked", "split", "badge"],
  geometric:  ["lettermark", "initial-left", "badge", "emblem", "icon-top", "minimal"],
  vintage:    ["lettermark", "initial-top", "emblem", "badge", "stacked", "icon-top"],
  tech:       ["lettermark", "initial-left", "minimal", "monogram", "split", "wordmark"],
  organic:    ["lettermark", "initial-top", "icon-top", "stacked", "emblem", "wordmark"],
};

// ── Icon shapes per style ──
type IconShape = "none" | "circle" | "rounded-square" | "hexagon" | "shield" | "diamond";
const STYLE_ICON_SHAPES: Record<LogoStyle, IconShape[]> = {
  modern:     ["none", "rounded-square", "circle"],
  classic:    ["circle", "shield", "none"],
  minimalist: ["none", "none", "circle"],
  bold:       ["none", "rounded-square", "diamond"],
  elegant:    ["circle", "none", "diamond"],
  playful:    ["circle", "rounded-square", "none"],
  geometric:  ["hexagon", "diamond", "rounded-square"],
  vintage:    ["circle", "shield", "none"],
  tech:       ["hexagon", "rounded-square", "none"],
  organic:    ["circle", "none", "rounded-square"],
};

// ── Dividers ──
type Divider = "none" | "line" | "dot" | "diamond" | "slash";
const DIVIDERS: Divider[] = ["none", "none", "none", "line", "dot", "diamond"];

// ── Letter spacing options ──
const LETTER_SPACINGS = [0, 0.05, 0.1, 0.15, 0.2, 0.3];

// ── Font weights per style ──
const STYLE_WEIGHTS: Record<LogoStyle, number[]> = {
  modern:     [500, 600, 700],
  classic:    [400, 600, 700],
  minimalist: [300, 400, 500],
  bold:       [700, 800, 900],
  elegant:    [400, 500, 600],
  playful:    [600, 700, 800],
  geometric:  [500, 600, 700],
  vintage:    [400, 600, 700],
  tech:       [400, 500, 600],
  organic:    [400, 500, 600],
};

// ── Dark background colors ──
const DARK_BACKGROUNDS = [
  "#1C1C26", "#2D2D3A", "#1A1A2E", "#0F172A", "#1E293B",
  "#18181B", "#27272A", "#292524", "#1C1917", "#0C0A09",
  "#3B0764", "#4A0E4E", "#1E3A5F", "#2F4F4F", "#3D0C02",
];

// ── Helpers ──
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Lighten or darken a hex color */
function adjustColor(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(h.substring(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(h.substring(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(h.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Main generator ──
export function generateLogoConcepts(request: GenerateLogoRequest, count: number = 20): LogoConcept[] {
  const { businessName, industry, style, keywords } = request;
  const styles: LogoStyle[] = style
    ? [style]
    : shuffleArray(["modern", "classic", "minimalist", "bold", "elegant", "playful", "geometric", "vintage", "tech", "organic"] as LogoStyle[]);

  const icons = INDUSTRY_ICONS[industry] || INDUSTRY_ICONS["Technology"];
  const logos: LogoConcept[] = [];
  const usedLayouts = new Set<string>();

  // Generate a tagline from keywords (like BrandCrowd's "SLOGAN HERE")
  const tagline = keywords || "SLOGAN HERE";

  for (let i = 0; i < count; i++) {
    const currentStyle = styles[i % styles.length];
    const colorOptions = STYLE_COLORS[currentStyle];
    const colorSet = pickRandom(colorOptions);
    const layoutOptions = STYLE_LAYOUTS[currentStyle];

    // Pick layout with diversity guarantee
    let layout: LogoLayout;
    const unseenLayouts = layoutOptions.filter((l) => !usedLayouts.has(l));
    if (unseenLayouts.length > 0 && i < layoutOptions.length) {
      layout = unseenLayouts[0];
    } else {
      layout = pickRandom(layoutOptions);
    }
    usedLayouts.add(layout);

    const iconShape = pickRandom(STYLE_ICON_SHAPES[currentStyle]);
    const letterSpacing = pickRandom(LETTER_SPACINGS);
    const fontWeight = pickRandom(STYLE_WEIGHTS[currentStyle]);
    const divider = ["wordmark", "monogram", "lettermark", "initial-top", "initial-left"].includes(layout) ? "none" : pickRandom(DIVIDERS);
    const accentColor = adjustColor(colorSet[0], 40);

    // BrandCrowd-style: varied backgrounds — 40% dark, 30% white, 30% colored
    let bgColor: string;
    let textClr: string;
    let iconClr: string;

    const bgRand = Math.random();
    if (bgRand < 0.4) {
      // Dark background
      bgColor = pickRandom(DARK_BACKGROUNDS);
      textClr = "#FFFFFF";
      iconClr = colorSet[0];
    } else if (bgRand < 0.7) {
      // Clean white
      bgColor = "#FFFFFF";
      textClr = colorSet[0];
      iconClr = colorSet[1] || colorSet[0];
    } else {
      // Tinted / colored background
      bgColor = colorSet[2] || "#F8FAFC";
      textClr = colorSet[0];
      iconClr = colorSet[1] || colorSet[0];
    }

    logos.push({
      id: generateId(),
      name: `${businessName} Logo ${i + 1}`,
      businessName,
      tagline,
      industry,
      style: currentStyle,
      colors: colorSet,
      fontFamily: pickRandom(STYLE_FONTS[currentStyle]),
      iconName: pickRandom(icons),
      layout,
      backgroundColor: bgColor,
      textColor: textClr,
      iconColor: iconClr,
      createdAt: new Date(),
      iconShape,
      letterSpacing,
      fontWeight,
      divider,
      accentColor,
    });
  }

  return logos;
}
