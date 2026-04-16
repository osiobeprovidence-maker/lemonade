import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
// Get all series
export const getAllSeries = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const series = await ctx.db.query("series").collect();
        return series.slice(0, args.limit ?? 50);
    },
});
// Get series by genre
export const getSeriesByGenre = query({
    args: { genre: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const series = await ctx.db
            .query("series")
            .withIndex("by_genre", (q) => q.eq("genre", args.genre))
            .collect();
        return series.slice(0, args.limit ?? 20);
    },
});
// Get series by type (webtoon/novel)
export const getSeriesByType = query({
    args: { type: v.union(v.literal("webtoon"), v.literal("novel")), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const series = await ctx.db
            .query("series")
            .withIndex("by_type", (q) => q.eq("type", args.type))
            .collect();
        return series.slice(0, args.limit ?? 20);
    },
});
// Get originals
export const getOriginals = query({
    args: { day: v.optional(v.string()), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const series = await ctx.db.query("series").collect();
        let filtered = series.filter(s => s.isOriginal);
        if (args.day) {
            filtered = filtered.filter(s => s.releaseDay === args.day || s.releaseDay === "Sun");
        }
        return filtered.slice(0, args.limit ?? 50);
    },
});
// Get single series
export const getSeries = query({
    args: { id: v.id("series") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});
export const getStoryStyleByKey = query({
    args: { storyKey: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("storyStyles")
            .withIndex("by_story_key", (q) => q.eq("storyKey", args.storyKey))
            .first();
    },
});
// Create series
export const createSeries = mutation({
    args: {
        creatorId: v.id("users"),
        creatorName: v.string(),
        title: v.string(),
        type: v.union(v.literal("webtoon"), v.literal("novel")),
        genre: v.string(),
        emotion: v.optional(v.string()),
        summary: v.optional(v.string()),
        isOriginal: v.boolean(),
        releaseDay: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("series", {
            ...args,
            views: 0,
            likes: 0,
            isNew: true,
            status: "ongoing",
        });
    },
});
export const upsertStoryStyle = mutation({
    args: {
        storyKey: v.string(),
        coverImage: v.optional(v.string()),
        backgroundImage: v.optional(v.string()),
        backgroundOverlayColor: v.optional(v.string()),
        backgroundOverlayOpacity: v.optional(v.number()),
        textColor: v.union(v.literal("light"), v.literal("dark")),
        layoutStyle: v.union(v.literal("classic"), v.literal("immersive")),
        fontStyle: v.union(v.literal("serif"), v.literal("sans")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("storyStyles")
            .withIndex("by_story_key", (q) => q.eq("storyKey", args.storyKey))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, args);
            return existing._id;
        }
        return await ctx.db.insert("storyStyles", args);
    },
});
// Increment views
export const incrementViews = mutation({
    args: { id: v.id("series") },
    handler: async (ctx, args) => {
        const series = await ctx.db.get(args.id);
        if (!series)
            throw new Error("Series not found");
        await ctx.db.patch(args.id, { views: series.views + 1 });
    },
});
// Like series
export const likeSeries = mutation({
    args: { id: v.id("series") },
    handler: async (ctx, args) => {
        const series = await ctx.db.get(args.id);
        if (!series)
            throw new Error("Series not found");
        await ctx.db.patch(args.id, { likes: series.likes + 1 });
    },
});
// Search series
export const searchSeries = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const series = await ctx.db.query("series").collect();
        const q = args.query.toLowerCase();
        return series.filter(s => s.title.toLowerCase().includes(q) ||
            s.genre.toLowerCase().includes(q) ||
            s.creatorName.toLowerCase().includes(q));
    },
});
