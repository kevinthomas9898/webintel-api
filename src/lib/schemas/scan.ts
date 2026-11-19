import { z } from "zod";

export const ScanRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, { message: "URL cannot be empty" })
    .max(2048, { message: "URL exceeds maximum length of 2048 characters" })
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "URL must be a valid HTTP or HTTPS address (e.g. https://example.com)",
      }
    ),
  deepScan: z.boolean().optional().default(false),
  includeContent: z.boolean().optional().default(true),
  format: z.enum(["json", "markdown"]).optional().default("json"),
});

export type ScanRequestInput = z.infer<typeof ScanRequestSchema>;

export interface DetectedTechnology {
  name: string;
  category: "Framework" | "CMS" | "Analytics" | "Styling" | "Hosting" | "Payments" | "Customer Support" | "Security" | "Other";
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
  socialLinks: Record<string, string>;
  contactPage: string | null;
  aboutPage: string | null;
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
