import { ObjectId } from "bson";
import { z } from "zod";

export const DealerFormEmailUnsubscribeEntitySchema = z.object({
  _id: z.instanceof(ObjectId),
  org: z.instanceof(ObjectId),
  email: z.string().email(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type DealerFormEmailUnsubscribeEntity = z.infer<
  typeof DealerFormEmailUnsubscribeEntitySchema
>;
