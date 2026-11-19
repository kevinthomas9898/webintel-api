import * as cheerio from "cheerio";
import { URL } from "node:url";

export interface BusinessIntel {
  companyName: string;
  companyNameIsInferred: boolean;
  services: string[];
  servicesAreInferred: boolean;
  jsonLdFound: boolean;
  confidence: number;
}

export function extractBusinessIntel(
  html: string,
  urlStr: string,
  title: string,
  description: string,
  headings: string[]
): BusinessIntel {
  const $ = cheerio.load(html);
  const parsedUrl = new URL(urlStr);

  let detectedCompanyName = "";
  let companyNameIsInferred = false;
  let jsonLdFound = false;
  const jsonLdServices: string[] = [];

  // 1. Check Schema.org JSON-LD scripts
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).text();
      if (!content) return;
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (!item || typeof item !== "object") continue;

        // Extract organization or business name
        const type = String(item["@type"] || "");
        if (
          type.includes("Organization") ||
          type.includes("Corporation") ||
          type.includes("LocalBusiness") ||
          type.includes("SoftwareApplication") ||
          type.includes("Company")
        ) {
          jsonLdFound = true;
          if (item.name && typeof item.name === "string" && !detectedCompanyName) {
            detectedCompanyName = item.name.trim();
          }
          if (item.serviceType) {
            if (Array.isArray(item.serviceType)) {
              jsonLdServices.push(...item.serviceType.map(String));
            } else {
              jsonLdServices.push(String(item.serviceType));
            }
          }
        }
      }
    } catch {
      // Invalid JSON-LD block, skip
    }
  });

  // 2. OpenGraph Site Name
  if (!detectedCompanyName) {
    const ogSiteName = $('meta[property="og:site_name"]').attr("content")?.trim();
    if (ogSiteName && ogSiteName.length > 1 && ogSiteName.length < 60) {
      detectedCompanyName = ogSiteName;
      companyNameIsInferred = false;
    }
  }

  // 3. Fallback: Parse from Title (Inferred)
  if (!detectedCompanyName && title) {
    // Examples: "Stripe | Financial Infrastructure" or "GitHub: Where the world builds" or "Slack is your productivity platform"
    const separators = [" | ", " - ", " – ", " — ", " : ", " • "];
    for (const sep of separators) {
      if (title.includes(sep)) {
        const parts = title.split(sep);
        // Usually company name is the first part or the last part
        const first = parts[0].trim();
        const last = parts[parts.length - 1].trim();

        if (first.length > 1 && first.length < 35 && !first.toLowerCase().startsWith("welcome")) {
          detectedCompanyName = first;
          companyNameIsInferred = true;
          break;
        } else if (last.length > 1 && last.length < 35) {
          detectedCompanyName = last;
          companyNameIsInferred = true;
          break;
        }
      }
    }
  }

  // 4. Fallback: Domain name brand derivation
  if (!detectedCompanyName) {
    const host = parsedUrl.hostname.replace(/^www\./, "");
    const parts = host.split(".");
    if (parts.length >= 2) {
      const brand = parts[0];
      // Capitalize first letter
      detectedCompanyName = brand.charAt(0).toUpperCase() + brand.slice(1);
      companyNameIsInferred = true;
    } else {
      detectedCompanyName = host;
      companyNameIsInferred = true;
    }
  }

  // 5. Products / Services Keywords Extraction
  const servicesSet = new Set<string>();

  // Add JSON-LD services
  for (const s of jsonLdServices) {
    if (s.trim().length > 2) servicesSet.add(s.trim());
  }

  // Extract from meta keywords if present
  const metaKeywords = $('meta[name="keywords"]').attr("content");
  if (metaKeywords) {
    const kw = metaKeywords.split(",").map((k) => k.trim());
    for (const k of kw) {
      if (k.length > 2 && k.length < 50 && servicesSet.size < 12) {
        servicesSet.add(k);
      }
    }
  }

  // Extract key service keywords from headings if sparse
  const servicesAreInferred = jsonLdServices.length === 0;
  if (servicesSet.size < 4 && headings.length > 0) {
    for (const heading of headings) {
      if (servicesSet.size >= 8) break;
      // Headings that look like features/services
      const cleanH = heading.trim();
      if (
        cleanH.length > 4 &&
        cleanH.length < 50 &&
        !cleanH.toLowerCase().includes("copyright") &&
        !cleanH.toLowerCase().includes("cookie") &&
        !cleanH.toLowerCase().includes("sign in") &&
        !cleanH.toLowerCase().includes("get started")
      ) {
        servicesSet.add(cleanH);
      }
    }
  }

  // 6. Compute Confidence Metric (0.0 to 1.0)
  let confidenceScore = 0.3; // base score for successful fetch

  if (title && title.length > 3) confidenceScore += 0.15;
  if (description && description.length > 10) confidenceScore += 0.15;
  if (headings.length > 0) confidenceScore += 0.15;
  if (jsonLdFound) confidenceScore += 0.15;
  if (!companyNameIsInferred) confidenceScore += 0.1;

  const confidence = Math.min(0.99, Math.round(confidenceScore * 100) / 100);

  return {
    companyName: detectedCompanyName,
    companyNameIsInferred,
    services: Array.from(servicesSet).slice(0, 10),
    servicesAreInferred,
    jsonLdFound,
    confidence,
  };
}
