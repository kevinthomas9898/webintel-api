import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";
import tls from "node:tls";
import { URL } from "node:url";
import * as cheerio from "cheerio";
import { safeFetch, SecurityError, validateAndResolveUrl } from "@/lib/security/ssrf";
import { parseHtml } from "@/lib/extractor/html-parser";
import { detectTechnologies } from "@/lib/extractor/tech-detector";
import { extractBusinessIntel } from "@/lib/extractor/business-intel";
import { convertHtmlToMarkdown } from "@/lib/extractor/markdown-converter";
import { verifyAgentMonetization, DEFAULT_COST_PER_SCAN_USD } from "@/lib/monetization/gateway";

// ─── 10-Tool TDQS 5.0 High-Earning MCP Registry ─────────────────────────────

const MCP_TOOLS = [
  {
    name: "webintel_scan",
    description: `Execute comprehensive website intelligence reconnaissance on a public URL to produce a structured business, technical, and contact dossier.

### Purpose
Extract company name, meta description, verified headings (H1/H2), detected technology stack (65+ signatures across frameworks, CMS, analytics, hosting, and payments), public email addresses, telephone numbers, social profiles, branding assets, and links to primary navigation pages.

### When to Use
- You need a 360-degree company overview in a single call for lead enrichment, sales prospecting, or vendor evaluation.
- You need to identify both the technical foundation and commercial contact channels of a business.

### When NOT to Use
- Do NOT use if you only need the technology stack; use \`webintel_tech_detect\` instead for 3x faster execution and lower payload size.
- Do NOT use if you only need clean webpage text for LLM summarization or RAG; use \`webintel_markdown\` instead.
- Do NOT use if you only need corporate emails and sales channels; use \`webintel_contact_finder\` instead.
- Do NOT use if you only need SEO tags or Open Graph metadata; use \`webintel_seo_meta\` instead.
- Do NOT use if you only need DNS, MX mail host, or domain records; use \`webintel_dns_intel\` instead.
- Do NOT use if you need SSL certificate validity and expiration; use \`webintel_ssl_cert\` instead.

### Disambiguation
Unlike \`webintel_tech_detect\` (which returns only detected software libraries), \`webintel_contact_finder\` (which returns only communication vectors), or \`webintel_markdown\` (which returns raw text), \`webintel_scan\` is the full multi-dimensional dossier tool combining business metadata, verified communication channels, and architecture insights into a single payload.

### Behavior & Performance
- Side Effects: None. Performs strictly read-only HTTP GET requests.
- Idempotency: Yes. Successive calls with identical URLs return consistent data.
- SSRF Guard: Hardened with DNS pre-resolution; private subnets (RFC 1918, RFC 6598, loopback, link-local, cloud metadata 169.254.169.254) are rejected immediately.
- JavaScript Execution: Static HTML parsing only; client-side single-page applications without server-side rendering are parsed from initial HTML payload.
- Latency: Typically 1.0 to 3.5 seconds depending on target server responsiveness. The optional \`deepScan\` flag will follow same-origin contact/about links with an additional 2-4 seconds latency.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The fully-qualified HTTP or HTTPS URL to scan (e.g. 'https://stripe.com' or 'https://vercel.com'). Must include the protocol scheme.",
          examples: ["https://stripe.com", "https://github.com", "https://linear.app"],
        },
        deepScan: {
          type: "boolean",
          default: false,
          description:
            "When set to true, automatically follows discovered same-origin links to Contact and About pages to extract additional emails and business metadata. Increases execution time by 2-4 seconds.",
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        website: { type: "string" },
        companyName: { type: "string" },
        description: { type: "string" },
        headings: { type: "array", items: { type: "string" } },
        technologies: { type: "array", items: { type: "object" } },
        emails: { type: "array", items: { type: "string" } },
        phones: { type: "array", items: { type: "string" } },
        socialLinks: { type: "object" },
        confidence: { type: "number" },
      },
      required: ["website", "companyName", "technologies", "emails"],
    },
    annotations: {
      title: "WebIntel: Full Website Intelligence Scan",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_dns_intel",
    description: `Query public DNS records to identify enterprise mail providers, authoritative nameservers, SPF/security verifications, and hosting IP addresses.

### Purpose
Resolve DNS records for any domain: A (IPv4), AAAA (IPv6), MX (Mail Exchange), NS (Authoritative Name Servers), and TXT records. Automatically classifies corporate email infrastructure (Google Workspace, Microsoft 365, Proton, Zoho, iCloud), cloud DNS providers (Cloudflare, AWS Route 53, Google Cloud DNS), and audits SPF/DMARC and SaaS domain verifications (Stripe, Atlassian, Google, Apple, Facebook).

### When to Use
- B2B lead enrichment: Discover if a prospect uses Google Workspace vs. Microsoft 365 for business communications.
- Domain security & deliverability auditing: Verify SPF records, DMARC alignment, and mail gateway protection.
- Infrastructure reconnaissance: Identify authoritative nameservers (Cloudflare, Route 53) and IP addresses without making HTTP requests.

### When NOT to Use
- Do NOT use to inspect webpage HTML, headings, or on-page text; use \`webintel_markdown\` or \`webintel_scan\` instead.
- Do NOT use to inspect HTTP response headers; use \`webintel_headers\` instead.
- Do NOT use to audit SSL/TLS certificates and expiration dates; use \`webintel_ssl_cert\` instead.
- Do NOT use to detect client-side JavaScript frameworks; use \`webintel_tech_detect\` instead.

### Disambiguation
Unlike HTTP-based tools that require fetching and rendering web pages, \`webintel_dns_intel\` operates purely through low-latency UDP/TCP DNS queries directly against authoritative nameservers. It works even if the website's HTTP server is down or protected by Cloudflare bot walls.

### Behavior & Performance
- Side Effects: None. Read-only DNS lookups.
- Idempotency: Yes.
- SSRF Guard: Queries public domain names; internal/localhost hostnames are blocked.
- Latency: Extremely fast (typically 50ms to 350ms).`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The domain or website URL to query DNS intelligence for (e.g. 'https://stripe.com' or 'https://github.com').",
          examples: ["https://stripe.com", "https://microsoft.com", "https://linear.app"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        domain: { type: "string" },
        emailProvider: { type: "string" },
        dnsProvider: { type: "string" },
        security: { type: "object" },
        records: { type: "object" },
      },
      required: ["domain", "emailProvider", "dnsProvider"],
    },
    annotations: {
      title: "WebIntel: Domain DNS & Email Intelligence",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_ssl_cert",
    description: `Audit SSL/TLS certificate configuration, verify certificate authorities, extract Subject Alternative Names (SANs), and check expiration dates.

### Purpose
Establish a direct TLS handshake with the target host on port 443 to extract certificate details: issuing Certificate Authority (Let's Encrypt, DigiCert, Cloudflare, Sectigo), validity period (validFrom and validTo), days remaining until expiration, warning status for impending expiration (< 30 days), Subject Alternative Names (SANs) for discovering associated domain properties, negotiated TLS protocol version (TLSv1.2, TLSv1.3), and cipher suite.

### When to Use
- DevSecOps & infrastructure monitoring: Alert on certificates nearing expiration before outages occur.
- Corporate reconnaissance: Inspect Subject Alternative Names (SANs) to map out hidden subdomains, internal staging URLs, and company brand domains.
- Compliance verification: Verify that modern TLS protocols (TLSv1.2 or TLSv1.3) and strong cipher suites are enforced.

### When NOT to Use
- Do NOT use for HTTP response header auditing; use \`webintel_headers\` instead.
- Do NOT use for DNS or MX mail provider checks; use \`webintel_dns_intel\` instead.
- Do NOT use to inspect webpage content; use \`webintel_markdown\` instead.

### Disambiguation
Unlike \`webintel_headers\` (which inspects HTTP application layer headers like HSTS and CSP), \`webintel_ssl_cert\` operates directly at the transport layer (TLS socket level), inspecting the cryptographic X.509 certificate exchange.

### Behavior & Performance
- Side Effects: None. Read-only TLS handshake without making HTTP requests.
- Idempotency: Yes.
- SSRF Guard: Validates hostnames against private and internal network IP ranges.
- Latency: Fast (typically 80ms to 400ms).`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The domain or website URL to inspect SSL/TLS certificate parameters for (e.g. 'https://stripe.com').",
          examples: ["https://stripe.com", "https://github.com", "https://cloudflare.com"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        host: { type: "string" },
        issuer: { type: "string" },
        validTo: { type: "string" },
        daysRemaining: { type: "number" },
        isExpiringSoon: { type: "boolean" },
        sans: { type: "array", items: { type: "string" } },
        protocol: { type: "string" },
      },
      required: ["host", "issuer", "validTo", "daysRemaining", "isExpiringSoon"],
    },
    annotations: {
      title: "WebIntel: SSL & TLS Certificate Audit",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_contact_finder",
    description: `Extract verified public business email addresses, telephone numbers, contact page URLs, and official social media profiles from a website.

### Purpose
Surgically scour website HTML, mailto links, tel anchors, footer profiles, and de-obfuscate protected email patterns (e.g., 'name [at] domain [dot] com') to yield verified commercial contact channels. Maps official company social accounts (LinkedIn company/profile, Twitter/X, GitHub, YouTube, Facebook, Instagram, Discord) and pinpoints dedicated support and contact routing URLs.

### When to Use
- B2B outbound sales automation, lead generation, and CRM enrichment (enriching prospect domains with direct outreach channels).
- Customer support routing: Locating dedicated helpdesk forms and support emails without navigating complex menu systems.

### When NOT to Use
- Do NOT use if you need a comprehensive technical and architectural dossier; use \`webintel_scan\` instead.
- Do NOT use if you need to detect frameworks or CMS stacks; use \`webintel_tech_detect\` instead.
- Do NOT use if you need raw page Markdown; use \`webintel_markdown\` instead.

### Disambiguation
While \`webintel_scan\` includes contact info within a massive technical dossier, \`webintel_contact_finder\` is dedicated purely to contact extraction, filtering placeholder/sample emails and returning clean, deduplicated outreach endpoints in a lightweight schema.

### Behavior & Performance
- Side Effects: None. Read-only HTTP GET.
- Idempotency: Yes.
- Email Hygiene: Discards common placeholder emails (user@example.com, test@test.com) and static media assets (.png, .css).
- Latency: Fast (typically 500ms to 2.0s).`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The website URL to harvest business contacts and communication channels from (e.g. 'https://linear.app').",
          examples: ["https://linear.app", "https://stripe.com", "https://openai.com"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        website: { type: "string" },
        emails: { type: "array", items: { type: "string" } },
        phones: { type: "array", items: { type: "string" } },
        socialLinks: { type: "object" },
        contactPage: { type: "string" },
      },
      required: ["website", "emails", "socialLinks"],
    },
    annotations: {
      title: "WebIntel: Business Contact & Lead Harvester",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_tech_detect",
    description: `Detect and classify the software libraries, cloud infrastructure, and third-party SaaS services running on a public website.

### Purpose
Inspect HTTP response headers, DOM elements, script sources, and meta generators against 65+ curated signatures across 10 categories: Frameworks (Next.js, React, Vue, Nuxt, Angular, Svelte, Remix, Astro), CMS (WordPress, Shopify, Webflow, Framer, Squarespace, Wix, Ghost), Styling (Tailwind, Bootstrap, MUI), Analytics (Google Analytics 4, GTM, PostHog, Segment, Mixpanel, Amplitude, Hotjar, Clarity), Payments (Stripe, PayPal, Lemon Squeezy, Paddle, Klarna), Customer Support (Intercom, HubSpot, Zendesk, Crisp), Auth (Clerk, Auth0, Supabase, Firebase), and Hosting (Cloudflare, Vercel, AWS CloudFront, Netlify, Fastly, Render, Fly.io).

### When to Use
- You need to determine what software, CMS, CDN, or payment processor a website is utilizing.
- Performing competitive tech stack benchmarking or qualifying B2B sales leads based on stack criteria (e.g., finding Shopify stores using Klaviyo or Next.js sites on Vercel).

### When NOT to Use
- Do NOT use if you need contact emails, social links, or company description; use \`webintel_contact_finder\` or \`webintel_scan\` instead.
- Do NOT use to inspect DNS records or corporate email hosting; use \`webintel_dns_intel\` instead.
- Do NOT use if you need HTTP security header compliance; use \`webintel_headers\` instead.

### Disambiguation
Compared to \`webintel_scan\`, this tool bypasses contact extraction, link graph mapping, and content conversion, delivering a lean, focused array of detected technologies with individual confidence ratings (0.5 to 0.98) and proof origins in under 1 second.

### Behavior & Performance
- Side Effects: None. Strictly read-only GET request.
- Idempotency: Yes.
- SSRF Guard: Validates hostname against private and reserved IP address spaces.
- Latency: Fast (typically 400ms to 1.8s).
- Returns: Array of detected technologies with name, category, confidence score, and detection vector.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The target website URL to inspect for technology signatures (e.g. 'https://shopify.com'). Scheme is required.",
          examples: ["https://shopify.com", "https://supabase.com", "https://notion.so"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        website: { type: "string" },
        technologiesFound: { type: "number" },
        technologies: { type: "array", items: { type: "object" } },
      },
      required: ["website", "technologiesFound", "technologies"],
    },
    annotations: {
      title: "WebIntel: Technology Stack Detection",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_markdown",
    description: `Convert any public webpage into clean, high-signal, LLM-optimized Markdown stripped of boilerplate noise.

### Purpose
Fetch a remote HTML page and strip navigational menus, header/footer links, cookie banners, script tags, style sheets, inline SVG vectors, modals, and advertisement wrappers. Converts remaining semantic elements (H1-H4, paragraphs, bulleted and ordered lists, blockquotes, and tables) into standard Markdown formatted for token efficiency and LLM reasoning.

### When to Use
- Ingesting web articles, documentation, landing pages, or company profiles into an LLM context window for summarization, Q&A, or RAG embeddings.
- Extracting core reading content without paying LLM token costs for repetitive HTML markup and site navigation.

### When NOT to Use
- Do NOT use if you need structured metadata (title, Open Graph preview, JSON-LD); use \`webintel_seo_meta\` instead.
- Do NOT use if you need company emails, phone numbers, or technologies; use \`webintel_scan\` instead.
- Do NOT use if you need to extract and follow website links; use \`webintel_links\` instead.

### Disambiguation
Unlike standard web scrapers that return messy raw HTML or unstructured text dumps, \`webintel_markdown\` applies intelligent semantic noise filtering, stripping cookie policies and navigation bars, and caps output at 4,000 characters to fit predictably inside prompt budgets.

### Behavior & Performance
- Side Effects: None. Strictly read-only.
- Idempotency: Yes.
- Output Length: Capped at 4,000 characters by default to protect agent context windows.
- Latency: Typically 500ms to 2.2s.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The webpage URL to fetch and convert into Markdown (e.g. 'https://docs.github.com'). Must include http:// or https://.",
          examples: ["https://docs.github.com", "https://stripe.com/pricing", "https://openai.com/research"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        characterCount: { type: "number" },
        markdown: { type: "string" },
      },
      required: ["url", "characterCount", "markdown"],
    },
    annotations: {
      title: "WebIntel: Web Page to Markdown",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_seo_meta",
    description: `Extract SEO metadata, Open Graph social share tags, Twitter Cards, and structured Schema.org JSON-LD from a webpage.

### Purpose
Parse the HTML \`<head>\` and embedded semantic tags to return the page title, meta description, canonical URL, language, theme color, favicon, Open Graph attributes (og:title, og:description, og:image, og:type, og:site_name), Twitter Card metadata, and parsed Schema.org JSON-LD entities (Organization, Product, Article, FAQ, SoftwareApplication).

### When to Use
- Auditing a website's on-page SEO health or social sharing preview cards.
- Extracting machine-readable structured knowledge via Schema.org JSON-LD without manual parsing.
- Verifying canonicalization and language localization settings.

### When NOT to Use
- Do NOT use if you need the full readable body content; use \`webintel_markdown\` instead.
- Do NOT use if you need the site's robots.txt rules or sitemaps; use \`webintel_robots\` instead.
- Do NOT use if you need HTTP response security headers; use \`webintel_headers\` instead.

### Disambiguation
This tool isolates the semantic metadata layer of a webpage. Where \`webintel_scan\` provides an executive summary, \`webintel_seo_meta\` provides the raw, un-truncated metadata parameters, social cards, and parsed JSON-LD structured data trees.

### Behavior & Performance
- Side Effects: None. Read-only.
- Idempotency: Yes.
- Returns: Structured JSON object with title, description, canonicalUrl, openGraph object, twitter object, and jsonLd array.
- Latency: Typically 500ms to 2s.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The webpage URL to inspect for SEO metadata and structured JSON-LD (e.g. 'https://bbc.com/news').",
          examples: ["https://bbc.com/news", "https://amazon.com/dp/B08N5WRWNW", "https://stripe.com"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        openGraph: { type: "object" },
        twitter: { type: "object" },
      },
      required: ["url"],
    },
    annotations: {
      title: "WebIntel: SEO & Metadata Extraction",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_links",
    description: `Extract, resolve, and categorize all hyperlinks from a public webpage into internal, external, social, and navigation destinations.

### Purpose
Parse all HTML \`<a href>\` anchor elements on a page, resolve relative paths to absolute URLs, filter out invalid fragments (#) and javascript pseudo-protocols, and classify targets into: Same-Origin Internal Links, External Outbound Links, Social Profiles (Twitter/X, LinkedIn, GitHub, YouTube, Facebook, Instagram, Discord), and Key Navigation Pages (Contact, About, Pricing, Careers, Blog).

### When to Use
- Analyzing a website's link graph, internal navigation architecture, or outbound citation partners.
- Discovering verified company social media accounts and support portals from a landing page.
- Planning crawler traversal paths or discovering sitemap boundaries.

### When NOT to Use
- Do NOT use if you only need corporate email addresses or phone numbers; use \`webintel_contact_finder\` instead.
- Do NOT use if you need the page's written content; use \`webintel_markdown\` instead.
- Do NOT use if you are looking for XML sitemap URLs; use \`webintel_robots\` instead.

### Disambiguation
Unlike general scrapers that return unorganized raw href strings, \`webintel_links\` deduplicates, resolves absolute protocols, identifies social platforms, and segments navigation pages into structured categories with link counts.

### Behavior & Performance
- Side Effects: None. Read-only.
- Idempotency: Yes.
- Returns: Deduplicated arrays of internalLinks, externalLinks, socialLinks, and navigationPages with respective counts.
- Latency: Typically 600ms to 2.5s.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The webpage URL to analyze for hyperlinks and navigation pathways (e.g. 'https://github.com/about').",
          examples: ["https://github.com/about", "https://stripe.com", "https://vercel.com"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        website: { type: "string" },
        internalLinks: { type: "array", items: { type: "string" } },
        externalLinks: { type: "array", items: { type: "string" } },
        socialLinks: { type: "object" },
        counts: { type: "object" },
      },
      required: ["website", "internalLinks", "externalLinks", "counts"],
    },
    annotations: {
      title: "WebIntel: Hyperlink Graph Analysis",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_headers",
    description: `Inspect HTTP response headers and grade the web server's security posture with an A-through-F security rating.

### Purpose
Retrieve the exact HTTP response headers returned by a web server and perform an automated security evaluation auditing 6 critical headers: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy. Produces a 0-100 numerical score, letter grade (A/B/C/D/F), and actionable remediation guidance for missing protections.

### When to Use
- Auditing web application security posture, CDN caching rules, or CORS headers.
- Checking web server identity (nginx, cloudflare, Apache), proxy gateways, and compression headers.
- Compliance checks for HTTPS enforcement and clickjacking prevention.

### When NOT to Use
- Do NOT use if you need page content or SEO metadata; use \`webintel_markdown\` or \`webintel_seo_meta\` instead.
- Do NOT use if you need DNS record validation; use \`webintel_dns_intel\` instead.
- Do NOT use if you need SSL/TLS certificate details; use \`webintel_ssl_cert\` instead.
- Do NOT use to find technology libraries embedded in client JavaScript; use \`webintel_tech_detect\` instead.

### Disambiguation
This tool does not parse HTML. It operates strictly at the HTTP protocol layer, inspecting status codes, transport security, cache directives, and server banners.

### Behavior & Performance
- Side Effects: None. Read-only single HTTP GET.
- Idempotency: Yes.
- Returns: Flat headers key-value map, status code, security score (0-100), letter grade (A-F), and per-header audit checks.
- Latency: Typically 300ms to 1.5s.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The target URL whose HTTP response headers should be audited (e.g. 'https://cloudflare.com').",
          examples: ["https://cloudflare.com", "https://github.com", "https://google.com"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        httpStatus: { type: "number" },
        security: { type: "object" },
        headers: { type: "object" },
      },
      required: ["url", "httpStatus", "security", "headers"],
    },
    annotations: {
      title: "WebIntel: HTTP Security Header Audit",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "webintel_robots",
    description: `Fetch and parse a website's robots.txt file to determine crawler permissions and discover XML sitemaps.

### Purpose
Query the host's \`/robots.txt\` file, parse user-agent directives (Disallow, Allow, Crawl-delay), extract listed XML sitemaps, and evaluate whether a specific path is permitted for standard web crawlers (evaluating both WebIntelBot and wildcard '*' rules).

### When to Use
- Checking whether an autonomous agent or scraper is legally/ethically permitted to crawl a given URL path.
- Locating authoritative XML sitemaps for site structure discovery and SEO auditing.
- Inspecting crawl delays or bot-specific exclusions (e.g., GPTBot, ClaudeBot, Googlebot).

### When NOT to Use
- Do NOT use to parse the actual content of a web page; use \`webintel_markdown\` instead.
- Do NOT use to extract on-page HTML links; use \`webintel_links\` instead.
- If the target host has no robots.txt file (HTTP 404), this tool safely indicates that crawling is allowed by default.

### Disambiguation
This tool does not scrape the requested URL itself; instead, it targets the root \`/robots.txt\` of the URL's origin host and tests permissions for the given path.

### Behavior & Performance
- Side Effects: None. Read-only.
- Idempotency: Yes.
- Failsafe: Returns \`{ allowed: true, robotsFound: false }\` if robots.txt is missing, timing out, or returning a 404.
- Latency: Typically 200ms to 1.2s.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          pattern: "^https?://.+",
          minLength: 8,
          maxLength: 2048,
          description:
            "The target URL or website origin to check robots.txt directives for (e.g. 'https://nytimes.com/section/world').",
          examples: ["https://nytimes.com", "https://wikipedia.org", "https://reddit.com"],
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        robotsFound: { type: "boolean" },
        allowed: { type: "boolean" },
        sitemaps: { type: "array", items: { type: "string" } },
      },
      required: ["url", "robotsFound", "allowed"],
    },
    annotations: {
      title: "WebIntel: Robots.txt & Sitemap Locator",
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

  // ── 1. initialize ──────────────────────────────────────────────────────────
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
          version: "1.3.0",
        },
        instructions: [
          "WebIntel is a high-performance website intelligence and OSINT suite for AI agents.",
          "Available tools (10 total):",
          "- webintel_scan: Full 360-degree company reconnaissance (tech stack, contacts, social links, business profile).",
          "- webintel_dns_intel: Domain DNS intelligence (MX email provider detection, nameservers, SPF records).",
          "- webintel_ssl_cert: SSL/TLS certificate audit, issuer, expiration countdown & SANs mapping.",
          "- webintel_contact_finder: Targeted business email addresses, telephone numbers & social profiles.",
          "- webintel_tech_detect: Fast 65+ technology stack inspection across frameworks, CMS, analytics, and payments.",
          "- webintel_markdown: High-signal, noise-free Markdown conversion for token-efficient LLM reasoning and RAG.",
          "- webintel_seo_meta: SEO metadata, Open Graph preview tags, Twitter cards, and Schema.org JSON-LD.",
          "- webintel_links: Complete link graph extraction (internal, external, social channels, navigation pages).",
          "- webintel_headers: HTTP response headers with automated security posture score and A-F grading.",
          "- webintel_robots: robots.txt permission verification and XML sitemap discovery.",
          "All tools are read-only, idempotent, and protected by multi-tier SSRF defense.",
        ].join("\n"),
      },
    });
  }

  // ── 2. notifications/initialized ───────────────────────────────────────────
  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }

  // ── 3. ping ─────────────────────────────────────────────────────────────────
  if (method === "ping") {
    return NextResponse.json({ jsonrpc: "2.0", id, result: {} });
  }

  // ── 4. tools/list ───────────────────────────────────────────────────────────
  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: { tools: MCP_TOOLS },
    });
  }

  // ── 5. tools/call ───────────────────────────────────────────────────────────
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
      // ── Tool: webintel_dns_intel ──────────────────────────────────────────
      if (toolName === "webintel_dns_intel") {
        return await handleDnsIntel(id, toolArgs.url);
      }

      // ── Tool: webintel_ssl_cert ───────────────────────────────────────────
      if (toolName === "webintel_ssl_cert") {
        return await handleSslCert(id, toolArgs.url);
      }

      // ── Tool: webintel_robots ─────────────────────────────────────────────
      if (toolName === "webintel_robots") {
        return await handleRobots(id, toolArgs.url);
      }

      // HTTP-based tools require safe SSRF-guarded fetch
      const fetchResult = await safeFetch(toolArgs.url, {
        timeoutMs: 8000,
        maxSizeBytes: 2.5 * 1024 * 1024,
      });

      const $ = cheerio.load(fetchResult.body);

      // ── Tool: webintel_contact_finder ─────────────────────────────────────
      if (toolName === "webintel_contact_finder") {
        const parsedData = parseHtml(fetchResult.body, fetchResult.finalUrl);
        return jsonRpcResult(id, {
          website: fetchResult.finalUrl,
          emailsFound: parsedData.emails.length,
          emails: parsedData.emails,
          phones: parsedData.phones,
          socialLinks: parsedData.socialLinks,
          contactPage: parsedData.contactPage,
          aboutPage: parsedData.aboutPage,
        });
      }

      // ── Tool: webintel_markdown ───────────────────────────────────────────
      if (toolName === "webintel_markdown") {
        const markdown = convertHtmlToMarkdown(fetchResult.body);
        return jsonRpcResult(id, {
          url: fetchResult.finalUrl,
          characterCount: markdown.length,
          markdown,
        });
      }

      // ── Tool: webintel_tech_detect ────────────────────────────────────────
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

      // ── Tool: webintel_seo_meta ───────────────────────────────────────────
      if (toolName === "webintel_seo_meta") {
        return jsonRpcResult(id, extractSeoMeta($, fetchResult));
      }

      // ── Tool: webintel_links ──────────────────────────────────────────────
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

      // ── Tool: webintel_headers ────────────────────────────────────────────
      if (toolName === "webintel_headers") {
        return jsonRpcResult(
          id,
          analyzeHeaders(fetchResult.finalUrl, fetchResult.headers, fetchResult.statusCode)
        );
      }

      // ── Tool: webintel_scan (Comprehensive Dossier) ───────────────────────
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
              text: `Error executing ${toolName} on ${toolArgs.url}: ${errMessage}`,
            },
          ],
          isError: true,
        },
      });
    }
  }

  // ── Unsupported method ────────────────────────────────────────────────────
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method '${method}' not found` },
  });
}

