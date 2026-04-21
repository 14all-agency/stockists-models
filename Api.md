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

## Generate Draft

**Method:** `POST`  
**Route:** `drafts/generateDraft`

Generates Reddit-style draft comment for authenticated org, stores it in `drafts`, and returns full `DraftModel`. If `id` is provided, endpoint updates existing draft owned by org instead of creating new one.

### Query parameters

* `shop: string` (required)

### Request body

All fields are optional.

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "customInstructions": "Keep it concise and sound like an actual Reddit user.",
  "promotionLink": "https://example.com/products/widget",
  "referenceId": "t3_abcdef",
  "promotionTone": "extra_subtle"
}
```

### Rules

* if `promotionLink` is omitted, endpoint falls back to org website, then Shopify domain if available
* if `referenceId` matches cached Reddit search result, model uses post title/content as reply context
* if `id` is provided, draft must belong to authenticated org
* `promotionTone` can be `subtle`, `direct`, or `extra_subtle`
* `extra_subtle` hyperlinks a topic-related word or short phrase instead of using a callout
* generation is throttled to `20` drafts per org per rolling hour
* once an org has generated `50` drafts or more, `FREE` and `LIFETIME-FREE` plans use `gpt-5-nano`
* generated output is concise Reddit-flavoured markdown

### Success response

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "org": "665f0d3f4f9a9b0099999999",
  "promotionTone": "subtle",
  "content": "If you're comparing options, I had decent luck using [this](https://example.com/products/widget) because it solved X without much setup.",
  "customInstructions": "Keep it concise and sound like an actual Reddit user.",
  "promotionLink": "https://example.com/products/widget",
  "referenceId": "t3_abcdef",
  "createdAt": "2026-04-11T00:00:00.000Z",
  "updatedAt": "2026-04-11T00:00:00.000Z"
}
```

\---

## Update Draft

**Method:** `POST`  
**Route:** `drafts/updateDraft`

Updates existing draft owned by authenticated org using provided values. Unlike `generateDraft`, this endpoint does not call OpenAI and instead persists caller-provided `content` directly.

### Query parameters

* `shop: string` (required)

### Request body

`id` is required. All other fields are optional.

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "content": "I ran into something similar. We had decent results with [this](https://example.com) because setup was quick.",
  "customInstructions": "Keep it short.",
  "promotionLink": "https://example.com",
  "referenceId": "t3_abcdef",
  "promotionTone": "subtle"
}
```

### Rules

* `id` must be valid ObjectId string
* draft must belong to authenticated org
* omitted optional fields keep existing stored values
* `updatedAt` is refreshed on every successful update

### Success response

Returns full `DraftModel` plus optional `referenceEntity` when `referenceId` resolves to a cached Reddit result.

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "org": "665f0d3f4f9a9b0099999999",
  "promotionTone": "subtle",
  "content": "I ran into something similar. We had decent results with [this](https://example.com) because setup was quick.",
  "customInstructions": "Keep it short.",
  "promotionLink": "https://example.com",
  "referenceId": "t3_abcdef",
  "referenceEntity": {
    "authorName": "example_user",
    "authorUrl": "https://www.reddit.com/user/example_user/",
    "subreddit": "newzealand",
    "entryId": "t3_abcdef",
    "entryUrl": "https://www.reddit.com/comments/example_comment",
    "updatedAt": "2026-04-11T00:00:00.000Z",
    "publishedAt": "2026-04-11T00:00:00.000Z",
    "title": "Game Kings mentioned here",
    "content": "<p>Example HTML content</p>",
    "fetchedAt": "2026-04-11T00:15:00.000Z"
  },
  "createdAt": "2026-04-11T00:00:00.000Z",
  "updatedAt": "2026-04-11T01:00:00.000Z"
}
```

\---

## Get Draft

**Method:** `GET`  
**Route:** `drafts/getDraft/{id}`

Returns one draft owned by authenticated org.

### Query parameters

* `shop: string` (required)

### Path parameters

* `id: string` (required, must be valid ObjectId string)

### Success response

