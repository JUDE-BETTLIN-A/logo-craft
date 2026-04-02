"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoGrid from "@/components/logo-grid";
import { LogoConcept } from "@/lib/types";
import { preloadAllFonts } from "@/lib/google-fonts";
import {
  Sparkles,
  Palette,
  Download,
  Zap,
  Shield,
  ArrowRight,
  Star,
  ChevronDown,
  Type,
  Grid3x3,
  Layers,
  Image as ImageIcon,
  Instagram,
  Globe,
  Search,
  Loader2,
  RefreshCw,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Static data ── */
const STEPS = [
  { num: "1", title: "Enter your thing", desc: "Just enter your business name and let our AI Logo Maker create amazing logo designs instantly.", color: "text-indigo-600", bg: "bg-indigo-50" },
  { num: "2", title: "Browse results", desc: "You can browse thousands of logos tailored with your business name and find a design that's perfect for you.", color: "text-emerald-600", bg: "bg-emerald-50" },
  { num: "3", title: "Refine keywords", desc: "Looking for a more specific logo? Enter keywords to refine the logos and find a design that really suits your business.", color: "text-amber-600", bg: "bg-amber-50" },
  { num: "4", title: "Explore logo profiles", desc: "Discover how your logo looks on business cards, social media, and merchandise with our brand mockup previews.", color: "text-rose-600", bg: "bg-rose-50" },
  { num: "5", title: "Customize and edit", desc: "Fine-tune your logo with our powerful editor. Change colors, fonts, icons, and layouts to make it truly yours.", color: "text-violet-600", bg: "bg-violet-50" },
  { num: "6", title: "Download the logo", desc: "Export your finished logo in multiple high-resolution formats including PNG, SVG, and JPEG with transparent backgrounds.", color: "text-cyan-600", bg: "bg-cyan-50" },
];

const FEATURES = [
  { icon: Sparkles, title: "Unique Designs", desc: "Every logo is uniquely generated using our AI engine. No cookie-cutter templates — each design is original.", color: "text-indigo-600", bg: "bg-indigo-50" },
  { icon: Zap, title: "Fast Preview", desc: "Get instant results in seconds. Our intelligent generator creates dozens of concepts in real-time.", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Shield, title: "File Formats", desc: "Download your logo in PNG, SVG, and JPEG formats. Transparent backgrounds included. Ready for web and print.", color: "text-emerald-600", bg: "bg-emerald-50" },
];

const TESTIMONIALS = [
  { name: "Sarah Johnson", role: "Startup Founder", text: "I was blown away by the quality. Got a professional logo for my tech startup in under 5 minutes. The AI designs were exactly what I was looking for!", rating: 5 },
  { name: "Raj Patel", role: "Small Business Owner", text: "This tool is incredible. I tried three other logo makers before finding this one. The designs are genuinely unique and premium-looking.", rating: 5 },
  { name: "Emma Williams", role: "Brand Consultant", text: "I recommend this to all my clients now. The brand kit feature saves hours of work. Best logo maker I've ever used.", rating: 5 },
];

export default function HomePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [logos, setLogos] = useState<LogoConcept[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { preloadAllFonts(); }, []);

  const generateLogos = useCallback(async (name: string, kw: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setHasGenerated(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: name.trim(),
          industry: "Technology",
          keywords: kw.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.logos) {
        setLogos(data.logos);
        // Save to localStorage for dashboard
        const saved = JSON.parse(localStorage.getItem("savedLogos") || "[]");
        const newSaved = data.logos.map((l: LogoConcept) => ({
          id: l.id,
          name: l.name || l.businessName,
          businessName: l.businessName,
          style: l.style,
          createdAt: new Date().toISOString(),
          colors: l.colors || [l.iconColor, l.textColor],
          logoData: l,
        }));
        // Prepend new logos, cap at 50
        const merged = [...newSaved, ...saved].slice(0, 50);
        localStorage.setItem("savedLogos", JSON.stringify(merged));
      }
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    generateLogos(businessName, keywords);
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════════
          HERO — dark background with logo showcase
          ═══════════════════════════════════════════════ */}
      <section id="generator" className="relative bg-[#0f0f13] overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/[0.08] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/[0.06] rounded-full blur-[100px]" />
        </div>

        <div className="relative container-main pt-20 pb-10 sm:pt-28 sm:pb-16 text-center">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 animate-slide-up">
            Logo Maker
          </h1>
          <p className="text-base sm:text-lg text-gray-400 mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Make a beautiful logo in seconds. Try it for free!
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleHeroSubmit}
            className="max-w-2xl mx-auto animate-slide-up space-y-3"
            style={{ animationDelay: "0.15s" }}
          >
            {/* Business name input */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter Your Business Name"
                  className="w-full h-14 pl-11 pr-6 rounded-xl bg-white text-gray-900 text-sm placeholder:text-gray-400 outline-none shadow-lg shadow-black/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !businessName.trim()}
                className="w-full sm:w-auto h-14 px-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-900/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Start Now"
                )}
              </button>
            </div>

            {/* Keywords input */}
            <div className="relative w-full max-w-xl mx-auto">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Keywords (e.g. tech, creative, modern, minimal...)"
                className="w-full h-12 pl-11 pr-6 rounded-xl bg-white/[0.07] border border-white/[0.1] text-white text-sm placeholder:text-gray-500 outline-none focus:border-indigo-400/50 transition-colors"
              />
            </div>
          </form>

          {/* ── Logo showcase fan (only when no logos generated) ── */}
          {!hasGenerated && (
            <div className="relative mt-16 mb-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {/* Center featured card */}
              <div className="relative mx-auto w-[280px] sm:w-[320px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 z-10"
                   style={{ background: "linear-gradient(135deg, #4c1d95, #6d28d9)" }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="text-6xl mb-3">🎨</div>
                  <div className="text-2xl font-bold text-white tracking-[0.2em] mb-1">INVICTA</div>
                  <div className="text-xs text-white/60 tracking-[0.3em] uppercase">Stand Out</div>
                </div>
              </div>

              {/* Fanned side cards - left */}
              <div className="hidden md:block absolute top-8 left-[5%] lg:left-[10%] w-[140px] aspect-square rounded-xl overflow-hidden shadow-lg -rotate-6 z-[1] opacity-80 hover:opacity-100 hover:scale-105 transition-all"
                   style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}>
                <div className="flex flex-col items-center justify-center h-full p-3">
                  <div className="text-2xl mb-1">🦁</div>
                  <div className="text-[10px] font-bold text-white/90 tracking-[0.15em]">COBRA CO.</div>
                  <div className="text-[7px] text-white/50 tracking-[0.2em]">TRUE VISION</div>
                </div>
              </div>

              <div className="hidden md:block absolute top-2 left-[16%] lg:left-[20%] w-[130px] aspect-square rounded-xl overflow-hidden shadow-lg -rotate-3 z-[2] opacity-85 hover:opacity-100 hover:scale-105 transition-all"
                   style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                <div className="flex flex-col items-center justify-center h-full p-3">
                  <div className="text-2xl mb-1">💎</div>
                  <div className="text-[10px] font-bold text-white/90 tracking-[0.15em]">VENTURE</div>
                  <div className="text-[7px] text-white/50 tracking-[0.2em]">CAPITAL</div>
                </div>
              </div>

              <div className="hidden lg:block absolute top-16 left-[26%] w-[120px] aspect-square rounded-xl overflow-hidden shadow-lg rotate-1 z-[3] opacity-90 hover:opacity-100 hover:scale-105 transition-all"
                   style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                <div className="flex flex-col items-center justify-center h-full p-3">
                  <div className="text-xl mb-1">🌿</div>
                  <div className="text-[9px] font-bold text-white/90 tracking-[0.12em]">WANDERLUST</div>
                  <div className="text-[7px] text-white/50 tracking-[0.15em]">LUXURY TRAVEL</div>
                </div>
              </div>

              {/* Fanned side cards - right */}
              <div className="hidden md:block absolute top-8 right-[5%] lg:right-[10%] w-[140px] aspect-square rounded-xl overflow-hidden shadow-lg rotate-6 z-[1] opacity-80 hover:opacity-100 hover:scale-105 transition-all"
                   style={{ background: "#fef3c7" }}>
                <div className="flex flex-col items-center justify-center h-full p-3">
                  <div className="text-2xl mb-1">🏛️</div>
                  <div className="text-[10px] font-bold text-amber-900/80 tracking-[0.12em]">BUILDING CO.</div>
                  <div className="text-[7px] text-amber-800/50 tracking-[0.15em]">TRUSTED PARTNERS</div>
                </div>
              </div>

              <div className="hidden md:block absolute top-2 right-[16%] lg:right-[20%] w-[130px] aspect-square rounded-xl overflow-hidden shadow-lg rotate-3 z-[2] opacity-85 hover:opacity-100 hover:scale-105 transition-all"
                   style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}>
                <div className="flex flex-col items-center justify-center h-full p-3">
                  <div className="text-2xl mb-1">👑</div>
                  <div className="text-[10px] font-bold text-white/90 tracking-[0.15em]">CRIMSON</div>
                  <div className="text-[7px] text-white/50 tracking-[0.2em]">STUDIOS</div>
                </div>
              </div>

              <div className="hidden lg:block absolute top-16 right-[26%] w-[120px] aspect-square rounded-xl overflow-hidden shadow-lg -rotate-1 z-[3] opacity-90 hover:opacity-100 hover:scale-105 transition-all"
                   style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}>
                <div className="flex flex-col items-center justify-center h-full p-3">
                  <div className="text-xl mb-1">⚡</div>
                  <div className="text-[9px] font-bold text-white/90 tracking-[0.12em]">TRINITY</div>
                  <div className="text-[7px] text-white/50 tracking-[0.15em]">DESIGN</div>
                </div>
              </div>

              {/* Tool icons sidebar (decorative) */}
              <div className="hidden lg:flex absolute right-[35%] top-0 flex-col gap-2.5 bg-[#1a1a24] rounded-xl p-2.5 shadow-xl z-20 border border-white/[0.06]">
                {[Type, Grid3x3, Layers, ImageIcon, Instagram, Globe].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors cursor-pointer">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>

              {/* Font preview pills */}
              <div className="hidden sm:flex absolute bottom-0 left-1/2 -translate-x-1/2 gap-2 z-20">
                {["Aa", "𝑨𝒂", "𝗔𝗮"].map((label, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-[#1a1a24] border border-white/[0.08] flex items-center justify-center text-sm text-gray-300 font-medium shadow-lg">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scroll indicator (only when no results) */}
          {!hasGenerated && (
            <div className="flex justify-center pt-4 pb-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center animate-bounce">
                <ChevronDown className="w-4 h-4 text-white/40" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          RESULTS SECTION — generated logos
          ═══════════════════════════════════════════════ */}
      {hasGenerated && (
        <section ref={resultsRef} className="py-10 bg-gray-50 min-h-[400px]">
          <div className="max-w-7xl mx-auto px-4">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  &ldquo;{businessName}&rdquo; logo designs
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {logos.length} designs generated
                  {keywords && <span className="text-gray-400"> &middot; keywords: {keywords}</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateLogos(businessName, keywords)}
                  disabled={loading}
                  className="text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-28">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Generating logos...</h3>
                <p className="text-gray-400 text-sm">Creating unique designs for &ldquo;{businessName}&rdquo;</p>
              </div>
            )}

            {/* Results grid */}
            {!loading && logos.length > 0 && (
              <LogoGrid
                logos={logos}
                onFavorite={toggleFavorite}
                favorites={favorites}
                columns={5}
              />
            )}

            {/* Load more */}
            {!loading && logos.length > 0 && (
              <div className="text-center mt-10">
                <Button variant="outline" size="lg" onClick={() => generateLogos(businessName, keywords)} className="shadow-sm">
                  <RefreshCw className="w-4 h-4" />
                  Generate More Designs
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          CONTENT SECTIONS — only show when no results
          ═══════════════════════════════════════════════ */}
      {!hasGenerated && (
        <>
          {/* HOW TO SECTION */}
          <section className="py-20 sm:py-28 bg-white">
            <div className="container-main">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">HOW TO</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4 max-w-xl">
                Create the perfect logo for your business, in seconds
              </h2>
              <div className="h-6 w-px bg-gray-200" />
              <p className="text-sm text-gray-500">
                PIXui&apos;s logo maker has thousands of premium logo designs created by our AI engine.
              </p>
              <p className="text-base text-gray-500 max-w-lg mb-16 leading-relaxed">
                Here&apos;s how it works:
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">1. Enter your business name</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    To get started with PIXui&apos;s logo maker, just enter your business name and let our
                    AI create amazing logo designs instantly.
                  </p>
                  <p className="text-gray-500 leading-relaxed mb-8 max-w-md">
                    You can browse thousands of logos tailored with
                    your business name and find a design that&apos;s perfect for you. Looking for a more specific
                    logo? No problem! You can enter keywords to refine the logos and find a design that really
                    suits your business.
                  </p>
                  <button
                    onClick={() => {
                      document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm rounded-lg transition-all shadow-md shadow-orange-500/20 active:scale-95"
                  >
                    Generate logo designs
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { bg: "#f8fafc", accent: "#059669", icon: "🏔️", name: "ALPINE", sub: "VENTURES" },
                    { bg: "#059669", accent: "#fff", icon: "🌊", name: "OCEANIC", sub: "STUDIOS" },
                    { bg: "#f0fdf4", accent: "#16a34a", icon: "🌱", name: "BLOOM", sub: "GARDENS" },
                    { bg: "#065f46", accent: "#fff", icon: "⛵", name: "HARBOR", sub: "DESIGNS" },
                  ].map((card, i) => (
                    <div key={i} className="aspect-square rounded-2xl flex flex-col items-center justify-center p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                         style={{ backgroundColor: card.bg }}>
                      <div className="text-3xl mb-2">{card.icon}</div>
                      <div className="text-xs font-bold tracking-[0.15em]" style={{ color: card.accent }}>{card.name}</div>
                      <div className="text-[8px] tracking-[0.2em] opacity-60" style={{ color: card.accent }}>{card.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* LOGO GRID SHOWCASE */}
          <section className="py-16 bg-gray-50 border-y border-gray-100">
            <div className="container-main">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {[
                  { bg: "#1e1b4b", icon: "✦", name: "NEXUS", sub: "LABS", c: "#818cf8" },
                  { bg: "#fefce8", icon: "L", name: "LUXE", sub: "COLLECTION", c: "#854d0e" },
                  { bg: "#f1f5f9", icon: "🔷", name: "CLARITY", sub: "DESIGN CO", c: "#334155" },
                  { bg: "#1e293b", icon: "L", name: "LUNAR", sub: "CREATIVE", c: "#94a3b8" },
                  { bg: "#fff", icon: "📐", name: "LOGO TEXT", sub: "HERE", c: "#6366f1" },
                  { bg: "#fef2f2", icon: "🌹", name: "ROSEWOOD", sub: "STUDIOS", c: "#dc2626" },
                  { bg: "#1a1a2e", icon: "⬡", name: "HEXA", sub: "TECH", c: "#7c3aed" },
                  { bg: "#ecfdf5", icon: "🍃", name: "VERDE", sub: "ORGANIC", c: "#059669" },
                  { bg: "#0f172a", icon: "★", name: "STELLAR", sub: "BRAND", c: "#f59e0b" },
                  { bg: "#fff7ed", icon: "☀️", name: "SOLARIS", sub: "ENERGY", c: "#ea580c" },
                  { bg: "#faf5ff", icon: "💐", name: "FLORA", sub: "BOUTIQUE", c: "#a855f7" },
                  { bg: "#1e3a5f", icon: "⚓", name: "MARITIME", sub: "CO.", c: "#38bdf8" },
                  { bg: "#fffbeb", icon: "🐝", name: "HONEYCOMB", sub: "STUDIOS", c: "#b45309" },
                  { bg: "#f0f9ff", icon: "❄️", name: "FROST", sub: "DIGITAL", c: "#0284c7" },
                  { bg: "#18181b", icon: "◈", name: "CARBON", sub: "DESIGN", c: "#a1a1aa" },
                ].map((tile, i) => (
                  <div key={i} className="aspect-square rounded-xl flex flex-col items-center justify-center p-3 hover:scale-[1.03] transition-transform cursor-pointer shadow-sm"
                       style={{ backgroundColor: tile.bg }}>
                    <div className="text-2xl mb-2" style={{ color: tile.c }}>{tile.icon}</div>
                    <div className="text-[10px] font-bold tracking-[0.12em]" style={{ color: tile.c }}>{tile.name}</div>
                    <div className="text-[7px] tracking-[0.18em] opacity-50" style={{ color: tile.c }}>{tile.sub}</div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <button
                  onClick={() => document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-900/30 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  Start Creating Your Logo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* DARK CTA BAND */}
          <section className="py-16 bg-[#0f0f13]">
            <div className="container-main text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Get started with PIXui&apos;s Logo Maker
              </h2>
              <p className="text-sm text-gray-400 mb-8 max-w-lg mx-auto">
                Enter your business name below and start creating your perfect logo in seconds.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).elements.namedItem("ctaName") as HTMLInputElement;
                  if (input.value.trim()) {
                    setBusinessName(input.value.trim());
                    generateLogos(input.value.trim(), "");
                    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
              >
                <input
                  name="ctaName"
                  type="text"
                  placeholder="Enter Your Business Name"
                  className="w-full sm:flex-1 h-12 px-5 rounded-lg bg-white/[0.08] border border-white/[0.12] text-white text-sm placeholder:text-gray-500 outline-none focus:border-indigo-400/50 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto h-12 px-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Get Started
                </button>
              </form>
            </div>
          </section>

          {/* DREAM LOGO SECTION */}
          <section className="py-20 sm:py-28 bg-white">
            <div className="container-main text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
                Make your dream logo — <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">in seconds!</span>
              </h2>
              <p className="text-gray-500 text-sm mb-14 max-w-md mx-auto">
                Our AI engine creates professional, beautiful, and unique logos tailored to your brand.
              </p>

              <div className="relative max-w-3xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full aspect-[16/7] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-6 p-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                      <div className="text-4xl mb-2">🎨</div>
                      <div className="text-xs font-bold text-gray-700 tracking-wider">INVICTA</div>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                      <div className="text-4xl mb-2">💎</div>
                      <div className="text-xs font-bold text-white/80 tracking-wider">GEMSTONE</div>
                    </div>
                    <div className="bg-indigo-600 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                      <div className="text-4xl mb-2">⚡</div>
                      <div className="text-xs font-bold text-white/90 tracking-wider">VOLTAIC</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
                {FEATURES.map((f) => (
                  <div key={f.title} className="text-center">
                    <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <f.icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="py-16 bg-gray-50 border-y border-gray-100">
            <div className="container-main text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 max-w-2xl mx-auto">
                Customers say PIXui is <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">the best logo maker</span>
            </h2>
              <p className="text-sm text-gray-400 mb-12 max-w-md mx-auto">
                Thousands of entrepreneurs trust us to build their brand identity.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {TESTIMONIALS.map((t) => (
                  <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW-TO STEPS */}
          <section className="py-20 sm:py-24 bg-white">
            <div className="container-main">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-3">FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 max-w-md">
                How do I make a logo with PIXui?
              </h2>
              <p className="text-sm text-gray-500 mb-12 max-w-lg">
                Getting started is easy with just a few simple steps. Let our AI do the heavy lifting.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {STEPS.map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className={`w-10 h-10 ${step.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-sm font-bold ${step.color}`}>{step.num}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="py-12 bg-[#0f0f13] border-t border-white/[0.06]">
            <div className="container-main">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).elements.namedItem("footerName") as HTMLInputElement;
                  if (input.value.trim()) {
                    setBusinessName(input.value.trim());
                    generateLogos(input.value.trim(), "");
                    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
              >
                <input
                  name="footerName"
                  type="text"
                  placeholder="Enter Your Business Name"
                  className="w-full sm:flex-1 h-12 px-5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm placeholder:text-gray-500 outline-none focus:border-indigo-400/50 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto h-12 px-8 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 inline ml-2" />
                </button>
              </form>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
