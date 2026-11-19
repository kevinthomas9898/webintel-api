"use client";

import React from "react";
import { Check, Clock, ArrowRight } from "lucide-react";

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
  return (
    <section id="pricing" className="py-20 bg-[#070a12] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-3">
            <Clock className="w-3.5 h-3.5" />
            Flexible API Plans (Commercial Tiers Coming Soon)
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Transparent Pricing for High-Volume Agents
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            The WebIntel API is currently available free for developers during our public preview.
            Commercial paid tiers with high concurrency will launch soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`p-7 rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                tier.highlight
                  ? "bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/60 shadow-2xl shadow-indigo-900/30 relative"
                  : "bg-slate-900/40 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular for Agents
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      tier.status === "Coming Soon"
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                        : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    {tier.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-5 min-h-[36px]">{tier.description}</p>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-3xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs text-slate-400">/ {tier.period}</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    What&apos;s Included:
                  </div>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
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
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
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
    </section>
  );
}
