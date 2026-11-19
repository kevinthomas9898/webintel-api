import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebIntel API | Website Intelligence for AI Agents",
  description:
    "High-speed website intelligence API designed for AI agents and LLMs. Extract tech stacks, company profiles, contacts, verified headings, and structured data with zero fabrication and enterprise SSRF defense.",
  keywords: [
    "AI Agent API",
    "Website Scanner",
    "Web Intelligence",
    "Tech Stack Detector",
    "SSRF Protected Scanner",
    "Cheerio",
    "LLM Tools",
  ],
  authors: [{ name: "WebIntel API Team" }],
  openGraph: {
    title: "WebIntel API | Website Intelligence for AI Agents",
    description: "Submit any public URL and receive structured, factual intelligence for AI agents.",
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
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
