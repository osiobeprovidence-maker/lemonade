import { mutation } from "./_generated/server";
import { v } from "convex/values";

const userRole = v.union(v.literal("reader"), v.literal("creator"), v.literal("admin"));
const seriesType = v.union(v.literal("webtoon"), v.literal("novel"));
const seriesStatus = v.union(v.literal("ongoing"), v.literal("completed"), v.literal("hiatus"));
const campaignStatus = v.union(v.literal("active"), v.literal("scheduled"), v.literal("paused"), v.literal("ended"));
const notificationType = v.union(v.literal("new_chapter"), v.literal("like"), v.literal("comment"), v.literal("system"));

async function ensureUser(
  ctx: any,
  firebaseUid: string,
  fields?: {
    email?: string;
    displayName?: string;
    photoURL?: string;
    role?: "reader" | "creator" | "admin";
  },
) {
  let user = await ctx.db
    .query("users")
    .withIndex("by_firebase_uid", (q: any) => q.eq("firebaseUid", firebaseUid))
    .first();

  if (!user) {
    const userId = await ctx.db.insert("users", {
      firebaseUid,
      email: fields?.email,
      displayName: fields?.displayName,
      photoURL: fields?.photoURL,
      role: fields?.role ?? "reader",
      isPremium: false,
      genres: [],
      marketingEmails: false,
      acceptedTerms: false,
      onboardingCompleted: false,
    });

    await ctx.db.insert("wallet", {
      userId,
      balance: 0,
      transactions: [],
    });

    user = await ctx.db.get(userId);
  }

  return user;
}

function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}

export const upsertUserFromFirebase = mutation({
  args: {
    firebaseUid: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
    firebaseCreatedAt: v.optional(v.number()),
    firebaseLastSignInAt: v.optional(v.number()),
    role: v.optional(userRole),
    isPremium: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    dropSomethingLink: v.optional(v.string()),
    birthMonth: v.optional(v.string()),
    birthDay: v.optional(v.number()),
    birthYear: v.optional(v.number()),
    pronouns: v.optional(v.string()),
    marketingEmails: v.optional(v.boolean()),
    acceptedTerms: v.optional(v.boolean()),
    onboardingCompleted: v.optional(v.boolean()),
    coins: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();

    const userData = compact({
      firebaseUid: args.firebaseUid,
      email: args.email,
      displayName: args.displayName,
      photoURL: args.photoURL,
      firebaseCreatedAt: args.firebaseCreatedAt,
      firebaseLastSignInAt: args.firebaseLastSignInAt,
      role: args.role,
      isPremium: args.isPremium,
      bio: args.bio,
      genres: args.genres,
      dropSomethingLink: args.dropSomethingLink,
      birthMonth: args.birthMonth,
      birthDay: args.birthDay,
      birthYear: args.birthYear,
      pronouns: args.pronouns,
      marketingEmails: args.marketingEmails,
      acceptedTerms: args.acceptedTerms,
      onboardingCompleted: args.onboardingCompleted,
    });

    let userId = existing?._id;
    if (!existing) {
      userId = await ctx.db.insert("users", {
        role: "reader",
        isPremium: false,
        genres: [],
        marketingEmails: false,
        acceptedTerms: false,
        onboardingCompleted: false,
        ...userData,
      } as any);
    } else {
      await ctx.db.patch(existing._id, userData as any);
    }

    if (!userId) {
      throw new Error(`Failed to upsert Firebase user ${args.firebaseUid}`);
    }

    const wallet = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) {
      await ctx.db.insert("wallet", {
        userId,
        balance: args.coins ?? 0,
        transactions: args.coins && args.coins > 0 ? [{
          type: "deposit",
          amount: args.coins,
          description: "Imported from Firebase",
          date: Date.now(),
        }] : [],
      });
    } else if (args.coins !== undefined) {
      await ctx.db.patch(wallet._id, {
        balance: args.coins,
      });
    }

    return userId;
  },
});

export const upsertSeriesFromFirebase = mutation({
  args: {
    firebaseId: v.string(),
    creatorFirebaseUid: v.string(),
    creatorName: v.string(),
    title: v.string(),
    type: seriesType,
    genre: v.string(),
    emotion: v.optional(v.string()),
    summary: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    views: v.number(),
    likes: v.number(),
    isOriginal: v.boolean(),
    isNew: v.boolean(),
    releaseDay: v.optional(v.string()),
    status: seriesStatus,
    subscriberCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const creator = await ensureUser(ctx, args.creatorFirebaseUid, {
      displayName: args.creatorName,
      role: "creator",
    });

    const existing = await ctx.db
      .query("series")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .first();

    const seriesData = compact({
      firebaseId: args.firebaseId,
      creatorId: creator._id,
      creatorName: args.creatorName,
      title: args.title,
      type: args.type,
      genre: args.genre,
      emotion: args.emotion,
      summary: args.summary,
      coverImageUrl: args.coverImageUrl,
      tags: args.tags,
      views: args.views,
      likes: args.likes,
      isOriginal: args.isOriginal,
      isNew: args.isNew,
      releaseDay: args.releaseDay,
      status: args.status,
      subscriberCount: args.subscriberCount,
    });

    if (!existing) {
      return await ctx.db.insert("series", seriesData as any);
    }

    await ctx.db.patch(existing._id, seriesData);
    return existing._id;
  },
});

