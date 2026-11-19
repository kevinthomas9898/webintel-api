// Comprehensive automated test suite for WebIntel API
const BASE_URL = "http://localhost:3005";

async function runTests() {
  console.log("==================================================");
  console.log("   WebIntel API Comprehensive Test Suite          ");
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

  // 1. Landing Page Test
  await test("Landing Page HTML renders successfully", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const text = await res.text();
    if (!text.includes("WebIntel") || !text.includes("Playground")) {
      throw new Error("Landing page does not contain expected brand text");
    }
  });

  // 2. Real Public URL Scan Test: example.com (Basic minimal page)
  await test("POST /api/scan for minimal public website (example.com)", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });

    if (res.status !== 200) {
      const err = await res.json();
      throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    if (!data.success) throw new Error("Expected success: true");
    if (!data.website.includes("example.com")) throw new Error(`Unexpected website: ${data.website}`);
    if (data.title !== "Example Domain") throw new Error(`Unexpected title: ${data.title}`);
    if (typeof data.confidence !== "number" || data.confidence <= 0) {
      throw new Error(`Invalid confidence score: ${data.confidence}`);
    }
    if (!data.stats || typeof data.stats.responseTimeMs !== "number") {
      throw new Error("Missing response time stats");
    }
    console.log(`\n    [Verified] Title: "${data.title}", Latency: ${data.stats.responseTimeMs}ms, IP: ${data.stats.resolvedIp}`);
  });

  // 3. Real Public URL Scan Test: httpbin.org/html (Headings & content extraction)
  await test("POST /api/scan extracts H1 headings & content (httpbin.org/html)", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://httpbin.org/html" }),
    });

    if (res.status !== 200) {
      const err = await res.json();
      throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    if (!data.headings || data.headings.length === 0) {
      throw new Error("Expected at least 1 heading from httpbin.org/html");
    }
    if (!data.headings[0].includes("Moby-Dick")) {
      throw new Error(`Expected heading with Moby-Dick, got: ${data.headings[0]}`);
    }
    console.log(`\n    [Verified] Heading: "${data.headings[0]}", Content length: ${data.textContent?.length || 0} chars`);
  });

  // 4. SSRF Protection: Loopback IP (127.0.0.1)
  await test("SSRF Armor blocks 127.0.0.1 (Loopback)", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://127.0.0.1:3005" }),
    });

    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error("Expected success: false");
    if (!data.error?.code.includes("SSRF") && !data.error?.code.includes("RESTRICTED")) {
      throw new Error(`Unexpected error code: ${data.error?.code}`);
    }
  });

  // 5. SSRF Protection: Localhost
  await test("SSRF Armor blocks localhost hostname", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://localhost:3005" }),
    });

    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error("Expected success: false");
    if (data.error?.code !== "RESTRICTED_HOSTNAME") {
      throw new Error(`Expected RESTRICTED_HOSTNAME, got ${data.error?.code}`);
    }
  });

  // 6. SSRF Protection: Cloud Metadata (169.254.169.254)
  await test("SSRF Armor blocks Cloud Metadata (169.254.169.254)", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://169.254.169.254/latest/meta-data/" }),
    });

    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error("Expected success: false");
  });

  // 7. SSRF Protection: Private RFC 1918 (10.0.0.1 & 192.168.1.1)
  await test("SSRF Armor blocks Private Subnet (10.0.0.1)", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://10.0.0.1" }),
    });

    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error("Expected success: false");
  });

  await test("SSRF Armor blocks Private Subnet (192.168.1.1)", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://192.168.1.1" }),
    });

    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error("Expected success: false");
  });

  // 8. Protocol Restriction: file:// and non-http schemes
  await test("Validation blocks non-HTTP protocol (file:///etc/passwd)", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "file:///etc/passwd" }),
    });

    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error("Expected success: false");
  });

  // 9. Input Validation: Empty URL
  await test("Input Validation rejects empty URL", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "" }),
    });

    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    const data = await res.json();
    if (data.error?.code !== "VALIDATION_ERROR") {
      throw new Error(`Expected VALIDATION_ERROR, got ${data.error?.code}`);
    }
  });

  // 10. Input Validation: Invalid JSON
  await test("Input Validation handles invalid JSON payload", async () => {
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not-a-json",
    });

    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    const data = await res.json();
    if (data.error?.code !== "INVALID_JSON") {
      throw new Error(`Expected INVALID_JSON, got ${data.error?.code}`);
    }
  });

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
