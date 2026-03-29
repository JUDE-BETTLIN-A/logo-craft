"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AISalesChat from "@/components/ai-sales-chat";
import {
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  DollarSign,
  Users,
  MessageSquare,
  TrendingUp,
  Zap,
  Settings,
  RefreshCw,
  ExternalLink,
  Copy,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  Target,
  Hash,
  Building2,
  Briefcase,
  Package,
  Tag,
  Search,
  X,
  BarChart3,
  Eye,
} from "lucide-react";

/* ─── Constants ─── */
const BUSINESS_CATEGORIES = [
  { label: "Startup", icon: "🚀", color: "from-violet-500/20 to-violet-600/20 border-violet-500/30 text-violet-300" },
  { label: "Agency", icon: "🏢", color: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300" },
  { label: "Restaurant", icon: "🍽️", color: "from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-300" },
  { label: "E-Commerce", icon: "🛒", color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-300" },
  { label: "Healthcare", icon: "🏥", color: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-300" },
  { label: "Real Estate", icon: "🏠", color: "from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-300" },
  { label: "Fitness", icon: "💪", color: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-300" },
  { label: "Education", icon: "📚", color: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 text-indigo-300" },
  { label: "Finance", icon: "💰", color: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-300" },
  { label: "Fashion", icon: "👗", color: "from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-300" },
  { label: "Legal", icon: "⚖️", color: "from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300" },
  { label: "Tech", icon: "💻", color: "from-sky-500/20 to-sky-600/20 border-sky-500/30 text-sky-300" },
];

const STYLE_KEYWORDS = [
  "Modern", "Minimalist", "Bold", "Elegant", "Playful",
  "Geometric", "Vintage", "Classic", "Luxury", "Corporate",
  "Creative", "Professional", "Artistic", "Clean", "Dynamic",
];

const NICHE_KEYWORDS = [
  "Logo Design", "Brand Identity", "Visual Identity", "Wordmark",
  "Lettermark", "Emblem", "Monogram", "Icon Design", "Brand Kit",
  "Social Media Kit", "Business Card", "Stationery Design",
];

const PRICING_TIERS = [
  { name: "Basic", price: 49, features: ["Simple logo", "2 revisions", "PNG + SVG"], icon: Package, accent: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { name: "Standard", price: 99, features: ["Logo + 3 variants", "5 revisions", "All formats"], icon: Briefcase, accent: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  { name: "Premium", price: 199, features: ["Full logo suite", "Unlimited revisions", "Social media kit"], icon: Target, accent: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { name: "Brand Kit", price: 499, features: ["Complete identity", "Brand guidelines", "All templates"], icon: Building2, accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
];

/* ─── Types ─── */
interface Conversation {
  chatId: number;
  clientName: string;
  clientUsername?: string;
  messages: { role: string; text: string; timestamp: number }[];
  status: "new" | "negotiating" | "agreed" | "closed" | "rejected";
  logoInterest?: string;
  proposedPrice?: number;
  agreedPrice?: number;
  createdAt: number;
}

interface Stats {
  total: number;
  active: number;
  agreed: number;
  closed: number;
  revenue: number;
}

interface BotInfo {
  ok: boolean;
  bot?: { username: string; first_name: string };
  webhook?: { url: string; pending_update_count: number };
}

type Tab = "pipeline" | "keywords" | "chat" | "setup";

/* ─── Sell Dashboard ─── */
export default function SellPage() {
  /* ── State ── */
  const [tab, setTab] = useState<Tab>("keywords");
  const [botToken, setBotToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    agreed: 0,
    closed: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [setupMsg, setSetupMsg] = useState("");
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

  // Keyword targeting state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState("");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [businessNameInput, setBusinessNameInput] = useState("");
  const [businessNames, setBusinessNames] = useState<string[]>([]);

  /* ── Data fetching ── */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-negotiate");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
      setStats(data.stats ?? stats);
    } catch {
      /* silent */
    }
  }, []);

  const fetchBotStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/telegram/setup");
      if (!res.ok) return;
      const data = await res.json();
      setBotInfo(data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchBotStatus();
    const iv = setInterval(fetchConversations, 15000);
    return () => clearInterval(iv);
  }, [fetchConversations, fetchBotStatus]);

  /* ── Telegram setup ── */
  const handleSetup = async () => {
    if (!botToken.trim()) {
      setSetupMsg("Enter your Telegram bot token first.");
      return;
    }
    setLoading(true);
    setSetupMsg("");
    try {
      const url = webhookUrl.trim() || `${window.location.origin}/api/telegram/webhook`;
      const res = await fetch("/api/telegram/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: botToken.trim(), webhookUrl: url }),
      });
      const data = await res.json();
      if (data.ok) {
        setSetupMsg("Bot connected successfully! Clients can now message your bot.");
        fetchBotStatus();
      } else {
        setSetupMsg(`Setup failed: ${data.error || "Unknown error"}`);
      }
    } catch (e: unknown) {
      setSetupMsg(`Error: ${e instanceof Error ? e.message : "Connection failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch("/api/telegram/setup", { method: "DELETE" });
      setBotInfo(null);
      setSetupMsg("Bot disconnected.");
    } catch {
      setSetupMsg("Failed to disconnect.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Keyword helpers ── */
  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  const toggleStyle = (s: string) =>
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  const toggleNiche = (n: string) =>
    setSelectedNiches((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  const addCustomKeyword = () => {
    const k = customKeyword.trim();
    if (k && !customKeywords.includes(k)) {
      setCustomKeywords((prev) => [...prev, k]);
      setCustomKeyword("");
    }
  };
  const removeCustomKeyword = (k: string) =>
    setCustomKeywords((prev) => prev.filter((x) => x !== k));
  const addBusinessName = () => {
    const n = businessNameInput.trim();
    if (n && !businessNames.includes(n)) {
      setBusinessNames((prev) => [...prev, n]);
      setBusinessNameInput("");
    }
  };
  const removeBusinessName = (n: string) =>
    setBusinessNames((prev) => prev.filter((x) => x !== n));

  const allSelectedKeywords = [
    ...selectedCategories,
    ...selectedStyles,
    ...selectedNiches,
    ...customKeywords,
  ];

  /* ── Helpers ── */
  const statusColor = (s: string) => {
    switch (s) {
      case "new":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "negotiating":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "agreed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "closed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyText = (t: string) => {
    try {
      navigator.clipboard.writeText(t);
    } catch {
      /* fallback */
    }
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-[#08081a] text-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }} />
        {/* Gradient orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300 tracking-wide uppercase">
                AI-Powered B2B Sales
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Sell Your Logos
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                to Business Clients
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Target the right businesses, let AI negotiate pricing, and close
              deals via Telegram — all from your dashboard.
            </p>
          </div>

          {/* Stats bar */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-4xl mx-auto">
            {[
              { icon: Users, label: "Total Leads", val: stats.total, color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: MessageSquare, label: "Active Chats", val: stats.active, color: "text-amber-400", bg: "bg-amber-500/10" },
              { icon: CheckCircle2, label: "Deals Made", val: stats.agreed + stats.closed, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: DollarSign, label: "Revenue", val: `$${stats.revenue.toLocaleString()}`, color: "text-violet-400", bg: "bg-violet-500/10" },
            ].map((s) => (
              <div
                key={s.label}
                className="group relative bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all duration-300"
              >
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                </div>
                <p className="text-3xl font-extrabold tracking-tight">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab Bar ── */}
      <div className="sticky top-0 z-30 bg-[#08081a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0.5 overflow-x-auto scrollbar-none py-3">
            {(
              [
                { id: "keywords" as Tab, label: "Keywords & Targeting", icon: Hash },
                { id: "pipeline" as Tab, label: "Sales Pipeline", icon: TrendingUp },
                { id: "chat" as Tab, label: "AI Assistant", icon: Bot },
                { id: "setup" as Tab, label: "Bot Setup", icon: Settings },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 ${
                  tab === t.id
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* ─────── KEYWORDS TAB ─────── */}
        {tab === "keywords" && (
          <div className="space-y-8">
            {/* Business Names */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-violet-500/20">
                  <Building2 className="w-4.5 h-4.5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Business Names</h2>
                  <p className="text-xs text-gray-500">Add target business names to track and pitch to</p>
                </div>
              </div>

              <Card className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-5">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <Input
                      value={businessNameInput}
                      onChange={(e) => setBusinessNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBusinessName())}
                      placeholder="Enter a business name..."
                      className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 rounded-xl h-11"
                    />
                  </div>
                  <Button
                    onClick={addBusinessName}
                    className="bg-violet-600 hover:bg-violet-700 rounded-xl px-5 h-11"
                    disabled={!businessNameInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {businessNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {businessNames.map((name) => (
                      <div
                        key={name}
                        className="group flex items-center gap-2 pl-3.5 pr-2 py-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl hover:border-violet-500/40 transition-all"
                      >
                        <Building2 className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-sm font-medium text-violet-200">{name}</span>
                        <button
                          onClick={() => removeBusinessName(name)}
                          className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-500 group-hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-600 text-sm">
                    No business names added yet. Type above and press Enter or click Add.
                  </div>
                )}
              </Card>
            </section>

            {/* Business Categories */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Target className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Business Categories</h2>
                  <p className="text-xs text-gray-500">Select industries you want to target</p>
                </div>
                {selectedCategories.length > 0 && (
                  <Badge className="ml-auto bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">
                    {selectedCategories.length} selected
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {BUSINESS_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.label);
                  return (
                    <button
                      key={cat.label}
                      onClick={() => toggleCategory(cat.label)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 text-center ${
                        isSelected
                          ? `bg-gradient-to-b ${cat.color} shadow-lg scale-[1.02]`
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-xs font-semibold ${isSelected ? "" : "text-gray-400"}`}>
                        {cat.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Style Keywords */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Style Keywords</h2>
                  <p className="text-xs text-gray-500">Design styles you specialize in</p>
                </div>
                {selectedStyles.length > 0 && (
                  <Badge className="ml-auto bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs">
                    {selectedStyles.length} selected
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {STYLE_KEYWORDS.map((s) => {
                  const isSelected = selectedStyles.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStyle(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-500/30 text-amber-300 shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 inline mr-1.5 -mt-0.5" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Niche / Service Keywords */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <Tag className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Service Keywords</h2>
                  <p className="text-xs text-gray-500">Services you offer to clients</p>
                </div>
                {selectedNiches.length > 0 && (
                  <Badge className="ml-auto bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-xs">
                    {selectedNiches.length} selected
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {NICHE_KEYWORDS.map((n) => {
                  const isSelected = selectedNiches.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleNiche(n)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-500/15 to-green-500/15 border-emerald-500/30 text-emerald-300 shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 inline mr-1.5 -mt-0.5" />}
                      {n}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Custom Keywords */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl flex items-center justify-center border border-pink-500/20">
                  <Hash className="w-4.5 h-4.5 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Custom Keywords</h2>
                  <p className="text-xs text-gray-500">Add your own custom targeting keywords</p>
                </div>
              </div>

              <Card className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-5">
                <div className="flex gap-2 mb-4">
                  <Input
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomKeyword())}
                    placeholder="e.g. SaaS branding, medical logo, crypto..."
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 rounded-xl h-11"
                  />
                  <Button
                    onClick={addCustomKeyword}
                    disabled={!customKeyword.trim()}
                    className="bg-pink-600 hover:bg-pink-700 rounded-xl px-5 h-11"
                  >
                    Add
                  </Button>
                </div>

                {customKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customKeywords.map((k) => (
                      <div
                        key={k}
                        className="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-xl"
                      >
                        <Hash className="w-3 h-3 text-pink-400" />
                        <span className="text-sm text-pink-200">{k}</span>
                        <button
                          onClick={() => removeCustomKeyword(k)}
                          className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-500 group-hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            {/* Summary + Pricing */}
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Selected keywords summary */}
              <Card className="lg:col-span-3 bg-white/[0.03] border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    Your Targeting Profile
                  </h3>
                  <Badge className="bg-white/[0.06] text-gray-400 border-white/[0.08]">
                    {allSelectedKeywords.length + businessNames.length} keywords
                  </Badge>
                </div>

                {allSelectedKeywords.length === 0 && businessNames.length === 0 ? (
                  <div className="text-center py-10 text-gray-600">
                    <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select categories, styles, and services above to build your targeting profile.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {businessNames.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Business Names</p>
                        <div className="flex flex-wrap gap-1.5">
                          {businessNames.map((n) => (
                            <span key={n} className="px-2.5 py-1 text-xs font-medium bg-violet-500/15 text-violet-300 rounded-lg border border-violet-500/20">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCategories.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Industries</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCategories.map((c) => (
                            <span key={c} className="px-2.5 py-1 text-xs font-medium bg-blue-500/15 text-blue-300 rounded-lg border border-blue-500/20">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedStyles.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Styles</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStyles.map((s) => (
                            <span key={s} className="px-2.5 py-1 text-xs font-medium bg-amber-500/15 text-amber-300 rounded-lg border border-amber-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedNiches.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Services</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNiches.map((n) => (
                            <span key={n} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-300 rounded-lg border border-emerald-500/20">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {customKeywords.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Custom</p>
                        <div className="flex flex-wrap gap-1.5">
                          {customKeywords.map((k) => (
                            <span key={k} className="px-2.5 py-1 text-xs font-medium bg-pink-500/15 text-pink-300 rounded-lg border border-pink-500/20">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Pricing reference */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Your Pricing Tiers
                </h3>
                {PRICING_TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border ${tier.accent}`}
                  >
                    <tier.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-white">{tier.name}</p>
                        <p className="font-extrabold text-sm">${tier.price}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {tier.features.join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────── PIPELINE TAB ─────── */}
        {tab === "pipeline" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                  <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold">Client Pipeline</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchConversations}
                className="gap-1.5 border-white/[0.08] text-gray-400 hover:bg-white/[0.04] rounded-xl"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2">
              {(["all", "new", "negotiating", "agreed", "closed", "rejected"] as const).map((s) => (
                <Badge
                  key={s}
                  className={`cursor-default px-3 py-1.5 text-xs font-medium rounded-lg ${
                    s === "all"
                      ? "bg-white/[0.06] text-gray-300 border-white/[0.08]"
                      : statusColor(s)
                  }`}
                >
                  {s === "all" ? `All (${conversations.length})` : `${s} (${conversations.filter(c => c.status === s).length})`}
                </Badge>
              ))}
            </div>

            {conversations.length === 0 ? (
              <Card className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-14 text-center">
                <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Bot className="w-8 h-8 text-violet-400 opacity-60" />
                </div>
                <h3 className="text-lg font-bold text-gray-300">
                  No conversations yet
                </h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
                  Connect your Telegram bot in <b className="text-gray-400">Bot Setup</b>, then
                  share your bot link with potential clients. The AI will handle
                  negotiations for you!
                </p>
                <Button
                  className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl px-6"
                  onClick={() => setTab("setup")}
                >
                  <Settings className="w-4 h-4 mr-2" /> Setup Bot
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversations.map((c) => (
                  <Card
                    key={c.chatId}
                    className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-5 hover:border-violet-500/20 transition-all duration-200 cursor-pointer group"
                    onClick={() =>
                      setSelectedConvo(selectedConvo?.chatId === c.chatId ? null : c)
                    }
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-sm font-bold text-violet-300">
                            {c.clientName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {c.clientName}
                          </p>
                          {c.clientUsername && (
                            <p className="text-[11px] text-gray-500">
                              @{c.clientUsername}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${statusColor(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </div>

                    {c.logoInterest && (
                      <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-violet-400" />
                        {c.logoInterest}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/[0.04]">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {c.messages.length} messages
                      </span>
                      {c.agreedPrice ? (
                        <span className="text-emerald-400 font-bold">
                          ${c.agreedPrice}
                        </span>
                      ) : c.proposedPrice ? (
                        <span className="text-amber-400 font-medium">
                          ${c.proposedPrice} proposed
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[11px] text-gray-600 mt-2">
                      {fmtTime(c.createdAt)}
                    </p>

                    {/* Expanded view */}
                    {selectedConvo?.chatId === c.chatId && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2 max-h-64 overflow-y-auto">
                        {c.messages.map((m, i) => (
                          <div
                            key={i}
                            className={`text-xs p-3 rounded-xl ${
                              m.role === "assistant"
                                ? "bg-violet-500/8 text-violet-200 border border-violet-500/10"
                                : "bg-white/[0.03] text-gray-300 border border-white/[0.04]"
                            }`}
                          >
                            <span className="font-bold text-[10px] uppercase text-gray-500 block mb-1">
                              {m.role === "assistant" ? "AI Bot" : c.clientName}
                            </span>
                            <p>{m.text}</p>
                            <button
                              className="text-[10px] text-gray-600 hover:text-gray-400 mt-1.5 flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyText(m.text);
                              }}
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────── AI CHAT TAB ─────── */}
        {tab === "chat" && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <AISalesChat />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-5">
                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-amber-400" /> Quick Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  {[
                    "Use the AI assistant to compose professional negotiation messages you can paste directly into Telegram.",
                    <>The AI auto-suggests pricing — Basic $49, Standard $99, Premium $199, Brand Kit $499.</>,
                    <>Ask <b className="text-white">&quot;Generate a pitch&quot;</b> to get a ready-made sales pitch.</>,
                    "When clients negotiate down, the AI proposes a middle-ground offer to keep both sides happy.",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-5 h-5 bg-violet-500/10 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ArrowRight className="w-3 h-3 text-violet-400" />
                      </div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-5">
                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-cyan-400" /> How It Works
                </h3>
                <ol className="space-y-3 text-sm text-gray-400">
                  {[
                    <>Connect your Telegram bot in <b className="text-white">Bot Setup</b>.</>,
                    <>Share your bot link {botInfo?.bot?.username && <span className="text-cyan-400">(t.me/{botInfo.bot.username})</span>} with clients.</>,
                    "Clients message your bot — AI replies instantly.",
                    <>Track conversations in the <b className="text-white">Sales Pipeline</b>.</>,
                    "Use the AI Assistant to craft custom responses or pitches.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-5 h-5 bg-cyan-500/10 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-cyan-400">
                        {i + 1}
                      </div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card className="bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border-violet-500/15 rounded-2xl p-5">
                <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Pro Tips
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Always deliver a preview watermarked image first. Only share
                  final files after receiving payment. The AI respects this
                  workflow automatically.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* ─────── SETUP TAB ─────── */}
        {tab === "setup" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-400" /> Telegram Bot Status
              </h3>

              {botInfo?.ok ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-4">
                    <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-300">
                        Connected — @{botInfo.bot?.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {botInfo.bot?.first_name}
                      </p>
                    </div>
                  </div>

                  {botInfo.webhook?.url && (
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 px-1">
                      <Globe className="w-3.5 h-3.5" />
                      Webhook: {botInfo.webhook.url}
                      {botInfo.webhook.pending_update_count > 0 && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                          {botInfo.webhook.pending_update_count} pending
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <a
                      href={`https://t.me/${botInfo.bot?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 gap-1.5 rounded-xl"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Bot
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl"
                      onClick={handleDisconnect}
                      disabled={loading}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                  <XCircle className="w-5 h-5 text-gray-500" />
                  <p className="text-gray-400">No bot connected</p>
                </div>
              )}
            </Card>

            <Card className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-1">
                Connect a New Bot
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Create a bot via{" "}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline"
                >
                  @BotFather
                </a>{" "}
                on Telegram and paste the token below.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Bot Token
                  </label>
                  <Input
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v..."
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 rounded-xl h-11"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Webhook URL{" "}
                    <span className="text-gray-600 font-normal">(auto-detected)</span>
                  </label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "https://yourdomain.com"
                    }/api/telegram/webhook`}
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 rounded-xl h-11"
                  />
                  <p className="text-[11px] text-gray-600 mt-1.5">
                    Must be a public HTTPS URL. Use ngrok for local development.
                  </p>
                </div>

                {setupMsg && (
                  <p
                    className={`text-sm p-3 rounded-xl ${
                      setupMsg.includes("success")
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        : "bg-red-500/10 text-red-400 border border-red-500/15"
                    }`}
                  >
                    {setupMsg}
                  </p>
                )}

                <Button
                  onClick={handleSetup}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2 rounded-xl h-11"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? "Connecting…" : "Connect Bot"}
                </Button>
              </div>
            </Card>

            <Card className="bg-white/[0.03] border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5">
                Getting Started
              </h3>
              <div className="space-y-5">
                {[
                  {
                    step: 1,
                    title: "Create a Telegram Bot",
                    desc: "Open Telegram → search @BotFather → /newbot → follow prompts. Copy the API token.",
                  },
                  {
                    step: 2,
                    title: "Connect Here",
                    desc: "Paste your token above and click Connect. We'll register the webhook automatically.",
                  },
                  {
                    step: 3,
                    title: "Share Your Bot Link",
                    desc: "Send the t.me/YourBot link to potential clients or add it to your portfolio.",
                  },
                  {
                    step: 4,
                    title: "AI Handles Negotiations",
                    desc: "When clients message your bot, AI responds with pricing, portfolio info, and proposals.",
                  },
                  {
                    step: 5,
                    title: "Close Deals",
                    desc: "Monitor the Sales Pipeline tab. Jump into any conversation to take over manually.",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {s.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
