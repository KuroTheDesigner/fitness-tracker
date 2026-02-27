# Business Requirements Document (BRD)

## Initiative
Fitness Tracker V1 — UX/Product Expansion Plan (sample-screen aligned)

## Business Goals
- Increase workout logging completion rate and consistency.
- Improve session quality through smarter exercise alternatives and effort tracking.
- Make weekly progress and muscle-volume insights actionable.
- Elevate product polish for stronger first impression and retention.

## In-Scope Requirement Groups

### BR-01: Superset Customization & Drag-and-Drop Editing
- Create supersets from 3-dot menu (`Create Superset`) using existing exercise picker flow.
- Enable drag-to-superset between existing workout exercises.
- Enable drag-in/drag-out for existing supersets (no separate split action).
- Support reorder via drag-and-drop.

### BR-02: Safe Exercise Removal
- Remove exercise via 3-dot menu.
- Remove exercise via left/right swipe with red delete reveal and minimum trigger distance.

### BR-03: Smarter Swap Alternatives
- Recommended alternatives = same muscle + same emphasized sub-region.
- Other alternatives = same muscle group alternatives.
- The app does not need to display explanatory reason text for a recommendation; it only needs to present the Recommended and Other alternatives sets.

### BR-04: Schedule-Day State & Routing Logic
- Day card labels and behavior:
  - Future = `Preview`
  - Today = `Start`
  - Past = `Summary`
- Past/future open summary view variant.
- Today opens active workout tracking session.

### BR-05: Completed/Future Workout Summary Variants
- Completed variant shows completed status + `View Workout` CTA.
- Future variant shows `Preview Workout` CTA.
- `View Workout` opens historical tracking data.
- `Preview Workout` opens tracking with empty kg/reps/effort.
- Warm-up action removed.

### BR-06: Workout Schedule Interaction Upgrades
- Remove top title row and shift hero card to top margin.
- `Get Started` routes to same destination as today `Start`.
- Add day drag-handle icon and cross-day activity move.
- Auto-place rest day when workout is moved away.
- Long-press day card opens contextual add/remove workout submenu.

### BR-07: Navigation / Information Architecture
- Remove AI chat icon from schedule top-right.
- Treat the bottom navigation bar as the **main menu**, with the **Account** tab as the **right-most item**.
- Remove Lessons from main tab navigation.

### BR-08: Coming Soon Experience
- Nutrition page: dedicated coming-soon design with icon + exact supplied flavor text.
- Lessons page: dedicated coming-soon design with icon + custom flavor text + `Coming soon` label.

### BR-09: Dashboard Redesign (Landing Page)
- Research competitor workout apps.
- Deliver high-impact dashboard structure and visual hierarchy for first screen experience.

### BR-10: Progress Redesign
- Build polished animated charts and trackers.
- Add editable time-range controls.
- Keep design opinionated and distinct.

### BR-11: Account Settings Experience
- Full account settings page.
- Profile photo upload/edit/remove.
- Top banner image (default + replace flow).

### BR-12: Effort, Set States, and Logging UX Fidelity
- Effort selector popup with strong visual background separation.
- In-progress and incomplete row visual states.
- Placeholder behavior from prior session for not-yet-completed sets.
- Read-only `Previous` column with prior effort marker.
- Up/down trend chevrons for unfinished sets.
- Updated done/PR icon behavior.

### BR-13: Workout Completion & PR Rules
- Set completion requires reps + effort (+kg for weighted moves).
- Session progress bar updates by valid completed sets.
- Finish button state changes when all sets complete.
- Robust work/effectiveness PR model across sets/loads/reps.
- Per-set trophy indicator for new best set-level performance.

### BR-14: Post-Workout Summary + Muscle Target Breakdown
- Finish action routes to summary screen.
- Summary shows target-muscle breakdown from exercise metadata.
- `View Workout` returns to that session’s tracking page.

