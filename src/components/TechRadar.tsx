"use client";

import React, { useState } from "react";
import { Layers, ArrowRight } from "lucide-react";

interface TechItem {
  name: string;
  category: "Framework" | "CMS" | "Styling" | "Analytics" | "Hosting" | "Payments" | "Support";
  confidence: string;
  detectionRule: string;
  type: "Header" | "DOM" | "Script" | "Meta" | "HTML Pattern";
}

const TECH_CATALOG: TechItem[] = [
  {
    name: "Next.js",
    category: "Framework",
    confidence: "98%",
    detectionRule: "Matches #__next DOM node, /_next/static/ script URLs, and X-Powered-By header.",
    type: "DOM",
  },
  {
    name: "React",
    category: "Framework",
    confidence: "95%",
    detectionRule: "Detects [data-reactroot], __REACT_DEVTOOLS_GLOBAL_HOOK__, and react-dom bundles.",
    type: "DOM",
  },
  {
    name: "Vue.js",
    category: "Framework",
    confidence: "90%",
    detectionRule: "Scans for [data-v-] scoped attributes and __VUE__ runtime globals.",
    type: "HTML Pattern",
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    confidence: "85%",
    detectionRule: "Heuristic evaluation of atomic class combinations (flex, grid, px-, py-) & CDN references.",
    type: "HTML Pattern",
  },
  {
    name: "WordPress",
    category: "CMS",
    confidence: "98%",
    detectionRule: "Matches /wp-content/, /wp-includes/ and <meta name='generator' content='WordPress'>.",
    type: "Meta",
  },
  {
    name: "Shopify",
    category: "CMS",
    confidence: "95%",
    detectionRule: "Matches cdn.shopify.com assets, Shopify.theme object, and X-ShopId response header.",
    type: "Header",
  },
  {
    name: "Webflow",
    category: "CMS",
    confidence: "98%",
    detectionRule: "Detects data-wf-page, data-wf-site HTML attributes and Webflow generator meta tags.",
    type: "Meta",
  },
  {
    name: "Cloudflare",
    category: "Hosting",
    confidence: "99%",
    detectionRule: "Evaluates Server: cloudflare, CF-Ray ID, and cf-cache-status HTTP edge headers.",
    type: "Header",
  },
  {
    name: "Vercel",
    category: "Hosting",
    confidence: "98%",
    detectionRule: "Matches X-Vercel-Id, X-Vercel-Cache, and Server: vercel edge routing headers.",
    type: "Header",
  },
  {
    name: "Stripe",
    category: "Payments",
    confidence: "95%",
    detectionRule: "Identifies js.stripe.com/v3 script inclusions and Stripe Elements DOM mounts.",
    type: "Script",
  },
  {
    name: "Google Analytics",
    category: "Analytics",
    confidence: "95%",
    detectionRule: "Detects googletagmanager.com/gtag/js and gtag('config') inline instrumentation.",
    type: "Script",
  },
  {
    name: "PostHog",
    category: "Analytics",
    confidence: "92%",
    detectionRule: "Scans for posthog-js SDK scripts and app.posthog.com telemetry beacons.",
    type: "Script",
  },
  {
    name: "Intercom",
    category: "Support",
    confidence: "95%",
    detectionRule: "Matches widget.intercom.io/widget scripts and window.Intercom boot object.",
    type: "Script",
  },
  {
    name: "Zendesk",
    category: "Support",
    confidence: "95%",
    detectionRule: "Matches static.zdassets.com widgets and zE() client instances.",
    type: "Script",
  },
];

const CATEGORIES = ["All", "Framework", "CMS", "Styling", "Analytics", "Hosting", "Payments", "Support"] as const;

export function TechRadar() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTech, setActiveTech] = useState<TechItem>(TECH_CATALOG[0]);

  const filtered = selectedCategory === "All"
    ? TECH_CATALOG
    : TECH_CATALOG.filter((t) => t.category === selectedCategory);

  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-3">
            <Layers className="w-3.5 h-3.5" />
            Detection Matrix &amp; Heuristics
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            40+ Signatures, Zero Guesswork
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            WebIntel inspects DOM attributes, scripts, meta tags, and network headers to determine
            what powers any modern website. Explore our detection catalog below.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tech Badges Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filtered.map((item) => {
              const isSelected = activeTech.name === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTech(item)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 shadow-xs ring-1 ring-indigo-500"
                      : "bg-white hover:bg-slate-50 border-slate-200 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-emerald-700 font-bold">{item.confidence}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                      {item.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector Card */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Signature Details
                </span>
                <h4 className="text-xl font-bold text-slate-900">{activeTech.name}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                {activeTech.confidence} Confidence
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1 font-semibold">Category:</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-800">
                  {activeTech.category}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-semibold">Primary Detection Layer:</span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 font-mono font-medium text-indigo-700">
                  {activeTech.type}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-semibold">Inspection Heuristic:</span>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono text-[11px] leading-relaxed">
                  {activeTech.detectionRule}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-400">Updated weekly</span>
              <a
                href="#playground"
                className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Test in Playground</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
