import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all campaigns
export const getAllCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").collect();
  },
});

// Get active campaigns
export const getActiveCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Create campaign
export const createCampaign = mutation({
  args: {
    title: v.string(),
    budget: v.number(),
    creatorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("campaigns", {
      ...args,
      status: "scheduled",
      spent: 0,
      views: 0,
      clicks: 0,
      startDate: Date.now(),
    });
  },
});

// Update campaign
export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    title: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("scheduled"), v.literal("paused"), v.literal("ended"))),
    budget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete campaign
export const deleteCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Track campaign view
export const trackCampaignView = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) return;
    await ctx.db.patch(args.id, { views: campaign.views + 1 });
  },
});
