"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types/user/User"

interface IPFallbackState {
  location: User["lastLocation"] | null
  loading: boolean
  error: string | null
}

/**
 * Hook to automatically fetch IP-based fallback location
 * Only applies if fallback conditions are met (stale GPS, no location, etc.)
 */
export function useIPFallback(currentLocation: User["lastLocation"] | null): IPFallbackState {
  const [location, setLocation] = useState<User["lastLocation"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIPFallback = async () => {
      setLoading(true)
      setError(null)

      try {
        // Build query params from current location
        const params = new URLSearchParams()
        if (currentLocation) {
          params.set("lat", currentLocation.lat.toString())
          params.set("lon", currentLocation.lon.toString())
          params.set("source", currentLocation.source)
          params.set("updatedAt", currentLocation.updatedAt.toISOString())
        }

        const response = await fetch(`/api/location/fallback?${params.toString()}`)

        if (!response.ok) {
          const data = await response.json()
          // Don't treat "not needed" as an error
          if (response.status === 400 && data.reason?.includes("not available")) {
            setError(null)
            setLocation(null)
            return
          }
          throw new Error(data.error || "Failed to get IP fallback location")
        }

        const data = await response.json()

        if (data.shouldApply && data.location) {
          setLocation({
            lat: data.location.lat,
            lon: data.location.lon,
            source: data.location.source,
            confidence: data.location.confidence,
            updatedAt: new Date(data.location.updatedAt),
          })
        } else {
          setLocation(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setLocation(null)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if we don't have a fresh GPS location
    if (!currentLocation || currentLocation.source !== "gps" || currentLocation.confidence !== "high") {
      fetchIPFallback()
    }
  }, [currentLocation])

  return {
    location,
    loading,
    error,
  }
}
