"use client";

import React, { useState } from "react";
import { Bot, CheckCircle2, Copy, DollarSign } from "lucide-react";

export function CloudflareMonetization() {
  const [copied, setCopied] = useState(false);

  const CLOUDFLARE_CURL = `curl -X POST https://webintel-api.dev/api/scan \\
  -H "Content-Type: application/json" \\
  -H "CF-Monetization-Status: verified" \\
  -H "CF-Agent-Payer: agent_corp_wallet_9823" \\
  -d '{
    "url": "https://stripe.com",
    "format": "json"
  }'`;

  const MCP_CONFIG = `{
  "mcpServers": {
    "webintel": {
      "url": "https://webintel-api.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_AGENT_KEY"
      }
    }
  }
}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="monetization" className="py-20 bg-[#ffffff] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fff7ed] border border-[#fed7aa] text-[10px] font-mono text-[#c2410c] uppercase font-bold mb-2">
              <DollarSign className="w-3.5 h-3.5 text-[#c2410c]" />
              PAY_PER_CRAWL_GATEWAY
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              Cloudflare Monetization Gateway &amp; Micropayments
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              Charge AI agents, autonomous crawlers, and LLM swarms automatically per URL scan ($0.005 / scan &bull; 95% cheaper than Clearbit &amp; Firecrawl).
            </p>
          </div>

          <div className="font-mono text-xs text-[#047857] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
            <span>GATEWAY_STATUS: ACTIVE</span>
          </div>
        </div>

        {/* 2-Column Split: Explanation & Live Handshake */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-mono">
          
          {/* Left Column: How It Works */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-[#faf9f6] border border-[#e2ded5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0e1014]">HOW MICROPAYMENTS WORK</span>
                <span className="px-2 py-0.5 rounded bg-[#e6f4ea] text-[#047857] text-[10px] font-bold">
                  $0.005 / SCAN
                </span>
              </div>
              <p className="text-xs text-[#4b4f59] font-sans leading-relaxed">
                When an AI agent (such as Claude Desktop, Perplexity, Cursor, or custom LangChain fleets)
                submits a URL to your domain, Cloudflare&apos;s Monetization Gateway verifies the agent&apos;s
                digital payment credentials, debits their account, and delivers verified headers to WebIntel.
              </p>

              <div className="space-y-2 pt-2 border-t border-[#e2ded5] text-xs">
                <div className="flex items-start gap-2 text-[#4b4f59] font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Sales Friction:</strong> Agents pay automatically via machine-to-machine wallets.</span>
                </div>
                <div className="flex items-start gap-2 text-[#4b4f59] font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                  <span><strong>Native MCP Server:</strong> Claude and Cursor can call WebIntel tools natively via Model Context Protocol.</span>
                </div>
                <div className="flex items-start gap-2 text-[#4b4f59] font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                  <span><strong>High-Throughput Batching:</strong> Agents can scan up to 8 URLs concurrently in a single batch request.</span>
                </div>
              </div>
            </div>

            {/* MCP Configuration Box */}
            <div className="p-5 rounded-xl bg-[#faf9f6] border border-[#e2ded5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0e1014] flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#c2410c]" />
                  Claude Desktop &amp; Cursor MCP Config
                </span>
                <button
                  onClick={() => handleCopy(MCP_CONFIG)}
                  className="px-2 py-0.5 rounded bg-[#ffffff] border border-[#dcd7cb] text-[10px] text-[#0e1014] hover:bg-[#ece7dd]"
                >
                  {copied ? "COPIED" : "COPY_JSON"}
                </button>
              </div>
              <div className="p-3 rounded bg-[#0e1014] text-[#ece7dd] text-[11px] overflow-x-auto">
                <pre>{MCP_CONFIG}</pre>
              </div>
            </div>
          </div>

          {/* Right Column: Code Request & Gateway Flow */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-xl bg-[#0e1014] border border-[#252830] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#171a21] border-b border-[#252830] flex items-center justify-between text-xs text-[#828794]">
                <span>AGENT_HTTP_PAYMENT_HEADERS</span>
                <button
                  onClick={() => handleCopy(CLOUDFLARE_CURL)}
                  className="text-xs text-[#ece7dd] hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>COPY</span>
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs text-[#ece7dd] leading-relaxed">
                  {CLOUDFLARE_CURL}
                </pre>
              </div>
            </div>

            {/* Gateway Telemetry Response Preview */}
            <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e2ded5] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#828794] pb-2 border-b border-[#e2ded5]">
                <span className="font-bold text-[#0e1014]">GATEWAY_EXECUTION_AUDIT</span>
                <span className="text-[#047857] font-bold">200 OK</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-[#4b4f59]">
                <div className="flex justify-between">
                  <span>cf-monetization-status:</span>
                  <span className="text-[#047857] font-bold">verified (paid)</span>
                </div>
                <div className="flex justify-between">
                  <span>cf-cost-debited:</span>
                  <span className="text-[#0e1014] font-bold">$0.0050 USD</span>
                </div>
                <div className="flex justify-between">
                  <span>extracted-tech-count:</span>
                  <span className="text-[#0e1014] font-bold">4 technologies</span>
                </div>
                <div className="flex justify-between">
                  <span>ssrf-socket-status:</span>
                  <span className="text-[#047857] font-bold">pinned (safe)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
