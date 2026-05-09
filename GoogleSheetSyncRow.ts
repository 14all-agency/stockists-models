import { ObjectId } from "bson";
import { z } from "zod";

export const GoogleSheetSyncRowEntitySchema = z.object({
  _id: z.instanceof(ObjectId),
  sync: z.instanceof(ObjectId),
  org: z.instanceof(ObjectId),
  externalId: z.string().min(1),
  locationId: z.instanceof(ObjectId),
  rowHash: z.string().min(1),
  rowNumber: z.number().int().positive(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type GoogleSheetSyncRowEntity = z.infer<typeof GoogleSheetSyncRowEntitySchema>;
