import * as cheerio from "cheerio";
import { URL } from "node:url";

export interface ParsedHtmlData {
  title: string;
  description: string;
  headings: {
    h1: string[];
    h2: string[];
    all: string[];
  };
  emails: string[];
  phones: string[];
  socialLinks: Record<string, string>;
  contactPage: string | null;
  aboutPage: string | null;
  pricingPage: string | null;
  careersPage: string | null;
  blogPage: string | null;
  branding: {
    favicon: string | null;
    ogImage: string | null;
    themeColor: string | null;
  };
  metadata: {
    canonicalUrl: string | null;
    language: string | null;
    openGraphType: string | null;
    twitterSite: string | null;
  };
  internalLinks: string[];
  externalLinks: string[];
  cleanText: string;
}

const COMMON_PLACEHOLDER_EMAILS = new Set([
  "example@example.com",
  "user@example.com",
  "name@example.com",
  "email@example.com",
  "your@email.com",
  "test@test.com",
  "admin@example.com",
  "info@example.com",
  "sentry@sentry.io",
  "john.doe@example.com",
]);

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const JUNK_HEADING_PATTERNS = [
  /^navigation\s*(menu)?$/i,
  /^site-wide\s*links$/i,
  /^footer\s*(links)?$/i,
  /^search$/i,
  /^menu$/i,
  /^cookie\s*(policy|notice|banner)?$/i,
  /^skip\s*to\s*content$/i,
  /^table\s*of\s*contents$/i,
];

