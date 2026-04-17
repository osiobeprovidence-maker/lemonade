import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firebaseUid: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
    firebaseCreatedAt: v.optional(v.number()),
    firebaseLastSignInAt: v.optional(v.number()),
    role: v.union(v.literal("reader"), v.literal("creator"), v.literal("admin")),
    isPremium: v.boolean(),
    bio: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    profilePic: v.optional(v.id("_storage")),
    dropSomethingLink: v.optional(v.string()),
    birthMonth: v.optional(v.string()),
    birthDay: v.optional(v.number()),
    birthYear: v.optional(v.number()),
    pronouns: v.optional(v.string()),
    marketingEmails: v.optional(v.boolean()),
    acceptedTerms: v.optional(v.boolean()),
    onboardingCompleted: v.optional(v.boolean()),
  }).index("by_firebase_uid", ["firebaseUid"]),

  series: defineTable({
    firebaseId: v.optional(v.string()),
    title: v.string(),
    creatorId: v.id("users"),
    creatorName: v.string(),
    type: v.union(v.literal("webtoon"), v.literal("novel")),
    genre: v.string(),
    emotion: v.optional(v.string()),
    summary: v.optional(v.string()),
    coverImage: v.optional(v.id("_storage")),
    coverImageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    views: v.number(),
    likes: v.number(),
    isOriginal: v.boolean(),
    isNew: v.boolean(),
    releaseDay: v.optional(v.string()),
    status: v.union(v.literal("ongoing"), v.literal("completed"), v.literal("hiatus")),
    subscriberCount: v.optional(v.number()),
  }).index("by_creator", ["creatorId"])
    .index("by_genre", ["genre"])
    .index("by_type", ["type"])
    .index("by_firebase_id", ["firebaseId"]),

  storyStyles: defineTable({
    storyKey: v.string(),
    coverImage: v.optional(v.string()),
    backgroundImage: v.optional(v.string()),
    backgroundOverlayColor: v.optional(v.string()),
    backgroundOverlayOpacity: v.optional(v.number()),
    textColor: v.union(v.literal("light"), v.literal("dark")),
    layoutStyle: v.union(v.literal("classic"), v.literal("immersive")),
    fontStyle: v.union(v.literal("serif"), v.literal("sans")),
  }).index("by_story_key", ["storyKey"]),

  chapters: defineTable({
    firebaseId: v.optional(v.string()),
    seriesId: v.id("series"),
    chapterNumber: v.number(),
    title: v.string(),
    content: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    pageUrls: v.optional(v.array(v.string())),
    publishedAt: v.number(),
    isLocked: v.boolean(),
    coinCost: v.number(),
  }).index("by_series", ["seriesId"])
    .index("by_firebase_id", ["firebaseId"]),

  comments: defineTable({
    firebaseId: v.optional(v.string()),
    seriesId: v.optional(v.id("series")),
    chapterId: v.optional(v.id("chapters")),
    userId: v.id("users"),
    userName: v.string(),
    userPhoto: v.optional(v.string()),
    text: v.string(),
    likes: v.number(),
    createdAt: v.number(),
  }).index("by_series", ["seriesId"])
    .index("by_chapter", ["chapterId"])
    .index("by_user", ["userId"])
    .index("by_firebase_id", ["firebaseId"]),

  userSubscriptions: defineTable({
    userId: v.id("users"),
    seriesId: v.id("series"),
    subscribedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_series", ["seriesId"])
    .index("by_user_and_series", ["userId", "seriesId"]),

  wallet: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    transactions: v.optional(v.array(v.object({
      type: v.union(v.literal("purchase"), v.literal("earnings"), v.literal("deposit"), v.literal("withdrawal")),
      amount: v.number(),
      description: v.string(),
      date: v.number(),
    }))),
  }).index("by_user", ["userId"]),

  campaigns: defineTable({
    firebaseId: v.optional(v.string()),
    title: v.string(),
    image: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    adType: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("scheduled"), v.literal("paused"), v.literal("ended")),
    budget: v.number(),
    spent: v.number(),
    views: v.number(),
    clicks: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    creatorId: v.optional(v.id("users")),
  }).index("by_status", ["status"])
    .index("by_firebase_id", ["firebaseId"]),

  notifications: defineTable({
    firebaseId: v.optional(v.string()),
    userId: v.id("users"),
    type: v.union(v.literal("new_chapter"), v.literal("like"), v.literal("comment"), v.literal("system")),
    title: v.string(),
    message: v.string(),
    seriesId: v.optional(v.id("series")),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"])
    .index("by_firebase_id", ["firebaseId"]),

  promoCodes: defineTable({
    code: v.string(),
    discount: v.number(),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),
});
