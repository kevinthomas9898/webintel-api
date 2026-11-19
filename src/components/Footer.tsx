"use client";

import React from "react";
import { Terminal, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">WebIntel API</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-semibold border border-indigo-200">
                v1.0.0 Live
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
              The high-speed, factual website intelligence layer engineered for AI agents, LLM
              toolchains, and automated data pipelines.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Full SSRF Defense &amp; DNS Rebinding Armor Enforced</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#playground" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  Interactive Playground
                </a>
              </li>
              <li>
                <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#use-cases" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  Agent Use Cases
                </a>
              </li>
              <li>
                <a href="#docs" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  Pricing &amp; Limits
                </a>
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
              Security &amp; Policy
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              WebIntel API operates exclusively on public internet endpoints. All requests validate
              DNS records against RFC-1918, RFC-3927, and RFC-4193. Requests to private networks,
              internal clouds, loopbacks, or cloud metadata services are permanently blocked.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; 2026 WebIntel API. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#playground" className="hover:text-indigo-600 flex items-center gap-1">
              <span>Status: Operational</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </a>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Built for Autonomous AI Agents</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
