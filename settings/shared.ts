import { z } from "zod";

export const NullableString = z.string().optional().nullable();
export const NullableBoolean = z.boolean().optional().nullable();
export const NullableNumber = z.number().optional().nullable();

export function createSettingsConverter<T>(schema: z.ZodType<T>) {
  return {
    parse(input: unknown): T {
      return schema.parse(input);
    },
    convertFromEntity(input: T | null | undefined): T | null {
      if (input === null || input === undefined) {
        return null;
      }

      return schema.parse(input);
    },
    convertToEntity(input: T | null | undefined): T | null {
      if (input === null || input === undefined) {
        return null;
      }

      return schema.parse(input);
    },
  };
}
