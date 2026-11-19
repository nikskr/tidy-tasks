---
name: implement-task
description: Take one task T-nn from a feature's tasks.md to a reviewed PR - branch, implement with tests, verify, self-review, open PR. Use when asked to implement a task or "do T-xx".
---

# Implement a task

Arguments: feature folder and task id, e.g. `001-task-list T-07`.

1. Check `spec.md` status is `Approved` or `In progress` and the task exists and is unticked. Otherwise stop.
2. Create a branch `feat/<NNN>-<task-id>-<slug>` (use a git worktree if other agents are active).
3. Delegate implementation to the `implementer` subagent with the task brief (docs/playbook/03 §3.2 format).
   If the task has BE-IDs, delegate to `backend-integrator` instead.
4. Run `npm run verify`. If red, send the failures back to the implementer.
5. Delegate to `code-reviewer`. If `REQUEST_CHANGES`, loop back to step 3 with the blocking items (max 3 loops, then ask the human).
6. Ask the human before pushing, then open a PR with `.github/pull_request_template.md` filled in: AC IDs, verification evidence, BE-IDs, reviewer verdict.
