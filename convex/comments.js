import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
// Get comments by series
export const getCommentsBySeries = query({
    args: { seriesId: v.id("series") },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_series", (q) => q.eq("seriesId", args.seriesId))
            .collect();
        return comments.sort((a, b) => b.createdAt - a.createdAt);
    },
});
// Add comment
export const addComment = mutation({
    args: {
        seriesId: v.optional(v.id("series")),
        chapterId: v.optional(v.id("chapters")),
        userId: v.id("users"),
        userName: v.string(),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("comments", {
            ...args,
            likes: 0,
            createdAt: Date.now(),
        });
    },
});
// Like comment
export const likeComment = mutation({
    args: { id: v.id("comments") },
    handler: async (ctx, args) => {
        const comment = await ctx.db.get(args.id);
        if (!comment)
            throw new Error("Comment not found");
        await ctx.db.patch(args.id, { likes: comment.likes + 1 });
    },
});
// Delete comment
export const deleteComment = mutation({
    args: { id: v.id("comments") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
