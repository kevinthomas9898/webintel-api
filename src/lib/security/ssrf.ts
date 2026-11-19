import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { isForbiddenHostname, isPrivateOrReservedIP } from "./ip-checker";

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxRedirects?: number;
  maxSizeBytes?: number;
  userAgent?: string;
  headers?: Record<string, string>;
}

export interface SafeFetchResult {
  statusCode: number;
  finalUrl: string;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  contentType: string;
  resolvedIp: string;
  responseTimeMs: number;
}

export class SecurityError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code = "SECURITY_VIOLATION", statusCode = 400) {
    super(message);
    this.name = "SecurityError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_MAX_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB
const DEFAULT_USER_AGENT = "WebIntelBot/1.0 (+https://webintel-api.dev; AI website scanner)";

/**
 * Validates a URL and resolves DNS records to ensure no private/internal IPs are accessed.
 * Returns the validated URL object and the pinned safe IP.
 */
export async function validateAndResolveUrl(rawUrl: string): Promise<{ url: URL; pinnedIp: string; family: 4 | 6 }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SecurityError(`Invalid URL provided: "${rawUrl}"`, "INVALID_URL", 400);
  }

  // 1. Protocol check
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SecurityError(
      `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`,
      "PROTOCOL_NOT_ALLOWED",
      400
    );
  }

  // 2. Hostname check
  const hostname = parsed.hostname;
  if (!hostname || hostname.trim() === "") {
    throw new SecurityError("URL hostname is required.", "EMPTY_HOSTNAME", 400);
  }

  if (isForbiddenHostname(hostname)) {
    throw new SecurityError(
      `Access to internal or restricted hostname "${hostname}" is prohibited.`,
      "RESTRICTED_HOSTNAME",
      403
    );
  }

  // 3. DNS Resolution & IP validation
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new SecurityError(`DNS resolution failed for hostname "${hostname}": ${errorMsg}`, "DNS_LOOKUP_FAILED", 422);
  }

  if (!addresses || addresses.length === 0) {
    throw new SecurityError(`No IP addresses found for hostname "${hostname}".`, "DNS_NO_RECORDS", 422);
  }

  // Check EVERY resolved IP address
  for (const record of addresses) {
    if (isPrivateOrReservedIP(record.address)) {
      throw new SecurityError(
        `Hostname resolved to private or restricted IP address (${record.address}). Request blocked for SSRF protection.`,
        "SSRF_IP_BLOCKED",
        403
      );
    }
  }

  const primary = addresses[0];
  return {
    url: parsed,
    pinnedIp: primary.address,
    family: primary.family === 6 ? 6 : 4,
  };
}

/**
 * Performs an HTTP/HTTPS GET request with strict SSRF protections:
 * - DNS pre-resolution & private IP filtering
 * - Pinned IP socket lookup to prevent DNS rebinding attacks
 * - Manual redirect hops with SSRF re-evaluation on each hop
 * - Response size capping
 * - Strict timeout
 */
export async function safeFetch(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRedirects = DEFAULT_MAX_REDIRECTS,
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    userAgent = DEFAULT_USER_AGENT,
    headers: customHeaders = {},
  } = options;

  let currentUrl = targetUrl;
  let redirectsRemaining = maxRedirects;
  const startTime = Date.now();

  while (true) {
    // 1. Validate & resolve DNS for current hop
    const { url, pinnedIp, family } = await validateAndResolveUrl(currentUrl);

    // 2. Perform single HTTP request with pinned agent
    const res = await performSingleRequest({
      url,
      pinnedIp,
      family,
      timeoutMs,
      maxSizeBytes,
      userAgent,
      headers: customHeaders,
    });

    // 3. Handle redirects manually
    const isRedirect =
      res.statusCode >= 300 &&
      res.statusCode < 400 &&
      Boolean(res.headers.location);

    if (isRedirect) {
      if (redirectsRemaining <= 0) {
        throw new SecurityError("Too many redirects (exceeded limit of " + maxRedirects + ")", "TOO_MANY_REDIRECTS", 400);
      }
      redirectsRemaining--;

      const rawLocation = Array.isArray(res.headers.location)
        ? res.headers.location[0]
        : (res.headers.location as string);

      try {
        currentUrl = new URL(rawLocation, url.toString()).toString();
      } catch {
        throw new SecurityError(`Invalid redirect location header: "${rawLocation}"`, "INVALID_REDIRECT", 400);
      }

      continue; // Jump to next hop with SSRF check
    }

    const responseTimeMs = Date.now() - startTime;
    return {
      statusCode: res.statusCode,
      finalUrl: currentUrl,
      headers: res.headers,
      body: res.body,
      contentType: String(res.headers["content-type"] || "text/html"),
      resolvedIp: pinnedIp,
      responseTimeMs,
    };
  }
}

