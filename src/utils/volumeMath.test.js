import { describe, it, expect } from 'vitest';
import { aggregateMuscleVolumes, getVolumeColorMatrix } from './volumeMath';

describe('Volume Tracker Aggregator Module', () => {

    const exercisesDB = [
        {
            _id: 'ex1',
            name: 'Bench Press',
            primary_muscle: 'Chest',
            secondary_muscles: ['Triceps', 'Shoulders']
        },
        {
            _id: 'ex2',
            name: 'Triceps Extension',
            primary_muscle: 'Triceps',
            secondary_muscles: []
        }
    ];

    it('aggregates precisely 1.0 for Primary and 0.5 for Secondary muscles per set', () => {
        const completedSets = [
            { exerciseId: 'ex1' },
            { exerciseId: 'ex1' },
            { exerciseId: 'ex1' }
        ];

        // 3 sets of Bench Press
        const result = aggregateMuscleVolumes(completedSets, exercisesDB);

        expect(result['Chest'].volume).toBe(3); // 3 * 1.0
        expect(result['Triceps'].volume).toBe(1.5); // 3 * 0.5
        expect(result['Shoulders'].volume).toBe(1.5); // 3 * 0.5
    });

    it('calculates custom target percentage ratios properly, enforcing default of 6', () => {
        const completedSets = [
            { exerciseId: 'ex2' },
            { exerciseId: 'ex2' }
        ]; // 2 sets of Triceps -> 2 volume

        const resultWithDefault = aggregateMuscleVolumes(completedSets, exercisesDB);
        expect(resultWithDefault['Triceps'].target).toBe(6);
        expect(resultWithDefault['Triceps'].percentage).toBeCloseTo(33.33, 1);

        const customTargets = { 'Triceps': 4 };
        const resultWithCustom = aggregateMuscleVolumes(completedSets, exercisesDB, customTargets);
        expect(resultWithCustom['Triceps'].target).toBe(4);
        expect(resultWithCustom['Triceps'].percentage).toBe(50);
    });

    it('caps percentages at a ceiling of 100%', () => {
        const completedSets = Array.from({ length: 10 }).map(() => ({ exerciseId: 'ex2' })); // 10 sets
        const result = aggregateMuscleVolumes(completedSets, exercisesDB, { 'Triceps': 5 });

        expect(result['Triceps'].volume).toBe(10);
        expect(result['Triceps'].percentage).toBe(100);
    });

    it('aggregates identically targeted muscles natively across different exercises', () => {
        const completedSets = [
            { exerciseId: 'ex1' }, // Chest (1) + Triceps (0.5)
            { exerciseId: 'ex1' }, // Chest (1) + Triceps (0.5)
            { exerciseId: 'ex2' }, // Triceps (1)
            { exerciseId: 'ex2' }, // Triceps (1)
        ];

        const result = aggregateMuscleVolumes(completedSets, exercisesDB);

        expect(result['Chest'].volume).toBe(2);
        expect(result['Triceps'].volume).toBe(3); // 0.5 + 0.5 + 1.0 + 1.0
    });

    describe('Color Matrix Evaluator', () => {
        it('assigns perfect Electric Green for >= 100%', () => {
            expect(getVolumeColorMatrix(100)).toBe('#00FF66');
            expect(getVolumeColorMatrix(150)).toBe('#00FF66');
        });

        it('assigns Yellow-Green for nearly complete targets >= 80%', () => {
            expect(getVolumeColorMatrix(85)).toBe('#A3FF00');
        });

        it('assigns Warning Gold for half-complete targets >= 50%', () => {
            expect(getVolumeColorMatrix(60)).toBe('#FFD700');
        });

        it('assigns Danger Red for abysmal volumes < 25%', () => {
            expect(getVolumeColorMatrix(15)).toBe('#FF3333');
            expect(getVolumeColorMatrix(0)).toBe('#FF3333');
        });
    });

});
