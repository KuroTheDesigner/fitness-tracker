import { mutation, query } from "./_generated/server";
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

const DAY_ORDER = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const getWorkoutScheduleWithStatus = query({
    args: { programId: v.id("programs"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const workouts = await ctx.db
            .query("workouts")
            .withIndex("by_programId", (q) => q.eq("programId", args.programId))
            .collect();

        const todayIndex = new Date().getDay();

        const workoutsWithStatus = await Promise.all(
            workouts.map(async (workout) => {
                const workoutDayIndex = DAY_ORDER.indexOf(workout.dayOfWeek);
                const dayStatus = workoutDayIndex === todayIndex
                    ? "current"
                    : workoutDayIndex < todayIndex
                        ? "past"
                        : "future";

                const history = await ctx.db
                    .query("workoutHistory")
                    .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                    .filter((q) => q.eq(q.field("workoutId"), workout._id))
                    .order("desc")
                    .first();

                return {
                    ...workout,
                    dayStatus,
                    isCompleted: !!history,
                };
            })
        );

        return workoutsWithStatus.sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek));
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

export const removeWorkoutExercise = mutation({
    args: {
        workoutId: v.id("workouts"),
        workoutExerciseId: v.id("workoutExercises"),
    },
    handler: async (ctx, args) => {
        const workout = await ctx.db.get(args.workoutId);
        if (!workout) return { success: false };

        const nextExercises = workout.exercises.filter((id) => id !== args.workoutExerciseId);
        await ctx.db.patch(args.workoutId, { exercises: nextExercises });
        await ctx.db.delete(args.workoutExerciseId);

        return { success: true };
    },
});

export const createSuperset = mutation({
    args: {
        workoutId: v.id("workouts"),
        baseWorkoutExerciseId: v.id("workoutExercises"),
        workoutExerciseIds: v.array(v.id("workoutExercises")),
    },
    handler: async (ctx, args) => {
        const workout = await ctx.db.get(args.workoutId);
        if (!workout) return { success: false };

        const allIds = Array.from(new Set([args.baseWorkoutExerciseId, ...args.workoutExerciseIds]));
        if (allIds.length < 2) return { success: false };

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const existingGroups = new Set<string>();

        for (const weId of workout.exercises) {
            const we = await ctx.db.get(weId);
            if (we?.supersetGroup) existingGroups.add(we.supersetGroup);
        }

        const supersetGroup = letters.split("").find((l) => !existingGroups.has(l)) || `G${Date.now()}`;

        await Promise.all(
            allIds.map(async (weId) => {
                await ctx.db.patch(weId, { supersetGroup });
            })
        );

        return { success: true, supersetGroup, count: allIds.length };
    },
});
