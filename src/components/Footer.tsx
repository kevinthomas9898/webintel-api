"use client";

import React from "react";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#f1ede4] border-t border-[#e2ded5] text-[#4b4f59] font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#0e1014] text-[#f7f6f2] flex items-center justify-center font-bold text-xs">
                WI
              </div>
              <span className="font-bold text-sm tracking-tight text-[#0e1014]">
                WebIntel API
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e6f4ea] text-[#047857] border border-[#b7e1cd] font-semibold">
                v1.0 LIVE
              </span>
            </div>
            <p className="text-xs text-[#4b4f59] font-sans leading-relaxed max-w-sm">
              The high-speed, deterministic website intelligence layer engineered for autonomous AI agents, LLM
              toolchains, and automated data pipelines.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#047857] font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>SSRF_ARMOR: RFC-1918 &amp; SOCKET_PINNING_ENFORCED</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#0e1014] uppercase text-[11px] tracking-wider">
              Console Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#playground" className="hover:text-[#0e1014] transition-colors">
                  &gt; INSPECTION_DECK
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#0e1014] transition-colors">
                  &gt; SSRF_DEFENSE_TRACE
                </a>
              </li>
              <li>
                <a href="#matrix" className="hover:text-[#0e1014] transition-colors">
                  &gt; TECH_SIGNATURE_MATRIX
                </a>
              </li>
              <li>
                <a href="#docs" className="hover:text-[#0e1014] transition-colors">
                  &gt; API_SPECIFICATION
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#0e1014] transition-colors">
                  &gt; FLEET_PRICING
                </a>
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#0e1014] uppercase text-[11px] tracking-wider">
              Network Perimeter Policy
            </h4>
            <p className="text-[11px] font-sans text-[#4b4f59] leading-relaxed">
              WebIntel operates strictly on public internet endpoints. All target resolutions are evaluated
              against RFC-1918, RFC-3927, and RFC-4193 CIDR blocks. Requests to loopbacks, private networks,
              internal clouds, or cloud metadata endpoints are permanently blocked at the socket boundary.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#e2ded5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#828794]">
          <div>
            &copy; 2026 WebIntel API. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#playground" className="hover:text-[#0e1014] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
              <span>STATUS: OPERATIONAL</span>
            </a>
            <span>|</span>
            <span>BUILT_FOR_AUTONOMOUS_AGENTS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
