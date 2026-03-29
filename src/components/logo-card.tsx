"use client";

import { LogoConcept } from "@/lib/types";
import {
  Heart,
  Edit3,
  Monitor,
  Cpu,
  Code,
  Globe,
  Layers,
  Zap,
  BookOpen,
  Lightbulb,
  DollarSign,
  TrendingUp,
  BarChart,
  Home,
  Building,
  Coffee,
  Dumbbell,
  Trophy,
  Plane,
  Music,
  Camera,
  Briefcase,
  Hammer,
  Flower,
  Leaf,
  ShoppingCart,
  Heart as HeartIcon,
  Shield,
  Star,
  Target,
  MapPin,
  Key,
  Map,
  Compass,
  Film,
  Gamepad,
  Users,
  Wrench,
  Sparkles,
  Crown,
  Gem,
  Package,
  Tag,
  PenTool,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { loadGoogleFont } from "@/lib/google-fonts";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Monitor, Cpu, Code, Globe, Layers, Zap, BookOpen, Lightbulb,
  DollarSign, TrendingUp, BarChart, Home, Building, Coffee,
  Dumbbell, Trophy, Plane, Music, Camera, Briefcase, Hammer,
  Flower, Leaf, ShoppingCart, Heart: HeartIcon, Shield, Star,
  Target, MapPin, Key, Map, Compass, Film, Gamepad, Users,
  Wrench, Sparkles, Crown, Gem, Package, Tag, PenTool, Award,
};

/* ── Deterministic hash for consistent decoration per logo ── */
function idHash(str: string, max: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % max;
}

/* ══════════════════════════════════════════════════════════════
   SVG DECORATION LAYER — 8 unique background graphic patterns
   ══════════════════════════════════════════════════════════════ */
