## Auth

**Method:** `GET`  
**Route:** `shopify/auth`

Checks whether shop already has active Shopify connection with required scopes. If yes, returns org payload. Otherwise creates install `state` and returns Shopify OAuth URL for an offline install flow that now exchanges into expiring offline tokens.

### Query parameters

* `shop: string` (required, must end with `myshopify.com`)
* standard Shopify HMAC params for verification

### Success response when already connected

```json
{
  "org": {
    "id": "665f0d3f4f9a9b0099999999",
    "name": "Example Store",
    "shopifyConnectionStatus": "ACTIVE"
  }
}
```

### Success response when install required

```json
{
  "url": "https://example.myshopify.com/admin/oauth/authorize?client_id=..."
}
```

\---

## Install

**Method:** `GET`  
**Route:** `shopify/install`

Completes Shopify OAuth install flow. Verifies `shop` + `state`, exchanges `code` for an expiring offline access token plus refresh token, stores Shopify connection and token expiry metadata on org, registers uninstall/billing webhooks, backfills basic shop settings for first-time installs, then redirects to app.

### Query parameters

* `shop: string` (required)
* `code: string` (required)
* `state: string` (required)
* standard Shopify HMAC params for verification

### Success response

HTTP `302` redirect to `APP_URL`.

\---

## Check Billing

**Method:** `GET`  
**Route:** `shopify/checkBilling`

Checks current active Shopify app subscription, maps it to internal plan, updates org billing fields, and returns updated org when active billing found.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification
* `charge_id: string` (optional, used in current lookup flow)

### Success response when active subscription found

```json
{
  "org": {
    "id": "665f0d3f4f9a9b0099999999",
    "billingPlanStatus": "ACTIVE",
    "billingPlanHandle": "PRO"
  }
}
```

### Alternate success response

```json
{}
```

\---

## Ping Review

**Method:** `POST`  
**Route:** `shopify/pingReview`

Stores lightweight review feedback signals on org record.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Request body

```json
{
  "rating": 5,
  "reviewSurface": "shopify_app_store"
}
```

### Success response

```json
{}
```

\---

## Ping Web Vitals

**Method:** `POST`  
**Route:** `shopify/pingWebVitals`

Stores reported frontend vitals payload for shop.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Request body

```json
{
  "path": "/products/widget",
  "vitals": {
    "lcp": 1900,
    "cls": 0.02
  }
}
```

### Success response

```json
{}
```

\---

## Ping Alert

**Method:** `POST`  
**Route:** `shopify/pingAlert`

Stores alert payload and, outside `dev`, emails admin unless `silent` is truthy.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Request body

Arbitrary JSON payload. Common pattern:

```json
{
  "type": "client_error",
  "message": "Example issue",
  "silent": false
}
```

### Success response

```json
{}
```

\---

## Create Location

**Method:** `POST`  
**Route:** `locations/createLocation`

Creates one location owned by authenticated org and returns full `LocationModel`.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "status": "ACTIVE",
  "name": "Auckland Flagship",
  "addressLine1": "123 Queen Street",
  "addressLine2": "Level 2",
  "city": "Auckland",
  "postalCode": "1010",
  "stateProvince": "Auckland",
  "country": "New Zealand",
  "phoneNumber": "+64 9 123 4567",
  "website": "https://example.com/stores/auckland",
  "emailAddress": "auckland@example.com",
  "logoUrl": "https://cdn.example.com/logo.png",
  "notes": "Main retail showroom.",
  "customFields": [
    {
      "key": "wheelchair_access",
      "label": "Wheelchair Access",
      "type": "TEXT",
      "value": "Wheelchair accessible entrance",
      "showOnListing": true
    }
  ],
  "filters": [
    {
      "key": "region",
      "value": "north-island"
    }
  ],
  "priority": 100,
  "coordinates": [174.7633, -36.8485]
}
```

### Rules

* `name` is required
* `status` can be `ACTIVE`, `UNLISTED`, or `INACTIVE`
* omitted `status` defaults to `ACTIVE`
* `website` and `logoUrl` must be valid URLs when provided
* `emailAddress` must be valid email when provided
* `coordinates` must be `[longitude, latitude]`
* `coordinates[0]` must be between `-180` and `180`
* `coordinates[1]` must be between `-90` and `90`
* custom field values must match their declared `type`
* location ownership is always set from authenticated org, not request body

### Success response

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "org": "665f0d3f4f9a9b0099999999",
  "status": "ACTIVE",
  "name": "Auckland Flagship",
  "addressLine1": "123 Queen Street",
  "addressLine2": "Level 2",
  "city": "Auckland",
  "postalCode": "1010",
  "stateProvince": "Auckland",
  "country": "New Zealand",
  "phoneNumber": "+64 9 123 4567",
  "website": "https://example.com/stores/auckland",
  "emailAddress": "auckland@example.com",
  "logoUrl": "https://cdn.example.com/logo.png",
  "notes": "Main retail showroom.",
  "customFields": [
    {
      "key": "wheelchair_access",
      "label": "Wheelchair Access",
      "type": "TEXT",
      "value": "Wheelchair accessible entrance",
      "showOnListing": true
    }
  ],
  "filters": [
    {
      "key": "region",
      "value": "north-island"
    }
  ],
  "priority": 100,
  "coordinates": [174.7633, -36.8485],
  "createdAt": "2026-04-21T00:00:00.000Z",
  "updatedAt": "2026-04-21T00:00:00.000Z"
}
```

