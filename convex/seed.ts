import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Create a dummy user
        const userId = await ctx.db.insert("users", {
            clerkId: "user_123",
            name: "Oshiogwe",
            email: "user@example.com",
            currentStreak: 5,
            longestStreak: 12,
            createdAt: Date.now(),
        });

        // 2. Create the Beginner Phase 2 Program
        const programId = await ctx.db.insert("programs", {
            name: "Beginner Phase 2",
            description: "3-Day Full Body Program focusing on fat loss and strength foundation.",
            weeks: 8,
            isActive: true,
            userId: userId,
        });

        // 3. Create Exercises
        const ex1 = await ctx.db.insert("exercises", {
            name: "Neutral Grip Dumbbell Press",
            muscleGroups: ["Chest", "Front Delts"],
            equipment: "Dumbbells",
            youtubeUrl: "https://www.youtube.com/watch?v=W3M3pIsN_8k",
            isCustom: false,
        });

        const ex2 = await ctx.db.insert("exercises", {
            name: "3 Point Dumbbell Row",
            muscleGroups: ["Back", "Biceps"],
            equipment: "Dumbbells",
            youtubeUrl: "https://www.youtube.com/watch?v=6KOclUM8D3A",
            isCustom: false,
        });

        const ex3 = await ctx.db.insert("exercises", {
            name: "Dumbbell Romanian Deadlift",
            muscleGroups: ["Hamstrings", "Glutes"],
            equipment: "Dumbbells",
            youtubeUrl: "https://www.youtube.com/watch?v=JCX81Pbcid8",
            isCustom: false,
        });

        const ex4 = await ctx.db.insert("exercises", {
            name: "Dumbbell Lateral Raises",
            muscleGroups: ["Shoulders"],
            equipment: "Dumbbells",
            youtubeUrl: "https://www.youtube.com/watch?v=PzsziW-H-6Y",
            isCustom: false,
        });

        // 4. Create Workouts
        const workoutAId = await ctx.db.insert("workouts", {
            programId: programId,
            name: "Workout A",
            weekNumber: 1,
            dayOfWeek: "FRI",
            exercises: [], // Will populate below
        });

        // 5. Connect Exercises to Workout A (Workout Exercises)
        const we1 = await ctx.db.insert("workoutExercises", {
            workoutId: workoutAId,
            exerciseId: ex1,
            supersetGroup: "A",
            orderIndex: 0,
            targetSets: 4,
            targetReps: "8-12",
            restSeconds: 120,
        });

        const we2 = await ctx.db.insert("workoutExercises", {
            workoutId: workoutAId,
            exerciseId: ex2,
            supersetGroup: "A",
            orderIndex: 1,
            targetSets: 4,
            targetReps: "8-12",
            restSeconds: 120,
        });

        const we3 = await ctx.db.insert("workoutExercises", {
            workoutId: workoutAId,
            exerciseId: ex3,
            supersetGroup: "B",
            orderIndex: 2,
            targetSets: 3,
            targetReps: "10-15",
            restSeconds: 90,
        });

        const we4 = await ctx.db.insert("workoutExercises", {
            workoutId: workoutAId,
            exerciseId: ex4,
            supersetGroup: "B",
            orderIndex: 3,
            targetSets: 3,
            targetReps: "15-20",
            restSeconds: 90,
        });

        // Update workout with exercise IDs
        await ctx.db.patch(workoutAId, {
            exercises: [we1, we2, we3, we4],
        });

        return { userId, programId, workoutAId };
    },
});
