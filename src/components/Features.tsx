"use client";

import React from "react";
import { Shield, Sparkles, Cpu, Database, Eye, CheckCircle2, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "Multi-Layer SSRF Armor",
    description:
      "Blocks RFC-1918 private subnets, localhost, link-local, multicast, and cloud metadata (169.254.169.254). Eliminates DNS rebinding TOCTOU attacks with socket IP pinning.",
  },
  {
    icon: Sparkles,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "40+ Technology Signatures",
    description:
      "Identifies Next.js, React, Vue, WordPress, Shopify, Tailwind, Stripe, Google Analytics, Cloudflare, Vercel, Intercom and more via DOM, scripts, headers, and meta generators.",
  },
  {
    icon: Eye,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    title: "Zero Data Fabrication",
    description:
      "Every piece of data is factual. Company names and services are explicitly flagged as detected or inferred, accompanied by mathematical confidence scores.",
  },
  {
    icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Agent-First Structured Output",
    description:
      "Engineered specifically for LLM tool-calling (LangChain, OpenAI Function Calling, CrewAI, AutoGen). Returns compact, high-density JSON to minimize token waste.",
  },
  {
    icon: Database,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    title: "Sub-Second Cheerio Engine",
    description:
      "Lightning-fast stream parsing using Cheerio instead of heavyweight headless browsers. Scans and extracts complete site intelligence in under 500ms.",
  },
  {
    icon: Lock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    title: "Robots.txt & Crawl Guardrails",
    description:
      "Respects website robots.txt crawl policies, enforces strict 2.5MB payload caps, handles manual redirect chains (max 5), and rate-limits aggressive callers.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-[#090d16] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Engineered for Production AI Systems
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Built for Autonomous Agents, Secured for Enterprise
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Most web scrapers either leak your internal infrastructure via SSRF or overwhelm LLM
            context windows with garbage HTML. WebIntel API bridges the gap with hardened security
            and razor-sharp data extraction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 group"
            >
              <div
                className={`w-11 h-11 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-cyan-300 transition-colors">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