\---

## Update Location

**Method:** `POST`  
**Route:** `locations/updateLocation`

Updates one existing location owned by authenticated org and returns full `LocationModel`.

### Query parameters

* `shop: string` (required)

### Request body

`id` is required. All other fields are optional.

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "status": "UNLISTED",
  "name": "Auckland Flagship Updated",
  "notes": "Temporarily available by appointment.",
  "priority": 90,
  "coordinates": [174.7633, -36.8485]
}
```

### Rules

* `id` must be valid ObjectId string
* location must belong to authenticated org
* at least one field besides `id` must be provided
* omitted fields keep existing stored values
* merged result must still satisfy full location validation rules

### Success response

Returns full `LocationModel`.

\---

## Get Location

**Method:** `GET`  
**Route:** `locations/getLocation/{id}`

Returns one location owned by authenticated org.

### Query parameters

* `shop: string` (required)

### Path parameters

* `id: string` (required, must be valid ObjectId string)

### Success response

Returns full `LocationModel`.

\---

## Get Locations

**Method:** `GET`  
**Route:** `locations/getLocations`

Returns locations owned by authenticated org, sorted by `priority`, then `updatedAt`, then `createdAt` descending.

### Query parameters

* `shop: string` (required)
* `limit: number` (optional, max `100`; enables pagination)
* `page: number` (optional, defaults to `1`; when provided without `limit`, uses a default page size of `50`)
* `search: string` (optional, case-insensitive partial match against location `name` and address fields)
* `status: ACTIVE | UNLISTED | INACTIVE` (optional)
* `categories: string | string[]` (optional, comma-separated or repeated query param; matches assigned location filter `value`s)

### Success response

```json
{
  "locations": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "org": "665f0d3f4f9a9b0099999999",
      "status": "ACTIVE",
      "name": "Auckland Flagship",
      "addressLine1": "123 Queen Street",
      "addressLine2": "Level 2",
      "city": "Auckland",
      "postalCode": "1010",
      "stateProvince": "Auckland",
      "country": "New Zealand",
      "phoneNumber": "+64 9 123 4567",
      "website": "https://example.com/stores/auckland",
      "emailAddress": "auckland@example.com",
      "logoUrl": "https://cdn.example.com/logo.png",
      "notes": "Main retail showroom.",
      "customFields": [],
      "filters": [],
      "priority": 100,
      "coordinates": [174.7633, -36.8485],
      "createdAt": "2026-04-21T00:00:00.000Z",
      "updatedAt": "2026-04-21T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

\---

## Get Public Map

**Method:** `GET`  
**Route:** `getPublicMap`

Public-facing map query endpoint. Resolves org from `shop` and returns either:

* cached precomputed clusters
* dynamic on-the-fly clusters when search/category filters are used
* raw points when clustering is disabled or zoom is above org clustering threshold
* distance-sorted raw points when coordinates are supplied outside clustering zoom

This endpoint does **not** require HMAC verification.

### Query parameters

* `shop: string` (required, must end with `myshopify.com`)
* `zoom: number` (required)
* `west: number` (required, longitude bound)
* `south: number` (required, latitude bound)
* `east: number` (required, longitude bound)
* `north: number` (required, latitude bound)
* `search: string` (optional; bypasses cluster cache and clusters matching locations dynamically)
* `categories: string | string[]` (optional, comma-separated or repeated query param; bypasses cluster cache and clusters matching locations dynamically)
* `source: SEARCH | GEOLOCATION` (optional; only used when `lng` and `lat` are also supplied)
* `lng: number` (optional; longitude for distance-aware point sorting/filtering)
* `lat: number` (optional; latitude for distance-aware point sorting/filtering)

### Notes

* frontend makes one request even when viewport crosses dateline
* backend handles dateline splitting internally
* if `search` or `categories` are provided, precomputed cluster cache is skipped
* at zoom levels above org `clusteringZoomLevel`, raw points are returned instead of clusters
* if `source`, `lng`, and `lat` are provided **and** request zoom is not clustering, results are returned as raw points sorted nearest-first
* if request zoom is clustering, `source`/`lng`/`lat` are ignored and cluster behavior remains unchanged
* distance-aware point mode ignores text-field regex matching from `search`; coordinates are the source of truth for ordering/filtering
* in distance-aware point mode:
  * `source=GEOLOCATION` uses org `geolocationRadius`
  * `source=SEARCH` + `typedSearchDistanceMode=SPECIFIC_RADIUS` uses org `searchRadius`
  * `source=SEARCH` + `typedSearchDistanceMode=ENTIRE_SEARCHED_AREA` uses current viewport bounds, then sorts results by distance from supplied coordinates
* distance is returned per point in the org's configured distance unit (`MILES` or `KILOMETERS`)

### Success response using cached or dynamic clusters

```json
{
  "mode": "cached_clusters",
  "zoom": 6,
  "items": [
    {
      "type": "cluster",
      "count": 3,
      "coordinates": [174.76, -36.84],
      "pointIds": [
        "665f0d3f4f9a9b0012345678",
        "665f0d3f4f9a9b0012345679",
        "665f0d3f4f9a9b0012345680"
      ],
      "singleLocationData": null
    },
    {
      "type": "cluster",
      "count": 1,
      "coordinates": [174.7762, -41.2865],
      "pointIds": ["665f0d3f4f9a9b0012345681"],
      "singleLocationData": {
        "id": "665f0d3f4f9a9b0012345681",
        "name": "Wellington Showroom",
        "addressLine1": "50 Willis Street",
        "addressLine2": null,
        "city": "Wellington",
        "postalCode": "6011",
        "stateProvince": "Wellington",
        "country": "New Zealand",
        "phoneNumber": null,
        "website": "https://example.com/stores/wellington",
        "emailAddress": null,
        "logoUrl": null,
        "notes": null,
        "customFields": [],
        "filters": [],
        "priority": 80,
        "coordinates": [174.7762, -41.2865]
      }
    }
  ]
}
```

### Success response using raw points

```json
{
  "mode": "points",
  "zoom": 12,
  "items": [
    {
      "type": "point",
      "id": "665f0d3f4f9a9b0012345678",
      "coordinates": [174.7633, -36.8485],
      "location": {
        "id": "665f0d3f4f9a9b0012345678",
        "name": "Auckland Flagship",
        "addressLine1": "123 Queen Street",
        "addressLine2": null,
        "city": "Auckland",
        "postalCode": "1010",
        "stateProvince": "Auckland",
        "country": "New Zealand",
        "phoneNumber": "+64 9 123 4567",
        "website": "https://example.com/stores/auckland",
        "emailAddress": "auckland@example.com",
        "logoUrl": "https://cdn.example.com/logo.png",
        "notes": "Main retail showroom.",
        "customFields": [],
        "filters": [],
        "priority": 100,
        "coordinates": [174.7633, -36.8485]
      }
    }
  ]
}
```

### Success response using distance-sorted raw points

```json
{
  "mode": "points",
  "zoom": 12,
  "items": [
    {
      "type": "point",
      "id": "665f0d3f4f9a9b0012345678",
      "coordinates": [174.7633, -36.8485],
      "distance": 1.24,
      "location": {
        "id": "665f0d3f4f9a9b0012345678",
        "name": "Auckland Flagship",
        "addressLine1": "123 Queen Street",
        "addressLine2": null,
        "city": "Auckland",
        "postalCode": "1010",
        "stateProvince": "Auckland",
        "country": "New Zealand",
        "phoneNumber": "+64 9 123 4567",
        "website": "https://example.com/stores/auckland",
        "emailAddress": "auckland@example.com",
        "logoUrl": "https://cdn.example.com/logo.png",
        "notes": "Main retail showroom.",
        "customFields": [],
        "filters": [],
        "priority": 100,
        "coordinates": [174.7633, -36.8485]
      }
    }
  ]
}
```

\---

## Save Search

**Method:** `POST`  
**Route:** `saveSearch`

Public-facing analytics endpoint that stores a search record against an org. Intended for frontend `navigator.sendBeacon()` use and does **not** require HMAC verification.

### Request body

```json
{
  "org": "665f0d3f4f9a9b0099999999",
  "formattedAddress": "123 Queen Street, Auckland 1010, New Zealand",
  "addressLine1": "123 Queen Street",
  "addressLine2": "Level 2",
  "city": "Auckland",
  "postalCode": "1010",
  "stateProvince": "Auckland",
  "country": "New Zealand",
  "coordinates": [174.7633, -36.8485],
  "nearestLocations": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

### Notes

* endpoint accepts raw JSON string body as typically sent by `navigator.sendBeacon()`
* `org` must be valid ObjectId string for an existing organisation
* `coordinates` must be `[longitude, latitude]` when provided
* `nearestLocations` may contain at most `10` ids
* every `nearestLocations` id must belong to same org or event is dropped
* payload must include meaningful search signal such as address text or coordinates plus nearest locations
* duplicate submissions within short rolling window are ignored using normalized payload fingerprinting
* endpoint intentionally returns `204` even when payload is invalid or dropped, to avoid giving abuse feedback

### Success response

HTTP `204` with empty body.

\---

## Get Searches

**Method:** `GET`  
**Route:** `searches/getSearches`

Returns search analytics records owned by authenticated org for a requested time period.

### Query parameters

* `shop: string` (required)
* `from: string` (required, ISO date/datetime)
* `to: string` (required, ISO date/datetime)
* `nearestLocationsMode: BOTH | EMPTY | HAS_VALUES` (optional, defaults to `BOTH`)
* `limit: number` (optional, max `100`; enables pagination)
* `page: number` (optional, defaults to `1`; when provided without `limit`, uses default page size `50`)

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* `to` must be greater than or equal to `from`
* requested time period must be `90` days or less
* response includes only first nearest location from stored `nearestLocations` array
* first nearest location is returned as `nearestLocation` with `id` and resolved location `name`
* `nearestLocationsMode=EMPTY` returns only searches without any nearest locations
* `nearestLocationsMode=HAS_VALUES` returns only searches with at least one nearest location

### Success response

```json
{
  "searches": [
    {
      "id": "68101d3f4f9a9b0012345000",
      "org": "665f0d3f4f9a9b0099999999",
      "formattedAddress": "123 Queen Street, Auckland 1010, New Zealand",
      "addressLine1": "123 Queen Street",
      "addressLine2": "Level 2",
      "city": "Auckland",
      "postalCode": "1010",
      "stateProvince": "Auckland",
      "country": "New Zealand",
      "coordinates": [174.7633, -36.8485],
      "nearestLocation": {
        "id": "665f0d3f4f9a9b0012345678",
        "name": "Auckland Flagship"
      },
      "createdAt": "2026-04-28T00:00:00.000Z",
      "updatedAt": "2026-04-28T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 42,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

\---

## Get Search Coordinates

**Method:** `GET`  
**Route:** `searches/getSearchCoordinates`

Returns only coordinates for search records owned by authenticated org for a requested time period. This endpoint is not paginated.

### Query parameters

* `shop: string` (required)
* `from: string` (required, ISO date/datetime)
* `to: string` (required, ISO date/datetime)
* `nearestLocationsMode: BOTH | EMPTY | HAS_VALUES` (optional, defaults to `BOTH`)

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* `to` must be greater than or equal to `from`
* requested time period must be `90` days or less
* results preserve stored search ordering by newest first

### Success response

```json
{
  "searches": [
    {
      "coordinates": [174.7633, -36.8485]
    },
    {
      "coordinates": null
    }
  ]
}
```

\---

## Get Location Search Count

**Method:** `GET`  
**Route:** `searches/getLocationSearchCount/{id}`

Returns how many searches for authenticated org include a given location inside their `nearestLocations` array within requested time period.

### Query parameters

* `shop: string` (required)
* `from: string` (required, ISO date/datetime)
* `to: string` (required, ISO date/datetime)

### Path parameters

* `id: string` (required, must be valid ObjectId string for location owned by authenticated org)

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* `to` must be greater than or equal to `from`
* requested time period must be `90` days or less
* location must belong to authenticated org

### Success response

```json
{
  "locationId": "665f0d3f4f9a9b0012345678",
  "from": "2026-04-01T00:00:00.000Z",
  "to": "2026-04-28T23:59:59.999Z",
  "count": 18
}
```

\---

## Delete Location

**Method:** `POST`  
**Route:** `locations/deleteLocation/{id}`

Deletes one location owned by authenticated org.

### Query parameters

* `shop: string` (required)

### Path parameters

* `id: string` (required, must be valid ObjectId string)

### Success response

```json
{
  "deleted": true,
  "id": "665f0d3f4f9a9b0012345678"
}
```

\---

## Create Locations Bulk

**Method:** `POST`  
**Route:** `locations/createLocationsBulk`

Creates many locations for authenticated org in one request.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "locations": [
    {
      "status": "ACTIVE",
      "name": "Auckland Flagship",
      "addressLine1": "123 Queen Street",
      "city": "Auckland",
      "postalCode": "1010",
      "stateProvince": "Auckland",
      "country": "New Zealand",
      "website": "https://example.com/stores/auckland",
      "emailAddress": "auckland@example.com",
      "priority": 100,
      "coordinates": [174.7633, -36.8485]
    },
    {
      "status": "ACTIVE",
      "name": "Wellington Showroom",
      "addressLine1": "50 Willis Street",
      "city": "Wellington",
      "postalCode": "6011",
      "stateProvince": "Wellington",
      "country": "New Zealand",
      "priority": 80,
      "coordinates": [174.7762, -41.2865]
    }
  ]
}
```

### Rules

* `locations` array must contain at least one item
* every item must pass same validation as `createLocation`
* request is all-or-nothing; no partial inserts on validation failure

### Success response

```json
{
  "locations": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "org": "665f0d3f4f9a9b0099999999",
      "status": "ACTIVE",
      "name": "Auckland Flagship"
    },
    {
      "id": "665f0d3f4f9a9b0012345679",
      "org": "665f0d3f4f9a9b0099999999",
      "status": "ACTIVE",
      "name": "Wellington Showroom"
    }
  ]
}
```

\---

## Import Locations Bulk

**Method:** `POST`  
**Route:** `locations/importLocationsBulk`

Imports many locations for authenticated org in one request. Backend may create new records, update existing records, geocode missing coordinates from address data, and parse a formatted address into structured parts based on request options.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "locations": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "status": "ACTIVE",
      "name": "Auckland Flagship",
      "formattedAddress": "123 Queen Street, Auckland 1010, New Zealand",
      "addressLine1": null,
      "addressLine2": null,
      "city": null,
      "postalCode": null,
      "stateProvince": null,
      "country": null,
      "website": "https://example.com/stores/auckland",
      "emailAddress": "auckland@example.com",
      "priority": 100,
      "coordinates": null
    },
    {
      "status": "UNLISTED",
      "name": "Wellington Showroom",
      "addressLine1": "50 Willis Street",
      "city": "Wellington",
      "postalCode": "6011",
      "stateProvince": "Wellington",
      "country": "New Zealand",
      "coordinates": null
    }
  ],
  "options": {
    "matchExistingByAddressOrCoordinates": true,
    "resolveCoordinatesFromAddress": true,
    "parseFormattedAddress": true
  }
}
```

### Rules

* `locations` array must contain at least one item
* every item must include `name`
* `id`, when provided, must be valid ObjectId string and takes priority over non-id matching
* `formattedAddress` is optional and may be used by backend to derive structured address fields
* `options.matchExistingByAddressOrCoordinates=true` allows backend to update an existing location when no `id` is supplied and a unique existing match is found
* backend matching priority should be:
  * explicit `id`
  * exact normalized address match
  * unique coordinate proximity match
* ambiguous non-id matches should be skipped rather than auto-updated
* `options.resolveCoordinatesFromAddress=true` allows backend to geocode rows that have address data but no coordinates
* `options.parseFormattedAddress=true` allows backend to split `formattedAddress` into `addressLine1`, `addressLine2`, `city`, `postalCode`, `stateProvince`, and `country`
* when parsing `formattedAddress`, explicitly provided structured address fields should win and parsed values should only fill blanks
* request may return mixed outcomes per row; backend should not fail the entire import solely because one row is skipped as ambiguous or unresolvable

### Success response

```json
{
  "created": [
    {
      "id": "665f0d3f4f9a9b0012345679",
      "org": "665f0d3f4f9a9b0099999999",
      "status": "UNLISTED",
      "name": "Wellington Showroom"
    }
  ],
  "updated": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "org": "665f0d3f4f9a9b0099999999",
      "status": "ACTIVE",
      "name": "Auckland Flagship"
    }
  ],
  "skipped": [
    {
      "row": 7,
      "reason": "ambiguous_match"
    }
  ]
}
```

\---

## Update Locations Bulk

**Method:** `POST`  
**Route:** `locations/updateLocationsBulk`

Updates many locations owned by authenticated org in one request.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "locations": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "status": "ACTIVE",
      "priority": 110,
      "notes": "Recently renovated.",
      "coordinates": [174.7633, -36.8485]
    },
    {
      "id": "665f0d3f4f9a9b0012345679",
      "status": "INACTIVE",
      "notes": "Closed for winter.",
      "coordinates": [174.7762, -41.2865]
    }
  ]
}
```

### Rules

* `locations` array must contain at least one item
* every `id` must be valid ObjectId string
* every targeted location must belong to authenticated org
* every item must include at least one field besides `id`
* request is all-or-nothing; if any id is missing or invalid, nothing is updated

### Success response

Returns updated `locations` array with full `LocationModel` items.

\---

## Delete Locations Bulk

**Method:** `POST`  
**Route:** `locations/deleteLocationsBulk`

Deletes many locations owned by authenticated org in one request.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "ids": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

### Rules

* `ids` array must contain at least one item
* every `id` must be valid ObjectId string
* every targeted location must belong to authenticated org
* request is all-or-nothing; if any id is missing or invalid, nothing is deleted

### Success response

```json
{
  "deleted": true,
  "ids": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ],
  "deletedCount": 2
}
```

## Update Org

**Method:** `POST`  
**Route:** `shopify/updateOrg`

Updates organisation-level fields and store locator settings for the authenticated org.

This endpoint now accepts a structured `settings` object that maps directly to the organisation settings groups stored on `Organisation.settings`.

### Settings groups

The `settings` payload is grouped by feature area so frontend and backend can share the same Zod schemas and converters when parsing request input, storing entity data, and returning API output.

Supported groups:

* `categoriesAndFilters`
  Covers category/filter definitions, optional category-level pin style overrides, how categories/filters display in the UI, and whether multiple selections use AND or OR matching.
* `customFields`
  Covers reusable location custom field definitions, their names, field types (`TEXT`, `TEXT_MULTILINE`, `LINK`), and whether they appear in storefront listings.
* `language`
  Covers primary language, translated languages, editable user-facing locator text, and per-language label overrides for categories/filters and custom fields.
* `provider`
  Covers map provider selection (`LEAFLET`, `MAPBOX`, `GOOGLE_MAPS`), provider-specific theme/style settings, and the required default map pin style. `LEAFLET` does not require an API key; the other providers do.
* `searchBehaviour`
  Covers initial map position, clustering, geolocation, distance rules, result limits, units, autocomplete, and country locking.

### Converter behavior

Each settings group has its own converter in `models/OrganisationSettings.ts` and `models/settings/*`.

Those converters are used to:

* parse unknown frontend/backend input with Zod
* normalize entity data when reading from MongoDB
* normalize API payloads before persisting organisation settings

`shopify/updateOrg` performs a partial top-level merge on `settings`, so sending one group does not overwrite unrelated groups already stored on the organisation.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "contactEmail": "alerts@example.com",
  "settings": {
    "provider": {
      "provider": "LEAFLET",
      "mapThemeMode": "PROVIDER_DEFAULT",
      "defaultPinStyle": {
          "name": "Default pin",
          "pinType": "STANDARD_PIN_ICON",
          "pinColor": "#EA4335"
      }
    },
    "categoriesAndFilters": {
      "categories": [
        {
          "key": "retailer",
          "label": "Retailer",
          "pinStyle": null
        }
      ],
      "displayMode": "STANDALONE",
      "multipleSelectionMode": "MATCH_ANY"
    },
    "customFields": {
      "fields": [
        {
          "key": "opening-hours",
          "label": "Opening Hours",
          "type": "TEXT_MULTILINE",
          "showOnListing": true
        }
      ]
    },
    "searchBehaviour": {
      "startingPositionMode": "FIT_ALL_LOCATIONS",
      "clusterLocationsWhenZoomedOut": true,
      "distanceUnit": "KILOMETERS",
      "searchSuggestionMode": "REGIONS_AND_ADDRESSES"
    }
  }
}
```

### Rules

* `contactEmail` must be email-shaped when provided
* `settings` is optional
* every provided settings group must match its shared Zod schema
* omitted top-level settings groups keep their existing stored values
* the response returns the full `OrganisationModel` with normalized `settings`

\---

## Rebuild Storefront Cache

**Method:** `POST`  
**Route:** `shopify/rebuildStorefrontCache`

Schedules a full org rebuild for authenticated shop. This rebuild refreshes derived public storefront data, including cluster data and storefront snapshot/metafield payloads.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* rebuild is scheduled asynchronously; endpoint does not wait for full rebuild completion
* only one rebuild can run at a time per org
* if rebuild is already running, endpoint returns success with `scheduled: false`
* if a rebuild completed within last `2` minutes, request is rejected by cooldown protection

### Success response when new rebuild is scheduled

```json
{
  "scheduled": true,
  "status": "scheduled"
}
```

### Success response when rebuild is already running

```json
{
  "scheduled": false,
  "status": "already_running"
}
```

\---

## Billing Webhook

**Method:** `POST`  
**Route:** `billing`

Processes Shopify `APP_SUBSCRIPTIONS_UPDATE` webhook. Verifies webhook HMAC, refreshes active subscription from Shopify, updates org billing fields, and reverts non-legacy orgs to `FREE` when no active paid subscription remains.

### Headers

* `X-Shopify-Shop-Domain: string` (required)
* Shopify webhook HMAC headers

### Success response

```json
{}
```

\---

## Uninstall Webhook

**Method:** `POST`  
**Route:** `uninstall`

Processes Shopify `APP_UNINSTALLED` webhook. Verifies webhook HMAC, removes Shopify connection fields from org, sets `uninstalledAt`, and deletes related `pricelists` and `subtotalDiscounts` for that org.

### Headers

* `X-Shopify-Shop-Domain: string` (required)
* Shopify webhook HMAC headers

### Success response

```json
{}
```

\---

## GDPR Webhook

**Method:** `POST`  
**Route:** `gdpr`

Processes Shopify GDPR webhooks. Verifies webhook HMAC and emails admin for non-`shop/redact` topics.

### Headers

* `X-Shopify-Topic: string` (required)
* Shopify webhook HMAC headers

### Success response

```json
{}
```

### Success response

Returns the full `OrganisationModel` with `includeCredentials: false`.

Example:

```json
{
  "id": "665f0d3f4f9a9b0099999999",
  "name": "Example Store",
  "contactEmail": "alerts@example.com",
  "shopifyConnectionStatus": "ACTIVE",
  "billingPlanStatus": "ACTIVE",
  "billingPlanHandle": "PRO"
}
```
