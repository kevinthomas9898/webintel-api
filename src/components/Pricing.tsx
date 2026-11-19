"use client";

import React, { useState } from "react";
import { Check, Clock, ArrowRight, ShieldCheck, Zap } from "lucide-react";

const TIERS = [
  {
    name: "Developer Free",
    status: "Active Preview",
    price: "$0",
    period: "forever",
    description: "Ideal for testing, local prototyping, and personal AI agents.",
    features: [
      "100 website scans / day",
      "Rate limit: 45 req / min",
      "Full SSRF protection & IP pinning",
      "40+ technology signatures",
      "Structured JSON & confidence scoring",
      "Community support",
    ],
    ctaText: "Test in Playground",
    ctaLink: "#playground",
    highlight: false,
  },
  {
    name: "Pro Agent",
    status: "Coming Soon",
    price: "$49",
    period: "per month",
    description: "For production autonomous agent workflows, CRM pipelines, and lead enrichment.",
    features: [
      "50,000 scans / month",
      "Rate limit: 300 req / min",
      "Deep 2-page contact enrichment",
      "Webhook delivery for batch scans",
      "Domain change monitoring & alerts",
      "Dedicated Slack channel support",
    ],
    ctaText: "Join Waitlist",
    ctaLink: "#playground",
    highlight: true,
  },
  {
    name: "Enterprise Cluster",
    status: "Coming Soon",
    price: "Custom",
    period: "annual",
    description: "For high-throughput AI fleets, hedge funds, and cybersecurity platforms.",
    features: [
      "Unlimited monthly scans",
      "Dedicated egress IP proxies",
      "Custom technology signatures",
      "On-premise / VPC container deployment",
      "99.99% uptime SLA guarantee",
      "24/7 dedicated security engineering",
    ],
    ctaText: "Contact Enterprise",
    ctaLink: "#playground",
    highlight: false,
  },
];

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="pricing" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-3">
            <Clock className="w-3.5 h-3.5" />
            Transparent Pricing (Commercial Tiers Coming Soon)
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Plans Engineered for Every Stage
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            The WebIntel API is currently free for developers during public preview.
            Commercial tiers with higher throughput and webhooks will launch soon.
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-200/70 border border-slate-300">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`p-7 rounded-2xl flex flex-col justify-between transition-all duration-200 bg-white ${
                tier.highlight
                  ? "border-2 border-indigo-600 shadow-lg shadow-indigo-100 relative"
                  : "border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Recommended for Agents
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      tier.status === "Coming Soon"
                        ? "bg-amber-50 border border-amber-200 text-amber-700"
                        : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    }`}
                  >
                    {tier.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-5 min-h-[36px] leading-relaxed">
                  {tier.description}
                </p>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {billingCycle === "annual" && tier.price === "$49" ? "$39" : tier.price}
                  </span>
                  <span className="text-xs text-slate-500">/ {tier.period}</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    What&apos;s Included:
                  </div>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <a
                  href={tier.ctaLink}
                  className={`w-full py-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    tier.highlight
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Security guarantee pill */}
        <div className="mt-12 max-w-xl mx-auto p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center gap-4 text-xs text-slate-600 text-center">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Data Leakage Guarantee</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
            <Zap className="w-4 h-4" />
            <span>Sub-500ms Edge Latency</span>
          </div>
        </div>
      </div>
    </section>
  );
}
