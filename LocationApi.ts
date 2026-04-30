import { z } from "zod";

import {
  CoordinatesSchema,
  LocationCustomFieldSchema,
  LocationFilterSchema,
  LocationModelSchema,
  LocationStatusResult,
} from "./Location";

const NullableStringInput = z.string().optional().nullable();
const NullableNumberInput = z.number().optional().nullable();

export const CreateLocationBodySchema = z.object({
  status: LocationStatusResult,
  name: z.string().min(1),
  addressLine1: NullableStringInput,
  addressLine2: NullableStringInput,
  city: NullableStringInput,
  postalCode: NullableStringInput,
  stateProvince: NullableStringInput,
  country: NullableStringInput,
  phoneNumber: NullableStringInput,
  website: NullableStringInput,
  emailAddress: NullableStringInput,
  logoUrl: NullableStringInput,
  notes: NullableStringInput,
  customFields: z.array(LocationCustomFieldSchema).optional().nullable(),
  filters: z.array(LocationFilterSchema).optional().nullable(),
  priority: NullableNumberInput,
  coordinates: CoordinatesSchema.shape.coordinates,
});

export type CreateLocationBody = z.infer<typeof CreateLocationBodySchema>;

export const UpdateLocationBodySchema = z
  .object({
    id: z.string().min(1),
    status: LocationStatusResult,
    name: NullableStringInput,
    addressLine1: NullableStringInput,
    addressLine2: NullableStringInput,
    city: NullableStringInput,
    postalCode: NullableStringInput,
    stateProvince: NullableStringInput,
    country: NullableStringInput,
    phoneNumber: NullableStringInput,
    website: NullableStringInput,
    emailAddress: NullableStringInput,
    logoUrl: NullableStringInput,
    notes: NullableStringInput,
    customFields: z.array(LocationCustomFieldSchema).optional().nullable(),
    filters: z.array(LocationFilterSchema).optional().nullable(),
    priority: NullableNumberInput,
    coordinates: CoordinatesSchema.shape.coordinates,
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 1) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided for update",
        path: ["id"],
      });
    }
  });

export type UpdateLocationBody = z.infer<typeof UpdateLocationBodySchema>;

export const BulkCreateLocationsBodySchema = z.object({
  locations: z.array(CreateLocationBodySchema).min(1),
});

export type BulkCreateLocationsBody = z.infer<typeof BulkCreateLocationsBodySchema>;

export const ImportLocationBodySchema = CreateLocationBodySchema.extend({
  id: z.string().min(1).optional().nullable(),
  formattedAddress: z.string().optional().nullable(),
});

export type ImportLocationBody = z.infer<typeof ImportLocationBodySchema>;

export const ImportLocationsBulkOptionsSchema = z.object({
  matchExistingByAddressOrCoordinates: z.boolean().optional().nullable(),
  resolveCoordinatesFromAddress: z.boolean().optional().nullable(),
  parseFormattedAddress: z.boolean().optional().nullable(),
});

export type ImportLocationsBulkOptions = z.infer<typeof ImportLocationsBulkOptionsSchema>;

export const ImportLocationsBulkBodySchema = z.object({
  locations: z.array(ImportLocationBodySchema).min(1),
  options: ImportLocationsBulkOptionsSchema.optional().nullable(),
});

export type ImportLocationsBulkBody = z.infer<typeof ImportLocationsBulkBodySchema>;

export const ImportLocationsBulkSkippedSchema = z.object({
  row: z.number().int().positive(),
  reason: z.string().min(1),
});

export type ImportLocationsBulkSkipped = z.infer<typeof ImportLocationsBulkSkippedSchema>;

export const ImportLocationsBulkResponseSchema = z.object({
  created: z.array(LocationModelSchema).optional().nullable(),
  updated: z.array(LocationModelSchema).optional().nullable(),
  skipped: z.array(ImportLocationsBulkSkippedSchema).optional().nullable(),
});

export type ImportLocationsBulkResponse = z.infer<typeof ImportLocationsBulkResponseSchema>;

export const BulkUpdateLocationsBodySchema = z.object({
  locations: z.array(UpdateLocationBodySchema).min(1),
});

export type BulkUpdateLocationsBody = z.infer<typeof BulkUpdateLocationsBodySchema>;

export const BulkDeleteLocationsBodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export type BulkDeleteLocationsBody = z.infer<typeof BulkDeleteLocationsBodySchema>;

