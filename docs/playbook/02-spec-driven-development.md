# 2. Spec-Driven Development (SDD)

In SDD the **specification is the source of truth** and code is a generated, verified
artifact of it. With AI agents this is essential: an agent is only as good as the
written intent it receives, and a spec in the repo is context that every agent session
can read.

## 2.1 Artifacts and where they live

```
specs/
  constitution.md              # project-wide, rarely changes: principles, NFRs, tech stack, rules
  001-task-list/               # one folder per feature, numbered
    spec.md                    # WHAT and WHY — user stories, acceptance criteria. No tech.
    plan.md                    # HOW — architecture, data model, API, risks. Written after spec approval.
    data-model.md              # entities, SQL schema, migrations (if any)
    contracts/                 # OpenAPI / event schemas (if backend involved)
    tasks.md                   # ordered checklist of small tasks, each traceable to acceptance criteria
  002-cloud-sync/
    ...
```

Templates are in [`specs/_templates/`](../../specs/_templates/). The `/new-feature`
skill scaffolds a folder from them.

## 2.2 The flow — with gates

| Step | Who writes | Who approves | Gate (must be true to continue) |
|------|------------|--------------|----------------------------------|
| 0. Constitution | Tech lead (once) | Team | Stack, NFRs, coding rules agreed |
| 1. **Specify** → `spec.md` | Spec owner, `spec-author` agent drafts | Spec owner | Every user story has testable acceptance criteria (Given/When/Then); out-of-scope listed; **no `[NEEDS CLARIFICATION]` markers left** |
| 2. **Clarify** | Agent asks, human answers | — | Ambiguities resolved in the spec text (not in chat) |
| 3. **Plan** → `plan.md`, `data-model.md`, `contracts/` | `planner` agent drafts | Tech lead | Plan satisfies constitution check; backend changes listed in the *Backend Change Log* section; risks + rollback noted |
| 4. **Tasks** → `tasks.md` | Agent | Tech lead | Each task ≤ ~300 changed lines, has "Done when", references AC IDs; `[P]` marks tasks safe to run in parallel |
| 5. **Implement** | `implementer` agent, one task per branch/PR | — | Lint, typecheck, tests green locally (hooks enforce) |
| 6. **Verify** | `code-reviewer` agent + human | Tech lead | Review checklist passes; AC demonstrably met (test or screen recording) |
| 7. **Close** | Agent | — | `tasks.md` boxes ticked, spec status → `Implemented`, release notes line added |

**Changing your mind is normal — but change the spec first.** If implementation reveals
the spec is wrong, stop, update `spec.md`/`plan.md` in the same PR (or a preceding one),
and get it re-approved. Code that disagrees with the spec is a bug, regardless of which one is "right".

## 2.3 What makes a good spec for agents

- **Acceptance criteria are IDs + Given/When/Then.** `AC-3: Given a task is completed, when the user taps "Clear completed", then all completed tasks are removed and the active ones remain.` Agents map tests to IDs; reviewers check coverage by ID.
- **Explicit out-of-scope.** Agents love to "helpfully" add features. List what *not* to build.
- **Edge cases enumerated:** empty states, max lengths, offline, rotation, font scaling, dark mode, interrupted writes.
- **Measurable NFRs** pulled from the constitution, not "fast" or "secure".
- **No implementation in the spec.** Libraries, tables, endpoints belong in `plan.md`. This keeps the spec reviewable by non-engineers and lets the plan change without re-approving product intent.

## 2.4 Traceability

```
AC-3 (spec.md) → T-07 (tasks.md) → src/features/tasks/repository.test.ts "clearCompleted removes only completed" → PR #14
```

The PR template asks for the AC IDs covered; the `code-reviewer` agent fails the
review if a claimed AC has no test or manual verification evidence.

## 2.5 Spec status lifecycle

`Draft` → `Approved` → `In progress` → `Implemented` → `Released (vX.Y.Z)` (or `Superseded by NNN`)

Status is a line at the top of `spec.md`, so agents and humans can see at a glance
what is buildable.

## 2.6 Worked example in this repo

- [`specs/constitution.md`](../../specs/constitution.md)
- [`specs/001-task-list/`](../../specs/001-task-list/) — fully implemented v1.0 feature
- [`specs/002-cloud-sync/`](../../specs/002-cloud-sync/) — `Draft` spec + plan that introduces a backend, used to demonstrate chapter 4