function DecorationLayer({ variant, c1, c2 }: { variant: number; c1: string; c2: string }) {
  const common = { className: "absolute inset-0 w-full h-full pointer-events-none" as string };
  switch (variant) {
    /* 0 — Offset circles + dashed ring */
    case 0:
      return (
        <svg {...common} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          <circle cx="225" cy="75" r="90" fill={c1} opacity={0.06} />
          <circle cx="225" cy="75" r="90" fill="none" stroke={c1} strokeWidth="1" opacity={0.09} />
          <circle cx="225" cy="75" r="58" fill="none" stroke={c1} strokeWidth="0.7" opacity={0.06} strokeDasharray="5 5" />
          <circle cx="45" cy="265" r="38" fill={c1} opacity={0.04} />
          <circle cx="45" cy="265" r="38" fill="none" stroke={c1} strokeWidth="0.5" opacity={0.06} />
        </svg>
      );
    /* 1 — Diagonal band + small circle */
    case 1:
      return (
        <svg {...common} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          <polygon points="0,258 300,155 300,192 0,295" fill={c1} opacity={0.055} />
          <polygon points="0,222 300,120 300,132 0,234" fill={c1} opacity={0.03} />
          <circle cx="262" cy="38" r="20" fill={c1} opacity={0.07} />
          <circle cx="262" cy="38" r="20" fill="none" stroke={c1} strokeWidth="0.6" opacity={0.1} />
          <line x1="30" y1="40" x2="80" y2="40" stroke={c1} strokeWidth="0.8" opacity={0.06} />
        </svg>
      );
    /* 2 — Corner brackets */
    case 2:
      return (
        <svg {...common} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          <path d="M20,20 L20,58 M20,20 L58,20" stroke={c1} strokeWidth="2.5" opacity={0.14} fill="none" strokeLinecap="round" />
          <path d="M280,20 L280,58 M280,20 L242,20" stroke={c1} strokeWidth="2.5" opacity={0.14} fill="none" strokeLinecap="round" />
          <path d="M20,280 L20,242 M20,280 L58,280" stroke={c1} strokeWidth="2.5" opacity={0.14} fill="none" strokeLinecap="round" />
          <path d="M280,280 L280,242 M280,280 L242,280" stroke={c1} strokeWidth="2.5" opacity={0.14} fill="none" strokeLinecap="round" />
          <circle cx="150" cy="150" r="70" fill="none" stroke={c1} strokeWidth="0.4" opacity={0.04} />
        </svg>
      );
    /* 3 — Abstract scattered shapes */
    case 3:
      return (
        <svg {...common} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          <polygon points="245,28 278,88 212,88" fill={c1} opacity={0.065} />
          <circle cx="52" cy="62" r="32" fill={c1} opacity={0.05} />
          <rect x="228" y="238" width="34" height="34" rx="6" fill={c1} opacity={0.045} transform="rotate(18 245 255)" />
          <circle cx="32" cy="272" r="14" fill={c1} opacity={0.05} />
          <line x1="85" y1="278" x2="215" y2="278" stroke={c1} strokeWidth="0.6" opacity={0.06} />
          <polygon points="270,180 285,208 255,208" fill="none" stroke={c1} strokeWidth="0.6" opacity={0.06} />
        </svg>
      );
    /* 4 — Accent lines + center dot */
    case 4:
      return (
        <svg {...common} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          <line x1="28" y1="56" x2="272" y2="56" stroke={c1} strokeWidth="0.5" opacity={0.065} />
          <line x1="48" y1="252" x2="252" y2="252" stroke={c1} strokeWidth="1.2" opacity={0.09} />
          <line x1="88" y1="258" x2="212" y2="258" stroke={c1} strokeWidth="0.6" opacity={0.05} />
          <circle cx="150" cy="252" r="2.5" fill={c1} opacity={0.15} />
          <rect x="14" y="125" width="3" height="50" rx="1.5" fill={c1} opacity={0.055} />
          <rect x="283" y="125" width="3" height="50" rx="1.5" fill={c1} opacity={0.055} />
        </svg>
      );
    /* 5 — Dot matrix pattern */
    case 5:
      return (
        <svg {...common} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          {[0, 1, 2, 3, 4, 5].map((r) =>
            [0, 1, 2, 3, 4, 5, 6].map((col) => (
              <circle
                key={`${r}-${col}`}
                cx={30 + col * 42}
                cy={25 + r * 52}
                r={1.6 + ((r + col) % 3) * 0.5}
                fill={c1}
                opacity={0.04 + ((r * col) % 5) * 0.007}
              />
            ))
          )}
        </svg>
      );
    /* 6 — Bottom wave + top accents */
    case 6:
      return (
        <svg {...common} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          <path d="M0,258 Q75,230 150,250 T300,228 L300,300 L0,300 Z" fill={c1} opacity={0.05} />
          <path d="M0,268 Q75,245 150,260 T300,242 L300,300 L0,300 Z" fill={c1} opacity={0.035} />
          <circle cx="22" cy="28" r="10" fill={c1} opacity={0.055} />
          <circle cx="278" cy="28" r="6" fill={c1} opacity={0.045} />
          <line x1="20" y1="42" x2="36" y2="42" stroke={c1} strokeWidth="0.6" opacity={0.06} />
        </svg>
      );
    /* 7 — Hexagonal accent + vertical line */
    default:
      return (
        <svg {...common} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
          <polygon points="245,40 278,60 278,100 245,120 212,100 212,60" fill="none" stroke={c1} strokeWidth="1.2" opacity={0.08} />
          <polygon points="245,50 270,65 270,95 245,110 220,95 220,65" fill={c1} opacity={0.035} />
          <line x1="245" y1="120" x2="245" y2="165" stroke={c1} strokeWidth="0.6" opacity={0.05} />
          <circle cx="38" cy="270" r="22" fill="none" stroke={c1} strokeWidth="0.6" opacity={0.055} />
          <circle cx="38" cy="270" r="8" fill={c1} opacity={0.04} />
        </svg>
      );
  }
}

/* ══════════════════════════════════════════════════════════════
   ACCENT DIVIDER — decorative separator between name & slogan
   ══════════════════════════════════════════════════════════════ */
