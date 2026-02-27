## Product Requirements Document (Audit-Based)

| Task | task description | Status |
|---|---|---|
| Auth: Google sign-in flow | Shoo + Google sign-in UI and callback flow are wired and reachable from app entry. | Complete (tested) |
| Auth: Sign-out flow | Global sign-out control exists and returns user to auth screen. | Complete (tested) |
| Auth: User auto-provisioning | First-login user creation is implemented via `users.ensureUser`. | Complete (untested) |
| Auth: Separate sign-in/sign-up pages | Sign-in and sign-up have distinct UI modes with separate Google CTAs and direct navigation between modes. | Complete (untested) |
| Auth: Username + PIN account flow | Users can sign up/sign in with first name + username + 4-digit PIN, with username prefill of last user and no PIN prefill. | Complete (untested) |
| Auth: PIN safety baseline | PIN is validated to 4 digits and stored hashed+salted with generic credential error responses. | Complete (untested) |
| Auth: Sign-in onboarding bypass | Returning sign-ins load profile/saved data without forcing onboarding, while sign-ups still enter onboarding. | Complete (untested) |
| Auth: Credential lockout hardening | Implement brute-force protection for username/PIN sign-in: 10 failed attempts → 30-minute lockout window. | yet to start |
| Bottom navigation foundation | App has a 5-item bottom nav and tab switching behavior. | Complete (tested) |
| Workout tab base page shell | Workout tab view exists with hero/schedule structure and skeleton states. | in progress |
| Progress tab base page | Analytics/progress page exists with stats, charts, and PR section scaffolding. | Complete (tested) |
| Lessons tab removal + account replacement | Remove Lessons tab and replace it with Account icon; Account must be right-most item in the bottom-nav main menu. | Complete (untested) |
| Nutrition coming-soon page design | Build a dedicated Nutrition coming-soon page with icon and exact flavor text: "A Good rule of thumb is swap the portion size of your protein and carbs, then double your veggies and fruit." | Complete (untested) |
| Dashboard as landing page redesign | Research top workout apps and redesign Dashboard as high-impact app landing experience. | in progress |
| Progress page full redesign | Build polished, animated progress dashboards with editable time ranges and glanceable insights. | yet to start |
| Account settings page | Build full account settings area with profile management controls. | in progress |
| Profile picture upload/edit | Add user profile image upload, persistence, and edit/remove flows. | in progress |
| Account banner upload/edit | Add top banner image (default first) with replace/edit support. | in progress |
| Workout schedule top-row cleanup | Remove current top title row, move hero card to top margin, and align with requested layout. | Complete (untested) |
| Workout schedule CTA parity | Ensure hero "Get Started" routes to same destination as current-day workout "Start". | Complete (untested) |
| Workout day status states | Implement day card labels/behavior: future=Preview, current=Start, past=Summary. | Complete (untested) |
| Workout day drag-and-drop | Add drag handle icon on day cards and support moving workout/rest day activity between days. | yet to start |
| Rest day auto-fill behavior | Auto-place Rest day when a day has no workout after drag/reorder operations. | yet to start |
| Day-card long-press submenu | Long-press any day card to show add/remove workout actions based on card type. | yet to start |
| Workout summary (state-aware) | Make summary screen vary correctly for completed vs future workouts, with proper CTA text and behavior. | Complete (untested) |
| Remove warm-up action | Remove warm-up button from summary flow per product direction. | Complete (untested) |
| Completed workout view flow | For completed sessions show completed status and "View Workout" that opens that historical logging session. | Complete (untested) |
| Future workout preview flow | "Preview Workout" should open tracking screen with empty kg/reps/effort fields. | Complete (untested) |
| Post-finish destination | After finishing workout, route to completed/past summary screen variant. | Complete (untested) |
| Active workout logging table | Base tracking table exists with set rows, inputs, completion toggles, and rest/add-set controls. | Complete (untested) |
| Weight field conditional rendering | Show KG field only for weighted exercises; hide/adjust for bodyweight where required. | yet to start |
| Set completion rules | Mark set complete only when required fields are filled (kg where applicable, reps, effort). | in progress |
| Exercise progress bar behavior | Session progress bar exists; must be aligned to strict completion rules and full session completion state. | in progress |
| Finish button completion state | Change Finish button style/state when all workout sets are fully completed. | yet to start |
| Effort selector popup | Effort popup exists; improve background/foreground separation to requested polished design standard. | in progress |
| Incomplete-set visual treatment | Implement nuanced row states for in-progress/incomplete sets as shown in reference screenshots. | yet to start |
| Previous column behavior | Populate non-editable Previous column from last session values with effort indicators. | yet to start |
| Placeholder carry-forward behavior | For uncompleted sets, show previous-session kg/reps as placeholders until user logs current values. | yet to start |
| Rep trend chevrons | Add up/down multi-chevron indicators for per-set rep trend vs prior sessions. | yet to start |
| Superset display foundation | Superset metadata rendering exists in workout summary and active workout views. | Complete (untested) |
| Superset creation from menu | Add "Create Superset" action in 3-dot menu for non-superset exercise and selection modal flow. | Complete (untested) |
| Superset drag-and-drop operations | Support drag to create superset, drag into existing superset, drag out of superset, and reordering via drag. | yet to start |
| Superset split handling policy | No separate split action; rely on drag in/out mechanics to split/restructure supersets. | yet to start |
| Remove exercise via menu | Add remove exercise action in 3-dot menu with confirmations/safe behavior. | Complete (untested) |
| Swipe-to-remove safety interaction | Add left/right swipe remove with visible red container and minimum swipe threshold before delete. | Complete (untested) |
| 3-dot menu feature parity | Implement full menu actions needed by product flow (swap/form guide/history/reorder/remove and final policy decisions). | in progress |
| Swap screen foundation | Swap page exists with search, all/muscle grouping, and custom exercise creation. | Complete (untested) |
| Recommended alternatives logic | Implement recommendations for swaps based on same muscle + same emphasized sub-region. | yet to start |
| Other alternatives logic | Show broader alternatives that target same main muscle(s), distinct from recommended set. | yet to start |
| Exercise taxonomy enrichment | Add/validate per-exercise primary muscles, secondary muscles, and emphasized focus metadata. | yet to start |
| Form guide foundation | Exercise detail page has guide/history tabs, media support, and instructions section. | Complete (untested) |
| Effort color system in history/previous | Ensure effort indicators/colors are consistently represented across logging and history contexts. | in progress |
| Done badge behavior | Replace DONE text style with requested green check icon treatment once all required sets for exercise are complete. | yet to start |
| PR badge behavior | Keep PR badge and trigger when average work for exercise exceeds prior session benchmark. | yet to start |
| PR calculation model upgrade | Replace max-weight-only PR logic with robust work/impact model (weight, reps, sets, session context). | in progress |
| Per-set trophy logic | Show trophy on set number when set beats all historical/current comparable set performance criteria. | yet to start |
| Workout history replay API | Add backend queries to fetch and replay full historical session data for "View Workout" flows. | yet to start |
| Workout history view UI | Build calendar/list interface for browsing and opening past workouts. | yet to start |
| Schedule + history data linkage | Properly link `setHistory` and `workoutHistory` records for session-accurate reconstruction. | in progress |
| Weekly progress body model UI | Build faceless/hairless muscle model with per-muscle interactive highlighting. | yet to start |
| Muscle breakdown data visualization | Show real muscle-group focus breakdown sourced from live workout data. | yet to start |
| Weekly progress completion stats | Show weekly completed workouts + body coverage metrics on redesigned weekly progress experience. | yet to start |
| Weekly volume metric | Add total weekly volume % where 100% equals all muscle targets met (default 6 sets/muscle/week). | yet to start |
| Primary/secondary contribution weighting | Count main-target set contribution as 1x and secondary as reduced weighted contribution (e.g., 0.5x/0x per evidence). | yet to start |
| Muscle color thresholds | Implement per-muscle color states (red/dark-orange/yellow/green/electric-green) based on weekly volume bands. | yet to start |
| Muscle detail modal | Tapping a muscle opens deep-dive modal with progress, remaining sets, and exercise contributions. | yet to start |
| Per-muscle custom target editing | Allow custom weekly target sets per muscle and recalculate total body volume accordingly. | yet to start |
| Target muscles summary algorithm | Compute target-muscle percentages on summary screens using exercise-to-muscle mappings and session completion data. | yet to start |
| Backend authorization hardening | Remove client-controlled `userId` trust in mutations/queries; derive user identity server-side from auth context. | yet to start |
| Custom exercise privacy scoping | Restrict custom exercise visibility to owner (plus global/shared exercise library policy). | yet to start |
| Seed/admin safety hardening | Protect or remove seed/admin-like mutations from production paths. | yet to start |
| Schema validation hardening | Re-enable and enforce schema validation for data integrity and safer iteration. | yet to start |
| New-user workout bootstrap | Ensure newly authenticated users always get an initial program/schedule so workout tab does not remain in unresolved loading state. | Complete (untested) |
| New-user onboarding flow | First-time users must complete onboarding slideshow/questionnaire before normal app usage. | Complete (untested) |
| Onboarding workout-day selection | Onboarding must collect preferred workout days of week and persist the selection. | Complete (untested) |
| First workout auto-creation flow | After onboarding, route user directly into their first upcoming workout logging session to build initial workout content. | Complete (untested) |
| First-workout guided creation | In first workout flow, guide user through adding an exercise, creating a superset, and separating a superset. | Complete (untested) |
| Onboarding completion routing | After first workout creation flow, return user to Dashboard landing page. | Complete (untested) |
| Validation pipeline | Add and enforce automated tests and checks to prevent regressions across frontend/backend/auth. | yet to start |
| Global error handling + toasts | Add error boundaries and user-facing success/error toasts for key actions. | yet to start |
| PR celebration animation | Add confetti/celebration animation when a new PR is achieved. | yet to start |
| Unit tests for hooks/components | Add focused unit tests for core hooks and reusable UI/workout components. | yet to start |

