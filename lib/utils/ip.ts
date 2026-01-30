import { headers } from "next/headers"

/**
 * Extract client IP from Next.js request headers
 * Handles proxies, CDNs, and load balancers
 */
export function getClientIp(): string | null {
  const h = headers()

  const forwardedFor = h.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  return h.get("x-real-ip")
}

/**
 * Check if IP should be ignored (local/dev IPs)
 */
export function shouldIgnoreIp(ip: string | null): boolean {
  if (!ip) return true
  
  const ignored = ["127.0.0.1", "::1", "localhost"]
  return ignored.includes(ip)
}
