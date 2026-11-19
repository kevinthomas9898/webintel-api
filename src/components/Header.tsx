"use client";

import React, { useState } from "react";
import { Terminal, ShieldCheck, Cpu, Code2, Menu, X, ArrowUpRight } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  WebIntel
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                  API
                </span>
              </div>
            </a>

            {/* API Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Operational
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#playground" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-slate-400" />
              Playground
            </a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#use-cases" className="hover:text-indigo-600 transition-colors">
              Use Cases
            </a>
            <a href="#docs" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-slate-400" />
              Docs
            </a>
            <a href="#features" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              SSRF Armor
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">
              Pricing
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#playground"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all duration-150 flex items-center gap-1.5"
            >
              Test Endpoint
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">API Operational (v1.0)</span>
          </div>
          <a
            href="#playground"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
          >
            Playground
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
          >
            Features
          </a>
          <a
            href="#use-cases"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
          >
            Use Cases
          </a>
          <a
            href="#docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
          >
            API Documentation
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
          >
            Pricing
          </a>
          <div className="pt-2">
            <a
              href="#playground"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm shadow-sm"
            >
              Scan a Website Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
