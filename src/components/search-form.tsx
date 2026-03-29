"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INDUSTRIES, LOGO_STYLES } from "@/lib/types";
import { Search, ChevronDown, Building2, Hash, Sparkles } from "lucide-react";

interface SearchFormProps {
  defaultName?: string;
  defaultIndustry?: string;
  defaultStyle?: string;
  defaultKeywords?: string;
  expanded?: boolean;
  variant?: "hero" | "compact";
}

export default function SearchForm({
  defaultName = "",
  defaultIndustry = "",
  defaultStyle = "",
  defaultKeywords = "",
  expanded = false,
  variant = "hero",
}: SearchFormProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(defaultName);
  const [industry, setIndustry] = useState(defaultIndustry);
  const [style, setStyle] = useState(defaultStyle);
  const [keywords, setKeywords] = useState(defaultKeywords);
  const [showAdvanced, setShowAdvanced] = useState(expanded);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const params = new URLSearchParams();
    params.set("name", businessName.trim());
    if (industry) params.set("industry", industry);
    if (style) params.set("style", style);
    if (keywords.trim()) params.set("keywords", keywords.trim());

    router.push(`/generate?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {/* Business Name — separate field */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-0">
            <div className="flex items-center gap-2 px-4 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Business Name</span>
            </div>
            <div className="w-px h-7 bg-gray-200" />
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name..."
              className="border-0 shadow-none focus-visible:ring-0 h-11 text-sm rounded-none"
            />
          </div>
        </div>

        {/* Keywords — separate field */}
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
              placeholder="e.g. trading, creative, modern..."
              className="border-0 shadow-none focus-visible:ring-0 h-11 text-sm rounded-none"
            />
          </div>
        </div>

        {/* Search button */}
        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-sm shadow-md shadow-red-500/20"
        >
          <Search className="w-4 h-4 mr-2" />
          SEARCH
        </Button>

        {/* Collapsible advanced */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 mx-auto text-xs text-gray-400 hover:text-indigo-500 transition-colors"
        >
          More options
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
        </button>
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Any Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Any Style</option>
                {LOGO_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </form>
    );
  }

  // Hero variant (home page)
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="space-y-3">
        {/* Business Name — own card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
          <div className="flex items-center">
            <div className="flex items-center gap-2.5 px-5 shrink-0">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Business Name</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name..."
              className="border-0 shadow-none focus-visible:ring-0 h-14 text-base rounded-none px-4"
            />
          </div>
        </div>

        {/* Keywords — own card */}
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
              placeholder="e.g. trading, creative, modern..."
              className="border-0 shadow-none focus-visible:ring-0 h-14 text-base rounded-none px-4"
            />
          </div>
        </div>

        {/* Search button — full width */}
        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/30"
        >
          <Search className="w-5 h-5 mr-2" />
          SEARCH LOGOS
        </Button>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 mx-auto mt-4 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        Advanced Options
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
        />
      </button>

      {showAdvanced && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Any Industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Any Style</option>
              {LOGO_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
