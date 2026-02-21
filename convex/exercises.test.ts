import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

test("creates and queries exercises by taxonomy tags", async () => {
    const t = convexTest(schema);

    // Insert mock exercises with the new Phase 1 schema
    await t.run(async (ctx) => {
        await ctx.db.insert("exercises", {
            name: "Incline Bench Press",
            muscleGroups: ["chest", "triceps", "shoulders"],
            primary_muscle: "chest",
            secondary_muscles: ["triceps", "shoulders"],
            emphasized_focus: "upper-chest",
            isCustom: false,
        });

        await ctx.db.insert("exercises", {
            name: "Flat Bench Press",
            muscleGroups: ["chest", "triceps", "shoulders"],
            primary_muscle: "chest",
            secondary_muscles: ["triceps", "shoulders"],
            emphasized_focus: "mid-chest",
            isCustom: false,
        });
    });

    // TDD Verification: Validate the queries filter by our new tags correctly
    const upperChest = await t.query(api.exercises.getExercisesByFocus, {
        targetMuscle: "chest",
        emphasizedFocus: "upper-chest"
    });

    expect(upperChest.length).toBe(1);
    expect(upperChest[0].name).toBe("Incline Bench Press");

    const anyChest = await t.query(api.exercises.getExercisesByFocus, {
        targetMuscle: "chest"
    });

    expect(anyChest.length).toBe(2);
});

test("creates superset tags in setHistory schema", async () => {
    const t = convexTest(schema);

    // Insert valid setHistory mock demonstrating superset ID tags
    await t.run(async (ctx) => {
        // We'd normally do this with relational inserts but we're just checking the schema allows it
        const userId = await ctx.db.insert("users", {
            clerkId: "mock_123",
            name: "Mock User",
            email: "mock@test.com",
            currentStreak: 0,
            longestStreak: 0,
            createdAt: Date.now()
        });

        const programId = await ctx.db.insert("programs", {
            name: "Mock Program",
            description: "Mock",
            weeks: 4,
            isActive: true,
            userId: userId
        });

        const workoutId = await ctx.db.insert("workouts", {
            programId: programId,
            name: "Mock Workout",
            weekNumber: 1,
            dayOfWeek: "MON",
            exercises: []
        });

        const workoutHistoryId = await ctx.db.insert("workoutHistory", {
            userId: userId,
            workoutId: workoutId,
            completedAt: Date.now(),
            duration: 3600,
            completedSets: 4,
            totalSets: 4
        });

        const exerciseId = await ctx.db.insert("exercises", {
            name: "Bench",
            muscleGroups: ["chest"],
            isCustom: false
        });

        const workoutExerciseId = await ctx.db.insert("workoutExercises", {
            workoutId: workoutId,
            exerciseId: exerciseId,
            orderIndex: 0,
            targetSets: 3,
            targetReps: "10",
            restSeconds: 60
        });

        await ctx.db.insert("setHistory", {
            userId: userId,
            workoutHistoryId: workoutHistoryId,
            workoutExerciseId: workoutExerciseId,
            exerciseId: exerciseId,
            setNumber: 1,
            setId: "1A", // Testing the new field validation
            reps: 10,
            weight: 100,
            isPR: false,
            completedAt: Date.now()
        });
    });

    expect(true).toBe(true); // If it doesn't throw, schema accepted the tags
});
