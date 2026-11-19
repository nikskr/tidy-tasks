# 5. Configuring Agents: Instructions, Skills, Context, MCP/API Tools, Automation

Everything below is checked into the repo so every developer and every CI job gets the
same agent behavior. Personal overrides go in `.claude/settings.local.json` / `CLAUDE.local.md`
(git-ignored).

## 5.1 Layout

```
CLAUDE.md                      # project memory: stack, commands, rules — loaded into every session
AGENTS.md                      # Expo-provided agent guidance (kept; CLAUDE.md imports it)
.mcp.json                      # shared MCP servers (GitHub, Sentry, Expo, read-only Postgres)
.claude/
  settings.json                # permissions (allow/ask/deny), hooks, enabled plugins
  agents/                      # subagents with narrow roles and tool sets
    spec-author.md
    planner.md
    implementer.md
    code-reviewer.md
    backend-integrator.md
    release-engineer.md
    prod-triage.md
  skills/                      # reusable procedures, invoked as /name or auto-selected
    new-feature/SKILL.md       # scaffold specs/NNN from templates
    implement-task/SKILL.md    # take T-xx from tasks.md to a PR
    review-pr/SKILL.md         # run the review checklist on a diff
    db-migration/SKILL.md      # add an on-device or server migration safely
    release/SKILL.md           # cut a release: version, changelog, build, submit
    triage-crash/SKILL.md      # Sentry issue → root cause → fix task
.github/
  workflows/ci.yml             # lint/type/test/doctor on every PR
  workflows/claude.yml         # @claude mentions + automatic PR review
  workflows/release.yml        # tag → EAS build + submit
  pull_request_template.md
```

## 5.2 Context: what goes where

| Kind of knowledge | Location | Why |
|-------------------|----------|-----|
| Always-true project rules, commands | `CLAUDE.md` (keep < ~150 lines) | Loaded every session; long files dilute attention |
| Feature intent | `specs/NNN/*.md` | Loaded on demand by path; versioned with code |
| Procedures (how to release, migrate…) | Skills | Loaded only when relevant → small base context |
| Role behavior + tool limits | Subagents | Separate context window; reviewer can't edit, triage can't push |
| Live external state (issues, crashes, DB, builds) | MCP servers | Fresh data instead of stale pasted text |
| Library docs that change often (Expo) | Fetch versioned docs; Expo plugin skills | Training data is outdated for new SDKs |

## 5.3 Subagents — design rules

- One role, one paragraph of mission, explicit **inputs** (which files to read) and **output format**.
- **Least privilege tools.** `code-reviewer` and `prod-triage` get read-only tools; only `implementer` and `backend-integrator` can edit; nobody gets store/production-publishing commands.
- Output is structured (checklist / table) so the parent session or CI can act on it.

## 5.4 Hooks (deterministic automation inside the agent loop)

Configured in `.claude/settings.json`:

| Event | Hook | Effect |
|-------|------|--------|
| `PostToolUse` on `Edit|Write` | `node scripts/hooks/post-edit.mjs` | Runs ESLint `--fix` on the edited TS/TSX file and reports remaining errors back to the agent |
| `PreToolUse` on `Bash` | `node scripts/hooks/guard-bash.mjs` | Blocks `eas submit`, `eas update --channel production`, `git push --force`, migrations against non-local DBs |
| `Stop` | `node scripts/hooks/verify-on-stop.mjs` | If source files changed, runs typecheck + tests; on failure, tells the agent to continue fixing instead of stopping |

Hooks are the difference between "the instructions say run the tests" and "the tests always run".

## 5.5 Tools via MCP or API

`.mcp.json` (project scope; secrets come from environment variables, never committed):

| Server | Transport | Used by | Access level |
|--------|-----------|---------|--------------|
| `github` — `https://api.githubcopilot.com/mcp/` | HTTP, PAT in `GITHUB_MCP_PAT` | all | Issues, PRs, reviews, Actions logs |
| `sentry` — `https://mcp.sentry.dev/mcp` | HTTP, OAuth (`/mcp` to log in) | `prod-triage`, `release-engineer` | Read issues, events, releases |
| `expo` — `https://mcp.expo.dev/mcp` | HTTP, OAuth (requires EAS paid plan) | `release-engineer` | Build/submission status, docs lookups |
| `postgres-staging-ro` | stdio, read-only role DSN in `STAGING_RO_DATABASE_URL` | `backend-integrator`, `prod-triage` | `SELECT` only on staging replica (enabled once 002 exists) |

When an MCP server doesn't exist for a service, prefer its **CLI** (`gh`, `eas`, `sentry-cli`)
through Bash with permission rules, or a small script in `scripts/` that calls the REST API
— and document it in a skill.

Store APIs (App Store Connect API, Google Play Developer API) are used **only through
`eas submit`** from CI with credentials stored in EAS, never by an agent session directly.

## 5.6 Automation outside the session (CI/CD)

| Trigger | Workflow | What happens |
|---------|----------|--------------|
| PR opened/updated | `ci.yml` | lint, typecheck, test, expo-doctor, secrets grep |
| PR opened | `claude.yml` | Claude reviews against the review-pr checklist, posts comments |
| `@claude` comment on issue/PR | `claude.yml` | Agent implements / answers, pushes to a branch, opens PR |
| Merge to `main` | `release.yml` (preview job) | EAS Build `preview` → internal testers |
| Tag `v*` pushed | `release.yml` (production job) | EAS Build `production` for both platforms + `eas submit` to TestFlight & Play internal track |
| Nightly (optional, `/schedule`) | Scheduled cloud agent | Summarise new Sentry issues + store reviews into a GitHub issue |

Required GitHub secrets: `EXPO_TOKEN`, `ANTHROPIC_API_KEY` (or Claude GitHub App auth).
Required EAS env vars: `SENTRY_AUTH_TOKEN` (secret), `EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`.

## 5.7 Onboarding a developer (or a fresh machine)

```bash
npm ci
claude                         # trust the project; approve .mcp.json servers
/mcp                           # authenticate sentry + expo (OAuth)
export GITHUB_MCP_PAT=...      # fine-grained PAT, repo-scoped
npm run verify                 # lint + types + tests must be green before any task
```
