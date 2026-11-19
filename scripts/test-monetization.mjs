// Comprehensive Automated Monetization, MCP, and Batch Test Suite
const BASE_URL = "http://localhost:3005";

async function runMonetizationTests() {
  console.log("==================================================");
  console.log("   WebIntel API Monetization & MCP Test Suite     ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`TEST: ${name} ... `);
      await fn();
      console.log("✓ PASSED");
      passed++;
    } catch (err) {
      console.log("✗ FAILED");
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  // 1. MCP Manifest Discovery
  await test("GET /api/mcp returns valid Model Context Protocol manifest", async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.name || !data.tools || !Array.isArray(data.tools)) {
      throw new Error("Invalid MCP manifest format");
    }
    if (data.tools.length < 3) {
      throw new Error(`Expected at least 3 tools, got ${data.tools.length}`);
    }
    if (data.monetization?.pricingPerCallUsd !== 0.008) {
      throw new Error(`Expected pricing $0.008, got ${data.monetization?.pricingPerCallUsd}`);
    }
    console.log(`\n    [Verified] MCP Tools: ${data.tools.map(t => t.name).join(", ")}`);
  });

  // 2. MCP JSON-RPC 2.0 tools/list
  await test("POST /api/mcp tools/list returns compliant JSON-RPC 2.0 schema", async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "mcp-test-1",
        method: "tools/list",
        params: {}
      })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.jsonrpc !== "2.0" || data.id !== "mcp-test-1") {
      throw new Error("Invalid JSON-RPC 2.0 response wrapper");
    }
    if (!data.result?.tools || data.result.tools.length < 3) {
      throw new Error("Missing or incomplete tools list in JSON-RPC result");
    }
    console.log(`\n    [Verified] Listed ${data.result.tools.length} agent tools`);
  });

  // 3. MCP JSON-RPC 2.0 tools/call for webintel_tech_detect
  await test("POST /api/mcp tools/call executes webintel_tech_detect for public URL", async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "mcp-test-2",
        method: "tools/call",
        params: {
          name: "webintel_tech_detect",
          arguments: { url: "https://example.com" }
        }
      })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.result?.content || !Array.isArray(data.result.content)) {
      throw new Error("Invalid MCP tools/call content result structure");
    }
    const parsedPayload = JSON.parse(data.result.content[0].text);
    if (!parsedPayload.website.includes("example.com")) {
      throw new Error(`Unexpected result website: ${parsedPayload.website}`);
    }
    console.log(`\n    [Verified] MCP tool executed successfully for ${parsedPayload.website}`);
  });

  // 4. Token-Optimized Markdown Output
  await test("POST /api/scan with format: 'markdown' returns clean LLM Markdown", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://httpbin.org/html",
        format: "markdown"
      })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("text/markdown")) {
      throw new Error(`Expected text/markdown content-type, got: ${contentType}`);
    }
    const markdown = await res.text();
    if (!markdown.includes("# ") || !markdown.includes("Moby-Dick")) {
      throw new Error("Markdown content does not contain expected heading");
    }
    console.log(`\n    [Verified] Clean Markdown extracted: ${markdown.length} bytes`);
  });

  // 5. Cloudflare Pay-Per-Crawl Verification Telemetry
  await test("POST /api/scan with CF-Monetization-Status verified reflects payer telemetry", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CF-Monetization-Status": "verified",
        "CF-Agent-Payer": "corp_autonomous_agent_772",
        "CF-Payment-Id": "pay_cf_edge_984321"
      },
      body: JSON.stringify({
        url: "https://example.com"
      })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.monetization?.gateway !== "Cloudflare Monetization Gateway") {
      throw new Error(`Unexpected gateway: ${data.monetization?.gateway}`);
    }
    if (data.monetization?.payer !== "corp_autonomous_agent_772") {
      throw new Error(`Expected payer corp_autonomous_agent_772, got: ${data.monetization?.payer}`);
    }
    if (data.monetization?.costUsd !== 0.008) {
      throw new Error(`Expected cost $0.008, got: ${data.monetization?.costUsd}`);
    }
    console.log(`\n    [Verified] Monetization verified for payer: ${data.monetization.payer}, Cost: $${data.monetization.costUsd}`);
  });

  // 6. Multi-URL Batch Scan
  await test("POST /api/scan/batch executes concurrent reconnaissance on multiple URLs", async () => {
    const res = await fetch(`${BASE_URL}/api/scan/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: ["https://example.com", "https://httpbin.org/html"]
      })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.batchSize !== 2 || data.processedCount !== 2) {
      throw new Error(`Expected batchSize 2 and processedCount 2, got: ${JSON.stringify(data)}`);
    }
    if (data.results.length !== 2) {
      throw new Error(`Expected 2 result items, got ${data.results.length}`);
    }
    console.log(`\n    [Verified] Batch scanned 2 URLs concurrently`);
  });

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runMonetizationTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
