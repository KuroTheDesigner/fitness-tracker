/**
 * Calculates the flat efficacy volume (weight * reps) for a single set.
 * @param {number} weight 
 * @param {number} reps 
 * @returns {number}
 */
export function calculateEfficacy(weight, reps) {
    if (!weight || !reps || weight <= 0 || reps <= 0) return 0;
    return weight * reps;
}

/**
 * Given a current set and an array of historical sets for the SAME exercise,
 * determines if the current set breaks the historic Efficacy PR.
 * @param {Object} currentSet { weight: number, reps: number }
 * @param {Array} historicalSets [{ weight, reps }, { weight, reps }]
 * @returns {boolean}
 */
export function isPR(currentSet, historicalSets = []) {
    const currentScore = calculateEfficacy(currentSet.weight, currentSet.reps);
    if (currentScore === 0) return false;

    if (!historicalSets || historicalSets.length === 0) return true; // First time doing it = PR

    const maxHistoricScore = Math.max(
        ...historicalSets.map(set => calculateEfficacy(set.weight, set.reps))
    );

    return currentScore > maxHistoricScore;
}

/**
 * Calculates the number of chevrons to display based on performance differential.
 * @param {number} currentEfficacy 
 * @param {number} historicEfficacy 
 * @returns {Object} { direction: 'up' | 'down' | 'flat', count: number }
 */
export function calculateChevrons(currentEfficacy, historicEfficacy) {
    if (!historicEfficacy || historicEfficacy === 0) return { direction: 'flat', count: 0 };
    if (!currentEfficacy || currentEfficacy === 0) return { direction: 'flat', count: 0 };

    const percentageDiff = ((currentEfficacy - historicEfficacy) / historicEfficacy) * 100;

    if (percentageDiff > 10) return { direction: 'up', count: 3 };
    if (percentageDiff > 5) return { direction: 'up', count: 2 };
    if (percentageDiff > 0) return { direction: 'up', count: 1 };

    if (percentageDiff < -10) return { direction: 'down', count: 3 };
    if (percentageDiff < -5) return { direction: 'down', count: 2 };
    if (percentageDiff < 0) return { direction: 'down', count: 1 };

    return { direction: 'flat', count: 0 };
}
