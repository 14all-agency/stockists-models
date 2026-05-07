import { z } from "zod";

import {
  DealerFormAddressValueSchema,
  DealerFormContactValueSchema,
  DealerFormSubmissionStatusSchema,
} from "./DealerFormSubmission";
import { DealerFormFieldTypeSchema } from "./settings/dealerForms";

const NullableString = z.string().optional().nullable();

export const DealerFormSubmissionInputValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  DealerFormAddressValueSchema,
  DealerFormContactValueSchema,
  z.null(),
]);

export const DealerFormSubmissionInputFieldSchema = z.object({
  key: z.string().min(1),
  value: DealerFormSubmissionInputValueSchema,
});

export const SubmitDealerFormBodySchema = z.object({
  fields: z.array(DealerFormSubmissionInputFieldSchema).min(1),
});

export type SubmitDealerFormBody = z.infer<typeof SubmitDealerFormBodySchema>;

export const GetDealerFormSubmissionsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional().nullable(),
  page: z.number().int().positive().default(1),
  search: z.string().optional().nullable(),
  status: DealerFormSubmissionStatusSchema,
  published: z.enum(["true", "false"]).optional().nullable(),
});

export type GetDealerFormSubmissionsQuery = z.infer<typeof GetDealerFormSubmissionsQuerySchema>;

export const UpdateDealerFormSubmissionStatusBodySchema = z.object({
  id: z.string().min(1),
  status: DealerFormSubmissionStatusSchema.refine((value) => value !== null && value !== undefined, {
    message: "status is required",
  }),
  sendEmail: z.boolean().optional().nullable(),
  emailSubject: NullableString,
  emailMessage: NullableString,
});

export type UpdateDealerFormSubmissionStatusBody = z.infer<
  typeof UpdateDealerFormSubmissionStatusBodySchema
>;

export const ConvertDealerFormSubmissionBodySchema = z.object({
  id: z.string().min(1),
  status: z.union([z.literal("ACTIVE"), z.literal("UNLISTED")]),
});

export type ConvertDealerFormSubmissionBody = z.infer<typeof ConvertDealerFormSubmissionBodySchema>;

export const DealerFormSubmissionFieldResponseSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: DealerFormFieldTypeSchema,
  required: z.boolean().optional().nullable(),
  value: DealerFormSubmissionInputValueSchema.optional().nullable(),
});

export const DeleteDealerFormSubmissionBodySchema = z.object({
  id: z.string().min(1),
});

export type DeleteDealerFormSubmissionBody = z.infer<typeof DeleteDealerFormSubmissionBodySchema>;

function parseBody<T>(body: string | null | undefined, schema: z.ZodType<T>): T {
  if (!body) {
    throw new Error("Request body is not valid");
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(body);
  } catch {
    throw new Error("Request body is not valid");
  }

  const parsed = schema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ") || "Request body is not valid",
    );
  }

  return parsed.data;
}

function normaliseOptionalQueryString(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function parseSubmitDealerFormBody(body: string | null | undefined) {
  return parseBody(body, SubmitDealerFormBodySchema);
}

export function parseUpdateDealerFormSubmissionStatusBody(body: string | null | undefined) {
  return parseBody(body, UpdateDealerFormSubmissionStatusBodySchema);
}

export function parseConvertDealerFormSubmissionBody(body: string | null | undefined) {
  return parseBody(body, ConvertDealerFormSubmissionBodySchema);
}

export function parseDeleteDealerFormSubmissionBody(body: string | null | undefined) {
  return parseBody(body, DeleteDealerFormSubmissionBodySchema);
}

export function parseGetDealerFormSubmissionsQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
}) {
  const queryStringParameters = input.queryStringParameters ?? {};
  const limitValue = normaliseOptionalQueryString(queryStringParameters.limit);
  const pageValue = normaliseOptionalQueryString(queryStringParameters.page);

  const parsed = GetDealerFormSubmissionsQuerySchema.safeParse({
    limit: limitValue === null ? null : Number(limitValue),
    page: pageValue === null ? 1 : Number(pageValue),
    search: normaliseOptionalQueryString(queryStringParameters.search),
    status: normaliseOptionalQueryString(queryStringParameters.status),
    published: normaliseOptionalQueryString(queryStringParameters.published),
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ") || "Query parameters are not valid",
    );
  }

  return parsed.data;
}
