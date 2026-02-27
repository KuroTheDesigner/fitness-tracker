# Project Agent Instructions

## Current Task (Mandatory)
- **Current Task:**
- Track `Current Task` in this `AGENTS.md` file only (not in assistant/user responses).
- Before starting any task, set a `Current Task` description in this file (a short, explicit statement of what you are about to do).
- While the task is in progress, keep `Current Task` updated in this file if the scope changes.
- Once the task is fully complete, clear the `Current Task` field in this file so there is no active task.

## Workflow Priority
1. Set and maintain `Current Task`.
2. Implement requested work.
3. Verify quality.
4. Complete delivery + testing workflow.

## Quality Verification (Mandatory)
- Always check your work when you complete a task.
- If the task involves front-end work, verify it in a browser and use screenshots and screen recordings (when possible) to confirm visuals are polished and correct.

## Delivery + Testing Workflow (Mandatory)
- When a task is complete, update `PRD.md` and `BRD.md`, commit, and push so the work can be tested live.
- Always plan both unit tests and integration tests to reduce regressions.
- If there is a testing or software QA skill available, you MUST use it.
- If tests fail, continue iterating between implementation and testing until the task is verified as compliant.
- After live validation passes, update `PRD.md` and `BRD.md` again to mark relevant tasks as `Complete (tested)`, then commit and push the final tested version.
