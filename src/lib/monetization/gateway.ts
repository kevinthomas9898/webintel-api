import { NextRequest, NextResponse } from "next/server";

export interface MonetizationVerification {
  isAuthorized: boolean;
  isPaidViaGateway: boolean;
  agentPayer?: string;
  paymentId?: string;
  costPerScanUsd: number;
}

export const DEFAULT_COST_PER_SCAN_USD = 0.008; // $0.008 per scan (8/10th of a cent)

/**
 * Validates whether the incoming request is authorized either via:
 * 1. Cloudflare Monetization Gateway edge verification headers
 * 2. An API Key bearer token
 * 3. Or falls back to the free preview tier (if configured)
 */
export function verifyAgentMonetization(
  req: NextRequest,
  options: { allowFreePreview?: boolean } = { allowFreePreview: true }
): MonetizationVerification {
  // 1. Check for Cloudflare Monetization Gateway Headers
  // Cloudflare Monetization Gateway injects these headers when an agent micropayment clears
  const cfMonetizationStatus = req.headers.get("cf-monetization-status");
  const cfPaymentId = req.headers.get("cf-payment-id");
  const cfAgentPayer = req.headers.get("cf-agent-payer") || req.headers.get("cf-agent-id");

  if (cfMonetizationStatus === "verified" || cfMonetizationStatus === "paid" || cfPaymentId) {
    return {
      isAuthorized: true,
      isPaidViaGateway: true,
      agentPayer: cfAgentPayer || "cloudflare_monetized_agent",
      paymentId: cfPaymentId || "gateway_verified",
      costPerScanUsd: DEFAULT_COST_PER_SCAN_USD,
    };
  }

  // 2. Check for Direct API Key Bearer Token
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    if (token.length > 5) {
      return {
        isAuthorized: true,
        isPaidViaGateway: false,
        agentPayer: `token:${token.slice(0, 8)}...`,
        paymentId: `tok_${Date.now()}`,
        costPerScanUsd: DEFAULT_COST_PER_SCAN_USD,
      };
    }
  }

  // 3. Free Preview Mode (for live demo and testing)
  if (options.allowFreePreview) {
    return {
      isAuthorized: true,
      isPaidViaGateway: false,
      agentPayer: "developer_preview",
      costPerScanUsd: 0,
    };
  }

  return {
    isAuthorized: false,
    isPaidViaGateway: false,
    costPerScanUsd: DEFAULT_COST_PER_SCAN_USD,
  };
}

/**
 * Returns a standardized HTTP 402 Payment Required response compatible with
 * Cloudflare Monetization Gateway, x402 specifications, and autonomous agent wallets.
 */
export function buildPaymentRequiredResponse(requestedEndpoint: string) {
  const paymentManifest = {
    error: {
      code: "PAYMENT_REQUIRED",
      message: "This endpoint requires an agent micropayment or Cloudflare Monetization Gateway authorization.",
    },
    pricing: {
      pricePerScanUsd: DEFAULT_COST_PER_SCAN_USD,
      currency: "USD",
      acceptedProtocols: [
        "cloudflare_monetization_gateway",
        "bearer_api_key",
        "x402_agent_micropayment"
      ],
    },
    gateway: {
      provider: "Cloudflare Monetization Gateway",
      targetEndpoint: requestedEndpoint,
      feedbackEmail: "monetization-gateway-feedback@cloudflare.com",
    },
  };

  return NextResponse.json(paymentManifest, {
    status: 402,
    headers: {
      "X-Payment-Required": "true",
      "X-Cost-Per-Request": String(DEFAULT_COST_PER_SCAN_USD),
      "X-Currency": "USD",
      "WWW-Authenticate": 'CloudflareMonetization realm="WebIntel API", price="0.008 USD"',
    },
  });
}
