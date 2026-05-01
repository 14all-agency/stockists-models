import { ObjectId } from "bson";
import { z } from "zod";

export const LocationStatusResult = z
  .union([
    z.literal("ACTIVE"),
    z.literal("UNLISTED"),
    z.literal("INACTIVE"),
  ])
  .optional()
  .nullable();

export type LocationStatus = z.infer<typeof LocationStatusResult>;

export const LocationCustomFieldTypeResult = z
  .union([
    z.literal("TEXT"),
    z.literal("TEXT_MULTILINE"),
    z.literal("LINK"),
  ])
  .optional()
  .nullable();

export type LocationCustomFieldType = z.infer<typeof LocationCustomFieldTypeResult>;

export const LocationCustomFieldSchema = z.object({
  key: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  type: LocationCustomFieldTypeResult.describe("Display/input type for this custom field"),
  value: z.string().optional().nullable(),
  showOnListing: z.boolean().optional().nullable().describe("Whether this field is visible in storefront location listings"),
}).superRefine((value, ctx) => {
  if (value.value === null || value.value === undefined || !value.type) {
    return;
  }

  if (typeof value.value !== "string") {
    ctx.addIssue({
      code: "custom",
      message: "Custom field value must be a string",
      path: ["value"],
    });
  }

  if (value.type === "LINK" && typeof value.value === "string") {
    const parsed = z.string().url().safeParse(value.value);

    if (!parsed.success) {
      ctx.addIssue({
        code: "custom",
        message: "Custom field value must be a valid URL",
        path: ["value"],
      });
    }
  }
});

export type LocationCustomField = z.infer<typeof LocationCustomFieldSchema>;

export const LocationFilterSchema = z.object({
  key: z.string().optional().nullable(),
  value: z.string().optional().nullable(),
});

export type LocationFilter = z.infer<typeof LocationFilterSchema>;

type LegacyCoordinates = {
  coordinates?: [number, number] | null;
  lat?: number | null;
  lng?: number | null;
};

function validateCoordinates(
  value: {
    coordinates?: [number, number] | null;
  },
  ctx: z.RefinementCtx,
) {
  if (value.coordinates !== undefined && value.coordinates !== null && value.coordinates.length !== 2) {
    ctx.addIssue({
      code: "custom",
      message: "coordinates must contain longitude and latitude",
      path: ["coordinates"],
    });
  }
}

export const CoordinatesSchema = z
  .object({
    coordinates: z
      .tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90),
      ])
      .optional()
      .nullable()
      .describe("Coordinates pair in [longitude, latitude] order"),
  })
  .superRefine(validateCoordinates);

export const LocationEntityResult = z
  .object({
    _id: z.instanceof(ObjectId),
    org: z.instanceof(ObjectId).describe("Organisation that owns this location"),
    status: LocationStatusResult.describe("Location visibility and publication state"),
    name: z.string().optional().nullable(),
    addressLine1: z.string().optional().nullable(),
    addressLine2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    stateProvince: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    website: z.string().url().optional().nullable(),
    emailAddress: z.string().email().optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
    notes: z.string().optional().nullable(),
    customFields: z.array(LocationCustomFieldSchema).optional().nullable(),
    filters: z.array(LocationFilterSchema).optional().nullable(),
    priority: z.number().optional().nullable(),
    suppressWarnings: z.boolean().optional().nullable(),
    coordinates: CoordinatesSchema.shape.coordinates,
    createdAt: z.date().optional().nullable(),
    updatedAt: z.date().optional().nullable(),
  })
  .superRefine(validateCoordinates);

export type LocationEntity = z.infer<typeof LocationEntityResult>;

export const LocationModelSchema = z
  .object({
    id: z.string(),
    org: z.string(),
    status: LocationEntityResult.shape.status,
    name: LocationEntityResult.shape.name,
    addressLine1: LocationEntityResult.shape.addressLine1,
    addressLine2: LocationEntityResult.shape.addressLine2,
    city: LocationEntityResult.shape.city,
    postalCode: LocationEntityResult.shape.postalCode,
    stateProvince: LocationEntityResult.shape.stateProvince,
    country: LocationEntityResult.shape.country,
    phoneNumber: LocationEntityResult.shape.phoneNumber,
    website: LocationEntityResult.shape.website,
    emailAddress: LocationEntityResult.shape.emailAddress,
    logoUrl: LocationEntityResult.shape.logoUrl,
    notes: LocationEntityResult.shape.notes,
    customFields: LocationEntityResult.shape.customFields,
    filters: LocationEntityResult.shape.filters,
    priority: LocationEntityResult.shape.priority,
    suppressWarnings: LocationEntityResult.shape.suppressWarnings,
    coordinates: LocationEntityResult.shape.coordinates,
    createdAt: LocationEntityResult.shape.createdAt,
    updatedAt: LocationEntityResult.shape.updatedAt,
  })
  .superRefine(validateCoordinates);

export type LocationModel = z.infer<typeof LocationModelSchema>;

export function getLocationCoordinates(value: LegacyCoordinates) {
  if (value.coordinates !== undefined) {
    return value.coordinates ?? null;
  }

  const hasLat = value.lat !== null && value.lat !== undefined;
  const hasLng = value.lng !== null && value.lng !== undefined;

  if (hasLat && hasLng) {
    return [value.lng as number, value.lat as number] as [number, number];
  }

  return null;
}

export const LocationModel = {
  convertFromEntity(entity: LocationEntity & LegacyCoordinates): LocationModel {
    const obj: LocationModel = {
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      status: entity.status ?? null,
      name: entity.name ?? null,
      addressLine1: entity.addressLine1 ?? null,
      addressLine2: entity.addressLine2 ?? null,
      city: entity.city ?? null,
      postalCode: entity.postalCode ?? null,
      stateProvince: entity.stateProvince ?? null,
      country: entity.country ?? null,
      phoneNumber: entity.phoneNumber ?? null,
      website: entity.website ?? null,
      emailAddress: entity.emailAddress ?? null,
      logoUrl: entity.logoUrl ?? null,
      notes: entity.notes ?? null,
      customFields: entity.customFields ?? null,
      filters: entity.filters ?? null,
      priority: entity.priority ?? null,
      suppressWarnings: entity.suppressWarnings ?? null,
      coordinates: getLocationCoordinates(entity),
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    };

    return LocationModelSchema.parse(obj);
  },
};
