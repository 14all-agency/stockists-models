import type { APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";

import { CoordinatesSchema } from "./Location";

const NullableAddressField = z.string().max(250).optional().nullable();

export const SaveSearchBodySchema = z.object({
  org: z.string().min(1),
  formattedAddress: z.string().max(500).optional().nullable(),
  addressLine1: NullableAddressField,
  addressLine2: NullableAddressField,
  city: z.string().max(120).optional().nullable(),
  postalCode: z.string().max(40).optional().nullable(),
  stateProvince: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  coordinates: CoordinatesSchema.shape.coordinates,
  nearestLocations: z.array(z.string().min(1)).max(10).optional().nullable(),
});

export type SaveSearchBody = z.infer<typeof SaveSearchBodySchema>;

function decodeEventBody(event: APIGatewayProxyEvent) {
  if (!event.body) {
    throw new Error("Request body is not valid");
  }

  return event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
}

export function parseSaveSearchBody(event: APIGatewayProxyEvent): SaveSearchBody {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(decodeEventBody(event));
  } catch {
    throw new Error("Request body is not valid");
  }

  const parsed = SaveSearchBodySchema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ") || "Request body is not valid",
    );
  }

  return parsed.data;
}
