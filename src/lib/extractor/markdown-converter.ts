import * as cheerio from "cheerio";

/**
 * Converts raw HTML into clean, high-signal Markdown optimized for LLM token efficiency.
 * Strips scripts, styles, navigation bars, SVG paths, cookie banners, and ad wrappers.
 */
export function convertHtmlToMarkdown(html: string): string {
  const $ = cheerio.load(html);

  // 1. Remove noise elements
  $(
    "script, style, noscript, svg, path, iframe, form, button, input, [role='dialog'], [role='alert'], .cookie, .banner, .modal, .popup"
  ).remove();

  // Remove repetitive navigation and footer elements
  $("nav, header, footer, [role='navigation'], [role='banner'], .nav, .footer, .menu").remove();

  const markdownLines: string[] = [];

  // 2. Traverse major semantic text blocks
  $("h1, h2, h3, h4, p, ul, ol, table, blockquote, pre").each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    const $el = $(el);

    if (tagName === "h1") {
      const text = $el.text().replace(/\s+/g, " ").trim();
      if (text) markdownLines.push(`\n# ${text}\n`);
    } else if (tagName === "h2") {
      const text = $el.text().replace(/\s+/g, " ").trim();
      if (text) markdownLines.push(`\n## ${text}\n`);
    } else if (tagName === "h3") {
      const text = $el.text().replace(/\s+/g, " ").trim();
      if (text) markdownLines.push(`\n### ${text}\n`);
    } else if (tagName === "h4") {
      const text = $el.text().replace(/\s+/g, " ").trim();
      if (text) markdownLines.push(`\n#### ${text}\n`);
    } else if (tagName === "p") {
      const text = $el.text().replace(/\s+/g, " ").trim();
      if (text.length > 15 && !text.toLowerCase().includes("all rights reserved")) {
        markdownLines.push(`${text}\n`);
      }
    } else if (tagName === "ul" || tagName === "ol") {
      $el.find("li").each((__, li) => {
        const itemText = $(li).text().replace(/\s+/g, " ").trim();
        if (itemText.length > 3) {
          markdownLines.push(`- ${itemText}`);
        }
      });
      markdownLines.push("");
    } else if (tagName === "blockquote") {
      const quoteText = $el.text().replace(/\s+/g, " ").trim();
      if (quoteText) markdownLines.push(`> ${quoteText}\n`);
    }
  });

  const fullMarkdown = markdownLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  // Limit to reasonable LLM context window slice (max 4,000 characters)
  return fullMarkdown.slice(0, 4000);
}
