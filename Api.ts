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

const MAX_ONBOARDING_COMPLETION_KEYS = 50;
const MAX_ONBOARDING_COMPLETION_KEY_LENGTH = 64;
const MAX_FEEDBACK_MESSAGE_LENGTH = 5000;

const OnboardingCompletionsSchema = z
  .record(z.string().max(MAX_ONBOARDING_COMPLETION_KEY_LENGTH), OnboardingCompletionModelSchema)
  .superRefine((value, ctx) => {
    if (Object.keys(value).length > MAX_ONBOARDING_COMPLETION_KEYS) {
      ctx.addIssue({
        code: "custom",
        message: "Request body is not valid",
        path: ["onboardingCompletions"],
      });
    }
  });

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
  subscribed: z.boolean().optional(),
  onboardingCompletions: OnboardingCompletionsSchema.optional(),
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

//
// ======================================================
// SUBMIT FEEDBACK (POST /shopify/submitFeedback)
// ======================================================
//

export const SubmitFeedbackBodySchema = z.object({
  message: z.string().trim().min(1).max(MAX_FEEDBACK_MESSAGE_LENGTH),
});

export type SubmitFeedbackBody = z.infer<typeof SubmitFeedbackBodySchema>;

export function parseSubmitFeedbackBody(body: string | null | undefined): SubmitFeedbackBody {
  return parseJsonBody(body, SubmitFeedbackBodySchema, {
    includeIssueMessages: false,
  });
}


