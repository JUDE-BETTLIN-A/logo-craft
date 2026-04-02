import { LogoConcept, LogoStyle, LogoLayout, GenerateLogoRequest } from "./types";
import { generateId } from "./utils";

// ── Keyword-to-icon mapping for relatability ──
// When a user types keywords, we match them to the most relevant icons
const KEYWORD_ICON_MAP: Record<string, string[]> = {
  // Tech keywords
  tech: ["Cpu", "Monitor", "Code", "Terminal", "Wifi", "Globe", "Layers", "Zap"],
  technology: ["Cpu", "Monitor", "Code", "Terminal", "Wifi", "Globe", "Layers", "Zap"],
  software: ["Code", "Terminal", "Layers", "Monitor", "Cpu", "Globe"],
  ai: ["Cpu", "Zap", "Sparkles", "Globe", "Layers"],
  digital: ["Monitor", "Globe", "Wifi", "Layers", "Code"],
  cloud: ["Globe", "Layers", "Wifi", "Shield"],
  cyber: ["Shield", "Code", "Terminal", "Cpu"],
  data: ["BarChart", "TrendingUp", "Layers", "Cpu"],
  code: ["Code", "Terminal", "Cpu", "Layers"],
  web: ["Globe", "Code", "Monitor", "Layers"],
  app: ["Monitor", "Layers", "Zap", "Sparkles"],
  startup: ["Zap", "TrendingUp", "Sparkles", "Target"],
  innovation: ["Lightbulb", "Zap", "Sparkles", "Star"],
  solutions: ["Shield", "Target", "Zap", "Layers"],
  
  // Business keywords
  consulting: ["Briefcase", "Users", "Target", "TrendingUp"],
  finance: ["DollarSign", "TrendingUp", "BarChart", "Shield"],
  business: ["Briefcase", "TrendingUp", "Target", "Users"],
  corporate: ["Building", "Briefcase", "Users", "Shield"],
  
  // Creative keywords
  design: ["PenTool", "Sparkles", "Crown", "Star"],
  creative: ["Sparkles", "Star", "PenTool", "Camera"],
  art: ["PenTool", "Camera", "Sparkles", "Star"],
  media: ["Film", "Camera", "Music", "Star"],
  photo: ["Camera", "Film", "Star", "Sparkles"],
  
  // Nature keywords
  eco: ["Leaf", "Globe", "Flower", "Sparkles"],
  green: ["Leaf", "Globe", "Flower", "Sparkles"],
  organic: ["Leaf", "Flower", "Globe", "Sparkles"],
  nature: ["Leaf", "Flower", "Mountain", "Globe"],
  
  // Power/energy keywords
  power: ["Zap", "Shield", "Star", "Flame"],
  energy: ["Zap", "Flame", "Star", "Sparkles"],
  fast: ["Zap", "Plane", "Target", "TrendingUp"],
  speed: ["Zap", "Plane", "Target", "TrendingUp"],
  
  // Security/trust keywords
  secure: ["Shield", "Key", "Code", "Globe"],
  security: ["Shield", "Key", "Code", "Globe"],
  trust: ["Shield", "Heart", "Star", "Award"],
  protect: ["Shield", "Key", "Star", "Globe"],
  
  // Premium keywords
  luxury: ["Crown", "Gem", "Star", "Sparkles"],
  premium: ["Crown", "Gem", "Star", "Award"],
  elite: ["Crown", "Star", "Award", "Trophy"],
  
  // Health keywords
  health: ["Heart", "Shield", "Star", "Sparkles"],
  medical: ["Heart", "Shield", "Star", "Sparkles"],
  wellness: ["Heart", "Flower", "Star", "Sparkles"],
  
  // Education keywords
  education: ["BookOpen", "Award", "Lightbulb", "Star"],
  learning: ["BookOpen", "Lightbulb", "Star", "Award"],
  school: ["BookOpen", "Award", "Star", "PenTool"],
  
  // Food keywords
  food: ["Coffee", "Star", "Heart", "Sparkles"],
  restaurant: ["Coffee", "Star", "Heart", "Sparkles"],
  
  // Default fallbacks for common words
  modern: ["Layers", "Zap", "Star", "Sparkles"],
  professional: ["Briefcase", "Shield", "Star", "Award"],
  global: ["Globe", "Map", "Compass", "Star"],
};

