"use client";

import React, { useState } from "react";
import { Copy, Check, Bot } from "lucide-react";

type FrameworkType = "langchain" | "crewai" | "openai" | "typescript";

export function AgentWorkbench() {
  const [framework, setFramework] = useState<FrameworkType>("langchain");
  const [copied, setCopied] = useState(false);

  const SNIPPETS: Record<FrameworkType, string> = {
    langchain: `from langchain.tools import tool
import requests

@tool
def web_intelligence_scanner(url: str) -> dict:
    """
    Scans a public website URL and returns structured intelligence:
    technology stack, company description, semantic headings, and contact info.
    Protected against SSRF and private network attacks.
    """
    response = requests.post(
        "https://webintel-api.dev/api/scan",
        json={"url": url, "deepScan": False, "includeContent": True},
        timeout=10
    )
    return response.json()

# Attach directly to your LangChain agent:
# agent = create_openai_tools_agent(llm, [web_intelligence_scanner], prompt)`,

    crewai: `from crewai.tools import tool
import requests

@tool("Web Intelligence Scanner")
def scan_website_tool(url: str) -> str:
    """
    Analyzes any company website URL and extracts tech stack, verified headings,
    and business capabilities without hallucinations.
    """
    res = requests.post(
        "https://webintel-api.dev/api/scan",
        json={"url": url, "deepScan": True},
        timeout=10
    )
    data = res.json()
    if not data.get("success"):
        return f"Scan failed: {data.get('error', {}).get('message')}"
    return (
        f"Company: {data.get('companyName')}\\n"
        f"Tech Stack: {', '.join(data.get('technologies', []))}\\n"
        f"Confidence: {data.get('confidence')}"
    )`,

    openai: `// OpenAI Function / Tool Calling Schema (JSON Schema)
const webIntelTool = {
  type: "function",
  function: {
    name: "scan_website_intelligence",
    description: "Extracts verified company profile, technologies, headings, and emails from any public URL.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The public HTTP or HTTPS website URL to scan (e.g. https://stripe.com)"
        },
        deepScan: {
          type: "boolean",
          description: "Whether to safely inspect contact or about pages on the same domain"
        }
      },
      required: ["url"]
    }
  }
};`,

    typescript: `// Vercel AI SDK / TypeScript Agent Tool
import { tool } from 'ai';
import { z } from 'zod';

export const webIntelTool = tool({
  description: 'Gathers verified business intelligence and tech stack from any website URL.',
  parameters: z.object({
    url: z.string().url().describe('The public website URL to analyze'),
    deepScan: z.boolean().optional().default(false),
  }),
  execute: async ({ url, deepScan }) => {
    const res = await fetch('https://webintel-api.dev/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, deepScan, includeContent: true }),
    });
    return await res.json();
  },
});`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[framework]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 bg-[#ffffff] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Bot className="w-3.5 h-3.5 text-[#c2410c]" />
              AGENT_TOOLCHAIN_GENERATOR
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              Drop-In Agent Tool Definitions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              Instantly connect WebIntel API as a first-class tool for LangChain, CrewAI, OpenAI, or Vercel AI SDK.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#828794]">TOKEN_OPTIMIZED:</span>
            <span className="px-2 py-0.5 rounded bg-[#e6f4ea] text-[#047857] font-bold">
              ZERO_DOM_BLOAT
            </span>
          </div>
        </div>

        {/* Framework Selector Tabs */}
        <div className="rounded-xl bg-[#faf9f6] border border-[#e2ded5] overflow-hidden">
          <div className="px-4 py-3 bg-[#f1ede4] border-b border-[#e2ded5] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFramework("langchain")}
                className={`px-3 py-1.5 rounded transition-all ${
                  framework === "langchain"
                    ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                    : "bg-[#ffffff] text-[#4b4f59] border border-[#dcd7cb] hover:bg-[#e4dfd3]"
                }`}
              >
                LangChain (Python)
              </button>
              <button
                onClick={() => setFramework("crewai")}
                className={`px-3 py-1.5 rounded transition-all ${
                  framework === "crewai"
                    ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                    : "bg-[#ffffff] text-[#4b4f59] border border-[#dcd7cb] hover:bg-[#e4dfd3]"
                }`}
              >
                CrewAI
              </button>
              <button
                onClick={() => setFramework("openai")}
                className={`px-3 py-1.5 rounded transition-all ${
                  framework === "openai"
                    ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                    : "bg-[#ffffff] text-[#4b4f59] border border-[#dcd7cb] hover:bg-[#e4dfd3]"
                }`}
              >
                OpenAI Tools
              </button>
              <button
                onClick={() => setFramework("typescript")}
                className={`px-3 py-1.5 rounded transition-all ${
                  framework === "typescript"
                    ? "bg-[#0e1014] text-[#f7f6f2] font-semibold"
                    : "bg-[#ffffff] text-[#4b4f59] border border-[#dcd7cb] hover:bg-[#e4dfd3]"
                }`}
              >
                Vercel AI SDK
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-[#ffffff] hover:bg-[#ece7dd] border border-[#dcd7cb] text-[#0e1014] text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#047857]" />
                  <span className="text-[#047857] font-semibold">COPIED_TO_CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#828794]" />
                  <span>COPY_TOOL_CODE</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-5 bg-[#0e1014] overflow-x-auto">
            <pre className="font-mono text-xs text-[#ece7dd] leading-relaxed">
              {SNIPPETS[framework]}
            </pre>
          </div>
        </div>

      </div>
    </section>
  );
}
