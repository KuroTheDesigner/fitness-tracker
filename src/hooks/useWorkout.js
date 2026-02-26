import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useWorkout = (userId) => {
    const program = useQuery(api.workouts.getProgram, userId ? { userId } : "skip");
    const schedule = useQuery(
        api.workouts.getWorkoutSchedule,
        program ? { programId: program._id } : "skip"
    );
    const isProgramLoading = !!userId && program === undefined;
    const isScheduleLoading = !!program && schedule === undefined;

    const logSet = useMutation(api.logging.logSet);
    const finishWorkout = useMutation(api.logging.finishWorkout);

    return {
        program,
        schedule,
        logSet,
        finishWorkout,
        isLoading: isProgramLoading || isScheduleLoading,
    };
};
