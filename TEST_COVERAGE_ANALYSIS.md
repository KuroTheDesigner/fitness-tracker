# Test Coverage Analysis

## Executive Summary

The codebase has a small but focused suite of **6 test files** covering utility functions and one backend integration. Most of the backend business logic, all UI components (except a single smoke test), and every custom React hook currently have **zero test coverage**. The sections below identify the highest-priority gaps and concrete suggestions for each.

---

## 1. What Is Currently Tested

| File | Tests | Notes |
|------|-------|-------|
| `src/reducers/activeWorkoutReducer.test.js` | 4 | INIT, MOVE_EXERCISE, SEPARATE_FROM_SUPERSET, DELETE_EXERCISE |
| `src/utils/performanceMath.test.js` | 6 | calculateEfficacy, isPR, calculateChevrons |
| `src/utils/volumeMath.test.js` | 5 | aggregateMuscleVolumes, getVolumeColorMatrix |
| `src/utils/swapSorter.test.js` | 6 | categorizeAlternatives |
| `src/pages/ActiveWorkoutPage.test.jsx` | 1 | Renders title and inputs only |
| `convex/exercises.test.ts` | 2 | getExercisesByFocus, schema insert |

---

## 2. Priority Areas for Improvement

### 2.1 `convex/logging.ts` — **Critical, Zero Coverage**

`logSet` and `finishWorkout` are the core write paths of the entire app. Every workout session flows through them, yet they have no tests.

**Gaps:**
- `logSet` — new PR creation path (no existing PR record)
- `logSet` — PR update path (existing PR record with lower efficacy)
- `logSet` — no-PR path (efficacy below or equal to existing record)
- `logSet` — zero efficacy edge case (weight=0 or reps=0 should not create a PR)
- `finishWorkout` — streak increment when `lastWorkoutDate` differs from today
- `finishWorkout` — streak not incremented when `lastWorkoutDate` is already today (second workout same day)
- `finishWorkout` — `longestStreak` update when new streak exceeds previous longest

**Suggested tests (using `convex-test`):**
```ts
// convex/logging.test.ts
test("logSet creates a new PR record on first-ever set", async () => { ... });
test("logSet updates existing PR when efficacy exceeds previous best", async () => { ... });
test("logSet does not flag PR when efficacy ties historical best", async () => { ... });
test("logSet with zero weight does not create a PR", async () => { ... });
test("finishWorkout increments streak on a new day", async () => { ... });
test("finishWorkout does not double-increment streak on same day", async () => { ... });
test("finishWorkout updates longestStreak when current streak surpasses it", async () => { ... });
```

---

### 2.2 `convex/workouts.ts` — **Critical, Zero Coverage**

This file contains the most mutations of any backend file (8 queries/mutations) and includes complex business logic.

**Gaps:**
- `getWorkoutScheduleWithStatus` — `dayStatus` calculation (`"current"` / `"past"` / `"future"`) is day-of-week dependent and tricky; needs controlled date mocking
- `incrementTargetSets` — at-limit guard (should return `atLimit: true` when `targetSets === 12`)
- `incrementTargetSets` — happy path (normal increment)
- `removeWorkoutExercise` — removes exercise from workout array and deletes the record
- `createSuperset` — assigns a unique letter group ID across existing supersets
- `addExerciseToWorkout` — appends exercise and sets defaults (`targetSets: 3`, `restSeconds: 90`)
- `bootstrapOnboardingProgram` — validates day normalization, deduplication, sorting, and workout scaffolding

**Suggested tests:**
```ts
test("incrementTargetSets returns atLimit:true when already at max 12 sets", async () => { ... });
test("incrementTargetSets increments from 3 to 4 sets correctly", async () => { ... });
test("createSuperset assigns unique letter group avoiding existing ones", async () => { ... });
test("bootstrapOnboardingProgram creates one workout per selected day", async () => { ... });
test("bootstrapOnboardingProgram rejects empty day selection", async () => { ... });
```

---

### 2.3 `convex/progress.ts` — **High Priority, Zero Coverage**

Progress queries power the Progress page chart and stats.

**Gaps:**
- `getWeeklyActivity` — correctly groups workout history into day buckets
- `getWeeklyActivity` — ignores history older than 7 days
- `getUserStats` — returns correct PR count and streak values
- `getRecentPRs` — enriches PR records with exercise names
- `getMuscleBreakdown` — returns enriched sets (with `exercise` object attached)

**Suggested tests:**
```ts
test("getWeeklyActivity counts workouts in the correct day bucket", async () => { ... });
test("getWeeklyActivity excludes workouts older than 7 days", async () => { ... });
test("getUserStats returns correct prCount from personalRecords", async () => { ... });
```

---

