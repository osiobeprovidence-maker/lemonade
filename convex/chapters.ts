import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get chapters by series
export const getChaptersBySeries = query({
  args: { seriesId: v.id("series") },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_series", (q) => q.eq("seriesId", args.seriesId))
      .collect();
    return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  },
});

// Get single chapter
export const getChapter = query({
  args: { id: v.id("chapters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create chapter
export const createChapter = mutation({
  args: {
    seriesId: v.id("series"),
    chapterNumber: v.number(),
    title: v.string(),
    content: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    isLocked: v.boolean(),
    coinCost: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chapters", {
      ...args,
      publishedAt: Date.now(),
    });
  },
});

// Update chapter
export const updateChapter = mutation({
  args: {
    id: v.id("chapters"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    isLocked: v.optional(v.boolean()),
    coinCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete chapter
export const deleteChapter = mutation({
  args: { id: v.id("chapters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
