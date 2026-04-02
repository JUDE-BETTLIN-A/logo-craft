"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INDUSTRIES, LOGO_STYLES } from "@/lib/types";
import {
  Search,
  ChevronDown,
  Building2,
  Hash,
  Sparkles,
  Type,
  Users,
  Layers,
  Palette,
  ImageIcon,
  Target,
  MessageSquare,
  Check,
} from "lucide-react";

interface SearchFormProps {
  defaultName?: string;
  defaultIndustry?: string;
  defaultStyle?: string;
  defaultKeywords?: string;
  expanded?: boolean;
  variant?: "hero" | "compact";
}

const PERSONALITIES = [
  "Modern", "Minimal", "Luxury", "Playful", "Techy", "Bold", "Elegant",
  "Futuristic", "Innovative", "Professional", "Friendly", "Creative",
  "Corporate", "Organic", "Vintage", "Sleek", "Trustworthy", "Dynamic",
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

export default function SearchForm({
  defaultName = "",
  defaultIndustry = "",
  defaultStyle = "",
  defaultKeywords = "",
  expanded = false,
  variant = "hero",
}: SearchFormProps) {
  const router = useRouter();

  // Basic fields
  const [businessName, setBusinessName] = useState(defaultName);
  const [industry, setIndustry] = useState(defaultIndustry);
  const [customIndustry, setCustomIndustry] = useState("");
  const [keywords, setKeywords] = useState(defaultKeywords);

  // Advanced fields (from AI Studio)
  const [tagline, setTagline] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState("");
  const [selectedColorPreset, setSelectedColorPreset] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    defaultStyle ? [defaultStyle] : []
  );
  const [iconPreference, setIconPreference] = useState("None");
  const [backgroundType, setBackgroundType] = useState("white");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(expanded);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const params = new URLSearchParams();
    params.set("name", businessName.trim());

    const finalIndustry = customIndustry.trim() || industry;
    if (finalIndustry) params.set("industry", finalIndustry);

    if (keywords.trim()) params.set("keywords", keywords.trim());
    if (tagline.trim()) params.set("tagline", tagline.trim());
    if (targetAudience.trim()) params.set("targetAudience", targetAudience.trim());
    if (selectedPersonalities.length > 0) params.set("personality", selectedPersonalities.join(", "));

    const finalColors = customColors.trim() || selectedColorPreset;
    if (finalColors) params.set("colors", finalColors);

    if (selectedStyles.length > 0) params.set("style", selectedStyles.join(", "));
    if (iconPreference !== "None") params.set("iconPreference", iconPreference);
    if (backgroundType) params.set("backgroundType", backgroundType);
    if (additionalNotes.trim()) params.set("additionalNotes", additionalNotes.trim());

    router.push(`/generate?${params.toString()}`);
  };

  // Render the Advanced UI segment (used by both variants when expanded)
  const renderAdvancedUI = (isDarkPanel = false) => {
    // Styling classes contingent on panel theme
    const labelClass = `flex items-center gap-2 text-sm font-semibold ${isDarkPanel ? "text-gray-300" : "text-gray-600"} mb-2`;
    const inputClass = `w-full h-11 rounded-xl px-4 text-sm focus:outline-none transition-all ${
      isDarkPanel
        ? "bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
        : "bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
    }`;
    const getPillClass = (selected: boolean, activeColor = "violet") => {
      if (isDarkPanel) {
        return `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
          selected
            ? `bg-${activeColor}-500/20 border-${activeColor}-500/40 text-${activeColor}-300`
            : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]"
        }`;
      } else {
        return `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
          selected
            ? `bg-${activeColor}-50 border-${activeColor}-200 text-${activeColor}-700 shadow-sm`
            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`;
      }
    };

    return (
      <div className={`mt-3 ${isDarkPanel ? 'bg-[#111128]/80 backdrop-blur-xl border-white/[0.06]' : 'bg-gray-50 border-gray-100'} p-5 sm:p-6 rounded-2xl border space-y-6 animate-fade-in`}>
        {/* ROW 1: Industry + Tagline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              Industry <span className={isDarkPanel ? "text-red-400" : "text-red-500"}>*</span>
            </label>
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                if (e.target.value) setCustomIndustry("");
              }}
              className={inputClass + " appearance-none cursor-pointer"}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
            >
              <option value="" className={isDarkPanel ? "bg-[#111128]" : ""}>Select Industry...</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind} className={isDarkPanel ? "bg-[#111128]" : ""}>{ind}</option>
              ))}
              <option value="__custom" className={isDarkPanel ? "bg-[#111128]" : ""}>Custom...</option>
            </select>
            {industry === "__custom" && (
              <input
                type="text"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                placeholder="Enter your industry..."
                className={`${inputClass} mt-2 h-10`}
              />
            )}
          </div>

          <div>
            <label className={labelClass}>
              <Type className="w-3.5 h-3.5 text-indigo-500" />
              Tagline <span className="font-normal text-xs opacity-70">(optional)</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder='e.g. "Future of Intelligence"'
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 2: Target Audience */}
        <div>
          <label className={labelClass}>
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            Target Audience <span className="font-normal text-xs opacity-70">(optional)</span>
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder='e.g. "Tech startups, developers, enterprises"'
            className={inputClass}
          />
        </div>

        {/* Personality */}
        <div>
          <label className={labelClass}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Brand Personality
            <span className="font-normal text-xs opacity-70 ml-1">(select up to 5)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PERSONALITIES.map((p) => {
              const selected = selectedPersonalities.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePersonality(p)}
                  className={getPillClass(selected, "violet")}
                >
                  {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className={labelClass}>
            <Palette className="w-3.5 h-3.5 text-rose-500" />
            Color Preferences
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            {COLOR_PRESETS.map((cp) => {
              const selected = selectedColorPreset === cp.value;
              return (
                <button
                  key={cp.value}
                  type="button"
                  onClick={() => setSelectedColorPreset(selected ? "" : cp.value)}
                  className={`${getPillClass(selected, "rose")} text-left truncate`}
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
            placeholder="Or type custom colors: e.g. teal, coral..."
            className={`${inputClass} h-10 text-xs`}
          />
        </div>

        {/* Style */}
        <div>
          <label className={labelClass}>
            <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
            Logo Style
            <span className="font-normal text-xs opacity-70 ml-1">(select up to 3)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {LOGO_STYLES.map((s) => {
              const selected = selectedStyles.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleStyle(s.value)}
                  className={getPillClass(selected, "sky")}
                >
                  {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW: Icon + Background */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Target className="w-3.5 h-3.5 text-orange-500" />
              Symbol / Icon
            </label>
            <select
              value={iconPreference}
              onChange={(e) => setIconPreference(e.target.value)}
              className={inputClass + " appearance-none cursor-pointer"}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
            >
              {ICON_PREFERENCES.map((icon) => (
                <option key={icon} value={icon} className={isDarkPanel ? "bg-[#111128]" : ""}>{icon}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              <Layers className="w-3.5 h-3.5 text-teal-500" />
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
                    className={getPillClass(selected, "teal")}
                  >
                    {selected && <Check className="w-3 h-3 inline mr-1.5 -mt-0.5" />}
                    {bg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className={labelClass}>
            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
            Additional Instructions
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={2}
            placeholder='e.g. "Glowing effect, modern typography..."'
            className={`${inputClass} py-3 resize-none h-auto`}
          />
        </div>
      </div>
    );
  };

  /* ═════════ COMPACT VARIANT (SIDEBAR on /generate) ═════════ */
  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {/* Name */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-0">
            <div className="flex items-center gap-2 px-4 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Brand Name</span>
            </div>
            <div className="w-px h-7 bg-gray-200" />
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. NexaAI"
              className="border-0 shadow-none focus-visible:ring-0 h-11 text-sm rounded-none"
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-0">
            <div className="flex items-center gap-2 px-4 shrink-0">
              <Hash className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Keywords</span>
            </div>
            <div className="w-px h-7 bg-gray-200" />
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. creative, tech..."
              className="border-0 shadow-none focus-visible:ring-0 h-11 text-sm rounded-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-sm shadow-md shadow-red-500/20"
        >
          <Search className="w-4 h-4 mr-2" />
          SEARCH / RE-GENERATE
        </Button>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 mx-auto text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors pt-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {showAdvanced ? "Hide Pro Options" : "Show AI Pro Options"}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
        </button>

        {showAdvanced && renderAdvancedUI(false)}
      </form>
    );
  }

  /* ═════════ HERO VARIANT (HOME PAGE) ═════════ */
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="space-y-3">
        {/* Name */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
          <div className="flex items-center">
            <div className="flex items-center gap-2.5 px-5 shrink-0">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Brand Name</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. NexaAI"
              className="border-0 shadow-none focus-visible:ring-0 h-14 text-base rounded-none px-4"
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
          <div className="flex items-center">
            <div className="flex items-center gap-2.5 px-5 shrink-0">
              <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                <Hash className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Keywords</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. creative, modern, organic..."
              className="border-0 shadow-none focus-visible:ring-0 h-14 text-base rounded-none px-4"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30"
        >
          <Search className="w-5 h-5 mr-2" />
          GENERATE LOGOS
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 mx-auto mt-5 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {showAdvanced ? "Hide AI Pro Features" : "Show AI Pro Features"}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
      </button>

      {showAdvanced && (
        <div className="mt-4 text-left">
          {renderAdvancedUI(false)}
        </div>
      )}
    </form>
  );
}
