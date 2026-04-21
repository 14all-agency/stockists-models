import { ObjectId } from "bson";
import { z } from "zod";

export const ShopifyConnectionResult = z.object({
  apiKey: z.string(),
  domain: z.string(),
  scopes: z.string().nullable().optional().describe("The scopes approved (comma seperated string)"),
  tokenMode: z
    .union([z.literal("NON_EXPIRING_OFFLINE"), z.literal("EXPIRING_OFFLINE")])
    .optional()
    .nullable()
    .describe("Whether stored offline Shopify token is legacy non-expiring or expiring"),
  accessTokenExpiresAt: z
    .date()
    .optional()
    .nullable()
    .describe("When expiring offline access token expires"),
  refreshToken: z
    .string()
    .optional()
    .nullable()
    .describe("Refresh token used to rotate expiring offline access tokens"),
  refreshTokenExpiresAt: z
    .date()
    .optional()
    .nullable()
    .describe("When expiring offline refresh token expires")
}).optional().nullable();

export type ShopifyConnection = z.infer<typeof ShopifyConnectionResult>;

export const ShopifyStatusResult = z.union([
  z.literal("ACTIVE"),
  z.literal("PENDING"),
  z.literal("INACTIVE"),
  z.literal("ERROR"),
]).optional().nullable();

export const SettingsResult = z.object({
  // todo
}).optional().nullable().describe("Null infers not onboarded/saved");

export type Settings = z.infer<typeof SettingsResult>;

export const OrganisationResult = z.object({
  _id: z.instanceof(ObjectId),
  country: z.string().optional().nullable().describe("country of origin"),
  contactEmail: z.string().optional().nullable().describe("The email to contact for this org"),
  locale: z.string().optional().nullable().describe("shop locale / language"),
  passwordProtected: z.boolean().optional().nullable().describe("whether or not store is password protected"),
  reviewed: z.boolean().optional().nullable().describe("whether or not store has engaged with review element"),
  reviewSurface: z.string().optional().nullable().describe("where they left a review"),
  rating: z.number().optional().nullable().describe("rating score"),
  plan: z.string().optional().nullable().describe("shopify plan"),
  website: z.string().optional().nullable().describe("website URL"),
  settingsLastSynced: z.date().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  shopifyConnection: ShopifyConnectionResult,
  shopifyConnectionStatus: ShopifyStatusResult,
  name: z.string().optional().nullable().describe("Org/brand name"),
  currency: z.string().optional().nullable().describe("shop base currency code"),
  timezone: z.string().optional().nullable().describe("shop timezone"),
  shopCreatedAt: z.string().optional().nullable().describe("shop created at"),
  // Custom
  settings: SettingsResult,
  // Billing stuff
  billingPlanStatus: z.union([
    z.literal("INACTIVE"),
    z.literal("ACTIVE"),
  ]).optional().nullable(),
  billingSubscriptionId: z.string().optional().nullable(),
  billingPlanHandle: z.string().optional().nullable(),
  billingUpdatedAt: z.date().nullable().optional(),
});

export type OrganisationResultEntity = z.infer<typeof OrganisationResult>;

export const OrganisationModelSchema = z.object({
  id: z.string(),
  country: OrganisationResult.shape.country,
  contactEmail: OrganisationResult.shape.contactEmail,
  passwordProtected: OrganisationResult.shape.passwordProtected,
  locale: OrganisationResult.shape.locale,
  reviewed: OrganisationResult.shape.reviewed,
  reviewSurface: OrganisationResult.shape.reviewSurface,
  rating: OrganisationResult.shape.rating,
  plan: OrganisationResult.shape.plan,
  website: OrganisationResult.shape.website,
  shopifyConnection: OrganisationResult.shape.shopifyConnection,
  shopifyConnectionStatus: OrganisationResult.shape.shopifyConnectionStatus,
  name: OrganisationResult.shape.name,
  shopCreatedAt: OrganisationResult.shape.shopCreatedAt,
  timezone: OrganisationResult.shape.timezone,
  currency: OrganisationResult.shape.currency,
  createdAt: OrganisationResult.shape.createdAt,
  settingsLastSynced: OrganisationResult.shape.settingsLastSynced,
  shopifySite: z.string().nullable().optional(),
  // custom
  settings: OrganisationResult.shape.settings,
  // billing
  billingPlanStatus: OrganisationResult.shape.billingPlanStatus,
  billingSubscriptionId: OrganisationResult.shape.billingSubscriptionId,
  billingPlanHandle: OrganisationResult.shape.billingPlanHandle,
  billingUpdatedAt: OrganisationResult.shape.billingUpdatedAt,
});

export type OrganisationModel = z.infer<typeof OrganisationModelSchema>;

export const OrganisationModel = {
  convertFromEntity(entity: OrganisationResultEntity, includeCredentials = false): OrganisationModel {
    if(includeCredentials) {
      console.log("includeCredentials IS TRUE");
    }

    const obj: OrganisationModel = {
      id: entity._id.toHexString(),
      country: entity.country ?? null,
      passwordProtected: entity.passwordProtected ?? null,
      contactEmail: entity.contactEmail ?? null,
      locale: entity.locale ?? null,
      reviewed: entity.reviewed ?? null,
      reviewSurface: entity.reviewSurface ?? null,
      rating: entity.rating ?? null,
      plan: entity.plan ?? null,
      website: entity.website ?? null,
      name: entity.name ?? null,
      timezone: entity.timezone ?? null,
      shopCreatedAt: entity.shopCreatedAt ?? null,
      currency: entity.currency ?? null,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      settingsLastSynced: entity.settingsLastSynced ? new Date(entity.settingsLastSynced) : null,
      shopifyConnection: includeCredentials ? (entity.shopifyConnection ?? null) : null,
      shopifyConnectionStatus: entity.shopifyConnectionStatus ?? "INACTIVE",
      shopifySite: entity?.shopifyConnection?.domain ?? null,
      // custom
      settings: entity.settings ?? null,
      // billing
      billingPlanStatus: entity.billingPlanStatus ?? "INACTIVE",
      billingSubscriptionId: entity.billingSubscriptionId ?? null,
      billingPlanHandle: entity.billingPlanHandle ?? null,
      billingUpdatedAt: entity.billingUpdatedAt ? new Date(entity.billingUpdatedAt) : null,
    };

    return OrganisationModelSchema.parse(obj);
  },
};
