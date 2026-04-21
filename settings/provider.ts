import { z } from "zod";

import { createSettingsConverter, NullableBoolean, NullableString } from "./shared";

export const MapProviderSchema = z
  .enum(["LEAFLET", "MAPBOX", "GOOGLE_MAPS"])
  .optional()
  .nullable()
  .describe("Selected map provider powering locator rendering and search. Leaflet requires no API key, while Mapbox and Google Maps require provider credentials.");

export const ProviderSettingsSchema = z.object({
  provider: MapProviderSchema,
  apiKey: NullableString.describe("Provider API key used when the selected map service requires credentials. This should remain empty for Leaflet because Leaflet does not require a key."),
  apiKeyRequired: NullableBoolean.describe("Whether the selected provider requires an API key. This should be false for Leaflet and true for providers such as Mapbox or Google Maps."),
  securityDocumentationUrl: NullableString.describe("Reference link for securing provider credentials, such as restricting a Google Maps or Mapbox key by domain or application."),
  quickstartDocumentationUrl: NullableString.describe("Reference link or guided setup entry point for creating and configuring credentials for the selected provider."),
  troubleshootingDocumentationUrl: NullableString.describe("Reference link for resolving provider-specific map issues such as missing billing, disabled APIs, or unauthorized domains."),
}).describe("Map provider settings group for selecting Leaflet, Mapbox, or Google Maps and for storing any provider-specific credential or guidance metadata needed by the locator administration UI.");

export type ProviderSettings = z.infer<typeof ProviderSettingsSchema>;

export const ProviderSettingsConverter = createSettingsConverter(ProviderSettingsSchema);
