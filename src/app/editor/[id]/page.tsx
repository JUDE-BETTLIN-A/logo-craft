"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { generateId } from "@/lib/utils";
import { useSearchParams, useParams } from "next/navigation";
import { LogoConcept, FONT_OPTIONS, COLOR_PALETTES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadGoogleFont, loadGoogleFonts, ALL_LOGO_FONTS } from "@/lib/google-fonts";
import { generateAIPalette, type ColorPalette } from "@/lib/colormind";
import { searchIcons, getIconSVG, type IconifyIcon } from "@/lib/iconify";
import {
  Download,
  Undo2,
  Type,
  Palette,
  Box,
  Layout,
  Sparkles,
  ChevronLeft,
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
  Heart,
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
  Crown,
  Gem,
  Package,
  Tag,
  PenTool,
  Award,
  Loader2,
  Search,
  Wand2,
  Move,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Monitor, Cpu, Code, Globe, Layers, Zap, BookOpen, Lightbulb,
  DollarSign, TrendingUp, BarChart, Home, Building, Coffee,
  Dumbbell, Trophy, Plane, Music, Camera, Briefcase, Hammer,
  Flower, Leaf, ShoppingCart, Heart, Shield, Star, Target,
  MapPin, Key, Map, Compass, Film, Gamepad, Users, Wrench,
  Sparkles, Crown, Gem, Package, Tag, PenTool, Award,
};
const AVAILABLE_ICONS = Object.keys(ICON_MAP);

type CanvasElement = "icon" | "name" | "tagline" | null;
type Pos = { x: number; y: number };

