"use client";

import SearchForm from "@/components/search-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sparkles,
  Palette,
  Download,
  Layers,
  Zap,
  Shield,
  ArrowRight,
  Star,
  CheckCircle,
  Monitor,
  Smartphone,
  FileText,
  Crown,
} from "lucide-react";
import { INDUSTRIES } from "@/lib/types";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Generate thousands of unique logo concepts instantly using our intelligent design engine.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Palette,
    title: "Full Customization",
    description: "Modify colors, fonts, icons, and layouts with our intuitive real-time logo editor.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Download,
    title: "Multi-Format Download",
    description: "Export your logos in PNG, JPG, and SVG formats with transparent background support.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Layers,
    title: "Brand Kit Builder",
    description: "Extend your logo into business cards, social media banners, and complete brand assets.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "No waiting. Get professional logo options in seconds, not days or weeks.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Shield,
    title: "Commercial License",
    description: "Full commercial usage rights included. Use your logo anywhere, worry-free.",
    color: "bg-sky-50 text-sky-600",
  },
];

const STATS = [
  { number: "50K+", label: "Logos Created" },
  { number: "10K+", label: "Happy Users" },
  { number: "1000+", label: "Templates" },
  { number: "4.9", label: "User Rating" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Enter Your Brand Name",
    description: "Type your business name and select your industry for tailored results.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Browse AI Designs",
    description: "Our AI generates dozens of unique logo concepts matched to your brand.",
    icon: Monitor,
  },
  {
    step: "03",
    title: "Customize & Perfect",
    description: "Fine-tune colors, fonts, icons, and layout in our powerful editor.",
    icon: Palette,
  },
  {
    step: "04",
    title: "Download & Use",
    description: "Export in multiple formats ready for web, print, and social media.",
    icon: Download,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero Section ──────────────────────────────── */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-indigo-100/60 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-[360px] h-[360px] bg-purple-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3  w-[280px] h-[280px] bg-pink-100/30  rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="container-main text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-sm text-indigo-600 font-medium mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Logo Design Platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6 animate-slide-up max-w-3xl mx-auto">
            Create Your Perfect
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Logo in Seconds
            </span>
          </h1>

          {/* Sub-heading */}
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Generate stunning, professional logos instantly with AI. Customize every detail,
            download in any format, and build your complete brand identity.
          </p>

          {/* Search */}
          <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <SearchForm />
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 animate-fade-in" style={{ animationDelay: "0.35s" }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stat.number}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industry Tags ─────────────────────────────── */}
      <section className="py-14 bg-gray-50 border-y border-gray-100">
        <div className="container-main">
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Logo Templates by Industry</h2>
            <p className="text-sm text-gray-400">Browse designs tailored to your business type</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry}
                href={`/generate?industry=${encodeURIComponent(industry)}&name=My+Business`}
                className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all"
              >
                {industry}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="container-main">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-base text-gray-500 max-w-md mx-auto">Create a professional logo in four simple steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-indigo-200 to-transparent" />
                )}
                <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <item.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <span className="text-[11px] font-bold text-indigo-500 tracking-[0.15em] uppercase block mb-2">Step {item.step}</span>
                <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-gray-50 border-y border-gray-100">
        <div className="container-main">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Everything You Need to Build Your Brand</h2>
            <p className="text-base text-gray-500 max-w-lg mx-auto">From AI generation to full brand kits, we&apos;ve got you covered</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="container-main">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Loved by Entrepreneurs</h2>
            <p className="text-base text-gray-500">See what our users are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Startup Founder",
                text: "I got a professional logo for my startup in under 5 minutes. The AI-generated designs were exactly what I was looking for!",
              },
              {
                name: "Michael Chen",
                role: "Freelance Designer",
                text: "Amazing tool for rapid prototyping. I use it to generate initial concepts and then refine them in the editor. Saves me hours.",
              },
              {
                name: "Emma Williams",
                role: "Small Business Owner",
                text: "The brand kit feature is incredible. I got my logo, business cards, and social media templates all in one place.",
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Kit Preview ─────────────────────────── */}
      <section className="py-20 sm:py-24 bg-gray-50 border-y border-gray-100">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left – copy */}
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">Brand Kit</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Complete Brand Kit at Your Fingertips</h2>
              <p className="text-base text-gray-500 mb-8 leading-relaxed">
                Don&apos;t stop at a logo. Generate matching business cards, social media graphics,
                letterheads, and more — all with consistent branding.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Business card designs",
                  "Social media banners & posts",
                  "Letterheads & stationery",
                  "Website favicon & app icons",
                  "Email signature templates",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/generate?name=My+Brand">
                <Button variant="gradient" size="lg">
                  Start Building Your Brand
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Right – mock cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Website</span>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg" />
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Business Card</span>
                  </div>
                  <div className="h-16 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg" />
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Social Media</span>
                  </div>
                  <div className="h-24 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg" />
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Letterhead</span>
                  </div>
                  <div className="h-16 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute inset-0 animate-shimmer" />
        <div className="container-main text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to Create Your Brand?
          </h2>
          <p className="text-base sm:text-lg text-white/70 mb-10 max-w-lg mx-auto leading-relaxed">
            Join thousands of entrepreneurs who&apos;ve built their brand identity with LogoCraft AI.
            Start free, no credit card required.
          </p>
          <Link href="/generate?name=My+Brand">
            <Button
              size="xl"
              className="bg-white text-indigo-600 hover:bg-gray-50 shadow-xl shadow-indigo-900/20 font-semibold px-10"
            >
              <Sparkles className="w-5 h-5" />
              Create Your Logo Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
