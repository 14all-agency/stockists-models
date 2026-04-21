import { z } from "zod";

import { createSettingsConverter, NullableBoolean, NullableNumber, NullableString } from "./shared";

export const AppearanceDesktopLayoutSchema = z
  .enum(["LEFT", "RIGHT", "TOP_LEFT", "TOP_RIGHT"])
  .optional()
  .nullable()
  .describe("Desktop locator layout: results/search on the left or right, or the search bar on top with results beneath on the chosen side.");

export const AppearanceMobileLayoutSchema = z
  .enum(["MAP_ABOVE_RESULTS", "MAP_BELOW_RESULTS", "HIDE_MAP"])
  .optional()
  .nullable()
  .describe("Mobile locator layout: map above results, map below results, or no map on mobile devices.");

export const AppearanceMobileResultListHeightModeSchema = z
  .enum(["UNLIMITED", "FIXED"])
  .optional()
  .nullable()
  .describe("Controls whether the mobile results list grows naturally with page scroll or uses a fixed height with internal scrolling.");

export const AppearanceMapThemeModeSchema = z
  .enum(["GOOGLE_DEFAULT", "CUSTOM_THEME", "CUSTOM_STYLE_CODE"])
  .optional()
  .nullable()
  .describe("Map theme mode: default Google styling, a saved custom theme selection, or raw advanced style JSON.");

export const AppearancePinStyleSchema = z.object({
  key: NullableString.describe("Stable identifier for a reusable map pin style so categories or filters can reference it."),
  label: NullableString.describe("Human-readable pin style name shown to administrators when managing the pin library."),
  markerColor: NullableString.describe("Primary marker color for this pin style, typically a hex value used for branding or category differentiation."),
  iconUrl: NullableString.describe("Optional custom icon asset URL for this pin style when a standard pin is not sufficient."),
  isDefault: NullableBoolean.describe("Whether this pin style is the default marker used when a location does not target a more specific style."),
}).describe("Reusable map pin style definition from the appearance settings pin library.");

export type AppearancePinStyle = z.infer<typeof AppearancePinStyleSchema>;

export const AppearanceSettingsSchema = z.object({
  featureColor: NullableString.describe("Primary accent color used across the locator UI, including the search button, location names, and links."),
  geolocationIconColor: NullableString.describe("Color of the geolocation icon or location-detection affordance in the search interface."),
  mapThemeMode: AppearanceMapThemeModeSchema,
  mapThemeId: NullableString.describe("Selected saved map theme identifier when the appearance settings use a custom map theme instead of the default."),
  mapThemeStyleCode: NullableString.describe("Advanced raw map styling JSON or provider style code applied after selecting the custom style code theme mode."),
  pinStyles: z.array(AppearancePinStyleSchema).optional().nullable().describe("Available map pin styles, including the editable default pin and any additional pin designs for categories or filters."),
  desktopLayout: AppearanceDesktopLayoutSchema,
  locatorHeightPx: NullableNumber.describe("Overall locator height in pixels so the map and results region fit the intended page layout."),
  autoFillWidth: NullableBoolean.describe("Whether the locator should automatically fill the available horizontal container space instead of using a constrained custom width."),
  sidePanelWidthPx: NullableNumber.describe("Width in pixels of the side panel that contains locator search inputs and results on desktop layouts."),
  desktopBreakpointPx: NullableNumber.describe("Screen width in pixels at which the locator should switch from mobile behavior to desktop layout rules."),
  mobileLayout: AppearanceMobileLayoutSchema,
  mobileResultListHeightMode: AppearanceMobileResultListHeightModeSchema,
  mobileResultListHeightPx: NullableNumber.describe("Fixed mobile results height in pixels when the mobile result list uses a constrained scrollable panel."),
  hidePoweredByBranding: NullableBoolean.describe("Whether to hide the 'Powered by APP_NAME' white-label branding link when the organisation plan allows it."),
  locatorVersion: NullableString.describe("Locator script version identifier so administrators can stay on the latest release or pin an older compatible version."),
  customCss: NullableString.describe("Advanced CSS overrides applied after the default locator styles for branding and layout customization beyond the standard controls."),
}).describe("Appearance settings group for customizing locator colors, map theming, marker styles, desktop/mobile layout, branding visibility, and advanced CSS overrides.");

export type AppearanceSettings = z.infer<typeof AppearanceSettingsSchema>;

export const AppearanceSettingsConverter = createSettingsConverter(AppearanceSettingsSchema);
