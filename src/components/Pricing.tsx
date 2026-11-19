"use client";

import React, { useState } from "react";
import { Check, Clock, ArrowRight, ShieldCheck, Zap } from "lucide-react";

const TIERS = [
  {
    name: "Developer Tier",
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
    status: "Coming Soon",
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
    ctaLink: "#playground",
    highlight: true,
  },
  {
    name: "Enterprise Cluster",
    code: "ENT_CLUSTER",
    status: "Coming Soon",
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="pricing" className="py-20 bg-[#f7f6f2] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Clock className="w-3.5 h-3.5 text-[#c2410c]" />
              CAPACITY_ALLOCATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              Predictable Scale for Agent Fleets
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              WebIntel API is currently available free for developers during public preview.
            </p>
          </div>

          {/* Billing Switcher */}
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
              className={`p-6 sm:p-7 rounded-xl flex flex-col justify-between transition-all font-mono ${
                tier.highlight
                  ? "bg-[#ffffff] border-2 border-[#0e1014] shadow-md relative"
                  : "bg-[#ffffff] border border-[#e2ded5] shadow-xs hover:border-[#d5d1c6]"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-[#0e1014] text-[#f7f6f2] text-[10px] font-bold uppercase tracking-wider">
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
                      tier.status === "Coming Soon"
                        ? "bg-[#ece7dd] text-[#828794]"
                        : "bg-[#e6f4ea] text-[#047857] border border-[#b7e1cd]"
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

        {/* Security and Edge Guarantee Strip */}
        <div className="mt-12 max-w-xl mx-auto p-3.5 rounded-lg bg-[#ffffff] border border-[#e2ded5] shadow-xs flex flex-wrap items-center justify-center gap-5 text-xs font-mono text-[#4b4f59]">
          <div className="flex items-center gap-1.5 text-[#047857] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>PINNED_SOCKET_GUARANTEE</span>
          </div>
          <span className="text-[#d5d1c6]">|</span>
          <div className="flex items-center gap-1.5 text-[#0e1014] font-semibold">
            <Zap className="w-4 h-4 text-[#c2410c]" />
            <span>SUB_500MS_THROUGHPUT</span>
          </div>
        </div>

      </div>
    </section>
  );
}
