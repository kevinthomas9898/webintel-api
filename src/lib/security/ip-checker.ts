import net from "node:net";

/**
 * Checks whether an IP address is considered private, reserved, loopback,
 * link-local, multicast, or otherwise unsafe for public scanning (SSRF guard).
 */

function ipV4ToNumber(ip: string): number {
  const parts = ip.split(".").map((part) => parseInt(part, 10));
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error("Invalid IPv4 address format");
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function inSubnetV4(ipNum: number, subnet: string, maskBits: number): boolean {
  const subnetNum = ipV4ToNumber(subnet);
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
  return (ipNum & mask) === (subnetNum & mask);
}

/**
 * Validates an IPv4 address against blocked ranges.
 * Returns true if the IP is private/reserved/unsafe.
 */
export function isPrivateOrReservedIPv4(ip: string): boolean {
  try {
    const num = ipV4ToNumber(ip);

    // 0.0.0.0/8 (Current network)
    if (inSubnetV4(num, "0.0.0.0", 8)) return true;
    // 10.0.0.0/8 (Private-Use)
    if (inSubnetV4(num, "10.0.0.0", 8)) return true;
    // 100.64.0.0/10 (Shared Address Space / Carrier-grade NAT)
    if (inSubnetV4(num, "100.64.0.0", 10)) return true;
    // 127.0.0.0/8 (Loopback)
    if (inSubnetV4(num, "127.0.0.0", 8)) return true;
    // 169.254.0.0/16 (Link Local & AWS/GCP/Azure Cloud Metadata 169.254.169.254)
    if (inSubnetV4(num, "169.254.0.0", 16)) return true;
    // 172.16.0.0/12 (Private-Use)
    if (inSubnetV4(num, "172.16.0.0", 12)) return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (inSubnetV4(num, "192.0.0.0", 24)) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    if (inSubnetV4(num, "192.0.2.0", 24)) return true;
    // 192.88.99.0/24 (6to4 Relay Anycast)
    if (inSubnetV4(num, "192.88.99.0", 24)) return true;
    // 192.168.0.0/16 (Private-Use)
    if (inSubnetV4(num, "192.168.0.0", 16)) return true;
    // 198.18.0.0/15 (Network Benchmark Tests)
    if (inSubnetV4(num, "198.18.0.0", 15)) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (inSubnetV4(num, "198.51.100.0", 24)) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (inSubnetV4(num, "203.0.113.0", 24)) return true;
    // 224.0.0.0/4 (Multicast)
    if (inSubnetV4(num, "224.0.0.0", 4)) return true;
    // 240.0.0.0/4 (Reserved for Future Use)
    if (inSubnetV4(num, "240.0.0.0", 4)) return true;
    // 255.255.255.255/32 (Broadcast)
    if (num === 0xffffffff) return true;

    return false;
  } catch {
    return true; // Reject if parsing fails
  }
}

/**
 * Validates an IPv6 address against blocked ranges.
 * Returns true if the IP is private/reserved/unsafe.
 */
export function isPrivateOrReservedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  // ::1 (Loopback)
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
  // :: (Unspecified)
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;

  // IPv4-mapped IPv6 address (::ffff:x.x.x.x or ::ffff:a00:1)
  if (normalized.startsWith("::ffff:") || normalized.includes(":ffff:")) {
    const parts = normalized.split(":");
    const lastPart = parts[parts.length - 1];
    if (net.isIPv4(lastPart)) {
      return isPrivateOrReservedIPv4(lastPart);
    }
    // Also handle hex IPv4-mapped
    return true;
  }

  // IPv4-compatible IPv6 (::x.x.x.x)
  if (normalized.startsWith("::") && normalized.indexOf(":", 2) === -1) {
    const potentialV4 = normalized.substring(2);
    if (net.isIPv4(potentialV4)) {
      return isPrivateOrReservedIPv4(potentialV4);
    }
  }

  // fe80::/10 (Link-Local)
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }

  // fc00::/7 (Unique Local Address - ULA)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }

  // ff00::/8 (Multicast)
  if (normalized.startsWith("ff")) {
    return true;
  }

  // 2001:db8::/32 (Documentation)
  if (normalized.startsWith("2001:db8") || normalized.startsWith("2001:0db8")) {
    return true;
  }

  // 100::/64 (Discard-Only)
  if (normalized.startsWith("100:")) {
    return true;
  }

  return false;
}

/**
 * Master check for an IP address (IPv4 or IPv6).
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) {
    return isPrivateOrReservedIPv4(ip);
  }
  if (version === 6) {
    return isPrivateOrReservedIPv6(ip);
  }
  // Not a valid IP format
  return true;
}

/**
 * Blacklisted internal hostnames and cloud metadata domains.
 */
const FORBIDDEN_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "local",
  "broadcasthost",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "169.254.169.254",
  "fd00:ec2::254",
]);

export function isForbiddenHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();

  if (FORBIDDEN_HOSTNAMES.has(lower)) {
    return true;
  }

  // Reject internal TLDs and suffix matches
  if (
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".corp") ||
    lower.endsWith(".home") ||
    lower.endsWith(".lan") ||
    lower.endsWith(".intranet") ||
    lower.endsWith(".onion")
  ) {
    return true;
  }

  return false;
}
