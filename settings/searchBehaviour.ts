import { z } from "zod";

import { createSettingsConverter, NullableBoolean, NullableNumber, NullableString } from "./shared";

export const SearchStartingPositionModeSchema = z
  .enum(["FIT_ALL_LOCATIONS", "SPECIFIC_AREA"])
  .optional()
  .nullable()
  .describe("Initial map loading strategy: fit the viewport to all locations or focus on an administrator-defined area.");

export const SearchTypeSchema = z
  .enum(["LIVE", "FIXED"])
  .optional()
  .nullable()
  .describe("Search update mode: live search refreshes results as the map moves, while fixed search requires an explicit user action.");

export const SearchGeolocationButtonModeSchema = z
  .enum(["SEARCH_FIELD", "STANDALONE", "HIDDEN"])
  .optional()
  .nullable()
  .describe("How visitors can manually trigger geolocation: inside the search field, with a standalone larger button, or not at all.");

export const SearchDistanceModeSchema = z
  .enum(["ENTIRE_SEARCHED_AREA", "SPECIFIC_RADIUS", "VISITOR_CHOOSES"])
  .optional()
  .nullable()
  .describe("How typed-in searches define the search area: entire matched region, a fixed radius, or a visitor-selected radius.");

export const SearchDistanceUnitSchema = z
  .enum(["MILES", "KILOMETERS"])
  .optional()
  .nullable()
  .describe("Distance measurement unit used for search radii, labels, and nearby result messaging.");

export const SearchSuggestionModeSchema = z
  .enum(["REGIONS", "ADDRESSES"])
  .optional()
  .nullable()
  .describe("Autocomplete strategy for the search field: suggest broader regions such as cities or postcodes, or suggest exact street addresses.");

export const SearchCountryLockModeSchema = z
  .enum(["DISABLED", "LIMITED_COUNTRIES"])
  .optional()
  .nullable()
  .describe("Whether search should be unrestricted across countries or locked to a specific administrator-defined country list.");

export const SearchStartingAreaSchema = z.object({
  label: NullableString.describe("Administrative label for the predefined area used when the map starts focused on a specific region."),
  lat: NullableNumber.describe("Latitude for the predefined starting area center point."),
  lng: NullableNumber.describe("Longitude for the predefined starting area center point."),
  zoom: NullableNumber.describe("Zoom level to apply when focusing on a specific starting area rather than fitting all locations."),
}).describe("Predefined starting area used when the locator loads focused on a specific region.");

export type SearchStartingArea = z.infer<typeof SearchStartingAreaSchema>;

export const SearchBehaviourSettingsSchema = z.object({
  startingPositionMode: SearchStartingPositionModeSchema,
  startingArea: SearchStartingAreaSchema.optional().nullable().describe("Preselected starting area details used only when the locator should focus on a specific area on first load."),
  searchType: SearchTypeSchema,
  clusterLocationsWhenZoomedOut: NullableBoolean.describe("Whether nearby location markers should be grouped into cluster circles when visitors zoom out on the map."),
  clusteringZoomLevel: NullableNumber.describe("Zoom threshold at which grouped cluster markers begin replacing individual location pins."),
  clusterColor: NullableString.describe("Color used for grouped cluster circles when marker clustering is enabled."),
  automaticGeolocation: NullableBoolean.describe("Whether the locator should automatically attempt to detect the visitor's location and show nearby stores on load."),
  geolocationButtonMode: SearchGeolocationButtonModeSchema,
  typedSearchDistanceMode: SearchDistanceModeSchema,
  minimumDistance: NullableNumber.describe("Minimum fallback distance used for typed searches, especially when a very small or precise search area would otherwise return too few results."),
  geolocationRadius: NullableNumber.describe("Distance from the detected visitor location within which results should be shown after geolocation succeeds."),
  maximumResults: NullableNumber.describe("Maximum number of locations the locator should display at once to balance usefulness and performance."),
  distanceUnit: SearchDistanceUnitSchema,
  searchSuggestionMode: SearchSuggestionModeSchema,
  countryLockMode: SearchCountryLockModeSchema,
  countryCodes: z.array(z.string()).optional().nullable().describe("Allowed country codes when search is restricted to specific countries for accuracy and relevance."),
}).describe("Search behavior settings group for initial map positioning, live or fixed search behavior, clustering, geolocation, distance rules, result limits, and search suggestion constraints.");

export type SearchBehaviourSettings = z.infer<typeof SearchBehaviourSettingsSchema>;

export const SearchBehaviourSettingsConverter = createSettingsConverter(SearchBehaviourSettingsSchema);
