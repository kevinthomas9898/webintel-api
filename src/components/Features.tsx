"use client";

import React from "react";
import { Cpu } from "lucide-react";

const ARCHITECTURAL_PILLARS = [
  {
    num: "01",
    tag: "SSRF_SOCKET_PIN",
    title: "Pinned Socket IP Defense",
    summary:
      "Eliminates DNS Rebinding TOCTOU vulnerabilities by forcing the HTTP connection agent to bind strictly to pre-validated IP addresses. Completely blocks loopback (127.0.0.0/8), RFC-1918 private subnets, and cloud IMDS (169.254.169.254).",
    codeHint: "agent.lookup = (host, cb) => cb(null, pinnedSafeIp);",
  },
  {
    num: "02",
    tag: "DETERMINISTIC_EXTRACTION",
    title: "Zero Fabrication Extraction",
    summary:
      "LLMs frequently invent company features when reading unstructured text. WebIntel enforces mathematical confidence scoring and provides explicit boolean flags distinguishing verified detected facts from inferred tags.",
    codeHint: "{ verifiedDetected: true, confidence: 0.95 }",
  },
  {
    num: "03",
    tag: "40_TECH_SIGNATURES",
    title: "Deep Technology Radar",
    summary:
      "Multi-vector fingerprinting inspecting DOM nodes, response headers, meta generator tags, and script bundles. Detects Next.js, React, Vue, WordPress, Shopify, Tailwind, Stripe, Cloudflare, PostHog, and Intercom in milliseconds.",
    codeHint: "signatures.evaluate($, html, responseHeaders);",
  },
  {
    num: "04",
    tag: "TOKEN_OPTIMIZED_DOM",
    title: "High-Signal Semantic Parser",
    summary:
      "Cheerio DOM parser strips navigation menus, footer noise, SVG paths, and cookie banners. Returns structured H1/H2 heading hierarchies and distilled semantic text blocks designed for zero LLM token waste.",
    codeHint: "headings.tree -> cleanText.paragraphs.slice(0, 30)",
  },
  {
    num: "05",
    tag: "ROBOTS_&_REDIRECT_GUARD",
    title: "Crawl Guardrails & Hop Limiter",
    summary:
      "Complies with target robots.txt crawl policies. Automatically validates each redirect location through the same SSRF guard up to 5 hops, and caps streaming response bodies at 2.5 MB to neutralize decompression bombs.",
    codeHint: "redirects <= 5 && streamBytes <= 2.5MB",
  },
  {
    num: "06",
    tag: "EDGE_VELOCITY",
    title: "Sub-Second Cheerio Throughput",
    summary:
      "Bypasses resource-intensive headless Chrome instances. Streaming HTML network parsing completes in under 500ms, enabling autonomous agent toolchains to scan dozens of target companies in parallel.",
    codeHint: "avgLatency <= 450ms | rateLimit: 45 req/min",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-[#f7f6f2] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Cpu className="w-3 h-3 text-[#c2410c]" />
              ENGINEERING_FOUNDATIONS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              Six Architectural Guarantees
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              Engineered from the socket layer up for autonomous AI agent toolchains.
            </p>
          </div>

          <div className="font-mono text-xs text-[#828794]">
            [SPEC: RFC_1918_COMPLIANT]
          </div>
        </div>

        {/* Asymmetric 2-Column Technical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ARCHITECTURAL_PILLARS.map((pillar) => (
            <div
              key={pillar.num}
              className="p-6 rounded-xl bg-[#ffffff] border border-[#e2ded5] shadow-xs flex flex-col justify-between hover:border-[#d5d1c6] transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#f1ede4] mb-4 font-mono text-xs">
                  <span className="font-bold text-[#c2410c]">{pillar.num} {"//"}</span>
                  <span className="px-2 py-0.5 rounded bg-[#f1ede4] text-[#4b4f59] text-[10px] font-semibold">
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0e1014] mb-2 tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4b4f59] leading-relaxed mb-6">
                  {pillar.summary}
                </p>
              </div>

              <div className="p-2.5 rounded bg-[#faf9f6] border border-[#e2ded5] font-mono text-[11px] text-[#0e1014] overflow-x-auto">
                <code>{pillar.codeHint}</code>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
