"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from "lucide-react";

interface ThreatScenario {
  id: string;
  title: string;
  targetUrl: string;
  vector: string;
  riskDescription: string;
  defenseMechanism: string;
  blockedStatus: string;
  blockedReason: string;
}

const THREAT_SCENARIOS: ThreatScenario[] = [
  {
    id: "metadata",
    title: "Cloud Metadata Exfiltration",
    targetUrl: "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
    vector: "AWS / GCP / Azure Instance Metadata Service (IMDS)",
    riskDescription:
      "Naive URL scrapers allow attackers to query the link-local metadata address, exfiltrating temporary IAM role credentials and VPC keys.",
    defenseMechanism: "Pre-DNS CIDR Mask: 169.254.0.0/16 is permanently blacklisted prior to any socket connection.",
    blockedStatus: "403 Forbidden",
    blockedReason: "SSRF_IP_BLOCKED: Hostname resolved to cloud metadata link-local address.",
  },
  {
    id: "loopback",
    title: "Localhost & Port Pivoting",
    targetUrl: "http://127.0.0.1:6379/info",
    vector: "Internal Service & Redis Socket Probing",
    riskDescription:
      "Malicious URLs targeting 127.0.0.1 can command unauthenticated Redis, PostgreSQL, or Docker API daemons listening on the host.",
    defenseMechanism: "Blocks 127.0.0.0/8 and ::1 during asynchronous DNS inspection before socket allocation.",
    blockedStatus: "403 Forbidden",
    blockedReason: "RESTRICTED_HOSTNAME: Access to loopback addresses is strictly prohibited.",
  },
  {
    id: "private-subnet",
    title: "RFC-1918 Lateral Traversal",
    targetUrl: "http://192.168.1.1/admin.html",
    vector: "Private Subnet Network Mapping",
    riskDescription:
      "Scanners without strict boundary checks can map intra-cluster VPC microservices or private internal gateways.",
    defenseMechanism: "Bitwise CIDR intersection check blocks all 10/8, 172.16/12, and 192.168/16 IP spaces.",
    blockedStatus: "403 Forbidden",
    blockedReason: "SSRF_IP_BLOCKED: Hostname resolved to private network address.",
  },
  {
    id: "dns-rebinding",
    title: "TOCTOU DNS Rebinding Attack",
    targetUrl: "https://rebind.attacker-domain.org",
    vector: "Time-of-Check to Time-of-Use DNS Rebinding",
    riskDescription:
      "Domain resolves to a benign public IP during initial validation, then returns 127.0.0.1 when the socket establishes.",
    defenseMechanism: "Socket IP Pinning: The HTTP agent lookup function bypasses OS DNS and binds the socket strictly to the pre-validated IP.",
    blockedStatus: "INTERCEPTED",
    blockedReason: "Socket pinned strictly to initial verified IP. Rebinding attack neutralized.",
  },
];

export function SsrfSandbox() {
  const [activeScenario, setActiveScenario] = useState<ThreatScenario>(THREAT_SCENARIOS[0]);

  return (
    <section id="security" className="py-20 bg-[#ffffff] border-b border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#e2ded5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ece7dd] border border-[#dcd7cb] text-[10px] font-mono text-[#4b4f59] uppercase font-semibold mb-2">
              <Lock className="w-3.5 h-3.5 text-[#047857]" />
              ZERO_TRUST_SIMULATOR
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1014]">
              SSRF Armor Interception Trace
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4b4f59]">
              Test real-world malicious attack vectors and inspect how socket pinning blocks unauthorized ingress.
            </p>
          </div>

          <div className="font-mono text-xs text-[#047857] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
            <span>SOCKET_PINNING: ENFORCED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Threat Selector */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#828794] mb-1">
              Select Threat Vector
            </div>
            {THREAT_SCENARIOS.map((scenario) => {
              const isSelected = activeScenario.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActiveScenario(scenario)}
                  className={`w-full text-left p-4 rounded-lg border font-mono transition-all ${
                    isSelected
                      ? "bg-[#faf9f6] border-[#0e1014] shadow-xs ring-1 ring-[#0e1014]"
                      : "bg-[#ffffff] hover:bg-[#faf9f6] border-[#e2ded5]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#0e1014]">{scenario.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#fff5f5] border border-[#fed7d7] text-[#c53030]">
                      HIGH_RISK
                    </span>
                  </div>
                  <div className="text-[11px] text-[#828794] truncate mb-1.5">
                    {scenario.targetUrl}
                  </div>
                  <div className="text-[11px] text-[#4b4f59] font-sans line-clamp-1">
                    {scenario.vector}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Defensive Trace Panel */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="h-full rounded-xl bg-[#faf9f6] border border-[#e2ded5] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#e2ded5] mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-[#e6f4ea] text-[#047857] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0e1014] font-mono">
                        NETWORK_SOCKET_INTERCEPTION
                      </h4>
                      <p className="text-[10px] font-mono text-[#828794]">Zero connection permitted to host</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#e6f4ea] text-[#047857] text-xs font-bold font-mono border border-[#b7e1cd]">
                    {activeScenario.blockedStatus}
                  </span>
                </div>

                {/* Simulated Target Payload Box */}
                <div className="p-3 rounded bg-[#ffffff] border border-[#e2ded5] mb-4 font-mono text-xs">
                  <div className="text-[10px] text-[#828794] uppercase font-semibold mb-1">
                    TARGET_PAYLOAD
                  </div>
                  <div className="text-[#c2410c] font-semibold break-all">
                    POST /api/scan &rarr; {activeScenario.targetUrl}
                  </div>
                </div>

                {/* Threat Vector Explanation */}
                <div className="space-y-3 mb-6 font-mono text-xs">
                  <div>
                    <span className="text-[#828794] block text-[10px] uppercase font-semibold mb-1">
                      Vulnerability Description:
                    </span>
                    <p className="text-[#4b4f59] font-sans leading-relaxed bg-[#ffffff] border border-[#e2ded5] p-2.5 rounded text-xs">
                      {activeScenario.riskDescription}
                    </p>
                  </div>

                  <div>
                    <span className="text-[#828794] block text-[10px] uppercase font-semibold mb-1">
                      WebIntel Defensive Interception:
                    </span>
                    <p className="text-[#047857] font-sans leading-relaxed bg-[#e6f4ea]/40 border border-[#b7e1cd] p-2.5 rounded text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                      <span>{activeScenario.defenseMechanism}</span>
                    </p>
                  </div>
                </div>

                {/* Inspection Pipeline Ticks */}
                <div className="space-y-1.5 font-mono text-[11px] p-3 rounded bg-[#ffffff] border border-[#e2ded5]">
                  <div className="flex items-center gap-2 text-[#4b4f59]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
                    <span>[OK] Protocol validated: strictly http:/https:</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4b4f59]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
                    <span>[OK] DNS resolved via dns.lookup(hostname, all)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4b4f59]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
                    <span>[OK] RFC-1918 / Link-local subnets tested</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#c2410c] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] animate-pulse" />
                    <span>[INTERCEPTED] {activeScenario.blockedReason}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="pt-4 mt-5 border-t border-[#e2ded5] flex items-center justify-between text-xs font-mono">
                <span className="text-[#828794]">RFC_3927 &amp; RFC_1918 GUARD</span>
                <a
                  href="#playground"
                  className="font-semibold text-[#0e1014] hover:text-[#c2410c] flex items-center gap-1"
                >
                  <span>TEST_LIVE_IN_PLAYGROUND</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
