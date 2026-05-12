/**
 * API request schemas and parsers.
 * Each section corresponds to a specific endpoint and defines:
 * - Zod schema (shared FE/BE)
 * - inferred TypeScript type
 * - backend parser for raw request bodies
 */

import { z } from "zod";

import { OnboardingCompletionModelSchema } from "./Organisation";
import { SettingsGroupsSchema } from "./OrganisationSettings";
import { parseJsonBody } from "./apiParsing";

//
// ======================================================
// UPDATE ORG (POST /shopify/updateOrg)
// ======================================================
//

/**
 * Request body for updating organisation fields.
 */
export const UpdateOrgBodySchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .refine((value) => value.includes("@") && value.includes("."), {
      message: "Request body is not valid",
    })
    .optional(),
  onboardingCompletions: z.record(z.string(), OnboardingCompletionModelSchema).optional(),
  settings: SettingsGroupsSchema.partial().optional(),
});

export type UpdateOrgBody = z.infer<typeof UpdateOrgBodySchema>;

/**
 * Parses and validates raw request body for updateOrg endpoint.
 */
export function parseUpdateOrgBody(body: string | null | undefined): UpdateOrgBody {
  return parseJsonBody(body, UpdateOrgBodySchema, {
    allowEmpty: true,
    emptyValue: {},
    includeIssueMessages: false,
  });
}


