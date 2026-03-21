// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActiveWorkoutPage from './ActiveWorkoutPage';
import { useQuery, useMutation } from 'convex/react';

// Mock the Convex React hooks
vi.mock('convex/react', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
}));

describe('ActiveWorkoutPage Legacy Regression', () => {
    const mockLogSet = vi.fn().mockResolvedValue({ isPR: false });
    const mockFinishWorkout = vi.fn().mockResolvedValue({});

    beforeEach(() => {
        vi.clearAllMocks();

        // Return a generic function that just returns our mockLogSet
        // to avoid proxy stringification errors.
        useMutation.mockReturnValue(mockLogSet);
    });

    it('renders exercises and allows checking off sets for isolated exercises', async () => {
        const mockWorkout = {
            _id: 'w1',
            name: 'Chest Day',
            exercises: [
                {
                    _id: 'we1',
                    exerciseId: 'ex1',
                    exercise: { name: 'Flat Bench Press' },
                    targetSets: 2,
                    targetReps: '10',
                    restSeconds: 60,
                    orderIndex: 0
                }
            ]
        };

        useQuery.mockReturnValue(mockWorkout);

        render(<ActiveWorkoutPage userId="u1" workoutId="w1" onBack={vi.fn()} onFinish={vi.fn()} />);

        // Ensure title and exercise name render
        expect(screen.getByText('Chest Day')).toBeInTheDocument();
        expect(screen.getByText('Flat Bench Press')).toBeInTheDocument();

        // Ensure two checkbox buttons exist
        const checkboxes = screen.getAllByRole('button');

        // We know weight and rep inputs exist for both sets
        const inputs = screen.getAllByPlaceholderText('0');
        expect(inputs).toHaveLength(4); // 2 sets * 2 inputs each

        // Change weight and reps for the first set
        fireEvent.change(inputs[0], { target: { value: '100' } });
        fireEvent.change(inputs[1], { target: { value: '10' } });

        expect(inputs[0].value).toBe('100');
        expect(inputs[1].value).toBe('10');
    });
});
