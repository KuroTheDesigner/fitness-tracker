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
const DAY_LABELS: Record<string, string> = {
    SUN: "Sunday",
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday",
    SAT: "Saturday",
};
const MAX_TARGET_SETS = 12;
const getUtcDateKey = () => new Date().toISOString().slice(0, 10);

const DEFAULT_EXERCISES = [
    {
        name: "Neutral Grip Dumbbell Press",
        muscleGroups: ["Chest", "Front Delts"],
        equipment: "Dumbbells",
        youtubeUrl: "https://www.youtube.com/watch?v=W3M3pIsN_8k",
    },
    {
        name: "3 Point Dumbbell Row",
        muscleGroups: ["Back", "Biceps"],
        equipment: "Dumbbells",
        youtubeUrl: "https://www.youtube.com/watch?v=6KOclUM8D3A",
    },
    {
        name: "Dumbbell Romanian Deadlift",
        muscleGroups: ["Hamstrings", "Glutes"],
        equipment: "Dumbbells",
        youtubeUrl: "https://www.youtube.com/watch?v=JCX81Pbcid8",
    },
    {
        name: "Dumbbell Lateral Raises",
        muscleGroups: ["Shoulders"],
        equipment: "Dumbbells",
        youtubeUrl: "https://www.youtube.com/watch?v=PzsziW-H-6Y",
    },
];

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

export const addExerciseToWorkout = mutation({
    args: {
        workoutId: v.id("workouts"),
        exerciseId: v.id("exercises"),
    },
    handler: async (ctx, args) => {
        const workout = await ctx.db.get(args.workoutId);
        if (!workout) throw new Error("Workout not found");

        const orderIndex = workout.exercises.length;
        const workoutExerciseId = await ctx.db.insert("workoutExercises", {
            workoutId: args.workoutId,
            exerciseId: args.exerciseId,
            orderIndex,
            targetSets: 3,
            targetReps: "8-12",
            restSeconds: 90,
        });

        await ctx.db.patch(args.workoutId, {
            exercises: [...workout.exercises, workoutExerciseId],
        });

        return { success: true, workoutExerciseId };
    },
});

export const removeExerciseFromSuperset = mutation({
    args: { workoutExerciseId: v.id("workoutExercises") },
    handler: async (ctx, args) => {
        const workoutExercise = await ctx.db.get(args.workoutExerciseId);
        if (!workoutExercise) throw new Error("Workout exercise not found");

        await ctx.db.patch(args.workoutExerciseId, { supersetGroup: undefined });
        return { success: true };
    },
});

export const incrementTargetSets = mutation({
    args: {
        workoutExerciseId: v.any(),
    },
    handler: async (ctx, args) => {
        const workoutExerciseId = typeof args.workoutExerciseId === "string"
            ? args.workoutExerciseId
            : (args.workoutExerciseId?._id || args.workoutExerciseId?.toString?.());

        if (!workoutExerciseId) {
            return { success: false, atLimit: false, targetSets: 0 };
        }

        const workoutExercise = await ctx.db.get(workoutExerciseId as any);
        if (!workoutExercise) {
            return { success: false, atLimit: false, targetSets: 0 };
        }

        const workout = await ctx.db.get(workoutExercise.workoutId as any);
        if (!workout) {
            return { success: false, atLimit: false, targetSets: workoutExercise.targetSets || 0 };
        }

        const program = await ctx.db.get(workout.programId as any);
        if (!program) {
            return { success: false, atLimit: false, targetSets: workoutExercise.targetSets || 0 };
        }

        const currentTargetSets = Number.isFinite(workoutExercise.targetSets)
            ? Math.max(0, Math.floor(workoutExercise.targetSets))
            : 0;
        const nextTargetSets = Math.min(MAX_TARGET_SETS, currentTargetSets + 1);
        if (nextTargetSets === currentTargetSets) {
            return {
                success: true,
                targetSets: currentTargetSets,
                atLimit: true,
            };
        }

        await ctx.db.patch(workoutExerciseId as any, {
            targetSets: nextTargetSets,
        });

        return {
            success: true,
            targetSets: nextTargetSets,
            atLimit: false,
        };
    },
});

