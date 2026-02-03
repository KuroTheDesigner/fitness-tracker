import { query } from "./_generated/server";
import { v } from "convex/values";

export const getProgram = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("programs")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .unique();
    },
});

export const getWorkoutSchedule = query({
    args: { programId: v.id("programs") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("workouts")
            .withIndex("by_programId", (q) => q.eq("programId", args.programId))
            .collect();
    },
});

export const getWorkoutWithExercises = query({
    args: { workoutId: v.id("workouts") },
    handler: async (ctx, args) => {
        const workout = await ctx.db.get(args.workoutId);
        if (!workout) return null;

        const exerciseDetails = await Promise.all(
            workout.exercises.map(async (weId) => {
                const we = await ctx.db.get(weId);
                if (!we) return null;
                const exercise = await ctx.db.get(we.exerciseId);
                return { ...we, exercise };
            })
        );

        return {
            ...workout,
            exercises: exerciseDetails.filter((e) => e !== null),
        };
    },
});

export const getExerciseHistory = query({
    args: { userId: v.id("users"), exerciseId: v.id("exercises") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("setHistory")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("exerciseId"), args.exerciseId))
            .order("desc")
            .take(10);
    },
});
