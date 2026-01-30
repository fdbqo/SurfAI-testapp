import mongoose, { Schema, Document, model, models } from "mongoose"

export interface ISpotForecast3h extends Document {
  spotId: string
  windowStart: Date
  dayIndex: number
  hourBlock: number // 0, 3, 6, 9, 12, 15, 18, 21
  swellHeight: number
  swellPeriod: number
  swellDirection: number
  waveHeight: number
  wavePeriod: number
  windSpeed10m: number
  windDirection: number
  score?: number
}

const SpotForecast3hSchema = new Schema<ISpotForecast3h>(
  {
    spotId: { type: String, required: true, index: true },
    windowStart: { type: Date, required: true, index: true },
    dayIndex: { type: Number, required: true },
    hourBlock: { type: Number, required: true, min: 0, max: 21 },
    swellHeight: { type: Number, required: true },
    swellPeriod: { type: Number, required: true },
    swellDirection: { type: Number, required: true },
    waveHeight: { type: Number, required: true },
    wavePeriod: { type: Number, required: true },
    windSpeed10m: { type: Number, required: true },
    windDirection: { type: Number, required: true },
    score: { type: Number, required: false, min: 0, max: 10 },
  },
  { timestamps: false, collection: "spotforecast3hs" }
)

SpotForecast3hSchema.index({ spotId: 1, windowStart: 1 }, { unique: true })
SpotForecast3hSchema.index({ spotId: 1, dayIndex: 1 })

export const SpotForecast3h =
  (models.SpotForecast3h as mongoose.Model<ISpotForecast3h>) ||
  model<ISpotForecast3h>("SpotForecast3h", SpotForecast3hSchema)
