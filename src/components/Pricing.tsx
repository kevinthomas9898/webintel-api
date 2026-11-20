"use client";

import React, { useState } from "react";
import { Check, Clock, ArrowRight, ShieldCheck, Zap, DollarSign, Calculator, Cpu } from "lucide-react";

const TIERS = [
  {
    name: "Developer Preview",
    code: "DEV_FREE",
    status: "Active Preview",
    price: "$0",
    period: "forever",
    description: "Ideal for local prototyping, agent evaluation, and personal LLM tool calling.",
    features: [
      "100 website scans / day",
      "Rate limit: 45 req / min",
      "Full SSRF socket IP pinning",
      "40+ technology signatures",
      "Deterministic confidence scoring",
      "Community GitHub support",
    ],
    ctaText: "TEST_IN_PLAYGROUND",
    ctaLink: "#playground",
    highlight: false,
  },
  {
    name: "Pro Fleet",
    code: "PRO_AGENT",
    status: "Early Access",
    price: "$49",
    period: "per month",
    description: "For high-volume production autonomous agent fleets, CRM pipelines, and lead enrichment.",
    features: [
      "50,000 scans / month",
      "Rate limit: 300 req / min",
      "Deep 2-page contact enrichment",
      "Webhook delivery for batch scans",
      "Domain change monitoring & alerts",
      "Priority SLA & dedicated Slack channel",
    ],
    ctaText: "JOIN_EARLY_ACCESS",
    ctaLink: "https://checkout.dodopayments.com/buy/pdt_0NsNElzzVuHB8gU1KPDYI?quantity=1",
    highlight: true,
  },
  {
    name: "Enterprise Cluster",
    code: "ENT_CLUSTER",
    status: "Custom",
    price: "Custom",
    period: "annual",
    description: "For high-throughput AI platforms, institutional research, and cybersecurity intelligence.",
    features: [
      "Unlimited monthly URL scans",
      "Dedicated egress IP proxies",
      "Custom technology heuristic rules",
      "VPC / On-premise container deployment",
      "99.99% uptime SLA guarantee",
      "24/7 dedicated security engineering",
    ],
    ctaText: "CONTACT_ARCHITECTS",
    ctaLink: "#playground",
    highlight: false,
  },
];

