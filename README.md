# WebIntel API

**Autonomous Website Intelligence for AI Agents & LLM Toolchains**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black.svg)](https://nextjs.org/)
[![Cheerio](https://img.shields.io/badge/Cheerio-1.0-orange.svg)](https://cheerio.js.org/)
[![SSRF Armor](https://img.shields.io/badge/SSRF%20Defense-RFC--1918%20%7C%20IP%20Pinned-emerald.svg)](#security--ssrf-protections)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

WebIntel API is a website intelligence scanner designed specifically for AI agents, LLM pipelines (LangChain, CrewAI, AutoGen), and automated SDR workflows. Submit any public URL and receive clean, structured, factual JSON containing tech stacks, company summaries, semantic headings, public emails, social profiles, and confidence metrics—guaranteed zero fabrication.

---

## Key Features

- **Agent-First Schema**: Compact, strictly validated JSON response optimized for LLM token efficiency.
- **Multi-Layer SSRF Armor**:
  - DNS pre-resolution for both IPv4 and IPv6.
  - Hard blocks on Loopback (`127.0.0.0/8`, `::1`), RFC-1918 private subnets (`10/8`, `172.16/12`, `192.168/16`), link-local (`169.254/16`, `fe80::/10`), carrier-grade NAT, multicast, and cloud metadata (`169.254.169.254`, `metadata.google.internal`).
  - **Socket IP Pinning**: Custom agent socket lookup binds strictly to pre-validated IPs, eliminating DNS Rebinding TOCTOU attacks.
  - Manual step-by-step redirect validation (up to 5 hops with SSRF checks on each hop).
  - Stream size caps (max 2.5 MB) and strict timeouts (8 seconds).
- **40+ Technology Signatures**: Detects frontend frameworks (Next.js, React, Vue, Angular, Svelte), CMS (WordPress, Shopify, Webflow), styling (Tailwind CSS, Bootstrap), analytics (Google Analytics, Segment, PostHog), CDN/hosting (Cloudflare, Vercel, Netlify), and payments (Stripe, PayPal).
- **Zero Data Fabrication**: Factual data extraction with mathematical confidence metrics (0.0 to 1.0) and explicit flags distinguishing detected from inferred values.
- **Interactive Playground**: Built-in developer UI with 1-click sample presets, real-time scanning states, formatted overview dashboard, and copyable raw JSON.
- **Robots.txt & Crawl Etiquette**: Inspects site `robots.txt` before fetching and restricts deep crawls strictly to the same origin.
- **Sliding-Window Rate Limiting**: Built-in in-memory rate limiter with standard HTTP 429 and `Retry-After` headers.

---

## Architecture Overview

```
Client (AI Agent / Playground / cURL)
        │
        ▼ POST /api/scan
┌──────────────────────────────────────────────┐
│  Next.js 16 App Router Route Handler         │
│  - Zod Request Schema Validation             │
│  - Sliding Window Rate Limiting (45 req/min) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Security & Networking Layer (SSRF Armor)    │
│  - Protocol check (HTTP/HTTPS only)          │
│  - DNS Pre-resolution & RFC-1918 / Cloud IP  │
│  - Pinned IP Socket Agent (Anti-Rebinding)   │
│  - Manual Redirect Hop Guard (Max 5 hops)    │
│  - Response Stream Size Limit (2.5 MB)       │
│  - Strict Timeout Guard (8,000 ms)           │
│  - Robots.txt Compliance Check               │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Extraction Pipeline                         │
│  - Cheerio HTML Parser (Headings, Title, Og) │
│  - Tech Stack Signature Engine (40+ stacks)  │
│  - Business Intel & Schema.org JSON-LD Parser│
│  - Public Email & Social Profile Harvester   │
│  - Optional 1-Page Same-Origin Deep Scan     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
         Structured WebIntel JSON Response
```

---

## Quickstart & Local Development

### Prerequisites
- Node.js 18+ (tested on Node v20 & v24)
- npm 9+

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd repo

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the SaaS landing page and interactive playground.

### Production Build

```bash
# Build production bundle with Next.js Turbopack
npm run build

# Start production server
npm run start
# Or specify custom port
npx next start -p 3005
```

### Running Automated Test Suite

We provide a comprehensive test suite validating public website extraction, SSRF edge-cases, and rate limiting:

```bash
node scripts/test-suite.mjs
```

---

## API Reference

### Scan a Website
`POST /api/scan`

Scans a public website and returns structured intelligence.

#### Request Headers
| Header | Value | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes |

#### Request Body Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `url` | string | Yes | - | Target public website URL (HTTP/HTTPS). |
| `deepScan` | boolean | No | `false` | When true, safely inspects discovered contact/about page on same domain to enrich email and team data. |
| `includeContent` | boolean | No | `true` | Includes high-signal readable text paragraphs extracted for direct LLM ingestion. |

#### Example Request (cURL)

```bash
curl -X POST http://localhost:3005/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://stripe.com",
    "deepScan": false,
    "includeContent": true
  }'
```

#### Example Response (200 OK)

```json
{
  "success": true,
  "website": "https://stripe.com/in",
  "companyName": "Stripe",
  "description": "Stripe is a financial services platform that helps all types of businesses accept payments, build flexible billing models and manage money movement.",
  "title": "Stripe | Financial Infrastructure to Grow Your Revenue",
  "headings": [
    "Financial infrastructure to grow your revenue.",
    "Flexible solutions for every business model.",
    "The backbone of global commerce",
    "Powering businesses of all sizes."
  ],
  "headingsDetails": {
    "h1": [
      "Financial infrastructure to grow your revenue."
    ],
    "h2": [
      "Flexible solutions for every business model.",
      "The backbone of global commerce",
      "Powering businesses of all sizes."
    ]
  },
  "services": [
    "Flexible solutions for every business model.",
    "The backbone of global commerce",
    "Powering businesses of all sizes."
  ],
  "emails": [],
  "socialLinks": {
    "github": "https://github.com/stripe"
  },
  "contactPage": "https://stripe.com/in/contact/sales",
  "aboutPage": "https://stripe.com/in/about",
  "technologies": [
    "Next.js",
    "Tailwind CSS",
    "Bootstrap"
  ],
  "technologiesDetailed": [
    {
      "name": "Next.js",
      "category": "Framework",
      "confidence": 0.9,
      "detectedFrom": "DOM selector: #__next"
    },
    {
      "name": "Tailwind CSS",
      "category": "Styling",
      "confidence": 0.8,
      "detectedFrom": "HTML pattern match"
    }
  ],
  "pagesAnalyzed": [
    "https://stripe.com/in"
  ],
  "confidence": 0.75,
  "inferredData": {
    "companyNameIsInferred": true,
    "servicesAreInferred": true
  },
  "textContent": "Financial infrastructure to grow your revenue. Accept payments, offer financial services...",
  "stats": {
    "internalLinksCount": 116,
    "externalLinksCount": 20,
    "responseTimeMs": 1450,
    "httpStatusCode": 200,
    "resolvedIp": "198.137.150.161",
    "contentSizeBytes": 724045
  }
}
```

---

## Security & SSRF Protections

WebIntel API is specifically engineered to safely execute untrusted public URL inputs:

1. **Protocol Restriction**: Rejects any non-HTTP/HTTPS protocol (e.g. `file://`, `gopher://`, `ftp://`, `data:`, `javascript:`).
2. **DNS Pre-Resolution**: Performs full DNS lookup (A and AAAA records) and evaluates all resolved IP addresses.
3. **Blacklisted IP Ranges**:
   - `0.0.0.0/8` (Current network)
   - `10.0.0.0/8` (Private RFC-1918)
   - `100.64.0.0/10` (Carrier-grade NAT)
   - `127.0.0.0/8` & `::1` (Loopback)
   - `169.254.0.0/16` & `fe80::/10` (Link-Local & Cloud Metadata `169.254.169.254`)
   - `172.16.0.0/12` (Private RFC-1918)
   - `192.168.0.0/16` (Private RFC-1918)
   - `224.0.0.0/4` & `ff00::/8` (Multicast)
   - `fc00::/7` (IPv6 Unique Local)
   - IPv4-mapped IPv6 (`::ffff:0:0/96`)
4. **Socket IP Pinning (Anti-DNS Rebinding)**: Binds the HTTP agent socket connection directly to the pre-validated IP address, defeating Time-of-Check to Time-of-Use (TOCTOU) DNS attacks.
5. **Redirect Inspection**: Does not auto-follow redirects blindly. Each redirect URL is extracted, resolved, and re-evaluated through the SSRF guard (max 5 hops).
6. **Resource Exhaustion Defense**:
   - Request timeout: 8,000 ms.
   - Stream byte counter: aborts connection if body exceeds 2.5 MB.
   - Content-Type verification: rejects non-HTML/text binary payloads.
7. **Rate Limiting**: In-memory sliding window enforcing 45 requests/minute per client IP.

---

## Limitations

- **Client-Side SPA Content**: Websites that render 100% of their text purely via client-side JavaScript without server-side rendering (SSR) will have limited DOM text extracted. (Cheerio parses the initial HTML response).
- **Cloudflare / CAPTCHA Turnstiles**: Sites protected by aggressive Cloudflare "Under Attack" challenge screens will return the Cloudflare challenge page rather than internal business content.
- **Deep Crawling Depth**: By design, WebIntel API limits secondary scans to at most 1 same-origin page (e.g. `/contact` or `/about`) to avoid aggressive crawling and crawler traps.

---

## Recommended Next Steps

1. **Persistent Redis Rate Limiter**: For multi-instance horizontal scaling, swap the in-memory rate limiter with Upstash Redis or AWS ElastiCache.
2. **Headless Browser Fallback**: Add an optional opt-in headless Chromium worker (e.g. Playwright) for heavy single-page applications.
3. **Webhook Notifications**: Add asynchronous webhook delivery for bulk scanning thousands of company domains in parallel.
4. **API Key Authentication**: Add developer API keys with tier-based quota management.
