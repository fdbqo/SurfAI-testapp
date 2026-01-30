/**
 * IP-based geolocation service
 * Resolves IP address to approximate location (city/region level)
 * Acceptable error: 20-100km
 */

export interface IPLocationResult {
  lat: number
  lon: number
}

/**
 * Resolve IP address to location using ipapi.co
 * Falls back to ip-api.com if first fails
 * Returns null on failure (does not throw)
 */
export async function resolveIpLocation(ip: string): Promise<IPLocationResult | null> {
  try {
    // Try ipapi.co first
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        "Accept": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
        }
      }
    }
  } catch (error) {
    console.warn("ipapi.co failed, trying fallback:", error)
  }

  // Fallback to ip-api.com
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,lat,lon`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data.status === "success" && data.lat && data.lon) {
        return {
          lat: parseFloat(data.lat),
          lon: parseFloat(data.lon),
        }
      }
    }
  } catch (error) {
    console.error("IP geolocation failed:", error)
  }

  return null
}
