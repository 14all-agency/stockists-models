import { z } from "zod";

import {
  GoogleSheetSyncMappingSchema,
  GoogleSheetSyncModelSchema,
  GoogleSheetSyncOptionsSchema,
} from "./GoogleSheetSync";
import { LocationStatusResult } from "./Location";

export const GoogleSheetReferenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export type GoogleSheetReference = z.infer<typeof GoogleSheetReferenceSchema>;

export const GoogleSpreadsheetReferenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
});

export type GoogleSpreadsheetReference = z.infer<typeof GoogleSpreadsheetReferenceSchema>;

export const ConfigureGoogleSheetSyncBodySchema = z.object({
  spreadsheetId: z.string().min(1),
  spreadsheetName: z.string().min(1),
  spreadsheetUrl: z.string().url(),
  sheetId: z.number().int().nonnegative(),
  sheetName: z.string().min(1),
  headerRow: z.number().int().positive().default(1),
  dataStartRow: z.number().int().positive().default(2),
  externalIdColumn: z.string().min(1),
  externalIdFallbackStatus: LocationStatusResult,
  mappings: z.array(GoogleSheetSyncMappingSchema).min(1),
  options: GoogleSheetSyncOptionsSchema.optional().nullable(),
});

export type ConfigureGoogleSheetSyncBody = z.infer<typeof ConfigureGoogleSheetSyncBodySchema>;

export const GoogleSheetSyncSummaryResponseSchema = z.object({
  sync: GoogleSheetSyncModelSchema.optional().nullable(),
  connected: z.boolean(),
});

export function parseConfigureGoogleSheetSyncBody(body: string | null | undefined) {
  if (!body) {
    throw new Error("Request body is not valid");
  }

  const parsedJson = JSON.parse(body) as unknown;
  const parsed = ConfigureGoogleSheetSyncBodySchema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  return parsed.data;
}
