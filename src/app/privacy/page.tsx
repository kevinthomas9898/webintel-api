import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | WebIntel API",
  description: "Privacy policy and data retention disclosure for the WebIntel API and MCP server.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#c2410c] hover:underline mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO CONSOLE
      </Link>

      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#4b4f59] mb-3">
        <Shield className="w-4 h-4 text-[#047857]" />
        GOVERNANCE & DATA RETENTION
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-xs font-mono text-[#828794] mb-8">Effective Date: November 20, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-[#2a2d34]">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0e1014]">1. Overview</h2>
          <p>
            WebIntel API (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides website intelligence, technology reconnaissance,
            and content extraction tools for autonomous AI agents and developers. We are committed to transparency,
            minimal data footprint, and zero user data harvesting.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0e1014]">2. Ephemeral Processing & No Data Retention</h2>
          <p>
            When an AI agent or user calls WebIntel API or our Model Context Protocol (MCP) server:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>No Content Stored:</strong> Scanned web pages, HTML bodies, and target URL contents are processed ephemerally in memory and immediately discarded.</li>
            <li><strong>No Personal Profiles:</strong> We do not build consumer profiles, track visitor sessions, or store query payloads.</li>
            <li><strong>No LLM Training:</strong> Data submitted through the API is never used to train machine learning models.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0e1014]">3. Target Website Privacy</h2>
          <p>
            WebIntel acts as a standardized HTTP client (identified as <code>WebIntelBot/1.0</code>). We respect
            remote website robots.txt directives and query only publicly accessible endpoints. Private IP ranges,
            intranet networks, and cloud metadata ports are strictly blocked at the socket boundary.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0e1014]">4. Telemetry & Security Logging</h2>
          <p>
            We collect minimal technical telemetry necessary to maintain service stability and defend against DDoS attacks:
            client IP addresses (hashed for sliding-window rate limiting), response latency, and HTTP status codes.
            Rate limit records expire automatically from memory every 60 seconds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0e1014]">5. Contact</h2>
          <p>
            For privacy inquiries or compliance verification, contact the operator through the official GitHub
            repository at{" "}
            <a
              href="https://github.com/kevinthomas9898/webintel-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c2410c] hover:underline"
            >
              github.com/kevinthomas9898/webintel-api
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
