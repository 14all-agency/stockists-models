import { ObjectId } from "bson";
import { z } from "zod";

import { DealerFormFieldTypeSchema } from "./settings/dealerForms";

export const DealerFormSubmissionStatusSchema = z
  .enum(["SUBMITTED", "APPROVED", "REJECTED"])
  .optional()
  .nullable();

export const DealerFormAddressValueSchema = z.object({
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  stateProvince: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

export type DealerFormAddressValue = z.infer<typeof DealerFormAddressValueSchema>;

export const DealerFormContactValueSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

export type DealerFormContactValue = z.infer<typeof DealerFormContactValueSchema>;

export const DealerFormSubmissionStoredValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  DealerFormAddressValueSchema,
  DealerFormContactValueSchema,
]);

export const DealerFormSubmissionFieldValueSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: DealerFormFieldTypeSchema,
  required: z.boolean().optional().nullable(),
  value: DealerFormSubmissionStoredValueSchema.optional().nullable(),
});

export type DealerFormSubmissionFieldValue = z.infer<typeof DealerFormSubmissionFieldValueSchema>;

export const DealerFormSubmissionEntitySchema = z.object({
  _id: z.instanceof(ObjectId),
  org: z.instanceof(ObjectId),
  status: DealerFormSubmissionStatusSchema,
  publishedLocationId: z.instanceof(ObjectId).optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  fields: z.array(DealerFormSubmissionFieldValueSchema),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type DealerFormSubmissionEntity = z.infer<typeof DealerFormSubmissionEntitySchema>;

export const DealerFormSubmissionModelSchema = z.object({
  id: z.string(),
  org: z.string(),
  status: DealerFormSubmissionStatusSchema,
  publishedLocationId: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  fields: z.array(DealerFormSubmissionFieldValueSchema),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type DealerFormSubmissionModel = z.infer<typeof DealerFormSubmissionModelSchema>;

export const DealerFormSubmissionModel = {
  convertFromEntity(entity: DealerFormSubmissionEntity): DealerFormSubmissionModel {
    return DealerFormSubmissionModelSchema.parse({
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      status: entity.status ?? "SUBMITTED",
      publishedLocationId: entity.publishedLocationId?.toHexString() ?? null,
      contactName: entity.contactName ?? null,
      contactEmail: entity.contactEmail ?? null,
      locationName: entity.locationName ?? null,
      fields: entity.fields,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    });
  },
};