// ── Icon mapping by industry (enriched with more relatable icons) ──
const INDUSTRY_ICONS: Record<string, string[]> = {
  Technology: ["Cpu", "Code", "Terminal", "Globe", "Layers", "Zap", "Shield", "Monitor", "Wifi"],
  Healthcare: ["Heart", "Shield", "Star", "Sparkles", "Award"],
  Education: ["BookOpen", "Lightbulb", "PenTool", "Award", "Star"],
  Finance: ["DollarSign", "TrendingUp", "BarChart", "Shield", "Star"],
  "Food & Beverage": ["Coffee", "Star", "Heart", "Sparkles", "Crown"],
  Fashion: ["Gem", "Crown", "Sparkles", "Star", "PenTool"],
  "Real Estate": ["Home", "Building", "Key", "MapPin", "Star"],
  "Sports & Fitness": ["Dumbbell", "Trophy", "Target", "Star", "Zap"],
  Travel: ["Plane", "Globe", "Compass", "Map", "Star"],
  Entertainment: ["Music", "Film", "Camera", "Gamepad", "Star"],
  Consulting: ["Briefcase", "Users", "Target", "TrendingUp", "Lightbulb"],
  Construction: ["Hammer", "Building", "Wrench", "Star", "Shield"],
  Automotive: ["Zap", "Shield", "Star", "Wrench", "Target"],
  "Beauty & Spa": ["Flower", "Sparkles", "Heart", "Star", "Crown"],
  Photography: ["Camera", "Star", "Sparkles", "PenTool", "Film"],
  Music: ["Music", "Star", "Sparkles", "Heart", "Zap"],
  Legal: ["Shield", "Star", "BookOpen", "Award", "Scale"],
  Agriculture: ["Leaf", "Globe", "Star", "Sparkles", "Flower"],
  "Non-Profit": ["Heart", "Globe", "Users", "Star", "Award"],
  "E-Commerce": ["ShoppingCart", "Package", "Tag", "Star", "Zap"],
};

// ── Resolve icons from keywords + industry ──
function resolveIcons(industry: string, keywords?: string): string[] {
  const baseIcons = INDUSTRY_ICONS[industry] || INDUSTRY_ICONS["Technology"];
  
  if (!keywords) return baseIcons;
  
  const kws = keywords.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const keywordIcons: string[] = [];
  
  for (const kw of kws) {
    const mapped = KEYWORD_ICON_MAP[kw];
    if (mapped) {
      keywordIcons.push(...mapped);
    }
  }
  
  if (keywordIcons.length === 0) return baseIcons;
  
  // Merge: keyword icons first (most relevant), then industry icons
  const merged = [...new Set([...keywordIcons, ...baseIcons])];
  return merged;
}

// ── Color palettes — each is [primary, secondary, bg] ──
// Industry-aware palettes for more relatable colors
const INDUSTRY_COLOR_OVERRIDES: Record<string, string[][]> = {
  Technology: [
    ["#3B82F6", "#8B5CF6", "#0F172A"],  // Blue-purple gradient on dark
    ["#06B6D4", "#3B82F6", "#0D1117"],  // Cyan-blue on dark
    ["#8B5CF6", "#EC4899", "#1A1A2E"],  // Purple-pink on dark
    ["#10B981", "#3B82F6", "#0F172A"],  // Green-blue on dark
    ["#6366F1", "#06B6D4", "#FFFFFF"],  // Indigo-cyan on white
    ["#7C3AED", "#2563EB", "#F5F3FF"],  // Violet-blue on light
    ["#0EA5E9", "#8B5CF6", "#020617"],  // Sky-purple on dark
  ],
};

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
    ["#3B82F6", "#8B5CF6", "#0F172A"],
    ["#06B6D4", "#3B82F6", "#0D1117"],
    ["#8B5CF6", "#EC4899", "#1A1A2E"],
    ["#10B981", "#06B6D4", "#020617"],
    ["#6366F1", "#0EA5E9", "#FFFFFF"],
    ["#00F5FF", "#7B61FF", "#0A0F1C"],
    ["#00FF87", "#0EA5E9", "#0F172A"],
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
  tech: ["Space Grotesk", "JetBrains Mono", "Inter", "Outfit", "Ubuntu"],
  organic: ["Quicksand", "Nunito", "Lato", "Comfortaa", "Varela Round"],
};

