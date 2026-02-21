import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        currentStreak: v.number(),
        longestStreak: v.number(),
        lastWorkoutDate: v.optional(v.string()), // ISO date string
        createdAt: v.number(),
    }).index("by_clerkId", ["clerkId"]),

    programs: defineTable({
        name: v.string(),
        description: v.string(),
        weeks: v.number(),
        isActive: v.boolean(),
        userId: v.id("users"),
    }).index("by_userId", ["userId"]),

    workouts: defineTable({
        programId: v.id("programs"),
        name: v.string(),
        weekNumber: v.number(),
        dayOfWeek: v.string(), // "MON", "TUE", etc.
        exercises: v.array(v.id("workoutExercises")),
    }).index("by_programId", ["programId"]),

    exercises: defineTable({
        name: v.string(),
        muscleGroups: v.array(v.string()),
        primary_muscle: v.optional(v.string()), // Target Muscle
        secondary_muscles: v.optional(v.array(v.string())), // Collateral muscles 
        emphasized_focus: v.optional(v.string()), // Specific part of muscle (e.g. Upper Chest)
        equipment: v.optional(v.string()),
        youtubeUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        instructions: v.optional(v.array(v.string())),
        isCustom: v.boolean(),
        userId: v.optional(v.id("users")),
    }),

    workoutExercises: defineTable({
        workoutId: v.id("workouts"),
        exerciseId: v.id("exercises"),
        supersetGroup: v.optional(v.string()),
        orderIndex: v.number(),
        targetSets: v.number(),
        targetReps: v.string(),
        restSeconds: v.number(),
        notes: v.optional(v.string()),
    }).index("by_workoutId", ["workoutId"]),

    workoutHistory: defineTable({
        userId: v.id("users"),
        workoutId: v.id("workouts"),
        completedAt: v.number(),
        duration: v.number(),
        completedSets: v.number(),
        totalSets: v.number(),
    }).index("by_userId", ["userId"]),

    setHistory: defineTable({
        userId: v.id("users"),
        workoutHistoryId: v.optional(v.id("workoutHistory")),
        workoutExerciseId: v.id("workoutExercises"),
        exerciseId: v.id("exercises"),
        setNumber: v.number(),
        setId: v.optional(v.string()), // Format: '1A', '1B' for supersets
        weight: v.optional(v.number()),
        reps: v.number(),
        effortLevel: v.optional(v.string()),
        isPR: v.boolean(),
        completedAt: v.number(),
    }).index("by_userId", ["userId"])
        .index("by_exerciseId", ["exerciseId"]),

    personalRecords: defineTable({
        userId: v.id("users"),
        exerciseId: v.id("exercises"),
        type: v.string(),
        value: v.number(),
        achievedAt: v.number(),
        setHistoryId: v.id("setHistory"),
    }).index("by_userId_exerciseId", ["userId", "exerciseId"]),
});