interface SingleRequestParams {
  url: URL;
  pinnedIp: string;
  family: 4 | 6;
  timeoutMs: number;
  maxSizeBytes: number;
  userAgent: string;
  headers?: Record<string, string>;
}

function performSingleRequest(params: SingleRequestParams): Promise<{
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}> {
  const { url, pinnedIp, family, timeoutMs, maxSizeBytes, userAgent, headers = {} } = params;
  const isHttps = url.protocol === "https:";

  return new Promise((resolve, reject) => {
    // Custom lookup function that returns the pinned IP
    // Handles lookup(hostname, callback) and lookup(hostname, options, callback)
    // This stops DNS Rebinding TOCTOU attacks
    const pinnedLookup = (
      _hostname: string,
      optsOrCallback: unknown,
      maybeCallback?: unknown
    ) => {
      const cb = (typeof optsOrCallback === "function" ? optsOrCallback : maybeCallback) as (
        err: Error | null,
        address: string | Array<{ address: string; family: number }>,
        family?: number
      ) => void;

      if (!cb) return;

      if (optsOrCallback && typeof optsOrCallback === "object" && (optsOrCallback as { all?: boolean }).all) {
        cb(null, [{ address: pinnedIp, family }]);
      } else {
        cb(null, pinnedIp, family);
      }
    };

    const agentOptions = {
      lookup: pinnedLookup,
      timeout: timeoutMs,
      keepAlive: false,
    };

    const requestOptions: http.RequestOptions = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port ? Number(url.port) : isHttps ? 443 : 80,
      path: `${url.pathname}${url.search}`,
      method: "GET",
      agent: isHttps ? new https.Agent(agentOptions) : new http.Agent(agentOptions),
      headers: {
        Host: url.host,
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity", // Prefer uncompressed or handle plain text cleanly
        Connection: "close",
        ...headers,
      },
    };

    if (isHttps) {
      (requestOptions as https.RequestOptions).servername = url.hostname;
    }

    const requester = isHttps ? https.request : http.request;
    let timedOut = false;

    const req = requester(requestOptions, (res) => {
      const statusCode = res.statusCode || 200;

      // Check Content-Length if present
      const contentLengthHeader = res.headers["content-length"];
      if (contentLengthHeader) {
        const length = parseInt(contentLengthHeader, 10);
        if (!isNaN(length) && length > maxSizeBytes) {
          req.destroy();
          return reject(
            new SecurityError(
              `Response size ${length} bytes exceeds maximum allowed limit of ${maxSizeBytes} bytes.`,
              "RESPONSE_TOO_LARGE",
              413
            )
          );
        }
      }

      // Check Content-Type (skip binary files if not redirect)
      const contentType = res.headers["content-type"] || "";
      const isRedirect = statusCode >= 300 && statusCode < 400;
      if (!isRedirect && contentType) {
        const isAcceptableType =
          contentType.includes("text/") ||
          contentType.includes("application/json") ||
          contentType.includes("application/xml") ||
          contentType.includes("application/xhtml+xml");

        if (!isAcceptableType && !contentType.includes("octet-stream")) {
          // Reject large media/binary streams
          req.destroy();
          return reject(
            new SecurityError(
              `Unsupported Content-Type "${contentType}". Only HTML and text documents can be scanned.`,
              "UNSUPPORTED_CONTENT_TYPE",
              415
            )
          );
        }
      }

      let receivedBytes = 0;
      const chunks: Buffer[] = [];

      res.on("data", (chunk: Buffer) => {
        receivedBytes += chunk.length;
        if (receivedBytes > maxSizeBytes) {
          req.destroy();
          return reject(
            new SecurityError(
              `Response streaming exceeded maximum size limit of ${maxSizeBytes} bytes.`,
              "RESPONSE_TOO_LARGE",
              413
            )
          );
        }
        chunks.push(chunk);
      });

      res.on("end", () => {
        const fullBody = Buffer.concat(chunks).toString("utf-8");
        resolve({
          statusCode,
          headers: res.headers,
          body: fullBody,
        });
      });

      res.on("error", (err) => {
        reject(err);
      });
    });

    req.setTimeout(timeoutMs, () => {
      timedOut = true;
      req.destroy();
      reject(new SecurityError(`Request timed out after ${timeoutMs}ms`, "REQUEST_TIMEOUT", 504));
    });

    req.on("error", (err) => {
      if (timedOut) return;
      reject(new SecurityError(`Connection error: ${err.message}`, "CONNECTION_ERROR", 502));
    });

    req.end();
  });
}
