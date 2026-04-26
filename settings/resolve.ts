import { Settings } from "../OrganisationSettings";
import {
  CategoriesAndFiltersSettings,
  CategoryFilterDefinition,
} from "./categoriesAndFilters";
import { CustomFieldDefinition, CustomFieldsSettings } from "./customFields";
import { LanguageContent, LanguageSettings } from "./language";
import { MapPinStyle, ProviderSettings } from "./provider";
import { SearchBehaviourSettings, SearchStartingArea } from "./searchBehaviour";

type ResolvableSettingsInput = {
  searchBehaviour?: SearchBehaviourSettings | null;
  provider?: ProviderSettings | null;
  categoriesAndFilters?: CategoriesAndFiltersSettings | null;
  customFields?: CustomFieldsSettings | null;
  language?: LanguageSettings | null;
} | null | undefined;

const DEFAULT_STARTING_AREA: SearchStartingArea = {
  label: "",
  lat: 20,
  lng: 0,
  zoom: 2,
};

const DEFAULT_PIN_STYLE: MapPinStyle = {
  name: "Default pin",
  pinType: "STANDARD_PIN_ICON",
  pinColor: "#FB2C36",
  customImageUrl: "",
  customImageDisplayMode: "IMAGE_ONLY",
  retinaSupport: true,
};

const DEFAULT_LANGUAGE_CONTENT: Omit<LanguageContent, "locale"> = {
  searchPlaceholder: "Search by city, postcode, or address",
  searchButtonLabel: "Search",
  geolocationButtonLabel: "Use my location",
  filterDropdownButtonLabel: "Filter results",
  initialMessageHtml: "Enter your city or postcode to find nearby locations.",
  noResultsMessageHtml: "Sorry, we couldn’t find any matching locations.",
  addressNotFoundMessageHtml: "We couldn’t recognize that address. Try another search.",
  geolocationErrorMessageHtml:
    "We couldn’t access your location. Check your browser settings and try again.",
  genericErrorMessageHtml: "Something went wrong. Please try again.",
  directionsLinkLabel: "Directions",
  websiteLinkLabel: "Website",
  categoryLabels: [],
  customFieldLabels: [],
};

function resolveSearchBehaviourSettings(
  settings?: SearchBehaviourSettings | null,
): SearchBehaviourSettings {
  return {
    startingPositionMode: settings?.startingPositionMode ?? "FIT_ALL_LOCATIONS",
    startingArea: {
      ...DEFAULT_STARTING_AREA,
      ...(settings?.startingArea || {}),
    },
    clusterLocationsWhenZoomedOut: settings?.clusterLocationsWhenZoomedOut ?? true,
    clusteringZoomLevel: settings?.clusteringZoomLevel ?? 8,
    clusterColor: settings?.clusterColor ?? "#e7000b",
    automaticGeolocation: settings?.automaticGeolocation ?? false,
    geolocationButtonMode: settings?.geolocationButtonMode ?? "SEARCH_FIELD",
    typedSearchDistanceMode: settings?.typedSearchDistanceMode ?? "ENTIRE_SEARCHED_AREA",
    minimumDistance: settings?.minimumDistance ?? 25,
    geolocationRadius: settings?.geolocationRadius ?? 25,
    maximumResults: settings?.maximumResults ?? 100,
    distanceUnit: settings?.distanceUnit ?? "KILOMETERS",
    searchSuggestionMode: settings?.searchSuggestionMode ?? "REGIONS_AND_ADDRESSES",
    countryLockMode: settings?.countryLockMode ?? "DISABLED",
    countryCodes: settings?.countryCodes ?? [],
  };
}

function resolveProviderSettings(
  settings?: ProviderSettings | null,
): ProviderSettings {
  const provider = settings?.provider ?? "LEAFLET";
  const defaultThemeId =
    provider === "MAPBOX" ? "STREETS" : (provider === "GOOGLE_MAPS" ? "ROADMAP" : "OPENSTREETMAP_STANDARD");

  return {
    provider,
    apiKey: settings?.apiKey ?? "",
    mapThemeMode: settings?.mapThemeMode ?? "PROVIDER_DEFAULT",
    mapThemeId: settings?.mapThemeId ?? defaultThemeId,
    mapThemeStyleCode: settings?.mapThemeStyleCode ?? "",
    defaultPinStyle: {
      ...DEFAULT_PIN_STYLE,
      ...(settings?.defaultPinStyle || {}),
    },
  };
}

