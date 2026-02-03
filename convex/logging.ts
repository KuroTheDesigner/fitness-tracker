import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const logSet = mutation({
    args: {
        userId: v.id("users"),
        workoutExerciseId: v.id("workoutExercises"),
        exerciseId: v.id("exercises"),
        setNumber: v.number(),
        weight: v.number(),
        reps: v.number(),
        effortLevel: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Check for PR
        const existingPR = await ctx.db
            .query("personalRecords")
            .withIndex("by_userId_exerciseId", (q) =>
                q.eq("userId", args.userId).eq("exerciseId", args.exerciseId)
            )
            .unique();

        let isPR = false;
        if (!existingPR || args.weight > existingPR.value) {
            isPR = true;
        }

        // 2. Insert into setHistory
        const setHistoryId = await ctx.db.insert("setHistory", {
            ...args,
            isPR,
            completedAt: Date.now(),
        });

        // 3. Update PR if necessary
        if (isPR) {
            if (existingPR) {
                await ctx.db.patch(existingPR._id, {
                    value: args.weight,
                    achievedAt: Date.now(),
                    setHistoryId,
                });
            } else {
                await ctx.db.insert("personalRecords", {
                    userId: args.userId,
                    exerciseId: args.exerciseId,
                    type: "MAX_WEIGHT",
                    value: args.weight,
                    achievedAt: Date.now(),
                    setHistoryId,
                });
            }
        }

        return { setHistoryId, isPR };
    },
});

export const finishWorkout = mutation({
    args: {
        userId: v.id("users"),
        workoutId: v.id("workouts"),
        duration: v.number(),
        completedSets: v.number(),
        totalSets: v.number(),
    },
    handler: async (ctx, args) => {
        // 1. Log workout completion
        await ctx.db.insert("workoutHistory", {
            userId: args.userId,
            workoutId: args.workoutId,
            completedAt: Date.now(),
            duration: args.duration,
            completedSets: args.completedSets,
            totalSets: args.totalSets,
        });

        // 2. Update user streak
        const user = await ctx.db.get(args.userId);
        if (user) {
            const today = new Date().toISOString().split('T')[0];
            const lastWorkoutDate = user.lastWorkoutDate;

            let newStreak = user.currentStreak;
            if (lastWorkoutDate !== today) {
                // Logic for consecutive days (simplified)
                newStreak += 1;
            }

            await ctx.db.patch(args.userId, {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, user.longestStreak),
                lastWorkoutDate: today,
            });
        }
    },
});
