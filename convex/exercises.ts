import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllExercises = query({
    handler: async (ctx) => {
        return await ctx.db.query("exercises").collect();
    },
});

export const getExercisesByFocus = query({
    args: { targetMuscle: v.string(), emphasizedFocus: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let allExercises = await ctx.db.query("exercises").collect();
        return allExercises.filter(ex =>
            ex.primary_muscle === args.targetMuscle &&
            (args.emphasizedFocus ? ex.emphasized_focus === args.emphasizedFocus : true)
        );
    },
});

export const searchExercises = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const queryTerm = args.query.toLowerCase();

        let allExercises = await ctx.db.query("exercises").collect();

        if (queryTerm) {
            allExercises = allExercises.filter(ex =>
                ex.name.toLowerCase().includes(queryTerm) ||
                (ex.muscleGroups && ex.muscleGroups.some(m => m.toLowerCase().includes(queryTerm)))
            );
        }

        return allExercises;
    },
});

// Assuming we swap by updating the workoutExercise's exerciseId
export const swapExercise = mutation({
    args: {
        workoutExerciseId: v.id("workoutExercises"),
        newExerciseId: v.id("exercises"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.workoutExerciseId, {
            exerciseId: args.newExerciseId,
        });
        return { success: true };
    },
});

export const createCustomExercise = mutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
        muscleGroups: v.array(v.string()),
        equipment: v.optional(v.string()),
        youtubeUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const exerciseId = await ctx.db.insert("exercises", {
            name: args.name,
            muscleGroups: args.muscleGroups,
            equipment: args.equipment,
            youtubeUrl: args.youtubeUrl,
            isCustom: true,
            userId: args.userId,
            thumbnailUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop" // default thumbnail
        });

        return exerciseId;
    },
});