function EditorContent() {
  const searchParams = useSearchParams();
  const params = useParams();

  const [logo, setLogo] = useState<LogoConcept | null>(null);
  const [history, setHistory] = useState<LogoConcept[]>([]);

  const [iconPos, setIconPos] = useState<Pos>({ x: 0, y: 0 });
  const [namePos, setNamePos] = useState<Pos>({ x: 0, y: 0 });
  const [taglinePos, setTaglinePos] = useState<Pos>({ x: 0, y: 0 });

  const [selectedElement, setSelectedElement] = useState<CanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPos: Pos } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState(28);
  const [iconSize, setIconSize] = useState(52);
  const [spacing, setSpacing] = useState(16);
  const [tagline, setTagline] = useState("");
  const [taglineFontSize, setTaglineFontSize] = useState(13);
  const [borderRadius, setBorderRadius] = useState(0);
  const [shadow, setShadow] = useState(false);
  const [bgPadding, setBgPadding] = useState(48);

  const [aiImage, setAiImage] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showOverlayText, setShowOverlayText] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const importFileRef = useRef<HTMLInputElement>(null);

  const [aiPalettes, setAiPalettes] = useState<ColorPalette[]>([]);
  const [loadingPalettes, setLoadingPalettes] = useState(false);

  const [iconSearch, setIconSearch] = useState("");
  const [iconifyResults, setIconifyResults] = useState<IconifyIcon[]>([]);
  const [iconifySvgs, setIconifySvgs] = useState<Record<string, string>>({});
  const [searchingIcons, setSearchingIcons] = useState(false);
  const iconSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [iconifySvgPreview, setIconifySvgPreview] = useState<string>("");

  type PanelTab = "text" | "colors" | "icon" | "layout";
  const [activePanel, setActivePanel] = useState<PanelTab>("text");

  useEffect(() => { loadGoogleFonts(ALL_LOGO_FONTS); }, []);
  useEffect(() => { if (logo?.fontFamily) loadGoogleFont(logo.fontFamily); }, [logo?.fontFamily]);

  useEffect(() => {
    const id = params.id as string;
    let parsed: LogoConcept | null = null;

    // Try localStorage first (used by dashboard to avoid huge URL params)
    const storedData = localStorage.getItem(`logo_edit_${id}`);
    if (storedData) {
      try {
        parsed = JSON.parse(storedData);
        // Clean up after reading
        localStorage.removeItem(`logo_edit_${id}`);
      } catch { /* ignore */ }
    }

    // Fall back to URL params
    if (!parsed) {
      const data = searchParams.get("data");
      if (data) {
        try {
          parsed = JSON.parse(decodeURIComponent(data));
        } catch { /* ignore */ }
      }
    }

    if (parsed) {
      setLogo(parsed);
      setTagline(parsed.tagline || "");
      // If the logo has an imported/AI image, auto-load it
      if (parsed.aiImageUrl) {
        setAiImage(parsed.aiImageUrl);
        // For imported logos, set white text for readability on image backgrounds
        if (parsed.aiStyleName === "Imported") {
          parsed.textColor = "#FFFFFF";
          parsed.iconColor = "#FFFFFF";
          setLogo({ ...parsed, textColor: "#FFFFFF", iconColor: "#FFFFFF" });
        }
      }
    } else {
      setLogo({
        id, name: "My Logo", businessName: "My Business",
        industry: "Technology", style: "modern", colors: ["#4F46E5", "#7C3AED", "#E0E7FF"],
        fontFamily: "Inter", iconName: "Star", layout: "icon-left",
        backgroundColor: "#FFFFFF", textColor: "#1F2937", iconColor: "#4F46E5", createdAt: new Date(),
      });
    }
  }, [searchParams, params.id]);

  const isIconifyIcon = logo?.iconName?.startsWith("iconify:") ?? false;
  useEffect(() => {
    if (isIconifyIcon && logo) {
      const fullName = logo.iconName.replace("iconify:", "");
      const [prefix, ...nameParts] = fullName.split(":");
      const name = nameParts.join(":");
      getIconSVG(prefix, name, { width: iconSize, height: iconSize, color: logo.iconColor }).then(setIconifySvgPreview);
    }
  }, [logo?.iconName, logo?.iconColor, iconSize, isIconifyIcon, logo]);

  const updateLogo = useCallback((updates: Partial<LogoConcept>) => {
    if (!logo) return;
    setHistory((prev) => [...prev, logo]);
    setLogo({ ...logo, ...updates });
  }, [logo]);

  const undo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setLogo(prev);
    }
  };

  const resetPositions = () => {
    setIconPos({ x: 0, y: 0 });
    setNamePos({ x: 0, y: 0 });
    setTaglinePos({ x: 0, y: 0 });
  };

  const handleElementMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    setSelectedElement(element);
    setIsDragging(true);
    const currentPos = element === "icon" ? iconPos : element === "name" ? namePos : taglinePos;
    dragStartRef.current = { x: e.clientX, y: e.clientY, startPos: { ...currentPos } };
    if (element === "icon") setActivePanel("icon");
    else if (element === "name" || element === "tagline") setActivePanel("text");
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current || !selectedElement) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const scale = zoom / 100;
      const newPos = { x: dragStartRef.current.startPos.x + dx / scale, y: dragStartRef.current.startPos.y + dy / scale };
      if (selectedElement === "icon") setIconPos(newPos);
      else if (selectedElement === "name") setNamePos(newPos);
      else if (selectedElement === "tagline") setTaglinePos(newPos);
    };
    const handleMouseUp = () => { setIsDragging(false); dragStartRef.current = null; };
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, selectedElement, zoom]);

  const generateAIImage = async () => {
    if (!logo) return;
    setGeneratingImage(true);
    setImageError(null);
    const tryGen = async (retries = 2): Promise<void> => {
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessName: logo.businessName, industry: logo.industry, style: logo.style, colorHint: logo.colors?.join(", "), keywords: tagline || undefined }),
        });
        const data = await res.json();
        if (data.loading && retries > 0) {
          const wait = Math.min(data.retryAfter || 20, 60);
          setImageError(`AI model loading... retrying in ${wait}s`);
          await new Promise((r) => setTimeout(r, wait * 1000));
          return tryGen(retries - 1);
        }
        if (!res.ok) throw new Error(data.error || "Generation failed");
        setAiImage(data.image);
        setImageError(null);
      } catch (err: unknown) {
        setImageError(err instanceof Error ? err.message : "Unknown error");
      }
    };
    await tryGen();
    setGeneratingImage(false);
  };

  const generateAIPalettes = async () => {
    setLoadingPalettes(true);
    try {
      const palettes: ColorPalette[] = [];
      const names = ["Harmony", "Vivid", "Calm", "Contrast", "Fresh"];
      for (let i = 0; i < 5; i++) {
        const colors = await generateAIPalette();
        palettes.push({ name: names[i], colors });
      }
      setAiPalettes(palettes);
    } catch (err) { console.error("Failed to generate AI palettes:", err); }
    finally { setLoadingPalettes(false); }
  };

  const handleIconSearch = useCallback((query: string) => {
    setIconSearch(query);
    if (iconSearchTimeout.current) clearTimeout(iconSearchTimeout.current);
    if (!query.trim()) { setIconifyResults([]); setIconifySvgs({}); return; }
    iconSearchTimeout.current = setTimeout(async () => {
      setSearchingIcons(true);
      try {
        const result = await searchIcons(query, 36);
        setIconifyResults(result.icons);
        const svgMap: Record<string, string> = {};
        await Promise.all(result.icons.slice(0, 36).map(async (icon) => {
          const svg = await getIconSVG(icon.prefix, icon.name, { width: 24, height: 24 });
          svgMap[icon.fullName] = svg;
        }));
        setIconifySvgs(svgMap);
      } catch (err) { console.error("Icon search failed:", err); }
      finally { setSearchingIcons(false); }
    }, 400);
  }, []);

  const downloadLogo = (format: "png" | "svg" | "jpeg") => {
    if (aiImage && (format === "png" || format === "jpeg") && logo) {
      // Composite the text onto the imported/AI image
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth || 800;
        c.height = img.naturalHeight || 600;
        const ctx = c.getContext("2d");
        if (ctx) {
          // Draw the base image
          ctx.drawImage(img, 0, 0, c.width, c.height);
          
          // Draw gradient overlay at the bottom
          const grad = ctx.createLinearGradient(0, c.height * 0.3, 0, c.height);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(1, `rgba(0,0,0,${overlayOpacity * 0.6})`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, c.width, c.height);
          
          // Draw business name
          const txtColor = logo.textColor || "#FFFFFF";
          const scale = c.width / 600;
          const nameFontSize = Math.round(fontSize * scale);
          ctx.font = `${fw} ${nameFontSize}px "${logo.fontFamily}", sans-serif`;
          ctx.fillStyle = txtColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 8 * scale;
          ctx.fillText(logo.businessName, c.width / 2, c.height - (tagline ? 36 * scale : 20 * scale));
          
          // Draw tagline if exists
          if (tagline) {
            const tagFontSize = Math.round(taglineFontSize * scale);
            ctx.font = `400 ${tagFontSize}px "${logo.fontFamily}", sans-serif`;
            ctx.globalAlpha = 0.8;
            ctx.shadowBlur = 4 * scale;
            ctx.fillText(tagline, c.width / 2, c.height - 16 * scale);
            ctx.globalAlpha = 1;
          }
          
          const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
          const dataUrl = c.toDataURL(mimeType, format === "jpeg" ? 0.95 : undefined);
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `${logo.businessName || "logo"}.${format === "jpeg" ? "jpg" : "png"}`;
          a.click();
        }
      };
      img.src = aiImage;
      return;
    }
    const svgContent = generateSVG();
    if (format === "svg") {
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${logo?.businessName || "logo"}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const img = new Image();
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 800; c.height = 600;
        const ctx = c.getContext("2d");
        if (ctx) {
          if (format === "jpeg") {
            ctx.fillStyle = logo?.backgroundColor || "#ffffff";
            ctx.fillRect(0, 0, 800, 600);
          }
          ctx.drawImage(img, 0, 0, 800, 600);
          const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
          const dataUrl = c.toDataURL(mimeType, format === "jpeg" ? 0.95 : undefined);
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `${logo?.businessName || "logo"}.${format === "jpeg" ? "jpg" : "png"}`;
          a.click();
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const saveToMyLogos = () => {
    if (!logo) return;
    const saved = JSON.parse(localStorage.getItem("savedLogos") || "[]");
    const exists = saved.some((s: { id: string }) => s.id === logo.id);
    if (!exists) {
      saved.unshift({
        id: logo.id,
        name: logo.name || logo.businessName,
        businessName: logo.businessName,
        style: logo.style,
        createdAt: new Date().toISOString(),
        colors: logo.colors || [logo.iconColor, logo.textColor],
        logoData: logo,
      });
      localStorage.setItem("savedLogos", JSON.stringify(saved.slice(0, 50)));
    }
    alert("Logo saved to My Logos!");
  };

  const generateSVG = (): string => {
    if (!logo) return "";
    const w = 800, h = 600;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${logo.backgroundColor}" rx="${borderRadius}"/>
  <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle"
    font-family="${logo.fontFamily}, sans-serif" font-size="${fontSize * 2}" fill="${logo.textColor}" font-weight="bold">
    ${logo.businessName}
  </text>
  ${tagline ? `<text x="${w / 2}" y="${h / 2 + fontSize * 2}" text-anchor="middle" dominant-baseline="middle"
    font-family="${logo.fontFamily}, sans-serif" font-size="${taglineFontSize * 2}" fill="${logo.textColor}" opacity="0.7">
    ${tagline}
  </text>` : ""}
</svg>`;
  };

  // === ALL HOOKS ABOVE THIS LINE ===
  if (!logo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e2e]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const IconComponent = ICON_MAP[logo.iconName] || Star;
  const ls = logo.letterSpacing ?? 0;
  const fw = logo.fontWeight ?? 700;
  const initial = logo.businessName.charAt(0).toUpperCase();
  const ff = `"${logo.fontFamily}", sans-serif`;

  const SelectionWrap = ({ element, children, className = "" }: { element: CanvasElement; children: React.ReactNode; className?: string }) => {
    const isSelected = selectedElement === element;
    const pos = element === "icon" ? iconPos : element === "name" ? namePos : taglinePos;
    return (
      <div
        onMouseDown={(e) => handleElementMouseDown(e, element)}
        className={`relative transition-all ${className}`}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          outline: isSelected ? "2px solid #6366F1" : "2px solid transparent",
          outlineOffset: "6px",
          borderRadius: 4,
          zIndex: isSelected ? 10 : 1,
          cursor: isDragging && isSelected ? "grabbing" : "grab",
        }}
      >
        {children}
        {isSelected && (
          <>
            <div className="absolute -top-[7px] -left-[7px] w-[10px] h-[10px] bg-white border-2 border-indigo-500 rounded-sm pointer-events-none" />
            <div className="absolute -top-[7px] -right-[7px] w-[10px] h-[10px] bg-white border-2 border-indigo-500 rounded-sm pointer-events-none" />
            <div className="absolute -bottom-[7px] -left-[7px] w-[10px] h-[10px] bg-white border-2 border-indigo-500 rounded-sm pointer-events-none" />
            <div className="absolute -bottom-[7px] -right-[7px] w-[10px] h-[10px] bg-white border-2 border-indigo-500 rounded-sm pointer-events-none" />
          </>
        )}
      </div>
    );
  };

  const renderIconInner = () =>
    isIconifyIcon && iconifySvgPreview ? (
      <div style={{ width: iconSize, height: iconSize, color: logo.iconColor }} dangerouslySetInnerHTML={{ __html: iconifySvgPreview }} />
    ) : (
      <IconComponent style={{ color: logo.iconColor, width: iconSize, height: iconSize }} />
    );

  const renderCanvasContent = () => {
    const renderIconElement = () => {
      if (["lettermark", "initial-top", "initial-left"].includes(logo.layout)) {
        if (logo.layout === "initial-top") {
          const shape = logo.iconShape || "circle";
          const boxSize = iconSize + 40;
          const shSt: React.CSSProperties = { width: boxSize, height: boxSize, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: logo.iconColor };
          if (shape === "circle") shSt.borderRadius = "50%";
          else if (shape === "rounded-square") shSt.borderRadius = boxSize * 0.2;
          else if (shape === "hexagon") shSt.clipPath = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
          else if (shape === "shield") shSt.clipPath = "polygon(50% 0%, 100% 10%, 100% 65%, 50% 100%, 0% 65%, 0% 10%)";
          else if (shape === "diamond") { shSt.transform = "rotate(45deg)"; shSt.borderRadius = boxSize * 0.1; }
          else shSt.borderRadius = "50%";
          return (
            <div style={shSt}>
              <span style={{ color: "#fff", fontFamily: ff, fontSize: fontSize * 1.2, fontWeight: 700, ...(shape === "diamond" ? { transform: "rotate(-45deg)", display: "block" } : {}) }}>{initial}</span>
            </div>
          );
        }
        return (
          <span style={{ color: logo.iconColor, fontFamily: ff, fontWeight: fw, fontSize: logo.layout === "lettermark" ? fontSize * 2.5 : fontSize * 2, lineHeight: 1 }}>
            {initial}
          </span>
        );
      }
      if (logo.layout === "monogram") {
        const initials = logo.businessName.split(/\s+/).map(w => w[0]).join("").substring(0, 2).toUpperCase();
        const shape = logo.iconShape || "circle";
        const monoSize = iconSize + 40;
        const shSt: React.CSSProperties = { width: monoSize, height: monoSize, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: logo.iconColor };
        if (shape === "circle") shSt.borderRadius = "50%";
        else if (shape === "rounded-square") shSt.borderRadius = monoSize * 0.2;
        else if (shape === "hexagon") shSt.clipPath = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
        else if (shape === "shield") shSt.clipPath = "polygon(50% 0%, 100% 10%, 100% 65%, 50% 100%, 0% 65%, 0% 10%)";
        else if (shape === "diamond") { shSt.transform = "rotate(45deg)"; shSt.borderRadius = monoSize * 0.1; }
        else shSt.borderRadius = "50%";
        return (
          <div style={shSt}>
            <span style={{ color: "#fff", fontFamily: ff, fontSize: fontSize * 1.2, fontWeight: 700, letterSpacing: "0.05em", ...(shape === "diamond" ? { transform: "rotate(-45deg)", display: "block" } : {}) }}>{initials}</span>
          </div>
        );
      }
      if (logo.layout === "emblem") {
        return (
          <div style={{ width: iconSize + 60, height: iconSize + 60, borderRadius: "50%", border: `2.5px solid ${logo.iconColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {renderIconInner()}
          </div>
        );
      }
      if (logo.layout === "stacked") {
        return (
          <div style={{ backgroundColor: logo.iconColor + "20", width: iconSize + 24, height: iconSize + 24, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {renderIconInner()}
          </div>
        );
      }
      if (logo.layout === "split") {
        return (
          <div style={{ backgroundColor: logo.iconColor, display: "flex", alignItems: "center", justifyContent: "center", padding: `${spacing}px ${spacing + 8}px`, borderRadius: "12px 0 0 12px" }}>
            <IconComponent style={{ color: "#fff", width: iconSize, height: iconSize }} />
          </div>
        );
      }
      return renderIconInner();
    };

    const iconEl = <SelectionWrap element="icon">{renderIconElement()}</SelectionWrap>;
    const nameEl = (
      <SelectionWrap element="name">
        <h2 style={{ color: logo.textColor, fontFamily: ff, fontSize, fontWeight: fw, letterSpacing: `${ls}em`, lineHeight: 1.2, textTransform: ["lettermark", "initial-top", "initial-left"].includes(logo.layout) ? "uppercase" as const : undefined, whiteSpace: "nowrap" }}>
          {logo.businessName}
        </h2>
      </SelectionWrap>
    );
    const taglineEl = tagline ? (
      <SelectionWrap element="tagline">
        <p style={{ color: logo.textColor, fontFamily: ff, fontSize: taglineFontSize, opacity: 0.6, letterSpacing: ["lettermark", "initial-top", "initial-left"].includes(logo.layout) ? "0.25em" : `${ls}em`, textTransform: ["lettermark", "initial-top", "initial-left"].includes(logo.layout) ? "uppercase" as const : undefined, whiteSpace: "nowrap" }}>
          {tagline}
        </p>
      </SelectionWrap>
    ) : null;

    const isVertical = ["icon-top", "stacked", "lettermark", "initial-top", "monogram", "emblem", "badge"].includes(logo.layout);

    if (logo.layout === "wordmark") {
      return (
        <div className="flex flex-col items-center" style={{ gap: spacing }}>
          {nameEl}
          {tagline && <div style={{ width: 40, height: 2, backgroundColor: logo.iconColor, opacity: 0.3, borderRadius: 1 }} />}
          {taglineEl}
        </div>
      );
    }
    if (logo.layout === "minimal") {
      return (
        <div className="flex items-center" style={{ gap: spacing }}>
          {iconEl}
          {nameEl}
        </div>
      );
    }
    if (logo.layout === "badge") {
      return (
        <div style={{ border: `2.5px solid ${logo.iconColor}`, borderRadius: 10, padding: `${spacing}px ${spacing + 12}px`, display: "flex", flexDirection: "column", alignItems: "center", gap: spacing * 0.5 }}>
          <div className="flex items-center" style={{ gap: spacing * 0.6 }}>{iconEl}{nameEl}</div>
          {tagline && <div style={{ width: "100%", height: 1, backgroundColor: logo.iconColor, opacity: 0.2 }} />}
          {taglineEl}
        </div>
      );
    }
    if (isVertical) {
      return (
        <div className="flex flex-col items-center" style={{ gap: spacing }}>
          {iconEl}
          {nameEl}
          {taglineEl}
        </div>
      );
    }
    if (logo.layout === "split") {
      return (
        <div className="flex items-stretch rounded-xl overflow-hidden">
          {iconEl}
          <div className="flex flex-col justify-center" style={{ padding: `${spacing * 0.7}px ${spacing}px`, backgroundColor: logo.textColor + "08" }}>
            {nameEl}
            {taglineEl}
          </div>
        </div>
      );
    }
    const isReversed = logo.layout === "icon-right";
    return (
      <div className={`flex items-center ${isReversed ? "flex-row-reverse" : ""}`} style={{ gap: spacing }}>
        {iconEl}
        <div className="flex flex-col" style={{ gap: 4 }}>
          {nameEl}
          {taglineEl}
        </div>
      </div>
    );
  };

  // Import a new image into the editor
  const handleEditorImport = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAiImage(dataUrl);
      if (logo) {
        updateLogo({ aiImageUrl: dataUrl, aiStyleName: "Imported" });
      }
      setShowOverlayText(true);
    };
    reader.readAsDataURL(file);
  };

  const panelTabs: { id: PanelTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "text", label: "Text", icon: Type },
    { id: "colors", label: "Colors", icon: Palette },
    { id: "icon", label: "Icon", icon: Box },
    { id: "layout", label: "Layout", icon: Layout },
  ];

  return (
    <div className="min-h-screen bg-[#1e1e2e] flex flex-col" style={{ userSelect: isDragging ? "none" : "auto" }}>
      {/* Top toolbar */}
      <div className="h-14 bg-[#2a2a3d] border-b border-[#3a3a4d] flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-px bg-gray-600" />
          <h1 className="font-semibold text-white text-sm">Logo Editor</h1>
          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold rounded uppercase tracking-wider">Canva-style</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={undo} disabled={history.length === 0} className="text-xs text-gray-300 hover:text-white hover:bg-white/10">
            <Undo2 className="w-3.5 h-3.5" />Undo
          </Button>
          <div className="h-5 w-px bg-gray-600" />
          <Button variant="ghost" size="sm" onClick={saveToMyLogos} className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
            <Star className="w-3.5 h-3.5" />Save
          </Button>
          <div className="h-5 w-px bg-gray-600" />
          <Button variant="ghost" size="sm" onClick={() => downloadLogo("svg")} className="text-xs text-gray-300 hover:text-white hover:bg-white/10">
            <Download className="w-3.5 h-3.5" />SVG
          </Button>
          <Button variant="ghost" size="sm" onClick={() => downloadLogo("jpeg")} className="text-xs text-gray-300 hover:text-white hover:bg-white/10">
            <Download className="w-3.5 h-3.5" />JPEG
          </Button>
          <Button variant="ghost" size="sm" onClick={() => downloadLogo("png")} className="text-xs bg-indigo-500 text-white hover:bg-indigo-600">
            <Download className="w-3.5 h-3.5" />PNG
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-80 bg-[#2a2a3d] border-r border-[#3a3a4d] flex flex-col shrink-0">
          <div className="flex border-b border-[#3a3a4d]">
            {panelTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${activePanel === tab.id ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5" : "text-gray-500 hover:text-gray-300"}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* TEXT PANEL */}
            {activePanel === "text" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Business Name</label>
                  <Input value={logo.businessName} onChange={(e) => updateLogo({ businessName: e.target.value })} className="bg-[#1e1e2e] border-[#3a3a4d] text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Tagline / Slogan</label>
                  <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="SLOGAN HERE" className="bg-[#1e1e2e] border-[#3a3a4d] text-white placeholder:text-gray-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Font Family</label>
                  <div className="grid grid-cols-1 gap-1 max-h-44 overflow-y-auto rounded-lg bg-[#1e1e2e] p-2">
                    {FONT_OPTIONS.map((font) => (
                      <button key={font} onClick={() => updateLogo({ fontFamily: font })}
                        className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${logo.fontFamily === font ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-gray-400 hover:bg-white/5 border border-transparent"}`}
                        style={{ fontFamily: `${font}, sans-serif` }}>{font}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Font Size: {fontSize}px</label>
                  <input type="range" min="14" max="72" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Tagline Size: {taglineFontSize}px</label>
                  <input type="range" min="8" max="32" value={taglineFontSize} onChange={(e) => setTaglineFontSize(+e.target.value)} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Font Weight: {fw}</label>
                  <input type="range" min="300" max="900" step="100" value={fw} onChange={(e) => updateLogo({ fontWeight: +e.target.value })} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Letter Spacing: {ls.toFixed(2)}em</label>
                  <input type="range" min="0" max="0.5" step="0.01" value={ls} onChange={(e) => updateLogo({ letterSpacing: +e.target.value })} className="w-full accent-indigo-500" />
                </div>
              </>
            )}

            {/* COLORS PANEL */}
            {activePanel === "colors" && (
              <>
                {([
                  { label: "Background", key: "backgroundColor" as const, value: logo.backgroundColor },
                  { label: "Text Color", key: "textColor" as const, value: logo.textColor },
                  { label: "Icon / Accent", key: "iconColor" as const, value: logo.iconColor },
                ]).map(({ label, key, value }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={value} onChange={(e) => updateLogo({ [key]: e.target.value })} className="w-10 h-10 rounded-lg border border-[#3a3a4d] cursor-pointer bg-transparent" />
                      <Input value={value} onChange={(e) => updateLogo({ [key]: e.target.value })} className="flex-1 bg-[#1e1e2e] border-[#3a3a4d] text-white font-mono text-sm" />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Quick Backgrounds</label>
                  <div className="flex flex-wrap gap-2">
                    {["#FFFFFF","#F8FAFC","#F1F5F9","#0F172A","#1E293B","#1C1C26","#1A1A2E","#7C3AED","#4F46E5","#059669","#DC2626","#F59E0B","#0891B2","#EC4899"].map((c) => (
                      <button key={c} onClick={() => { const isDark = parseInt(c.slice(1, 3), 16) < 100; updateLogo({ backgroundColor: c, textColor: isDark ? "#FFFFFF" : logo.textColor }); }}
                        className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform ${logo.backgroundColor === c ? "border-indigo-400 ring-2 ring-indigo-400/30" : "border-gray-600"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">AI Palettes</label>
                    <Button variant="ghost" size="sm" onClick={generateAIPalettes} disabled={loadingPalettes} className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                      {loadingPalettes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      {loadingPalettes ? "..." : "Generate"}
                    </Button>
                  </div>
                  {aiPalettes.length > 0 ? (
                    <div className="space-y-1.5">
                      {aiPalettes.map((pal, idx) => (
                        <button key={idx} onClick={() => updateLogo({ backgroundColor: pal.colors[4] || "#FFFFFF", textColor: pal.colors[0], iconColor: pal.colors[2], colors: pal.colors.slice(0, 3) })}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="flex gap-1">{pal.colors.map((color, i) => (<div key={i} className="w-5 h-5 rounded-full border border-gray-600" style={{ backgroundColor: color }} />))}</div>
                          <span className="text-xs text-gray-500">{pal.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (<p className="text-xs text-gray-600 italic">Click Generate for AI color palettes</p>)}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Preset Palettes</label>
                  <div className="space-y-1.5">
                    {COLOR_PALETTES.map((pal) => (
                      <button key={pal.name} onClick={() => updateLogo({ backgroundColor: pal.colors[3] || "#FFFFFF", textColor: pal.colors[0], iconColor: pal.colors[1], colors: pal.colors })}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex gap-1">{pal.colors.map((c, i) => (<div key={i} className="w-5 h-5 rounded-full border border-gray-600" style={{ backgroundColor: c }} />))}</div>
                        <span className="text-xs text-gray-400">{pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ICON PANEL */}
            {activePanel === "icon" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Icon Size: {iconSize}px</label>
                  <input type="range" min="20" max="96" value={iconSize} onChange={(e) => setIconSize(+e.target.value)} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Search 200K+ Icons</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <Input value={iconSearch} onChange={(e) => handleIconSearch(e.target.value)} placeholder="e.g. rocket, chart, trading..."
                      className="pl-9 text-sm bg-[#1e1e2e] border-[#3a3a4d] text-white placeholder:text-gray-600" />
                  </div>
                  {searchingIcons && (<div className="flex items-center gap-2 mt-2 text-xs text-gray-500"><Loader2 className="w-3 h-3 animate-spin" /> Searching...</div>)}
                  {iconifyResults.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">{iconifyResults.length} found</p>
                      <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
                        {iconifyResults.map((icon) => (
                          <button key={icon.fullName} onClick={() => updateLogo({ iconName: `iconify:${icon.fullName}` })}
                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${logo.iconName === `iconify:${icon.fullName}` ? "bg-indigo-500/20 border border-indigo-500/40" : "bg-[#1e1e2e] hover:bg-white/5 border border-transparent"}`}
                            title={icon.fullName}>
                            {iconifySvgs[icon.fullName] ? (
                              <div className="w-5 h-5 text-gray-300" dangerouslySetInnerHTML={{ __html: iconifySvgs[icon.fullName] }} />
                            ) : (<div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#3a3a4d]" />
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">Built-in</span>
                  <div className="flex-1 h-px bg-[#3a3a4d]" />
                </div>
                <div>
                  <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto">
                    {AVAILABLE_ICONS.map((iconName) => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <button key={iconName} onClick={() => updateLogo({ iconName })}
                          className={`p-2.5 rounded-lg flex items-center justify-center transition-colors ${logo.iconName === iconName ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40" : "text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent"}`}
                          title={iconName}>
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* LAYOUT PANEL */}
            {activePanel === "layout" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Logo Layout</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["icon-left","icon-top","icon-right","stacked","wordmark","monogram","emblem","badge","minimal","split","lettermark","initial-top","initial-left"] as const).map((layout) => (
                      <button key={layout} onClick={() => { updateLogo({ layout }); resetPositions(); }}
                        className={`p-2.5 rounded-lg text-[11px] font-medium transition-all ${logo.layout === layout ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent"}`}>
                        {layout.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Icon Shape</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["none","circle","rounded-square","hexagon","shield","diamond"] as const).map((shape) => (
                      <button key={shape} onClick={() => updateLogo({ iconShape: shape })}
                        className={`p-2 rounded-lg text-[11px] font-medium transition-all capitalize ${(logo.iconShape || "none") === shape ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent"}`}>
                        {shape === "rounded-square" ? "Rounded" : shape}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Spacing: {spacing}px</label>
                  <input type="range" min="4" max="48" value={spacing} onChange={(e) => setSpacing(+e.target.value)} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Corner Radius: {borderRadius}px</label>
                  <input type="range" min="0" max="48" value={borderRadius} onChange={(e) => setBorderRadius(+e.target.value)} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Padding: {bgPadding}px</label>
                  <input type="range" min="16" max="96" value={bgPadding} onChange={(e) => setBgPadding(+e.target.value)} className="w-full accent-indigo-500" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shadow</label>
                  <button onClick={() => setShadow(!shadow)} className={`w-11 h-6 rounded-full transition-colors ${shadow ? "bg-indigo-500" : "bg-gray-600"} relative`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-200" style={{ transform: shadow ? "translateX(22px)" : "translateX(2px)" }} />
                  </button>
                </div>
                {/* Overlay controls for imported images */}
                {aiImage && showOverlayText && (
                  <div className="mt-4 pt-4 border-t border-[#3a3a4d]">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Overlay Blend: {Math.round(overlayOpacity * 100)}%</label>
                    <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(+e.target.value)} className="w-full accent-indigo-500" />
                  </div>
                )}
                {/* Replace image */}
                {aiImage && (
                  <div className="mt-4 pt-4 border-t border-[#3a3a4d]">
                    <Button variant="ghost" size="sm" onClick={() => importFileRef.current?.click()} className="w-full text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 justify-center">
                      <Download className="w-3.5 h-3.5 rotate-180" /> Replace Image
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-10 bg-[#252535] border-b border-[#3a3a4d] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={generateAIImage} disabled={generatingImage} className="text-[11px] text-gray-400 hover:text-white hover:bg-white/10 h-7">
                {generatingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                {generatingImage ? "Generating..." : "AI Generate"}
              </Button>
              {/* Import image button */}
              <input ref={importFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleEditorImport(f); }} />
              <Button variant="ghost" size="sm" onClick={() => importFileRef.current?.click()} className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7">
                <Download className="w-3 h-3 rotate-180" />Import
              </Button>
              {aiImage && (
                <Button variant="ghost" size="sm" onClick={() => { setAiImage(null); setShowOverlayText(false); }} className="text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-7">
                  <X className="w-3 h-3" />Remove Image
                </Button>
              )}
              {imageError && <span className="text-[10px] text-amber-400 ml-2">{imageError}</span>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={resetPositions} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors" title="Reset element positions">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-px bg-gray-600 mx-1" />
              <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-gray-500 w-10 text-center font-mono">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 overflow-auto" onClick={() => setSelectedElement(null)}>
            <div ref={canvasRef} id="logo-canvas"
              className="relative flex items-center justify-center transition-shadow duration-300 overflow-hidden"
              style={{
                width: 600,
                height: 450,
                backgroundColor: logo.backgroundColor,
                borderRadius,
                padding: aiImage ? 0 : bgPadding,
                boxShadow: shadow ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.15)",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center center",
                cursor: isDragging ? "grabbing" : "default",
              }}
              onClick={(e) => e.stopPropagation()}>

              {/* If we have an imported/AI image, show it as the canvas background */}
              {aiImage && (
                <img
                  src={aiImage}
                  alt={`Background for ${logo.businessName}`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ borderRadius }}
                />
              )}

              {/* Overlay gradient for readability when image is present */}
              {aiImage && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(transparent 30%, rgba(0,0,0,${overlayOpacity * 0.6}))`,
                    borderRadius,
                  }}
                />
              )}

              {/* Transparency grid for white backgrounds (when no image) */}
              {!aiImage && logo.backgroundColor.toLowerCase() === "#ffffff" && (
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "repeating-conic-gradient(#999 0% 25%, transparent 0% 50%)", backgroundSize: "16px 16px" }} />
              )}

              {/* Editable content — always rendered, fully interactive */}
              <div className="relative z-10" style={aiImage ? { marginTop: "auto", paddingBottom: 32 } : undefined}>
                {renderCanvasContent()}
              </div>

              {selectedElement && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-indigo-500/90 text-white text-[10px] font-medium px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 z-20 pointer-events-none">
                  <Move className="w-3 h-3" />Drag to reposition &middot; {selectedElement}
                </div>
              )}
            </div>
          </div>

          <div className="h-8 bg-[#252535] border-t border-[#3a3a4d] flex items-center justify-center px-4 shrink-0">
            <div className="flex items-center gap-4 text-[10px] text-gray-600">
              <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> Click elements to select</span>
              <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Drag to reposition</span>
              <span>Use panel tabs to edit properties</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#1e1e2e]"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>}>
      <EditorContent />
    </Suspense>
  );
}
