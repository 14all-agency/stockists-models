import { ObjectId } from 'bson';
import { z } from "zod";

export const SearchModeResult = z.union([
  z.literal("text"),
  z.literal("link"),
  z.literal("combined"),
]);

export type SearchMode = z.infer<typeof SearchModeResult>;

export const TextMatchModeResult = z.union([
  z.literal("exact"),
  z.literal("broad"),
]);

export type TextMatchMode = z.infer<typeof TextMatchModeResult>;

export const TextTargetResult = z.union([
  z.literal("title"),
  z.literal("body"),
  z.literal("title_or_body"),
]);

export type TextTarget = z.infer<typeof TextTargetResult>;

export const LinkTargetResult = z.union([
  z.literal("domain"),
  z.literal("url"),
]);

export type LinkTarget = z.infer<typeof LinkTargetResult>;

export const FiltersSchema = z.object({
  searchMode: SearchModeResult,
  includeTextPosts: z.boolean(),
  includeLinkPosts: z.boolean(),
  textMatchMode: TextMatchModeResult,
  textTarget: TextTargetResult,
  linkTarget: LinkTargetResult,
  includeSubreddits: z.string(),
  excludeSubreddits: z.string(),
  excludeTerms: z.string(),
  advancedOpen: z.boolean(),
});

export const FiltersResult = FiltersSchema.optional().nullable();

export type Filters = z.infer<typeof FiltersResult>;

export const SubscriptionFrequencyResult = z.union([
  z.literal("daily"),
  z.literal("weekly"),
]).optional().nullable();

export type SubscriptionFrequency = z.infer<typeof SubscriptionFrequencyResult>;

export const SubscriberSchema = z.object({
  org: z.instanceof(ObjectId).optional().nullable().describe("The organisation id subscribed to this search"),
  subscribedAt: z.date().optional().nullable(),
  frequency: SubscriptionFrequencyResult.describe("How often notifications should be sent"),
  lastNotificationSentAt: z.date().optional().nullable(),
  disabled: z.boolean().optional().nullable().describe("Whether this subscription is disabled"),
});

export const SubscriberResult = SubscriberSchema.optional().nullable();
export type SubscriberEntity = z.infer<typeof SubscriberSchema>;
export type Subscriber = z.infer<typeof SubscriberResult>;

export const SyncStatusResult = z.union([
  z.literal("SUCCESS"),
  z.literal("ERROR"),
  z.literal("PENDING"),
]).optional().nullable();

export type SyncStatus = z.infer<typeof SyncStatusResult>;

export const EntrySchema = z.object({
  authorName: z.string().optional().nullable().describe("The Reddit username of the author"),
  authorUrl: z.string().optional().nullable().describe("The URL to the author's Reddit profile"),
  subreddit: z.string().optional().nullable().describe("The subreddit the post/comment was made in"),
  entryId: z.string().optional().nullable().describe("The Reddit entry id from the RSS feed (e.g. t3_xxx)"),
  entryUrl: z.string().optional().nullable().describe("The Reddit entry URL"),
  updatedAt: z.date().optional().nullable().describe("The last updated timestamp from the RSS entry"),
  publishedAt: z.date().optional().nullable().describe("The original published/created timestamp from the RSS entry"),
  title: z.string().optional().nullable().describe("The title of the Reddit post"),
  content: z.string().optional().nullable().describe("The HTML content from the RSS entry"),
  fetchedAt: z.date().optional().nullable().describe("The timestamp when this entry was fetched and stored"),
});

export const EntryResult = EntrySchema.optional().nullable();
export type EntryEntity = z.infer<typeof EntrySchema>;
export type Entry = z.infer<typeof EntryResult>;

export const RedditSearchEntityResult = z.object({
  _id: z.instanceof(ObjectId),
  query: z.string().optional().nullable().describe("The normalized search query string"),
  searchUrl: z.string().optional().nullable().describe("The compiled RSS search URL for this query + filter combination"),
  alternateUrl: z.string().optional().nullable().describe("The Reddit HTML search results URL from the feed alternate link"),
  filters: FiltersResult.describe("The search filters used to build the RSS search URL"),
  subscribers: z.array(SubscriberSchema).optional().nullable().describe("Organisations subscribed to notifications for this search"),
  results: z.array(EntrySchema).optional().nullable().describe("The most recent cached RSS search entries for this search"),

  // Admin
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
  createdBy: z.string().optional().nullable().describe("The organisation id that created this search"),
  disabled: z.boolean().optional().nullable().describe("Whether this search is disabled from syncing / notifying"),
  lastSyncedAt: z.date().optional().nullable(),
  lastSuccessfulSyncAt: z.date().optional().nullable(),
  syncStatus: SyncStatusResult,
  syncError: z.string().optional().nullable().describe("The last sync error message, if any"),
  resultCount: z.number().optional().nullable().describe("The number of results returned from the last successful sync"),
  lastResultAt: z.date().optional().nullable().describe("The published/created date of the most recent RSS entry from the last successful sync"),
});

export type RedditSearchEntity = z.infer<typeof RedditSearchEntityResult>;

export const RedditSearchModelSubscriberSchema = z.object({
  org: z.string().optional().nullable().describe("The organisation id subscribed to this search"),
  subscribedAt: SubscriberSchema.shape.subscribedAt,
  frequency: SubscriberSchema.shape.frequency,
  lastNotificationSentAt: SubscriberSchema.shape.lastNotificationSentAt,
  disabled: SubscriberSchema.shape.disabled,
});

export type RedditSearchModelSubscriber = z.infer<typeof RedditSearchModelSubscriberSchema>;

