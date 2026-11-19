import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebIntel API | Autonomous Website Intelligence for AI Agents",
  description:
    "Precision website reconnaissance and structured telemetry API designed for autonomous AI agents, LLM toolchains, and data pipelines. Features socket IP pinning and zero-fabrication extraction.",
  keywords: [
    "AI Agent API",
    "Website Scanner",
    "Web Intelligence",
    "Tech Stack Detector",
    "SSRF Protected Scanner",
    "Cheerio",
    "LLM Tools",
  ],
  authors: [{ name: "WebIntel Engineering" }],
  openGraph: {
    title: "WebIntel API | Precision Web Intelligence for AI Agents",
    description: "Surgical URL extraction and security perimeter telemetry for autonomous agents.",
    url: "https://webintel-api.dev",
    siteName: "WebIntel API",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#f7f6f2] text-[#0e1014] antialiased selection:bg-[#0e1014] selection:text-[#f7f6f2]">
        {children}
      </body>
    </html>
  );
}