## Planning Addendum — 2026-02-26 (Sample-Screen-Aligned Scope)

### 1) Workout Tracking & Supersets
- Add `Create Superset` to the 3-dot menu for non-superset exercises.
- Reuse swap/add exercise picker to select one or more exercises and confirm superset creation.
- Add long-press drag-and-drop to:
  - superset two standalone exercises,
  - move a standalone exercise into an existing superset,
  - move an exercise out of a superset,
  - reorder exercises/rows.
- Do not implement a separate `Split Superset` action; drag in/out is the split model.
- Ensure superset card layout follows A/B/C labeling and row pattern (`1A,1B`, `2A,2B`, etc.).

### 2) Exercise Removal UX
- Keep remove in 3-dot menu.
- Add swipe-left and swipe-right delete with safety behavior:
  - visible red delete container slides in from swipe side,
  - healthy minimum swipe threshold before delete triggers.

### 3) Swap Recommendation Logic
- `Recommended alternatives`: same primary muscle group **and** same emphasized sub-region focus.
- `Other alternatives`: same primary muscle group(s) without same-focus requirement.
- No explanatory reason text is required for why recommendations were picked.
  - Recommendations rely on per-exercise taxonomy (primary muscles, secondary muscles, emphasized focus) defined in the Exercise Data/Taxonomy tasks below.

