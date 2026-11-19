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
  { label: "Example Domain", url: "https://example.com", desc: "RFC 2606" },
  { label: "Test SSRF Block", url: "http://127.0.0.1:8080", desc: "Security Guard" },
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
    <section id="playground" className="py-16 lg:py-20 bg-slate-100/60 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-3">
            <Globe className="w-3.5 h-3.5" />
            Live API Playground
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Test the Scanner in Real-Time
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Enter any public website URL to test our extraction pipeline, verify SSRF guardrails,
            and inspect the structured response format.
          </p>
        </div>

        {/* Input Bar & Controls */}
        <div className="max-w-4xl mx-auto">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm shadow-slate-200/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScan();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[130px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-100" />
                      <span>Scan URL</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Presets & Deep Scan Toggle */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
                <span className="text-slate-400 font-medium">Quick Presets:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setUrl(p.url);
                      handleScan(p.url);
                    }}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-700 font-medium transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none pt-1 sm:pt-0">
                <input
                  type="checkbox"
                  checked={deepScan}
                  onChange={(e) => setDeepScan(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 hover:text-slate-900 font-medium">
                  Deep scan (enrich contact page)
                </span>
              </label>
            </div>
          </div>

          {/* Progress Indicator */}
          {loading && (
            <div className="mt-5 p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs sm:text-sm text-indigo-900 font-mono font-medium">{scanStep}</span>
            </div>
          )}

          {/* Error Message Display */}
          {error && !loading && (
            <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-rose-950">Scan Blocked / Failed</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 border border-rose-300 text-[11px] font-mono font-bold text-rose-800">
                    {error.code}
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">{error.message}</p>
                {error.code.includes("SSRF") && (
                  <p className="text-[11px] text-emerald-700 pt-1 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    SSRF Guardrail successfully intercepted and neutralized unauthorized internal address access.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Scan Result Container */}
          {result && !loading && (
            <div className="mt-8 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              {/* Result Navigation Bar */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      activeTab === "overview"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Structured Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                      activeTab === "json"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    Clean JSON
                  </button>
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      activeTab === "content"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Headings &amp; Text
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                    title="Copy response JSON"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs shadow-xs transition-colors"
                    title="Download JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Top Company Profile Card */}
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                            {result.companyName || "Website"}
                          </h3>
                        </div>
                        {result.inferredData.companyNameIsInferred ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Inferred
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified Detected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Confidence:</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-indigo-700 shadow-2xs">
                          <span>{Math.round((result.confidence || 0) * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {result.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {result.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {result.website}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      {result.contactPage && (
                        <a
                          href={result.contactPage}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          Contact Page
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Detected Technologies */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Detected Technologies ({result.technologies.length})
                      </h4>
                    </div>

                    {result.technologiesDetailed && result.technologiesDetailed.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.technologiesDetailed.map((tech) => (
                          <div
                            key={tech.name}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center gap-2 shadow-2xs hover:border-slate-300 transition-colors"
                          >
                            <span className="font-semibold text-slate-800">{tech.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                              {tech.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific framework signatures detected.</p>
                    )}
                  </div>

                  {/* Public Emails & Social Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Emails */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Public Emails ({result.emails.length})</span>
                      </div>
                      {result.emails.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {result.emails.map((email) => (
                            <a
                              key={email}
                              href={`mailto:${email}`}
                              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono text-indigo-700 hover:text-indigo-900 shadow-2xs hover:underline"
                            >
                              {email}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No public email found on scanned page.</p>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
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
                              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5 capitalize shadow-2xs transition-colors"
                            >
                              <Share2 className="w-3 h-3 text-indigo-600" />
                              <span className="font-medium">{platform}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No social links detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Extracted Services / Keywords */}
                  {result.services.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Services &amp; Capability Keywords
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-xs text-purple-800 font-medium"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scan Telemetry Footer */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Latency: {result.stats.responseTimeMs}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Server className="w-3.5 h-3.5 text-slate-400" />
                        <span>IP: {result.stats.resolvedIp}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>SSRF Armor Verified</span>
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
                <div className="p-4 bg-[#0f172a] overflow-x-auto max-h-[500px]">
                  <pre className="font-mono text-xs text-indigo-200 leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB 3: CONTENT & HEADINGS */}
              {activeTab === "content" && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Headings Hierarchy */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Extracted Headings Hierarchy ({result.headings.length})
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                      {result.headingsDetails?.h1.map((h, i) => (
                        <div key={`h1-${i}`} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px]">
                            H1
                          </span>
                          <span className="text-slate-800 font-medium">{h}</span>
                        </div>
                      ))}
                      {result.headingsDetails?.h2.map((h, i) => (
                        <div key={`h2-${i}`} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-start gap-2 text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                            H2
                          </span>
                          <span className="text-slate-700">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clean Text Content */}
                  {result.textContent && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Extracted Readable Text (for LLM context)
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
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
