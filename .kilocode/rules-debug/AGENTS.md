# Debug Mode Rules (Non-Obvious Only)

- Auth bugs often come from the split path in [`src/App.jsx`](src/App.jsx): debug both Shoo (`useConvexAuth`) and credential session (`api.users.getCurrentBySession`) state before changing logic.
- Onboarding resume issues are usually localStorage-key regressions around `onboarding_active_workout_id` in [`src/App.jsx`](src/App.jsx), not rendering bugs.
- Convex schema validation is disabled in [`convex/schema.ts`](convex/schema.ts), so malformed writes may persist; verify mutation inputs directly in handlers.
- Existing Python audit scripts (for example [`tmp_deep_onboarding_audit.py`](tmp_deep_onboarding_audit.py)) are the de facto end-to-end regression checks; narrow scope by editing the script flow, not by passing a test filter arg.

