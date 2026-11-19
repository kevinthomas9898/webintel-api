"use client";

import React, { useState } from "react";
import { Shield, Cpu, Code2, Menu, X, ArrowUpRight } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#f7f6f2]/95 border-b border-[#e2ded5] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Logo & Brand Architecture */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-[#0e1014] text-[#f7f6f2] flex items-center justify-center font-mono text-xs font-bold shadow-xs group-hover:bg-[#22252c] transition-colors">
                WI
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[#0e1014]">
                  WebIntel
                </span>
                <span className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-[#ebe6db] border border-[#dcd7cb] text-[#4b4f59] uppercase font-semibold">
                  API v1.0
                </span>
              </div>
            </a>

            {/* Live Security Perimeter Status Pip */}
            <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-[#e2ded5] text-[11px] font-mono text-[#4b4f59]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
              <span>SSRF_SHIELD: PINNED</span>
              <span className="text-[#a39e92]">|</span>
              <span className="text-[#047857] font-semibold">ONLINE</span>
            </div>
          </div>

          {/* Precision Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-mono text-[#4b4f59]">
            <a href="#playground" className="hover:text-[#0e1014] transition-colors flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#828794]" />
              INSPECTION_DECK
            </a>
            <a href="#security" className="hover:text-[#0e1014] transition-colors flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#047857]" />
              SSRF_ARMOR
            </a>
            <a href="#matrix" className="hover:text-[#0e1014] transition-colors">
              TECH_RADAR
            </a>
            <a href="#docs" className="hover:text-[#0e1014] transition-colors flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#828794]" />
              API_DOCS
            </a>
            <a href="#pricing" className="hover:text-[#0e1014] transition-colors">
              PRICING
            </a>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#playground"
              className="px-3.5 py-1.5 text-xs font-mono font-semibold text-[#f7f6f2] bg-[#0e1014] hover:bg-[#252830] rounded-md transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>RUN_SCAN</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#4b4f59] hover:text-[#0e1014] hover:bg-[#ebe6db] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e2ded5] bg-[#f7f6f2] px-4 pt-3 pb-5 space-y-2.5 shadow-sm font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2ded5] text-[#4b4f59]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
              STATUS: OPERATIONAL
            </span>
            <span className="text-[10px] text-[#828794]">NODE v24 / NEXT v16</span>
          </div>
          <a
            href="#playground"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-[#0e1014] hover:bg-[#ebe6db]"
          >
            &gt; INSPECTION_DECK
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-[#0e1014] hover:bg-[#ebe6db]"
          >
            &gt; SSRF_ARMOR
          </a>
          <a
            href="#matrix"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-[#0e1014] hover:bg-[#ebe6db]"
          >
            &gt; TECH_RADAR
          </a>
          <a
            href="#docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-[#0e1014] hover:bg-[#ebe6db]"
          >
            &gt; API_DOCS
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-[#0e1014] hover:bg-[#ebe6db]"
          >
            &gt; PRICING
          </a>
          <div className="pt-2">
            <a
              href="#playground"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-md bg-[#0e1014] text-[#f7f6f2] font-semibold text-xs"
            >
              RUN_SCAN_NOW()
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