export const QueueLocationGeocodeBodySchema = z.object({
  locationIds: z.array(z.string().min(1)).min(1),
});

export type QueueLocationGeocodeBody = z.infer<typeof QueueLocationGeocodeBodySchema>;

export const DuplicateLocationAuditSchema = z.object({
  recommendedKeep: z.string().min(1),
  recommendedDelete: z.string().min(1),
  oldestLocation: z.string().min(1),
  newestLocation: z.string().min(1),
});

export const LocationMaintenanceAuditResponseSchema = z.object({
  missingAddressParts: z.array(z.string().min(1)),
  missingCoordinates: z.array(z.string().min(1)),
  duplicateLocations: z.array(DuplicateLocationAuditSchema),
});

export type LocationMaintenanceAuditResponse = z.infer<typeof LocationMaintenanceAuditResponseSchema>;

export const LocationGeocodeJobsSummaryResponseSchema = z.object({
  processing: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});

export type LocationGeocodeJobsSummaryResponse = z.infer<typeof LocationGeocodeJobsSummaryResponseSchema>;

const GetLocationsQuerySchema = z.object({
  limit: z.number().int().positive().max(1000).optional().nullable(),
  page: z.number().int().positive().default(1),
  ids: z.array(z.string().min(1)).optional().nullable(),
  search: z.string().optional().nullable(),
  status: LocationStatusResult,
  categories: z.array(z.string().min(1)).optional().nullable(),
});

export type GetLocationsQuery = z.infer<typeof GetLocationsQuerySchema>;

function normaliseOptionalQueryString(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function normaliseQueryStringList(values: Array<string | null | undefined>) {
  const normalised = values
    .flatMap((value) => (value ?? "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return normalised.length ? [...new Set(normalised)] : null;
}

function parseBody<T>(
  body: string | null | undefined,
  schema: z.ZodType<T>,
): T {
  if (!body) {
    throw new Error("Request body is not valid");
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(body);
  } catch {
    throw new Error("Request body is not valid");
  }

  const parsed = schema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ") || "Request body is not valid",
    );
  }

  return parsed.data;
}

export function parseCreateLocationBody(body: string | null | undefined): CreateLocationBody {
  return parseBody(body, CreateLocationBodySchema);
}

export function parseUpdateLocationBody(body: string | null | undefined): UpdateLocationBody {
  return parseBody(body, UpdateLocationBodySchema);
}

export function parseBulkCreateLocationsBody(
  body: string | null | undefined,
): BulkCreateLocationsBody {
  return parseBody(body, BulkCreateLocationsBodySchema);
}

export function parseImportLocationsBulkBody(
  body: string | null | undefined,
): ImportLocationsBulkBody {
  return parseBody(body, ImportLocationsBulkBodySchema);
}

export function parseBulkUpdateLocationsBody(
  body: string | null | undefined,
): BulkUpdateLocationsBody {
  return parseBody(body, BulkUpdateLocationsBodySchema);
}

export function parseBulkDeleteLocationsBody(
  body: string | null | undefined,
): BulkDeleteLocationsBody {
  return parseBody(body, BulkDeleteLocationsBodySchema);
}

export function parseQueueLocationGeocodeBody(
  body: string | null | undefined,
): QueueLocationGeocodeBody {
  return parseBody(body, QueueLocationGeocodeBodySchema);
}


export function parseGetLocationsQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
  multiValueQueryStringParameters?:
    | Record<string, Array<string | null | undefined> | null | undefined>
    | null;
}): GetLocationsQuery {
  const queryStringParameters = input.queryStringParameters ?? {};
  const multiValueQueryStringParameters = input.multiValueQueryStringParameters ?? {};

  const limitValue = normaliseOptionalQueryString(queryStringParameters.limit);
  const pageValue = normaliseOptionalQueryString(queryStringParameters.page);

  const parsed = GetLocationsQuerySchema.safeParse({
    limit: limitValue === null ? null : Number(limitValue),
    page: pageValue === null ? 1 : Number(pageValue),
    ids: normaliseQueryStringList([
      ...(multiValueQueryStringParameters.ids ?? []),
      queryStringParameters.ids,
    ]),
    search: normaliseOptionalQueryString(queryStringParameters.search),
    status: normaliseOptionalQueryString(queryStringParameters.status),
    categories: normaliseQueryStringList([
      ...(multiValueQueryStringParameters.categories ?? []),
      queryStringParameters.categories,
    ]),
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ") || "Query parameters are not valid",
    );
  }

  return parsed.data;
}