export const upsertChapterFromFirebase = mutation({
  args: {
    firebaseId: v.string(),
    firebaseSeriesId: v.string(),
    chapterNumber: v.number(),
    title: v.string(),
    content: v.optional(v.string()),
    pageUrls: v.optional(v.array(v.string())),
    publishedAt: v.number(),
    isLocked: v.boolean(),
    coinCost: v.number(),
  },
  handler: async (ctx, args) => {
    const series = await ctx.db
      .query("series")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseSeriesId))
      .first();

    if (!series) {
      throw new Error(`Missing series for Firebase chapter ${args.firebaseId}`);
    }

    const existing = await ctx.db
      .query("chapters")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .first();

    const chapterData = compact({
      firebaseId: args.firebaseId,
      seriesId: series._id,
      chapterNumber: args.chapterNumber,
      title: args.title,
      content: args.content,
      pageUrls: args.pageUrls,
      publishedAt: args.publishedAt,
      isLocked: args.isLocked,
      coinCost: args.coinCost,
    });

    if (!existing) {
      return await ctx.db.insert("chapters", chapterData as any);
    }

    await ctx.db.patch(existing._id, chapterData);
    return existing._id;
  },
});

export const upsertCommentFromFirebase = mutation({
  args: {
    firebaseId: v.string(),
    firebaseUserId: v.string(),
    userName: v.string(),
    userPhoto: v.optional(v.string()),
    text: v.string(),
    likes: v.number(),
    createdAt: v.number(),
    firebaseSeriesId: v.optional(v.string()),
    firebaseChapterId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx, args.firebaseUserId, {
      displayName: args.userName,
      photoURL: args.userPhoto,
    });

    const series = args.firebaseSeriesId ? await ctx.db
      .query("series")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseSeriesId))
      .first() : null;

    const chapter = args.firebaseChapterId ? await ctx.db
      .query("chapters")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseChapterId))
      .first() : null;

    const existing = await ctx.db
      .query("comments")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .first();

    const commentData = compact({
      firebaseId: args.firebaseId,
      seriesId: series?._id,
      chapterId: chapter?._id,
      userId: user._id,
      userName: args.userName,
      userPhoto: args.userPhoto,
      text: args.text,
      likes: args.likes,
      createdAt: args.createdAt,
    });

    if (!existing) {
      return await ctx.db.insert("comments", commentData as any);
    }

    await ctx.db.patch(existing._id, commentData);
    return existing._id;
  },
});

export const upsertCampaignFromFirebase = mutation({
  args: {
    firebaseId: v.string(),
    title: v.string(),
    imageUrl: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    adType: v.optional(v.string()),
    status: campaignStatus,
    budget: v.number(),
    spent: v.number(),
    views: v.number(),
    clicks: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    creatorFirebaseUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const creator = args.creatorFirebaseUid
      ? await ensureUser(ctx, args.creatorFirebaseUid, { role: "creator" })
      : null;

    const existing = await ctx.db
      .query("campaigns")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .first();

    const campaignData = compact({
      firebaseId: args.firebaseId,
      title: args.title,
      imageUrl: args.imageUrl,
      targetUrl: args.targetUrl,
      adType: args.adType,
      status: args.status,
      budget: args.budget,
      spent: args.spent,
      views: args.views,
      clicks: args.clicks,
      startDate: args.startDate,
      endDate: args.endDate,
      creatorId: creator?._id,
    });

    if (!existing) {
      return await ctx.db.insert("campaigns", campaignData as any);
    }

    await ctx.db.patch(existing._id, campaignData);
    return existing._id;
  },
});

export const upsertNotificationFromFirebase = mutation({
  args: {
    firebaseId: v.string(),
    firebaseUserId: v.string(),
    type: notificationType,
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
    firebaseSeriesId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx, args.firebaseUserId);
    const series = args.firebaseSeriesId ? await ctx.db
      .query("series")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseSeriesId))
      .first() : null;

    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .first();

    const notificationData = compact({
      firebaseId: args.firebaseId,
      userId: user._id,
      type: args.type,
      title: args.title,
      message: args.message,
      isRead: args.isRead,
      createdAt: args.createdAt,
      seriesId: series?._id,
    });

    if (!existing) {
      return await ctx.db.insert("notifications", notificationData as any);
    }

    await ctx.db.patch(existing._id, notificationData);
    return existing._id;
  },
});
