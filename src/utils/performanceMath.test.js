import { describe, it, expect } from 'vitest';
import { calculateEfficacy, isPR, calculateChevrons } from './performanceMath';

describe('Performance Math Engine', () => {

    describe('calculateEfficacy', () => {
        it('calculates flat mathematical volume (weight x reps)', () => {
            expect(calculateEfficacy(100, 10)).toBe(1000);
            expect(calculateEfficacy(225, 5)).toBe(1125);
        });

        it('returns 0 for invalid or empty inputs', () => {
            expect(calculateEfficacy(0, 10)).toBe(0);
            expect(calculateEfficacy(100, 0)).toBe(0);
            expect(calculateEfficacy(null, undefined)).toBe(0);
        });
    });

    describe('isPR Algorithm', () => {
        it('returns true if current efficacy is higher than all historic efficacies', () => {
            const current = { weight: 110, reps: 10 }; // Efficacy 1100
            const history = [
                { weight: 100, reps: 10 }, // Efficacy 1000
                { weight: 105, reps: 8 },  // Efficacy 840
            ];
            expect(isPR(current, history)).toBe(true);
        });

        it('returns false if current efficacy ties but does not exceed historic max', () => {
            const current = { weight: 100, reps: 10 }; // Efficacy 1000
            const history = [
                { weight: 100, reps: 10 }, // Efficacy 1000
            ];
            expect(isPR(current, history)).toBe(false);
        });

        it('returns true if there is no historical data', () => {
            const current = { weight: 100, reps: 10 };
            expect(isPR(current, [])).toBe(true);
            expect(isPR(current, null)).toBe(true);
        });
    });

    describe('calculateChevrons', () => {
        it('returns 3 UP chevrons for > 10% increase', () => {
            // Efficacy 1150 vs Historic 1000 = 15% increase
            expect(calculateChevrons(1150, 1000)).toEqual({ direction: 'up', count: 3 });
        });

        it('returns 2 UP chevrons for 5.1% - 10% increase', () => {
            // Efficacy 1080 vs Historic 1000 = 8% increase
            expect(calculateChevrons(1080, 1000)).toEqual({ direction: 'up', count: 2 });
        });

        it('returns 1 UP chevron for 0.1% - 5% increase', () => {
            // Efficacy 1020 vs Historic 1000 = 2% increase
            expect(calculateChevrons(1020, 1000)).toEqual({ direction: 'up', count: 1 });
        });

        it('returns flat for exact ties or missing data', () => {
            expect(calculateChevrons(1000, 1000)).toEqual({ direction: 'flat', count: 0 });
            expect(calculateChevrons(1000, 0)).toEqual({ direction: 'flat', count: 0 });
            expect(calculateChevrons(0, 1000)).toEqual({ direction: 'flat', count: 0 });
        });

        it('returns DOWN chevrons correctly for decreases', () => {
            // -15% = 3 down
            expect(calculateChevrons(850, 1000)).toEqual({ direction: 'down', count: 3 });
            // -8% = 2 down
            expect(calculateChevrons(920, 1000)).toEqual({ direction: 'down', count: 2 });
            // -2% = 1 down
            expect(calculateChevrons(980, 1000)).toEqual({ direction: 'down', count: 1 });
        });
    });
});
