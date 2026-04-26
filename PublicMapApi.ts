import { z } from "zod";

const PublicMapBoundsSchema = z.object({
  west: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90),
});

export const GetPublicMapQuerySchema = z.object({
  zoom: z.number().nonnegative(),
  search: z.string().optional().nullable(),
  categories: z.array(z.string().min(1)).optional().nullable(),
  bounds: PublicMapBoundsSchema,
});

export type GetPublicMapQuery = z.infer<typeof GetPublicMapQuerySchema>;

function normaliseOptionalQueryString(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function normaliseQueryStringList(values: Array<string | null | undefined>) {
  const normalised = values
    .flatMap((value) => (value ?? "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return normalised.length ? [...new Set(normalised)] : null;
}

export function parseGetPublicMapQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
  multiValueQueryStringParameters?:
    | Record<string, Array<string | null | undefined> | null | undefined>
    | null;
}) {
  const queryStringParameters = input.queryStringParameters ?? {};
  const multiValueQueryStringParameters = input.multiValueQueryStringParameters ?? {};
  const parsed = GetPublicMapQuerySchema.safeParse({
    zoom: Number(normaliseOptionalQueryString(queryStringParameters.zoom)),
    search: normaliseOptionalQueryString(queryStringParameters.search),
    categories: normaliseQueryStringList([
      ...(multiValueQueryStringParameters.categories ?? []),
      queryStringParameters.categories,
    ]),
    bounds: {
      west: Number(normaliseOptionalQueryString(queryStringParameters.west)),
      south: Number(normaliseOptionalQueryString(queryStringParameters.south)),
      east: Number(normaliseOptionalQueryString(queryStringParameters.east)),
      north: Number(normaliseOptionalQueryString(queryStringParameters.north)),
    },
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ") || "Query parameters are not valid",
    );
  }

  return parsed.data;
}
