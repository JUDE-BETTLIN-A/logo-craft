"use client";

import { useState, useRef } from "react";
import {
  Sparkles,
  Wand2,
  Download,
  Heart,
  Loader2,
  ChevronDown,
  ChevronUp,
  Palette,
  Type,
  Target,
  Users,
  Layers,
  ImageIcon,
  MessageSquare,
  Building2,
  RefreshCw,
  Zap,
  Check,
  Info,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

/* ── Preset data ── */
const INDUSTRIES = [
  "Technology", "Artificial Intelligence", "Healthcare", "Education",
  "Finance & Banking", "Food & Beverage", "Fashion & Apparel", "Real Estate",
  "Sports & Fitness", "Travel & Tourism", "Entertainment & Media",
  "Consulting", "Construction", "Automotive", "Beauty & Spa",
  "Photography", "Music & Audio", "Legal Services", "Agriculture",
  "Non-Profit", "E-Commerce", "Gaming", "SaaS & Cloud", "Cybersecurity",
  "Blockchain & Crypto", "Marketing & Advertising", "Interior Design",
];

const PERSONALITIES = [
  "Modern", "Minimal", "Luxury", "Playful", "Techy", "Bold", "Elegant",
  "Futuristic", "Innovative", "Professional", "Friendly", "Creative",
  "Corporate", "Organic", "Vintage", "Sleek", "Trustworthy", "Dynamic",
];

const LOGO_STYLES = [
  "Minimalist", "3D", "Flat", "Abstract", "Mascot", "Lettermark",
  "Icon-based", "Emblem", "Gradient", "Geometric", "Hand-drawn",
  "Neon Glow", "Watercolor", "Line Art", "Metallic", "Retro",
];

const ICON_PREFERENCES = [
  "None", "Rocket", "Leaf", "Shield", "Brain", "AI Chip", "Globe",
  "Lightning Bolt", "Crown", "Diamond", "Star", "Mountain", "Gear",
  "Heart", "Arrow", "Compass", "Sun", "Wave", "Flame", "Atom",
];

const BACKGROUND_TYPES = [
  { label: "White", value: "white" },
  { label: "Dark / Black", value: "dark" },
  { label: "Transparent", value: "transparent" },
  { label: "Gradient", value: "gradient" },
];

const COLOR_PRESETS = [
  { label: "Blue & Purple Gradient", value: "blue, purple gradient" },
  { label: "Red & Orange", value: "red, orange, warm tones" },
  { label: "Green & Teal", value: "emerald green, teal, nature tones" },
  { label: "Gold & Black", value: "gold, black, luxury" },
  { label: "Navy & Silver", value: "navy blue, silver, corporate" },
  { label: "Pink & Magenta", value: "hot pink, magenta, vibrant" },
  { label: "Monochrome", value: "black, white, grayscale" },
  { label: "Sunset", value: "coral, amber, sunset warm tones" },
  { label: "Ocean", value: "deep blue, cyan, aqua" },
  { label: "Forest", value: "dark green, olive, earth tones" },
  { label: "Neon", value: "neon green, electric blue, magenta glow" },
  { label: "Pastel", value: "soft pink, lavender, mint pastel" },
];

/* ── Logo result type ── */
interface ProLogo {
  id: string;
  imageUrl: string;
  provider: string;
  prompt: string;
  brandName: string;
  industry: string;
  style: string;
}

export default function AILogoStudioPage() {
  /* ── Form state ── */
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState("");
  const [selectedColorPreset, setSelectedColorPreset] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [iconPreference, setIconPreference] = useState("None");
  const [backgroundType, setBackgroundType] = useState("white");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  /* ── Results state ── */
  const [logos, setLogos] = useState<ProLogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [generationTime, setGenerationTime] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);

  /* ── Toggle helpers ── */
  const togglePersonality = (p: string) => {
    setSelectedPersonalities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].slice(0, 5)
    );
  };

  const toggleStyle = (s: string) => {
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 3)
    );
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Generate handler ── */
  const handleGenerate = async () => {
    if (!brandName.trim()) {
      setError("Please enter your brand name");
      return;
    }
    if (!industry && !customIndustry) {
      setError("Please select or enter an industry");
      return;
    }

    setError("");
    setLoading(true);
    setLogos([]);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/generate-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          tagline: tagline.trim() || undefined,
          industry: customIndustry.trim() || industry,
          targetAudience: targetAudience.trim() || undefined,
          personality: selectedPersonalities.join(", ") || undefined,
          colors: customColors.trim() || selectedColorPreset || undefined,
          logoStyle: selectedStyles.join(", ") || undefined,
          iconPreference:
            iconPreference !== "None" ? iconPreference : undefined,
          backgroundType,
          additionalNotes: additionalNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
        return;
      }

      setLogos(data.logos || []);
      setGenerationTime(Math.round((Date.now() - startTime) / 1000));

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      console.error("Generation error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Download helper ── */
  const handleDownload = async (imageUrl: string, name: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s+/g, "_")}_logo.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* ═══════════════════ HERO HEADER ═══════════════════ */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-[#0a0a1a] to-indigo-950" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-indigo-600 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-fuchsia-600 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-violet-300 text-xs font-medium mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Flux.1 + DeepAI
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            AI Logo{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Studio
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Describe your brand in detail and watch our AI generate
            stunning, professional logos using multiple AI engines simultaneously.
          </p>
        </div>
      </div>

      {/* ═══════════════════ FORM SECTION ═══════════════════ */}
      <div className="relative max-w-4xl mx-auto px-4 -mt-2 pb-16">
        <div className="bg-[#111128]/80 backdrop-blur-xl rounded-3xl border border-white/[0.06] shadow-2xl shadow-violet-950/30 overflow-hidden">
          {/* Form Header */}
          <div className="px-6 md:px-8 pt-8 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Wand2 className="w-4.5 h-4.5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Design Brief</h2>
            </div>
            <p className="text-gray-500 text-sm ml-12">
              Fill in your brand details for the best results
            </p>
          </div>

          <div className="px-6 md:px-8 py-6 space-y-6">
            {/* ── ROW 1: Brand Name + Tagline ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand Name (Required) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-violet-400" />
                  Brand Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="brand-name-input"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder='e.g. "NexaAI"'
                  className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Type className="w-3.5 h-3.5 text-indigo-400" />
                  Tagline <span className="text-gray-600 font-normal text-xs">(optional)</span>
                </label>
                <input
                  id="tagline-input"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder='e.g. "Future of Intelligence"'
                  className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            {/* ── ROW 2: Industry + Target Audience ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Industry */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Industry <span className="text-red-400">*</span>
                </label>
                <select
                  id="industry-select"
                  value={industry}
                  onChange={(e) => {
                    setIndustry(e.target.value);
                    if (e.target.value) setCustomIndustry("");
                  }}
                  className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                >
                  <option value="" className="bg-[#111128]">Select Industry...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-[#111128]">{ind}</option>
                  ))}
                  <option value="__custom" className="bg-[#111128]">Custom...</option>
                </select>
                {industry === "__custom" && (
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="Enter your industry..."
                    className="mt-2 w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                )}
              </div>

              {/* Target Audience */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Target Audience <span className="text-gray-600 font-normal text-xs">(optional)</span>
                </label>
                <input
                  id="audience-input"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder='e.g. "Tech startups, developers, enterprises"'
                  className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            {/* ── Brand Personality (Pill selector) ── */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Brand Personality
                <span className="text-gray-600 font-normal text-xs">(select up to 5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITIES.map((p) => {
                  const selected = selectedPersonalities.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePersonality(p)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                        selected
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-500/10"
                          : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Color Preferences ── */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                Color Preferences
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                {COLOR_PRESETS.map((cp) => {
                  const selected = selectedColorPreset === cp.value;
                  return (
                    <button
                      key={cp.value}
                      type="button"
                      onClick={() =>
                        setSelectedColorPreset(selected ? "" : cp.value)
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border text-left ${
                        selected
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                          : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                      {cp.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={customColors}
                onChange={(e) => {
                  setCustomColors(e.target.value);
                  if (e.target.value) setSelectedColorPreset("");
                }}
                placeholder="Or type custom colors: e.g. teal, coral, gold..."
                className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-4 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>

            {/* ── Logo Style (Pill selector) ── */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                Logo Style
                <span className="text-gray-600 font-normal text-xs">(select up to 3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {LOGO_STYLES.map((s) => {
                  const selected = selectedStyles.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStyle(s)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                        selected
                          ? "bg-sky-500/15 border-sky-500/30 text-sky-300 shadow-sm shadow-sky-500/10"
                          : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── ROW: Icon Preference + Background ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Icon/Symbol Preference */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Target className="w-3.5 h-3.5 text-orange-400" />
                  Symbol / Icon
                </label>
                <select
                  id="icon-select"
                  value={iconPreference}
                  onChange={(e) => setIconPreference(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                >
                  {ICON_PREFERENCES.map((icon) => (
                    <option key={icon} value={icon} className="bg-[#111128]">
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              {/* Background Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Background
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_TYPES.map((bg) => {
                    const selected = backgroundType === bg.value;
                    return (
                      <button
                        key={bg.value}
                        type="button"
                        onClick={() => setBackgroundType(bg.value)}
                        className={`h-12 rounded-xl text-xs font-medium transition-all duration-200 border ${
                          selected
                            ? "bg-teal-500/15 border-teal-500/30 text-teal-300"
                            : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]"
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1.5 -mt-0.5" />}
                        {bg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Advanced/Additional ── */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-400 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Additional Instructions
                {showAdvanced ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
              {showAdvanced && (
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  placeholder='e.g. "Glowing effect, modern typography, make it look futuristic and premium..."'
                  className="mt-3 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                />
              )}
            </div>

            {/* ── Error message ── */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <Info className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* ── GENERATE BUTTON ── */}
            <button
              id="generate-button"
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-14 rounded-2xl font-bold text-base transition-all duration-300 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(139, 92, 246, 0.3)"
                  : "linear-gradient(135deg, #7c3aed, #6366f1, #8b5cf6)",
                color: "white",
                boxShadow: loading
                  ? "none"
                  : "0 8px 32px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {/* Shimmer effect on hover */}
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
              <span className="relative flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your logos...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate AI Logos
                  </>
                )}
              </span>
            </button>

            {/* ── Powered by badges ── */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Powered by</span>
              <span className="text-xs font-semibold text-gray-500 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.06]">
                Flux.1
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.06]">
                DeepAI
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.06]">
                Gemini
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════ LOADING STATE ═══════════════════ */}
        {loading && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-6 px-10 py-10 rounded-3xl bg-[#111128]/60 border border-white/[0.06] backdrop-blur-xl">
              {/* Animated rings */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-indigo-500/30 animate-ping" style={{ animationDelay: "0.5s" }} />
                <div className="absolute inset-4 rounded-full border-2 border-fuchsia-500/40 animate-ping" style={{ animationDelay: "1s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Crafting your logos...</h3>
                <p className="text-gray-500 text-sm">
                  Using Flux.1 + DeepAI engines simultaneously
                </p>
              </div>
              {/* Progress bar animation */}
              <div className="w-64 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"
                  style={{
                    animation: "progressPulse 3s ease-in-out infinite",
                    width: "100%",
                    transformOrigin: "left",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ RESULTS GRID ═══════════════════ */}
        {!loading && logos.length > 0 && (
          <div ref={resultsRef} className="mt-12">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Your Logos
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {logos.length} designs generated in {generationTime}s
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-300 text-sm font-medium hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>

            {/* Logo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {logos.map((logo) => (
                <div
                  key={logo.id}
                  className="group relative rounded-2xl overflow-hidden bg-[#111128]/60 border border-white/[0.06] hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/20"
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-[#0d0d20]">
                    <img
                      src={logo.imageUrl}
                      alt={`Logo for ${logo.brandName}`}
                      className="w-full h-full object-contain p-4"
                      loading="lazy"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-3">
                        {/* Download */}
                        <button
                          onClick={() => handleDownload(logo.imageUrl, logo.brandName)}
                          className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          title="Download"
                        >
                          <Download className="w-5 h-5 text-gray-800" />
                        </button>
                        {/* Favorite */}
                        <button
                          onClick={() => toggleFavorite(logo.id)}
                          className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          title="Favorite"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              favorites.has(logo.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-800"
                            }`}
                          />
                        </button>
                        {/* Open in new tab */}
                        <a
                          href={logo.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          title="Open full size"
                        >
                          <ExternalLink className="w-5 h-5 text-gray-800" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-5 py-4 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {logo.brandName}
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {logo.provider}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-gray-600 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.06]">
                        {logo.style}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Generate more CTA */}
            <div className="mt-10 text-center">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="w-4.5 h-4.5" />
                Generate More Variations
              </button>
              <p className="text-gray-600 text-xs mt-3">
                Each generation creates unique designs. Try different settings for more variety.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════ EMPTY STATE — NO RESULTS YET ═══════════════════ */}
        {!loading && logos.length === 0 && (
          <div className="mt-12 text-center py-16">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              Your logo designs will appear here
            </h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Fill in your brand details above and click{" "}
              <span className="text-violet-400 font-medium">Generate AI Logos</span>{" "}
              to create stunning professional logos
            </p>
          </div>
        )}
      </div>

      {/* ── Progress bar animation keyframes ── */}
      <style jsx>{`
        @keyframes progressPulse {
          0% {
            transform: scaleX(0);
            opacity: 0.7;
          }
          50% {
            transform: scaleX(1);
            opacity: 1;
          }
          100% {
            transform: scaleX(0);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