function AccentDivider({ color, variant }: { color: string; variant: number }) {
  const v = variant % 5;
  const o = 0.3;
  if (v === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: o }}>
        <div style={{ width: 20, height: 1, backgroundColor: color }} />
        <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: color }} />
        <div style={{ width: 20, height: 1, backgroundColor: color }} />
      </div>
    );
  }
  if (v === 1) {
    return <div style={{ width: 36, height: 1.5, backgroundColor: color, opacity: 0.22, borderRadius: 1 }} />;
  }
  if (v === 2) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.22 }}>
        <div style={{ width: 3.5, height: 3.5, backgroundColor: color, transform: "rotate(45deg)" }} />
        <div style={{ width: 3.5, height: 3.5, backgroundColor: color, transform: "rotate(45deg)" }} />
        <div style={{ width: 3.5, height: 3.5, backgroundColor: color, transform: "rotate(45deg)" }} />
      </div>
    );
  }
  if (v === 3) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: o }}>
        <div style={{ width: 8, height: 1, backgroundColor: color }} />
        <div style={{ width: 16, height: 1, backgroundColor: color }} />
        <div style={{ width: 8, height: 1, backgroundColor: color }} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, opacity: 0.2 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", backgroundColor: color }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOGO CARD COMPONENT
   ══════════════════════════════════════════════════════════════ */
