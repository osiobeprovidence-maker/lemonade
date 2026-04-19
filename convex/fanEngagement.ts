import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getUserByFirebaseUid = async (ctx: any, firebaseUid?: string) => {
  if (!firebaseUid) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_firebase_uid", (q: any) => q.eq("firebaseUid", firebaseUid))
    .first();
};

const getCreatorByDisplayName = async (ctx: any, displayName: string) => {
  return await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("displayName"), displayName))
    .first();
};

export const getCreatorEngagement = query({
  args: {
    creatorDisplayName: v.string(),
    viewerFirebaseUid: v.optional(v.string()),
    dropIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const creator = await getCreatorByDisplayName(ctx, args.creatorDisplayName);
    if (!creator) {
      return {
        followerCount: 0,
        creatorLikeCount: 0,
        dropLikeCounts: {},
        isFollowing: false,
        hasLikedCreator: false,
        likedDropIds: [],
      };
    }

    const viewer = await getUserByFirebaseUid(ctx, args.viewerFirebaseUid);
    const dropIds = args.dropIds ?? [];

    const [followers, creatorLikes, followRecord, creatorLikeRecord, viewerDropLikes] = await Promise.all([
      ctx.db.query("creatorFollows").withIndex("by_creator", (q) => q.eq("creatorUserId", creator._id)).collect(),
      ctx.db.query("creatorLikes").withIndex("by_creator", (q) => q.eq("creatorUserId", creator._id)).collect(),
      viewer
        ? ctx.db.query("creatorFollows").withIndex("by_fan_and_creator", (q) => q.eq("fanUserId", viewer._id).eq("creatorUserId", creator._id)).first()
        : Promise.resolve(null),
      viewer
        ? ctx.db.query("creatorLikes").withIndex("by_fan_and_creator", (q) => q.eq("fanUserId", viewer._id).eq("creatorUserId", creator._id)).first()
        : Promise.resolve(null),
      viewer
        ? ctx.db.query("creatorDropLikes").collect().then((records) =>
            records.filter((record) => record.creatorUserId === creator._id && record.fanUserId === viewer._id)
          )
        : Promise.resolve([]),
    ]);

    const dropLikeEntries = await Promise.all(
      dropIds.map(async (dropId) => {
        const likes = await ctx.db
          .query("creatorDropLikes")
          .withIndex("by_creator_and_drop", (q) => q.eq("creatorUserId", creator._id).eq("dropId", dropId))
          .collect();

        return [dropId, likes.length] as const;
      })
    );

    const dropLikeCounts = Object.fromEntries(dropLikeEntries);

    return {
      followerCount: followers.length,
      creatorLikeCount: creatorLikes.length,
      dropLikeCounts,
      isFollowing: Boolean(followRecord),
      hasLikedCreator: Boolean(creatorLikeRecord),
      likedDropIds: viewerDropLikes.map((record) => record.dropId),
    };
  },
});

export const toggleCreatorFollow = mutation({
  args: {
    creatorDisplayName: v.string(),
    viewerFirebaseUid: v.string(),
  },
  handler: async (ctx, args) => {
    const [creator, viewer] = await Promise.all([
      getCreatorByDisplayName(ctx, args.creatorDisplayName),
      getUserByFirebaseUid(ctx, args.viewerFirebaseUid),
    ]);

    if (!creator || !viewer) throw new Error("User not found");
    if (creator._id === viewer._id) return { isFollowing: false };

    const existing = await ctx.db
      .query("creatorFollows")
      .withIndex("by_fan_and_creator", (q) => q.eq("fanUserId", viewer._id).eq("creatorUserId", creator._id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { isFollowing: false };
    }

    await ctx.db.insert("creatorFollows", {
      creatorUserId: creator._id,
      fanUserId: viewer._id,
      createdAt: Date.now(),
    });

    return { isFollowing: true };
  },
});

export const toggleCreatorLike = mutation({
  args: {
    creatorDisplayName: v.string(),
    viewerFirebaseUid: v.string(),
  },
  handler: async (ctx, args) => {
    const [creator, viewer] = await Promise.all([
      getCreatorByDisplayName(ctx, args.creatorDisplayName),
      getUserByFirebaseUid(ctx, args.viewerFirebaseUid),
    ]);

    if (!creator || !viewer) throw new Error("User not found");
    if (creator._id === viewer._id) return { hasLikedCreator: false };

    const existing = await ctx.db
      .query("creatorLikes")
      .withIndex("by_fan_and_creator", (q) => q.eq("fanUserId", viewer._id).eq("creatorUserId", creator._id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { hasLikedCreator: false };
    }

    await ctx.db.insert("creatorLikes", {
      creatorUserId: creator._id,
      fanUserId: viewer._id,
      createdAt: Date.now(),
    });

    return { hasLikedCreator: true };
  },
});

export const toggleCreatorDropLike = mutation({
  args: {
    creatorDisplayName: v.string(),
    viewerFirebaseUid: v.string(),
    dropId: v.string(),
  },
  handler: async (ctx, args) => {
    const [creator, viewer] = await Promise.all([
      getCreatorByDisplayName(ctx, args.creatorDisplayName),
      getUserByFirebaseUid(ctx, args.viewerFirebaseUid),
    ]);

    if (!creator || !viewer) throw new Error("User not found");
    if (creator._id === viewer._id) return { hasLikedDrop: false };

    const existing = await ctx.db
      .query("creatorDropLikes")
      .withIndex("by_fan_creator_drop", (q) => q.eq("fanUserId", viewer._id).eq("creatorUserId", creator._id).eq("dropId", args.dropId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { hasLikedDrop: false };
    }

    await ctx.db.insert("creatorDropLikes", {
      creatorUserId: creator._id,
      fanUserId: viewer._id,
      dropId: args.dropId,
      createdAt: Date.now(),
    });

    return { hasLikedDrop: true };
  },
});