### BR-15: Weekly Muscle Volume System
- Interactive muscle model (faceless/hairless) with tap targets.
- Track workouts completed, muscle coverage, and weekly volume %.
- Weekly volume is measured in **sets per muscle per week**, with a default target of **6 sets per major muscle**, unless overridden per muscle.
- Main target = 1.0 credit per set, secondary target = weighted credit per set (0.5/0.0 by evidence).
- Per-muscle color states by progress bands.
- Muscle detail popup with X/Y sets, remaining sets, contributions.
- Per-muscle custom weekly targets that update global volume calculations.

### BR-16: Exercise Taxonomy & Evidence Mapping
- Validate primary/secondary/emphasized muscle metadata for all exercises.
- Align taxonomy with swap recommendations and weekly volume math.

### BR-17: New-User Onboarding & First Workout Creation
- First-time account users must complete onboarding before normal app navigation.
- Onboarding is a multi-screen interactive slideshow/questionnaire.
- Onboarding must capture preferred workout days of the week.
- App must generate an initial workout schedule based on selected days.
- After onboarding, user is routed directly to the main workout logging screen for their first upcoming workout.
- First workout experience must guide user through:
  - adding a new exercise,
  - creating a superset,
  - separating a superset.
- After completing this first workout creation experience, user is routed to Dashboard.

### BR-18: Auth Experience Expansion (Google + Username/PIN)
- Sign-in page must include a path to a dedicated sign-up page (or equivalent separate sign-up mode).
- Sign-in and sign-up each have their own Google CTA.
- Add direct credential account flow using first name, username, and 4-digit PIN.
- Username should be prefilled from last login where possible; PIN must never be prefilled.
- Returning sign-ins should load existing profile/saved data and skip onboarding.
- New sign-ups should continue through onboarding.
- PIN handling must follow secure baseline practices (strict validation, salted hash storage, generic auth errors).

## Out of Scope for This BRD Revision
- Detailed technical implementation steps.
- Sprint sequencing and estimation.
- UI component-level specs.

## Acceptance for This Planning Phase
- All user-requested feature tasks are captured at requirement level in PRD and BRD.
- Detailed implementation plans are deferred to per-feature execution documents.

## Delivery Status Update — First Pass (Implemented)

| Requirement | Status |
|---|---|
| BR-01 Superset customization (menu-based create) | Partially delivered (create flow shipped; drag/drop pending). |
| BR-02 Safe exercise removal | Delivered (menu remove + swipe safety interaction). |
| BR-04 Schedule-day state/routing | Delivered. |
| BR-05 Completed/future summary variants | Delivered (warm-up removed). |
| BR-06 Workout schedule UI updates | Partially delivered (title cleanup + CTA parity delivered; drag handle/long-press pending). |
| BR-07 Navigation IA updates | Delivered and locally validated for Lessons removal, Account tab move, and non-colliding sign-out placement. |
| BR-08 Coming soon experience | Delivered. |
| BR-09 Dashboard redesign | Initial shell delivered (full research-led redesign pending). |
| BR-11 Account settings experience | Initial shell + in-page sign-out delivered and locally validated (media upload persistence pending). |
| BR-17 New-user onboarding + first workout creation | Delivered and locally validated end-to-end (daily-reset guide persistence + add-set persistence included), plus guided-workout UI polish for swipe affordance behavior, onboarding completion CTA pending state, and onboarding-safe navigation. |
| BR-18 Auth experience expansion (Google + Username/PIN) | Delivered and production-verified (separate sign-in/sign-up, credential auth, username prefill, onboarding bypass). |

### Notes
- This status reflects implemented work in the current codebase and local validation.
- Remaining items stay in scope for next implementation passes.

### Engineering Validation (Pre-Live)
- Lint passes.
- Production build passes.
- End-to-end onboarding/guided-workout validation passes (guided steps completion, add-set persistence, mid-flow reload resume + guide-progress persistence, Account sign-out visibility).
- Guided first-workout UI re-validation passes (fresh-account path, add-exercise modal/search/empty state, create+separate superset flow, and finish-onboarding transition feedback).

### Additional Context — Sample Screens
- See `SampleScreens-OwnerNotes.md` for the full owner narrative tied to the reference screenshots (workout tracking, summary screens, weekly progress, and PR logic).
