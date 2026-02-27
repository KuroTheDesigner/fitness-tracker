import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        shooSubject: v.optional(v.string()), // pairwise_sub from Shoo (Google identity)
        name: v.optional(v.string()),
        displayName: v.optional(v.string()),
        email: v.optional(v.string()),
        username: v.optional(v.string()),
        usernameNormalized: v.optional(v.string()),
        credentialPinHash: v.optional(v.string()),
        credentialPinSalt: v.optional(v.string()),
        credentialPinIterations: v.optional(v.number()),
        authProviders: v.optional(v.array(v.string())),
        onboardingCompleted: v.optional(v.boolean()),
        onboardingCompletedAt: v.optional(v.number()),
        preferredWorkoutDays: v.optional(v.array(v.string())),
        currentStreak: v.optional(v.number()),
        longestStreak: v.optional(v.number()),
        lastWorkoutDate: v.optional(v.string()), // ISO date string
        createdAt: v.optional(v.number()),
    }).index("by_shooSubject", ["shooSubject"])
        .index("by_usernameNormalized", ["usernameNormalized"]),

    credentialAuthSessions: defineTable({
        userId: v.id("users"),
        tokenHash: v.string(),
        expiresAt: v.number(),
        createdAt: v.number(),
    }).index("by_tokenHash", ["tokenHash"])
        .index("by_userId", ["userId"]),

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
        workoutHistoryId: v.id("workoutHistory"),
        workoutExerciseId: v.id("workoutExercises"),
        exerciseId: v.id("exercises"),
        setNumber: v.number(),
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
}, { schemaValidation: false });
