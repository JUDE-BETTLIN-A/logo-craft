"use client";

import { PRICING_PLANS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

const FAQ = [
  {
    q: "Can I use the logo for commercial purposes?",
    a: "Yes! All paid plans include a full commercial license. You can use your logo on websites, business cards, merchandise, and any other business materials.",
  },
  {
    q: "What file formats are included?",
    a: "The Professional plan includes PNG, JPG, and SVG formats. The Brand Kit plan additionally includes EPS and PDF formats optimized for print.",
  },
  {
    q: "Can I modify the logo after purchase?",
    a: "Absolutely. You can return to the editor anytime and make changes to your logo. Your purchase includes unlimited edits.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
  },
  {
    q: "What's included in the Brand Kit?",
    a: "The Brand Kit includes your logo in all formats, plus business card templates, social media graphics, letterhead, email signature, favicon, and a brand guidelines document.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-20 pb-12">
        <div className="container-main text-center">
          <Badge className="mb-5">Simple Pricing</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Choose the perfect plan for
            <span className="block mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              your brand
            </span>
          </h1>
          <p className="text-base text-gray-500 max-w-lg mx-auto">
            Start free, upgrade when you&apos;re ready. No subscriptions, no hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20">
        <div className="container-main" style={{ maxWidth: '960px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-7 transition-all duration-300 ${
                  plan.popular
                    ? "border-indigo-500 bg-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/10"
                    : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-3 py-0.5 text-[11px]">
                      <Sparkles className="w-3 h-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price === 0 ? "Free" : formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-400 text-sm">/ {plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-7">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.price === 0 ? "/generate" : "/auth/signup"}>
                  <Button
                    variant={plan.popular ? "gradient" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features comparison */}
      <section className="py-16 bg-gray-50/80 border-y border-gray-100">
        <div className="container-main" style={{ maxWidth: '896px' }}>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Compare Plans
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Feature</th>
                  <th className="text-center p-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Basic</th>
                  <th className="text-center p-4 text-xs font-medium text-indigo-600 bg-indigo-50/50 uppercase tracking-wider">Professional</th>
                  <th className="text-center p-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Brand Kit</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Logo Generations", basic: "10", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Customization", basic: "Basic", pro: "Full", enterprise: "Full" },
                  { feature: "PNG Download", basic: "Low-res", pro: "High-res", enterprise: "High-res" },
                  { feature: "SVG Vector", basic: "—", pro: "✓", enterprise: "✓" },
                  { feature: "Transparent BG", basic: "—", pro: "✓", enterprise: "✓" },
                  { feature: "Business Cards", basic: "—", pro: "1 Template", enterprise: "5 Templates" },
                  { feature: "Social Media Kit", basic: "—", pro: "✓", enterprise: "✓" },
                  { feature: "Brand Guidelines", basic: "—", pro: "—", enterprise: "✓" },
                  { feature: "Commercial License", basic: "—", pro: "✓", enterprise: "✓" },
                  { feature: "Priority Support", basic: "—", pro: "—", enterprise: "✓" },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-gray-100 last:border-0">
                    <td className="p-4 text-sm text-gray-700">{row.feature}</td>
                    <td className="p-4 text-sm text-gray-500 text-center">{row.basic}</td>
                    <td className="p-4 text-sm text-gray-700 text-center bg-indigo-50/30 font-medium">{row.pro}</td>
                    <td className="p-4 text-sm text-gray-500 text-center">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container-main" style={{ maxWidth: '672px' }}>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
                  <HelpCircle
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${
                  openFaq === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}>
                  <div className="px-4 pb-4">
                    <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
