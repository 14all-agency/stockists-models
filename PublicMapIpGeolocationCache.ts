import { z } from "zod";

export const PublicMapIpGeolocationCacheCollection = "publicMapIpGeolocationCache";

export const PublicMapIpGeolocationCoordinatesSchema = z.tuple([z.number(), z.number()]);

export type PublicMapIpGeolocationCoordinates = z.infer<
  typeof PublicMapIpGeolocationCoordinatesSchema
>;

export const PublicMapIpGeolocationCacheEntitySchema = z.object({
  _id: z.string(),
  ip: z.string(),
  coordinates: PublicMapIpGeolocationCoordinatesSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PublicMapIpGeolocationCacheEntity = z.infer<
  typeof PublicMapIpGeolocationCacheEntitySchema
>;
