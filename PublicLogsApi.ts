/* @ts-ignore */
import type { APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";

const NullableStringField = z.string().max(500).optional().nullable();

export const SaveLogsBodySchema = z.object({
  logs: z.array(z.unknown()),
  message: NullableStringField,
  user_agent: NullableStringField,
  page: z.string().max(2000).optional().nullable(),
});

export type SaveLogsBody = z.infer<typeof SaveLogsBodySchema>;

function decodeEventBody(event: APIGatewayProxyEvent) {
  if (!event.body) {
    throw new Error("Request body is not valid");
  }

  return event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
}

export function parseSaveLogsBody(event: APIGatewayProxyEvent): SaveLogsBody {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(decodeEventBody(event));
  } catch {
    throw new Error("Request body is not valid");
  }

  const parsed = SaveLogsBodySchema.safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ") || "Request body is not valid",
    );
  }

  return parsed.data;
}
