import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user wallet
export const getWallet = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const wallets = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return wallets[0] || null;
  },
});

// Add funds (for Paystack integration later)
export const addFunds = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (!wallet[0]) {
      await ctx.db.insert("wallet", {
        userId: args.userId,
        balance: args.amount,
        transactions: [{
          type: "deposit",
          amount: args.amount,
          description: args.description,
          date: Date.now(),
        }],
      });
      return;
    }

    const w = wallet[0];
    const transactions = w.transactions || [];
    transactions.push({
      type: "deposit",
      amount: args.amount,
      description: args.description,
      date: Date.now(),
    });

    await ctx.db.patch(w._id, {
      balance: w.balance + args.amount,
      transactions,
    });
  },
});

// Purchase chapter
export const purchaseChapter = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (!wallet[0]) throw new Error("Wallet not found");

    const w = wallet[0];
    if (w.balance < args.amount) throw new Error("Insufficient funds");

    const transactions = w.transactions || [];
    transactions.push({
      type: "purchase",
      amount: -args.amount,
      description: args.description,
      date: Date.now(),
    });

    await ctx.db.patch(w._id, {
      balance: w.balance - args.amount,
      transactions,
    });
  },
});

// Creator earnings
export const addEarnings = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (!wallet[0]) {
      await ctx.db.insert("wallet", {
        userId: args.userId,
        balance: args.amount,
        transactions: [{
          type: "earnings",
          amount: args.amount,
          description: args.description,
          date: Date.now(),
        }],
      });
      return;
    }

    const w = wallet[0];
    const transactions = w.transactions || [];
    transactions.push({
      type: "earnings",
      amount: args.amount,
      description: args.description,
      date: Date.now(),
    });

    await ctx.db.patch(w._id, {
      balance: w.balance + args.amount,
      transactions,
    });
  },
});
