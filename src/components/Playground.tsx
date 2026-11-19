"use client";

import React, { useState } from "react";
import {
  Search,
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
  ShieldCheck,
  Clock,
  Server,
  FileCode,
  Building,
  Share2,
  RefreshCw,
} from "lucide-react";
import type { WebIntelScanResult } from "@/lib/schemas/scan";

const PRESETS = [
  { label: "Stripe", url: "https://stripe.com", desc: "Fintech & Payments" },
  { label: "GitHub", url: "https://github.com", desc: "Developer Platform" },
  { label: "Vercel", url: "https://vercel.com", desc: "Cloud & Frontend" },
  { label: "Example Domain", url: "https://example.com", desc: "Standard RFC 2606" },
  { label: "Test SSRF Block", url: "http://127.0.0.1:8080", desc: "Security Guardrail" },
];

export function Playground() {
  const [url, setUrl] = useState("https://stripe.com");
  const [deepScan, setDeepScan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "json" | "content">("overview");
  const [result, setResult] = useState<WebIntelScanResult | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [scanStep, setScanStep] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleScan = async (targetUrl = url) => {
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Realistic visual progress steps
    setScanStep("1. Validating DNS & SSRF IP boundaries...");
    const stepTimer1 = setTimeout(() => {
      setScanStep("2. Connecting socket to pinned safe IP & fetching HTML...");
    }, 400);

    const stepTimer2 = setTimeout(() => {
      setScanStep("3. Parsing DOM with Cheerio & detecting tech signatures...");
    }, 900);

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
        setActiveTab("overview");
      }
    } catch (err: unknown) {
      setError({
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network failure while reaching scanner API",
      });
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setScanStep("");
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
    <section id="playground" className="py-16 lg:py-20 bg-[#070a12] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-3">
            <Globe className="w-3.5 h-3.5" />
            Live API Playground
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Test the Scanner in Real-Time
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Enter any public website URL to test our extraction pipeline, verify SSRF guardrails,
            and inspect the structured response format.
          </p>
        </div>

        {/* Input Bar & Controls */}
        <div className="max-w-4xl mx-auto">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-indigo-950/40 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScan();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>Scan URL</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Presets & Deep Scan Toggle */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                <span className="text-slate-500 font-medium">Presets:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setUrl(p.url);
                      handleScan(p.url);
                    }}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 hover:text-cyan-300 border border-slate-700/60 text-slate-300 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={deepScan}
                  onChange={(e) => setDeepScan(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
                />
                <span className="text-xs text-slate-400 hover:text-slate-200">
                  Deep scan (enrich contact page)
                </span>
              </label>
            </div>
          </div>

          {/* Progress Indicator */}
          {loading && (
            <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-sm text-cyan-300 font-mono">{scanStep}</span>
            </div>
          )}

          {/* Error Message Display */}
          {error && !loading && (
            <div className="mt-6 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-red-300">Scan Blocked / Failed</span>
                  <span className="px-2 py-0.5 rounded bg-red-900/50 border border-red-700/50 text-[11px] font-mono font-bold text-red-300">
                    {error.code}
                  </span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">{error.message}</p>
                {error.code.includes("SSRF") && (
                  <p className="text-[11px] text-emerald-400 pt-1 font-medium">
                    ✓ SSRF Guardrail successfully intercepted and neutralized unauthorized internal address access.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Scan Result Container */}
          {result && !loading && (
            <div className="mt-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
              {/* Result Navigation Bar */}
              <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "overview"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                  >
                    Structured Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${activeTab === "json"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    Clean JSON
                  </button>
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "content"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                  >
                    Headings & Text
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Copy response JSON"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    title="Download JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Top Company Profile Card */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {result.companyName || "Website"}
                        </h3>
                        {result.inferredData.companyNameIsInferred ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Inferred
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Verified Detected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-xs text-slate-400">Confidence:</div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300">
                          <span>{Math.round((result.confidence || 0) * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {result.description && (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {result.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {result.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {result.contactPage && (
                        <a
                          href={result.contactPage}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-indigo-400 hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Contact Page
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Detected Technologies */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Detected Technologies ({result.technologies.length})
                      </h4>
                    </div>

                    {result.technologiesDetailed && result.technologiesDetailed.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.technologiesDetailed.map((tech) => (
                          <div
                            key={tech.name}
                            className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs flex items-center gap-2"
                          >
                            <span className="font-semibold text-slate-200">{tech.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                              {tech.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No specific framework signatures detected.</p>
                    )}
                  </div>

                  {/* Public Emails & Social Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Emails */}
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Public Emails ({result.emails.length})</span>
                      </div>
                      {result.emails.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {result.emails.map((email) => (
                            <a
                              key={email}
                              href={`mailto:${email}`}
                              className="px-2.5 py-1 rounded-md bg-cyan-950/30 border border-cyan-800/40 text-xs font-mono text-cyan-300 hover:underline"
                            >
                              {email}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No public email found on scanned page.</p>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Social Profiles ({Object.keys(result.socialLinks).length})</span>
                      </div>
                      {Object.keys(result.socialLinks).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(result.socialLinks).map(([platform, link]) => (
                            <a
                              key={platform}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 capitalize transition-colors"
                            >
                              <Share2 className="w-3 h-3 text-cyan-400" />
                              <span>{platform}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No social links detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Extracted Services / Keywords */}
                  {result.services.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Services & Capability Keywords
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300 font-medium"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scan Telemetry Footer */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Latency: {result.stats.responseTimeMs}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Server className="w-3.5 h-3.5 text-slate-500" />
                        <span>IP: {result.stats.resolvedIp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SSRF Verified</span>
                      </div>
                    </div>
                    <div>
                      <span>
                        Links: {result.stats.internalLinksCount} internal / {result.stats.externalLinksCount} external
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RAW JSON */}
              {activeTab === "json" && (
                <div className="p-4 bg-slate-950 overflow-x-auto max-h-[500px]">
                  <pre className="font-mono text-xs text-cyan-300/90 leading-relaxed selection:bg-indigo-900">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB 3: CONTENT & HEADINGS */}
              {activeTab === "content" && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Headings Hierarchy */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Extracted Headings Hierarchy ({result.headings.length})
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                      {result.headingsDetails?.h1.map((h, i) => (
                        <div key={`h1-${i}`} className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold text-[10px]">
                            H1
                          </span>
                          <span className="text-slate-200">{h}</span>
                        </div>
                      ))}
                      {result.headingsDetails?.h2.map((h, i) => (
                        <div key={`h2-${i}`} className="p-2 rounded bg-slate-950/30 border border-slate-800/60 flex items-start gap-2 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                            H2
                          </span>
                          <span className="text-slate-300">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clean Text Content */}
                  {result.textContent && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Extracted Readable Text (for LLM context)
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
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
