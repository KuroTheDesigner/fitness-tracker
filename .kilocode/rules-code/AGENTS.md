# Code Mode Rules (Non-Obvious Only)

- Preserve dual auth behavior in [`src/App.jsx`](src/App.jsx): Shoo auth (`useConvexAuth`) and credential-session fallback (`api.users.getCurrentBySession`) both gate app access.
- Never rename/remove `onboarding_active_workout_id` in [`src/App.jsx`](src/App.jsx); onboarding resume after reload depends on that exact localStorage key.
- Keep Shoo callback path aligned at `/shoo/callback` in [`src/shoo.js`](src/shoo.js) with Convex auth provider settings.
- Use [`cn()`](src/lib/utils.js) from [`src/lib/utils.js`](src/lib/utils.js) for class composition instead of ad-hoc string joins.
- For intentionally-unused bindings, follow ESLint’s `^[A-Z_]` ignore pattern from [`eslint.config.js`](eslint.config.js) to avoid lint failures.

