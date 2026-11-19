import { safeFetch } from "./ssrf";

export interface RobotsCheckResult {
  allowed: boolean;
  reason?: string;
  robotsFound: boolean;
}

/**
 * Basic robots.txt parser and checker.
 * Checks whether the given URL path is disallowed by robots.txt for WebIntelBot or *.
 */
export async function checkRobotsPermission(targetUrlStr: string): Promise<RobotsCheckResult> {
  try {
    const targetUrl = new URL(targetUrlStr);
    const robotsUrl = `${targetUrl.protocol}//${targetUrl.host}/robots.txt`;

    let body = "";
    try {
      const res = await safeFetch(robotsUrl, {
        timeoutMs: 3000,
        maxSizeBytes: 64 * 1024, // 64 KB max
        maxRedirects: 2,
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        body = res.body;
      } else {
        // 404 or any non-2xx status means crawling is not explicitly prohibited
        return { allowed: true, robotsFound: false };
      }
    } catch {
      // If fetching robots.txt fails (e.g. timeout, connection error), fail-open (allow scan)
      return { allowed: true, robotsFound: false };
    }

    const lines = body.split(/\r?\n/);
    let currentUserAgentMatches = false;
    const disallowedPaths: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const [directive, ...valueParts] = line.split(":");
      if (!directive || valueParts.length === 0) continue;

      const key = directive.trim().toLowerCase();
      const val = valueParts.join(":").trim();

      if (key === "user-agent") {
        const agent = val.toLowerCase();
        currentUserAgentMatches = agent === "*" || agent === "webintelbot";
      } else if (currentUserAgentMatches && key === "disallow") {
        if (val) {
          disallowedPaths.push(val);
        }
      }
    }

    const currentPath = targetUrl.pathname || "/";
    for (const rule of disallowedPaths) {
      if (rule === "/" || currentPath.startsWith(rule)) {
        return {
          allowed: false,
          reason: `Path "${currentPath}" is disallowed by ${targetUrl.host}/robots.txt (Rule: Disallow: ${rule})`,
          robotsFound: true,
        };
      }
    }

    return { allowed: true, robotsFound: true };
  } catch {
    return { allowed: true, robotsFound: false };
  }
}