function resolveCategoriesAndFiltersSettings(
  settings?: CategoriesAndFiltersSettings | null,
): CategoriesAndFiltersSettings {
  return {
    categories: (settings?.categories || []).map((category): CategoryFilterDefinition => ({
      key: category.key ?? "",
      label: category.label ?? "",
      showInSearch: category.showInSearch ?? true,
      showOnListing: category.showOnListing ?? true,
      pinStyle: category.pinStyle
        ? {
            name: category.pinStyle.name ?? "",
            pinType: category.pinStyle.pinType ?? "STANDARD_PIN_ICON",
            pinColor: category.pinStyle.pinColor ?? "#FB2C36",
            customImageUrl: category.pinStyle.customImageUrl ?? "",
            customImageDisplayMode: category.pinStyle.customImageDisplayMode ?? "IMAGE_ONLY",
            retinaSupport: category.pinStyle.retinaSupport ?? true,
          }
        : null,
    })),
    displayMode: settings?.displayMode ?? "STANDALONE",
    multipleSelectionMode: settings?.multipleSelectionMode ?? "MATCH_ANY",
  };
}

function resolveCustomFieldsSettings(
  settings?: CustomFieldsSettings | null,
): CustomFieldsSettings {
  return {
    fields: (settings?.fields || []).map((field): CustomFieldDefinition => ({
      key: field.key ?? "",
      label: field.label ?? "",
      type: field.type ?? "TEXT",
      showOnListing: field.showOnListing ?? true,
    })),
  };
}

function createDefaultLanguageContent(locale: string): LanguageContent {
  return {
    locale,
    ...DEFAULT_LANGUAGE_CONTENT,
  };
}

function createLanguageContent(language?: LanguageContent | null): LanguageContent {
  return {
    locale: language?.locale ?? "en",
    searchPlaceholder: language?.searchPlaceholder ?? DEFAULT_LANGUAGE_CONTENT.searchPlaceholder,
    searchButtonLabel: language?.searchButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.searchButtonLabel,
    geolocationButtonLabel:
      language?.geolocationButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.geolocationButtonLabel,
    filterDropdownButtonLabel:
      language?.filterDropdownButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.filterDropdownButtonLabel,
    initialMessageHtml: language?.initialMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.initialMessageHtml,
    noResultsMessageHtml:
      language?.noResultsMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.noResultsMessageHtml,
    addressNotFoundMessageHtml:
      language?.addressNotFoundMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.addressNotFoundMessageHtml,
    geolocationErrorMessageHtml:
      language?.geolocationErrorMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.geolocationErrorMessageHtml,
    genericErrorMessageHtml:
      language?.genericErrorMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.genericErrorMessageHtml,
    directionsLinkLabel: language?.directionsLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.directionsLinkLabel,
    websiteLinkLabel: language?.websiteLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.websiteLinkLabel,
    categoryLabels: language?.categoryLabels ?? [],
    customFieldLabels: language?.customFieldLabels ?? [],
  };
}

function resolveLanguageSettings(
  settings?: LanguageSettings | null,
): LanguageSettings {
  const primaryLanguage = settings?.primaryLanguage?.trim() || "en";
  const languages = (settings?.languages || []).length
    ? (settings?.languages || []).map((language) => createLanguageContent(language))
    : [createDefaultLanguageContent(primaryLanguage)];

  if (!languages.some((language) => language.locale === primaryLanguage)) {
    languages.unshift(createDefaultLanguageContent(primaryLanguage));
  }

  return {
    primaryLanguage,
    languages,
  };
}

export function resolveSettings(settings?: ResolvableSettingsInput): NonNullable<Settings> {
  return {
    searchBehaviour: resolveSearchBehaviourSettings(settings?.searchBehaviour),
    provider: resolveProviderSettings(settings?.provider),
    categoriesAndFilters: resolveCategoriesAndFiltersSettings(settings?.categoriesAndFilters),
    customFields: resolveCustomFieldsSettings(settings?.customFields),
    language: resolveLanguageSettings(settings?.language),
  };
}
