"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchForm from "@/components/search-form";
import LogoGrid from "@/components/logo-grid";
import { LogoConcept, LOGO_STYLES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, X } from "lucide-react";
import { preloadAllFonts } from "@/lib/google-fonts";

/* ── Filter color presets ── */
const COLOR_FILTERS = [
  { label: "Red",    hex: "#EF4444" },
  { label: "Orange", hex: "#F97316" },
  { label: "Yellow", hex: "#EAB308" },
  { label: "Green",  hex: "#22C55E" },
  { label: "Teal",   hex: "#14B8A6" },
  { label: "Blue",   hex: "#3B82F6" },
  { label: "Indigo", hex: "#6366F1" },
  { label: "Purple", hex: "#A855F7" },
  { label: "Pink",   hex: "#EC4899" },
  { label: "Black",  hex: "#111111" },
  { label: "Gray",   hex: "#6B7280" },
  { label: "White",  hex: "#FFFFFF" },
];

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const [logos, setLogos] = useState<LogoConcept[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  /* Sidebar filters */
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());

  const name = searchParams.get("name") || "";
  const industry = searchParams.get("industry") || "";
  const style = searchParams.get("style") || "";
  const kw = searchParams.get("keywords") || "";

  useEffect(() => { preloadAllFonts(); }, []);

  const generateLogos = useCallback(async () => {
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: name,
          industry: industry || "Technology",
          style: style || undefined,
          keywords: kw,
        }),
      });
      const data = await res.json();
      if (data.logos) setLogos(data.logos);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  }, [name, industry, style, kw]);

  useEffect(() => { if (name) generateLogos(); }, [name, generateLogos]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleStyle = (v: string) => {
    setSelectedStyles((prev) => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  };

  const toggleColor = (hex: string) => {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      next.has(hex) ? next.delete(hex) : next.add(hex);
      return next;
    });
  };

  /* ── Apply sidebar filters ── */
  const filteredLogos = logos.filter((l) => {
    if (selectedStyles.size > 0 && !selectedStyles.has(l.style)) return false;
    if (selectedColors.size > 0) {
      const logoColors = [l.iconColor, l.textColor, l.backgroundColor, ...l.colors].map(c => c.toLowerCase());
      const match = [...selectedColors].some(sc => {
        const target = sc.toLowerCase();
        return logoColors.some(lc => {
          if (lc === target) return true;
          // approximate match — same hue family
          const r1 = parseInt(target.slice(1, 3), 16);
          const g1 = parseInt(target.slice(3, 5), 16);
          const b1 = parseInt(target.slice(5, 7), 16);
          const r2 = parseInt(lc.slice(1, 3), 16);
          const g2 = parseInt(lc.slice(3, 5), 16);
          const b2 = parseInt(lc.slice(5, 7), 16);
          if (isNaN(r2) || isNaN(g2) || isNaN(b2)) return false;
          const dist = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
          return dist < 120;
        });
      });
      if (!match) return false;
    }
    return true;
  });

  const activeFilterCount = selectedStyles.size + selectedColors.size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Search Header ── */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <SearchForm
            defaultName={name}
            defaultIndustry={industry}
            defaultStyle={style}
            defaultKeywords={kw}
            variant="compact"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* ── Left Sidebar ── */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Active filters */}
            {activeFilterCount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Active Filters</span>
                  <button
                    onClick={() => { setSelectedStyles(new Set()); setSelectedColors(new Set()); }}
                    className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...selectedStyles].map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-full capitalize">
                      {s}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleStyle(s)} />
                    </span>
                  ))}
                  {[...selectedColors].map(c => (
                    <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-medium rounded-full">
                      <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: c }} />
                      {COLOR_FILTERS.find(cf => cf.hex === c)?.label || c}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleColor(c)} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Logo Styles */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Logo Styles</h3>
              <div className="space-y-1">
                {LOGO_STYLES.map((s) => (
                  <label
                    key={s.value}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStyles.has(s.value)}
                      onChange={() => toggleStyle(s.value)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_FILTERS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => toggleColor(c.hex)}
                    title={c.label}
                    className={`w-9 h-9 rounded-lg border-2 transition-all ${
                      selectedColors.has(c.hex)
                        ? "border-indigo-500 scale-110 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColors.has(c.hex) && (
                      <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke={c.hex === "#FFFFFF" || c.hex === "#EAB308" ? "#333" : "#fff"} strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          {name && (
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  &ldquo;{name}&rdquo; logo designs
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {filteredLogos.length} of {logos.length} designs
                  {kw && <span className="text-gray-400"> &middot; keywords: {kw}</span>}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateLogos}
                disabled={loading}
                className="text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-28">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Generating logos...</h3>
              <p className="text-gray-400 text-sm">Creating unique designs for &ldquo;{name}&rdquo;</p>
            </div>
          )}

          {/* No query */}
          {!name && !loading && (
            <div className="text-center py-28">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Enter your business name</h2>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Type your brand name above and click SEARCH to see AI-powered logo designs
              </p>
            </div>
          )}

          {/* Results grid */}
          {!loading && logos.length > 0 && (
            <LogoGrid
              logos={filteredLogos}
              onFavorite={toggleFavorite}
              favorites={favorites}
              columns={4}
            />
          )}

          {/* Load more */}
          {!loading && logos.length > 0 && (
            <div className="text-center mt-10">
              <Button variant="outline" size="lg" onClick={generateLogos} className="shadow-sm">
                <RefreshCw className="w-4 h-4" />
                Generate More Designs
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <GeneratePageContent />
    </Suspense>
  );
}
