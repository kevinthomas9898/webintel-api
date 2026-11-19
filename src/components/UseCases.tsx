"use client";

import React from "react";
import { Bot, LineChart, Target, ShieldCheck, ArrowRight } from "lucide-react";

const USE_CASES = [
  {
    icon: Bot,
    title: "AI Agent Tools & LLM Context",
    badge: "LangChain & CrewAI",
    description:
      "Equip autonomous agents with an instant tool to research any URL. Instead of feeding 50,000 raw HTML tokens into context, pass clean structured JSON containing exact headings, tech stack, and company summaries.",
    example: "agent.call('scan_website', { url: 'https://acme.org' })",
  },
  {
    icon: Target,
    title: "B2B Sales & Lead Qualification",
    badge: "CRM Enrichment",
    description:
      "Automatically qualify inbound leads by their underlying tech stack. Know immediately if a prospect uses Shopify, Next.js, Stripe, or WordPress before scheduling an SDR discovery call.",
    example: "lead.enrichment = await webintel.scan(lead.website)",
  },
  {
    icon: LineChart,
    title: "Competitive Intelligence",
    badge: "Market Analytics",
    description:
      "Monitor competitors programmatically. Detect when rivals migrate from legacy monolithic platforms to modern frameworks or add new analytics and customer support providers.",
    example: "cron.schedule('weekly_competitor_stack_audit')",
  },
  {
    icon: ShieldCheck,
    title: "Vendor Security & Infrastructure Audits",
    badge: "Compliance & SecOps",
    description:
      "Audit vendor web footprints without exposing scanners to internal pivot attacks. Inspect CDN providers, CMS versions, and public endpoints with enterprise-grade SSRF protection.",
    example: "audit.verifySecurityBoundaries(vendorUrl)",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-20 bg-[#070a12] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-3">
            <Bot className="w-3.5 h-3.5" />
            Applied Website Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How Engineers Deploy WebIntel API
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            From autonomous workflow agents to automated pipeline enrichment, WebIntel API delivers
            trusted intelligence everywhere data matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {USE_CASES.map((uc, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                    <uc.icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
                    {uc.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{uc.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5">
                  {uc.description}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs text-indigo-300 flex items-center justify-between">
                <code>{uc.example}</code>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
