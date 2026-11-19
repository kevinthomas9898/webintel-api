import { z } from "zod";

export const ScanRequestSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .max(2048, "URL is too long")
    .refine(
      (val) => {
        try {
          const u = new URL(val);
          return u.protocol === "http:" || u.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Must be a valid HTTP or HTTPS URL" }
    ),
  deepScan: z.boolean().optional().default(false),
  includeContent: z.boolean().optional().default(true),
  format: z.enum(["json", "markdown"]).optional().default("json"),
});

export type ScanRequestInput = z.infer<typeof ScanRequestSchema>;

export interface DetectedTechnology {
  name: string;
  category: "Framework" | "CMS" | "Analytics" | "Styling" | "Hosting" | "Payments" | "Customer Support" | "Security" | "Auth" | "Other";
  confidence: number;
  detectedFrom: string;
}

export interface WebIntelScanResult {
  success: boolean;
  website: string;
  companyName: string;
  description: string;
  title: string;
  headings: string[];
  headingsDetails?: {
    h1: string[];
    h2: string[];
  };
  services: string[];
  emails: string[];
  phones?: string[];
  socialLinks: Record<string, string>;
  contactPage: string | null;
  aboutPage: string | null;
  pricingPage?: string | null;
  careersPage?: string | null;
  blogPage?: string | null;
  branding?: {
    favicon?: string | null;
    ogImage?: string | null;
    themeColor?: string | null;
  };
  metadata?: {
    canonicalUrl?: string | null;
    language?: string | null;
    openGraphType?: string | null;
    twitterSite?: string | null;
  };
  technologies: string[];
  technologiesDetailed?: DetectedTechnology[];
  pagesAnalyzed: string[];
  confidence: number | null;
  inferredData: {
    companyNameIsInferred: boolean;
    servicesAreInferred: boolean;
  };
  textContent?: string;
  markdown?: string;
  stats: {
    internalLinksCount: number;
    externalLinksCount: number;
    responseTimeMs: number;
    httpStatusCode: number;
    resolvedIp: string;
    contentSizeBytes: number;
  };
  monetization?: {
    gateway: string;
    payer?: string;
    costUsd: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
