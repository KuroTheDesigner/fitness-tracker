## Sample Screens — Owner Narrative & UX Rules

This document captures the product-owner intent and nuanced behavior for the Fitness Tracker app, using the named sample screens as narrative anchors. The PRD/BRD reference this file as the canonical description of what the screenshots are meant to convey.

---

### 1. Supersets — Creation, Editing, and Drag & Drop

- **Superset creation (menu-based)**:
  - From the workout tracking screen, any exercise that is **not** in a superset shows a 3-dot menu.
  - That menu includes **Create Superset**.
  - When tapped, it opens the **same exercise selection UI** used for Swap/Add Exercise (search, filters, etc.).
  - The user can select **one or more** exercises from the current workout to pair into a superset and then confirm.

- **Superset creation (drag-based)**:
  - Long-press on an exercise row (already present in the session) and **drag it over another exercise row** (also already in the session) to form a superset.
  - This drag gesture is an alternative path to the menu-based Create Superset flow.

- **Superset editing via drag-and-drop**:
  - Within a session, an individual exercise can be:
    - Dragged **into** an existing superset to join it.
    - Dragged **out of** an existing superset to become a standalone exercise again.
    - Reordered relative to other exercises or supersets.

- **Superset split semantics**:
  - There is **no dedicated “Split Superset” action**.
  - Supersets are effectively “split” by dragging exercises **out of** the superset (and combining/merging by dragging exercises **into** a superset).

- **Superset card layout and labeling**:
  - A superset renders as a **shared card** containing multiple exercises.
  - Inside that card, exercises are labelled **A, B, C, …**.
  - Set rows follow the pattern `1A, 1B`, then `2A, 2B`, etc., ending with a customizable rest timer row and an **Add Set** control.

---

### 2. Exercise Removal & Reordering UX

- **3-dot menu removal**:
  - Every exercise row has a 3-dot menu with a **Remove Exercise** action.
  - This path should feel safe (confirmation where needed), not accidental.

- **Swipe-to-remove**:
  - User can swipe an exercise row **straight left** or **straight right** to remove it.
  - A **visible red delete container** slides in from the side being swiped from.
  - There is a **healthy minimum swipe distance** before removal is actually triggered to avoid accidental deletes.

- **Reordering**:
  - Reordering of exercises (and supersets) is handled via drag-and-drop.
  - Superset structure is preserved while reordering unless the user explicitly drags items into/out of a superset.

---

### 3. Swap Exercise — Recommended vs Other Alternatives

- Every exercise in the database carries:
  - **Primary muscles** (main targets).
  - **Secondary muscles** (supporting/assisting targets).
  - An **emphasized focus** (e.g., “upper chest emphasis” for incline press).

- When swapping an exercise:
  - **Recommended alternatives**:
    - Must target the **same primary muscle group(s)**.
    - Must share the **same emphasized focus** (e.g., other upper-chest–focused chest moves when swapping incline bench).
  - **Other alternatives**:
    - Target the **same primary muscle group(s)** but **do not** need to share the same emphasized focus.

- The app **does not need to explain why** a given exercise is recommended.
  - It is sufficient to visually separate “Recommended alternatives” and “Other alternatives” using the above logic.

---

### 4. Workout Schedule, Summary Screen, and Routing

- **Schedule day labels & routing**:
  - On the workout schedule:
    - Future days show **Preview**.
    - The current day shows **Start**.
    - Past days show **Summary**.
  - Tapping:
    - **Today / Start** opens the **active workout tracking screen** for that session.
    - **Past or future** opens the **Completed or past workout summary** screen variant.

- **Completed or past workout summary screen**:
  - This screen is shown when:
    - A **past workout** is selected from the schedule, or
    - A workout is **finished**, and the flow returns to summary.
  - For **completed workouts**:
    - Shows a clear **Completed** indication at the top-right.
    - Main CTA button is **View Workout**.
    - Tapping **View Workout** opens the **historical workout tracking screen** for that specific session (read-only/log replay).
    - The **Warm Up** button is removed.
  - For **future workouts**:
    - Main CTA button is **Preview Workout**.
    - Tapping **Preview Workout** opens the workout tracking screen for that future session with:
      - **Empty kg** and **reps** fields.
      - **Blank effort** selectors.