// ─── GET /api/mcp — Discovery, TDQS Manifest & Pricing ───────────────────────

export async function GET() {
  return NextResponse.json({
    name: "WebIntel MCP Server",
    version: "1.3.0",
    description:
      "Enterprise website intelligence, technical reconnaissance, and clean content extraction for autonomous AI agents. 10 production tools covering tech stack detection (65+ signatures), business dossier synthesis, clean Markdown extraction, SSL/TLS certificate auditing, lead contact harvesting, SEO metadata, link graph analysis, HTTP security grading, robots.txt permission checks, and domain DNS/email intelligence.",
    protocolVersion: "2024-11-05",
    tdqsRating: "A (5.0/5.0 Target)",
    toolCount: MCP_TOOLS.length,
    tools: MCP_TOOLS.map((t) => ({
      name: t.name,
      title: t.annotations?.title,
      description: t.description.split("\n\n")[0],
      readOnly: t.annotations?.readOnlyHint ?? true,
      idempotent: t.annotations?.idempotentHint ?? true,
    })),
    monetization: {
      gateway: "Cloudflare Monetization Gateway",
      pricingPerCallUsd: DEFAULT_COST_PER_SCAN_USD,
      acceptedProtocols: [
        "cloudflare_monetization_gateway",
        "bearer_api_key",
        "x402_agent_micropayment",
      ],
      freeTier: "Developer evaluation mode active — free preview calls supported",
      status: "active",
    },
  });
}

