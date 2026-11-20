import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Trust Center & Security | WebIntel API",
  description: "Public security controls, SSRF defense architecture, and compliance portal for WebIntel API.",
};

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#c2410c] hover:underline mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO CONSOLE
      </Link>

      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#047857] mb-3">
        <ShieldCheck className="w-4 h-4" />
        SECURITY ASSURANCE & COMPLIANCE
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Trust Center</h1>
      <p className="text-xs font-mono text-[#828794] mb-8">
        Architecture, Perimeter Controls, and SSRF Defense Audit
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-[#2a2d34]">
        <section className="p-5 rounded-xl bg-[#ffffff] border border-[#e2ded5] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0e1014]">
            <Lock className="w-4 h-4 text-[#047857]" />
            Security Core Principles
          </div>
          <p className="text-xs text-[#4b4f59]">
            WebIntel API is designed from the ground up for safe agentic autonomy. Our infrastructure guarantees
            that autonomous agents cannot be weaponized or tricked into intranet lateral movement via Server-Side Request Forgery (SSRF).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0e1014]">1. Multi-Tier SSRF Defense Perimeter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#ffffff] border border-[#e2ded5]">
              <div className="font-bold text-xs mb-1 text-[#0e1014] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
                DNS Pre-Resolution & IP Filtering
              </div>
              <p className="text-xs text-[#4b4f59]">
                Every domain is pre-resolved using system DNS. All returned IPv4 and IPv6 addresses are tested against
                RFC 1918, RFC 3927, RFC 4193, and RFC 6598 CIDRs.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#ffffff] border border-[#e2ded5]">
              <div className="font-bold text-xs mb-1 text-[#0e1014] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
                Socket IP Pinning (Anti-Rebinding)
              </div>
              <p className="text-xs text-[#4b4f59]">
                Custom Node.js HTTP/HTTPS agents pin the validated socket IP address directly, preventing Time-of-Check to
                Time-of-Use (TOCTOU) DNS rebinding exploits.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#ffffff] border border-[#e2ded5]">
              <div className="font-bold text-xs mb-1 text-[#0e1014] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
                Cloud Metadata Shield
              </div>
              <p className="text-xs text-[#4b4f59]">
                Permanent blocks against cloud metadata addresses (169.254.169.254, metadata.google.internal,
                fd00:ec2::254) protect underlying infrastructure from credential exfiltration.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#ffffff] border border-[#e2ded5]">
              <div className="font-bold text-xs mb-1 text-[#0e1014] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
                Manual Redirect Validation
              </div>
              <p className="text-xs text-[#4b4f59]">
                HTTP redirects are evaluated hop-by-hop. If an initial public URL redirects toward a private or loopback
                address, the request is severed immediately.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0e1014]">2. Resource & Streaming Protections</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Hard Memory Cap:</strong> Response streams are throttled and terminated if payloads exceed 2.5 MB.</li>
            <li><strong>Strict Timeout:</strong> All outbound HTTP requests enforce an 8,000ms hard deadline.</li>
            <li><strong>Read-Only Sandbox:</strong> The MCP server performs strictly idempotent GET queries; it cannot POST data, mutate state, or run client-side JavaScript.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0e1014]">3. Vulnerability Disclosure</h2>
          <p>
            Security researchers can report findings or request audits via our GitHub security advisory portal at{" "}
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
