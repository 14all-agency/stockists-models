import { z } from "zod";

import type { CustomFieldType } from "./customFields";
import {
  createSettingsConverter,
  NullableBoolean,
  NullableString,
} from "./shared";

export const DealerFormFieldTypeSchema = z
  .enum([
    "TEXT",
    "TEXT_MULTILINE",
    "SELECT",
    "CONTACT",
    "EMAIL",
    "PHONE",
    "ADDRESS",
    "CHECKBOX",
    "FILE_UPLOAD",
    "IMAGE_UPLOAD",
    "NUMBER",
    "LINK",
  ])
  .optional()
  .nullable()
  .describe("Input type used for dealer form field values.");

export type DealerFormFieldType = z.infer<typeof DealerFormFieldTypeSchema>;

export const DealerFormFieldOptionSchema = z.object({
  label: NullableString.describe("Display label shown to dealer for this option."),
  value: NullableString.describe("Stable value stored for this option."),
});

export type DealerFormFieldOption = z.infer<typeof DealerFormFieldOptionSchema>;

export const DealerFormFieldDefinitionSchema = z.object({
  key: NullableString.describe("Stable identifier for this dealer form field."),
  label: NullableString.describe("Field label shown in app settings and storefront form."),
  type: DealerFormFieldTypeSchema,
  required: NullableBoolean.describe("Whether dealer must provide value before submission."),
  locked: NullableBoolean.describe(
    "Whether this field is a core system field and should not be deletable in admin UI.",
  ),
  options: z
    .array(DealerFormFieldOptionSchema)
    .optional()
    .nullable()
    .describe("Selectable options for select fields."),
});

export type DealerFormFieldDefinition = z.infer<typeof DealerFormFieldDefinitionSchema>;

export const DEFAULT_DEALER_FORM_FIELDS: DealerFormFieldDefinition[] = [
  {
    key: "contact",
    label: "Contact Details",
    type: "CONTACT",
    required: true,
    locked: true,
    options: [],
  },
  { key: "name", label: "Store name", type: "TEXT", required: true, locked: true, options: [] },
  { key: "address", label: "Address", type: "ADDRESS", required: true, locked: true, options: [] },
  {
    key: "phoneNumber",
    label: "Store phone",
    type: "PHONE",
    required: false,
    locked: false,
    options: [],
  },
  {
    key: "website",
    label: "Website",
    type: "LINK",
    required: false,
    locked: false,
    options: [],
  },
  {
    key: "emailAddress",
    label: "Store email",
    type: "EMAIL",
    required: false,
    locked: false,
    options: [],
  },
  {
    key: "logoUrl",
    label: "Logo URL",
    type: "IMAGE_UPLOAD",
    required: false,
    locked: false,
    options: [],
  },
  {
    key: "message",
    label: "Message",
    type: "TEXT_MULTILINE",
    required: false,
    locked: false,
    options: [],
  },
];

export const DEFAULT_DEALER_FORM_FIELD_KEYS = DEFAULT_DEALER_FORM_FIELDS.map(
  (field) => field.key || "",
).filter(Boolean);

export function mapDealerFieldTypeToCustomFieldType(
  type?: DealerFormFieldType | null,
): CustomFieldType {
  switch (type) {
    case "LINK":
    case "FILE_UPLOAD":
    case "IMAGE_UPLOAD":
      return "LINK";
    case "TEXT_MULTILINE":
    case "ADDRESS":
    case "CONTACT":
      return "TEXT_MULTILINE";
    case "TEXT":
    case "SELECT":
    case "EMAIL":
    case "PHONE":
    case "CHECKBOX":
    case "NUMBER":
    default:
      return "TEXT";
  }
}

export const DealerFormsSettingsSchema = z.object({
  fields: z
    .array(DealerFormFieldDefinitionSchema)
    .optional()
    .nullable()
    .describe("Administrator-managed dealer form field definitions."),
  notificationEnabled: NullableBoolean.describe(
    "Whether organisation should receive admin email notifications for new dealer submissions.",
  ),
  notificationEmail: NullableString.describe(
    "Email address that receives new dealer submission notifications. Defaults to organisation contact email when empty.",
  ),
});

export type DealerFormsSettings = z.infer<typeof DealerFormsSettingsSchema>;

export const DealerFormsSettingsConverter = createSettingsConverter(DealerFormsSettingsSchema);
