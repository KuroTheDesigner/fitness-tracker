/**
 * Categorizes a list of exercises into Recommended and Other alternatives
 * based on the taxonomy (primary_muscle, emphasized_focus) of a source exercise.
 *
 * @param {Object} sourceExercise - The exercise being swapped out
 * @param {Array} allExercises - The pool of available exercises
 * @returns {Object} { recommended: Array, other: Array }
 */
export function categorizeAlternatives(sourceExercise, allExercises) {
    const recommended = [];
    const other = [];

    if (!sourceExercise || !allExercises || !Array.isArray(allExercises)) {
        return { recommended, other };
    }

    allExercises.forEach(ex => {
        // Skip the exact same exercise
        if (ex._id === sourceExercise._id) return;

        const matchesPrimary = sourceExercise.primary_muscle && ex.primary_muscle === sourceExercise.primary_muscle;

        if (matchesPrimary) {
            const sourceFocus = sourceExercise.emphasized_focus;
            const targetFocus = ex.emphasized_focus;

            if (sourceFocus) {
                if (targetFocus === sourceFocus) {
                    recommended.push(ex);
                } else {
                    other.push(ex);
                }
            } else {
                // If the source has no specific focus, all primary matches are recommended
                recommended.push(ex);
            }
        } else {
            // If primary doesn't match, check if they share general muscle groups for 'Other'
            const sourceMuscleGroups = sourceExercise.muscleGroups || [];
            const targetMuscleGroups = ex.muscleGroups || [];

            const hasCommonGroup = sourceMuscleGroups.some(m => targetMuscleGroups.includes(m));
            if (hasCommonGroup) {
                other.push(ex);
            }
        }
    });

    return { recommended, other };
}
