import Link from "next/link";
import { Sparkles, Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container-main py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">LogoCraft AI</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Create stunning professional logos in seconds with AI-powered design tools.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Product</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/generate", label: "Logo Maker" },
                { href: "/pricing", label: "Pricing" },
                { href: "/dashboard", label: "Brand Kit" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2.5">
              {["Blog", "Design Tips", "Brand Guidelines"].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "License Agreement"].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} LogoCraft AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Github, Twitter, Mail].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-600 hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
