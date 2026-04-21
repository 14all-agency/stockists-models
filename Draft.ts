/**
 * Defines MongoDB entity and API model shapes for org-owned generated drafts.
 */
import { ObjectId } from "bson";
import { z } from "zod";

import { RedditSearchModelEntrySchema } from "./RedditSearch";

export const PromotionToneResult = z
  .union([z.literal("subtle"), z.literal("direct"), z.literal("extra_subtle")])
  .optional()
  .nullable();

export type PromotionTone = z.infer<typeof PromotionToneResult>;

export const DraftEntityResult = z.object({
  _id: z.instanceof(ObjectId),
  org: z.instanceof(ObjectId).describe("Organisation that owns this draft"),
  promotionTone: PromotionToneResult.describe("How strongly this draft should promote"),
  content: z.string().optional().nullable().describe("Draft content"),
  customInstructions: z.string().optional().nullable().describe("Extra instructions used to shape draft"),
  promotionLink: z.string().optional().nullable().describe("Link promoted by this draft"),
  referenceId: z.string().optional().nullable().describe("Source/reference id, e.g. Reddit comment id"),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type DraftEntity = z.infer<typeof DraftEntityResult>;

export const DraftModelSchema = z.object({
  id: z.string(),
  org: z.string(),
  promotionTone: DraftEntityResult.shape.promotionTone,
  content: DraftEntityResult.shape.content,
  customInstructions: DraftEntityResult.shape.customInstructions,
  promotionLink: DraftEntityResult.shape.promotionLink,
  referenceId: DraftEntityResult.shape.referenceId,
  createdAt: DraftEntityResult.shape.createdAt,
  updatedAt: DraftEntityResult.shape.updatedAt,
});

export type DraftModel = z.infer<typeof DraftModelSchema>;

export const DraftWithReferenceModelSchema = DraftModelSchema.extend({
  referenceEntity: RedditSearchModelEntrySchema.optional().nullable(),
});

export type DraftWithReferenceModel = z.infer<typeof DraftWithReferenceModelSchema>;

export const DraftModel = {
  convertFromEntity(entity: DraftEntity): DraftModel {
    const obj: DraftModel = {
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      promotionTone: entity.promotionTone ?? null,
      content: entity.content ?? null,
      customInstructions: entity.customInstructions ?? null,
      promotionLink: entity.promotionLink ?? null,
      referenceId: entity.referenceId ?? null,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    };

    return DraftModelSchema.parse(obj);
  },

  convertWithReferenceFromEntity(
    entity: DraftEntity,
    referenceEntity: DraftWithReferenceModel["referenceEntity"],
  ): DraftWithReferenceModel {
    return DraftWithReferenceModelSchema.parse({
      ...DraftModel.convertFromEntity(entity),
      referenceEntity: referenceEntity ?? null,
    });
  },
};
