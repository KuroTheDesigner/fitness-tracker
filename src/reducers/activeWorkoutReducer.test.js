import { describe, it, expect } from 'vitest';
import { activeWorkoutReducer, ACTIONS } from './activeWorkoutReducer';

describe('activeWorkoutReducer', () => {

    it('initializes raw flat arrays into structured groups', () => {
        const rawConvexData = [
            { _id: 'ex1', orderIndex: 0, supersetGroup: null },
            { _id: 'ex2', orderIndex: 1, supersetGroup: 'groupA' },
            { _id: 'ex3', orderIndex: 2, supersetGroup: 'groupA' },
            { _id: 'ex4', orderIndex: 3, supersetGroup: null }
        ];

        const state = activeWorkoutReducer({ groups: [] }, { type: ACTIONS.INIT, payload: rawConvexData });

        expect(state.groups.length).toBe(3);
        expect(state.groups[0].isSuperset).toBe(false);
        expect(state.groups[1].isSuperset).toBe(true);
        expect(state.groups[1].exercises.length).toBe(2);
        expect(state.groups[2].isSuperset).toBe(false);
    });

    it('merges an isolated exercise into another isolated exercise to form a superset', () => {
        const initialState = {
            groups: [
                { id: 'g1', isSuperset: false, exercises: [{ _id: 'ex1' }] },
                { id: 'g2', isSuperset: false, exercises: [{ _id: 'ex2' }] }
            ]
        };

        // Drag ex1 into g2 at index 0
        const state = activeWorkoutReducer(initialState, {
            type: ACTIONS.MOVE_EXERCISE,
            payload: { sourceGroupId: 'g1', sourceIndex: 0, destGroupId: 'g2', destIndex: 0 }
        });

        // g1 is empty so it deletes. g2 becomes a superset.
        expect(state.groups.length).toBe(1);
        expect(state.groups[0].isSuperset).toBe(true);
        expect(state.groups[0].exercises.length).toBe(2);
        expect(state.groups[0].exercises[0]._id).toBe('ex1'); // Moved to index 0
        expect(state.groups[0].exercises[1]._id).toBe('ex2'); // Pushed to index 1
    });

    it('downgrades a superset to isolated when an exercise is extracted', () => {
        const initialState = {
            groups: [
                { id: 'superset1', isSuperset: true, exercises: [{ _id: 'ex1' }, { _id: 'ex2' }] }
            ]
        };

        const state = activeWorkoutReducer(initialState, {
            type: ACTIONS.SEPARATE_FROM_SUPERSET,
            payload: { sourceGroupId: 'superset1', exerciseId: 'ex1', insertAfterGroupId: 'superset1' }
        });

        expect(state.groups.length).toBe(2);
        expect(state.groups[0].isSuperset).toBe(false); // Downgraded
        expect(state.groups[0].exercises[0]._id).toBe('ex2');
        expect(state.groups[1].isSuperset).toBe(false); // Extracted as isolated
        expect(state.groups[1].exercises[0]._id).toBe('ex1');
    });

    it('removes a group entirely if it is deleted', () => {
        const initialState = {
            groups: [
                { id: 'g1', isSuperset: false, exercises: [{ _id: 'ex1' }] }
            ]
        };

        const state = activeWorkoutReducer(initialState, {
            type: ACTIONS.DELETE_EXERCISE,
            payload: { exerciseId: 'ex1' }
        });

        expect(state.groups.length).toBe(0);
    });
});
