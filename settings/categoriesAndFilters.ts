import { z } from "zod";

import { createSettingsConverter, NullableBoolean, NullableString } from "./shared";
import { MapPinStyleSchema } from "./provider";

export const CategoriesAndFiltersDisplayModeSchema = z
	.enum(["STANDALONE", "DROPDOWN"])
	.optional()
	.nullable()
	.describe(
		"How categories and filters are presented in the search interface: directly below the search bar or inside a collapsible dropdown for denser sets.",
	);

export const CategoriesAndFiltersMatchModeSchema = z
	.enum(["MATCH_ALL", "MATCH_ANY"])
	.optional()
	.nullable()
	.describe(
		"How multiple selected categories and filters combine: AND logic requiring every selected item, or OR logic matching any selected item.",
	);

export const CategoryFilterDefinitionSchema = z
	.object({
		key: NullableString.describe(
			"Stable identifier for the category/filter so locations and frontend UI state can reference it consistently.",
		),
		label: NullableString.describe(
			"User-facing category/filter label shown in management lists and the locator interface, such as a store type, brand, or product category.",
		),
		showInSearch: NullableBoolean.describe(
			"Whether this category/filter should appear as a selectable search option when visitors refine locator results.",
		),
		showOnListing: NullableBoolean.describe(
			"Whether this category/filter should be shown on each assigned location listing in the locator results.",
		),
		pinStyle: MapPinStyleSchema.optional().nullable().describe(
			"Optional category/filter-specific map pin style override. If omitted, the default map pin style from provider settings is used.",
		),
	})
	.describe(
		"Category/filter definition used to categorize locations and let visitors narrow search results. Categories and filters are the same concept in the administration UI.",
	);

export type CategoryFilterDefinition = z.infer<typeof CategoryFilterDefinitionSchema>;

export const CategoriesAndFiltersSettingsSchema = z
	.object({
		categories: z
			.array(CategoryFilterDefinitionSchema)
			.optional()
			.nullable()
			.describe(
				"Administrator-managed category/filter definitions that can be assigned to locations to refine locator results.",
			),
		displayMode: CategoriesAndFiltersDisplayModeSchema,
		multipleSelectionMode: CategoriesAndFiltersMatchModeSchema,
	})
	.describe(
		"Search categories and filters settings group for managing category/filter definitions, controlling how they render, and defining how multiple selections affect results.",
	);

export type CategoriesAndFiltersSettings = z.infer<typeof CategoriesAndFiltersSettingsSchema>;

export const CategoriesAndFiltersSettingsConverter = createSettingsConverter(
	CategoriesAndFiltersSettingsSchema,
);
