import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firebaseUid: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
    role: v.union(v.literal("reader"), v.literal("creator"), v.literal("admin")),
    isPremium: v.boolean(),
    bio: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    profilePic: v.optional(v.id("_storage")),
    dropSomethingLink: v.optional(v.string()),
  }).index("by_firebase_uid", ["firebaseUid"]),

  series: defineTable({
    title: v.string(),
    creatorId: v.id("users"),
    creatorName: v.string(),
    type: v.union(v.literal("webtoon"), v.literal("novel")),
    genre: v.string(),
    emotion: v.optional(v.string()),
    summary: v.optional(v.string()),
    coverImage: v.optional(v.id("_storage")),
    views: v.number(),
    likes: v.number(),
    isOriginal: v.boolean(),
    isNew: v.boolean(),
    releaseDay: v.optional(v.string()),
    status: v.union(v.literal("ongoing"), v.literal("completed"), v.literal("hiatus")),
  }).index("by_creator", ["creatorId"])
    .index("by_genre", ["genre"])
    .index("by_type", ["type"]),

  chapters: defineTable({
    seriesId: v.id("series"),
    chapterNumber: v.number(),
    title: v.string(),
    content: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    publishedAt: v.number(),
    isLocked: v.boolean(),
    coinCost: v.number(),
  }).index("by_series", ["seriesId"]),

  comments: defineTable({
    seriesId: v.optional(v.id("series")),
    chapterId: v.optional(v.id("chapters")),
    userId: v.id("users"),
    userName: v.string(),
    text: v.string(),
    likes: v.number(),
    createdAt: v.number(),
  }).index("by_series", ["seriesId"])
    .index("by_chapter", ["chapterId"])
    .index("by_user", ["userId"]),

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
    title: v.string(),
    image: v.optional(v.id("_storage")),
    status: v.union(v.literal("active"), v.literal("scheduled"), v.literal("paused"), v.literal("ended")),
    budget: v.number(),
    spent: v.number(),
    views: v.number(),
    clicks: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    creatorId: v.optional(v.id("users")),
  }).index("by_status", ["status"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("new_chapter"), v.literal("like"), v.literal("comment"), v.literal("system")),
    title: v.string(),
    message: v.string(),
    seriesId: v.optional(v.id("series")),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"]),

  promoCodes: defineTable({
    code: v.string(),
    discount: v.number(),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),
});
