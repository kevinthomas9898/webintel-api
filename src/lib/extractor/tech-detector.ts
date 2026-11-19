import type * as cheerio from "cheerio";
import type { DetectedTechnology } from "../schemas/scan";

interface TechSignature {
  name: string;
  category: DetectedTechnology["category"];
  rules: {
    html?: RegExp[];
    scripts?: RegExp[];
    meta?: Array<{ name?: string; content: RegExp }>;
    headers?: Array<{ header: string; match: RegExp }>;
    dom?: string[]; // CSS selectors
  };
}

const SIGNATURES: TechSignature[] = [
  // 1. Modern Frameworks & Runtimes
  {
    name: "Next.js",
    category: "Framework",
    rules: {
      html: [/__NEXT_DATA__/, /\/_next\/static\//],
      dom: ["#__next", "script[src*='/_next/']"],
      headers: [{ header: "x-powered-by", match: /Next\.js/i }],
    },
  },
  {
    name: "React",
    category: "Framework",
    rules: {
      html: [/data-reactroot/, /__REACT_DEVTOOLS_GLOBAL_HOOK__/, /react-dom/],
      dom: ["[data-reactroot]", "[data-reactid]"],
    },
  },
  {
    name: "Vue.js",
    category: "Framework",
    rules: {
      html: [/data-v-[a-z0-9]+/, /__VUE__/],
      dom: ["[data-v-]"],
      scripts: [/vue(\.runtime)?(\.min)?\.js/i],
    },
  },
  {
    name: "Nuxt.js",
    category: "Framework",
    rules: {
      html: [/__NUXT__/, /\/_nuxt\//],
      dom: ["#__nuxt"],
      headers: [{ header: "x-powered-by", match: /Nuxt/i }],
    },
  },
  {
    name: "Angular",
    category: "Framework",
    rules: {
      html: [/ng-version=/, /ng-app=/],
      dom: ["[ng-version]", "app-root"],
    },
  },
  {
    name: "Svelte / SvelteKit",
    category: "Framework",
    rules: {
      html: [/svelte-[a-z0-9]+/, /__svelte__/],
      dom: ["[class*='svelte-']"],
    },
  },
  {
    name: "Remix",
    category: "Framework",
    rules: {
      html: [/window\.__remixContext/, /__remixManifest/],
      dom: ["script:contains('__remixContext')"],
    },
  },
  {
    name: "Astro",
    category: "Framework",
    rules: {
      html: [/data-astro-cid-/, /astro-island/],
      dom: ["astro-island", "[data-astro-cid]"],
      meta: [{ name: "generator", content: /Astro/i }],
    },
  },
  {
    name: "Gatsby",
    category: "Framework",
    rules: {
      html: [/___gatsby/, /gatsby-image/],
      dom: ["#___gatsby"],
      meta: [{ name: "generator", content: /Gatsby/i }],
    },
  },

  // 2. CMS & Site Builders
  {
    name: "WordPress",
    category: "CMS",
    rules: {
      html: [/wp-content\//, /wp-includes\//],
      dom: ["link[href*='wp-content']", "script[src*='wp-includes']"],
      meta: [{ name: "generator", content: /WordPress/i }],
    },
  },
  {
    name: "Shopify",
    category: "CMS",
    rules: {
      html: [/cdn\.shopify\.com/, /Shopify\.theme/, /myshopify\.com/],
      dom: ["script[src*='cdn.shopify.com']"],
      headers: [{ header: "x-shopid", match: /.+/ }],
    },
  },
  {
    name: "Webflow",
    category: "CMS",
    rules: {
      html: [/assets\.website-files\.com/, /webflow\.js/, /html\.w-mod-js/],
      dom: ["html.w-mod-js", "script[src*='webflow.js']"],
      meta: [{ name: "generator", content: /Webflow/i }],
    },
  },
  {
    name: "Framer",
    category: "CMS",
    rules: {
      html: [/framerusercontent\.com/, /__framer__/, /framer\.com\/m\//],
      dom: ["div[data-framer-name]", "style[data-framer-css]"],
    },
  },
  {
    name: "Squarespace",
    category: "CMS",
    rules: {
      html: [/static1\.squarespace\.com/, /static\.squarespace\.com/],
      dom: ["body.template-index", "link[href*='squarespace.com']"],
      headers: [{ header: "x-servedby", match: /squarespace/i }],
    },
  },
  {
    name: "Wix",
    category: "CMS",
    rules: {
      html: [/static\.wixstatic\.com/, /wix-warmup-data/],
      dom: ["#site-root", "script[src*='wixstatic.com']"],
      headers: [{ header: "x-wix-renderer-server", match: /.+/ }],
    },
  },
  {
    name: "Ghost",
    category: "CMS",
    rules: {
      html: [/ghost-portal-root/],
      meta: [{ name: "generator", content: /Ghost/i }],
    },
  },
  {
    name: "Sanity.io",
    category: "CMS",
    rules: {
      html: [/cdn\.sanity\.io/],
      scripts: [/cdn\.sanity\.io/i],
    },
  },
  {
    name: "Contentful",
    category: "CMS",
    rules: {
      html: [/images\.ctfassets\.net/, /cdn\.contentful\.com/],
    },
  },
  {
    name: "Strapi",
    category: "CMS",
    rules: {
      html: [/strapi\.io/],
      headers: [{ header: "x-powered-by", match: /Strapi/i }],
    },
  },

  // 3. Styling & UI
  {
    name: "Tailwind CSS",
    category: "Styling",
    rules: {
      html: [
        /class="[^"]*(?:\b(?:flex\s+items-\w+|grid\s+grid-cols-\d+|px-\d+\s+py-\d+|bg-\w+-\d+\s+text-\w+-\d+|space-(?:x|y)-\d+|rounded-(?:md|lg|xl)\s+border)\b)[^"]*"/,
        /cdn\.tailwindcss\.com/,
        /tailwind(?:\.min)?\.css/,
      ],
    },
  },
  {
    name: "Bootstrap",
    category: "Styling",
    rules: {
      html: [
        /bootstrap(?:\.min)?\.css/,
        /class="[^"]*\b(?:col-(?:xs|sm|md|lg|xl)-\d+|btn-(?:primary|secondary|success|danger)|navbar-expand-(?:sm|md|lg))\b[^"]*"/,
      ],
      scripts: [/bootstrap(?:\.bundle)?(?:\.min)?\.js/i],
    },
  },
  {
    name: "Framer Motion",
    category: "Styling",
    rules: {
      html: [/framer-motion/, /data-projection-id/],
    },
  },
  {
    name: "Radix UI",
    category: "Styling",
    rules: {
      html: [/data-radix-collection-item/, /data-radix-popper-content-wrapper/],
      dom: ["[data-radix-collection-item]", "[data-radix-popper-content-wrapper]"],
    },
  },
  {
    name: "Material UI (MUI)",
    category: "Styling",
    rules: {
      html: [/MuiButton-root/, /MuiTypography-root/, /mui-style-/],
      dom: ["[class*='MuiButton-root']"],
    },
  },
  {
    name: "Chakra UI",
    category: "Styling",
    rules: {
      html: [/chakra-ui-light/, /chakra-ui-dark/, /css-[a-z0-9]+\.chakra-/],
      dom: ["[class*='chakra-']"],
    },
  },

  // 4. Analytics & Product Observability
  {
    name: "Google Analytics 4",
    category: "Analytics",
    rules: {
      scripts: [/googletagmanager\.com\/gtag\/js/i],
      html: [/gtag\(['"]config['"]\s*,\s*['"]G-[A-Z0-9]+['"]\)/],
    },
  },
  {
    name: "Google Tag Manager",
    category: "Analytics",
    rules: {
      scripts: [/googletagmanager\.com\/gtm\.js/i],
      html: [/gtm\.start/],
    },
  },
  {
    name: "PostHog",
    category: "Analytics",
    rules: {
      scripts: [/posthog(?:\.min)?\.js/i, /app\.posthog\.com/i, /us\.posthog\.com/i, /eu\.posthog\.com/i],
      html: [/posthog\.init\(/],
    },
  },
  {
    name: "Segment",
    category: "Analytics",
    rules: {
      scripts: [/cdn\.segment\.com\/analytics\.js/i],
      html: [/analytics\.load\(/],
    },
  },
  {
    name: "Mixpanel",
    category: "Analytics",
    rules: {
      scripts: [/cdn\.mxpnl\.com/i],
      html: [/mixpanel\.init\(/],
    },
  },
  {
    name: "Amplitude",
    category: "Analytics",
    rules: {
      scripts: [/cdn\.amplitude\.com/i],
      html: [/amplitude\.getInstance\(/],
    },
  },
  {
    name: "Plausible Analytics",
    category: "Analytics",
    rules: {
      scripts: [/plausible\.io\/js\/script\.js/i],
    },
  },
  {
    name: "Hotjar",
    category: "Analytics",
    rules: {
      scripts: [/static\.hotjar\.com/i],
      html: [/hj\(['"]init['"]/],
    },
  },
  {
    name: "Microsoft Clarity",
    category: "Analytics",
    rules: {
      scripts: [/clarity\.ms\/tag\//i],
      html: [/clarity\(['"]set['"]/],
    },
  },
  {
    name: "FullStory",
    category: "Analytics",
    rules: {
      scripts: [/fullstory\.com\/s\/fs\.js/i],
      html: [/FS\.identify/],
    },
  },

  // 5. Customer Support & Chat
  {
    name: "Intercom",
    category: "Customer Support",
    rules: {
      scripts: [/widget\.intercom\.io/i],
      html: [/Intercom\(['"]boot['"]/],
    },
  },
  {
    name: "HubSpot",
    category: "Customer Support",
    rules: {
      scripts: [/js\.hs-scripts\.com/i, /js\.hubspot\.com/i],
      html: [/hbspt\.forms\.create/],
    },
  },
  {
    name: "Zendesk",
    category: "Customer Support",
    rules: {
      scripts: [/static\.zdassets\.com/i],
      html: [/zE\('webWidget'/],
    },
  },
  {
    name: "Crisp Chat",
    category: "Customer Support",
    rules: {
      scripts: [/client\.crisp\.chat/i],
      html: [/\$crisp\.push/],
    },
  },
  {
    name: "Drift",
    category: "Customer Support",
    rules: {
      scripts: [/js\.driftt\.com/i],
    },
  },

  // 6. Payments & Billing
  {
    name: "Stripe",
    category: "Payments",
    rules: {
      scripts: [/js\.stripe\.com/i],
      html: [/stripe\.com\/v3/, /__stripe/],
    },
  },
  {
    name: "PayPal",
    category: "Payments",
    rules: {
      scripts: [/paypal\.com\/sdk\/js/i],
    },
  },
  {
    name: "Lemon Squeezy",
    category: "Payments",
    rules: {
      scripts: [/assets\.lemonsqueezy\.com\/lemon\.js/i],
      html: [/lemonsqueezy-button/],
    },
  },
  {
    name: "Paddle",
    category: "Payments",
    rules: {
      scripts: [/cdn\.paddle\.com\/paddle\/paddle\.js/i],
      html: [/Paddle\.Setup/],
    },
  },
  {
    name: "Klarna",
    category: "Payments",
    rules: {
      scripts: [/x\.klarnacdn\.net/i],
    },
  },

  // 7. Authentication & Identity
  {
    name: "Clerk",
    category: "Auth",
    rules: {
      scripts: [/clerk\.browser\.js/i, /clerk\.[a-z0-9]+\.js/i],
      html: [/window\.__clerk_frontend_api/, /data-clerk/],
    },
  },
  {
    name: "Auth0",
    category: "Auth",
    rules: {
      scripts: [/cdn\.auth0\.com/i],
      html: [/auth0\.createAuth0Client/],
    },
  },
  {
    name: "Supabase",
    category: "Auth",
    rules: {
      scripts: [/supabase-js/i],
      html: [/supabase\.co/],
    },
  },
  {
    name: "Firebase",
    category: "Auth",
    rules: {
      scripts: [/firebasejs/i],
      html: [/firebaseapp\.com/],
    },
  },

  // 8. Hosting & Cloud Infrastructure
  {
    name: "Cloudflare",
    category: "Hosting",
    rules: {
      headers: [
        { header: "server", match: /cloudflare/i },
        { header: "cf-ray", match: /.+/ },
      ],
    },
  },
  {
    name: "Vercel",
    category: "Hosting",
    rules: {
      headers: [
        { header: "x-vercel-id", match: /.+/ },
        { header: "server", match: /vercel/i },
      ],
    },
  },
  {
    name: "AWS CloudFront",
    category: "Hosting",
    rules: {
      headers: [
        { header: "x-amz-cf-id", match: /.+/ },
        { header: "via", match: /cloudfront/i },
      ],
    },
  },
  {
    name: "Netlify",
    category: "Hosting",
    rules: {
      headers: [
        { header: "server", match: /netlify/i },
        { header: "x-nf-request-id", match: /.+/ },
      ],
    },
  },
  {
    name: "Fastly",
    category: "Hosting",
    rules: {
      headers: [
        { header: "x-served-by", match: /cache-/i },
        { header: "fastly-restarts", match: /.+/ },
      ],
    },
  },
  {
    name: "Akamai",
    category: "Hosting",
    rules: {
      headers: [
        { header: "x-akamai-transformed", match: /.+/ },
        { header: "server", match: /AkamaiGHost/i },
      ],
    },
  },
  {
    name: "Render",
    category: "Hosting",
    rules: {
      headers: [{ header: "render-srv-id", match: /.+/ }],
    },
  },
  {
    name: "Fly.io",
    category: "Hosting",
    rules: {
      headers: [{ header: "fly-request-id", match: /.+/ }],
    },
  },
];

export function detectTechnologies(
  html: string,
  headers: Record<string, string | string[] | undefined>,
  $: cheerio.CheerioAPI
): DetectedTechnology[] {
  const detected: DetectedTechnology[] = [];

  // Extract all script src attributes
  const scripts: string[] = [];
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src) scripts.push(src);
  });

  // Extract meta generators
  const metaGenerators: string[] = [];
  $("meta[name='generator' i], meta[name='Generator' i]").each((_, el) => {
    const content = $(el).attr("content");
    if (content) metaGenerators.push(content);
  });

  for (const sig of SIGNATURES) {
    let matched = false;
    let confidence = 0.5;
    let detectedFrom = "Unknown";

    // 1. Check HTTP Headers (highest confidence)
    if (sig.rules.headers) {
      for (const rule of sig.rules.headers) {
        const headerVal = headers[rule.header.toLowerCase()];
        const strVal = Array.isArray(headerVal) ? headerVal.join(" ") : headerVal || "";
        if (rule.match.test(strVal)) {
          matched = true;
          detectedFrom = `Header: ${rule.header}`;
          confidence = 0.98;
          break;
        }
      }
    }

    // 2. Check Meta Generators
    if (!matched && sig.rules.meta) {
      for (const rule of sig.rules.meta) {
        for (const gen of metaGenerators) {
          if (rule.content.test(gen)) {
            matched = true;
            detectedFrom = `Meta generator: ${gen}`;
            confidence = 0.95;
            break;
          }
        }
        if (matched) break;
      }
    }

    // 3. Check Scripts
    if (!matched && sig.rules.scripts) {
      for (const scriptRule of sig.rules.scripts) {
        for (const s of scripts) {
          if (scriptRule.test(s)) {
            matched = true;
            detectedFrom = `Script URL: ${s.slice(0, 60)}`;
            confidence = 0.9;
            break;
          }
        }
        if (matched) break;
      }
    }

    // 4. Check DOM selectors
    if (!matched && sig.rules.dom) {
      for (const selector of sig.rules.dom) {
        try {
          if ($(selector).length > 0) {
            matched = true;
            detectedFrom = `DOM selector: ${selector}`;
            confidence = 0.9;
            break;
          }
        } catch {
          // Ignore invalid selector syntax if any
        }
      }
    }

    // 5. Check HTML text regex
    if (!matched && sig.rules.html) {
      for (const htmlRule of sig.rules.html) {
        if (htmlRule.test(html)) {
          matched = true;
          detectedFrom = `HTML pattern match`;
          confidence = 0.85;
          break;
        }
      }
    }

    if (matched) {
      detected.push({
        name: sig.name,
        category: sig.category,
        confidence,
        detectedFrom,
      });
    }
  }

  return detected;
}