// ── All layouts ──
const ALL_LAYOUTS: LogoLayout[] = [
  "lettermark", "initial-top", "initial-left",
  "icon-left", "icon-top", "icon-right", "stacked",
  "wordmark", "monogram", "emblem", "badge", "minimal", "split",
];

// ── Per-style layout pools — more icon-heavy layouts for better relatability ──
const STYLE_LAYOUTS: Record<LogoStyle, LogoLayout[]> = {
  modern:     ["icon-top", "icon-left", "initial-top", "stacked", "badge", "minimal", "split"],
  classic:    ["emblem", "badge", "icon-top", "stacked", "initial-top", "lettermark"],
  minimalist: ["icon-left", "minimal", "wordmark", "icon-top", "lettermark", "initial-left"],
  bold:       ["icon-top", "badge", "split", "icon-left", "initial-top", "stacked"],
  elegant:    ["emblem", "icon-top", "initial-top", "stacked", "lettermark", "monogram"],
  playful:    ["icon-top", "stacked", "icon-left", "badge", "split", "initial-top"],
  geometric:  ["icon-top", "badge", "emblem", "icon-left", "stacked", "initial-left"],
  vintage:    ["emblem", "badge", "icon-top", "stacked", "initial-top", "lettermark"],
  tech:       ["icon-top", "icon-left", "stacked", "badge", "split", "initial-top", "minimal"],
  organic:    ["icon-top", "stacked", "emblem", "icon-left", "initial-top", "wordmark"],
};

// ── Icon shapes per style — more variety, tech gets shields ──
type IconShape = "none" | "circle" | "rounded-square" | "hexagon" | "shield" | "diamond";
const STYLE_ICON_SHAPES: Record<LogoStyle, IconShape[]> = {
  modern:     ["rounded-square", "circle", "none"],
  classic:    ["circle", "shield", "none"],
  minimalist: ["none", "circle", "rounded-square"],
  bold:       ["rounded-square", "diamond", "shield"],
  elegant:    ["circle", "diamond", "none"],
  playful:    ["circle", "rounded-square", "none"],
  geometric:  ["hexagon", "diamond", "rounded-square"],
  vintage:    ["circle", "shield", "none"],
  tech:       ["shield", "hexagon", "rounded-square", "circle"],
  organic:    ["circle", "rounded-square", "none"],
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
  tech:       [500, 600, 700],
  organic:    [400, 500, 600],
};

// ── Dark background colors — richer, more premium ──
const DARK_BACKGROUNDS = [
  "#0F172A", "#0D1117", "#020617", "#1A1A2E", "#0C0A09",
  "#111827", "#18181B", "#1E1B4B", "#172554", "#1C1917",
  "#1E293B", "#27272A", "#292524", "#3B0764", "#4A0E4E",
];

// ── Gradient definitions for premium look ──
interface GradientDef {
  type: "linear" | "radial";
  angle?: number;
  colors: string[];
}

// Generate industry-appropriate gradients
function getIndustryGradient(industry: string, primary: string, secondary: string): GradientDef | null {
  const shouldUseGradient = Math.random() < 0.35; // 35% chance of gradient
  if (!shouldUseGradient) return null;
  
  return {
    type: "linear",
    angle: pickRandom([135, 45, 90, 180]),
    colors: [primary, secondary],
  };
}

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

