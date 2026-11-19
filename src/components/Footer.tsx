"use client";

import React from "react";
import { Terminal, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#05080e] border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0b1120] rounded-[6px] flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-base text-white tracking-tight">WebIntel API</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                v1.0.0
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The high-speed, factual website intelligence layer engineered for AI agents, LLM
              toolchains, and automated data pipelines.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Full SSRF Defense &amp; DNS Rebinding Armor Enforced</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#playground" className="hover:text-cyan-400 transition-colors">
                  Interactive Playground
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-cyan-400 transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#use-cases" className="hover:text-cyan-400 transition-colors">
                  Agent Use Cases
                </a>
              </li>
              <li>
                <a href="#docs" className="hover:text-cyan-400 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-cyan-400 transition-colors">
                  Pricing &amp; Limits
                </a>
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Security &amp; Policy
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              WebIntel API operates exclusively on public internet endpoints. All requests validate
              DNS records against RFC-1918, RFC-3927, and RFC-4193. Requests to private networks,
              internal clouds, loopbacks, or cloud metadata services are permanently blocked.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; 2026 WebIntel API. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with precision for autonomous AI agents</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
