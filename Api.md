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
      "type": "boolean",
      "value": true,
      "public": true,
      "filterable": true
    }
  ],
  "filters": [
    {
      "key": "region",
      "value": "north-island"
    }
  ],
  "priority": 100,
  "lat": -36.8485,
  "lng": 174.7633
}
```

### Rules

* `name` is required
* `status` can be `ACTIVE`, `UNLISTED`, or `INACTIVE`
* `website` and `logoUrl` must be valid URLs when provided
* `emailAddress` must be valid email when provided
* `lat` must be between `-90` and `90`
* `lng` must be between `-180` and `180`
* `lat` and `lng` must either both be provided or both omitted
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
      "type": "boolean",
      "value": true,
      "public": true,
      "filterable": true
    }
  ],
  "filters": [
    {
      "key": "region",
      "value": "north-island"
    }
  ],
  "priority": 100,
  "lat": -36.8485,
  "lng": 174.7633,
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
  "lat": -36.8485,
  "lng": 174.7633
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

Returns all locations owned by authenticated org, sorted by `priority`, then `updatedAt`, then `createdAt` descending.

### Query parameters

* `shop: string` (required)

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
      "lat": -36.8485,
      "lng": 174.7633,
      "createdAt": "2026-04-21T00:00:00.000Z",
      "updatedAt": "2026-04-21T00:00:00.000Z"
    }
  ]
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
      "lat": -36.8485,
      "lng": 174.7633
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
      "lat": -41.2865,
      "lng": 174.7762
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
      "lat": -36.8485,
      "lng": 174.7633
    },
    {
      "id": "665f0d3f4f9a9b0012345679",
      "status": "INACTIVE",
      "notes": "Closed for winter.",
      "lat": -41.2865,
      "lng": 174.7762
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

Updates organisation-level settings for the authenticated org. Currently only `contactEmail` is supported.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "contactEmail": "alerts@example.com"
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
