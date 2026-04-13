import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
// Get notifications for user
export const getNotifications = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
        return notifications.sort((a, b) => b.createdAt - a.createdAt);
    },
});
// Get unread count
export const getUnreadCount = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_and_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
            .collect();
        return notifications.length;
    },
});
// Mark notification as read
export const markAsRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { isRead: true });
    },
});
// Mark all as read
export const markAllAsRead = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_and_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
            .collect();
        for (const notif of notifications) {
            await ctx.db.patch(notif._id, { isRead: true });
        }
    },
});
// Create notification
export const createNotification = mutation({
    args: {
        userId: v.id("users"),
        type: v.union(v.literal("new_chapter"), v.literal("like"), v.literal("comment"), v.literal("system")),
        title: v.string(),
        message: v.string(),
        seriesId: v.optional(v.id("series")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("notifications", {
            ...args,
            isRead: false,
            createdAt: Date.now(),
        });
    },
});
