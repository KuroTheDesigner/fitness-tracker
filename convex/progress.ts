import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUserStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;

        // Count PRs
        const prs = await ctx.db
            .query("personalRecords")
            .withIndex("by_userId_exerciseId")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .collect();

        return {
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            prCount: prs.length,
        };
    },
});

export const getWeeklyActivity = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const history = await ctx.db
            .query("workoutHistory")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.gte(q.field("completedAt"), oneWeekAgo))
            .collect();

        // Group by day
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const activity = days.map(day => ({
            day,
            workouts: 0,
            sets: 0,
        }));

        history.forEach(h => {
            const dayIndex = new Date(h.completedAt).getDay();
            activity[dayIndex].workouts += 1;
            activity[dayIndex].sets += h.completedSets || 0;
        });

        return activity;
    },
});

export const getMuscleBreakdown = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Get recent set history
        const recentSets = await ctx.db
            .query("setHistory")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(50);

        // Count by muscle group
        const muscleCount = {};

        for (const set of recentSets) {
            const exercise = await ctx.db.get(set.exerciseId);
            if (exercise?.muscleGroups) {
                exercise.muscleGroups.forEach(muscle => {
                    muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
                });
            }
        }

        const total = Object.values(muscleCount).reduce((a, b) => a + b, 0) || 1;

        return Object.entries(muscleCount)
            .map(([name, count]) => ({
                name,
                percent: Math.round((count / total) * 100),
            }))
            .sort((a, b) => b.percent - a.percent);
    },
});

export const getRecentPRs = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const prs = await ctx.db
            .query("personalRecords")
            .withIndex("by_userId_exerciseId")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .take(5);

        const enriched = await Promise.all(
            prs.map(async pr => {
                const exercise = await ctx.db.get(pr.exerciseId);
                return {
                    ...pr,
                    exerciseName: exercise?.name || 'Unknown',
                };
            })
        );

        return enriched;
    },
});