export function parseHtml(html: string, baseUrlStr: string): ParsedHtmlData {
  const $ = cheerio.load(html);
  const baseOrigin = new URL(baseUrlStr).origin;

  // 1. Title Extraction
  const pageTitle =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $('meta[name="twitter:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    "";

  // 2. Meta Description Extraction
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    $('meta[name="twitter:description"]').attr("content")?.trim() ||
    "";

  // 3. Branding (Favicon, OG Image, Theme Color)
  let favicon: string | null = null;
  const rawFavicon =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"]').attr("href");
  if (rawFavicon) {
    try {
      favicon = new URL(rawFavicon, baseUrlStr).toString();
    } catch {
      favicon = null;
    }
  }

  let ogImage: string | null = null;
  const rawOgImage =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content");
  if (rawOgImage) {
    try {
      ogImage = new URL(rawOgImage, baseUrlStr).toString();
    } catch {
      ogImage = rawOgImage;
    }
  }

  const themeColor = $('meta[name="theme-color"]').attr("content")?.trim() || null;

  // 4. Metadata
  let canonicalUrl: string | null = null;
  const rawCanonical = $('link[rel="canonical"]').attr("href");
  if (rawCanonical) {
    try {
      canonicalUrl = new URL(rawCanonical, baseUrlStr).toString();
    } catch {
      canonicalUrl = null;
    }
  }

  const language =
    $("html").attr("lang")?.trim() ||
    $('meta[http-equiv="content-language"]').attr("content")?.trim() ||
    null;

  const openGraphType = $('meta[property="og:type"]').attr("content")?.trim() || null;
  const twitterSite = $('meta[name="twitter:site"]').attr("content")?.trim() || null;

  // 5. Clean Headings H1 & H2 (filter hidden/sr-only and navigation boilerplates)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isJunkHeading = (text: string, el: any) => {
    if (!text || text.length < 2 || text.length > 250) return true;
    const classes = $(el).attr("class") || "";
    if (classes.includes("sr-only") || classes.includes("visually-hidden")) return true;
    if ($(el).attr("aria-hidden") === "true") return true;
    return JUNK_HEADING_PATTERNS.some((p) => p.test(text));
  };

  const h1Set = new Set<string>();
  $("h1").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!isJunkHeading(text, el)) {
      h1Set.add(text);
    }
  });

  const h2Set = new Set<string>();
  $("h2").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!isJunkHeading(text, el)) {
      h2Set.add(text);
    }
  });

  const h1 = Array.from(h1Set);
  const h2 = Array.from(h2Set);
  const allHeadings = [...h1, ...h2];

  // 6. Navigation Pages Discovery & Links
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();
  let contactPage: string | null = null;
  let aboutPage: string | null = null;
  let pricingPage: string | null = null;
  let careersPage: string | null = null;
  let blogPage: string | null = null;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    const anchorText = $(el).text().toLowerCase().trim();

    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

    try {
      const resolved = new URL(href, baseUrlStr);
      if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return;

      const urlString = resolved.toString();
      const pathLower = resolved.pathname.toLowerCase();

      if (resolved.origin === baseOrigin) {
        internalLinks.add(urlString);

        // Contact Page
        if (!contactPage) {
          if (
            pathLower.includes("contact") ||
            anchorText === "contact" ||
            anchorText === "contact us" ||
            anchorText === "get in touch"
          ) {
            contactPage = urlString;
          }
        }

        // About Page
        if (!aboutPage) {
          if (
            pathLower.includes("about") ||
            anchorText === "about" ||
            anchorText === "about us" ||
            anchorText === "our company"
          ) {
            aboutPage = urlString;
          }
        }

        // Pricing Page
        if (!pricingPage) {
          if (
            pathLower.includes("pricing") ||
            pathLower.includes("plans") ||
            anchorText === "pricing" ||
            anchorText === "plans"
          ) {
            pricingPage = urlString;
          }
        }

        // Careers Page
        if (!careersPage) {
          if (
            pathLower.includes("careers") ||
            pathLower.includes("jobs") ||
            anchorText === "careers" ||
            anchorText === "join us" ||
            anchorText === "we are hiring"
          ) {
            careersPage = urlString;
          }
        }

        // Blog Page
        if (!blogPage) {
          if (
            pathLower.includes("blog") ||
            pathLower.includes("articles") ||
            anchorText === "blog" ||
            anchorText === "resources"
          ) {
            blogPage = urlString;
          }
        }
      } else {
        externalLinks.add(urlString);
      }
    } catch {
      // Invalid URL syntax
    }
  });

  // 7. Social Links Extraction
  const socialLinks: Record<string, string> = {};
  for (const ext of externalLinks) {
    try {
      const u = new URL(ext);
      const host = u.hostname.toLowerCase();
      const pathname = u.pathname;

      if ((host.includes("twitter.com") || host.includes("x.com")) && pathname.length > 1 && !pathname.startsWith("/share")) {
        socialLinks.twitter = ext;
      } else if (host.includes("linkedin.com") && (pathname.includes("/company/") || pathname.includes("/in/"))) {
        socialLinks.linkedin = ext;
      } else if (host.includes("github.com") && pathname.length > 1 && !pathname.startsWith("/topics") && !pathname.startsWith("/features")) {
        socialLinks.github = ext;
      } else if (host.includes("youtube.com") && (pathname.includes("/@") || pathname.includes("/channel/") || pathname.includes("/c/"))) {
        socialLinks.youtube = ext;
      } else if (host.includes("facebook.com") && pathname.length > 1 && !pathname.includes("sharer")) {
        socialLinks.facebook = ext;
      } else if (host.includes("instagram.com") && pathname.length > 1) {
        socialLinks.instagram = ext;
      } else if (host.includes("discord.gg") || (host.includes("discord.com") && pathname.includes("/invite/"))) {
        socialLinks.discord = ext;
      }
    } catch {
      // Ignore
    }
  }

  // 8. Public Emails Extraction
  const emailsSet = new Set<string>();

  // a) mailto: links
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const cleanMail = href.replace(/^mailto:/i, "").split("?")[0].trim().toLowerCase();
    if (cleanMail && isValidEmail(cleanMail)) {
      emailsSet.add(cleanMail);
    }
  });

  // b) Text scanning with regex & de-obfuscation
  const $body = cheerio.load(html);
  $body("script, style, noscript, svg, path, iframe, code, pre").remove();
  const rawBodyText = $body("body").text() || html;

  const matches = rawBodyText.match(EMAIL_REGEX) || [];
  for (const m of matches) {
    const cleaned = m.toLowerCase().trim();
    if (isValidEmail(cleaned)) {
      emailsSet.add(cleaned);
    }
  }

  const deobfuscatedRegex = /([a-zA-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|@)\s*([a-zA-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\.)\s*([a-zA-Z]{2,})/gi;
  let deobMatch;
  while ((deobMatch = deobfuscatedRegex.exec(rawBodyText)) !== null) {
    const emailConstructed = `${deobMatch[1]}@${deobMatch[2]}.${deobMatch[3]}`.toLowerCase();
    if (isValidEmail(emailConstructed)) {
      emailsSet.add(emailConstructed);
    }
  }

  // 9. Phone Numbers Extraction
  const phonesSet = new Set<string>();
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const cleanTel = href.replace(/^tel:/i, "").split("?")[0].trim();
    if (cleanTel.length >= 7) {
      phonesSet.add(cleanTel);
    }
  });

  const PHONE_REGEX = /(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g;
  let phoneMatch;
  while ((phoneMatch = PHONE_REGEX.exec(rawBodyText)) !== null) {
    const found = phoneMatch[0].trim();
    if (found.length >= 10 && found.length <= 16 && !found.startsWith("000")) {
      phonesSet.add(found);
    }
  }

  // 10. Clean Readable Text Content (for AI agents & LLMs)
  $body("nav, header, footer, [role='navigation'], [role='banner'], .nav, .footer, .menu").remove();
  const cleanParagraphs: string[] = [];
  $body("h1, h2, h3, p, li, blockquote").each((_, el) => {
    const t = $body(el).text().replace(/\s+/g, " ").trim();
    if (t.length > 20 && !t.includes("cookie") && !t.includes("All rights reserved")) {
      cleanParagraphs.push(t);
    }
  });

  const cleanText = cleanParagraphs.slice(0, 30).join("\n\n");

  return {
    title: pageTitle,
    description: metaDescription,
    headings: {
      h1,
      h2,
      all: allHeadings,
    },
    emails: Array.from(emailsSet),
    phones: Array.from(phonesSet).slice(0, 5),
    socialLinks,
    contactPage,
    aboutPage,
    pricingPage,
    careersPage,
    blogPage,
    branding: {
      favicon,
      ogImage,
      themeColor,
    },
    metadata: {
      canonicalUrl,
      language,
      openGraphType,
      twitterSite,
    },
    internalLinks: Array.from(internalLinks),
    externalLinks: Array.from(externalLinks),
    cleanText,
  };
}

function isValidEmail(email: string): boolean {
  if (!email || email.length < 5 || email.length > 100) return false;
  if (COMMON_PLACEHOLDER_EMAILS.has(email)) return false;

  const lower = email.toLowerCase();
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".svg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".js") ||
    lower.endsWith(".css")
  ) {
    return false;
  }

  return true;
}