Returns full `DraftModel`.

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "org": "665f0d3f4f9a9b0099999999",
  "promotionTone": "subtle",
  "content": "I ran into something similar. We had decent results with [this](https://example.com) because setup was quick.",
  "customInstructions": "Keep it short.",
  "promotionLink": "https://example.com",
  "referenceId": "t3_abcdef",
  "createdAt": "2026-04-11T00:00:00.000Z",
  "updatedAt": "2026-04-11T01:00:00.000Z"
}
```

\---

## Get Drafts

**Method:** `GET`  
**Route:** `drafts/getDrafts`

Returns all drafts owned by authenticated org, sorted by most recently updated first.

### Query parameters

* `shop: string` (required)

### Success response

```json
{
  "drafts": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "org": "665f0d3f4f9a9b0099999999",
      "promotionTone": "subtle",
      "content": "I ran into something similar. We had decent results with [this](https://example.com) because setup was quick.",
      "customInstructions": "Keep it short.",
      "promotionLink": "https://example.com",
      "referenceId": "t3_abcdef",
      "createdAt": "2026-04-11T00:00:00.000Z",
      "updatedAt": "2026-04-11T01:00:00.000Z"
    }
  ]
}
```

\---

## Delete Draft

**Method:** `POST`  
**Route:** `drafts/deleteDraft/{id}`

Deletes one draft owned by authenticated org.

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

## Create Search

**Method:** `POST`  
**Route:** `redditSearch/createSearch`

Creates a canonical Reddit search record if one does not already exist for the generated `searchUrl`. If an identical `searchUrl` already exists, it returns that existing record id instead of creating a duplicate.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "input": "Game Kings",
  "filters": {
    "searchMode": "combined",
    "includeTextPosts": true,
    "includeLinkPosts": true,
    "textMatchMode": "exact",
    "textTarget": "title_or_body",
    "linkTarget": "domain",
    "includeSubreddits": "",
    "excludeSubreddits": "",
    "excludeTerms": "",
    "advancedOpen": false
  }
}
```

### Success response

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "created": true
}
```

### Alternate success response when an identical search already exists

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "created": false
}
```

\---

## Get Search

**Method:** `GET`  
**Route:** `redditSearch/getSearch/{id}`

Retrieves a single search by id for the authenticated org. This endpoint also records the search in the org's search history. If cached results are still fresh, it returns those. Otherwise it fetches the Reddit RSS feed, updates the stored search record, and returns the refreshed result.

### Query parameters

* `shop: string` (required)

### Path parameters

* `id: string` (required, must be a valid ObjectId string)

### Success response

Returns a full `RedditSearchModel`.

Example:

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "query": "game kings",
  "searchUrl": "https://www.reddit.com/search.rss?q=%28title%3A%22game+kings%22+OR+selftext%3A%22game+kings%22%29&sort=new&t=all",
  "alternateUrl": "https://www.reddit.com/search/?q=%28title%3A%22game+kings%22+OR+selftext%3A%22game+kings%22%29&sort=new&t=all",
  "filters": {
    "searchMode": "combined",
    "includeTextPosts": true,
    "includeLinkPosts": true,
    "textMatchMode": "exact",
    "textTarget": "title_or_body",
    "linkTarget": "domain",
    "includeSubreddits": "",
    "excludeSubreddits": "",
    "excludeTerms": "",
    "advancedOpen": false
  },
  "results": [
    {
      "authorName": "example_user",
      "authorUrl": "https://www.reddit.com/user/example_user/",
      "entryUrl": "https://www.reddit.com/comments/example_comment",
      "subreddit": "newzealand",
      "entryId": "t3_abcdef",
      "updatedAt": "2026-04-11T00:00:00.000Z",
      "publishedAt": "2026-04-11T00:00:00.000Z",
      "title": "Game Kings mentioned here",
      "content": "<p>Example HTML content</p>",
      "fetchedAt": "2026-04-11T00:15:00.000Z"
    }
  ],
  "subscribers": null,
  "mySubscription": {
    "org": "665f0d3f4f9a9b0099999999",
    "subscribedAt": "2026-04-01T00:00:00.000Z",
    "frequency": "daily",
    "lastNotificationSentAt": "2026-04-10T00:00:00.000Z",
    "disabled": false
  },
  "createdAt": "2026-04-01T00:00:00.000Z",
  "updatedAt": "2026-04-11T00:15:00.000Z",
  "createdBy": "665f0d3f4f9a9b0099999999",
  "disabled": false,
  "lastSyncedAt": "2026-04-11T00:15:00.000Z",
  "lastSuccessfulSyncAt": "2026-04-11T00:15:00.000Z",
  "syncStatus": "SUCCESS",
  "syncError": null,
  "resultCount": 12,
  "lastResultAt": "2026-04-11T00:00:00.000Z"
}
```

\---

## Update Subscription

**Method:** `POST`  
**Route:** `redditSearch/updateSubscription`

Creates, updates, disables, or re-enables the authenticated org's subscription for a given search.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "searchId": "665f0d3f4f9a9b0012345678",
  "frequency": "daily",
  "disabled": false
}
```

