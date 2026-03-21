# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Current Task
- **Current Task:** Completed (2026-02-27) — Onboarding guided-workout checklist fix documentation updates finalized in [`PRD.md`](PRD.md) and [`BRD.md`](BRD.md). No active task.

## Build, lint, and test commands (project-specific)
- `npm run screenshot:github:verified` runs [`capture-github-with-state.mjs`](capture-github-with-state.mjs); it requires an existing Chrome profile at `C:/Users/Oshiogwe Ugbodaga/.gemini/antigravity-browser-profile` and fails intentionally when GitHub auth state is missing.
- There is no `npm test` script in [`package.json`](package.json); functional validation is done with Playwright Python audits (for example [`tmp_deep_onboarding_audit.py`](tmp_deep_onboarding_audit.py) and [`audit_app.py`](audit_app.py)).
- Single-test workflow is not parameterized; run one script per scenario and trim that script’s `main()` steps when you need a narrower check.

## Non-obvious architecture + code conventions
- App auth is dual-path: Shoo OAuth + credential session token fallback. Keep both flows intact when touching auth state in [`src/App.jsx`](src/App.jsx) and key constants in [`src/lib/authStorage.js`](src/lib/authStorage.js).
- Onboarding restore depends on localStorage key `onboarding_active_workout_id` in [`src/App.jsx`](src/App.jsx); removing this breaks mid-flow resume.
- Shoo callback path is hardcoded as `/shoo/callback` in [`src/shoo.js`](src/shoo.js); keep auth provider config aligned.
- Convex runs with `{ schemaValidation: false }` in [`convex/schema.ts`](convex/schema.ts); do not assume runtime schema enforcement for writes.

## Style rules discovered from config/code
- Use `@/` path aliases (configured in [`jsconfig.json`](jsconfig.json) and [`vite.config.js`](vite.config.js)) for src imports; codebase mixes relative imports, so prefer aliasing for new UI code.
- ESLint allows intentionally-unused vars only when names start with uppercase/underscore pattern via [`eslint.config.js`](eslint.config.js); use that convention for reserved placeholders.
- Reuse the shared class combiner [`cn()`](src/lib/utils.js) in [`src/lib/utils.js`](src/lib/utils.js) for Tailwind class composition.

## Existing repository-level agent policy (must retain)
- Keep `Current Task` updated in this file during work and clear it when done.
- Front-end tasks require browser verification evidence (screenshots/recordings).
- Completion workflow requires updating [`PRD.md`](PRD.md) and [`BRD.md`](BRD.md) to reflect tested status.
