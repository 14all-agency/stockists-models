import { type Settings } from "../OrganisationSettings";
import {
  type CategoriesAndFiltersSettings,
  type CategoryFilterDefinition,
} from "./categoriesAndFilters";
import { type CustomFieldDefinition, type CustomFieldsSettings } from "./customFields";
import {
  DEFAULT_DEALER_FORM_FIELDS,
  type DealerFormsSettings,
  type DealerFormFieldDefinition,
} from "./dealerForms";
import { type LanguageContent, type LanguageSettings } from "./language";
import { type MapPinStyle, type ProviderSettings } from "./provider";
import {
  normalizeClusteringDensityModifier,
  type SearchBehaviourSettings,
  type SearchStartingArea,
} from "./searchBehaviour";

type ResolvableSettingsInput = {
  searchBehaviour?: SearchBehaviourSettings | null;
  provider?: ProviderSettings | null;
  categoriesAndFilters?: CategoriesAndFiltersSettings | null;
  customFields?: CustomFieldsSettings | null;
  dealerForms?: DealerFormsSettings | null;
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
  searchPanelHeadingLabel: "Search & Filters",
  resultsPanelHeadingLabel: "Results",
  searchPlaceholder: "Search by city, postcode, or address",
  searchInputLabel: "Search by city, postcode, or address",
  searchButtonLabel: "Search",
  loadingLabel: "Loading",
  loadingLocationsLabel: "Loading locations...",
  geolocationButtonLabel: "Use my location",
  geolocationLoadingLabel: "Finding your location...",
  filterDropdownButtonLabel: "Filter results",
  resetFiltersButtonLabel: "Reset filters",
  initialMessageHtml: "Enter your city or postcode to find nearby locations.",
  emptyResultsNearbyMessage: "Sorry, we didn't find any stockists nearby",
  noResultsMessageHtml: "Sorry, we couldn’t find any matching locations.",
  addressNotFoundMessageHtml: "We couldn’t recognize that address. Try another search.",
  geolocationErrorMessageHtml:
    "We couldn’t access your location. Check your browser settings and try again.",
  rateLimitedMessageHtml: "Too many map searches. Please wait a moment, then try again.",
  genericErrorMessageHtml: "Something went wrong. Please try again.",
  directionsLinkLabel: "Directions",
  websiteLinkLabel: "Website",
  popupCloseLabel: "Close popup",
  fullscreenToggleLabel: "Toggle fullscreen map",
  locationLogoAltLabel: "Location logo",
  dealerFormUnavailableMessage: "Dealer form not available right now.",
  dealerFormNoFieldsMessage: "No dealer form fields configured yet.",
  dealerFormPleaseWaitMessage: "Please wait a moment, then submit again.",
  dealerFormFieldErrorFallbackMessage: "Please check this field.",
  dealerFormHighlightedFieldsMessage: "Please fix highlighted fields and try again.",
  dealerFormTooManyUploadsMessage:
    "Some fields exceed allowed limits. Use up to 3 upload fields per submission.",
  dealerFormUploadTotalTooLargeMessage:
    "Request too large. Uploaded files must stay under 15 MB combined.",
  dealerFormRecaptchaFailedMessage: "reCAPTCHA verification failed. Please try again.",
  dealerFormRequestTooLargeMessage:
    "Request too large. Shorten answers or remove files, then try again.",
  dealerFormSubmitErrorMessage: "Could not submit your application. Please try again.",
  dealerFormTooManyRequestsMessage: "Too many requests, please try again shortly.",
  dealerFormContactRequiredMessage: "Enter contact name and email.",
  dealerFormContactNameTooLongMessage: "Contact name must be 120 characters or fewer.",
  dealerFormContactEmailTooLongMessage: "Contact email must be 254 characters or fewer.",
  dealerFormInvalidEmailMessage: "Enter a valid email address.",
  dealerFormAddressSuggestionRequiredMessage:
    "Select a suggested address or complete the address manually.",
  dealerFormAddressRequiredMessage: "Complete all required address fields.",
  dealerFormFieldLimitExceededMessage: "Some fields exceed allowed limits.",
  dealerFormFieldNotFoundMessage: "Field could not be found.",
  dealerFormCheckboxRequiredMessage: "Please check this box to continue.",
  dealerFormFileRequiredMessage: "Please upload a file.",
  dealerFormFileTooLargeMessage: "Please upload a file smaller than 10 MB.",
  dealerFormImageFileRequiredMessage: "Please upload an image file.",
  dealerFormRequiredFieldMessage: "This field is required.",
  dealerFormInvalidUrlMessage: "Enter a valid URL.",
  dealerFormInvalidSelectOptionMessage: "Choose a valid option.",
  dealerFormInvalidNumberMessage: "Enter a valid number.",
  dealerFormTextTooLongMessage: "This field must be 2000 characters or fewer.",
  dealerFormAddressNoResultsMessage: "No results found.",
  dealerFormGenericInputPlaceholder: "Enter value",
  dealerFormContactNameLabel: "Contact name",
  dealerFormContactNamePlaceholder: "Enter contact name",
  dealerFormContactEmailLabel: "Contact email",
  dealerFormContactEmailPlaceholder: "Enter contact email",
  dealerFormAddressLookupLabel: "Address",
  dealerFormAddressLookupPlaceholder: "Search address",
  dealerFormEnterAddressManuallyLabel: "Enter manually",
  dealerFormHideAddressFieldsLabel: "Hide address fields",
  dealerFormAddressLine1Label: "Address line 1",
  dealerFormAddressLine1Placeholder: "Enter address line 1",
  dealerFormAddressLine2Label: "Address line 2",
  dealerFormAddressLine2Placeholder: "Enter address line 2",
  dealerFormCityLabel: "City",
  dealerFormCityPlaceholder: "Enter city",
  dealerFormPostalCodeLabel: "Postal code",
  dealerFormPostalCodePlaceholder: "Enter postal code",
  dealerFormStateProvinceLabel: "State / Province",
  dealerFormStateProvincePlaceholder: "Enter state or province",
  dealerFormCountryLabel: "Country",
  dealerFormCountryPlaceholder: "Enter country",
  debugReportBugLinkLabel: "report a bug",
  debugReportBugCloseDialogLabel: "Close report bug popup",
  debugReportBugDialogTitle: "Report bug",
  debugReportBugDialogDescription:
    "If you have encountered a bug with your map please leave a message describing your issue and our team will be notified.",
  debugReportBugMessageLabel: "Message",
  debugReportBugConsentPrefix:
    "By submitting your bug you consent to your app usage logs and user agent details being shared with our team, see our",
  privacyPolicyLinkLabel: "privacy policy",
  debugReportBugSubmitLabel: "Submit",
  debugReportBugSubmittingLabel: "Submitting...",
  debugReportBugCopyLabel: "Copy logs to clipboard",
  debugReportBugSuccessMessage: "Your bug report has been received.",
  closeButtonLabel: "Close",
  categoryLabels: [],
  customFieldLabels: [],
  dealerFormFieldLabels: [],
  dealerFormFieldPlaceholders: [],
};

