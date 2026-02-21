/**
 * Aggregates exercise sets into a comprehensive Muscle Volume Tracker.
 * Rules: 
 * - Each COMPLETED set grants 1.0 volume point to its Primary Muscle.
 * - Each COMPLETED set grants 0.5 volume points to its Secondary Muscles.
 * Custom targets evaluate the completion percentages. (Default Goal = 6)
 *
 * @param {Array} completedSets - e.g. [{ weight: 100, reps: 10, exerciseId: 'eqwewq' }]
 * @param {Array} exercises - Context details from DB [{ _id, primary_muscle, secondary_muscles }]
 * @param {Object} customTargets - e.g. { 'Chest': 8, 'Triceps': 4 } -- Defaults to 6 for all if undefined
 * 
 * @returns {Object} mapped dictionary with percentages, e.g. { 'Chest': { volume: 3, target: 8, percentage: 37.5 } }
 */
export function aggregateMuscleVolumes(completedSets, exercises, customTargets = {}) {
    if (!completedSets || !exercises || completedSets.length === 0 || exercises.length === 0) {
        return {};
    }

    const volumeMap = {};

    completedSets.forEach(set => {
        const ex = exercises.find(e => e._id === set.exerciseId);
        if (!ex) return;

        // Add 1.0 points to Primary
        const primary = ex.primary_muscle;
        if (primary) {
            if (!volumeMap[primary]) volumeMap[primary] = 0;
            volumeMap[primary] += 1;
        }

        // Add 0.5 points to all Secondaries
        const secondaries = ex.secondary_muscles || [];
        secondaries.forEach(secondary => {
            if (!volumeMap[secondary]) volumeMap[secondary] = 0;
            volumeMap[secondary] += 0.5;
        });
    });

    // Compute percentages and goals
    const results = {};
    Object.keys(volumeMap).forEach(muscle => {
        const target = customTargets[muscle] || 6; // Default target is 6 sets per session
        const volume = volumeMap[muscle];
        const percentage = Math.min((volume / target) * 100, 100);

        results[muscle] = {
            volume,
            target,
            percentage
        };
    });

    return results;
}

/**
 * Derives a color hex code mapped along a matrix comparing volume progress.
 * Red (0%) -> Orange (50%) -> Electric Green (100%+)
 */
export function getVolumeColorMatrix(percentage) {
    if (percentage >= 100) return '#00FF66'; // Electric Green
    if (percentage >= 80) return '#A3FF00';  // Yellow-Green
    if (percentage >= 50) return '#FFD700';  // Gold/Warning
    if (percentage >= 25) return '#FF8C00';  // Orange
    return '#FF3333';                        // Danger Red
}
