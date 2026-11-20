import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { safeFetch, SecurityError } from "@/lib/security/ssrf";
import { parseHtml } from "@/lib/extractor/html-parser";
import { detectTechnologies } from "@/lib/extractor/tech-detector";
import { extractBusinessIntel } from "@/lib/extractor/business-intel";
import { convertHtmlToMarkdown } from "@/lib/extractor/markdown-converter";
import { verifyAgentMonetization, DEFAULT_COST_PER_SCAN_USD } from "@/lib/monetization/gateway";

// ─── MCP Tool Definitions (TDQS-optimized) ──────────────────────────────────

const MCP_TOOLS = [
  {
    name: "webintel_scan",
    description:
      "Perform a comprehensive website intelligence scan on a single public URL. Returns the company name, meta description, verified headings (H1/H2), detected technology stack (65+ signatures across frameworks, CMS, analytics, payments, hosting), public email addresses, phone numbers, social media profile URLs, and links to key pages (contact, about, pricing, careers, blog). All requests are SSRF-protected with DNS pre-resolution and private-IP blocking.\n\n**When to use:** You need a broad overview of a website — who runs it, what tech it uses, and how to contact them. Ideal for lead research, competitive analysis, and sales intelligence.\n\n**When NOT to use:** If you only need the technology stack, use `webintel_tech_detect` instead (faster, smaller response). If you need the full page content as Markdown for summarization or RAG, use `webintel_markdown`. If you need SEO metadata (Open Graph, canonical, schema.org), use `webintel_seo_meta`. If you need link analysis, use `webintel_links`.\n\n**Behavior:** Read-only GET request to the target URL. Does not submit forms, execute JavaScript, or modify anything. Response time depends on the target server (typically 1–5 seconds). The `deepScan` option follows same-origin contact/about links for richer data but adds latency. Returns a JSON object with a `confidence` score (0.0–1.0) indicating data completeness.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full public HTTP or HTTPS URL to scan. Must include the scheme (e.g., `https://stripe.com`). Private, localhost, and cloud-metadata IPs are blocked.",
        },
        deepScan: {
          type: "boolean",
          description:
            "When true, follows same-origin links to contact and about pages to extract additional emails, phone numbers, and company details. Adds 2–6 seconds of latency. Default: false.",
          default: false,
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "Full Website Intelligence Scan",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_tech_detect",
    description:
      "Identify the technology stack of a public website by analyzing HTTP response headers, HTML patterns, script URLs, meta tags, and DOM selectors. Detects 65+ technologies across 10 categories: Frameworks (Next.js, React, Vue, Angular, Svelte, Remix, Astro, Gatsby), CMS (WordPress, Shopify, Webflow, Framer, Squarespace, Wix, Ghost), Styling (Tailwind CSS, Bootstrap, MUI, Chakra UI), Analytics (GA4, GTM, PostHog, Segment, Mixpanel, Amplitude, Hotjar, Clarity, FullStory), Customer Support (Intercom, HubSpot, Zendesk, Crisp, Drift), Payments (Stripe, PayPal, Paddle, Lemon Squeezy, Klarna), Auth (Clerk, Auth0, Supabase, Firebase), and Hosting (Cloudflare, Vercel, AWS CloudFront, Netlify, Fastly, Fly.io, Render).\n\n**When to use:** You need to know what technologies a website is built with — for competitive intelligence, lead qualification (e.g., \"find Shopify stores using Stripe\"), or technical audits.\n\n**When NOT to use:** If you also need company info, emails, or social links, use `webintel_scan` instead (includes tech detection plus business intel). For SEO metadata extraction, use `webintel_seo_meta`.\n\n**Behavior:** Read-only. Each detected technology includes a `confidence` score (0.5–0.98) and the detection source (e.g., `Header: x-vercel-id`, `Script URL: js.stripe.com`). Returns a flat JSON array sorted by confidence.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full public URL to inspect (e.g., `https://vercel.com`). Must include the scheme. Internal and reserved IPs are blocked.",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "Technology Stack Detection",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_markdown",
    description:
      "Fetch a public web page and convert its content into clean, high-signal Markdown optimized for LLM token efficiency. Strips navigation menus, headers, footers, cookie banners, modals, ad wrappers, scripts, styles, SVGs, and iframes. Preserves semantic structure: headings (H1–H4), paragraphs, lists (ordered and unordered), blockquotes, and inline formatting. Output is capped at 4,000 characters to fit within typical tool-call context windows.\n\n**When to use:** You need a website's textual content for summarization, question-answering, retrieval-augmented generation (RAG), or content analysis — without HTML noise.\n\n**When NOT to use:** If you need structured data about the company (name, emails, tech stack), use `webintel_scan`. If you need raw SEO metadata (title, description, OG tags, canonical, JSON-LD), use `webintel_seo_meta`. If you need to analyze the site's link graph, use `webintel_links`.\n\n**Behavior:** Read-only. The Markdown output preserves the page's heading hierarchy and content flow. Very short paragraphs (< 15 chars) and boilerplate text (e.g., \"All rights reserved\") are filtered. No JavaScript rendering — only server-rendered HTML is processed.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full public URL to convert to Markdown (e.g., `https://openai.com/research`). Must include the scheme.",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "Web Page to Clean Markdown",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_seo_meta",
    description:
      "Extract comprehensive SEO and social metadata from a public URL. Returns the page title, meta description, canonical URL, Open Graph tags (og:title, og:description, og:image, og:type, og:site_name), Twitter Card tags (twitter:title, twitter:site, twitter:image), favicon URL, theme color, HTML language attribute, all Schema.org JSON-LD blocks (parsed), and the robots meta directives.\n\n**When to use:** You need a page's SEO health data, social sharing preview metadata, or structured data (JSON-LD) for auditing, content optimization, or building knowledge graphs.\n\n**When NOT to use:** If you need the full page content as Markdown, use `webintel_markdown`. If you need company contact info and tech stack, use `webintel_scan`. If you need link analysis, use `webintel_links`.\n\n**Behavior:** Read-only. Extracts metadata from the `<head>` section and JSON-LD `<script>` blocks. Does not render JavaScript — only static HTML metadata is returned. Returns a flat JSON object.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full public URL to extract SEO metadata from (e.g., `https://example.com/blog/post-1`). Must include the scheme.",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "SEO & Social Metadata Extraction",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_links",
    description:
      "Extract and categorize every link (`<a href>`) from a public web page. Returns internal links (same origin), external links (different origins), social media profile links (Twitter/X, LinkedIn, GitHub, YouTube, Facebook, Instagram, Discord), and navigation page links (contact, about, pricing, careers, blog). Includes counts for each category.\n\n**When to use:** You need to analyze a website's link graph — for SEO auditing (internal linking structure), finding outbound partners, discovering social profiles, or mapping site architecture.\n\n**When NOT to use:** If you need page content, use `webintel_markdown`. If you need technology detection, use `webintel_tech_detect`. If you need comprehensive business intel including links, use `webintel_scan`.\n\n**Behavior:** Read-only. Links are deduplicated and fully resolved to absolute URLs. Fragments (#) and javascript: hrefs are excluded. Social links are classified by platform. Returns a JSON object with categorized link arrays and counts.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full public URL to extract links from (e.g., `https://github.com/vercel`). Must include the scheme.",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "Link Extraction & Analysis",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_headers",
    description:
      "Retrieve and analyze the HTTP response headers of a public URL. Returns all headers as key-value pairs plus a security analysis that checks for the presence and correctness of critical security headers: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, and X-XSS-Protection. Includes a security score (0–100) and actionable recommendations for missing headers.\n\n**When to use:** You need to audit a website's HTTP security posture, check for CDN/hosting indicators, debug caching behavior, or verify CORS configuration.\n\n**When NOT to use:** If you need page content or business intel, use `webintel_scan` or `webintel_markdown`. If you only need the technology stack, use `webintel_tech_detect` (which already checks headers for hosting signatures).\n\n**Behavior:** Read-only. Performs a single GET request and returns the response headers. The security analysis does not crawl or test additional endpoints — it evaluates only the headers returned for the given URL.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full public URL to inspect headers for (e.g., `https://cloudflare.com`). Must include the scheme.",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "HTTP Headers & Security Analysis",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_robots",
    description:
      "Fetch and parse the robots.txt file of a website. Returns the raw file content, parsed rules per user-agent (Disallow, Allow, Crawl-delay), listed sitemaps, and whether the given URL path is allowed or blocked for the WebIntelBot and wildcard (*) user-agents.\n\n**When to use:** You need to check crawl permissions before scraping, discover sitemap URLs, or audit a site's crawler directives for SEO analysis.\n\n**When NOT to use:** If you need page content or metadata, use `webintel_markdown` or `webintel_seo_meta`. If the site has no robots.txt (404), the response indicates this and defaults to \"allowed\".\n\n**Behavior:** Read-only. Fetches `{origin}/robots.txt` with a 3-second timeout and 64 KB size cap. If robots.txt is missing or inaccessible, returns `{ allowed: true, robotsFound: false }`. Does not follow sitemap URLs — it only lists them.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description:
            "The full public URL whose domain's robots.txt you want to check (e.g., `https://example.com/products/item-1`). The robots.txt is fetched from the URL's origin.",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "Robots.txt Parser & Permission Check",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
];

// ─── MCP JSON-RPC 2.0 Handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const monetization = verifyAgentMonetization(req, { allowFreePreview: true });

  let jsonRpc: {
    jsonrpc?: string;
    id?: string | number;
    method?: string;
    params?: Record<string, unknown>;
  };
  try {
    jsonRpc = await req.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error: Invalid JSON" },
      },
      { status: 400 }
    );
  }

  const { id = 1, method, params = {} } = jsonRpc;

  // ── initialize ────────────────────────────────────────────────────────────
  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: { listChanged: false },
        },
        serverInfo: {
          name: "WebIntel MCP Server",
          version: "1.1.0",
        },
        instructions: [
          "WebIntel provides read-only website intelligence tools for AI agents.",
          "Use `webintel_scan` for a broad company overview (tech, contacts, social).",
          "Use `webintel_tech_detect` for a fast technology-only check.",
          "Use `webintel_markdown` to get clean page content for summarization or RAG.",
          "Use `webintel_seo_meta` for SEO metadata, Open Graph, and JSON-LD extraction.",
          "Use `webintel_links` to analyze internal/external link structure.",
          "Use `webintel_headers` for HTTP security header auditing.",
          "Use `webintel_robots` to check robots.txt crawl permissions and find sitemaps.",
          "All tools are SSRF-protected and read-only. No JavaScript is executed.",
        ].join("\n"),
      },
    });
  }

  // ── notifications/initialized ─────────────────────────────────────────────
  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }

  // ── ping ───────────────────────────────────────────────────────────────────
  if (method === "ping") {
    return NextResponse.json({ jsonrpc: "2.0", id, result: {} });
  }

  // ── tools/list ─────────────────────────────────────────────────────────────
  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: { tools: MCP_TOOLS },
    });
  }

  // ── tools/call ─────────────────────────────────────────────────────────────
  if (method === "tools/call") {
    const toolName = params.name as string;
    const toolArgs = (params.arguments || {}) as {
      url?: string;
      deepScan?: boolean;
    };

    if (!toolArgs.url) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32602, message: "Missing required argument 'url'" },
      });
    }

    try {
      // ── webintel_robots (fetches robots.txt, not the page) ──────────────
      if (toolName === "webintel_robots") {
        return await handleRobots(id, toolArgs.url);
      }

      // All other tools need the page content
      const fetchResult = await safeFetch(toolArgs.url, {
        timeoutMs: 8000,
        maxSizeBytes: 2.5 * 1024 * 1024,
      });

      const $ = cheerio.load(fetchResult.body);

      // ── webintel_markdown ───────────────────────────────────────────────
      if (toolName === "webintel_markdown") {
        const markdown = convertHtmlToMarkdown(fetchResult.body);
        return jsonRpcResult(id, {
          url: fetchResult.finalUrl,
          characterCount: markdown.length,
          markdown,
        });
      }

      // ── webintel_tech_detect ────────────────────────────────────────────
      if (toolName === "webintel_tech_detect") {
        const detected = detectTechnologies(
          fetchResult.body,
          fetchResult.headers,
          $
        );
        return jsonRpcResult(id, {
          website: fetchResult.finalUrl,
          technologiesFound: detected.length,
          technologies: detected.map((t) => ({
            name: t.name,
            category: t.category,
            confidence: t.confidence,
            detectedFrom: t.detectedFrom,
          })),
          resolvedIp: fetchResult.resolvedIp,
          responseTimeMs: fetchResult.responseTimeMs,
        });
      }

      // ── webintel_seo_meta ───────────────────────────────────────────────
      if (toolName === "webintel_seo_meta") {
        return jsonRpcResult(id, extractSeoMeta($, fetchResult));
      }

      // ── webintel_links ──────────────────────────────────────────────────
      if (toolName === "webintel_links") {
        const parsedData = parseHtml(fetchResult.body, fetchResult.finalUrl);
        return jsonRpcResult(id, {
          website: fetchResult.finalUrl,
          internalLinks: parsedData.internalLinks.slice(0, 100),
          externalLinks: parsedData.externalLinks.slice(0, 50),
          socialLinks: parsedData.socialLinks,
          navigationPages: {
            contact: parsedData.contactPage,
            about: parsedData.aboutPage,
            pricing: parsedData.pricingPage,
            careers: parsedData.careersPage,
            blog: parsedData.blogPage,
          },
          counts: {
            internal: parsedData.internalLinks.length,
            external: parsedData.externalLinks.length,
            social: Object.keys(parsedData.socialLinks).length,
          },
        });
      }

      // ── webintel_headers ────────────────────────────────────────────────
      if (toolName === "webintel_headers") {
        return jsonRpcResult(
          id,
          analyzeHeaders(fetchResult.finalUrl, fetchResult.headers, fetchResult.statusCode)
        );
      }

      // ── webintel_scan (default full scan) ───────────────────────────────
      const parsedData = parseHtml(fetchResult.body, fetchResult.finalUrl);
      const detectedTechnologies = detectTechnologies(
        fetchResult.body,
        fetchResult.headers,
        $
      );
      const businessIntel = extractBusinessIntel(
        fetchResult.body,
        fetchResult.finalUrl,
        parsedData.title,
        parsedData.description,
        parsedData.headings.all
      );

      return jsonRpcResult(id, {
        website: fetchResult.finalUrl,
        companyName: businessIntel.companyName,
        companyNameIsInferred: businessIntel.companyNameIsInferred,
        description: parsedData.description,
        headings: parsedData.headings.all.slice(0, 10),
        technologies: detectedTechnologies.map((t) => ({
          name: t.name,
          category: t.category,
          confidence: t.confidence,
        })),
        emails: parsedData.emails,
        phones: parsedData.phones,
        socialLinks: parsedData.socialLinks,
        navigationPages: {
          contact: parsedData.contactPage,
          about: parsedData.aboutPage,
          pricing: parsedData.pricingPage,
          careers: parsedData.careersPage,
          blog: parsedData.blogPage,
        },
        branding: parsedData.branding,
        services: businessIntel.services,
        confidence: businessIntel.confidence,
        jsonLdFound: businessIntel.jsonLdFound,
        telemetry: {
          resolvedIp: fetchResult.resolvedIp,
          latencyMs: fetchResult.responseTimeMs,
          httpStatus: fetchResult.statusCode,
          payer: monetization.agentPayer,
        },
      });
    } catch (err: unknown) {
      const errMessage =
        err instanceof SecurityError ? err.message : String(err);
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `Error scanning ${toolArgs.url}: ${errMessage}`,
            },
          ],
          isError: true,
        },
      });
    }
  }

  // ── Unsupported method ──────────────────────────────────────────────────
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method '${method}' not found` },
  });
}

// ─── GET /api/mcp — MCP Discovery & Pricing Manifest ────────────────────────

export async function GET() {
  return NextResponse.json({
    name: "WebIntel MCP Server",
    version: "1.1.0",
    description:
      "Website intelligence and reconnaissance MCP tools for autonomous AI agents. Scan technology stacks, extract business intel, convert pages to Markdown, audit SEO metadata, analyze link graphs, inspect HTTP security headers, and check robots.txt — all SSRF-protected and read-only.",
    protocolVersion: "2024-11-05",
    toolCount: MCP_TOOLS.length,
    tools: MCP_TOOLS.map((t) => ({
      name: t.name,
      title: t.annotations?.title,
      description: t.description.split("\n")[0], // First sentence only for discovery
    })),
    monetization: {
      gateway: "Cloudflare Monetization Gateway",
      pricingPerCallUsd: DEFAULT_COST_PER_SCAN_USD,
      acceptedProtocols: [
        "cloudflare_monetization_gateway",
        "bearer_api_key",
        "x402_agent_micropayment",
      ],
      freeTier: "Available — no API key required for evaluation",
      status: "active",
    },
  });
}

// ─── Helper: JSON-RPC result wrapper ─────────────────────────────────────────

function jsonRpcResult(id: string | number, data: Record<string, unknown>) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    },
  });
}

// ─── Tool: webintel_seo_meta ─────────────────────────────────────────────────

function extractSeoMeta(
  $: cheerio.CheerioAPI,
  fetchResult: { finalUrl: string; body: string; headers: Record<string, string | string[] | undefined> }
) {
  const getMeta = (attr: string, value: string) =>
    $(`meta[${attr}="${value}"]`).attr("content")?.trim() || null;

  // Parse all JSON-LD blocks
  const jsonLdBlocks: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text());
      jsonLdBlocks.push(parsed);
    } catch {
      // skip invalid JSON-LD
    }
  });

  // Robots meta
  const robotsMeta =
    getMeta("name", "robots") || getMeta("name", "googlebot") || null;

  return {
    url: fetchResult.finalUrl,
    title:
      getMeta("property", "og:title") ||
      getMeta("name", "twitter:title") ||
      $("title").first().text().trim() ||
      null,
    description:
      getMeta("name", "description") ||
      getMeta("property", "og:description") ||
      null,
    canonicalUrl: $('link[rel="canonical"]').attr("href")?.trim() || null,
    language: $("html").attr("lang")?.trim() || null,
    openGraph: {
      title: getMeta("property", "og:title"),
      description: getMeta("property", "og:description"),
      image: getMeta("property", "og:image"),
      type: getMeta("property", "og:type"),
      siteName: getMeta("property", "og:site_name"),
      url: getMeta("property", "og:url"),
      locale: getMeta("property", "og:locale"),
    },
    twitter: {
      card: getMeta("name", "twitter:card"),
      site: getMeta("name", "twitter:site"),
      creator: getMeta("name", "twitter:creator"),
      title: getMeta("name", "twitter:title"),
      description: getMeta("name", "twitter:description"),
      image: getMeta("name", "twitter:image"),
    },
    favicon:
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      null,
    themeColor: getMeta("name", "theme-color"),
    robotsMeta,
    jsonLdBlockCount: jsonLdBlocks.length,
    jsonLd: jsonLdBlocks.length > 0 ? jsonLdBlocks : null,
    generator: getMeta("name", "generator"),
    keywords: getMeta("name", "keywords"),
    author: getMeta("name", "author"),
    viewport: getMeta("name", "viewport"),
  };
}

// ─── Tool: webintel_headers ──────────────────────────────────────────────────

interface SecurityCheck {
  header: string;
  present: boolean;
  value: string | null;
  recommendation: string | null;
}

function analyzeHeaders(
  url: string,
  headers: Record<string, string | string[] | undefined>,
  statusCode: number
) {
  const getHeader = (name: string): string | null => {
    const val = headers[name.toLowerCase()];
    if (!val) return null;
    return Array.isArray(val) ? val.join(", ") : val;
  };

  const securityHeaders: Array<{ name: string; rec: string }> = [
    {
      name: "strict-transport-security",
      rec: "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` to enforce HTTPS.",
    },
    {
      name: "content-security-policy",
      rec: "Add a Content-Security-Policy header to prevent XSS and injection attacks.",
    },
    {
      name: "x-content-type-options",
      rec: "Add `X-Content-Type-Options: nosniff` to prevent MIME-type sniffing.",
    },
    {
      name: "x-frame-options",
      rec: "Add `X-Frame-Options: DENY` or `SAMEORIGIN` to prevent clickjacking.",
    },
    {
      name: "referrer-policy",
      rec: "Add `Referrer-Policy: strict-origin-when-cross-origin` to control referrer leakage.",
    },
    {
      name: "permissions-policy",
      rec: "Add a Permissions-Policy header to restrict browser feature access (camera, microphone, geolocation).",
    },
  ];

  const checks: SecurityCheck[] = securityHeaders.map(({ name, rec }) => {
    const val = getHeader(name);
    return {
      header: name,
      present: val !== null,
      value: val,
      recommendation: val === null ? rec : null,
    };
  });

  const presentCount = checks.filter((c) => c.present).length;
  const securityScore = Math.round(
    (presentCount / securityHeaders.length) * 100
  );

  // Build flat headers object
  const allHeaders: Record<string, string> = {};
  for (const [key, val] of Object.entries(headers)) {
    if (val !== undefined) {
      allHeaders[key] = Array.isArray(val) ? val.join(", ") : val;
    }
  }

  return {
    url,
    httpStatus: statusCode,
    headerCount: Object.keys(allHeaders).length,
    headers: allHeaders,
    security: {
      score: securityScore,
      grade:
        securityScore >= 90
          ? "A"
          : securityScore >= 70
            ? "B"
            : securityScore >= 50
              ? "C"
              : securityScore >= 30
                ? "D"
                : "F",
      checks,
      missingCount: securityHeaders.length - presentCount,
    },
    server: getHeader("server"),
    poweredBy: getHeader("x-powered-by"),
    cacheControl: getHeader("cache-control"),
    contentType: getHeader("content-type"),
  };
}

