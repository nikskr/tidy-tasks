---
name: new-feature
description: Start a new feature the SDD way - creates specs/NNN-<slug>/ from templates and drafts spec.md with the spec-author agent. Use when someone asks for a new feature or capability.
---

# New feature (SDD step 1)

1. Find the next number: list `specs/` and take the highest `NNN-` prefix + 1 (zero-padded to 3).
2. Create `specs/NNN-<kebab-slug>/` and copy `specs/_templates/spec.md`, `plan.md`, `tasks.md` into it.
3. Delegate to the `spec-author` subagent with the user's request and the new folder path.
4. Show the user the drafted acceptance criteria and every `[NEEDS CLARIFICATION]` question.
5. Stop. Do not write plan.md or code until the human sets `Status: Approved` in spec.md.
   Next step after approval: delegate to `planner`.
