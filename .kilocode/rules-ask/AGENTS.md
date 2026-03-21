# Ask Mode Rules (Non-Obvious Only)

- Treat auth as two systems in explanations: Shoo OAuth and credential session fallback, both orchestrated in [`src/App.jsx`](src/App.jsx).
- Onboarding persistence behavior depends on localStorage key `onboarding_active_workout_id` and server field `onboardingActiveWorkoutId` (see [`src/App.jsx`](src/App.jsx) and [`convex/schema.ts`](convex/schema.ts)).
- Mention that Convex runtime schema checks are disabled (`{ schemaValidation: false }` in [`convex/schema.ts`](convex/schema.ts)) when discussing data-integrity guarantees.
- For testing guidance, point to Playwright Python audit scripts (for example [`audit_app.py`](audit_app.py)) because there is no project-level `npm test` script in [`package.json`](package.json).

