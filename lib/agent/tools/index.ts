export { getUserPreferences } from "./getUserPreferences"
export { getSpotsNearUser } from "./getSpotsNearUser"
export { getSpotsInRegion } from "./getSpotsInRegion"
export { getSurfConditions } from "./getSurfConditions"
export { getSurfConditionsBatch } from "./getSurfConditionsBatch"

import { getUserPreferences } from "./getUserPreferences"
import { getSpotsNearUser } from "./getSpotsNearUser"
import { getSpotsInRegion } from "./getSpotsInRegion"
import { getSurfConditions } from "./getSurfConditions"
import { getSurfConditionsBatch } from "./getSurfConditionsBatch"

export const toolsByName = {
  get_user_preferences: getUserPreferences,
  get_spots_near_user: getSpotsNearUser,
  get_spots_in_region: getSpotsInRegion,
  get_surf_conditions: getSurfConditions,
  get_surf_conditions_batch: getSurfConditionsBatch,
}
