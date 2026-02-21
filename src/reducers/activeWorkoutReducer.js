export const ACTIONS = {
    INIT: 'INIT',
    MOVE_EXERCISE: 'MOVE_EXERCISE',
    COMBINE_INTO_SUPERSET: 'COMBINE_INTO_SUPERSET',
    SEPARATE_FROM_SUPERSET: 'SEPARATE_FROM_SUPERSET',
    DELETE_EXERCISE: 'DELETE_EXERCISE'
};

// State structure:
// groups: [
//   { id: 'g1', isSuperset: false, exercises: [{ _id: 'ex1', ... }] },
//   { id: 'g2', isSuperset: true,  exercises: [{ _id: 'ex2' }, { _id: 'ex3' }] }
// ]

export function activeWorkoutReducer(state, action) {
    switch (action.type) {
        case ACTIONS.INIT: {
            // Convert flat convex array into grouped array
            const exercises = action.payload || [];
            const groups = [];
            let currentGroupId = null;
            let currentGroup = null;

            // Sort by orderIndex first to be safe
            const sorted = [...exercises].sort((a, b) => a.orderIndex - b.orderIndex);

            sorted.forEach(ex => {
                if (ex.supersetGroup) {
                    if (currentGroupId !== ex.supersetGroup) {
                        currentGroupId = ex.supersetGroup;
                        currentGroup = { id: currentGroupId, isSuperset: true, exercises: [ex] };
                        groups.push(currentGroup);
                    } else {
                        currentGroup.exercises.push(ex);
                    }
                } else {
                    currentGroupId = null;
                    groups.push({ id: `group-${ex._id}`, isSuperset: false, exercises: [ex] });
                }
            });

            return { groups };
        }

        case ACTIONS.MOVE_EXERCISE: {
            // Handles dragging an exercise out of a group, or into another group, or reordering groups
            const { sourceGroupId, sourceIndex, destGroupId, destIndex } = action.payload;

            // Deep clone state
            const newGroups = state.groups.map(g => ({ ...g, exercises: [...g.exercises] }));

            const sGroupIdx = newGroups.findIndex(g => g.id === sourceGroupId);
            const dGroupIdx = newGroups.findIndex(g => g.id === destGroupId);

            if (sGroupIdx === -1 || dGroupIdx === -1) return state;

            const [movedExercise] = newGroups[sGroupIdx].exercises.splice(sourceIndex, 1);

            // If source group is now empty, remove it
            if (newGroups[sGroupIdx].exercises.length === 0) {
                newGroups.splice(sGroupIdx, 1);
            } else if (newGroups[sGroupIdx].exercises.length === 1 && newGroups[sGroupIdx].isSuperset) {
                // If only one exercise left in a superset, it becomes an isolated group
                newGroups[sGroupIdx].isSuperset = false;
            }

            // Adjust destination index if we removed a group that was before it
            let actualDestIdx = newGroups.findIndex(g => g.id === destGroupId);
            if (actualDestIdx === -1) {
                // The destination was the source group which just got deleted!
                // Meaning they moved the only exercise somewhere else natively? Should be impossible in typical dnd 
                // but let's handle it by creating a new group at the end
                newGroups.push({ id: `group-${movedExercise._id}`, isSuperset: false, exercises: [movedExercise] });
                return { groups: newGroups };
            }

            // Insert into destination
            newGroups[actualDestIdx].exercises.splice(destIndex, 0, movedExercise);

            // If we dropped into an isolated group, it becomes a superset!
            if (newGroups[actualDestIdx].exercises.length > 1 && !newGroups[actualDestIdx].isSuperset) {
                newGroups[actualDestIdx].isSuperset = true;
                // Generate a true superset ID
                newGroups[actualDestIdx].id = `superset-${Date.now()}`;
            }

            return { groups: newGroups };
        }

        case ACTIONS.SEPARATE_FROM_SUPERSET: {
            // User explicitly says "Remove from Superset"
            const { sourceGroupId, exerciseId, insertAfterGroupId } = action.payload;
            const newGroups = state.groups.map(g => ({ ...g, exercises: [...g.exercises] }));

            const groupIdx = newGroups.findIndex(g => g.id === sourceGroupId);
            if (groupIdx === -1) return state;

            const exIdx = newGroups[groupIdx].exercises.findIndex(e => e._id === exerciseId);
            if (exIdx === -1) return state;

            const [extracted] = newGroups[groupIdx].exercises.splice(exIdx, 1);

            if (newGroups[groupIdx].exercises.length === 1) {
                newGroups[groupIdx].isSuperset = false; // Downgrade
            }

            // Insert as a new isolated group after the specified index
            const targetIdx = newGroups.findIndex(g => g.id === insertAfterGroupId);
            const newGroup = { id: `group-${extracted._id}`, isSuperset: false, exercises: [extracted] };

            if (targetIdx !== -1) {
                newGroups.splice(targetIdx + 1, 0, newGroup);
            } else {
                newGroups.push(newGroup);
            }

            // Clean up empty groups
            return { groups: newGroups.filter(g => g.exercises.length > 0) };
        }

        case ACTIONS.DELETE_EXERCISE: {
            const { exerciseId } = action.payload;
            const newGroups = state.groups.map(g => ({ ...g, exercises: g.exercises.filter(e => e._id !== exerciseId) }));

            newGroups.forEach(g => {
                if (g.exercises.length === 1) g.isSuperset = false;
            });

            return { groups: newGroups.filter(g => g.exercises.length > 0) };
        }

        default:
            return state;
    }
}
