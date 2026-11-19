"use client";

import React, { useState } from "react";
import { Code2, Copy, Check, FileText } from "lucide-react";

export function ApiDocs() {
  const [selectedLang, setSelectedLang] = useState<"curl" | "node" | "python">("curl");
  const [copied, setCopied] = useState(false);

  const SNIPPETS = {
    curl: `curl -X POST https://webintel-api.dev/api/scan \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://stripe.com",
    "deepScan": false,
    "includeContent": true
  }'`,

    node: `// Modern TypeScript / Node.js
const response = await fetch("https://webintel-api.dev/api/scan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://stripe.com",
    deepScan: false,
    includeContent: true,
  }),
});

const intel = await response.json();
console.log("Company:", intel.companyName);
console.log("Technologies:", intel.technologies);
console.log("Confidence:", intel.confidence);`,

    python: `# Python 3.9+ with requests
import requests

response = requests.post(
    "https://webintel-api.dev/api/scan",
    json={
        "url": "https://stripe.com",
        "deepScan": False,
        "includeContent": True
    },
    timeout=10
)

data = response.json()
print("Website:", data.get("website"))
print("Detected Tech:", data.get("technologies"))
print("Emails:", data.get("emails"))`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[selectedLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="docs" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-3">
            <Code2 className="w-3.5 h-3.5" />
            Developer Reference
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            API Documentation
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            Integrate WebIntel API into your agents, scripts, or backend services in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: API Specification */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono text-xs font-bold">
                  POST
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900">/api/scan</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Submits a public website URL for scanning and extraction. Automatically runs SSRF
                verification, resolves DNS, crawls meta and DOM tags, detects 40+ technologies, and
                returns clean structured JSON.
              </p>

              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Request Parameters
                </h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-indigo-700 font-semibold">
                      <span>url</span>
                      <span className="text-[11px] text-rose-600 font-sans font-medium">Required (string)</span>
                    </div>
                    <p className="text-slate-600 text-[11px] font-sans mt-1">
                      Target public website URL (must start with http:// or https://).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-indigo-700 font-semibold">
                      <span>deepScan</span>
                      <span className="text-[11px] text-slate-400 font-sans font-medium">Optional (bool, default false)</span>
                    </div>
                    <p className="text-slate-600 text-[11px] font-sans mt-1">
                      When true, safely inspects discovered contact or about pages to enrich email and team data.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-indigo-700 font-semibold">
                      <span>includeContent</span>
                      <span className="text-[11px] text-slate-400 font-sans font-medium">Optional (bool, default true)</span>
                    </div>
                    <p className="text-slate-600 text-[11px] font-sans mt-1">
                      Includes cleaned semantic paragraph text snippets for direct LLM ingestion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status codes */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Response Codes
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-emerald-700">200 OK</span>
                    <span className="text-slate-500 block">Scan succeeded</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-amber-700">400 Bad Request</span>
                    <span className="text-slate-500 block">Malformed URL</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-rose-700">403 Forbidden</span>
                    <span className="text-slate-500 block">SSRF / robots block</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-purple-700">429 Rate Limit</span>
                    <span className="text-slate-500 block">&gt; 45 scans / min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code Snippets & Response */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-md">
              {/* Language Switcher */}
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedLang("curl")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLang === "curl"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setSelectedLang("node")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLang === "node"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Node.js / TS
                  </button>
                  <button
                    onClick={() => setSelectedLang("python")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLang === "python"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Python
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-indigo-200 leading-relaxed">
                  {SNIPPETS[selectedLang]}
                </pre>
              </div>
            </div>

            {/* Example JSON output preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Standard Response Format (Schema Guaranteed)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">200 OK application/json</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0f172a] font-mono text-[11px] text-indigo-200 max-h-48 overflow-y-auto leading-relaxed">
{`{
  "success": true,
  "website": "https://stripe.com",
  "companyName": "Stripe",
  "description": "Financial infrastructure for the internet...",
  "headings": ["Financial Infrastructure", "Global Payments", ...],
  "services": ["Payments", "Billing", "Connect", ...],
  "emails": ["support@stripe.com"],
  "socialLinks": { "github": "https://github.com/stripe" },
  "contactPage": "https://stripe.com/contact",
  "technologies": ["Next.js", "React", "Stripe", "Cloudflare"],
  "pagesAnalyzed": ["https://stripe.com"],
  "confidence": 0.95
}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
