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
    <section id="docs" className="py-20 bg-[#f7f6f2] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Code2 className="w-3.5 h-3.5 text-[#c2410c]" />
              API_INTERFACE_SPECIFICATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              Developer Documentation
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              Standard REST endpoint specifications, input validation schemas, and client examples.
            </p>
          </div>

          <div className="font-mono text-xs text-[#828794]">
            [FORMAT: APPLICATION_JSON]
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: API Specification */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 sm:p-6 rounded-xl bg-[#ffffff] border border-[#e2ded5] shadow-xs space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1ede4]">
                <span className="px-2 py-0.5 rounded bg-[#0e1014] text-[#f7f6f2] text-xs font-bold">
                  POST
                </span>
                <span className="text-sm font-bold text-[#0e1014]">/api/scan</span>
              </div>
              <p className="text-[#4b4f59] font-sans text-xs leading-relaxed">
                Submits a public website URL for scanning and extraction. Automatically runs SSRF
                verification, resolves DNS, crawls meta and DOM tags, detects 40+ technologies, and
                returns clean structured JSON.
              </p>

              <div className="pt-2 border-t border-[#f1ede4]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#828794] mb-3">
                  Request Parameters
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded bg-[#faf9f6] border border-[#e2ded5]">
                    <div className="flex items-center justify-between text-[#c2410c] font-semibold">
                      <span>url</span>
                      <span className="text-[10px] text-[#c53030] font-sans font-medium">Required (string)</span>
                    </div>
                    <p className="text-[#4b4f59] text-[11px] font-sans mt-1">
                      Target public website URL (must start with http:// or https://).
                    </p>
                  </div>

                  <div className="p-3 rounded bg-[#faf9f6] border border-[#e2ded5]">
                    <div className="flex items-center justify-between text-[#0e1014] font-semibold">
                      <span>deepScan</span>
                      <span className="text-[10px] text-[#828794] font-sans font-medium">Optional (bool, false)</span>
                    </div>
                    <p className="text-[#4b4f59] text-[11px] font-sans mt-1">
                      When true, safely inspects discovered contact or about pages on same domain.
                    </p>
                  </div>

                  <div className="p-3 rounded bg-[#faf9f6] border border-[#e2ded5]">
                    <div className="flex items-center justify-between text-[#0e1014] font-semibold">
                      <span>includeContent</span>
                      <span className="text-[10px] text-[#828794] font-sans font-medium">Optional (bool, true)</span>
                    </div>
                    <p className="text-[#4b4f59] text-[11px] font-sans mt-1">
                      Includes cleaned semantic paragraph text snippets for direct LLM ingestion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status codes */}
              <div className="pt-2 border-t border-[#f1ede4]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#828794] mb-2">
                  Response HTTP Codes
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-[#faf9f6] border border-[#e2ded5]">
                    <span className="font-bold text-[#047857]">200 OK</span>
                    <span className="text-[#828794] block text-[10px]">Scan succeeded</span>
                  </div>
                  <div className="p-2 rounded bg-[#faf9f6] border border-[#e2ded5]">
                    <span className="font-bold text-[#d97706]">400 Bad Request</span>
                    <span className="text-[#828794] block text-[10px]">Malformed URL</span>
                  </div>
                  <div className="p-2 rounded bg-[#faf9f6] border border-[#e2ded5]">
                    <span className="font-bold text-[#c53030]">403 Forbidden</span>
                    <span className="text-[#828794] block text-[10px]">SSRF / robots block</span>
                  </div>
                  <div className="p-2 rounded bg-[#faf9f6] border border-[#e2ded5]">
                    <span className="font-bold text-[#6b46c1]">429 Rate Limit</span>
                    <span className="text-[#828794] block text-[10px]">&gt; 45 scans / min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code Snippets & Response */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl bg-[#0e1014] border border-[#252830] overflow-hidden shadow-xs">
              {/* Language Switcher */}
              <div className="px-4 py-2.5 bg-[#171a21] border-b border-[#252830] flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedLang("curl")}
                    className={`px-3 py-1 rounded transition-all ${
                      selectedLang === "curl"
                        ? "bg-[#ffffff] text-[#0e1014] font-bold"
                        : "text-[#828794] hover:text-[#ece7dd]"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setSelectedLang("node")}
                    className={`px-3 py-1 rounded transition-all ${
                      selectedLang === "node"
                        ? "bg-[#ffffff] text-[#0e1014] font-bold"
                        : "text-[#828794] hover:text-[#ece7dd]"
                    }`}
                  >
                    Node.js
                  </button>
                  <button
                    onClick={() => setSelectedLang("python")}
                    className={`px-3 py-1 rounded transition-all ${
                      selectedLang === "python"
                        ? "bg-[#ffffff] text-[#0e1014] font-bold"
                        : "text-[#828794] hover:text-[#ece7dd]"
                    }`}
                  >
                    Python
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-[#252830] hover:bg-[#333742] text-[#ece7dd] text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#047857]" />
                      <span className="text-[#047857] font-semibold">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#828794]" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 sm:p-5 overflow-x-auto">
                <pre className="font-mono text-xs text-[#ece7dd] leading-relaxed">
                  {SNIPPETS[selectedLang]}
                </pre>
              </div>
            </div>

            {/* Example JSON output preview */}
            <div className="p-4 rounded-xl bg-[#ffffff] border border-[#e2ded5] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[#828794] pb-2 border-b border-[#f1ede4]">
                <span className="font-bold text-[#0e1014] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#c2410c]" />
                  OUTPUT_SCHEMA: GUARANTEED_SHAPE
                </span>
                <span className="text-[10px]">200 OK application/json</span>
              </div>
              <div className="p-3.5 rounded bg-[#0e1014] text-[#ece7dd] text-[11px] max-h-48 overflow-y-auto leading-relaxed">
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
