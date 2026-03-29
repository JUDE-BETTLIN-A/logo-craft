"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Plus,
  Download,
  Heart,
  Clock,
  MoreVertical,
  Trash2,
  Edit3,
  Eye,
  Search,
  LayoutGrid,
  List,
  Star,
  TrendingUp,
  Palette,
  FileImage,
} from "lucide-react";

interface SavedLogo {
  id: string;
  name: string;
  businessName: string;
  style: string;
  createdAt: string;
  colors: string[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [logos, setLogos] = useState<SavedLogo[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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
            <Link href="/generate">
              <Button variant="gradient" size="sm">
                <Plus className="w-4 h-4" />
                Create New Logo
              </Button>
            </Link>
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
          <Link href="/generate" className="group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-indigo-500/15 transition-all">
              <Sparkles className="w-7 h-7 mb-2.5 opacity-80" />
              <h3 className="font-bold text-base mb-0.5">Generate Logos</h3>
              <p className="text-sm text-white/70">Create new AI-powered logo designs</p>
            </div>
          </Link>
          <Link href="/pricing" className="group">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white hover:shadow-lg hover:shadow-orange-500/15 transition-all">
              <TrendingUp className="w-7 h-7 mb-2.5 opacity-80" />
              <h3 className="font-bold text-base mb-0.5">Upgrade Plan</h3>
              <p className="text-sm text-white/70">Get high-res downloads & brand kits</p>
            </div>
          </Link>
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
                  Start creating stunning logos with our AI-powered generator
                </p>
                <Link href="/generate">
                  <Button variant="gradient" size="sm">
                    <Plus className="w-4 h-4" />
                    Create Your First Logo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3"}>
                {logos.map((logo) => (
                  <div
                    key={logo.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-700">{logo.businessName}</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{logo.name}</p>
                        <p className="text-xs text-gray-500">{logo.style}</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded">
                          <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded">
                          <Download className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