### 4) Workout Schedule Routing & Day-State Rules
- On schedule cards:
  - future day → `Preview`
  - current day → `Start`
  - past day → `Summary`
- Past/future selection opens `Completed or past workout summary` screen variant.
- Current-day selection opens active workout tracking screen.
- Completed summary variant:
  - show completed indicator (top-right),
  - primary CTA = `View Workout`, opening that historical workout tracking session.
- Future summary variant:
  - primary CTA = `Preview Workout`,
  - opens tracking screen with empty kg/reps and blank effort selector.
- Remove warm-up action from summary flows.

### 5) Workout Schedule UI & Interaction Changes
- Treat this page as Workout Schedule (not Home); keep hero card approach.
- Ensure hero `Get Started` routes to same destination as current-day `Start`.
- Remove schedule top title row (`Beginner Phase...`) and align hero card to top margin.
- Remove AI chat icon from top-right.
- Ensure the bottom navigation bar is treated as the **main menu**, with the **Account** tab as the right-most item.
- Add hold-to-drag handle icon (half-up/half-down arrow style) on each day card to move activity between days.
- Auto-insert `Rest` when a day has no workout.
- Long-press day activity card to show floating submenu:
  - `Add Workout` on rest day,
  - `Remove Workout` on workout day.

### 6) Tabs, Coming-Soon, and IA Updates
- Nutrition and Lessons remain in coming-soon state as separate pages.
- Nutrition coming-soon page must include: `A Good rule of thumb is swap the portion size of your protein and carbs, then double your veggies and fruit.`
- Lessons coming-soon page must include custom flavor text and clear `Coming soon` label.
- Remove Lessons tab from main menu navigation (page can remain route-accessible if needed for staged rollout).

### 7) Dashboard & Progress Redesign Scope
- Research top workout apps and redesign Dashboard as primary app landing page.
- Redesign Progress page for at-a-glance progress + polished animated charts.
- Add editable time-range controls across progress analytics.
- Target a distinctive, bold, high-polish visual direction.

### 8) Account Settings Experience
- Account settings are accessed via the **Account** tab in the bottom-nav main menu (right-most item), which opens the full account settings page.
- Include profile photo upload/edit/remove.
- Include top banner area (top third style) with default image and replace flow.

### 9) Effort, Set-State, and Logging Micro-Interactions
- Effort circle click opens effort-level rating popup.
- Improve popup foreground/background separation (clean modal layering treatment).
- Implement nuanced incomplete-set visuals:
  - in-progress row styling,
  - future rows with blank effort indicator,
  - user-entered reps/kg as solid values,
  - prior-session values shown as placeholders until current set is completed.
