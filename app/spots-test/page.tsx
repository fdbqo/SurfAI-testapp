"use client"

import { useUserLocation } from "@/hooks/user/getUserLocation"
import { mockUser } from "@/lib/db/mockUserClient"
import { allSpots, getNearbySpots } from "@/lib/shared/spots"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Navigation } from "lucide-react"

export default function SpotsTestPage() {
  const { location, loading, requestLocation, error } = useUserLocation()

  const center = location
    ? { lat: location.lat, lon: location.lon }
    : mockUser.lastLocation
      ? { lat: mockUser.lastLocation.lat, lon: mockUser.lastLocation.lon }
      : { lat: 54.2713, lon: -8.6017 }

  const result = getNearbySpots(allSpots, center, 20)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-mono text-muted-foreground">spots-test</div>
            <div className="text-xs text-muted-foreground">
              center: <span className="font-mono">{center.lat.toFixed(4)}, {center.lon.toFixed(4)}</span>
              {" · "}
              radius: <span className="font-mono">{result.radiusKm}km</span>
            </div>
          </div>

          <Button
            onClick={requestLocation}
            disabled={loading}
            size="sm"
            variant="outline"
            className="text-xs h-7"
          >
            {loading ? (
              <>
                <Loader2 className="size-3 animate-spin mr-1.5" />
                Getting GPS…
              </>
            ) : (
              <>
                <Navigation className="size-3 mr-1.5" />
                Use GPS
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-xs text-destructive font-mono">{error}</div>
        )}

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">Within 20km</div>
              <Badge variant="secondary" className="text-xs h-5">
                {result.within.length}
              </Badge>
            </div>
            <div className="rounded border overflow-hidden">
              <div className="max-h-[70vh] overflow-auto">
                {result.within.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground">No spots within 20km.</div>
                ) : (
                  result.within.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 border-b last:border-b-0 text-xs"
                    >
                      <div className="font-mono">{s.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono">
                          {s.distanceKm.toFixed(1)}km
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          {s.type}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">Outside 20km (testing)</div>
              <Badge variant="secondary" className="text-xs h-5">
                {result.outside.length}
              </Badge>
            </div>
            <div className="rounded border overflow-hidden">
              <div className="max-h-[70vh] overflow-auto">
                {result.outside.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 border-b last:border-b-0 text-xs"
                  >
                    <div className="font-mono">{s.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono">
                        {s.distanceKm.toFixed(1)}km
                      </span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {s.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

