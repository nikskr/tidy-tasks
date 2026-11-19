# 3. Setting Tasks for AI Agents, Checking and Reviewing Code

## 3.1 Principles

1. **One task → one agent session → one branch → one PR.** Small diffs are reviewable; big ones get rubber-stamped.
2. **The brief points at the spec; it does not restate it.** Agents read `spec.md`, `plan.md`, `tasks.md` themselves. Duplicated intent drifts.
3. **Every brief has a machine-checkable "Done when".** If you cannot write it, the task is not ready.
4. **Agents verify their own work before handing back** (lint, types, tests, run the app). Hooks enforce this, the brief repeats it.
5. **Trust, but review everything.** AI-written code fails in characteristic ways (see 3.4). Human review is mandatory for merge.

## 3.2 Task brief template

Use this verbatim when starting an agent (Claude Code session, `implementer` subagent,
or a GitHub issue picked up by the Claude GitHub Action):

```markdown
## Task T-07 — Clear completed tasks
Feature: specs/001-task-list (read spec.md, plan.md, tasks.md first)
Acceptance criteria covered: AC-6

### Scope
- Add `clearCompleted()` to the task repository and a "Clear completed" button in the list footer.
- Out of scope: undo, confirmation dialog (spec says no confirm in v1).

### Constraints
- Follow CLAUDE.md. No new dependencies without asking.
- Repository functions stay pure SQL + mapping; UI never calls SQL directly.

### Done when
- [ ] Unit test "clearCompleted removes only completed tasks" passes
- [ ] Button hidden when no completed tasks exist (test or screenshot)
- [ ] `npm run verify` is green (lint + typecheck + tests)
- [ ] tasks.md T-07 ticked; PR description lists AC-6 and how it was verified
```

## 3.3 Choosing how to run the task

| Situation | Mechanism |
|-----------|-----------|
| Exploratory / design work | Interactive Claude Code session in plan mode; you approve the plan |
| Well-specified task from `tasks.md` | `implementer` subagent, or `claude -p` headless in a worktree |
| Several independent `[P]` tasks | Parallel sessions in separate git worktrees (`claude --worktree` / `EnterWorktree`) — never two agents in one checkout |
| Issue-driven work by the team | `@claude` mention on a GitHub issue/PR → Claude GitHub Action opens a PR |
| Review | `code-reviewer` subagent locally (`/review-pr`), plus automated PR review in CI |

## 3.4 Review — what to look for in AI-written React Native code

The `code-reviewer` agent runs this checklist; the human reviewer skims its report and
then reads the diff with these in mind:

**Correctness against spec**
- [ ] Every AC claimed in the PR has a test or recorded evidence
- [ ] Nothing out-of-scope was added ("while I was here…" changes get split out)
- [ ] Edge cases from the spec handled: empty, max length, offline, rapid repeated taps

**Typical AI failure modes**
- [ ] Hallucinated APIs — imports or functions that don't exist in *this* SDK version (Expo changes every SDK). CI typecheck catches most; check config keys in `app.json` manually
- [ ] Tests that assert the mock rather than the behavior, or tests weakened/deleted to pass
- [ ] Swallowed errors (`catch {}`), `any`, `// @ts-ignore`, disabled lint rules
- [ ] Duplicate utilities instead of reusing existing ones
- [ ] New dependency added silently (check `package.json` diff); native deps require a new binary
- [ ] Stale closures / missing deps in `useEffect`/`useCallback`; state updates after unmount

**Mobile-specific**
- [ ] No inline arrow functions/objects re-created in hot list rows without need; `FlatList` has `keyExtractor`, stable keys
- [ ] SQL uses bound parameters (`runAsync(sql, params)`), never string interpolation of user input
- [ ] Schema change ⇒ new migration step, never an edit of an old one
- [ ] Accessibility props present; text scales; safe-area respected
- [ ] No secrets, no PII in logs, no `console.log` left in production paths
- [ ] Platform differences considered (iOS/Android keyboard, back button)

**Backend-touching PRs** (see chapter 4)
- [ ] Contract change recorded in `plan.md` Backend Change Log and `contracts/openapi.yaml`
- [ ] Backward compatible with the currently shipped app versions

## 3.5 Gates on every PR (automated)

| Gate | Tool | Blocking |
|------|------|----------|
| Lint | `npx expo lint` | yes |
| Types | `tsc --noEmit` | yes |
| Unit tests | Jest (`jest-expo`) | yes |
| Expo config/deps health | `npx expo-doctor` | yes |
| Secrets scan | grep gate / gitleaks | yes |
| AI review | `code-reviewer` via Claude GitHub Action | advisory (comments) |
| Human review | CODEOWNERS | yes |
| Preview build (optional, on label) | EAS Build `preview` | no |

## 3.6 What is never delegated to an agent without a human in the loop

- Approving specs and merging to `main`
- Running migrations against staging/production databases
- Submitting to stores, changing rollout percentage, publishing OTA updates to `production`
- Rotating or reading production secrets / signing credentials
- Replying publicly to store reviews

The project's `.claude/settings.json` enforces part of this with `deny` / `ask` permission rules.
