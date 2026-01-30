import mongoose, { Schema, model, models } from "mongoose"
import type { User } from "@/types/user/User"

const UserPreferencesSchema = new Schema(
  {
    maxComfortableWave: { type: Number, required: true },
    riskTolerance: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    avoidReefs: { type: Boolean, default: false },
  },
  { _id: false }
)

const NotificationSettingsSchema = new Schema(
  {
    enabled: { type: Boolean, required: true, default: true },
  },
  { _id: false }
)

const LastLocationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    source: { type: String, enum: ["gps", "ip", "manual"], required: true },
    confidence: { type: String, enum: ["high", "low"], required: true },
    updatedAt: { type: Date, required: true },
  },
  { _id: false }
)

const UserSchema = new Schema<User>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    skill: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    preferences: {
      type: UserPreferencesSchema,
      required: true,
    },
    notificationSettings: {
      type: NotificationSettingsSchema,
      required: true,
    },
    lastLocation: LastLocationSchema,
    homeRegion: { type: String },
    usualRegions: [{ type: String }],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
)

// Prevent model re-compilation during development
export const UserModel = models.User || model<User>("User", UserSchema)