- **Workout schedule page identity**:
  - This is the **Workout Schedule page**, not the app “Home”.
  - The **bottom nav bar is the main menu**, and the **Workout** item routes here by default.
  - A hero card at the top is allowed, but it does **not** need a trainer image.
  - The hero’s **Get Started** button routes to the **same destination** as the current day’s **Start** button in the rolling calendar.

- **Workout schedule layout & controls**:
  - The top title row (e.g., “Beginner Phase 2”) is **removed**.
  - The hero card sits flush to the top margin (no title row above).
  - The AI chat assistant icon is **removed**.
  - The **Account** icon lives in the **bottom nav main menu**, as the **right-most tab**, not in the top-right of this page.
  - Each day card includes a **drag handle icon** (half-up, half-down arrow style) on the right:
    - User can **hold** this handle and drag a day’s activity (workout or Rest) from one day to another.
    - When a workout is moved away from a day, that vacant day becomes a **Rest** day automatically.
  - Long-pressing anywhere on a day’s card opens a floating submenu:
    - On a **Rest day**: show **Add Workout**.
    - On a **Workout day**: show **Remove Workout**.

---

### 5. Tabs, Coming Soon Pages, and IA

- **Bottom navigation**:
  - Tabs: **Nutrition, Dashboard, Workout, Progress, Account**.
  - **Lessons** is **removed** from the main bottom-nav.
  - **Account** tab is the **right-most item** and navigates to the account settings experience.

- **Nutrition — coming soon**:
  - Dedicated coming-soon view with:
    - A suitable **nutrition-themed icon**.
    - Centered flavor text:
      - “A Good rule of thumb is swap the portion size of your protein and carbs, then double your veggies and fruit.”
    - A tasteful **“Coming soon”** indication.

- **Lessons — coming soon**:
  - Dedicated coming-soon view (even though there is no bottom-tab for Lessons).
  - Has:
    - A **lessons/learning-themed icon**.
    - Custom flavor text (creative but on-brand).
    - A prominent **“Coming soon”** label.

---

### 6. Effort Selector, Set States, and Logging Table

- **Effort indicator & popup**:
  - Each set row in the workout tracking table includes an **effort indicator circle**.
  - Tapping/clicking that circle opens the **Effort Level Rating** popup screen.
  - While the popup is active:
    - The **background screen must be clearly separated** from the foreground popup (e.g., via dimming, blur, scale, or other modern modal treatment).
    - Avoid the “washed together” look in the sample screenshot; aim for high visual clarity.

- **Set completion rules**:
  - A set is considered **complete** only when:
    - **Reps** are entered.
    - **Effort** is selected.
    - For weighted exercises, **kg** is entered.
  - The **session progress bar** increments only for sets that meet these rules.
  - The **Finish** button’s state changes when **all sets in the workout** are fully complete (label, style, or both).

- **Incomplete set visual treatment** (Week 2-B Workout Tracking Screen reference):
  - A set in-progress has a **slightly different background tint** to show it is the active row.
  - Sets that the user has **not yet done**:
    - Show a **blank effort indicator** (no color yet).
    - Show **previous-session reps/kg as placeholders** in their input fields until the user logs the new values.
  - Sets that the user **has done**:
    - Show the reps/kg the user actually typed in as **solid, high-contrast values** (e.g., solid white text).
  - The **Previous** column:
    - Is **read-only**.
    - Shows what the user did the **last time** they performed this exercise, per set.
    - Includes a small colored effort circle next to the previous kg/rep values (the effort level selected last time).

- **Trend chevrons & PR indicators**:
  - For upcoming/unlogged sets, a **multi-chevron icon** may appear:
    - Upwards chevrons: last time the user did Set X of this exercise, they did **more reps** than the previous time.
    - No icon: reps were **equal** to the previous time.
    - Downwards chevrons: last time the user did Set X, they did **fewer reps** than the time before.
  - For each exercise:
    - A **Done** icon (preferred style: a light green checkmark in a darker green circle with a light green border, **no “DONE” text**) appears only when **all sets for all exercises in the superset** (or single exercise) are fully logged (kg, reps, effort).
    - A **PR** badge appears when the **average work done** (considering weight, reps, sets) this session exceeds the benchmark from the last time that exercise was in a workout.
  - On a per-set basis:
    - If a set’s just-logged performance exceeds **all prior comparable sets** for that exercise (in this session or historically), the set index label is replaced with a **trophy icon**.

