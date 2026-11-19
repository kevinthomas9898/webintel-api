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
    vector: "AWS / GCP / Azure Instance Metadata (IMDSv1/v2)",
    riskDescription:
      "Naive scrapers allow attackers to request the link-local metadata address, stealing IAM roles and cloud credentials.",
    defenseMechanism: "Pre-DNS CIDR Mask: 169.254.0.0/16 is permanently blacklisted at the network resolver layer.",
    blockedStatus: "403 Forbidden",
    blockedReason: "SSRF_IP_BLOCKED: Hostname resolved to cloud metadata link-local address.",
  },
  {
    id: "loopback",
    title: "Localhost & Redis / DB Pivot",
    targetUrl: "http://127.0.0.1:6379/info",
    vector: "Loopback Interface Attack (Port Pivoting)",
    riskDescription:
      "Attackers probe internal services running on localhost (Redis, PostgreSQL, Docker daemon sockets) via scanner fetch.",
    defenseMechanism: "Strict 127.0.0.0/8 & ::1 blocking before socket establishment.",
    blockedStatus: "403 Forbidden",
    blockedReason: "RESTRICTED_HOSTNAME: Access to loopback addresses is prohibited.",
  },
  {
    id: "private-subnet",
    title: "Private Subnet Lateral Traversal",
    targetUrl: "http://192.168.1.1/admin.html",
    vector: "RFC-1918 Internal Network Probing",
    riskDescription:
      "Scanners without network boundaries can map out the host's private Wi-Fi router or VPC intra-cluster services.",
    defenseMechanism: "Evaluates all resolved IPv4 & IPv6 records against 10/8, 172.16/12, and 192.168/16 subnets.",
    blockedStatus: "403 Forbidden",
    blockedReason: "SSRF_IP_BLOCKED: Resolved to RFC-1918 private network address.",
  },
  {
    id: "dns-rebinding",
    title: "TOCTOU DNS Rebinding Attack",
    targetUrl: "https://rebind.attacker-domain.org",
    vector: "Time-of-Check to Time-of-Use DNS Rebinding",
    riskDescription:
      "Domain resolves to public IP during DNS check, then rapidly switches TTL to 127.0.0.1 when the HTTP socket connects.",
    defenseMechanism: "Socket IP Pinning: HTTP agent bypasses OS resolver and binds TCP socket directly to the validated IP.",
    blockedStatus: "Interception Successful",
    blockedReason: "Socket pinned strictly to initial verified IP. Rebinding payload neutralized.",
  },
];

export function SsrfSandbox() {
  const [activeScenario, setActiveScenario] = useState<ThreatScenario>(THREAT_SCENARIOS[0]);

  const handleSimulate = (scenario: ThreatScenario) => {
    setActiveScenario(scenario);
  };

  return (
    <section id="security" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-3">
            <Lock className="w-3.5 h-3.5" />
            Interactive Security Visualizer
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            See Multi-Layer SSRF Armor in Action
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Public URL scanners are dangerous if left unhardened. Test our defensive pipeline against
            notorious real-world attack vectors and see how socket pinning intercepts every threat.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Threat Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
              Select an Attack Vector
            </div>
            {THREAT_SCENARIOS.map((scenario) => {
              const isSelected = activeScenario.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSimulate(scenario)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-white border-indigo-600 shadow-md shadow-indigo-100 ring-1 ring-indigo-600"
                      : "bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">{scenario.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
                      High Risk
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 truncate mb-2">
                    {scenario.targetUrl}
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-2">
                    {scenario.vector}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Defense Execution Pipeline Terminal */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="h-full rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        SSRF Interception Pipeline
                      </h4>
                      <p className="text-[11px] text-slate-500">Live defensive trace</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                    {activeScenario.blockedStatus}
                  </span>
                </div>

                {/* Target Request Info */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 font-mono text-xs">
                  <div className="text-slate-400 text-[10px] font-sans font-semibold uppercase mb-1">
                    Simulated Target Payload
                  </div>
                  <div className="text-rose-700 font-semibold break-all">
                    POST /api/scan &rarr; {activeScenario.targetUrl}
                  </div>
                </div>

                {/* Threat Explanation */}
                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">Vulnerability Vector:</span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 border border-amber-200 p-2.5 rounded-lg">
                      {activeScenario.riskDescription}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">WebIntel Defensive Action:</span>
                    <p className="text-xs text-emerald-800 leading-relaxed bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{activeScenario.defenseMechanism}</span>
                    </p>
                  </div>
                </div>

                {/* Animated Pipeline Steps */}
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Step 1: Protocol verified (Strict HTTP/HTTPS whitelist)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Step 2: DNS pre-resolved via Node lookup (A &amp; AAAA records)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Step 3: RFC-1918 / Cloud Metadata CIDR mask test</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Intercepted: {activeScenario.blockedReason}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Test CTA */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Zero connection established to target.</span>
                <a
                  href="#playground"
                  className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Test in Live Playground</span>
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
