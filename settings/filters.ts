import { z } from "zod";

import { createSettingsConverter, NullableString } from "./shared";

export const FiltersDisplayModeSchema = z
  .enum(["STANDALONE", "DROPDOWN"])
  .optional()
  .nullable()
  .describe("How filters are presented in the search interface: directly below the search bar or inside a collapsible dropdown for denser filter sets.");

export const FiltersMatchModeSchema = z
  .enum(["MATCH_ALL", "MATCH_ANY"])
  .optional()
  .nullable()
  .describe("How multiple selected filters combine: AND logic requiring every selected filter, or OR logic matching any selected filter.");

export const FilterDefinitionSchema = z.object({
  key: NullableString.describe("Stable identifier for the search filter so locations and frontend UI state can reference it consistently."),
  label: NullableString.describe("User-facing filter label shown in management lists and the locator interface, such as a store type, brand, or product category."),
}).describe("Search filter definition used to categorize locations and let visitors narrow search results.");

export type FilterDefinition = z.infer<typeof FilterDefinitionSchema>;

export const FiltersSettingsSchema = z.object({
  filters: z.array(FilterDefinitionSchema).optional().nullable().describe("Administrator-managed filter definitions that can be assigned to locations to refine locator results."),
  displayMode: FiltersDisplayModeSchema,
  multipleSelectionMode: FiltersMatchModeSchema,
}).describe("Search filters settings group for managing filter definitions, controlling how filters render, and defining how multiple selections affect results.");

export type FiltersSettings = z.infer<typeof FiltersSettingsSchema>;

export const FiltersSettingsConverter = createSettingsConverter(FiltersSettingsSchema);