### 2.4 `activeWorkoutReducer` — **Gap in Existing Coverage**

Four out of five action types are tested, but several edge cases are missing.

**Gaps:**
- `COMBINE_INTO_SUPERSET` action is defined in `ACTIONS` but has no test (and appears unused — worth confirming or removing)
- `MOVE_EXERCISE` within the same group (reordering, not merging)
- `MOVE_EXERCISE` from a superset into a different isolated group
- `DELETE_EXERCISE` from the middle of a superset (should downgrade when 1 remains)
- `SEPARATE_FROM_SUPERSET` with `insertAfterGroupId` that doesn't exist (fallback to push)

**Suggested tests:**
```js
it('reorders exercises within the same group without forming a new superset', () => { ... });
it('extracts an exercise from a superset into an isolated group using SEPARATE_FROM_SUPERSET', () => { ... });
it('downgrades superset when DELETE_EXERCISE leaves only one member', () => { ... });
```

---

### 2.5 `ActiveWorkoutPage` — **Only a Smoke Test Exists**

The most complex page in the codebase (842 lines) has only one test that checks basic rendering.

**Gaps:**
- Superset rendering (exercises grouped together visually)
- Completing a set (clicking the checkmark button calls `logSet` with correct args)
- PR banner appearing after `logSet` returns `{ isPR: true }`
- Rest timer appearing after a set is logged
- "Finish Workout" button triggering `finishWorkout` mutation
- Loading state (skeleton) while `useQuery` returns `undefined`
- Empty/null workout data handling

**Suggested tests:**
```jsx
it('calls logSet with correct weight, reps, and setNumber when a set is checked off', async () => { ... });
it('shows a PR celebration banner when logSet resolves with isPR: true', async () => { ... });
it('renders a rest timer after a set is completed', async () => { ... });
it('renders superset exercises side-by-side within a shared group card', async () => { ... });
it('shows loading skeleton when workout data is undefined', async () => { ... });
```

---

### 2.6 `performanceMath` — **Missing Boundary Conditions**

The chevron logic has five bands separated by exact thresholds (±5%, ±10%). None of the exact boundaries are tested.

**Gaps:**
- `calculateChevrons` at exactly +5% (boundary between 1 and 2 chevrons)
- `calculateChevrons` at exactly +10% (boundary between 2 and 3 chevrons)
- Same for the negative side (−5%, −10%)

**Suggested tests:**
```js
it('returns 1 UP chevron at exactly 5% increase (boundary)', () => {
    expect(calculateChevrons(1050, 1000)).toEqual({ direction: 'up', count: 1 });
});
it('returns 2 UP chevrons at exactly 5.1% increase (above boundary)', () => {
    expect(calculateChevrons(1051, 1000)).toEqual({ direction: 'up', count: 2 });
});
```

---

### 2.7 `volumeMath` — **Missing Boundary Conditions**

`getVolumeColorMatrix` has four bands with boundaries at 25%, 50%, and 80% that are untested.

**Gaps:**
- Exactly 25% (boundary between Danger Red and the next band)
- Exactly 50% (boundary for Warning Gold)
- Exactly 80% (boundary for Yellow-Green)
- Exercises referenced in `completedSets` but not present in `exercisesDB`

---

### 2.8 Component Tests — **Zero Coverage**

These UI components contain real interaction logic with no tests:

| Component | Key Logic to Test |
|-----------|------------------|
| `RestTimer.jsx` | Counts down correctly; triggers callback on expiry; pause/resume |
| `EffortRating.jsx` | Renders 4 effort levels; fires `onSelect` callback with correct value |
| `CustomExerciseModal.jsx` | Validates empty name; calls `createCustomExercise` mutation on submit |
| `ConfirmDialog.jsx` | Calls `onConfirm` / `onCancel` correctly |

---

### 2.9 `useWorkout` Hook — **Zero Coverage**

The `useWorkout` hook manages loading state derived from multiple queries. Loading state logic (`isProgramLoading`, `isScheduleLoading`) should be verified with mocked Convex hooks.

---

## 3. Recommended Priority Order

1. **`convex/logging.ts`** — PR detection and streak logic are business-critical and not tested at all.
2. **`convex/workouts.ts`** — `incrementTargetSets`, `bootstrapOnboardingProgram`, and `createSuperset` have non-trivial logic with no coverage.
3. **`ActiveWorkoutPage`** — The main user-facing flow (log set → PR → rest timer → finish) needs integration-level component tests.
4. **`convex/progress.ts`** — Weekly activity grouping and PR aggregation queries.
5. **Boundary conditions** in `performanceMath` and `volumeMath`.
6. **`RestTimer`, `EffortRating`, `CustomExerciseModal`** — Interaction unit tests.