interface LogoCardProps {
  logo: LogoConcept;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export default function LogoCard({ logo, onFavorite, isFavorited = false }: LogoCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const IconComponent = ICON_MAP[logo.iconName] || Star;

  useEffect(() => { loadGoogleFont(logo.fontFamily); }, [logo.fontFamily]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited(!favorited);
    onFavorite?.(logo.id);
  };

  const initial = logo.businessName.charAt(0).toUpperCase();
  const fw = logo.fontWeight ?? 700;
  const ls = logo.letterSpacing ?? 0;
  const dv = idHash(logo.id, 8);       // decoration variant
  const av = idHash(logo.id + "a", 5); // accent divider variant
  const ff = `"${logo.fontFamily}", sans-serif`;

  /* ── Shared text styles ── */
  const nameStyle: React.CSSProperties = {
    color: logo.textColor,
    fontFamily: ff,
    fontWeight: fw,
    letterSpacing: `${Math.max(ls, 0.12)}em`,
    fontSize: 15,
    textTransform: "uppercase",
    lineHeight: 1.2,
    textAlign: "center",
  };
  const sloganStyle: React.CSSProperties = {
    color: logo.textColor,
    fontFamily: ff,
    fontWeight: 400,
    letterSpacing: "0.28em",
    fontSize: 9,
    textTransform: "uppercase",
    opacity: 0.5,
    lineHeight: 1.4,
    textAlign: "center",
  };

  /* ── Build the content for each layout ── */
  const renderContent = () => {
    switch (logo.layout) {

      /* ─── LETTERMARK ───────────────────────────────── */
      case "lettermark":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {/* Letter hero with glow backdrop */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: 115, height: 115, borderRadius: "50%", backgroundColor: logo.iconColor, opacity: 0.07 }} />
              <div style={{ position: "absolute", width: 115, height: 115, borderRadius: "50%", border: `1px solid ${logo.iconColor}`, opacity: 0.08 }} />
              <span style={{ position: "relative", color: logo.iconColor, fontFamily: ff, fontWeight: fw, fontSize: 92, lineHeight: 0.85 }}>{initial}</span>
            </div>
            <AccentDivider color={logo.textColor} variant={av} />
            <span style={nameStyle}>{logo.businessName}</span>
            {logo.tagline && <span style={sloganStyle}>{logo.tagline}</span>}
          </div>
        );

      /* ─── INITIAL-TOP ──────────────────────────────── */
      case "initial-top": {
        const shape = logo.iconShape || "circle";
        const sz = 76;
        const shS: React.CSSProperties = { width: sz, height: sz, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: logo.iconColor };
        if (shape === "circle") shS.borderRadius = "50%";
        else if (shape === "rounded-square") shS.borderRadius = 18;
        else if (shape === "hexagon") shS.clipPath = "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)";
        else if (shape === "shield") shS.clipPath = "polygon(50% 0%,100% 10%,100% 65%,50% 100%,0% 65%,0% 10%)";
        else if (shape === "diamond") { shS.transform = "rotate(45deg)"; shS.borderRadius = 10; }
        else shS.borderRadius = "50%";
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Outer decorative ring */}
              {(shape === "circle" || shape === "rounded-square" || !shape || shape === "none") && (
                <div style={{ position: "absolute", width: sz + 14, height: sz + 14, borderRadius: shape === "rounded-square" ? 22 : "50%", border: `1.5px dashed ${logo.iconColor}`, opacity: 0.18 }} />
              )}
              <div style={shS}>
                <span style={{ color: "#fff", fontFamily: ff, fontSize: 34, fontWeight: 700, ...(shape === "diamond" ? { transform: "rotate(-45deg)" } : {}) }}>{initial}</span>
              </div>
            </div>
            <AccentDivider color={logo.textColor} variant={av} />
            <span style={nameStyle}>{logo.businessName}</span>
            {logo.tagline && <span style={sloganStyle}>{logo.tagline}</span>}
          </div>
        );
      }

      /* ─── INITIAL-LEFT ─────────────────────────────── */
      case "initial-left":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <span style={{ color: logo.iconColor, fontFamily: ff, fontWeight: fw, fontSize: 68, lineHeight: 0.85 }}>{initial}</span>
              {/* Accent underline under letter */}
              <div style={{ position: "absolute", bottom: -3, left: "10%", right: "10%", height: 3, backgroundColor: logo.iconColor, opacity: 0.3, borderRadius: 2 }} />
            </div>
            {/* Vertical separator */}
            <div style={{ width: 1.5, height: 45, backgroundColor: logo.iconColor, opacity: 0.15, borderRadius: 1 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ ...nameStyle, textAlign: "left" }}>{logo.businessName}</span>
              {logo.tagline && <span style={{ ...sloganStyle, textAlign: "left" }}>{logo.tagline}</span>}
            </div>
          </div>
        );

      /* ─── ICON TOP ─────────────────────────────────── */
      case "icon-top":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {/* Icon in gradient circle container */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 62, height: 62, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: logo.iconColor + "14", border: `1.5px solid ${logo.iconColor}22` }}>
                <IconComponent style={{ color: logo.iconColor, width: 28, height: 28 }} />
              </div>
              {/* Outer ring */}
              <div style={{ position: "absolute", width: 74, height: 74, borderRadius: "50%", border: `0.8px solid ${logo.iconColor}`, opacity: 0.1 }} />
            </div>
            <AccentDivider color={logo.textColor} variant={av} />
            <div style={{ textAlign: "center" }}>
              <span style={nameStyle}>{logo.businessName}</span>
              {logo.tagline && <div style={{ ...sloganStyle, marginTop: 6 }}>{logo.tagline}</div>}
            </div>
          </div>
        );

      /* ─── ICON RIGHT ────────────────────────────────── */
      case "icon-right":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: "row-reverse" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: logo.iconColor + "14", border: `1.5px solid ${logo.iconColor}20` }}>
              <IconComponent style={{ color: logo.iconColor, width: 24, height: 24 }} />
            </div>
            <div style={{ width: 1.5, height: 38, backgroundColor: logo.iconColor, opacity: 0.12, borderRadius: 1 }} />
            <div style={{ textAlign: "right" }}>
              <span style={{ ...nameStyle, textAlign: "right" }}>{logo.businessName}</span>
              {logo.tagline && <div style={{ ...sloganStyle, marginTop: 4, textAlign: "right" }}>{logo.tagline}</div>}
            </div>
          </div>
        );

      /* ─── STACKED ───────────────────────────────────── */
      case "stacked":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: logo.iconColor + "16", border: `1.5px solid ${logo.iconColor}22`, position: "relative" }}>
              <IconComponent style={{ color: logo.iconColor, width: 26, height: 26 }} />
              {/* Small corner accent */}
              <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", backgroundColor: logo.iconColor, opacity: 0.25 }} />
            </div>
            <AccentDivider color={logo.textColor} variant={av} />
            <span style={nameStyle}>{logo.businessName}</span>
            {logo.tagline && <span style={sloganStyle}>{logo.tagline}</span>}
          </div>
        );

      /* ─── WORDMARK ──────────────────────────────────── */
      case "wordmark":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {/* Large styled business name with first-letter accent */}
            <div style={{ position: "relative", display: "inline-flex" }}>
              <span style={{ ...nameStyle, fontSize: 28, letterSpacing: `${Math.max(ls, 0.18)}em` }}>{logo.businessName}</span>
              {/* Underline accent */}
              <div style={{ position: "absolute", bottom: -4, left: 0, width: "40%", height: 2.5, backgroundColor: logo.iconColor, opacity: 0.35, borderRadius: 2 }} />
            </div>
            {logo.tagline && (
              <>
                <div style={{ height: 6 }} />
                <span style={sloganStyle}>{logo.tagline}</span>
              </>
            )}
          </div>
        );

      /* ─── MONOGRAM ──────────────────────────────────── */
      case "monogram": {
        const initials = logo.businessName.split(/\s+/).map(w => w[0]).join("").substring(0, 2).toUpperCase();
        const shape = logo.iconShape || "circle";
        const sz = 72;
        const shS: React.CSSProperties = { width: sz, height: sz, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: logo.iconColor };
        if (shape === "circle") shS.borderRadius = "50%";
        else if (shape === "rounded-square") shS.borderRadius = 16;
        else if (shape === "hexagon") shS.clipPath = "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)";
        else if (shape === "shield") shS.clipPath = "polygon(50% 0%,100% 10%,100% 65%,50% 100%,0% 65%,0% 10%)";
        else if (shape === "diamond") { shS.transform = "rotate(45deg)"; shS.borderRadius = 10; }
        else shS.borderRadius = "50%";
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {(shape === "circle" || !shape || shape === "none") && (
                <div style={{ position: "absolute", width: sz + 12, height: sz + 12, borderRadius: "50%", border: `1px solid ${logo.iconColor}`, opacity: 0.15 }} />
              )}
              <div style={shS}>
                <span style={{ color: "#fff", fontFamily: ff, fontSize: 28, fontWeight: 700, letterSpacing: "0.06em", ...(shape === "diamond" ? { transform: "rotate(-45deg)" } : {}) }}>{initials}</span>
              </div>
            </div>
            <span style={{ ...nameStyle, fontSize: 12 }}>{logo.businessName}</span>
          </div>
        );
      }

      /* ─── EMBLEM ────────────────────────────────────── */
      case "emblem":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Double ring */}
              <div style={{ position: "absolute", width: 88, height: 88, borderRadius: "50%", border: `1.5px solid ${logo.iconColor}`, opacity: 0.12 }} />
              <div style={{ width: 78, height: 78, borderRadius: "50%", border: `2px solid ${logo.iconColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <IconComponent style={{ color: logo.iconColor, width: 22, height: 22 }} />
                <span style={{ color: logo.textColor, fontFamily: ff, fontSize: 8.5, fontWeight: fw, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
                  {logo.businessName.length > 10 ? logo.businessName.substring(0, 10) : logo.businessName}
                </span>
              </div>
            </div>
            {logo.tagline && <span style={sloganStyle}>{logo.tagline}</span>}
          </div>
        );

      /* ─── BADGE ─────────────────────────────────────── */
      case "badge":
        return (
          <div style={{ border: `2px solid ${logo.iconColor}`, borderRadius: 10, padding: "14px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
            {/* Corner dots */}
            <div style={{ position: "absolute", top: -4, left: -4, width: 8, height: 8, borderRadius: "50%", backgroundColor: logo.iconColor, opacity: 0.2 }} />
            <div style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", backgroundColor: logo.iconColor, opacity: 0.2 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <IconComponent style={{ color: logo.iconColor, width: 20, height: 20 }} />
              <span style={{ ...nameStyle, fontSize: 16 }}>{logo.businessName}</span>
            </div>
            {logo.tagline && (
              <>
                <div style={{ width: "100%", height: 1, backgroundColor: logo.iconColor, opacity: 0.18 }} />
                <span style={sloganStyle}>{logo.tagline}</span>
              </>
            )}
          </div>
        );

      /* ─── MINIMAL ───────────────────────────────────── */
      case "minimal":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <IconComponent style={{ color: logo.iconColor, width: 22, height: 22 }} />
            <div style={{ width: 1, height: 20, backgroundColor: logo.iconColor, opacity: 0.15 }} />
            <span style={{ ...nameStyle, fontWeight: 500, textAlign: "left" }}>{logo.businessName}</span>
          </div>
        );

      /* ─── SPLIT ─────────────────────────────────────── */
      case "split":
        return (
          <div style={{ display: "flex", alignItems: "stretch", borderRadius: 12, overflow: "hidden", width: "88%", boxShadow: `0 2px 12px ${logo.iconColor}15` }}>
            <div style={{ backgroundColor: logo.iconColor, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 18px" }}>
              <IconComponent style={{ color: "#fff", width: 24, height: 24 }} />
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: logo.textColor + "06" }}>
              <span style={{ ...nameStyle, fontSize: 14, textAlign: "left" }}>{logo.businessName}</span>
              {logo.tagline && <span style={{ ...sloganStyle, marginTop: 3, textAlign: "left" }}>{logo.tagline}</span>}
            </div>
          </div>
        );

      /* ─── ICON LEFT (default) ───────────────────────── */
      default:
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: logo.iconColor + "14", border: `1.5px solid ${logo.iconColor}20` }}>
              <IconComponent style={{ color: logo.iconColor, width: 24, height: 24 }} />
            </div>
            <div>
              <span style={{ ...nameStyle, textAlign: "left" }}>{logo.businessName}</span>
              {logo.tagline && <div style={{ ...sloganStyle, marginTop: 4, textAlign: "left" }}>{logo.tagline}</div>}
            </div>
          </div>
        );
    }
  };

  /* ── AI-generated image card ── */
  if (logo.aiImageUrl) {
    return (
      <Link
        href={`/editor/${logo.id}?data=${encodeURIComponent(JSON.stringify(logo))}`}
        className="group relative block rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        <div className="aspect-square relative overflow-hidden">
          {/* AI image */}
          <img
            src={logo.aiImageUrl}
            alt={`Logo for ${logo.businessName}`}
            className="w-full h-full object-cover"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className="absolute z-30 top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <Heart className={`w-4 h-4 transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
          </button>

          {/* Edit overlay */}
          <div className="absolute z-30 bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Edit3 className="w-3 h-3 inline mr-1.5" />
              Customize
            </span>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Normal font/SVG card ── */
  return (
    <Link
      href={`/editor/${logo.id}?data=${encodeURIComponent(JSON.stringify(logo))}`}
      className="group relative block rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div
        className="aspect-square relative overflow-hidden flex items-center justify-center p-7"
        style={{ backgroundColor: logo.backgroundColor }}
      >
        {/* SVG decoration layer */}
        <DecorationLayer variant={dv} c1={logo.iconColor} c2={logo.textColor} />

        {/* Content layer */}
        <div className="relative z-10">{renderContent()}</div>

        {/* Hover overlay */}
        <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className="absolute z-30 top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        >
          <Heart className={`w-4 h-4 transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
        </button>

        {/* Edit overlay on hover */}
        <div className="absolute z-30 bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <span className="text-white text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Edit3 className="w-3 h-3 inline mr-1.5" />
            Customize
          </span>
        </div>
      </div>
    </Link>
  );
}