---

### 7. PR Model and Workload Calculation

- PR logic should move beyond “heaviest weight only” and instead:
  - Evaluate **total work** combining:
    - Weight used.
    - Total reps.
    - Number of sets and per-set distribution.
  - Decide if the session’s performance for that exercise is:
    - **Higher**, **lower**, or **equal** to previous sessions.
- This is intentionally left flexible so it can be grounded in best-practice strength training metrics (e.g., volume load, effective reps, or another evidence-based model), but:
  - It must be consistent across:
    - The **PR badge**.
    - The **per-set trophy indicators**.
    - Any progress charts that surface PRs.

---

### 8. Weekly Progress, Volume, and Muscle Model

- **Weekly progress screen goals**:
  - Show how many workouts were **completed** that week.
  - Show **body coverage** — percentage of the body’s total muscle mass that was worked.
  - Show **Volume** as a **percentage**, where **100% = all muscles have hit their weekly set targets**.

- **Default volume targets**:
  - Weekly volume is expressed in **sets per muscle per week**.
  - Default target: **6 sets per major muscle per week**.

- **Primary vs secondary contribution**:
  - For a given exercise:
    - Each set where a muscle is a **primary target** contributes **1.0 set** to that muscle’s weekly count.
    - Each set where a muscle is a **secondary target** contributes **0.5 sets** (or **0** where evidence says the contribution is negligible).
  - These contributions are at the **set level**, not per rep.

- **Muscle model & colors**:
  - Use a **faceless, hairless body model** with clearly defined muscle regions.
  - Each muscle group is **interactable** (tap/click).
  - Each muscle group’s color reflects the **current weekly set count**:
    - **0–2 sets**: red.
    - **2–4 sets**: dark orange.
    - **4–5 sets**: yellow.
    - **6 sets**: green.
    - **>6 sets**: electric green.

- **Per-muscle detail view**:
  - Tapping a muscle opens a dedicated **muscle detail screen/popup** showing:
    - Progress in **X/Y sets** (X = current sets, Y = target sets for that muscle this week).
    - How many **sets remain** to hit the target.
    - A breakdown of which **exercises and sessions** contributed to that muscle’s volume.
    - A control to **edit the weekly target** for that specific muscle.
  - When per-muscle targets are changed:
    - The overall **Volume %** recalculates using the **new targets** (not just the default 6).

- **Target muscle summary on summary screen**:
  - The completed/past summary screen shows which muscles were worked in a given workout and their **relative percentages**.
  - These percentages are derived from:
    - The exercises actually completed in that session.
    - Their muscle mappings (primary/secondary/emphasized).

---

### 9. Dashboard, Progress Page, and Account Experience

- **Dashboard (landing page)**:
  - The Dashboard is the **app landing page**.
  - It should be designed based on research of top workout apps, but with a **distinctive, opinionated visual identity**.
  - It should surface:
    - Key current goals or phases.
    - Upcoming workouts.
    - Recent PRs or milestones.
    - Quick entry points into Workout, Progress, and Account.

- **Progress page**:
  - Serves as the main **“at a glance” progress hub**.
  - Includes **animated, polished charts** that feel premium and alive, not static.
  - Time ranges are **editable** (e.g., week, month, custom range).
  - Should incorporate:
    - Strength PR trends.
    - Volume/load trends.
    - Consistency metrics (e.g., streaks, completed workouts).

- **Account settings & banner**:
  - Accessed via the **Account** bottom-nav tab (right-most).
  - Includes:
    - Profile picture upload, change, and removal.
    - A **banner image** across the top third of the account screen (similar to a YouTube channel banner).
    - The banner has a default image but can be replaced by the user.
  - This page is expected to be a full-featured account settings hub (“all the bells and whistles” typical of modern app account pages).

---

### 10. Design Philosophy Notes

- The overall design direction for these features should:
  - Be **bold, opinionated, and high-end**, not “safe middle-of-the-curve” UI.
  - Be willing to be **controversial and polarizing** if it creates a memorable, premium-feeling experience.
  - Draw inspiration from standout designs across **any industry**, not just fitness apps.
  - Treat the Weekly Progress and muscle-volume system as a **showpiece** that blends data, art, and usability.

