import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { safeFetch, SecurityError } from "@/lib/security/ssrf";
import { parseHtml } from "@/lib/extractor/html-parser";
import { detectTechnologies } from "@/lib/extractor/tech-detector";
import { extractBusinessIntel } from "@/lib/extractor/business-intel";
import { convertHtmlToMarkdown } from "@/lib/extractor/markdown-converter";
import { verifyAgentMonetization, DEFAULT_COST_PER_SCAN_USD } from "@/lib/monetization/gateway";

// MCP Tool Definitions
const MCP_TOOLS = [
  {
    name: "webintel_scan",
    description:
      "Performs comprehensive website intelligence reconnaissance on any public URL: extracts technology stack (65+ signatures), verified headings, company description, public emails, phones, and navigation pages with full SSRF protection.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The public HTTP or HTTPS website URL to scan (e.g. https://stripe.com)",
        },
        deepScan: {
          type: "boolean",
          description: "Whether to safely inspect discovered contact/about pages on the same domain",
          default: false,
        },
      },
      required: ["url"],
    },
  },
  {
    name: "webintel_tech_detect",
    description:
      "Quickly identifies the technology stack of a website (Next.js, React, Tailwind, WordPress, Shopify, Stripe, Cloudflare, Google Analytics, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The website URL to inspect",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "webintel_markdown",
    description:
      "Fetches a public web page and converts it into clean, high-signal Markdown stripped of navigation menus, footers, cookie banners, and script bloat. Optimized for LLM reasoning.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The website URL to convert to Markdown",
        },
      },
      required: ["url"],
    },
  },
];

/**
 * Model Context Protocol (MCP) JSON-RPC 2.0 Handler
 * Compatible with Claude Desktop, Cursor, Cloudflare Monetization Gateway, and MCP clients.
 */
export async function POST(req: NextRequest) {
  // 1. Verify Cloudflare Monetization or Bearer Token
  const monetization = verifyAgentMonetization(req, { allowFreePreview: true });

  let jsonRpc: { jsonrpc?: string; id?: string | number; method?: string; params?: Record<string, unknown> };
  try {
    jsonRpc = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error: Invalid JSON" } },
      { status: 400 }
    );
  }

  const { id = 1, method, params = {} } = jsonRpc;

  // 2. Handle MCP protocol methods

  // a) initialize - Required MCP handshake
  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: "WebIntel MCP Server",
          version: "1.0.0",
        },
        instructions:
          "WebIntel provides website intelligence tools: scan sites for tech stacks, extract business intel, and convert pages to clean Markdown.",
      },
    });
  }

  // b) notifications/initialized - Client acknowledgement (no response for notifications)
  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }

  // c) ping - Health check
  if (method === "ping") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {},
    });
  }

  // d) tools/list - Returns all available WebIntel tools to the agent
  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: MCP_TOOLS,
      },
    });
  }

  // b) tools/call - Executes a requested tool
  if (method === "tools/call") {
    const toolName = params.name as string;
    const toolArgs = (params.arguments || {}) as { url?: string; deepScan?: boolean };

    if (!toolArgs.url) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32602, message: "Missing required argument 'url'" },
      });
    }

    try {
      // Execute safe SSRF-guarded fetch
      const fetchResult = await safeFetch(toolArgs.url, {
        timeoutMs: 8000,
        maxSizeBytes: 2.5 * 1024 * 1024,
      });

      const $ = cheerio.load(fetchResult.body);

      // Handle webintel_markdown
      if (toolName === "webintel_markdown") {
        const markdown = convertHtmlToMarkdown(fetchResult.body);
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `# Clean Markdown Extraction for ${fetchResult.finalUrl}\n\n${markdown}`,
              },
            ],
          },
        });
      }

      // Handle webintel_tech_detect
      if (toolName === "webintel_tech_detect") {
        const detected = detectTechnologies(fetchResult.body, fetchResult.headers, $);
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    website: fetchResult.finalUrl,
                    technologies: detected.map((t) => ({ name: t.name, category: t.category, confidence: t.confidence })),
                    resolvedIp: fetchResult.resolvedIp,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      // Handle webintel_scan (Default full scan)
      const parsedData = parseHtml(fetchResult.body, fetchResult.finalUrl);
      const detectedTechnologies = detectTechnologies(fetchResult.body, fetchResult.headers, $);
      const businessIntel = extractBusinessIntel(
        fetchResult.body,
        fetchResult.finalUrl,
        parsedData.title,
        parsedData.description,
        parsedData.headings.all
      );

      const responsePayload = {
        website: fetchResult.finalUrl,
        companyName: businessIntel.companyName,
        description: parsedData.description,
        headings: parsedData.headings.all.slice(0, 8),
        technologies: detectedTechnologies.map((t) => t.name),
        emails: parsedData.emails,
        socialLinks: parsedData.socialLinks,
        contactPage: parsedData.contactPage,
        confidence: businessIntel.confidence,
        telemetry: {
          resolvedIp: fetchResult.resolvedIp,
          latencyMs: fetchResult.responseTimeMs,
          payer: monetization.agentPayer,
        },
      };

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(responsePayload, null, 2),
            },
          ],
        },
      });
    } catch (err: unknown) {
      const errMessage = err instanceof SecurityError ? err.message : String(err);
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        isError: true,
        result: {
          content: [
            {
              type: "text",
              text: `Error scanning ${toolArgs.url}: ${errMessage}`,
            },
          ],
        },
      });
    }
  }

  // Unsupported method
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method '${method}' not found` },
  });
}

// GET /api/mcp - MCP Manifest & Server Discovery
export async function GET() {
  return NextResponse.json({
    name: "WebIntel MCP Server",
    version: "1.0.0",
    description: "Website intelligence and reconnaissance MCP tools for autonomous AI agents.",
    tools: MCP_TOOLS,
    monetization: {
      gateway: "Cloudflare Monetization Gateway",
      pricingPerCallUsd: DEFAULT_COST_PER_SCAN_USD,
      status: "active",
    },
  });
}