export const RedditSearchModelEntrySchema = z.object({
  authorName: EntrySchema.shape.authorName,
  authorUrl: EntrySchema.shape.authorUrl,
  subreddit: EntrySchema.shape.subreddit,
  entryId: EntrySchema.shape.entryId,
  entryUrl: EntrySchema.shape.entryUrl,
  updatedAt: EntrySchema.shape.updatedAt,
  publishedAt: EntrySchema.shape.publishedAt,
  title: EntrySchema.shape.title,
  content: EntrySchema.shape.content,
  fetchedAt: EntrySchema.shape.fetchedAt,
});

export type RedditSearchModelEntry = z.infer<typeof RedditSearchModelEntrySchema>;

export const RedditSearchModelSchema = z.object({
  id: z.string(),
  query: RedditSearchEntityResult.shape.query,
  searchUrl: RedditSearchEntityResult.shape.searchUrl,
  alternateUrl: RedditSearchEntityResult.shape.alternateUrl,
  filters: RedditSearchEntityResult.shape.filters,
  results: z.array(RedditSearchModelEntrySchema).optional().nullable(),

  // Subscriber visibility
  subscribers: z.array(RedditSearchModelSubscriberSchema).optional().nullable().describe("All subscribers for this search (backend use only)"),
  mySubscription: RedditSearchModelSubscriberSchema.optional().nullable().describe("The subscription for the requesting organisation, if any"),

  // Admin
  createdAt: RedditSearchEntityResult.shape.createdAt,
  updatedAt: RedditSearchEntityResult.shape.updatedAt,
  createdBy: RedditSearchEntityResult.shape.createdBy,
  disabled: RedditSearchEntityResult.shape.disabled,
  lastSyncedAt: RedditSearchEntityResult.shape.lastSyncedAt,
  lastSuccessfulSyncAt: RedditSearchEntityResult.shape.lastSuccessfulSyncAt,
  syncStatus: RedditSearchEntityResult.shape.syncStatus,
  syncError: RedditSearchEntityResult.shape.syncError,
  resultCount: RedditSearchEntityResult.shape.resultCount,
  lastResultAt: RedditSearchEntityResult.shape.lastResultAt,
});

export type RedditSearchModel = z.infer<typeof RedditSearchModelSchema>;

export const RedditSearchModel = {
  convertSubscriberFromEntity(subscriber: Subscriber): RedditSearchModelSubscriber | null {
    if(!subscriber) {
      return null;
    }

    const obj: RedditSearchModelSubscriber = {
      org: subscriber.org ? subscriber.org.toHexString() : null,
      subscribedAt: subscriber.subscribedAt ? new Date(subscriber.subscribedAt) : null,
      frequency: subscriber.frequency ?? null,
      lastNotificationSentAt: subscriber.lastNotificationSentAt ? new Date(subscriber.lastNotificationSentAt) : null,
      disabled: subscriber.disabled ?? null,
    };

    return RedditSearchModelSubscriberSchema.parse(obj);
  },

  convertEntryFromEntity(entry: Entry): RedditSearchModelEntry | null {
    if(!entry) {
      return null;
    }

    const obj: RedditSearchModelEntry = {
      authorName: entry.authorName ?? null,
      authorUrl: entry.authorUrl ?? null,
      subreddit: entry.subreddit ?? null,
      entryId: entry.entryId ?? null,
      entryUrl: entry.entryUrl ?? null,
      updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : null,
      publishedAt: entry.publishedAt ? new Date(entry.publishedAt) : null,
      title: entry.title ?? null,
      content: entry.content ?? null,
      fetchedAt: entry.fetchedAt ? new Date(entry.fetchedAt) : null,
    };

    return RedditSearchModelEntrySchema.parse(obj);
  },

  convertFromEntity(
    entity: RedditSearchEntity,
    options?: {
      omitResults?: boolean;
      includeAllSubscribers?: boolean;
      org?: string | null;
    }
  ): RedditSearchModel {
    const allSubscribers = (entity.subscribers || [])
      .map((subscriber: SubscriberEntity) => RedditSearchModel.convertSubscriberFromEntity(subscriber))
      .filter((subscriber: RedditSearchModelSubscriber | null): subscriber is RedditSearchModelSubscriber => !!subscriber);

    const mySubscription = options?.org
      ? allSubscribers.find((subscriber: RedditSearchModelSubscriber) => subscriber.org === options.org) || null
      : null;

    const results = (entity.results || [])
      .map((entry: EntryEntity) => RedditSearchModel.convertEntryFromEntity(entry))
      .filter((entry: RedditSearchModelEntry | null): entry is RedditSearchModelEntry => !!entry);

    const obj: RedditSearchModel = {
      id: entity._id.toHexString(),
      query: entity.query ?? null,
      searchUrl: entity.searchUrl ?? null,
      alternateUrl: entity.alternateUrl ?? null,
      filters: entity.filters ?? null,
      results: options?.omitResults ? null : results,

      subscribers: options?.includeAllSubscribers ? allSubscribers : null,
      mySubscription: mySubscription ?? null,

      // admin
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
      createdBy: entity.createdBy ?? null,
      disabled: entity.disabled ?? null,
      lastSyncedAt: entity.lastSyncedAt ? new Date(entity.lastSyncedAt) : null,
      lastSuccessfulSyncAt: entity.lastSuccessfulSyncAt ? new Date(entity.lastSuccessfulSyncAt) : null,
      syncStatus: entity.syncStatus ?? null,
      syncError: entity.syncError ?? null,
      resultCount: entity.resultCount ?? null,
      lastResultAt: entity.lastResultAt ? new Date(entity.lastResultAt) : null,
    };

    return RedditSearchModelSchema.parse(obj);
  },
};