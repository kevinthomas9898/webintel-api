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
  socialLinks: Record<string, string>;
  contactPage: string | null;
  aboutPage: string | null;
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

// Email regex that matches standard RFC-compliant addresses and filters image filenames like @2x.png
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

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

  // 3. Headings H1 & H2
  const h1Set = new Set<string>();
  $("h1").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text && text.length > 1 && text.length < 300) {
      h1Set.add(text);
    }
  });

  const h2Set = new Set<string>();
  $("h2").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text && text.length > 1 && text.length < 300) {
      h2Set.add(text);
    }
  });

  const h1 = Array.from(h1Set);
  const h2 = Array.from(h2Set);
  const allHeadings = [...h1, ...h2];

  // 4. Links & Contact / About Page Detection
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();
  let contactPage: string | null = null;
  let aboutPage: string | null = null;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    const anchorText = $(el).text().toLowerCase().trim();

    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

    try {
      const resolved = new URL(href, baseUrlStr);
      // Only keep http and https
      if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return;

      const urlString = resolved.toString();
      const pathLower = resolved.pathname.toLowerCase();

      if (resolved.origin === baseOrigin) {
        internalLinks.add(urlString);

        // Detect Contact Page
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

        // Detect About Page
        if (!aboutPage) {
          if (
            pathLower.includes("about") ||
            anchorText === "about" ||
            anchorText === "about us" ||
            anchorText === "company"
          ) {
            aboutPage = urlString;
          }
        }
      } else {
        externalLinks.add(urlString);
      }
    } catch {
      // Invalid URL syntax
    }
  });

  // 5. Social Links Extraction
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

  // 6. Public Emails Extraction
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
  // Clone body and remove noisy tags before text extraction
  const $body = cheerio.load(html);
  $body("script, style, noscript, svg, path, iframe, code, pre").remove();
  const rawBodyText = $body("body").text() || html;

  // Search standard email regex
  const matches = rawBodyText.match(EMAIL_REGEX) || [];
  for (const m of matches) {
    const cleaned = m.toLowerCase().trim();
    if (isValidEmail(cleaned)) {
      emailsSet.add(cleaned);
    }
  }

  // Search de-obfuscated patterns: e.g. "support [at] domain [dot] com" or "contact(at)company.com"
  const deobfuscatedRegex = /([a-zA-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|@)\s*([a-zA-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\.)\s*([a-zA-Z]{2,})/gi;
  let deobMatch;
  while ((deobMatch = deobfuscatedRegex.exec(rawBodyText)) !== null) {
    const emailConstructed = `${deobMatch[1]}@${deobMatch[2]}.${deobMatch[3]}`.toLowerCase();
    if (isValidEmail(emailConstructed)) {
      emailsSet.add(emailConstructed);
    }
  }

  // 7. Clean Readable Text Content (for AI agents & LLMs)
  // Remove navigation and headers if present to isolate core value proposition
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
    socialLinks,
    contactPage,
    aboutPage,
    internalLinks: Array.from(internalLinks),
    externalLinks: Array.from(externalLinks),
    cleanText,
  };
}

function isValidEmail(email: string): boolean {
  if (!email || email.length < 5 || email.length > 100) return false;
  if (COMMON_PLACEHOLDER_EMAILS.has(email)) return false;

  // Filter out false positives like file extensions ending in .png, .jpg, .webp
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