// ─── JSON-RPC Result Helper ──────────────────────────────────────────────────

function jsonRpcResult(id: string | number, data: Record<string, unknown>) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    },
  });
}

// ─── Tool Handler: webintel_ssl_cert ─────────────────────────────────────────

async function handleSslCert(id: string | number, urlStr: string) {
  let hostname = "";
  try {
    const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    hostname = parsed.hostname;
  } catch {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: `Invalid domain or URL: "${urlStr}"` }],
        isError: true,
      },
    });
  }

  // Pre-validate hostname against SSRF
  try {
    await validateAndResolveUrl(`https://${hostname}`);
  } catch (err: unknown) {
    const msg = err instanceof SecurityError ? err.message : String(err);
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: `SSRF validation failed for ${hostname}: ${msg}` }],
        isError: true,
      },
    });
  }

  return new Promise<NextResponse>((resolve) => {
    const socket = tls.connect(
      443,
      hostname,
      { servername: hostname, timeout: 5000 },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          const protocol = socket.getProtocol() || "TLS";
          const cipher = socket.getCipher();
          socket.end();

          if (!cert || Object.keys(cert).length === 0) {
            resolve(
              jsonRpcResult(id, {
                host: hostname,
                error: "No SSL certificate found or handshake failed.",
              })
            );
            return;
          }

          const validToDate = new Date(cert.valid_to);
          const now = new Date();
          const msRemaining = validToDate.getTime() - now.getTime();
          const daysRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)));
          const isExpiringSoon = daysRemaining <= 30;

          // Parse SANs
          const sans = cert.subjectaltname
            ? cert.subjectaltname
                .split(",")
                .map((s) => s.trim().replace(/^DNS:/i, ""))
                .filter(Boolean)
            : [];

          resolve(
            jsonRpcResult(id, {
              host: hostname,
              issuer: cert.issuer?.O || cert.issuer?.CN || "Unknown Authority",
              subject: cert.subject?.CN || hostname,
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              daysRemaining,
              isExpiringSoon,
              expiryWarning: isExpiringSoon
                ? `WARNING: Certificate expires in ${daysRemaining} days!`
                : null,
              protocol,
              cipherName: cipher?.name || "Unknown",
              sansCount: sans.length,
              sans: sans.slice(0, 20),
            })
          );
        } catch (err: unknown) {
          socket.destroy();
          resolve(
            NextResponse.json({
              jsonrpc: "2.0",
              id,
              result: {
                content: [{ type: "text", text: `TLS error for ${hostname}: ${String(err)}` }],
                isError: true,
              },
            })
          );
        }
      }
    );

    socket.on("timeout", () => {
      socket.destroy();
      resolve(
        NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: `TLS connection timed out for ${hostname}` }],
            isError: true,
          },
        })
      );
    });

    socket.on("error", (err) => {
      resolve(
        NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: `TLS handshake error for ${hostname}: ${err.message}` }],
            isError: true,
          },
        })
      );
    });
  });
}

