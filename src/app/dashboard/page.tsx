"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Plus,
  Download,
  Heart,
  Edit3,
  LayoutGrid,
  List,
  Star,
  Palette,
  FileImage,
  Trash2,
  Upload,
  ImagePlus,
  X,
  ArrowRight,
  FileUp,
  Link2,
} from "lucide-react";
import { LogoConcept } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface SavedLogoEntry {
  id: string;
  name: string;
  businessName: string;
  style: string;
  createdAt: string;
  colors: string[];
  logoData: LogoConcept;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [logos, setLogos] = useState<SavedLogoEntry[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTab, setImportTab] = useState<"file" | "url">("file");
  const [importUrl, setImportUrl] = useState("");
  const [importPreview, setImportPreview] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [importBrandName, setImportBrandName] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch { /* ignore */ }
    }
    const saved = localStorage.getItem("savedLogos");
    if (saved) {
      try { setLogos(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const deleteLogo = (id: string) => {
    const updated = logos.filter((l) => l.id !== id);
    setLogos(updated);
    localStorage.setItem("savedLogos", JSON.stringify(updated));
  };

  // ── Import Logic ──
  const resetImport = () => {
    setImportPreview(null);
    setImportFileName("");
    setImportBrandName("");
    setImportUrl("");
    setImportError("");
    setImportLoading(false);
    setImportTab("file");
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    resetImport();
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImportError("Please select a valid image file (PNG, JPG, SVG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImportError("File size must be less than 10MB");
      return;
    }
    setImportError("");
    setImportFileName(file.name);

    // Auto-generate a brand name from the filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    if (!importBrandName) {
      setImportBrandName(nameWithoutExt.slice(0, 30));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUrlImport = async () => {
    if (!importUrl.trim()) {
      setImportError("Please enter a valid image URL");
      return;
    }
    setImportLoading(true);
    setImportError("");
    try {
      const response = await fetch(importUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("URL does not point to an image");
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportPreview(e.target?.result as string);
        setImportFileName("imported-logo");
        if (!importBrandName) setImportBrandName("Imported Logo");
      };
      reader.readAsDataURL(blob);
    } catch {
      // If direct fetch fails (CORS), try using an img element
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            setImportPreview(dataUrl);
            setImportFileName("imported-logo");
            if (!importBrandName) setImportBrandName("Imported Logo");
          }
        };
        img.onerror = () => {
          setImportError("Could not load image from this URL. Try downloading the image and uploading the file instead.");
        };
        img.src = importUrl;
      } catch {
        setImportError("Could not load image from this URL. Try downloading the image and uploading the file instead.");
      }
    }
    setImportLoading(false);
  };

  const handleImportConfirm = () => {
    if (!importPreview) {
      setImportError("Please select or upload an image first");
      return;
    }
    if (!importBrandName.trim()) {
      setImportError("Please enter a brand name for the imported logo");
      return;
    }

    const id = generateId();
    const brandName = importBrandName.trim();

    // Create a LogoConcept that uses the imported image as aiImageUrl
    // This makes it fully editable in the editor
    const logoConcept: LogoConcept = {
      id,
      name: brandName,
      businessName: brandName,
      tagline: "",
      industry: "Technology",
      style: "modern",
      colors: ["#4F46E5", "#7C3AED", "#E0E7FF"],
      fontFamily: "Inter",
      iconName: "Star",
      layout: "icon-top",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      iconColor: "#4F46E5",
      createdAt: new Date(),
      aiImageUrl: importPreview,
      aiStyleName: "Imported",
    };

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem("savedLogos") || "[]");
    const entry: SavedLogoEntry = {
      id,
      name: brandName,
      businessName: brandName,
      style: "imported",
      createdAt: new Date().toISOString(),
      colors: ["#4F46E5", "#7C3AED"],
      logoData: logoConcept,
    };
    saved.unshift(entry);
    localStorage.setItem("savedLogos", JSON.stringify(saved.slice(0, 50)));
    setLogos(saved.slice(0, 50));

    // Close modal — logo is saved to My Logos
    closeImportModal();
  };

  const stats = [
    { label: "Logos Created", value: logos.length.toString(), icon: Palette, color: "bg-indigo-100 text-indigo-600" },
    { label: "Downloads", value: "0", icon: Download, color: "bg-green-100 text-green-600" },
    { label: "Favorites", value: "0", icon: Heart, color: "bg-red-100 text-red-600" },
    { label: "Brand Kits", value: "0", icon: FileImage, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-main py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user ? `Welcome back, ${user.name}!` : "My Dashboard"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Manage your logos, brand kits, and downloads
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
              >
                <Upload className="w-4 h-4" />
                Import Logo
              </Button>
              <Link href="/#generator">
                <Button variant="gradient" size="sm">
                  <Plus className="w-4 h-4" />
                  Create New Logo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/#generator" className="group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-indigo-500/15 transition-all">
              <Sparkles className="w-7 h-7 mb-2.5 opacity-80" />
              <h3 className="font-bold text-base mb-0.5">Generate Logos</h3>
              <p className="text-sm text-white/70">Create new AI-powered logo designs</p>
            </div>
          </Link>
          <button onClick={() => setShowImportModal(true)} className="group text-left">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-cyan-500/15 transition-all h-full">
              <Upload className="w-7 h-7 mb-2.5 opacity-80" />
              <h3 className="font-bold text-base mb-0.5">Import Logo</h3>
              <p className="text-sm text-white/70">Import & customize logos from anywhere</p>
            </div>
          </button>
          <div className="group cursor-pointer">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-green-500/15 transition-all">
              <Star className="w-7 h-7 mb-2.5 opacity-80" />
              <h3 className="font-bold text-base mb-0.5">Brand Kit</h3>
              <p className="text-sm text-white/70">Build your complete brand identity</p>
            </div>
          </div>
        </div>

        {/* My Logos */}
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">My Logos</CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors"
                  title="Import Logo"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logos.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">No logos yet</h3>
                <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
                  Start creating logos or import existing ones from other websites
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/#generator">
                    <Button variant="gradient" size="sm">
                      <Plus className="w-4 h-4" />
                      Create Your First Logo
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImportModal(true)}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Upload className="w-4 h-4" />
                    Import Logo
                  </Button>
                </div>
              </div>
            ) : (
              <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3"}>
                {logos.map((logo) => {
                  // Store logo data in localStorage and pass only the ID to editor
                  // This avoids HTTP 431 errors from huge base64 images in URL params
                  const getEditorUrl = () => {
                    if (logo.logoData) {
                      localStorage.setItem(`logo_edit_${logo.id}`, JSON.stringify(logo.logoData));
                      return `/editor/${logo.id}`;
                    }
                    return `/#generator`;
                  };
                  return (
                    <div
                      key={logo.id}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group relative"
                    >
                      {/* Logo preview */}
                      <div
                        className="h-32 flex items-center justify-center cursor-pointer"
                        style={{ backgroundColor: logo.logoData?.backgroundColor || "#f3f4f6" }}
                        onClick={() => router.push(getEditorUrl())}
                      >
                          {logo.logoData?.aiImageUrl ? (
                            <img
                              src={logo.logoData.aiImageUrl}
                              alt={logo.businessName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className="text-lg font-bold"
                              style={{
                                color: logo.logoData?.textColor || "#374151",
                                fontFamily: logo.logoData?.fontFamily ? `"${logo.logoData.fontFamily}", sans-serif` : "sans-serif",
                              }}
                            >
                              {logo.businessName}
                            </span>
                          )}
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{logo.businessName}</p>
                          <p className="text-xs text-gray-500 capitalize">{logo.style === "imported" ? "Custom Logo" : logo.style}</p>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1.5 hover:bg-gray-100 rounded" title="Edit" onClick={() => router.push(getEditorUrl())}>
                              <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-red-50 rounded"
                            title="Delete"
                            onClick={() => deleteLogo(logo.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════
          IMPORT LOGO MODAL
         ══════════════════════════════════════════════════════ */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeImportModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <ImagePlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Import Logo</h2>
                  <p className="text-xs text-gray-400">Import from file or URL, then customize it</p>
                </div>
              </div>
              <button
                onClick={closeImportModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => { setImportTab("file"); setImportError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  importTab === "file"
                    ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <FileUp className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => { setImportTab("url"); setImportError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  importTab === "url"
                    ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Link2 className="w-4 h-4" />
                From URL
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Upload area */}
              {importTab === "file" && !importPreview && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Upload className={`w-7 h-7 ${dragOver ? "text-indigo-600" : "text-indigo-400"}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {dragOver ? "Drop your logo here" : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, SVG, WEBP — Max 10 MB
                  </p>
                </div>
              )}

              {/* URL input */}
              {importTab === "url" && !importPreview && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Image URL</label>
                    <div className="flex gap-2">
                      <Input
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
                      />
                      <Button
                        onClick={handleUrlImport}
                        disabled={importLoading}
                        size="sm"
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-4"
                      >
                        {importLoading ? "Loading..." : "Fetch"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Paste the direct URL to an image file. Right-click any logo image and select &quot;Copy image address&quot;.
                  </p>
                </div>
              )}

              {/* Preview */}
              {importPreview && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center min-h-[180px]">
                      <img
                        src={importPreview}
                        alt="Import preview"
                        className="max-h-[200px] max-w-full object-contain rounded-lg"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setImportPreview(null);
                        setImportFileName("");
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                    {importFileName && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-medium rounded-md backdrop-blur-sm">
                        {importFileName}
                      </div>
                    )}
                  </div>

                  {/* Brand name input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Brand Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={importBrandName}
                      onChange={(e) => setImportBrandName(e.target.value)}
                      placeholder="Enter brand name for this logo..."
                      className="text-sm"
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This name will be used when customizing your logo
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {importError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                  {importError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                Imported logos can be fully customized in the editor
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeImportModal}
                  className="text-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleImportConfirm}
                  disabled={!importPreview || !importBrandName.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Import & Customize
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