const DEFAULT_DEALER_NOTIFICATION_ACCENT_COLOR = "#2563eb";
const DEFAULT_DEALER_NOTIFICATION_SUBJECT = "Your submission has been received.";
const DEFAULT_DEALER_NOTIFICATION_BODY = "Hi {name},\n\nYour submission has been received. We will contact you once your submission has been accepted or if we have any questions.";
const DEFAULT_DEALER_PUBLISHED_SUBJECT = "Your submission has been published";
const DEFAULT_DEALER_PUBLISHED_BODY = "Hi {name},\n\nYour dealer submission has been published and your listing will appear on our stockists map shortly.";

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
    clusteringDensityModifier: normalizeClusteringDensityModifier(
      settings?.clusteringDensityModifier,
    ),
    automaticGeolocation: settings?.automaticGeolocation ?? false,
    geolocationMethod: settings?.geolocationMethod ?? "IP_ADDRESS",
    typedSearchDistanceMode: settings?.typedSearchDistanceMode ?? "BOTH",
    searchRadius: settings?.searchRadius ?? 25,
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

function resolveDealerFormsSettings(
  settings?: DealerFormsSettings | null,
): DealerFormsSettings {
  const fields = (settings?.fields || []).length
    ? (settings?.fields || []).map((field): DealerFormFieldDefinition => ({
        key: field.key ?? "",
        label: field.label ?? "",
        placeholder: field.placeholder ?? "",
        type: field.type ?? "TEXT",
        required: field.required ?? false,
        locked: field.locked ?? false,
        options: (field.options || []).map((option) => ({
          label: option.label ?? "",
          value: option.value ?? "",
        })),
      }))
    : DEFAULT_DEALER_FORM_FIELDS;

  return {
    fields,
    notificationEnabled: settings?.notificationEnabled ?? true,
    notificationEmail: settings?.notificationEmail ?? "",
    dealerNotificationEnabled: settings?.dealerNotificationEnabled ?? true,
    notificationAccentColor:
      settings?.notificationAccentColor?.trim() || DEFAULT_DEALER_NOTIFICATION_ACCENT_COLOR,
    dealerNotificationSubject:
      settings?.dealerNotificationSubject?.trim() || DEFAULT_DEALER_NOTIFICATION_SUBJECT,
    dealerNotificationBody:
      settings?.dealerNotificationBody?.trim() || DEFAULT_DEALER_NOTIFICATION_BODY,
    dealerPublishedSubject:
      settings?.dealerPublishedSubject?.trim() || DEFAULT_DEALER_PUBLISHED_SUBJECT,
    dealerPublishedBody: settings?.dealerPublishedBody?.trim() || DEFAULT_DEALER_PUBLISHED_BODY,
    recaptchaSiteKey: settings?.recaptchaSiteKey?.trim() || "",
    recaptchaSecretKey: settings?.recaptchaSecretKey?.trim() || "",
    recaptchaVersion: settings?.recaptchaVersion ?? null,
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
    searchPanelHeadingLabel:
      language?.searchPanelHeadingLabel ?? DEFAULT_LANGUAGE_CONTENT.searchPanelHeadingLabel,
    resultsPanelHeadingLabel:
      language?.resultsPanelHeadingLabel ?? DEFAULT_LANGUAGE_CONTENT.resultsPanelHeadingLabel,
    searchPlaceholder: language?.searchPlaceholder ?? DEFAULT_LANGUAGE_CONTENT.searchPlaceholder,
    searchInputLabel: language?.searchInputLabel ?? DEFAULT_LANGUAGE_CONTENT.searchInputLabel,
    searchButtonLabel: language?.searchButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.searchButtonLabel,
    loadingLabel: language?.loadingLabel ?? DEFAULT_LANGUAGE_CONTENT.loadingLabel,
    loadingLocationsLabel:
      language?.loadingLocationsLabel ?? DEFAULT_LANGUAGE_CONTENT.loadingLocationsLabel,
    geolocationButtonLabel:
      language?.geolocationButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.geolocationButtonLabel,
    geolocationLoadingLabel:
      language?.geolocationLoadingLabel ?? DEFAULT_LANGUAGE_CONTENT.geolocationLoadingLabel,
    filterDropdownButtonLabel:
      language?.filterDropdownButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.filterDropdownButtonLabel,
    resetFiltersButtonLabel:
      language?.resetFiltersButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.resetFiltersButtonLabel,
    initialMessageHtml: language?.initialMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.initialMessageHtml,
    noResultsMessageHtml:
      language?.noResultsMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.noResultsMessageHtml,
    emptyResultsNearbyMessage:
      language?.emptyResultsNearbyMessage ?? DEFAULT_LANGUAGE_CONTENT.emptyResultsNearbyMessage,
    addressNotFoundMessageHtml:
      language?.addressNotFoundMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.addressNotFoundMessageHtml,
    geolocationErrorMessageHtml:
      language?.geolocationErrorMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.geolocationErrorMessageHtml,
    rateLimitedMessageHtml:
      language?.rateLimitedMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.rateLimitedMessageHtml,
    genericErrorMessageHtml:
      language?.genericErrorMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.genericErrorMessageHtml,
    directionsLinkLabel: language?.directionsLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.directionsLinkLabel,
    websiteLinkLabel: language?.websiteLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.websiteLinkLabel,
    popupCloseLabel: language?.popupCloseLabel ?? DEFAULT_LANGUAGE_CONTENT.popupCloseLabel,
    fullscreenToggleLabel:
      language?.fullscreenToggleLabel ?? DEFAULT_LANGUAGE_CONTENT.fullscreenToggleLabel,
    locationLogoAltLabel:
      language?.locationLogoAltLabel ?? DEFAULT_LANGUAGE_CONTENT.locationLogoAltLabel,
    dealerFormUnavailableMessage:
      language?.dealerFormUnavailableMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormUnavailableMessage,
    dealerFormNoFieldsMessage:
      language?.dealerFormNoFieldsMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormNoFieldsMessage,
    dealerFormPleaseWaitMessage:
      language?.dealerFormPleaseWaitMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormPleaseWaitMessage,
    dealerFormFieldErrorFallbackMessage:
      language?.dealerFormFieldErrorFallbackMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormFieldErrorFallbackMessage,
    dealerFormHighlightedFieldsMessage:
      language?.dealerFormHighlightedFieldsMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormHighlightedFieldsMessage,
    dealerFormTooManyUploadsMessage:
      language?.dealerFormTooManyUploadsMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormTooManyUploadsMessage,
    dealerFormUploadTotalTooLargeMessage:
      language?.dealerFormUploadTotalTooLargeMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormUploadTotalTooLargeMessage,
    dealerFormRecaptchaFailedMessage:
      language?.dealerFormRecaptchaFailedMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormRecaptchaFailedMessage,
    dealerFormRequestTooLargeMessage:
      language?.dealerFormRequestTooLargeMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormRequestTooLargeMessage,
    dealerFormSubmitErrorMessage:
      language?.dealerFormSubmitErrorMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormSubmitErrorMessage,
    dealerFormTooManyRequestsMessage:
      language?.dealerFormTooManyRequestsMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormTooManyRequestsMessage,
    dealerFormContactRequiredMessage:
      language?.dealerFormContactRequiredMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormContactRequiredMessage,
    dealerFormContactNameTooLongMessage:
      language?.dealerFormContactNameTooLongMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormContactNameTooLongMessage,
    dealerFormContactEmailTooLongMessage:
      language?.dealerFormContactEmailTooLongMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormContactEmailTooLongMessage,
    dealerFormInvalidEmailMessage:
      language?.dealerFormInvalidEmailMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormInvalidEmailMessage,
    dealerFormAddressSuggestionRequiredMessage:
      language?.dealerFormAddressSuggestionRequiredMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormAddressSuggestionRequiredMessage,
    dealerFormAddressRequiredMessage:
      language?.dealerFormAddressRequiredMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormAddressRequiredMessage,
    dealerFormFieldLimitExceededMessage:
      language?.dealerFormFieldLimitExceededMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormFieldLimitExceededMessage,
    dealerFormFieldNotFoundMessage:
      language?.dealerFormFieldNotFoundMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormFieldNotFoundMessage,
    dealerFormCheckboxRequiredMessage:
      language?.dealerFormCheckboxRequiredMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormCheckboxRequiredMessage,
    dealerFormFileRequiredMessage:
      language?.dealerFormFileRequiredMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormFileRequiredMessage,
    dealerFormFileTooLargeMessage:
      language?.dealerFormFileTooLargeMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormFileTooLargeMessage,
    dealerFormImageFileRequiredMessage:
      language?.dealerFormImageFileRequiredMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormImageFileRequiredMessage,
    dealerFormRequiredFieldMessage:
      language?.dealerFormRequiredFieldMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormRequiredFieldMessage,
    dealerFormInvalidUrlMessage:
      language?.dealerFormInvalidUrlMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormInvalidUrlMessage,
    dealerFormInvalidSelectOptionMessage:
      language?.dealerFormInvalidSelectOptionMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormInvalidSelectOptionMessage,
    dealerFormInvalidNumberMessage:
      language?.dealerFormInvalidNumberMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormInvalidNumberMessage,
    dealerFormTextTooLongMessage:
      language?.dealerFormTextTooLongMessage ?? DEFAULT_LANGUAGE_CONTENT.dealerFormTextTooLongMessage,
    dealerFormAddressNoResultsMessage:
      language?.dealerFormAddressNoResultsMessage ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormAddressNoResultsMessage,
    dealerFormGenericInputPlaceholder:
      language?.dealerFormGenericInputPlaceholder ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormGenericInputPlaceholder,
    dealerFormContactNameLabel:
      language?.dealerFormContactNameLabel ?? DEFAULT_LANGUAGE_CONTENT.dealerFormContactNameLabel,
    dealerFormContactNamePlaceholder:
      language?.dealerFormContactNamePlaceholder ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormContactNamePlaceholder,
    dealerFormContactEmailLabel:
      language?.dealerFormContactEmailLabel ?? DEFAULT_LANGUAGE_CONTENT.dealerFormContactEmailLabel,
    dealerFormContactEmailPlaceholder:
      language?.dealerFormContactEmailPlaceholder ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormContactEmailPlaceholder,
    dealerFormAddressLookupLabel:
      language?.dealerFormAddressLookupLabel ?? DEFAULT_LANGUAGE_CONTENT.dealerFormAddressLookupLabel,
    dealerFormAddressLookupPlaceholder:
      language?.dealerFormAddressLookupPlaceholder ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormAddressLookupPlaceholder,
    dealerFormEnterAddressManuallyLabel:
      language?.dealerFormEnterAddressManuallyLabel ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormEnterAddressManuallyLabel,
    dealerFormHideAddressFieldsLabel:
      language?.dealerFormHideAddressFieldsLabel ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormHideAddressFieldsLabel,
    dealerFormAddressLine1Label:
      language?.dealerFormAddressLine1Label ?? DEFAULT_LANGUAGE_CONTENT.dealerFormAddressLine1Label,
    dealerFormAddressLine1Placeholder:
      language?.dealerFormAddressLine1Placeholder ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormAddressLine1Placeholder,
    dealerFormAddressLine2Label:
      language?.dealerFormAddressLine2Label ?? DEFAULT_LANGUAGE_CONTENT.dealerFormAddressLine2Label,
    dealerFormAddressLine2Placeholder:
      language?.dealerFormAddressLine2Placeholder ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormAddressLine2Placeholder,
    dealerFormCityLabel:
      language?.dealerFormCityLabel ?? DEFAULT_LANGUAGE_CONTENT.dealerFormCityLabel,
    dealerFormCityPlaceholder:
      language?.dealerFormCityPlaceholder ?? DEFAULT_LANGUAGE_CONTENT.dealerFormCityPlaceholder,
    dealerFormPostalCodeLabel:
      language?.dealerFormPostalCodeLabel ?? DEFAULT_LANGUAGE_CONTENT.dealerFormPostalCodeLabel,
    dealerFormPostalCodePlaceholder:
      language?.dealerFormPostalCodePlaceholder ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormPostalCodePlaceholder,
    dealerFormStateProvinceLabel:
      language?.dealerFormStateProvinceLabel ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormStateProvinceLabel,
    dealerFormStateProvincePlaceholder:
      language?.dealerFormStateProvincePlaceholder ??
      DEFAULT_LANGUAGE_CONTENT.dealerFormStateProvincePlaceholder,
    dealerFormCountryLabel:
      language?.dealerFormCountryLabel ?? DEFAULT_LANGUAGE_CONTENT.dealerFormCountryLabel,
    dealerFormCountryPlaceholder:
      language?.dealerFormCountryPlaceholder ?? DEFAULT_LANGUAGE_CONTENT.dealerFormCountryPlaceholder,
    debugReportBugLinkLabel:
      language?.debugReportBugLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugLinkLabel,
    debugReportBugCloseDialogLabel:
      language?.debugReportBugCloseDialogLabel ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugCloseDialogLabel,
    debugReportBugDialogTitle:
      language?.debugReportBugDialogTitle ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugDialogTitle,
    debugReportBugDialogDescription:
      language?.debugReportBugDialogDescription ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugDialogDescription,
    debugReportBugMessageLabel:
      language?.debugReportBugMessageLabel ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugMessageLabel,
    debugReportBugConsentPrefix:
      language?.debugReportBugConsentPrefix ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugConsentPrefix,
    privacyPolicyLinkLabel:
      language?.privacyPolicyLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.privacyPolicyLinkLabel,
    debugReportBugSubmitLabel:
      language?.debugReportBugSubmitLabel ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugSubmitLabel,
    debugReportBugSubmittingLabel:
      language?.debugReportBugSubmittingLabel ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugSubmittingLabel,
    debugReportBugCopyLabel:
      language?.debugReportBugCopyLabel ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugCopyLabel,
    debugReportBugSuccessMessage:
      language?.debugReportBugSuccessMessage ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugSuccessMessage,
    closeButtonLabel: language?.closeButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.closeButtonLabel,
    categoryLabels: language?.categoryLabels ?? [],
    customFieldLabels: language?.customFieldLabels ?? [],
    dealerFormFieldLabels: language?.dealerFormFieldLabels ?? [],
    dealerFormFieldPlaceholders: language?.dealerFormFieldPlaceholders ?? [],
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
    dealerForms: resolveDealerFormsSettings(settings?.dealerForms),
    language: resolveLanguageSettings(settings?.language),
  };
}
