"use client"

import { useState } from "react"
import { useUserLocation } from "@/hooks/user/getUserLocation"
import { useIPFallback } from "@/hooks/user/useIPFallback"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, Loader2, AlertCircle, Waves, FlaskConical, Wrench, ChevronDown, ChevronRight } from "lucide-react"
import { mockUser, mockUsers, getMockUser } from "@/lib/db/mockUserClient"
import { allSpots, getNearbySpots } from "@/lib/shared/spots"
import type { User } from "@/types/user/User"
import type { SurfNotifyDecision } from "@/types/agent/SurfNotifyDecision"
import type { AgentTraceStep } from "@/types/agent/AgentTrace"

export default function HomePage() {
  const { location: gpsLocation, loading: gpsLoading, error: gpsError, requestLocation } = useUserLocation()
  const [agentLoading, setAgentLoading] = useState(false)
  const [agentResult, setAgentResult] = useState<SurfNotifyDecision | null>(null)
  const [agentTrace, setAgentTrace] = useState<AgentTraceStep[]>([])
  const [agentError, setAgentError] = useState<string | null>(null)
  const [agentUserId, setAgentUserId] = useState(mockUser.id)
  const [toolDebugTool, setToolDebugTool] = useState("get_surf_conditions")
  const [toolDebugArgs, setToolDebugArgs] = useState('{ "spotId": "5842041f4e65fad6a7708c3c" }')
  const [toolDebugUserId, setToolDebugUserId] = useState(mockUser.id)
  const [toolDebugLoading, setToolDebugLoading] = useState(false)
  const [toolDebugResult, setToolDebugResult] = useState<{ result?: string; parsed?: unknown; error?: string } | null>(null)
  const [spotsExpandedId, setSpotsExpandedId] = useState<string | null>(null)
  const [spotsConditionsCache, setSpotsConditionsCache] = useState<Record<string, { conditions?: Record<string, unknown>; error?: string }>>({})
  const [spotsConditionsLoading, setSpotsConditionsLoading] = useState<string | null>(null)

  const currentLocation: User["lastLocation"] | null = gpsLocation
    ? {
        lat: gpsLocation.lat,
        lon: gpsLocation.lon,
        source: gpsLocation.source,
        confidence: gpsLocation.confidence || "high",
        updatedAt: gpsLocation.updatedAt || new Date(),
      }
    : mockUser.lastLocation || null

  const { location: ipFallbackLocation, loading: ipLoading } = useIPFallback(currentLocation)

  const userLocation = currentLocation
    ? { lat: currentLocation.lat, lon: currentLocation.lon, source: currentLocation.source, confidence: currentLocation.confidence }
    : ipFallbackLocation
    ? { lat: ipFallbackLocation.lat, lon: ipFallbackLocation.lon, source: ipFallbackLocation.source, confidence: ipFallbackLocation.confidence }
    : mockUser.lastLocation
    ? { lat: mockUser.lastLocation.lat, lon: mockUser.lastLocation.lon, source: mockUser.lastLocation.source, confidence: mockUser.lastLocation.confidence }
    : { lat: 54.2713, lon: -8.6017, source: "gps" as const, confidence: "high" as const }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Top-left header */}
        <div className="absolute top-0 left-0 p-3 z-10">
          <h1 className="text-xs font-mono text-muted-foreground">surf-ai-engine</h1>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col pt-12">
          {/* Tabs */}
          <Tabs defaultValue="location" className="flex-1 flex flex-col">
            <div className="px-4 border-b">
              <TabsList className="h-8 bg-transparent p-0">
                <TabsTrigger value="location" className="text-xs px-3 h-7 data-[state=active]:bg-muted">
                  Location
                </TabsTrigger>
                <TabsTrigger value="user" className="text-xs px-3 h-7 data-[state=active]:bg-muted">
                  User
                </TabsTrigger>
                <TabsTrigger value="spots" className="text-xs px-3 h-7 data-[state=active]:bg-muted">
                  Spots
                </TabsTrigger>
                <TabsTrigger value="spots-test" className="text-xs px-3 h-7 data-[state=active]:bg-muted">
                  Spots Test
                </TabsTrigger>
                <TabsTrigger value="conditions" className="text-xs px-3 h-7 data-[state=active]:bg-muted">
                  Conditions
                </TabsTrigger>
                <TabsTrigger value="testing" className="text-xs px-3 h-7 data-[state=active]:bg-muted">
                  Testing
                </TabsTrigger>
                <TabsTrigger value="tools" className="text-xs px-3 h-7 data-[state=active]:bg-muted">
                  Tools
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Location Tab */}
            <TabsContent value="location" className="flex-1 overflow-auto p-4 space-y-3">
              {!gpsLocation && (
                <div className="space-y-2">
                  <Button
                    onClick={requestLocation}
                    disabled={gpsLoading}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                  >
                    {gpsLoading ? (
                      <>
                        <Loader2 className="size-3 animate-spin mr-1.5" />
                        Getting location...
                      </>
                    ) : (
                      <>
                        <Navigation className="size-3 mr-1.5" />
                        Get GPS Location
                      </>
                    )}
                  </Button>
                </div>
              )}

              {gpsError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="size-3" />
                  <AlertTitle className="text-xs">GPS Error</AlertTitle>
                  <AlertDescription className="text-xs">{gpsError}</AlertDescription>
                </Alert>
              )}

              {ipLoading && (
                <div className="text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin inline mr-1.5" />
                  Checking IP fallback...
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Coordinates</div>
                  <div className="font-mono text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">lat:</span>
                      <span>{userLocation.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">lon:</span>
                      <span>{userLocation.lon.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Source</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs h-5">
                      {userLocation.source === "gps" ? "GPS" : userLocation.source === "ip" ? "IP" : "Manual"}
                    </Badge>
                    {userLocation.confidence && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {userLocation.confidence}
                      </Badge>
                    )}
                  </div>
                  {ipFallbackLocation && !currentLocation && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Using IP fallback location
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* User Tab */}
            <TabsContent value="user" className="flex-1 overflow-auto p-4 space-y-3">
              <div className="space-y-2 mb-3">
                <label className="text-xs text-muted-foreground block">View user</label>
                <select
                  value={agentUserId}
                  onChange={(e) => setAgentUserId(e.target.value)}
                  className="rounded border border-input bg-background px-2 py-1.5 text-xs font-mono"
                >
                  {mockUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id} ({u.skill})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                {(() => {
                  const u = getMockUser(agentUserId) ?? mockUser
                  return (
                    <>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1.5">ID</div>
                        <div className="font-mono text-xs">{u.id}</div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1.5">Skill</div>
                        <Badge variant="outline" className="text-xs h-5">
                          {u.skill}
                        </Badge>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1.5">Preferences</div>
                        <div className="font-mono text-xs space-y-1">
                          <div>
                            <span className="text-muted-foreground">maxComfortableWave:</span>{" "}
                            <span>{u.preferences.maxComfortableWave}m</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">riskTolerance:</span>{" "}
                            <Badge variant="outline" className="text-xs h-4 ml-1">
                              {u.preferences.riskTolerance}
                            </Badge>
                          </div>
                          {u.preferences.avoidReefs !== undefined && (
                            <div>
                              <span className="text-muted-foreground">avoidReefs:</span>{" "}
                              <span>{u.preferences.avoidReefs ? "true" : "false"}</span>
                            </div>
                          )}
                          {u.preferences.notifyStrictness && (
                            <div>
                              <span className="text-muted-foreground">notifyStrictness:</span>{" "}
                              <span>{u.preferences.notifyStrictness}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1.5">Notifications</div>
                        <div className="font-mono text-xs">
                          enabled: {u.notificationSettings.enabled ? "true" : "false"}
                        </div>
                      </div>
                      <Separator />
                      {u.lastLocation && (
                        <>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1.5">Last Location</div>
                            <div className="font-mono text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">lat:</span>
                                <span>{u.lastLocation.lat.toFixed(4)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">lon:</span>
                                <span>{u.lastLocation.lon.toFixed(4)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">source:</span>
                                <Badge variant="outline" className="text-xs h-4">
                                  {u.lastLocation.source}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">updatedAt:</span>
                                <span>{u.lastLocation.updatedAt.toISOString()}</span>
                              </div>
                            </div>
                          </div>
                          <Separator />
                        </>
                      )}
                      {u.homeRegion && (
                        <>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1.5">Home Region</div>
                            <div className="font-mono text-xs">{u.homeRegion}</div>
                          </div>
                          <Separator />
                        </>
                      )}
                      {u.usualRegions && u.usualRegions.length > 0 && (
                        <>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1.5">Usual Regions</div>
                            <div className="font-mono text-xs space-y-0.5">
                              {u.usualRegions.map((region) => (
                                <div key={region}>{region}</div>
                              ))}
                            </div>
                          </div>
                          <Separator />
                        </>
                      )}
                      <div>
                        <div className="text-xs text-muted-foreground mb-1.5">Timestamps</div>
                        <div className="font-mono text-xs space-y-1">
                          <div>
                            <span className="text-muted-foreground">createdAt:</span>{" "}
                            <span>{u.createdAt.toISOString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">updatedAt:</span>{" "}
                            <span>{u.updatedAt.toISOString()}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </TabsContent>

            {/* Surf Spots Tab */}
            <TabsContent value="spots" className="flex-1 overflow-auto p-4 space-y-4">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  All Spots ({allSpots.length}) — expand a row to view latest conditions
                </div>
                <div className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {allSpots.map((spot) => {
                    const isExpanded = spotsExpandedId === spot.id
                    const cached = spotsConditionsCache[spot.id]
                    const loading = spotsConditionsLoading === spot.id
                    const fetchConditions = async () => {
                      if (cached || loading) return
                      setSpotsConditionsLoading(spot.id)
                      try {
                        const res = await fetch(
                          `/api/debug/tool?tool=get_surf_conditions&spotId=${encodeURIComponent(spot.id)}`
                        )
                        const data = await res.json()
                        if (data.parsed && typeof data.parsed === "object") {
                          if ("error" in data.parsed) {
                            setSpotsConditionsCache((prev) => ({ ...prev, [spot.id]: { error: String(data.parsed.error) } }))
                          } else {
                            setSpotsConditionsCache((prev) => ({ ...prev, [spot.id]: { conditions: data.parsed as Record<string, unknown> } }))
                          }
                        } else {
                          setSpotsConditionsCache((prev) => ({ ...prev, [spot.id]: { error: data.error ?? "Failed to load" } }))
                        }
                      } catch {
                        setSpotsConditionsCache((prev) => ({ ...prev, [spot.id]: { error: "Request failed" } }))
                      } finally {
                        setSpotsConditionsLoading(null)
                      }
                    }
                    return (
                      <div key={spot.id} className="rounded border border-transparent hover:border-border/50">
                        <button
                          type="button"
                          onClick={() => {
                            setSpotsExpandedId(isExpanded ? null : spot.id)
                            if (!isExpanded && !cached && !loading) fetchConditions()
                          }}
                          className="flex w-full items-center justify-between p-1.5 text-left text-xs hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-1.5">
                            {isExpanded ? (
                              <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="font-mono">{spot.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-[10px]">{spot.county}</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {spot.type}
                            </Badge>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="border-t bg-muted/20 px-2 py-2 text-xs">
                            {loading && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Loader2 className="size-3 animate-spin" />
                                Loading conditions…
                              </div>
                            )}
                            {!loading && cached?.error && (
                              <div className="text-destructive">{cached.error}</div>
                            )}
                            {!loading && cached?.conditions && (
                              <div className="font-mono space-y-0.5 text-[10px]">
                                <div>waveHeight: {String(cached.conditions.waveHeight ?? "—")} m</div>
                                <div>swellPeriod: {String(cached.conditions.swellPeriod ?? "—")} s</div>
                                <div>windSpeed10m: {String(cached.conditions.windSpeed10m ?? "—")} km/h</div>
                                <div>windDirection: {String(cached.conditions.windDirection ?? "—")}°</div>
                                {cached.conditions.localTime != null && (
                                  <div className="text-muted-foreground pt-0.5">
                                    at {String(cached.conditions.localTime)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Spots Test Tab */}
            <TabsContent value="spots-test" className="flex-1 overflow-auto p-4 space-y-4">
              {(() => {
                const center = { lat: userLocation.lat, lon: userLocation.lon }
                const res = getNearbySpots(allSpots, center, 20)

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        center:{" "}
                        <span className="font-mono">
                          {center.lat.toFixed(4)}, {center.lon.toFixed(4)}
                        </span>
                        {" · "}
                        radius: <span className="font-mono">{res.radiusKm}km</span>
                      </div>
                      <Button
                        onClick={requestLocation}
                        disabled={gpsLoading}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        {gpsLoading ? (
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

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium">Within 20km</div>
                          <Badge variant="secondary" className="text-xs h-5">
                            {res.within.length}
                          </Badge>
                        </div>
                        <div className="rounded border overflow-hidden">
                          <div className="max-h-[70vh] overflow-auto">
                            {res.within.length === 0 ? (
                              <div className="p-2 text-xs text-muted-foreground">
                                No spots within 20km.
                              </div>
                            ) : (
                              res.within.map((s) => (
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
                            {res.outside.length}
                          </Badge>
                        </div>
                        <div className="rounded border overflow-hidden">
                          <div className="max-h-[70vh] overflow-auto">
                            {res.outside.map((s) => (
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
                )
              })()}
            </TabsContent>

            {/* Conditions Tab */}
            <TabsContent value="conditions" className="flex-1 overflow-auto p-4">
              <div className="text-xs text-muted-foreground">Coming soon...</div>
            </TabsContent>

            {/* Testing Tab */}
            <TabsContent value="testing" className="flex-1 overflow-auto p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">Surf notify agent</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Run the agent for the selected user. It will use tools (user prefs, spots, conditions) and return a notify decision.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground block">Run as user</label>
                <select
                  value={agentUserId}
                  onChange={(e) => setAgentUserId(e.target.value)}
                  className="rounded border border-input bg-background px-2 py-1.5 text-xs font-mono"
                >
                  {mockUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id} ({u.skill})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                disabled={agentLoading}
                onClick={async () => {
                  setAgentError(null)
                  setAgentResult(null)
                  setAgentTrace([])
                  setAgentLoading(true)
                  try {
                    const res = await fetch("/api/agent/run", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: agentUserId }),
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error ?? "Request failed")
                    setAgentResult(data.decision ?? data)
                    setAgentTrace(Array.isArray(data.trace) ? data.trace : [])
                  } catch (e) {
                    setAgentError(e instanceof Error ? e.message : "Agent run failed")
                  } finally {
                    setAgentLoading(false)
                  }
                }}
              >
                {agentLoading ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1.5" />
                    Running agent...
                  </>
                ) : (
                  "Run agent"
                )}
              </Button>
              {agentError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="size-3" />
                  <AlertTitle className="text-xs">Error</AlertTitle>
                  <AlertDescription className="text-xs">{agentError}</AlertDescription>
                </Alert>
              )}
              {agentResult && (
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs">Decision</CardTitle>
                    <CardDescription className="text-xs">
                      {agentResult.notify ? "Notify user" : "Do not notify"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Notify</span>
                      <Badge variant={agentResult.notify ? "default" : "secondary"} className="text-[10px] h-4">
                        {agentResult.notify ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {agentResult.spotName && (
                      <div>
                        <span className="text-muted-foreground">Spot </span>
                        <span className="font-mono">{agentResult.spotName}</span>
                        {agentResult.spotId && (
                          <span className="text-muted-foreground ml-1 font-mono text-[10px]">({agentResult.spotId})</span>
                        )}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Reason </span>
                      <span>{agentResult.reason}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Run again </span>
                      <span className="font-mono">{agentResult.nextCheckAt}</span>
                    </div>
                    {"whatWasChecked" in agentResult && agentResult.whatWasChecked && (
                      <div>
                        <span className="text-muted-foreground">What was checked </span>
                        <span className="font-mono text-[10px]">{agentResult.whatWasChecked}</span>
                      </div>
                    )}
                    {"whyNotSuitable" in agentResult && agentResult.whyNotSuitable && (
                      <div>
                        <span className="text-muted-foreground">Why not suitable </span>
                        <span>{agentResult.whyNotSuitable}</span>
                      </div>
                    )}
                    {"whyThisSpot" in agentResult && agentResult.whyThisSpot && (
                      <div>
                        <span className="text-muted-foreground">Why this spot </span>
                        <span>{agentResult.whyThisSpot}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {agentTrace.length > 0 && (
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs">Agent actions</CardTitle>
                    <CardDescription className="text-xs">
                      Tool calls and results from this run
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      {agentTrace.map((step, i) => (
                        <div key={i} className="rounded border bg-muted/30 p-2 font-mono">
                          {step.kind === "reasoning" && (
                            <div className="text-muted-foreground">
                              <span className="font-sans font-medium text-foreground">Reasoning</span>
                              <div className="mt-1 whitespace-pre-wrap break-words font-sans">{step.content}</div>
                            </div>
                          )}
                          {step.kind === "tool" && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <Badge variant="outline" className="text-[10px] h-4">
                                  tool
                                </Badge>
                                <span className="text-foreground font-medium">{step.name}</span>
                              </div>
                              {Object.keys(step.args).length > 0 && (
                                <div className="text-[10px] text-muted-foreground">
                                  <span className="font-sans">args </span>
                                  <pre className="inline overflow-x-auto">{JSON.stringify(step.args)}</pre>
                                </div>
                              )}
                              <pre className="mt-1 max-h-16 overflow-auto whitespace-pre-wrap break-words text-[10px] text-muted-foreground">
                                {step.result}
                              </pre>
                              <details className="mt-1">
                                <summary className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground underline list-none [&::-webkit-details-marker]:hidden">
                                  Show full result
                                </summary>
                                <pre className="mt-1 max-h-[320px] overflow-auto whitespace-pre-wrap break-words text-[10px] text-muted-foreground border-t border-border pt-1">
                                  {step.result}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tools (debug) Tab */}
            <TabsContent value="tools" className="flex-1 overflow-auto p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">Run agent tools manually</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Call a single tool with custom args to debug. Uses <span className="font-mono">/api/debug/tool</span>.
              </p>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">Tool</label>
                <select
                  value={toolDebugTool}
                  onChange={(e) => setToolDebugTool(e.target.value)}
                  className="w-full max-w-xs rounded border border-input bg-background px-2 py-1.5 text-xs font-mono"
                >
                  <option value="get_user_preferences">get_user_preferences</option>
                  <option value="get_spots_near_user">get_spots_near_user</option>
                  <option value="get_spots_in_region">get_spots_in_region</option>
                  <option value="get_surf_conditions">get_surf_conditions</option>
                  <option value="get_surf_conditions_batch">get_surf_conditions_batch</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">Args (JSON)</label>
                <textarea
                  value={toolDebugArgs}
                  onChange={(e) => setToolDebugArgs(e.target.value)}
                  placeholder='{ "spotId": "...", "days": 5 }'
                  rows={3}
                  className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">User ID (for context)</label>
                <input
                  type="text"
                  value={toolDebugUserId}
                  onChange={(e) => setToolDebugUserId(e.target.value)}
                  className="w-full max-w-xs rounded border border-input bg-background px-2 py-1.5 text-xs font-mono"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                disabled={toolDebugLoading}
                onClick={async () => {
                  setToolDebugResult(null)
                  setToolDebugLoading(true)
                  try {
                    let args: Record<string, unknown> = {}
                    try {
                      args = toolDebugArgs.trim() ? JSON.parse(toolDebugArgs) : {}
                    } catch {
                      setToolDebugResult({ error: "Invalid JSON in args" })
                      return
                    }
                    const res = await fetch("/api/debug/tool", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        tool: toolDebugTool,
                        args,
                        userId: toolDebugUserId || mockUser.id,
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok) {
                      setToolDebugResult({ error: data.error ?? "Request failed" })
                      return
                    }
                    setToolDebugResult({
                      result: data.result,
                      parsed: data.parsed,
                      error: data.error,
                    })
                  } catch (e) {
                    setToolDebugResult({
                      error: e instanceof Error ? e.message : "Request failed",
                    })
                  } finally {
                    setToolDebugLoading(false)
                  }
                }}
              >
                {toolDebugLoading ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1.5" />
                    Running...
                  </>
                ) : (
                  "Run tool"
                )}
              </Button>
              {toolDebugResult && (
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs">Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {toolDebugResult.error && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-xs">{toolDebugResult.error}</AlertDescription>
                      </Alert>
                    )}
                    {toolDebugResult.parsed !== undefined && (
                      <div>
                        <div className="text-muted-foreground mb-1">Parsed</div>
                        <pre className="rounded border bg-muted/30 p-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px]">
                          {typeof toolDebugResult.parsed === "string"
                            ? toolDebugResult.parsed
                            : JSON.stringify(toolDebugResult.parsed, null, 2)}
                        </pre>
                      </div>
                    )}
                    {toolDebugResult.result !== undefined && (
                      <div>
                        <div className="text-muted-foreground mb-1">Raw</div>
                        <pre className="rounded border bg-muted/30 p-2 max-h-24 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] text-muted-foreground">
                          {toolDebugResult.result}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
