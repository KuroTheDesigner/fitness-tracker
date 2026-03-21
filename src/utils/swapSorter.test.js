import { describe, it, expect } from 'vitest';
import { categorizeAlternatives } from './swapSorter';

describe('Swap Sorter Algorithm', () => {

    const baseSource = {
        _id: 'ex1',
        name: 'Barbell Bench Press',
        primary_muscle: 'Chest',
        emphasized_focus: 'Overall',
        muscleGroups: ['Chest', 'Triceps', 'Shoulders']
    };

    const mockDB = [
        {
            _id: 'ex1', // Same ID as source
            name: 'Barbell Bench Press',
            primary_muscle: 'Chest',
            emphasized_focus: 'Overall',
            muscleGroups: ['Chest', 'Triceps', 'Shoulders']
        },
        {
            _id: 'ex2',
            name: 'Dumbbell Bench Press',
            primary_muscle: 'Chest',
            emphasized_focus: 'Overall',
            muscleGroups: ['Chest', 'Triceps']
        },
        {
            _id: 'ex3',
            name: 'Incline Dumbbell Press',
            primary_muscle: 'Chest',
            emphasized_focus: 'Upper',
            muscleGroups: ['Chest', 'Shoulders']
        },
        {
            _id: 'ex4',
            name: 'Tricep Pushdown',
            primary_muscle: 'Triceps',
            emphasized_focus: 'Long Head',
            muscleGroups: ['Triceps']
        },
        {
            _id: 'ex5',
            name: 'Leg Press',
            primary_muscle: 'Quads',
            emphasized_focus: 'Overall',
            muscleGroups: ['Legs']
        }
    ];

    it('filters out the exact same exercise from both arrays', () => {
        const { recommended, other } = categorizeAlternatives(baseSource, mockDB);

        expect(recommended.find(e => e._id === 'ex1')).toBeUndefined();
        expect(other.find(e => e._id === 'ex1')).toBeUndefined();
    });

    it('routes exact primary AND focused matches into Recommended', () => {
        const { recommended } = categorizeAlternatives(baseSource, mockDB);

        expect(recommended).toHaveLength(1);
        expect(recommended[0]._id).toBe('ex2'); // Dumbbell Bench Press matches Overall
    });

    it('routes primary matches with different focuses into Other', () => {
        const { other } = categorizeAlternatives(baseSource, mockDB);

        // ex3 (Incline Dumbbell Press) has 'Upper' focus vs 'Overall'
        expect(other.find(e => e._id === 'ex3')).toBeDefined();
    });

    it('routes general muscle group matches into Other if primary differs', () => {
        const { other } = categorizeAlternatives(baseSource, mockDB);

        // ex4 (Tricep Pushdown) shares the 'Triceps' muscle group with source
        expect(other.find(e => e._id === 'ex4')).toBeDefined();
    });

    it('completely ignores completely unrelated exercises', () => {
        const { recommended, other } = categorizeAlternatives(baseSource, mockDB);

        // ex5 (Leg Press) shares no muscle groups
        expect(recommended.find(e => e._id === 'ex5')).toBeUndefined();
        expect(other.find(e => e._id === 'ex5')).toBeUndefined();
    });

    it('recommends all primary matches if source has no specific focus', () => {
        const unfocusedSource = {
            _id: 'ex99',
            primary_muscle: 'Chest',
            muscleGroups: ['Chest']
        };

        const { recommended } = categorizeAlternatives(unfocusedSource, mockDB);

        // Without a focus, both ex1 and ex2 and ex3 should be recommended because they all have Chest primary
        const recommendedIds = recommended.map(r => r._id);
        expect(recommendedIds).toContain('ex1'); // Wait, ex1 is not the source this time, so it's included!
        expect(recommendedIds).toContain('ex2');
        expect(recommendedIds).toContain('ex3');
    });

    it('returns empty arrays gracefully given null data', () => {
        expect(categorizeAlternatives(null, null)).toEqual({ recommended: [], other: [] });
        expect(categorizeAlternatives(baseSource, [])).toEqual({ recommended: [], other: [] });
    });
});
