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
  // Frameworks
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
    name: "Gatsby",
    category: "Framework",
    rules: {
      html: [/___gatsby/, /gatsby-image/],
      dom: ["#___gatsby"],
      meta: [{ name: "generator", content: /Gatsby/i }],
    },
  },
  {
    name: "Remix",
    category: "Framework",
    rules: {
      html: [/window\.__remixContext/],
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

  // CMS & E-Commerce
  {
    name: "WordPress",
    category: "CMS",
    rules: {
      html: [/wp-content\//, /wp-includes\//],
      meta: [{ name: "generator", content: /WordPress/i }],
      dom: ["link[href*='wp-content']", "script[src*='wp-content']"],
    },
  },
  {
    name: "Shopify",
    category: "CMS",
    rules: {
      html: [/cdn\.shopify\.com/, /Shopify\.theme/],
      scripts: [/cdn\.shopify\.com/i],
      dom: ["link[href*='cdn.shopify.com']"],
      headers: [{ header: "x-shopid", match: /.+/ }],
    },
  },
  {
    name: "Webflow",
    category: "CMS",
    rules: {
      html: [/data-wf-page/, /data-wf-site/, /assets\.webflow\.com/],
      dom: ["html[data-wf-page]", "html[data-wf-site]"],
      meta: [{ name: "generator", content: /Webflow/i }],
    },
  },
  {
    name: "Squarespace",
    category: "CMS",
    rules: {
      html: [/static1\.squarespace\.com/, /squarespace\.com/],
      headers: [{ header: "x-servedby", match: /squarespace/i }],
    },
  },
  {
    name: "Wix",
    category: "CMS",
    rules: {
      html: [/static\.wixstatic\.com/, /wix-warmup-data/],
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

  // Styling & UI Libraries
  {
    name: "Tailwind CSS",
    category: "Styling",
    rules: {
      html: [
        /class="[^"]*(?:flex|grid|hidden|relative|absolute|px-|py-|text-sm|rounded-|bg-)[^"]*"/,
        /cdn\.tailwindcss\.com/,
      ],
    },
  },
  {
    name: "Bootstrap",
    category: "Styling",
    rules: {
      html: [/bootstrap(?:\.min)?\.css/, /class="[^"]*(?:container-fluid|row|col-md-|navbar-expand)/],
      scripts: [/bootstrap(?:\.bundle)?(?:\.min)?\.js/i],
    },
  },
  {
    name: "Emotion / Styled Components",
    category: "Styling",
    rules: {
      dom: ["style[data-emotion]", "style[data-styled]"],
      html: [/data-emotion/, /data-styled/],
    },
  },

  // Analytics
  {
    name: "Google Analytics",
    category: "Analytics",
    rules: {
      scripts: [/google-analytics\.com\/analytics\.js/i, /googletagmanager\.com\/gtag\/js/i],
      html: [/gtag\(['"]config['"]/, /ga\(['"]create['"]/],
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
      scripts: [/posthog(?:\.min)?\.js/i],
      html: [/app\.posthog\.com/, /posthog\.init/],
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

  // Hosting & CDN
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
    name: "Netlify",
    category: "Hosting",
    rules: {
      headers: [
        { header: "server", match: /Netlify/i },
        { header: "x-nf-request-id", match: /.+/ },
      ],
    },
  },
  {
    name: "AWS CloudFront",
    category: "Hosting",
    rules: {
      headers: [
        { header: "via", match: /CloudFront/i },
        { header: "x-amz-cf-id", match: /.+/ },
      ],
    },
  },

  // Payments
  {
    name: "Stripe",
    category: "Payments",
    rules: {
      scripts: [/js\.stripe\.com\/v3/i],
      html: [/stripe-elements/, /Stripe\(['"]pk_/],
    },
  },
  {
    name: "PayPal",
    category: "Payments",
    rules: {
      scripts: [/paypal\.com\/sdk\/js/i],
    },
  },

  // Customer Support
  {
    name: "Intercom",
    category: "Customer Support",
    rules: {
      scripts: [/widget\.intercom\.io/i],
      html: [/window\.Intercom/],
    },
  },
  {
    name: "Crisp Chat",
    category: "Customer Support",
    rules: {
      scripts: [/client\.crisp\.chat/i],
      html: [/window\.\$crisp/],
    },
  },
  {
    name: "Zendesk",
    category: "Customer Support",
    rules: {
      scripts: [/static\.zdassets\.com/i],
      html: [/zE\(['"]webWidget/],
    },
  },
  {
    name: "HubSpot",
    category: "Customer Support",
    rules: {
      scripts: [/js\.hs-scripts\.com/i, /js\.hubspot\.com/i],
      html: [/hs-script-loader/],
    },
  },
];

export function detectTechnologies(
  $: cheerio.CheerioAPI,
  html: string,
  headers: Record<string, string | string[] | undefined> = {}
): DetectedTechnology[] {
  const detected: DetectedTechnology[] = [];
  const scripts: string[] = [];

  // Extract script srcs
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src) scripts.push(src);
  });

  // Extract meta tags
  const metaGenerators: string[] = [];
  $('meta[name="generator"], meta[name="GENERATOR"]').each((_, el) => {
    const content = $(el).attr("content");
    if (content) metaGenerators.push(content);
  });

  for (const sig of SIGNATURES) {
    let matched = false;
    let detectedFrom = "";
    let confidence = 0.85;

    // 1. Check HTTP Headers
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
          confidence = 0.8;
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
