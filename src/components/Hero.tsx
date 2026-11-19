"use client";

import React from "react";
import { Sparkles, Shield, Zap, CheckCircle2, ArrowRight, Bot } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-indigo-50/40 via-slate-50 to-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 shadow-xs text-xs font-medium text-slate-700">
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            <span>Built Specifically for AI Agents &amp; LLM Toolchains</span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-600 font-semibold">
              v1.0 Live
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Website Intelligence API{" "}
            <span className="text-indigo-600">
              for AI Agents
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Give your autonomous agents instantaneous, factual context on any company or website.
            Extract technology stacks, verified contact links, semantic headings, and business keywords
            with zero fabrication and enterprise-grade SSRF defense.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#playground"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Try Interactive Playground</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#docs"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>View API Reference</span>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                POST /api/scan
              </span>
            </a>
          </div>

          {/* Key Value Badges */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">SSRF Protected</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">DNS pre-check, pinned IP socket &amp; RFC-1918 blocking</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2 text-indigo-600 mb-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Zero Fabrication</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">Deterministic extraction with detected vs inferred flags</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2 text-blue-600 mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">40+ Tech Stacks</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">Detects Next.js, React, Tailwind, Stripe, CMS &amp; CDNs</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2 text-amber-600 mb-1.5">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Sub-Second Speed</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">Lightweight streaming Cheerio DOM parsing engine</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