export const bootstrapOnboardingProgram = mutation({
    args: {
        userId: v.id("users"),
        preferredWorkoutDays: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) throw new Error("User not found");

        const normalizedDays = Array.from(
            new Set(
                args.preferredWorkoutDays
                    .map((d) => d.toUpperCase())
                    .filter((d) => DAY_ORDER.includes(d))
            )
        );

        if (normalizedDays.length === 0) {
            throw new Error("Select at least one workout day");
        }

        let program = await ctx.db
            .query("programs")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .unique();

        if (!program) {
            const programId = await ctx.db.insert("programs", {
                name: "Starter Onboarding Program",
                description: "Initial plan generated from onboarding day selection.",
                weeks: 8,
                isActive: true,
                userId: args.userId,
            });
            program = await ctx.db.get(programId);
        }

        if (!program) throw new Error("Failed to create program");

        const existingWorkouts = await ctx.db
            .query("workouts")
            .withIndex("by_programId", (q) => q.eq("programId", program._id))
            .collect();

        for (const workout of existingWorkouts) {
            for (const workoutExerciseId of workout.exercises) {
                await ctx.db.delete(workoutExerciseId);
            }
            await ctx.db.delete(workout._id);
        }

        const exerciseLibrary = await ctx.db.query("exercises").collect();
        const byName = new Map(exerciseLibrary.map((exercise) => [exercise.name.toLowerCase(), exercise._id]));

        const defaultExerciseIds = [];
        for (const exercise of DEFAULT_EXERCISES) {
            let exerciseId = byName.get(exercise.name.toLowerCase());
            if (!exerciseId) {
                exerciseId = await ctx.db.insert("exercises", {
                    name: exercise.name,
                    muscleGroups: exercise.muscleGroups,
                    equipment: exercise.equipment,
                    youtubeUrl: exercise.youtubeUrl,
                    isCustom: false,
                });
                byName.set(exercise.name.toLowerCase(), exerciseId);
            }
            defaultExerciseIds.push(exerciseId);
        }

        const sortedDays = normalizedDays.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
        const createdWorkouts = [];

        for (let i = 0; i < sortedDays.length; i++) {
            const day = sortedDays[i];
            const workoutId = await ctx.db.insert("workouts", {
                programId: program._id,
                name: `${DAY_LABELS[day] || day} Workout`,
                weekNumber: 1,
                dayOfWeek: day,
                exercises: [],
            });

            const workoutExerciseIds = [];
            for (let j = 0; j < 3; j++) {
                const exerciseId = defaultExerciseIds[(i + j) % defaultExerciseIds.length];
                const workoutExerciseId = await ctx.db.insert("workoutExercises", {
                    workoutId,
                    exerciseId,
                    orderIndex: j,
                    targetSets: j === 2 ? 2 : 3,
                    targetReps: j === 2 ? "10-15" : "8-12",
                    restSeconds: j === 2 ? 75 : 90,
                });
                workoutExerciseIds.push(workoutExerciseId);
            }

            await ctx.db.patch(workoutId, { exercises: workoutExerciseIds });
            createdWorkouts.push({ workoutId, dayOfWeek: day, name: `${DAY_LABELS[day] || day} Workout` });
        }

        const todayIndex = new Date().getDay();
        const preferredIndices = sortedDays.map((d) => DAY_ORDER.indexOf(d));
        const nextIndex = preferredIndices.find((idx) => idx >= todayIndex) ?? preferredIndices[0];
        const nextDay = DAY_ORDER[nextIndex];
        const firstUpcoming = createdWorkouts.find((w) => w.dayOfWeek === nextDay) || createdWorkouts[0];

        await ctx.db.patch(args.userId, {
            preferredWorkoutDays: sortedDays,
            onboardingCompleted: false,
            onboardingGuideDateKey: getUtcDateKey(),
            onboardingGuideSteps: {
                addedExercise: false,
                createdSuperset: false,
                separatedSuperset: false,
            },
            onboardingActiveWorkoutId: firstUpcoming?.workoutId,
        });

        return {
            success: true,
            programId: program._id,
            workoutId: firstUpcoming?.workoutId,
            workoutName: firstUpcoming?.name,
            dayOfWeek: firstUpcoming?.dayOfWeek,
        };
    },
});