- `Previous` column is read-only and shows prior-session kg/reps + prior effort indicator.
- Add up/down multi-chevron trend icon for unfinished sets based on recent rep trend.
- Replace done label with green check icon in dark-green circle with light-green border.
- Keep `PR` badge for qualifying exercises.

### 10) Performance/PR Logic & Completion Rules
- Set completion requires:
  - reps entered,
  - effort selected,
  - kg entered when weighted exercise.
- Session progress bar fills per completed set only.
- `Finish` button state updates when all workout sets are complete.
- Show trophy on set index when a just-logged set exceeds all comparable historical/current-session sets for that exercise.
- Use robust workload/effectiveness model for PR decisions (not weight-only), evaluating multi-set/multi-load outcomes.

### 11) Post-Workout Summary & Muscle Target Insights
- After finishing workout, route to completed/past summary screen.
- Remove edit and warm-up actions from this flow.
- `View Workout` returns to logging screen of that completed session.
- Target-muscle summary should derive from exercise-to-muscle metadata and completed workout data.

### 12) Weekly Progress Muscle Model Expansion
- Add interactive faceless/hairless muscle model with highlighted muscle regions.
- Keep weekly completed workouts + body coverage metrics.
- Add weekly `Volume` % metric where 100% = all muscle targets met.
- Weekly volume is measured in **sets per muscle per week**, with a default target of **6 sets per major muscle/week**, unless overridden per muscle.
- Weighted contributions (set-level credits):
  - primary-target set contribution = 1.0,
  - secondary-target set contribution = 0.5 or 0.0 where negligible by evidence.
- Muscle color scale by weekly set progress:
  - 0–2 red,
  - 2–4 dark orange,
  - 4–5 yellow,
  - 6 green,
  - 6+ electric green.
- Tap muscle opens detail popup with:
  - X/Y sets progress,
  - remaining sets to target,
  - week exercise contribution details,
  - editable per-muscle weekly target.
- Recalculate total-body volume after per-muscle target edits.

### 13) Exercise Data/Taxonomy & Research Tasks
- Audit exercise database for primary muscles, secondary muscles, and emphasized focus tags.
- Confirm mappings used by swap recommendations, target-muscle summary, and weekly volume math.
- Define evidence-backed rules for secondary-muscle weighting exceptions.

### 14) Delivery Planning Notes
- This addendum is intentionally feature/task-level only (no implementation sequencing yet).
- Detailed technical implementation plans will be created per feature during execution phases.

### 15) New-User Onboarding & First Workout Creation
- Trigger onboarding for first-time users immediately after account creation/sign-in.
- Onboarding format: multi-screen interactive slideshow/questionnaire.
- Collect preferred workout days of week.
- Use selected workout days to generate the user's initial weekly workout schedule.
- On onboarding completion, route user directly to the main workout logging screen for their first upcoming workout day.
- In that first workout experience, provide guided steps for:
  - adding a new exercise,
  - creating a superset,
  - separating a superset.
- After the user completes this first-workout creation flow, route them to the Dashboard.

## Execution Update — First Implementation Pass (Pre-Live Validation)

| Area | Outcome |
|---|---|
| Workout day status states | Implemented: Future=`Preview`, Current=`Start`, Past=`Summary` in schedule cards. |
| Workout routing | Implemented: current day opens tracking; past/future open summary variant. |
| Summary variants | Implemented: completed indicator + `View Workout`, future `Preview Workout`, warm-up removed. |
| Hero CTA parity | Implemented: `Get Started` now routes through same schedule action logic. |
| Top row cleanup | Implemented: schedule title row removed and hero card moved to top margin. |
| Remove exercise (menu) | Implemented: 3-dot menu action + confirmation dialog. |
| Swipe-to-remove safety | Implemented: red delete reveal + threshold-triggered confirmation flow. |
| Superset creation from menu | Implemented: `Create Superset` in 3-dot menu with multi-select + confirm modal. |
| Navigation IA update | Implemented: Lessons removed from bottom nav; Account tab added in nav. |
| Nutrition coming soon page | Implemented with required exact flavor text and icon. |
| Lessons coming soon page | Implemented dedicated page with icon, flavor text, and `Coming soon`. |
| Dashboard surface | Implemented initial premium shell for landing page direction. |
| Account settings surface | Implemented account page shell with banner area and profile photo edit entry points. |

### Validation Snapshot (Pre-Live)
- `npm run lint`: pass (2 existing warnings in generated Convex files).
- `npm run build`: pass.

### Additional Context — Sample Screens
- See `SampleScreens-OwnerNotes.md` for the full owner narrative tied to the reference screenshots (workout tracking, summary screens, weekly progress, and PR logic).