// ─── Tool Handler: webintel_dns_intel ────────────────────────────────────────

async function handleDnsIntel(id: string | number, urlStr: string) {
  let hostname = "";
  try {
    const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    hostname = parsed.hostname;
  } catch {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: `Invalid domain or URL: "${urlStr}"` }],
        isError: true,
      },
    });
  }

  // Pre-validate hostname against SSRF
  try {
    await validateAndResolveUrl(`https://${hostname}`);
  } catch (err: unknown) {
    const msg = err instanceof SecurityError ? err.message : String(err);
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: `SSRF validation failed for ${hostname}: ${msg}` }],
        isError: true,
      },
    });
  }

  const [aResult, aaaaResult, mxResult, nsResult, txtResult] = await Promise.allSettled([
    dns.resolve4(hostname),
    dns.resolve6(hostname),
    dns.resolveMx(hostname),
    dns.resolveNs(hostname),
    dns.resolveTxt(hostname),
  ]);

  const ipv4 = aResult.status === "fulfilled" ? aResult.value : [];
  const ipv6 = aaaaResult.status === "fulfilled" ? aaaaResult.value : [];
  const mxRecords = mxResult.status === "fulfilled" ? mxResult.value : [];
  const nameservers = nsResult.status === "fulfilled" ? nsResult.value : [];
  const rawTxt = txtResult.status === "fulfilled" ? txtResult.value : [];

  // Flatten TXT records
  const txtRecords = rawTxt.map((parts) => parts.join(""));

  // Detect Email Provider from MX records
  let detectedEmailProvider = "Unknown / Self-hosted";
  const mxHosts = mxRecords.map((r) => r.exchange.toLowerCase()).join(" ");
  if (mxHosts.includes("google") || mxHosts.includes("googlemail.com")) {
    detectedEmailProvider = "Google Workspace";
  } else if (mxHosts.includes("outlook.com") || mxHosts.includes("protection.outlook.com")) {
    detectedEmailProvider = "Microsoft 365 / Exchange Online";
  } else if (mxHosts.includes("protonmail") || mxHosts.includes("proton.me")) {
    detectedEmailProvider = "ProtonMail";
  } else if (mxHosts.includes("zoho")) {
    detectedEmailProvider = "Zoho Mail";
  } else if (mxHosts.includes("messagingengine.com")) {
    detectedEmailProvider = "Fastmail";
  } else if (mxHosts.includes("mimecast")) {
    detectedEmailProvider = "Mimecast (Enterprise Gateway)";
  } else if (mxHosts.includes("pphosted") || mxHosts.includes("proofpoint")) {
    detectedEmailProvider = "Proofpoint (Enterprise Gateway)";
  } else if (mxHosts.includes("amazonses.com")) {
    detectedEmailProvider = "Amazon SES";
  }

  // Detect Cloud DNS / CDN from NS records
  let detectedDnsProvider = "Standard / Registrar DNS";
  const nsString = nameservers.map((n) => n.toLowerCase()).join(" ");
  if (nsString.includes("cloudflare")) {
    detectedDnsProvider = "Cloudflare";
  } else if (nsString.includes("awsdns")) {
    detectedDnsProvider = "AWS Route 53";
  } else if (nsString.includes("googledomains") || nsString.includes("google.com")) {
    detectedDnsProvider = "Google Cloud DNS";
  } else if (nsString.includes("azure-dns")) {
    detectedDnsProvider = "Azure DNS";
  } else if (nsString.includes("domaincontrol.com")) {
    detectedDnsProvider = "GoDaddy";
  } else if (nsString.includes("registrar-servers.com")) {
    detectedDnsProvider = "Namecheap";
  }

  // Extract Security & Verification TXT records
  const spfRecord = txtRecords.find((t) => t.toLowerCase().startsWith("v=spf1")) || null;
  const verifications: Record<string, boolean> = {
    google: txtRecords.some((t) => t.includes("google-site-verification")),
    microsoft: txtRecords.some((t) => t.includes("MS=") || t.includes("microsoft")),
    stripe: txtRecords.some((t) => t.includes("stripe-verification")),
    atlassian: txtRecords.some((t) => t.includes("atlassian-domain-verification")),
    facebook: txtRecords.some((t) => t.includes("facebook-domain-verification")),
    apple: txtRecords.some((t) => t.includes("apple-domain-verification")),
    docusign: txtRecords.some((t) => t.includes("docusign")),
  };

  return jsonRpcResult(id, {
    domain: hostname,
    emailProvider: detectedEmailProvider,
    dnsProvider: detectedDnsProvider,
    security: {
      hasSpfRecord: Boolean(spfRecord),
      spfRecord,
      verifications: Object.entries(verifications)
        .filter(([, found]) => found)
        .map(([name]) => name),
    },
    records: {
      a: ipv4,
      aaaa: ipv6,
      mx: mxRecords.sort((a, b) => a.priority - b.priority),
      ns: nameservers,
      txtCount: txtRecords.length,
      txt: txtRecords.slice(0, 15),
    },
  });
}

