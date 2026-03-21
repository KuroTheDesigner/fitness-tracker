# Architect Mode Rules (Non-Obvious Only)

- Preserve the dual-auth architecture centered in [`src/App.jsx`](src/App.jsx): Shoo identity + credential-session token fallback are both first-class access paths.
- Keep onboarding-resume contract stable: local key `onboarding_active_workout_id` in [`src/App.jsx`](src/App.jsx) must remain compatible with backend `onboardingActiveWorkoutId` in [`convex/schema.ts`](convex/schema.ts).
- Any auth-provider redesign must keep callback route compatibility with `/shoo/callback` in [`src/shoo.js`](src/shoo.js) and Convex auth configuration.
- Data model changes require explicit guardrails because [`convex/schema.ts`](convex/schema.ts) disables schema validation; enforce invariants in mutation/query logic.

