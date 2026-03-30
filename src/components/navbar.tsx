"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Bot,
  Shield,
  Crown,
} from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  isAdmin?: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load user from cookie on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  const isLoggedIn = !!user;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200/60"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-indigo-500/20 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LogoCraft AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/generate"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Logo Maker
            </Link>
            
            {/* AI Sales Bot - Admin Only */}
            {user?.isAdmin && (
              <Link
                href="/sell"
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                AI Sales Bot
                <Badge className="bg-indigo-600 text-white text-[10px] px-1 py-0">Admin</Badge>
              </Link>
            )}
            
            <Link
              href="/pricing"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              My Logos
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2.5">
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-medium text-gray-700">{user?.name || "User"}</p>
                    {user?.isAdmin && (
                      <p className="text-[10px] text-indigo-600 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" />
                        Admin
                      </p>
                    )}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg shadow-gray-200/60 border border-gray-100 py-1.5 animate-fade-in">
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.isAdmin && (
                        <Badge className="mt-1.5 bg-indigo-600 text-white text-[10px] px-1.5 py-0">
                          <Shield className="w-2.5 h-2.5 inline mr-1" />
                          Admin Access
                        </Badge>
                      )}
                    </div>
                    
                    {/* Menu items */}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Dashboard
                    </Link>
                    
                    {user?.isAdmin && (
                      <Link
                        href="/sell"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bot className="w-4 h-4" />
                        AI Sales Bot
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="gradient" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-100 bg-white px-6 py-4 space-y-1">
          <Link
            href="/generate"
            className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Logo Maker
          </Link>
          
          {/* AI Sales Bot - Admin Only (Mobile) */}
          {user?.isAdmin && (
            <Link
              href="/sell"
              className="block px-3 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <Bot className="w-4 h-4" />
              AI Sales Bot
              <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0">Admin</Badge>
            </Link>
          )}
          
          <Link
            href="/pricing"
            className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            My Logos
          </Link>
          
          {isLoggedIn && user?.isAdmin && (
            <div className="pt-3 mt-3 border-t border-gray-100">
              <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-1">
                <Shield className="w-2.5 h-2.5 inline mr-1" />
                Admin Access
              </Badge>
            </div>
          )}
          
          <div className="pt-3 border-t border-gray-100 flex gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="flex-1">Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/signup" className="flex-1">
                  <Button variant="gradient" size="sm" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
