import { z } from "zod";

import { createSettingsConverter, NullableString } from "./shared";

export const LanguageLabelOverrideSchema = z
	.object({
		key: NullableString.describe(
			"Stable key of the category/filter or custom field definition this translated label override applies to.",
		),
		label: NullableString.describe(
			"Translated user-facing label to use for the matching category/filter or custom field in this language bundle.",
		),
	})
	.describe(
		"Per-language label override for a category/filter or custom field definition, keyed by the original definition key.",
	);

export type LanguageLabelOverride = z.infer<typeof LanguageLabelOverrideSchema>;

export const LanguageContentSchema = z.object({
  locale: NullableString.describe("Locale code for this language variant, such as en or en-NZ, used to select which translation bundle is being edited."),
  searchPlaceholder: NullableString.describe("Placeholder text shown inside the search field before a visitor types an address, postcode, or region."),
  searchButtonLabel: NullableString.describe("Label displayed on the search button. An empty string can be used when the UI should show only a search icon."),
  geolocationButtonLabel: NullableString.describe("Text shown on the use-my-location action when visitors can trigger geolocation manually."),
  filterDropdownButtonLabel: NullableString.describe("Text used for the filter toggle button when filters are enabled and rendered in a dropdown or similar control."),
  initialMessageHtml: NullableString.describe("Rich text or HTML message shown before any search is performed to guide first-time locator use."),
  noResultsMessageHtml: NullableString.describe("Rich text or HTML message shown when a search completes but no matching locations are found."),
  addressNotFoundMessageHtml: NullableString.describe("Rich text or HTML message shown when the entered address or place name cannot be resolved by the search provider."),
  geolocationErrorMessageHtml: NullableString.describe("Rich text or HTML error message shown when browser or device geolocation fails, is blocked, or is unavailable."),
  genericErrorMessageHtml: NullableString.describe("Fallback rich text or HTML message for unexpected locator errors that do not map to a more specific case."),
  directionsLinkLabel: NullableString.describe("Text used for the directions link in map popups or result cards, such as Directions or Get directions."),
  websiteLinkLabel: NullableString.describe("Text for the external website link in location details. An empty string means the raw domain should be displayed instead."),
  categoryLabels: z.array(LanguageLabelOverrideSchema).optional().nullable().describe("Per-language label overrides for category/filter definitions, allowing the same underlying category key to be shown with different wording in different languages."),
  customFieldLabels: z.array(LanguageLabelOverrideSchema).optional().nullable().describe("Per-language label overrides for reusable custom field definitions, allowing storefront field labels to be translated without changing the default admin label."),
}).describe("Single language bundle containing every user-facing locator string that administrators can customize or translate.");

export type LanguageContent = z.infer<typeof LanguageContentSchema>;

export const LanguageSettingsSchema = z.object({
  primaryLanguage: NullableString.describe("Default language locale used by the locator unless another enabled translation is selected for the storefront experience."),
  languages: z.array(LanguageContentSchema).optional().nullable().describe("All editable language bundles, including the primary language and any additional translated languages."),
}).describe("Language settings group for localization and wording customization across the locator search UI, result messages, and link labels.");

export type LanguageSettings = z.infer<typeof LanguageSettingsSchema>;

export const LanguageSettingsConverter = createSettingsConverter(LanguageSettingsSchema);
