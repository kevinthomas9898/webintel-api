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
    <section id="matrix" className="py-20 bg-[#f7f6f2] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Layers className="w-3 h-3 text-[#c2410c]" />
              HEURISTIC_MATRIX_v1.0
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              Technology Signature Matrix
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              Interactive catalog of DOM attributes, network headers, script hashes, and meta generators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  selectedCategory === cat
                    ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                    : "bg-[#ffffff] text-[#4b4f59] border border-[#dcd7cb] hover:bg-[#ebe6db]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix & Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono">
          
          {/* Tech Badges Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filtered.map((item) => {
              const isSelected = activeTech.name === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTech(item)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "bg-[#ffffff] border-[#0e1014] shadow-xs ring-1 ring-[#0e1014]"
                      : "bg-[#ffffff] hover:bg-[#faf9f6] border-[#e2ded5]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#0e1014]">{item.name}</span>
                    <span className="text-[10px] text-[#047857] font-bold">{item.confidence}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#828794]">
                    <span>{item.category}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detailed Heuristic Inspector */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-[#ffffff] border border-[#e2ded5] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2ded5] mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#828794] block">
                  SIGNATURE_SPECIFICATION
                </span>
                <h4 className="text-lg font-bold text-[#0e1014]">{activeTech.name}</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#e6f4ea] border border-[#b7e1cd] text-xs font-bold text-[#047857]">
                {activeTech.confidence} CONFIDENCE
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#828794]">CATEGORY:</span>
                <span className="px-2 py-0.5 rounded bg-[#f1ede4] font-semibold text-[#0e1014]">
                  {activeTech.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#828794]">DETECTION_LAYER:</span>
                <span className="px-2 py-0.5 rounded bg-[#ece7dd] font-bold text-[#c2410c]">
                  {activeTech.type}
                </span>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[#828794] text-[10px] uppercase font-semibold block">
                  HEURISTIC_RULE:
                </span>
                <div className="p-3 rounded bg-[#faf9f6] border border-[#e2ded5] text-[#0e1014] text-[11px] leading-relaxed">
                  {activeTech.detectionRule}
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-[#e2ded5] flex items-center justify-between text-xs">
              <span className="text-[#828794]">DETERMINISTIC_EXTRACTION</span>
              <a
                href="#playground"
                className="font-semibold text-[#0e1014] hover:text-[#c2410c] flex items-center gap-1"
              >
                <span>TEST_IN_CONSOLE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
