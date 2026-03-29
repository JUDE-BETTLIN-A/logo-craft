export interface LogoConcept {
  id: string;
  name: string;
  businessName: string;
  tagline?: string;
  industry: string;
  style: LogoStyle;
  colors: string[];
  fontFamily: string;
  iconName: string;
  layout: LogoLayout;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  createdAt: Date;
  // New BrandCrowd-style properties
  iconShape?: "none" | "circle" | "rounded-square" | "hexagon" | "shield" | "diamond";
  letterSpacing?: number; // em units: 0, 0.1, 0.2, 0.3, 0.4
  fontWeight?: number;    // 400, 500, 600, 700, 800
  divider?: "none" | "line" | "dot" | "diamond" | "slash";
  accentColor?: string;
  // AI-generated image (when present, render as image instead of SVG)
  aiImageUrl?: string;
  aiPrompt?: string;
  aiStyleName?: string;
}

export type LogoLayout =
  | "icon-left"
  | "icon-top"
  | "icon-right"
  | "stacked"
  | "wordmark"
  | "monogram"
  | "emblem"
  | "badge"
  | "minimal"
  | "split"
  | "lettermark"
  | "initial-top"
  | "initial-left";

export type LogoStyle =
  | "modern"
  | "classic"
  | "minimalist"
  | "bold"
  | "elegant"
  | "playful"
  | "geometric"
  | "vintage"
  | "tech"
  | "organic";

export interface GenerateLogoRequest {
  businessName: string;
  industry: string;
  keywords?: string;
  style?: LogoStyle;
  colorPreference?: string;
}

export interface EditorState {
  logo: LogoConcept;
  fontSize: number;
  iconSize: number;
  spacing: number;
  borderRadius: number;
  shadow: boolean;
  tagline: string;
  taglineFontSize: number;
}

export interface BrandKit {
  id: string;
  name: string;
  logo: LogoConcept;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Food & Beverage",
  "Fashion",
  "Real Estate",
  "Sports & Fitness",
  "Travel",
  "Entertainment",
  "Consulting",
  "Construction",
  "Automotive",
  "Beauty & Spa",
  "Photography",
  "Music",
  "Legal",
  "Agriculture",
  "Non-Profit",
  "E-Commerce",
] as const;

export const LOGO_STYLES: { value: LogoStyle; label: string; description: string }[] = [
  { value: "modern", label: "Modern", description: "Clean, contemporary designs" },
  { value: "classic", label: "Classic", description: "Timeless, traditional look" },
  { value: "minimalist", label: "Minimalist", description: "Simple, less is more" },
  { value: "bold", label: "Bold", description: "Strong, impactful presence" },
  { value: "elegant", label: "Elegant", description: "Sophisticated, refined style" },
  { value: "playful", label: "Playful", description: "Fun, creative energy" },
  { value: "geometric", label: "Geometric", description: "Shape-based, structured" },
  { value: "vintage", label: "Vintage", description: "Retro, nostalgic feel" },
  { value: "tech", label: "Tech", description: "Digital, futuristic look" },
  { value: "organic", label: "Organic", description: "Natural, flowing forms" },
];

export const COLOR_PALETTES = [
  { name: "Ocean", colors: ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"] },
  { name: "Sunset", colors: ["#FF6B35", "#F7C59F", "#EFEFD0", "#004E89"] },
  { name: "Forest", colors: ["#2D6A4F", "#40916C", "#52B788", "#95D5B2"] },
  { name: "Royal", colors: ["#7B2CBF", "#9D4EDD", "#C77DFF", "#E0AAFF"] },
  { name: "Fire", colors: ["#D00000", "#E85D04", "#FAA307", "#FFBA08"] },
  { name: "Midnight", colors: ["#03071E", "#370617", "#6A040F", "#9D0208"] },
  { name: "Pastel", colors: ["#FFB5A7", "#FCD5CE", "#F8EDEB", "#F9DCC4"] },
  { name: "Corporate", colors: ["#003049", "#D62828", "#F77F00", "#FCBF49"] },
  { name: "Monochrome", colors: ["#212529", "#495057", "#ADB5BD", "#DEE2E6"] },
  { name: "Nature", colors: ["#606C38", "#283618", "#FEFAE0", "#DDA15E"] },
];

export const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Roboto",
  "Open Sans",
  "Lato",
  "Oswald",
  "Raleway",
  "Ubuntu",
  "Merriweather",
  "Nunito",
  "Quicksand",
  "Bebas Neue",
  "Pacifico",
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "free",
    features: [
      "Generate up to 10 logos",
      "Preview designs",
      "Basic customization",
      "Low-res PNG download",
    ],
    cta: "Get Started Free",
  },
  {
    id: "pro",
    name: "Professional",
    price: 1999,
    period: "one-time",
    features: [
      "Unlimited logo generation",
      "Full editor access",
      "High-res PNG & JPG",
      "SVG vector format",
      "Transparent background",
      "Business card template",
      "Social media kit",
    ],
    popular: true,
    cta: "Buy Now",
  },
  {
    id: "enterprise",
    name: "Brand Kit",
    price: 4999,
    period: "one-time",
    features: [
      "Everything in Professional",
      "Complete brand guidelines",
      "Letterhead templates",
      "Email signature",
      "Presentation template",
      "Favicon & app icons",
      "Priority support",
      "Commercial license",
    ],
    cta: "Get Brand Kit",
  },
];
