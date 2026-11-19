import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { URL } from "node:url";
import { ScanRequestSchema, WebIntelScanResult } from "@/lib/schemas/scan";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { safeFetch, SecurityError } from "@/lib/security/ssrf";
import { checkRobotsPermission } from "@/lib/security/robots";
import { parseHtml } from "@/lib/extractor/html-parser";
import { detectTechnologies } from "@/lib/extractor/tech-detector";
import { extractBusinessIntel } from "@/lib/extractor/business-intel";
import { convertHtmlToMarkdown } from "@/lib/extractor/markdown-converter";
import { verifyAgentMonetization, DEFAULT_COST_PER_SCAN_USD } from "@/lib/monetization/gateway";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // 1. Verify Monetization / Cloudflare Gateway Verification
  const monetization = verifyAgentMonetization(req, { allowFreePreview: true });

  // 2. Extract Client IP & Check Rate Limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  const rateCheck = checkRateLimit(clientIp, 45, 60 * 1000);
  const responseHeaders: Record<string, string> = {
    "X-RateLimit-Limit": String(rateCheck.limit),
    "X-RateLimit-Remaining": String(rateCheck.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateCheck.resetMs / 1000)),
    "X-Monetization-Cost-Usd": String(DEFAULT_COST_PER_SCAN_USD),
    "X-Monetization-Gateway": "Cloudflare Monetization Gateway",
  };

  if (monetization.agentPayer) {
    responseHeaders["X-Agent-Payer"] = monetization.agentPayer;
  }

  if (!rateCheck.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many scan requests. Rate limit is ${rateCheck.limit} requests per minute.`,
        },
      },
      {
        status: 429,
        headers: {
          ...responseHeaders,
          "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)),
        },
      }
    );
  }

  // 3. Parse & Validate JSON Body
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400, headers: responseHeaders }
    );
  }

  const parseResult = ScanRequestSchema.safeParse(bodyJson);
  if (!parseResult.success) {
    const issues = parseResult.error.issues || [];
    const errorDetails = issues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join(".") : "",
      message: e.message,
    }));

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: errorDetails[0]?.message || "Invalid input parameters",
          details: errorDetails,
        },
      },
      { status: 400, headers: responseHeaders }
    );
  }

  const { url, deepScan, includeContent, format } = parseResult.data;

  try {
    // 4. Check robots.txt Compliance
    const robotsCheck = await checkRobotsPermission(url);
    if (!robotsCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ROBOTS_TXT_DISALLOWED",
            message: robotsCheck.reason || "Scanning this URL is disallowed by site robots.txt policy.",
          },
        },
        { status: 403, headers: responseHeaders }
      );
    }

    // 5. Safe Fetch Target Web Page (SSRF guarded, IP pinned, redirect verified)
    const fetchResult = await safeFetch(url, {
      timeoutMs: 8000,
      maxSizeBytes: 2.5 * 1024 * 1024,
      maxRedirects: 5,
    });

    const pagesAnalyzed = [fetchResult.finalUrl];

    // If caller explicitly requested pure markdown format for LLM reasoning:
    const markdownContent = convertHtmlToMarkdown(fetchResult.body);
    if (format === "markdown") {
      return new NextResponse(markdownContent, {
        status: 200,
        headers: {
          ...responseHeaders,
          "Content-Type": "text/markdown; charset=utf-8",
        },
      });
    }

    // 6. Parse Main Page with Cheerio
    const parsedData = parseHtml(fetchResult.body, fetchResult.finalUrl);
    const $ = cheerio.load(fetchResult.body);

    // 7. Technology Detection
    const detectedTechnologies = detectTechnologies(fetchResult.body, fetchResult.headers, $);
    const techNameList = detectedTechnologies.map((t) => t.name);

    // 8. Business Intelligence Extraction
    const businessIntel = extractBusinessIntel(
      fetchResult.body,
      fetchResult.finalUrl,
      parsedData.title,
      parsedData.description,
      parsedData.headings.all
    );

    const finalContactPage = parsedData.contactPage;
    const finalAboutPage = parsedData.aboutPage;
    const finalEmails = [...parsedData.emails];
    const finalSocialLinks = { ...parsedData.socialLinks };

    // 9. Optional Safe Deep Scan (Inspects Contact or About page if found, strictly on same origin)
    if (deepScan && (finalContactPage || finalAboutPage)) {
      const secondaryTarget = finalContactPage || finalAboutPage;
      if (secondaryTarget) {
        try {
          const secondaryOrigin = new URL(secondaryTarget).origin;
          const rootOrigin = new URL(fetchResult.finalUrl).origin;

          // Strictly same-origin secondary scan
          if (secondaryOrigin === rootOrigin) {
            const secondaryFetch = await safeFetch(secondaryTarget, {
              timeoutMs: 4000,
              maxSizeBytes: 512 * 1024,
              maxRedirects: 2,
            });

            pagesAnalyzed.push(secondaryFetch.finalUrl);
            const secondaryParsed = parseHtml(secondaryFetch.body, secondaryFetch.finalUrl);

            // Merge secondary emails
            for (const em of secondaryParsed.emails) {
              if (!finalEmails.includes(em)) {
                finalEmails.push(em);
              }
            }

            // Merge secondary social links
            for (const [platform, link] of Object.entries(secondaryParsed.socialLinks)) {
              if (!finalSocialLinks[platform]) {
                finalSocialLinks[platform] = link;
              }
            }
          }
        } catch {
          // Non-fatal if secondary page fails
        }
      }
    }

    const totalResponseTimeMs = Date.now() - startTime;

    // 10. Assemble Structured Standard Response
    const responseData: WebIntelScanResult = {
      success: true,
      website: fetchResult.finalUrl,
      companyName: businessIntel.companyName,
      description: parsedData.description,
      title: parsedData.title,
      headings: parsedData.headings.all,
      headingsDetails: {
        h1: parsedData.headings.h1,
        h2: parsedData.headings.h2,
      },
      services: businessIntel.services,
      emails: finalEmails,
      phones: parsedData.phones,
      socialLinks: finalSocialLinks,
      contactPage: finalContactPage,
      aboutPage: finalAboutPage,
      pricingPage: parsedData.pricingPage,
      careersPage: parsedData.careersPage,
      blogPage: parsedData.blogPage,
      branding: parsedData.branding,
      metadata: parsedData.metadata,
      technologies: techNameList,
      technologiesDetailed: detectedTechnologies,
      pagesAnalyzed,
      confidence: businessIntel.confidence,
      inferredData: {
        companyNameIsInferred: businessIntel.companyNameIsInferred,
        servicesAreInferred: businessIntel.servicesAreInferred,
      },
      textContent: includeContent ? parsedData.cleanText.slice(0, 1500) : undefined,
      markdown: markdownContent,
      stats: {
        internalLinksCount: parsedData.internalLinks.length,
        externalLinksCount: parsedData.externalLinks.length,
        responseTimeMs: totalResponseTimeMs,
        httpStatusCode: fetchResult.statusCode,
        resolvedIp: fetchResult.resolvedIp,
        contentSizeBytes: Buffer.byteLength(fetchResult.body, "utf-8"),
      },
      monetization: {
        gateway: "Cloudflare Monetization Gateway",
        payer: monetization.agentPayer,
        costUsd: DEFAULT_COST_PER_SCAN_USD,
      },
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        ...responseHeaders,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: unknown) {
    if (error instanceof SecurityError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode, headers: responseHeaders }
      );
    }

    const errMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SCAN_FAILED",
          message: `Failed to scan website: ${errMessage}`,
        },
      },
      { status: 500, headers: responseHeaders }
    );
  }
}
