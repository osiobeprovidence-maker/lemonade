import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create user
export const getUser = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();
    return user;
  },
});

export const createUser = mutation({
  args: {
    firebaseUid: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();

    if (existing) return existing._id;

    const userId = await ctx.db.insert("users", {
      firebaseUid: args.firebaseUid,
      email: args.email,
      displayName: args.displayName,
      photoURL: args.photoURL,
      role: "reader",
      isPremium: false,
      genres: [],
      marketingEmails: false,
      acceptedTerms: false,
      onboardingCompleted: false,
    });

    // Create wallet for new user
    await ctx.db.insert("wallet", {
      userId,
      balance: 0,
      transactions: [],
    });

    return userId;
  },
});

export const updateUserProfile = mutation({
  args: {
    firebaseUid: v.string(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoURL: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    dropSomethingLink: v.optional(v.string()),
    birthMonth: v.optional(v.string()),
    birthDay: v.optional(v.number()),
    birthYear: v.optional(v.number()),
    pronouns: v.optional(v.string()),
    marketingEmails: v.optional(v.boolean()),
    acceptedTerms: v.optional(v.boolean()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { firebaseUid, ...updates } = args;
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebaseUid", firebaseUid))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.slice(0, args.limit ?? 100);
  },
});
