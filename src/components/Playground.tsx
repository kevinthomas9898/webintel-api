"use client";

import React, { useState } from "react";
import {
  Globe,
  Loader2,
  Copy,
  Check,
  Download,
  AlertCircle,
  ExternalLink,
  Mail,
  Layers,
  Sparkles,
  FileCode,
  Building,
  Terminal,
} from "lucide-react";
import type { WebIntelScanResult } from "@/lib/schemas/scan";

const PRESETS = [
  { label: "stripe.com", url: "https://stripe.com", desc: "Fintech" },
  { label: "github.com", url: "https://github.com", desc: "DevPlatform" },
  { label: "vercel.com", url: "https://vercel.com", desc: "Frontend" },
  { label: "example.com", url: "https://example.com", desc: "RFC 2606" },
  { label: "127.0.0.1:8080", url: "http://127.0.0.1:8080", desc: "SSRF Test" },
];

export function Playground() {
  const [url, setUrl] = useState("https://stripe.com");
  const [deepScan, setDeepScan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dossier" | "json" | "content">("dossier");
  const [result, setResult] = useState<WebIntelScanResult | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const handleScan = async (targetUrl = url) => {
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveStage(1);

    const stageTimer1 = setTimeout(() => setActiveStage(2), 350);
    const stageTimer2 = setTimeout(() => setActiveStage(3), 750);
    const stageTimer3 = setTimeout(() => setActiveStage(4), 1100);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl.trim(),
          deepScan,
          includeContent: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError({
          code: data.error?.code || "SCAN_ERROR",
          message: data.error?.message || "Failed to scan website. Please verify the URL.",
        });
      } else {
        setResult(data as WebIntelScanResult);
        setActiveTab("dossier");
      }
    } catch (err: unknown) {
      setError({
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network failure while reaching scanner API",
      });
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setLoading(false);
      setActiveStage(0);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `webintel-${new URL(result.website).hostname}.json`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <section id="playground" className="py-20 bg-[#f7f6f2] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Inspection Deck Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Terminal className="w-3 h-3 text-[#c2410c]" />
              SYS: INSPECTION_DECK_v1.0
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              Autonomous URL Reconnaissance Console
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              Submit any public website URL to execute zero-trust DNS pre-checks, socket pinning, and DOM extraction.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-[#828794]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#047857]" />
              SOCKET_SHIELD: ACTIVE
            </span>
            <span>|</span>
            <span>CIDR_FILTER: ENFORCED</span>
          </div>
        </div>

        {/* The Instrument Console Box */}
        <div className="rounded-xl bg-[#ffffff] border border-[#e2ded5] shadow-xs overflow-hidden">
          
          {/* Top Console Command Input Bar */}
          <div className="p-4 sm:p-5 bg-[#faf9f6] border-b border-[#e2ded5]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScan();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3.5 font-mono text-xs text-[#828794] select-none">
                  TARGET &gt;
                </span>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-22 pr-4 py-3 bg-[#ffffff] border border-[#d5d1c6] rounded-md text-[#0e1014] placeholder-[#828794] text-xs sm:text-sm focus:outline-none focus:border-[#0e1014] focus:ring-1 focus:ring-[#0e1014] transition-all font-mono"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-md bg-[#0e1014] hover:bg-[#252830] text-[#f7f6f2] font-mono font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>EXECUTING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#c2410c]" />
                    <span>RUN_SCAN()</span>
                  </>
                )}
              </button>
            </form>

            {/* Presets and Deep Scan Toggle */}
            <div className="mt-4 pt-3 border-t border-[#e2ded5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[#828794] text-[11px] pr-1">PRESETS:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setUrl(p.url);
                      handleScan(p.url);
                    }}
                    disabled={loading}
                    className="px-2 py-1 rounded bg-[#f1ede4] hover:bg-[#e4dfd3] text-[#4b4f59] hover:text-[#0e1014] border border-[#dcd7cb] text-[11px] transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-[#4b4f59] select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={deepScan}
                  onChange={(e) => setDeepScan(e.target.checked)}
                  className="rounded border-[#d5d1c6] text-[#0e1014] focus:ring-0"
                />
                <span>DEEP_SCAN: ENRICH_SECONDARY_PAGES</span>
              </label>
            </div>
          </div>

          {/* Dynamic 4-Stage Execution Pipeline Indicator */}
          {loading && (
            <div className="p-4 bg-[#f1ede4] border-b border-[#e2ded5] grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className={`p-2 rounded border flex items-center gap-2 ${activeStage >= 1 ? "bg-[#ffffff] border-[#0e1014] text-[#0e1014] font-bold" : "border-[#d5d1c6] text-[#828794]"}`}>
                <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
                <span>01. DNS_RESOLVER</span>
              </div>
              <div className={`p-2 rounded border flex items-center gap-2 ${activeStage >= 2 ? "bg-[#ffffff] border-[#0e1014] text-[#0e1014] font-bold" : "border-[#d5d1c6] text-[#828794]"}`}>
                <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
                <span>02. SOCKET_PIN</span>
              </div>
              <div className={`p-2 rounded border flex items-center gap-2 ${activeStage >= 3 ? "bg-[#ffffff] border-[#0e1014] text-[#0e1014] font-bold" : "border-[#d5d1c6] text-[#828794]"}`}>
                <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
                <span>03. DOM_EXTRACT</span>
              </div>
              <div className={`p-2 rounded border flex items-center gap-2 ${activeStage >= 4 ? "bg-[#ffffff] border-[#0e1014] text-[#0e1014] font-bold" : "border-[#d5d1c6] text-[#828794]"}`}>
                <span className="w-2 h-2 rounded-full bg-[#c2410c] animate-pulse" />
                <span>04. INTEL_EMIT</span>
              </div>
            </div>
          )}

          {/* Security Interception Alert Banner */}
          {error && !loading && (
            <div className="p-4 sm:p-5 bg-[#fff5f5] border-b border-[#fed7d7] text-[#9b2c2c] flex items-start gap-3 font-mono text-xs">
              <AlertCircle className="w-4 h-4 text-[#c53030] flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#742a2a]">[INTERCEPTION_ACTIVE]</span>
                  <span className="px-2 py-0.5 rounded bg-[#fed7d7] font-bold text-[10px]">
                    {error.code}
                  </span>
                </div>
                <p className="text-[11px] text-[#742a2a] leading-relaxed font-sans">{error.message}</p>
                {error.code.includes("SSRF") && (
                  <p className="text-[10px] text-[#047857] font-semibold pt-1">
                    ✓ SSRF Socket Pinning neutralized attempt to traverse private IP perimeter.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Output Deck Navigation & Content */}
          {result && !loading && (
            <div>
              {/* Output Tabs Bar */}
              <div className="px-4 py-2.5 bg-[#f1ede4] border-b border-[#e2ded5] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab("dossier")}
                    className={`px-3 py-1 rounded text-xs transition-all ${
                      activeTab === "dossier"
                        ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                        : "bg-[#ffffff] text-[#4b4f59] border border-[#dcd7cb] hover:bg-[#e4dfd3]"
                    }`}
                  >
                    INTELLIGENCE_DOSSIER
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                      activeTab === "json"
                        ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                        : "bg-[#ffffff] text-[#4b4f59] border border-[#dcd7cb] hover:bg-[#e4dfd3]"
                    }`}
                  >
                    <FileCode className="w-3 h-3" />
                    AGENT_STREAM_JSON
                  </button>
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-3 py-1 rounded text-xs transition-all ${
                      activeTab === "content"
                        ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                        : "bg-[#ffffff] text-[#4b4f59] border border-[#dcd7cb] hover:bg-[#e4dfd3]"
                    }`}
                  >
                    SEMANTIC_HEADINGS_&amp;_TEXT
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-2.5 py-1 rounded bg-[#ffffff] hover:bg-[#ece7dd] border border-[#dcd7cb] text-[#0e1014] text-[11px] flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[#047857]" />
                        <span className="text-[#047857] font-semibold">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#828794]" />
                        <span>COPY_JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="p-1 rounded bg-[#ffffff] hover:bg-[#ece7dd] border border-[#dcd7cb] text-[#0e1014] transition-colors"
                    title="Download JSON File"
                  >
                    <Download className="w-3 h-3 text-[#828794]" />
                  </button>
                </div>
              </div>

              {/* TAB 1: INTELLIGENCE DOSSIER */}
              {activeTab === "dossier" && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Entity Profile Deck */}
                  <div className="p-4 sm:p-5 rounded-lg bg-[#faf9f6] border border-[#e2ded5] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#0e1014] text-[#f7f6f2] flex items-center justify-center font-mono text-xs font-bold">
                          <Building className="w-4 h-4 text-[#f7f6f2]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#0e1014]">
                            {result.companyName || "Website Target"}
                          </h3>
                        </div>
                        {result.inferredData.companyNameIsInferred ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#ece7dd] border border-[#dcd7cb] text-[#828794]">
                            [NAME: INFERRED]
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#e6f4ea] border border-[#b7e1cd] text-[#047857]">
                            [NAME: DETECTED_VERIFIED]
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-[#828794]">CONFIDENCE_INDEX:</span>
                        <span className="px-2 py-0.5 rounded bg-[#0e1014] text-[#f7f6f2] font-bold">
                          {Math.round((result.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    {result.description && (
                      <p className="text-xs sm:text-sm text-[#4b4f59] leading-relaxed max-w-3xl">
                        {result.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-[#4b4f59]">
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[#c2410c] hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{result.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {result.contactPage && (
                        <a
                          href={result.contactPage}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[#0e1014] hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>CONTACT_URL: {result.contactPage}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Detected Technologies */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-[#0e1014] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#c2410c]" />
                        Detected Technology Stack ({result.technologies.length})
                      </span>
                    </div>

                    {result.technologiesDetailed && result.technologiesDetailed.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.technologiesDetailed.map((tech) => (
                          <div
                            key={tech.name}
                            className="px-3 py-1.5 rounded bg-[#faf9f6] border border-[#e2ded5] text-xs font-mono flex items-center gap-2"
                          >
                            <span className="font-bold text-[#0e1014]">{tech.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-[#ece7dd] text-[#828794] text-[10px]">
                              {tech.category}
                            </span>
                            <span className="text-[10px] text-[#047857] font-semibold">
                              {Math.round(tech.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#828794] italic font-mono">No framework signatures detected.</p>
                    )}
                  </div>

                  {/* Public Emails & Social Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Emails */}
                    <div className="p-4 rounded-lg bg-[#faf9f6] border border-[#e2ded5] space-y-2 font-mono">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0e1014]">
                        <Mail className="w-3.5 h-3.5 text-[#047857]" />
                        <span>Discovered Public Emails ({result.emails.length})</span>
                      </div>
                      {result.emails.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {result.emails.map((email) => (
                            <a
                              key={email}
                              href={`mailto:${email}`}
                              className="px-2 py-0.5 rounded bg-[#ffffff] border border-[#dcd7cb] text-xs text-[#0e1014] hover:underline"
                            >
                              {email}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#828794] italic">No public emails discovered on page.</p>
                      )}
                    </div>

                    {/* Socials */}
                    <div className="p-4 rounded-lg bg-[#faf9f6] border border-[#e2ded5] space-y-2 font-mono">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0e1014]">
                        <Globe className="w-3.5 h-3.5 text-[#c2410c]" />
                        <span>Social Endpoints ({Object.keys(result.socialLinks).length})</span>
                      </div>
                      {Object.keys(result.socialLinks).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(result.socialLinks).map(([platform, link]) => (
                            <a
                              key={platform}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded bg-[#ffffff] border border-[#dcd7cb] text-xs text-[#0e1014] hover:underline flex items-center gap-1 capitalize"
                            >
                              <span>{platform}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-[#828794]" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#828794] italic">No social endpoints detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Telemetry Strip */}
                  <div className="pt-4 border-t border-[#e2ded5] flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#828794]">
                    <div className="flex flex-wrap items-center gap-4">
                      <span>LATENCY: {result.stats.responseTimeMs}ms</span>
                      <span>PINNED_IP: {result.stats.resolvedIp}</span>
                      <span className="text-[#047857] font-semibold">SSRF_VERIFIED: TRUE</span>
                    </div>
                    <div>
                      <span>LINKS: {result.stats.internalLinksCount} internal / {result.stats.externalLinksCount} external</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AGENT MEMORY STREAM (JSON) */}
              {activeTab === "json" && (
                <div className="p-4 bg-[#0e1014] overflow-x-auto max-h-[520px]">
                  <pre className="font-mono text-xs text-[#ece7dd] leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB 3: SEMANTIC HEADINGS & TEXT */}
              {activeTab === "content" && (
                <div className="p-5 sm:p-6 space-y-6 font-mono text-xs">
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-[#0e1014] block">
                      Heading Tree Hierarchy ({result.headings.length})
                    </span>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-2">
                      {result.headingsDetails?.h1.map((h, i) => (
                        <div key={`h1-${i}`} className="p-2.5 rounded bg-[#faf9f6] border border-[#e2ded5] flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#0e1014] text-[#f7f6f2] font-bold text-[10px]">
                            H1
                          </span>
                          <span className="text-[#0e1014] font-semibold">{h}</span>
                        </div>
                      ))}
                      {result.headingsDetails?.h2.map((h, i) => (
                        <div key={`h2-${i}`} className="p-2.5 rounded bg-[#ffffff] border border-[#e2ded5] flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#ece7dd] text-[#4b4f59] font-bold text-[10px]">
                            H2
                          </span>
                          <span className="text-[#4b4f59]">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.textContent && (
                    <div className="space-y-2">
                      <span className="font-bold uppercase tracking-wider text-[#0e1014] block">
                        Raw Semantic Text (Noise &amp; Navigation Stripped)
                      </span>
                      <div className="p-4 rounded bg-[#faf9f6] border border-[#e2ded5] text-[#4b4f59] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {result.textContent}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