// ─── Tool Handler: webintel_seo_meta ─────────────────────────────────────────

function extractSeoMeta(
  $: cheerio.CheerioAPI,
  fetchResult: { finalUrl: string; body: string; headers: Record<string, string | string[] | undefined> }
) {
  const getMeta = (attr: string, value: string) =>
    $(`meta[${attr}="${value}"]`).attr("content")?.trim() || null;

  const jsonLdBlocks: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text());
      jsonLdBlocks.push(parsed);
    } catch {
      // Ignore invalid JSON-LD blocks
    }
  });

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

// ─── Tool Handler: webintel_headers ──────────────────────────────────────────

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
      rec: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to enforce HTTPS transport.",
    },
    {
      name: "content-security-policy",
      rec: "Add a Content-Security-Policy (CSP) header to restrict external resource origins and prevent XSS injection.",
    },
    {
      name: "x-content-type-options",
      rec: "Add 'X-Content-Type-Options: nosniff' to prevent browser MIME-type sniffing.",
    },
    {
      name: "x-frame-options",
      rec: "Add 'X-Frame-Options: DENY' or 'SAMEORIGIN' to protect visitors against clickjacking.",
    },
    {
      name: "referrer-policy",
      rec: "Add 'Referrer-Policy: strict-origin-when-cross-origin' to protect sensitive URL parameters on outbound clicks.",
    },
    {
      name: "permissions-policy",
      rec: "Add a Permissions-Policy header to restrict access to sensitive device APIs (camera, geolocation, microphone).",
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
  const securityScore = Math.round((presentCount / securityHeaders.length) * 100);

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

// ─── Tool Handler: webintel_robots ───────────────────────────────────────────

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
      // robots.txt missing or failed
    }

    if (!robotsFound) {
      return jsonRpcResult(id, {
        url: urlStr,
        robotsUrl,
        robotsFound: false,
        allowed: true,
        message: "No robots.txt found — crawling is permitted by default.",
        sitemaps: [],
        rules: [],
      });
    }

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
