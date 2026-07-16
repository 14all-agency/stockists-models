import { z } from "zod";

export const LOCATION_CONTACT_FIELD_LABELS = {
  website: "Website",
  emailAddress: "Email address",
  logoUrl: "Logo URL",
} as const;

export type LocationContactFieldKey = keyof typeof LOCATION_CONTACT_FIELD_LABELS;

function normalizeStringInput(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  return normalizeOptionalLocationString(value);
}

export function normalizeOptionalLocationString(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

const LocationUrlResult = z.preprocess(
  normalizeStringInput,
  z.string().url().optional().nullable(),
);
const LocationEmailResult = z.preprocess(
  normalizeStringInput,
  z.string().email().optional().nullable(),
);

export const LocationWebsiteResult = LocationUrlResult;
export const LocationEmailAddressResult = LocationEmailResult;
export const LocationLogoUrlResult = LocationUrlResult;

export const LocationWebsiteInputSchema = LocationUrlResult;
export const LocationEmailAddressInputSchema = LocationEmailResult;
export const LocationLogoUrlInputSchema = LocationUrlResult;

export function isValidLocationUrl(value: string | null | undefined) {
  return LocationUrlResult.safeParse(normalizeOptionalLocationString(value)).success;
}

export function isValidLocationEmail(value: string | null | undefined) {
  return LocationEmailResult.safeParse(normalizeOptionalLocationString(value)).success;
}

export function getInvalidLocationContactFields(
  value: Partial<Record<LocationContactFieldKey, string | null | undefined>>,
) {
  return (Object.keys(LOCATION_CONTACT_FIELD_LABELS) as LocationContactFieldKey[]).filter(
    (key) =>
      key === "emailAddress"
        ? !isValidLocationEmail(value[key])
        : !isValidLocationUrl(value[key]),
  );
}

export function getLocationContactFieldValidationMessage(key: LocationContactFieldKey) {
  const label = LOCATION_CONTACT_FIELD_LABELS[key];

  return key === "emailAddress"
    ? `${label} must be valid when provided.`
    : `${label} must be a valid URL when provided.`;
}
