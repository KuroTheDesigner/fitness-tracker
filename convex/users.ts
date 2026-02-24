import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user from Shoo identity
export const current = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_shooSubject", (q) => q.eq("shooSubject", identity.subject))
            .unique();

        return user;
    },
});

// Called after first sign-in to create the user record
export const ensureUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("users")
            .withIndex("by_shooSubject", (q) => q.eq("shooSubject", identity.subject))
            .unique();

        if (existing) return existing._id;

        return await ctx.db.insert("users", {
            shooSubject: identity.subject,
            name: identity.name ?? undefined,
            email: identity.email ?? undefined,
            currentStreak: 0,
            longestStreak: 0,
            createdAt: Date.now(),
        });
    },
});

export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