### Rules

* `frequency` is required when `disabled` is `false`
* `frequency` can be omitted when `disabled` is `true`
* only one subscription per org per search is allowed
* disabled subscriptions are preserved in the array rather than removed
* if enabling a brand new or previously disabled subscription would exceed the org's plan limit, the request fails

### Success response

Returns the requesting org's subscription only:

```json
{
  "org": "665f0d3f4f9a9b0099999999",
  "subscribedAt": "2026-04-01T00:00:00.000Z",
  "frequency": "daily",
  "lastNotificationSentAt": null,
  "disabled": false
}
```

\---

## Get Searches

**Method:** `GET`  
**Route:** `redditSearch/getSearches`

Returns a combined list of the org's subscribed searches and search-history searches. Each search appears only once. Subscriptions come first, then remaining history items.

### Query parameters

* `shop: string` (required)

### Optional headers

* `subscriptions-only: "true"`  
When set, only subscription-backed searches are returned.

### Filtering

* disabled search records are excluded
* missing search-history records are ignored
* `mySubscription` is populated
* `subscribers` is omitted
* `results` is always returned as `null`

### Success response

```json
{
  "searches": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "query": "game kings",
      "searchUrl": "https://www.reddit.com/search.rss?...",
      "alternateUrl": "https://www.reddit.com/search/?q=...",
      "filters": {
        "searchMode": "combined",
        "includeTextPosts": true,
        "includeLinkPosts": true,
        "textMatchMode": "exact",
        "textTarget": "title_or_body",
        "linkTarget": "domain",
        "includeSubreddits": "",
        "excludeSubreddits": "",
        "excludeTerms": "",
        "advancedOpen": false
      },
      "results": null,
      "subscribers": null,
      "mySubscription": {
        "org": "665f0d3f4f9a9b0099999999",
        "subscribedAt": "2026-04-01T00:00:00.000Z",
        "frequency": "daily",
        "lastNotificationSentAt": "2026-04-10T00:00:00.000Z",
        "disabled": false
      },
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-11T00:15:00.000Z",
      "createdBy": "665f0d3f4f9a9b0099999999",
      "disabled": false,
      "lastSyncedAt": "2026-04-11T00:15:00.000Z",
      "lastSuccessfulSyncAt": "2026-04-11T00:15:00.000Z",
      "syncStatus": "SUCCESS",
      "syncError": null,
      "resultCount": 12,
      "lastResultAt": "2026-04-11T00:00:00.000Z"
    }
  ]
}
```

\---

## Get Related Searches

**Method:** `POST`  
**Route:** `redditSearch/getRelatedSearches`

Returns top related searches from other orgs that have at least one of the provided search ids in their search history. The authenticated org is excluded from the counts.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "searchIds": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

### Rules

* invalid ids are ignored
* if all ids are invalid, returns an empty array
* each matching org contributes at most `1` count per search
* searches with a count of `1` are excluded
* the requesting org does not contribute to counts
* at most `10` results are returned
* disabled or missing search records are omitted from the response

### Success response

```json
{
  "searches": [
    {
      "id": "665f0d3f4f9a9b0012345680",
      "query": "game kings",
      "count": 3
    },
    {
      "id": "665f0d3f4f9a9b0012345681",
      "query": "board game cafe",
      "count": 2
    }
  ]
}
```

\---

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
  "billingPlanHandle": "PRO",
  "redditSearchHistory": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```
