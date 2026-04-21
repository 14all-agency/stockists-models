import { z } from "zod";

import {
  AppearanceSettingsConverter,
  AppearanceSettingsSchema,
} from "@/models/settings/appearance";
import {
  CustomFieldsSettingsConverter,
  CustomFieldsSettingsSchema,
} from "@/models/settings/customFields";
import {
  FiltersSettingsConverter,
  FiltersSettingsSchema,
} from "@/models/settings/filters";
import {
  LanguageSettingsConverter,
  LanguageSettingsSchema,
} from "@/models/settings/language";
import {
  ProviderSettingsConverter,
  ProviderSettingsSchema,
} from "@/models/settings/provider";
import {
  SearchBehaviourSettingsConverter,
  SearchBehaviourSettingsSchema,
} from "@/models/settings/searchBehaviour";
import { createSettingsConverter } from "@/models/settings/shared";

export const SettingsGroupsSchema = z.object({
  appearance: AppearanceSettingsSchema.optional().nullable().describe("Appearance settings for colors, map theme, pins, layout behavior, branding, and custom CSS."),
  customFields: CustomFieldsSettingsSchema.optional().nullable().describe("Custom field definitions used to extend the data stored on locations and optionally expose it in the storefront locator."),
  filters: FiltersSettingsSchema.optional().nullable().describe("Search filter definitions plus the display and matching behavior used when visitors refine location results."),
  language: LanguageSettingsSchema.optional().nullable().describe("Localized user-facing text bundles for the locator search UI, messages, and links."),
  provider: ProviderSettingsSchema.optional().nullable().describe("Map provider selection and any required credential or documentation metadata for that provider."),
  searchBehaviour: SearchBehaviourSettingsSchema.optional().nullable().describe("Search and map interaction behavior including starting position, clustering, geolocation, distances, and autocomplete constraints."),
}).describe("Store locator settings groups derived from the plan documents. Each group maps to a dedicated settings panel and is stored against an organisation.");

export const SettingsResult = SettingsGroupsSchema.optional().nullable().describe("Organisation-scoped store locator settings. Null implies the organisation has not completed onboarding or saved settings yet.");

export type Settings = z.infer<typeof SettingsResult>;

export const SettingsConverter = createSettingsConverter(SettingsGroupsSchema);

export {
  AppearanceSettingsConverter,
  AppearanceSettingsSchema,
  CustomFieldsSettingsConverter,
  CustomFieldsSettingsSchema,
  FiltersSettingsConverter,
  FiltersSettingsSchema,
  LanguageSettingsConverter,
  LanguageSettingsSchema,
  ProviderSettingsConverter,
  ProviderSettingsSchema,
  SearchBehaviourSettingsConverter,
  SearchBehaviourSettingsSchema,
};
