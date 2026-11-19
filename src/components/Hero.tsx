"use client";

import React, { useState } from "react";
import { Shield, ArrowRight, CornerDownRight } from "lucide-react";

interface SimulatedTarget {
  name: string;
  url: string;
  ip: string;
  title: string;
  h1: string;
  tech: string[];
  contact: string;
  confidence: number;
}

const PREVIEWS: SimulatedTarget[] = [
  {
    name: "Stripe",
    url: "https://stripe.com",
    ip: "198.137.150.161",
    title: "Financial infrastructure to grow your revenue",
    h1: "Accept payments and manage money movement online",
    tech: ["Next.js", "Tailwind CSS", "Stripe", "Cloudflare"],
    contact: "/contact/sales",
    confidence: 0.85,
  },
  {
    name: "GitHub",
    url: "https://github.com",
    ip: "140.82.121.4",
    title: "Where the world builds software",
    h1: "The complete developer platform to build, scale, and deliver software",
    tech: ["Ruby on Rails", "React", "Fastly", "Primer CSS"],
    contact: "/contact",
    confidence: 0.92,
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    ip: "209.216.230.207",
    title: "Hacker News",
    h1: "Submissions and Tech Discussion",
    tech: ["Arc", "FreeBSD", "Custom CSS"],
    contact: "hn@ycombinator.com",
    confidence: 0.70,
  },
];

export function Hero() {
  const [selectedTarget, setSelectedTarget] = useState<SimulatedTarget>(PREVIEWS[0]);

  return (
    <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#e2ded5] drafting-grid-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Bold Asymmetric Editorial Headline */}
          <div className="lg:col-span-7 space-y-6">
            {/* Architectural Spec Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[11px] font-mono text-[#4b4f59]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
              <span className="uppercase font-semibold tracking-wider text-[#0e1014]">
                PROTOCOL: RECONNAISSANCE_LAYER
              </span>
              <span className="text-[#a39e92]">/</span>
              <span>ZERO_TRUST_SSRF</span>
            </div>

            {/* Asymmetric Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#0e1014] leading-[1.08]">
              Autonomous Website Intelligence.{" "}
              <span className="block font-serif italic font-normal text-[#c2410c]">
                Engineered for AI Agents.
              </span>
            </h1>

            {/* Editorial Description */}
            <p className="text-sm sm:text-base text-[#4b4f59] leading-relaxed max-w-xl">
              Autonomous agents waste 90% of their token context parsing unstructured HTML dumps.
              WebIntel surgicalizes any public URL into structured, factual intelligence: verified technology
              footprints, semantic headings, public emails, and Schema.org profiles—shielded behind
              hardened socket IP pinning.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono text-xs">
              <a
                href="#playground"
                className="px-5 py-3 rounded-md bg-[#0e1014] hover:bg-[#252830] text-[#f7f6f2] font-semibold transition-all flex items-center justify-center gap-2 shadow-xs group"
              >
                <span>OPEN_INSPECTION_DECK</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#security"
                className="px-5 py-3 rounded-md bg-[#ffffff] hover:bg-[#ece7dd] text-[#0e1014] border border-[#e2ded5] font-semibold transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>INSPECT_SSRF_ARMOR</span>
                <Shield className="w-3.5 h-3.5 text-[#047857]" />
              </a>
            </div>

            {/* Live Instrument Readout Strip */}
            <div className="pt-6 border-t border-[#e2ded5] grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase text-[#828794] block">DNS_RESOLVER</span>
                <span className="font-semibold text-[#0e1014]">PINNED_SOCKET</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#828794] block">MAX_DEPTH</span>
                <span className="font-semibold text-[#0e1014]">1_PAGE_SAME_ORIGIN</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#828794] block">SIZE_CEILING</span>
                <span className="font-semibold text-[#0e1014]">2.5_MB_STREAM_CAP</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#828794] block">EXTRACTION_CONFIDENCE</span>
                <span className="font-semibold text-[#047857]">DETERMINISTIC</span>
              </div>
            </div>
          </div>

          {/* Right Column: Signature Interactive Agent Deconstruction Lens */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#ffffff] border border-[#e2ded5] shadow-xs overflow-hidden">
              {/* Terminal Title Bar */}
              <div className="px-4 py-2.5 bg-[#f1ede4] border-b border-[#e2ded5] flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d5d1c6]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d5d1c6]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d5d1c6]" />
                  </div>
                  <span className="font-bold text-[#0e1014] ml-2 text-[11px]">
                    AGENT_LENS: RECON_PREVIEW
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#047857] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
                  LIVE
                </div>
              </div>

              {/* Target Selector Switch */}
              <div className="p-3 bg-[#f7f6f2] border-b border-[#e2ded5] flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-mono text-[#828794] uppercase pl-1 pr-2">
                  TARGET:
                </span>
                {PREVIEWS.map((target) => (
                  <button
                    key={target.name}
                    onClick={() => setSelectedTarget(target)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      selectedTarget.name === target.name
                        ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                        : "bg-[#ffffff] text-[#4b4f59] border border-[#e2ded5] hover:bg-[#ebe6db]"
                    }`}
                  >
                    {target.name}
                  </button>
                ))}
              </div>

              {/* Live Extraction Lens Payload Body */}
              <div className="p-4 space-y-4 font-mono text-xs">
                {/* Socket Security Pin */}
                <div className="p-2.5 rounded bg-[#f7f6f2] border border-[#e2ded5] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#828794]">RESOLVED_IP:</span>
                    <span className="text-[#0e1014] font-semibold">{selectedTarget.ip}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#828794]">SSRF_SOCKET_STATUS:</span>
                    <span className="text-[#047857] font-bold">PINNED (ANTI_REBIND)</span>
                  </div>
                </div>

                {/* Extracted Title & Heading */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-[#828794] block font-sans font-bold">
                    [01] Semantic Hierarchy Extracted
                  </span>
                  <div className="p-2.5 rounded bg-[#ffffff] border border-[#e2ded5] space-y-1.5">
                    <div className="text-[11px] text-[#0e1014] font-semibold line-clamp-1">
                      &lt;title&gt; {selectedTarget.title}
                    </div>
                    <div className="text-[11px] text-[#4b4f59] flex items-start gap-1">
                      <CornerDownRight className="w-3 h-3 text-[#c2410c] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">H1: {selectedTarget.h1}</span>
                    </div>
                  </div>
                </div>

                {/* Detected Tech Footprint */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-[#828794] block font-sans font-bold">
                    [02] Technology Footprint ({selectedTarget.tech.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTarget.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-semibold text-[#0e1014]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Discovered Contact Page */}
                <div className="flex items-center justify-between pt-2 border-t border-[#e2ded5] text-[11px]">
                  <span className="text-[#828794]">CONTACT_ENDPOINT:</span>
                  <span className="text-[#c2410c] font-semibold">{selectedTarget.contact}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#828794]">CONFIDENCE_SCORE:</span>
                  <span className="text-[#047857] font-bold">
                    {Math.round(selectedTarget.confidence * 100)}% (VERIFIED)
                  </span>
                </div>
              </div>

              {/* Bottom Lens Status */}
              <div className="px-4 py-2 bg-[#f7f6f2] border-t border-[#e2ded5] flex items-center justify-between text-[10px] font-mono text-[#828794]">
                <span>AGENT_INGESTION_READY</span>
                <span className="text-[#0e1014] font-semibold">TOKEN_EFFICIENCY: +92%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
