---
name: review-pr
description: Review a PR or the current branch diff against the spec and the project checklist, then summarise blocking issues. Use when asked to review code, a PR, or before merging.
---

# Review a PR

Arguments: optional PR number. Without one, review `git diff main...HEAD`.

1. Get the diff (`gh pr diff <n>` or `git diff main...HEAD`) and the PR description.
2. Identify the feature folder and AC IDs from the description or branch name; read spec/plan/tasks.
3. Run `npm run verify` and note the result.
4. Delegate to the `code-reviewer` subagent with the diff, the spec paths and the verify result.
5. Present the verdict, blocking items (file:line + fix) and AC coverage table.
6. If asked to post, use the GitHub MCP to add review comments. Never approve or merge yourself.