// ─── Tool: webintel_robots ───────────────────────────────────────────────────

async function handleRobots(id: string | number, urlStr: string) {
  try {
    const targetUrl = new URL(urlStr);
    const robotsUrl = `${targetUrl.protocol}//${targetUrl.host}/robots.txt`;

    let body = "";
    let robotsFound = false;

    try {
      const res = await safeFetch(robotsUrl, {
        timeoutMs: 3000,
        maxSizeBytes: 64 * 1024,
        maxRedirects: 2,
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        body = res.body;
        robotsFound = true;
      }
    } catch {
      // robots.txt not available
    }

    if (!robotsFound) {
      return jsonRpcResult(id, {
        url: urlStr,
        robotsUrl,
        robotsFound: false,
        allowed: true,
        message:
          "No robots.txt found — crawling is not explicitly restricted.",
        sitemaps: [],
        rules: [],
      });
    }

    // Parse robots.txt
    const lines = body.split(/\r?\n/);
    const sitemaps: string[] = [];
    const rules: Array<{
      userAgent: string;
      disallow: string[];
      allow: string[];
      crawlDelay: number | null;
    }> = [];

    let currentAgent = "";
    let currentDisallow: string[] = [];
    let currentAllow: string[] = [];
    let currentCrawlDelay: number | null = null;

    const flushAgent = () => {
      if (currentAgent) {
        rules.push({
          userAgent: currentAgent,
          disallow: currentDisallow,
          allow: currentAllow,
          crawlDelay: currentCrawlDelay,
        });
      }
      currentDisallow = [];
      currentAllow = [];
      currentCrawlDelay = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;

      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const val = line.slice(colonIdx + 1).trim();

      if (key === "sitemap" && val) {
        sitemaps.push(val);
      } else if (key === "user-agent") {
        flushAgent();
        currentAgent = val;
      } else if (key === "disallow" && val) {
        currentDisallow.push(val);
      } else if (key === "allow" && val) {
        currentAllow.push(val);
      } else if (key === "crawl-delay") {
        const delay = parseFloat(val);
        if (!isNaN(delay)) currentCrawlDelay = delay;
      }
    }
    flushAgent();

    // Check if the given path is allowed
    const pathToCheck = targetUrl.pathname || "/";
    let isAllowed = true;
    for (const rule of rules) {
      const agent = rule.userAgent.toLowerCase();
      if (agent === "*" || agent === "webintelbot") {
        for (const disallowPath of rule.disallow) {
          if (disallowPath === "/" || pathToCheck.startsWith(disallowPath)) {
            isAllowed = false;
          }
        }
        // Allow rules can override disallow
        for (const allowPath of rule.allow) {
          if (pathToCheck.startsWith(allowPath)) {
            isAllowed = true;
          }
        }
      }
    }

    return jsonRpcResult(id, {
      url: urlStr,
      robotsUrl,
      robotsFound: true,
      pathChecked: pathToCheck,
      allowed: isAllowed,
      sitemapCount: sitemaps.length,
      sitemaps,
      ruleCount: rules.length,
      rules,
      rawLength: body.length,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: `Error checking robots.txt for ${urlStr}: ${errMessage}`,
          },
        ],
        isError: true,
      },
    });
  }
}
