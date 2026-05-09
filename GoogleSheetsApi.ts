import { z } from "zod";

import {
  GoogleSheetSyncMappingSchema,
  GoogleSheetSyncModelSchema,
  GoogleSheetSyncOptionsSchema,
} from "./GoogleSheetSync";
import { LocationStatusResult } from "./Location";

export const GoogleSheetReferenceSchema = z.object({
  id: z.number().int().nonnegative(),
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

export type GoogleSheetSyncSummaryResponse = z.infer<typeof GoogleSheetSyncSummaryResponseSchema>;

const GoogleSheetPreviewCellValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const GoogleSheetPreviewRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  values: z.record(z.string(), GoogleSheetPreviewCellValueSchema),
});

export type GoogleSheetPreviewRow = z.infer<typeof GoogleSheetPreviewRowSchema>;

export const GoogleSheetHeadersResponseSchema = z.object({
  spreadsheetId: z.string().min(1),
  sheetId: z.number().int().nonnegative(),
  headerRow: z.number().int().positive(),
  dataStartRow: z.number().int().positive(),
  headers: z.array(z.string()),
  sampleRows: z.array(GoogleSheetPreviewRowSchema).optional().nullable(),
});

export type GoogleSheetHeadersResponse = z.infer<typeof GoogleSheetHeadersResponseSchema>;

export const ConfigureGoogleSheetSyncResultSchema = z.object({
  created: z.number().int().nonnegative(),
  updated: z.number().int().nonnegative(),
  deleted: z.number().int().nonnegative(),
  errors: z.array(z.string()).optional().nullable(),
});

export type ConfigureGoogleSheetSyncResult = z.infer<typeof ConfigureGoogleSheetSyncResultSchema>;

export const ConfigureGoogleSheetSyncResponseSchema = z.object({
  result: ConfigureGoogleSheetSyncResultSchema,
  sync: GoogleSheetSyncModelSchema,
});

export type ConfigureGoogleSheetSyncResponse = z.infer<typeof ConfigureGoogleSheetSyncResponseSchema>;

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
