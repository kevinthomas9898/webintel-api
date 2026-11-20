"use client";

import React from "react";
import { Bot, LineChart, Target, ShieldCheck, ArrowRight } from "lucide-react";

const USE_CASES = [
  {
    icon: Bot,
    code: "CASE_01",
    title: "Autonomous Agent Tool Calling",
    badge: "LangChain & CrewAI",
    description:
      "Equip autonomous research agents with a surgical tool to understand any target website. Instead of feeding 50,000 raw DOM tokens into context, pass clean structured JSON containing exact headings, verified tech stack, and company summaries.",
    example: "agent.invoke('scan_website', { url: 'https://acme.org' })",
  },
  {
    icon: Target,
    code: "CASE_02",
    title: "B2B Sales & Lead Qualification",
    badge: "CRM Ingestion",
    description:
      "Automatically qualify inbound business leads by their underlying software architecture. Know immediately if a prospect uses Shopify, Next.js, Stripe, or WordPress before scheduling an SDR discovery call.",
    example: "lead.enrichment = await webintel.scan(lead.website)",
  },
  {
    icon: LineChart,
    code: "CASE_03",
    title: "Competitive Architecture Audits",
    badge: "Market Intelligence",
    description:
      "Monitor competitor infrastructure programmatically. Detect when rival platforms migrate from legacy monoliths to modern frameworks or add new analytics, payments, and customer support providers.",
    example: "cron.schedule('weekly_competitor_stack_audit')",
  },
  {
    icon: ShieldCheck,
    code: "CASE_04",
    title: "Vendor Security & Perimeter Recon",
    badge: "SecOps Compliance",
    description:
      "Audit third-party vendor web footprints without exposing scanner infrastructure to internal pivot attacks. Inspect CDN providers, CMS versions, and public endpoints with enterprise-grade SSRF socket pinning.",
    example: "audit.verifySecurityBoundaries(vendorUrl)",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-20 bg-[#ffffff] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Bot className="w-3.5 h-3.5 text-[#c2410c]" />
              OPERATIONAL_DEPLOYMENTS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              How Engineers Deploy WebIntel
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              From autonomous agent toolchains to automated pipeline enrichment, WebIntel delivers trusted reconnaissance.
            </p>
          </div>

          <div className="font-mono text-xs text-[#828794]">
            [RUNTIME: ZERO_DOM_POLLUTION]
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {USE_CASES.map((uc, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-[#faf9f6] border border-[#e2ded5] shadow-xs flex flex-col justify-between hover:border-[#d5d1c6] transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#e2ded5] mb-4 font-mono text-xs">
                  <span className="font-bold text-[#c2410c]">{uc.code} {"//"}</span>
                  <span className="px-2 py-0.5 rounded bg-[#f1ede4] text-[#4b4f59] text-[10px] font-semibold">
                    {uc.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0e1014] mb-2">{uc.title}</h3>
                <p className="text-xs sm:text-sm text-[#4b4f59] leading-relaxed mb-6 font-sans">
                  {uc.description}
                </p>
              </div>

              <div className="p-3 rounded bg-[#0e1014] font-mono text-xs text-[#ece7dd] flex items-center justify-between gap-2 shadow-2xs overflow-hidden">
                <code className="truncate">{uc.example}</code>
                <ArrowRight className="w-3.5 h-3.5 text-[#828794] flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
