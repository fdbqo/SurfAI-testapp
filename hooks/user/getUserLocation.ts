"use client"

import { useState } from "react"
import type { UserLocation } from "@/types/user/UserLocation"

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          source: "gps",
          confidence: "high",
          updatedAt: new Date(),
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      {
        enableHighAccuracy: false, // correct for desktop
        timeout: 10000,
        maximumAge: 1000 * 60 * 60 // 1 hour cache
      }
    )
  }

  return {
    location,
    loading,
    error,
    requestLocation
  }
}