export function Pricing() {
  const [pricingMode, setPricingMode] = useState<"subscriptions" | "micropayments">("micropayments");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [scanVolume, setScanVolume] = useState<number>(25000);

  const costPerScan = 0.005;
  const estimatedCost = (scanVolume * costPerScan).toFixed(2);
  const tokenSavingsPercent = "87%";

  return (
    <section id="pricing" className="py-20 bg-[#f7f6f2] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Clock className="w-3.5 h-3.5 text-[#c2410c]" />
              CAPACITY_&amp;_PAYMENTS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              Transparent Pricing Built for Autonomous Systems
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              Choose between machine-to-machine Pay-Per-Crawl micropayments or dedicated monthly fleet capacity.
            </p>
          </div>

          {/* Pricing Model Switcher */}
          <div className="w-full sm:w-auto inline-flex items-center justify-center p-1 rounded-md bg-[#ece7dd] border border-[#dcd7cb] font-mono text-xs">
            <button
              onClick={() => setPricingMode("micropayments")}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded transition-all flex items-center justify-center gap-1.5 text-[11px] sm:text-xs ${
                pricingMode === "micropayments"
                  ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                  : "text-[#4b4f59] hover:text-[#0e1014]"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-[#c2410c] flex-shrink-0" />
              <span>PAY_PER_CRAWL</span>
              <span className="px-1.5 py-0.2 rounded bg-[#fff7ed] text-[#c2410c] text-[10px] font-bold">
                $0.005
              </span>
            </button>
            <button
              onClick={() => setPricingMode("subscriptions")}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded transition-all text-center text-[11px] sm:text-xs ${
                pricingMode === "subscriptions"
                  ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                  : "text-[#4b4f59] hover:text-[#0e1014]"
              }`}
            >
              MONTHLY_PLANS
            </button>
          </div>
        </div>

        {/* MODE 1: Interactive Pay-Per-Crawl & Micropayments Engine */}
        {pricingMode === "micropayments" && (
          <div className="max-w-5xl mx-auto font-mono">
            <div className="p-4 sm:p-8 rounded-xl bg-[#ffffff] border-2 border-[#0e1014] shadow-md space-y-6 sm:space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f1ede4]">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] uppercase">
                      Zero Fixed Cost &bull; Pure Micropayments
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e6f4ea] text-[#047857] border border-[#b7e1cd] uppercase">
                      Cloudflare Monetization Gateway
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0e1014] mt-2">
                    Agent Pay-As-You-Crawl Micropayment Engine
                  </h3>
                  <p className="text-xs text-[#4b4f59] font-sans mt-1">
                    Autonomous agents, LLM toolchains, and crawlers pay per scan via automated digital wallets. No upfront commitment, no expired seats.
                  </p>
                </div>

                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0e1014]">$0.005</div>
                  <div className="text-xs text-[#828794]">USD / verified scan</div>
                </div>
              </div>

              {/* Interactive Volume Slider */}
              <div className="space-y-4 bg-[#faf9f6] p-4 sm:p-6 rounded-lg border border-[#e2ded5]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#c2410c] flex-shrink-0" />
                    <span className="text-xs font-bold text-[#0e1014]">
                      ESTIMATE AGENT FLEET VOLUME &amp; COST
                    </span>
                  </div>
                  <div className="text-xs text-[#4b4f59]">
                    Selected Volume: <strong className="text-[#0e1014]">{scanVolume.toLocaleString()} scans</strong>
                  </div>
                </div>

                <input
                  type="range"
                  min="1000"
                  max="200000"
                  step="1000"
                  value={scanVolume}
                  onChange={(e) => setScanVolume(Number(e.target.value))}
                  className="w-full h-2 bg-[#e2ded5] rounded-lg appearance-none cursor-pointer accent-[#0e1014]"
                />

                <div className="flex justify-between text-[11px] text-[#828794]">
                  <span>1,000 ($5)</span>
                  <span className="hidden sm:inline">50,000 scans ($250)</span>
                  <span className="hidden sm:inline">100,000 scans ($500)</span>
                  <span>200,000 ($1,000)</span>
                </div>

                {/* Calculation Output Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  <div className="p-3.5 rounded bg-[#ffffff] border border-[#e2ded5]">
                    <div className="text-[10px] text-[#828794] uppercase">Total Cost Charged</div>
                    <div className="text-2xl font-extrabold text-[#0e1014] mt-0.5">${estimatedCost}</div>
                    <div className="text-[10px] text-[#047857] mt-1 font-sans">Billed per request at $0.005</div>
                  </div>

                  <div className="p-3.5 rounded bg-[#ffffff] border border-[#e2ded5]">
                    <div className="text-[10px] text-[#828794] uppercase">LLM Context Tokens Saved</div>
                    <div className="text-2xl font-extrabold text-[#047857] mt-0.5">{tokenSavingsPercent}</div>
                    <div className="text-[10px] text-[#4b4f59] mt-1 font-sans">Clean Markdown vs raw HTML bloat</div>
                  </div>

                  <div className="p-3.5 rounded bg-[#ffffff] border border-[#e2ded5]">
                    <div className="text-[10px] text-[#828794] uppercase">SSRF Perimeter Defense</div>
                    <div className="text-2xl font-extrabold text-[#0e1014] mt-0.5">100%</div>
                    <div className="text-[10px] text-[#047857] mt-1 font-sans">RFC-1918 socket pinning included</div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-2">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#828794]">
                    Payment &amp; Authentication Flow
                  </div>
                  <div className="flex items-start gap-2 text-[#4b4f59]">
                    <Check className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                    <span><strong>Cloudflare Monetization Gateway:</strong> Automatic micro-debits through CF proxy verification headers.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#4b4f59]">
                    <Check className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                    <span><strong>HTTP 402 Manifest:</strong> Unauthenticated requests receive machine-readable payment parameters automatically.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#4b4f59]">
                    <Check className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                    <span><strong>Standard Bearer Fallback:</strong> Supports pre-paid corporate API keys for legacy stacks.</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#828794]">
                    Developer &amp; Agent Tooling
                  </div>
                  <div className="flex items-start gap-2 text-[#4b4f59]">
                    <Check className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                    <span><strong>Native MCP Server:</strong> One-click setup for Claude Desktop, Cursor, and Windsurf (<code className="text-[#0e1014]">/api/mcp</code>).</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#4b4f59]">
                    <Check className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                    <span><strong>Multi-URL Batching:</strong> Scan up to 8 targets concurrently via <code className="text-[#0e1014]">/api/scan/batch</code>.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#4b4f59]">
                    <Check className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                    <span><strong>Sub-500ms Edge Latency:</strong> Deterministic response times with zero headless browser bloat.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="#monetization"
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-md bg-[#0e1014] hover:bg-[#252830] text-[#f7f6f2] text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors text-center"
                >
                  <Cpu className="w-4 h-4 text-[#c2410c] flex-shrink-0" />
                  <span className="break-all sm:break-normal">VIEW_PAY_PER_CRAWL_GATEWAY_DOCS</span>
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                </a>

                <a
                  href="#playground"
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-md bg-[#f1ede4] hover:bg-[#e4dfd3] text-[#0e1014] border border-[#dcd7cb] text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors text-center"
                >
                  <span>TEST_LIVE_SCAN_FREE()</span>
                </a>
              </div>

            </div>
          </div>
        )}

        {/* MODE 2: Fixed Monthly & Annual Fleet Subscriptions */}
        {pricingMode === "subscriptions" && (
          <div>
            {/* Subscriptions Cycle Toggle */}
            <div className="flex justify-center sm:justify-end mb-6">
              <div className="inline-flex items-center p-1 rounded-md bg-[#ece7dd] border border-[#dcd7cb] font-mono text-xs">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1 rounded transition-all ${
                    billingCycle === "monthly"
                      ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                      : "text-[#4b4f59] hover:text-[#0e1014]"
                  }`}
                >
                  MONTHLY
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
                    billingCycle === "annual"
                      ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                      : "text-[#4b4f59] hover:text-[#0e1014]"
                  }`}
                >
                  <span>ANNUAL</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#e6f4ea] text-[#047857] text-[10px] font-bold">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3-Column Plan Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
              {TIERS.map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-5 sm:p-7 rounded-xl flex flex-col justify-between transition-all font-mono ${
                    tier.highlight
                      ? "bg-[#ffffff] border-2 border-[#0e1014] shadow-md relative"
                      : "bg-[#ffffff] border border-[#e2ded5] shadow-xs hover:border-[#d5d1c6]"
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-[#0e1014] text-[#f7f6f2] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                      RECOMMENDED_FOR_FLEETS
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1ede4] mb-4">
                      <div>
                        <span className="text-[10px] text-[#828794] block uppercase">{tier.code}</span>
                        <h3 className="text-base font-bold text-[#0e1014]">{tier.name}</h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tier.status === "Active Preview"
                            ? "bg-[#e6f4ea] text-[#047857] border border-[#b7e1cd]"
                            : tier.status === "Early Access"
                            ? "bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]"
                            : "bg-[#ece7dd] text-[#828794]"
                        }`}
                      >
                        {tier.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#4b4f59] font-sans mb-5 min-h-[38px] leading-relaxed">
                      {tier.description}
                    </p>

                    <div className="flex items-baseline gap-1.5 mb-6">
                      <span className="text-3xl font-extrabold text-[#0e1014]">
                        {billingCycle === "annual" && tier.price === "$49" ? "$39" : tier.price}
                      </span>
                      <span className="text-xs text-[#828794]">/ {tier.period}</span>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-[#f1ede4]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#828794] mb-1">
                        SPECIFICATIONS:
                      </div>
                      {tier.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-[#4b4f59] font-sans">
                          <Check className="w-3.5 h-3.5 text-[#047857] flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <a
                      href={tier.ctaLink}
                      target={tier.ctaLink.startsWith("http") ? "_blank" : undefined}
                      rel={tier.ctaLink.startsWith("http") ? "noopener noreferrer" : undefined}
                      className={`w-full py-2.5 rounded-md text-center text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        tier.highlight
                          ? "bg-[#0e1014] hover:bg-[#252830] text-[#f7f6f2] shadow-xs"
                          : "bg-[#f1ede4] hover:bg-[#e4dfd3] text-[#0e1014] border border-[#dcd7cb]"
                      }`}
                    >
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security and Edge Guarantee Strip */}
        <div className="mt-12 max-w-xl mx-auto p-3.5 rounded-lg bg-[#ffffff] border border-[#e2ded5] shadow-xs flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-mono text-[#4b4f59] text-center">
          <div className="flex items-center gap-1.5 text-[#047857] font-semibold">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>PINNED_SOCKET_GUARANTEE</span>
          </div>
          <span className="hidden sm:inline text-[#d5d1c6]">|</span>
          <div className="flex items-center gap-1.5 text-[#0e1014] font-semibold">
            <Zap className="w-4 h-4 text-[#c2410c] flex-shrink-0" />
            <span>SUB_500MS_THROUGHPUT</span>
          </div>
        </div>

      </div>
    </section>
  );
}