/** Detect if a keyword or industry implies a specific style priority */
function inferBestStyles(industry: string, keywords?: string): LogoStyle[] {
  const kws = (keywords || "").toLowerCase();
  const ind = industry.toLowerCase();
  
  // If keywords or industry strongly imply tech, bias toward tech style
  if (ind.includes("tech") || kws.includes("tech") || kws.includes("software") || kws.includes("ai") || kws.includes("digital") || kws.includes("cyber") || kws.includes("code")) {
    return shuffleArray(["tech", "modern", "geometric", "bold", "minimalist", "tech", "modern"] as LogoStyle[]);
  }
  if (ind.includes("health") || kws.includes("health") || kws.includes("medical")) {
    return shuffleArray(["modern", "minimalist", "elegant", "organic", "classic"] as LogoStyle[]);
  }
  if (ind.includes("food") || kws.includes("food") || kws.includes("restaurant")) {
    return shuffleArray(["playful", "vintage", "bold", "organic", "modern"] as LogoStyle[]);
  }
  if (ind.includes("fashion") || kws.includes("luxury") || kws.includes("premium")) {
    return shuffleArray(["elegant", "minimalist", "classic", "modern", "bold"] as LogoStyle[]);
  }
  if (ind.includes("finance") || kws.includes("finance") || kws.includes("corporate")) {
    return shuffleArray(["modern", "classic", "minimalist", "elegant", "bold"] as LogoStyle[]);
  }
  
  // Fallback: all styles mixed
  return shuffleArray(["modern", "classic", "minimalist", "bold", "elegant", "playful", "geometric", "vintage", "tech", "organic"] as LogoStyle[]);
}

// ── Main generator ──
export function generateLogoConcepts(request: GenerateLogoRequest, count: number = 20): LogoConcept[] {
  const { businessName, industry, style, keywords } = request;
  const parsedStyles = typeof style === "string" 
    ? style.split(",").map(s => s.trim().toLowerCase() as LogoStyle).filter(s => Object.keys(STYLE_COLORS).includes(s))
    : [];

  // Use inferred styles based on industry + keywords for better relevance
  const styles: LogoStyle[] = parsedStyles.length > 0
    ? parsedStyles
    : inferBestStyles(industry, keywords);

  // Resolve icons from both industry AND keywords for better relatability
  const icons = resolveIcons(industry, keywords);
  const logos: LogoConcept[] = [];
  const usedLayouts = new Set<string>();
  const usedIcons = new Set<string>();

  // Use keywords as tagline only if they look like a tagline, otherwise generate a relevant one
  const tagline = keywords || "";

  for (let i = 0; i < count; i++) {
    const currentStyle = styles[i % styles.length];
    
    // Try industry-specific color overrides first for more relatable colors
    const industryColors = INDUSTRY_COLOR_OVERRIDES[industry];
    const colorOptions = (industryColors && Math.random() < 0.6) 
      ? industryColors 
      : STYLE_COLORS[currentStyle];
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

    // Pick icon with diversity — avoid repeating the same icon
    let selectedIcon: string;
    const unseenIcons = icons.filter(ic => !usedIcons.has(ic));
    if (unseenIcons.length > 0) {
      selectedIcon = unseenIcons[Math.floor(Math.random() * Math.min(3, unseenIcons.length))]; // pick from top 3 unseen
    } else {
      usedIcons.clear();
      selectedIcon = pickRandom(icons);
    }
    usedIcons.add(selectedIcon);

    // Background selection — for tech, bias toward dark backgrounds
    let bgColor: string;
    let textClr: string;
    let iconClr: string;

    const bgRand = Math.random();
    const darkBias = (industry === "Technology" || currentStyle === "tech") ? 0.55 : 0.4;
    
    if (bgRand < darkBias) {
      // Dark background — premium look
      bgColor = pickRandom(DARK_BACKGROUNDS);
      textClr = "#FFFFFF";
      iconClr = colorSet[0];
    } else if (bgRand < darkBias + 0.25) {
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

    // Generate gradient for icon (premium feature)
    const gradient = getIndustryGradient(industry, colorSet[0], colorSet[1]);

    logos.push({
      id: generateId(),
      name: `${businessName} Logo ${i + 1}`,
      businessName,
      tagline,
      industry,
      style: currentStyle,
      colors: colorSet,
      fontFamily: pickRandom(STYLE_FONTS[currentStyle]),
      iconName: selectedIcon,
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
      // Store gradient info in accentColor field as CSS
      ...(gradient ? { accentColor: `linear-gradient(${gradient.angle}deg, ${gradient.colors[0]}, ${gradient.colors[1]})` } : {}),
    });
  }

  return logos;
}
