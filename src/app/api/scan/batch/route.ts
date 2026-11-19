import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { safeFetch } from "@/lib/security/ssrf";
import { parseHtml } from "@/lib/extractor/html-parser";
import { detectTechnologies } from "@/lib/extractor/tech-detector";
import { extractBusinessIntel } from "@/lib/extractor/business-intel";
import { verifyAgentMonetization } from "@/lib/monetization/gateway";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  // Check Rate Limiting
  const rateCheck = checkRateLimit(clientIp, 45, 60 * 1000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many batch requests." } },
      { status: 429 }
    );
  }

  // Verify Monetization
  const monetization = verifyAgentMonetization(req, { allowFreePreview: true });

  let body: { urls?: string[]; deepScan?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const urls = body.urls;
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_INPUT", message: "Field 'urls' must be a non-empty array of URL strings" } },
      { status: 400 }
    );
  }

  // Cap batch size to 8 URLs to avoid server overload
  const targetUrls = urls.slice(0, 8);

  const results = await Promise.all(
    targetUrls.map(async (rawUrl) => {
      try {
        const fetchResult = await safeFetch(rawUrl, {
          timeoutMs: 6000,
          maxSizeBytes: 2 * 1024 * 1024,
        });

        const $ = cheerio.load(fetchResult.body);
        const parsed = parseHtml(fetchResult.body, fetchResult.finalUrl);
        const techs = detectTechnologies($, fetchResult.body, fetchResult.headers);
        const business = extractBusinessIntel(
          fetchResult.body,
          fetchResult.finalUrl,
          parsed.title,
          parsed.description,
          parsed.headings.all
        );

        return {
          url: rawUrl,
          status: "success",
          companyName: business.companyName,
          title: parsed.title,
          description: parsed.description,
          technologies: techs.map((t) => t.name),
          emails: parsed.emails,
          contactPage: parsed.contactPage,
          confidence: business.confidence,
          resolvedIp: fetchResult.resolvedIp,
          latencyMs: fetchResult.responseTimeMs,
        };
      } catch (err: unknown) {
        return {
          url: rawUrl,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  return NextResponse.json({
    success: true,
    batchSize: targetUrls.length,
    processedCount: results.length,
    results,
    monetization: {
      gateway: "Cloudflare Monetization Gateway",
      payer: monetization.agentPayer,
      costChargedUsd: Number((targetUrls.length * monetization.costPerScanUsd).toFixed(4)),
    },
  });
}
