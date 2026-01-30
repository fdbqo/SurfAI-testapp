export type UserLocation = {
    lat: number
    lon: number
    source: "gps" | "ip" | "manual"
    confidence?: "high" | "low"
    updatedAt?: Date
}
