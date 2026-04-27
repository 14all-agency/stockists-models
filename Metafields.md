# Storefront Snapshot Metafields

This document explains the Shopify app-data metafields used to bootstrap the storefront map with Liquid before client-side JS falls back to the API.

## Owner And Access

- Owner resource: `AppInstallation`
- Metafield type: app-data metafields
- Namespace: `stockists`
- Liquid access path in theme app extension: `app.metafields.stockists.*`

These metafields are installation-specific and are written by backend Shopify GraphQL calls using `currentAppInstallation`.

## Metafield Keys

- `storefront_snapshot_index`
- `storefront_snapshot_chunk_1`
- `storefront_snapshot_chunk_2`
- `storefront_snapshot_chunk_3`
- `storefront_snapshot_chunk_4`
- `storefront_snapshot_chunk_5`

`storefront_snapshot_index` is control-plane metadata.

`storefront_snapshot_chunk_*` metafields store item data pages for initial map state.

Unused chunk keys are written as empty item arrays so Liquid/frontend code can treat key set as stable.

## Schemas

Exact schema definitions live in:

- [StorefrontSnapshot.ts](/abs/path/C:/code/api/stockists-cdk/models/StorefrontSnapshot.ts)
- [Organisation.ts](/abs/path/C:/code/api/stockists-cdk/models/Organisation.ts)

### Index Metafield

`storefront_snapshot_index` stores:

- `version`: contract version
- `checksum`: payload checksum used to skip unchanged writes
- `updatedAt`: ISO timestamp of latest successful Shopify write
- `settings`: resolved organisation settings used by initial map render
- `responseMode`: `cached_clusters | dynamic_clusters | points`
- `responseZoom`: zoom used to generate initial payload
- `initialBounds`: bounds used for initial query
- `globalBounds`: all active-location bounds for fit-all behavior
- `totalItems`: total number of initial payload items
- `chunkCount`: number of populated chunk metafields
- `chunks`: ordered chunk references with key + item count

### Chunk Metafields

Each `storefront_snapshot_chunk_*` stores:

- `items`: array of initial map items

Each item is either:

- cluster item
  - `type: "cluster"`
  - `count`
  - `coordinates`
  - `pointIds`
  - `singleLocationData`
- point item
  - `type: "point"`
  - `id`
  - `coordinates`
  - `location`

`singleLocationData` and `location` use shared public location payload shape from [Cluster.ts](/abs/path/C:/code/api/stockists-cdk/models/Cluster.ts).

## How Initial Payload Is Built

- Backend resolves organisation settings with defaults first.
- Initial bounds depend on search behavior settings:
  - `FIT_ALL_LOCATIONS`: use bounds across all active locations
  - `SPECIFIC_AREA`: use configured center + zoom
- Backend reuses public map runtime logic to generate initial items.
- `maximumResults` is enforced before chunking.
- Result items are split into chunks targeting under `120kb` each, with hard max `5` chunks.

## Refresh And Consistency Rules

Snapshot refresh is triggered by:

- organisation settings updates affecting initial state
- location create/update/delete
- 15-minute cron backstop

Refresh pipeline:

1. mutation publishes SNS refresh event
2. consumer marks org snapshot dirty
3. consumer rebuilds snapshot
4. checksum compared against previous snapshot
5. unchanged payload clears dirty flag without rewriting Shopify
6. changed payload writes index + chunks to Shopify metafields

Cron runs every `15` minutes and stops processing near `10` minutes runtime, matching cluster-cron timeout guard style.

## Organisation Metadata

Organisation records persist backend snapshot state:

- `storefrontSnapshotChecksum`
- `storefrontSnapshotDirtyAt`
- `storefrontSnapshotLastSyncedAt`

These fields are backend sync metadata only. Storefront Liquid does not read them directly.

## Frontend Usage

Expected bootstrap flow:

1. read `app.metafields.stockists.storefront_snapshot_index`
2. inspect `chunks` from index
3. read `app.metafields.stockists.storefront_snapshot_chunk_n` keys referenced by index
4. merge chunk `items` in order
5. hydrate initial map from index settings + item payload
6. after first interaction, switch to live API requests

If metafields are missing, malformed, or stale beyond acceptable tolerance, frontend should fall back to API bootstrapping.

## Why This Exists

Goal is faster first render for theme app extension section Liquid by avoiding immediate API fetch for initial state, while keeping live API behavior for all later map movement and search interactions.
